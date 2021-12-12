---
layout: page
title: [3]
permalink: /part3/
---
## May I introduce you the parser
In the [previous part](/logo/part2) we were able to convert a LOGO script into an array of tokens. These tokens have the token text and the token type (number, delimiter or primitive) and we managed to show in the console the string representation of the tokens in an easy way that will help us later when debugging.

So let's continue with the parser. The [parser](https://en.wikipedia.org/wiki/Parsing#Parser) runs the list of tokens and executes them correctly, so for our example:

`repeat` `4` `[` `fd` `60` `rt` `90` `]`

We would expect the parser to do something like this reading the input:

![square with repeat primitive](/img/part3_repeat4.gif)


In short, we need to understand that after reading `repeat 4`, whatever is inside the brackets must be repeated 4 times. Seems easy, so let's start!

The tokenizer in the [previous part](/logo/part2) could identify the tokens as `primitive`, but we don't record in the token what kind of primitive it is.

Let's add another property to `Token` to give me the primitive:

```javascript
class Token {
  constructor (text = "", tokenType = tokenTypes.NONE, primitive = "") {
    this.text = text;
    this.tokenType = tokenType;
    this.primitive = primitive;
  }
  get[Symbol.toStringTag]() {
    let tokenTypeKey = Object.keys(tokenTypes).find(key => tokenTypes[key] === this.tokenType);
    return `Token "${this.text}" - ${tokenTypeKey} - {${this.primitive}}`;
  }
}
```

But hey, we still don't have anything. That's because we haven't modified the tokenizer.

Since we are giving default values the only instance of `Token` in the tokenizer that we need to worry about is the one when it is a primitive. (the check with `isPrimitive()`). We just need to convert the `tokenText` to lowercase since all the primitives are recorded in lowercase and we are all done:

```javascript
tokens.push(new Token(tokenText, tokenTypes.PRIMITIVE, tokenText.toLowerCase()));
```

We will get in the console:

```javascript
[object Token "repeat" - PRIMITIVE - {repeat}]
[object Token "4" - NUMBER - {}]
[object Token "[" - DELIMITER - {}]
[object Token "fd" - PRIMITIVE - {fd}]
[object Token "60" - NUMBER - {}]
[object Token "rt" - PRIMITIVE - {rt}]
[object Token "90" - NUMBER - {}]
[object Token "]" - DELIMITER - {}]
```

which is quite easy to read. I've added the word **Token** just to be absolutely clear of what is this, and some curly braces around the primitive to make it easier on the eye, that's all.

So yes, finally, the parser. Because I can see that the parser can get complicated, instead of a function I will start with a class. I don't want to parse directly in the constructor, I want to have a method `parse()` that receives the tokens:

```javascript
class Parser {
  parse(tokens) {
    console.log("parser starting");
  }
}
```

and at the end of the file:

```javascript
let tokens = tokenizer('myTextarea');
tokens.forEach(token => console.log(token.toString()));
let parser = new Parser();
parser.parse(tokens);
```

And we will get the message "**parser starting**" in the console as expected. As we can see, the parser doesn't know anything about the original script, it only knows about the tokens. This is very important since having a [separation of concerns](https://en.wikipedia.org/wiki/Separation_of_concerns) helps to make the code more reusable (I mean, not that we are going to reuse the logo interpreter in many places, it is only that if the tokenizer only knows about tokens and the parser only knows about parsing, if we have an issue it is easier to debug. We will break this a bit when we add a turtle object to the parser but we will find an elegant way to break them apart).

Our first impulse is to write a loop through the tokens but since we are going to point to the same tokens over and over again in the `repeat` primitive, it makes more sense to create a method to point back to the first token after `[` when we find the `]` to complete the 4 repeats. Since every time we move we want to get the token there, we will call it `getNextToken()`.

The only problem with `getNextToken()` is that I don't know when it reaches the end. But that would be really easy checking that the index in the token array is greater than the last valid index. We will need to keep an `index` property available within the parser so `parse()` and `getNextToken()` can access it. So far our parser looks like:

```javascript
class Parser {
  getNextToken() {
    this.currentTokenIndex++;
    if (this.currentTokenIndex <= this.lastTokenIndex) {
      console.log(`Current token: ${this.currentTokenIndex} - ${this.tokens[this.currentTokenIndex]}`);
    }
  }
  parse(tokens) {
    this.tokens = tokens;
    this.currentTokenIndex = -1;
    this.lastTokenIndex = tokens.length - 1;
    do {
      this.getNextToken();
    } while (this.currentTokenIndex < this.lastTokenIndex)
  }
}
```

A few things to note here.
* We have made `tokens` available as well in the parser, so `getNextToken()` can access them.
* The starting index is -1. Why? because as soon as I start parsing I ask for the next token, so if I start in -1, my first token will be the next one, 0 which is the first token in a zero-based array.
* We are using a `do-while` loop instead of a `while` loop. Why? because with a `do-while` you always try to run the code **at least** once and we don't need to do a `getNextToken()` followed by a `while` loop. In short, it looks neater.
* I refrain from returning the current token when calling `getNextToken()`. This is done on purpose. We shold have a `currentToken` variable available in the parser otherwise we may not use the correct token in the stream. By having a variable with scope only in the Parser we make sure that we always access the correct one, and this will save you time (time that I wasted when I first created the code. You are welcome).

So our console will show as expected, only 8 tokens.

```javascript
Current token: 0 - [object Token "repeat" - PRIMITIVE - {repeat}]
Current token: 1 - [object Token "4" - NUMBER - {}]
Current token: 2 - [object Token "[" - DELIMITER - {}]
Current token: 3 - [object Token "fd" - PRIMITIVE - {fd}]
Current token: 4 - [object Token "60" - NUMBER - {}]
Current token: 5 - [object Token "rt" - PRIMITIVE - {rt}]
Current token: 6 - [object Token "90" - NUMBER - {}]
Current token: 7 - [object Token "]" - DELIMITER - {}]
```

Let's tackle now how we are going to do a `repeat`. If we find it, we will call a method to execute it. We get the next token, which should be a number (we are not doing error handling right now) and we make sure that the next one is a `[`. Now we will have to make sure that the current Token index gets back to the first primitive inside the brackets after we reach the `]`, and we need to count the number of repetitions and stop when done.

For our test before we only saved the current token index; it will be easier for us if we also save the current token itself instead of doing all the time `tokens[currentTokenIndex]`. Our code for the parser without the inner parts of what to do with `repeat` is below:

```javascript
class Parser {
  execute_repeat() {
    console.log("Starting: execute_repeat");
  }
  getNextToken() {
    this.currentTokenIndex++;
    if (this.currentTokenIndex <= this.lastTokenIndex) {
      this.currentToken = this.tokens[this.currentTokenIndex];
      console.log(`Current token: ${this.currentTokenIndex} - ${this.currentToken}`);
    }
  }
  parse(tokens) {
    this.tokens = tokens;
    this.currentToken = {};
    this.currentTokenIndex = -1;
    this.lastTokenIndex = tokens.length - 1;
    do {
      this.getNextToken();
      if (this.currentToken.tokenType === tokenTypes.PRIMITIVE) {
        if (this.currentToken.primitive === primitives.REPEAT) {
          this.execute_repeat();
        }
      }      
    } while (this.currentTokenIndex < this.lastTokenIndex)
  }
}
```

In debugging (or starting a project) it helps me to put a log line at the beginning of each method, kind of like a cheap stack trace. This helps me a lot to follow the flow of the program when something doesn't go as expected.

And now finally the `repeat` code, which is straight forward.

```javascript
execute_repeat() {
    console.log("Starting: execute_repeat");
    this.getNextToken();
    if (this.currentToken.tokenType === tokenTypes.NUMBER) {
      let n = parseInt(this.currentToken.text);
      this.getNextToken();
      if (this.currentToken.tokenType === tokenTypes.DELIMITER &&
        this.currentToken.text === delimiters.OPENING_BRACKET) {
        this.getNextToken();
        this.loop = {
          startTokenIndex: this.currentTokenIndex,
          remainingLoops: n
        };
        console.log(this.loop);
      }
    }
  }
  ```

We don't have error handling as I said before but that can be done in the `else` part of the control flow `if`. We create two more properties, `startTokenIndex` and `remainingLoops`. Since both of them are intimately related, to avoid clutter I put them together in a `loop` property (a json object), that I will initialize in the `parse()` method.

We have defined the beginning of the loop, but now we need to focus on the ending of the loop when reaching `]`. However we have a bigger problem here, have you spotted it?

By doing a final `getNextToken()` to get the first index inside the loop we have read the token `fd` from `fd 60` inside the loop, so after executing `execute_repeat()` the `do-while` loop will start again and request another `getNextToken()` so the first one they will act it won't be the `fd` but it will find a `60`.

You don't believe me? Remember that in our `do-while` loop the first thing we do is `getNextToken)_`. If you look at the logs:

```javascript
Current token: 0 - [object Token "repeat" - PRIMITIVE - {repeat}]
Starting: execute_repeat
Current token: 1 - [object Token "4" - NUMBER - {}]
Current token: 2 - [object Token "[" - DELIMITER - {}]
Current token: 3 - [object Token "fd" - PRIMITIVE - {fd}]
{startTokenIndex: 3, remainingLoops: 4}
Current token: 4 - [object Token "60" - NUMBER - {}]
Current token: 5 - [object Token "rt" - PRIMITIVE - {rt}]
Current token: 6 - [object Token "90" - NUMBER - {}]
Current token: 7 - [object Token "]" - DELIMITER - {}]
```

As you see, after we create the loop property the next token is token 4, `60`. We have either two options: create a method to put the last token back to the token stream (i.e. moving the `currentTokenIndex` back) or since in the loop we just need to know the index, we can do `currentTokenIndex + 1`.

At this point, we will choose the latter so:

```javascript
if (this.currentToken.tokenType === tokenTypes.DELIMITER &&
  this.currentToken.text === delimiters.OPENING_BRACKET) {
  this.loop = {
    startTokenIndex: this.currentTokenIndex + 1,
    remainingLoops: n
  };
  console.log(this.loop);
}
```

## Moving forward. No, really, moving FORWARD.
Now in the `do-while` loop the next token will be the next primitive, `fd` (forward). And after that is a numeric argument. So we do in `parse()` a `switch` statement that looks better than a list of `if`:

```javascript
if (this.currentToken.tokenType === tokenTypes.PRIMITIVE) {
  switch (this.currentToken.primitive) {
    case primitives.FORWARD:
      this.execute_forward();
      break;
    case primitives.REPEAT:
      this.execute_repeat();
      break;
  }
}
```

And

```javascript
execute_forward() {
  console.log("Starting: execute_forward");
}
```

Just as a stub for what's to come. And... I almost forgot the code for the end of the loop, but since we have the same structure for the `rt` primitive as for `fd` I am going to do the stubs for them as well:

```javascript
case primitives.RIGHT:
  this.execute_right();
  break;
```

and

```javascript
execute_right() {
  console.log("Starting: execute_right");
}
```

## Finally, the end of the loop
After we've done `rt 90`, it is time for the end of the loop where we read the `loop` property and subtract one to the `remainingLoops` variable and we move the index to the first token inside the loop.

`]` is not a primitive, so in the parsing loop we can't just trap it in our `switch` for primitives, so we will do it in the `else` part of the `if`.

```javascript
if (this.currentToken.tokenType === tokenTypes.PRIMITIVE) {
  switch (this.currentToken.primitive) {
    case primitives.FORWARD:
      this.execute_forward();
      break;
    case primitives.RIGHT:
      this.execute_right();
      break;
    case primitives.REPEAT:
      this.execute_repeat();
      break;
  }
} else if (this.currentToken.tokenType === tokenTypes.DELIMITER) {
  if (this.currentToken.text === delimiters.CLOSING_BRACKET) {
    this.loop.remainingLoops--;
    if (this.loop.remainingLoops > 0) {
      this.currentTokenIndex = this.loop.startTokenIndex;
    }
  }
}
```

we run the code, and we get this (which is wrong). Can you spot what's missing?

```javascript
Current token: 0 - [object Token "repeat" - PRIMITIVE - {repeat}]
Starting: execute_repeat
Current token: 1 - [object Token "4" - NUMBER - {}]
Current token: 2 - [object Token "[" - DELIMITER - {}]
{startTokenIndex: 3, remainingLoops: 4}
Current token: 3 - [object Token "fd" - PRIMITIVE - {fd}]
Starting: execute_forward
Current token: 4 - [object Token "60" - NUMBER - {}]
Current token: 5 - [object Token "rt" - PRIMITIVE - {rt}]
Starting: execute_right
Current token: 6 - [object Token "90" - NUMBER - {}]
Current token: 7 - [object Token "]" - DELIMITER - {}]
Current token: 4 - [object Token "60" - NUMBER - {}]
Current token: 5 - [object Token "rt" - PRIMITIVE - {rt}]
Starting: execute_right
Current token: 6 - [object Token "90" - NUMBER - {}]
Current token: 7 - [object Token "]" - DELIMITER - {}]
Current token: 4 - [object Token "60" - NUMBER - {}]
Current token: 5 - [object Token "rt" - PRIMITIVE - {rt}]
Starting: execute_right
Current token: 6 - [object Token "90" - NUMBER - {}]
Current token: 7 - [object Token "]" - DELIMITER - {}]
Current token: 4 - [object Token "60" - NUMBER - {}]
Current token: 5 - [object Token "rt" - PRIMITIVE - {rt}]
Starting: execute_right
Current token: 6 - [object Token "90" - NUMBER - {}]
Current token: 7 - [object Token "]" - DELIMITER - {}]
```

in every loop we are missing the `fd` token. This is because we set wrongly the first token for the loop, we should have set it to `[` so when the next pass in the parsing loop is executed and we get the next token we will get `fd`. Simple fix with `startTokenIndex: this.currentTokenIndex`. The (revised) log is:

```javascript
Current token: 0 - [object Token "repeat" - PRIMITIVE - {repeat}]
Starting: execute_repeat
Current token: 1 - [object Token "4" - NUMBER - {}]
Current token: 2 - [object Token "[" - DELIMITER - {}]
{startTokenIndex: 2, remainingLoops: 4}
Current token: 3 - [object Token "fd" - PRIMITIVE - {fd}]
Starting: execute_forward
Current token: 4 - [object Token "60" - NUMBER - {}]
Current token: 5 - [object Token "rt" - PRIMITIVE - {rt}]
Starting: execute_right
Current token: 6 - [object Token "90" - NUMBER - {}]
Current token: 7 - [object Token "]" - DELIMITER - {}]
Current token: 3 - [object Token "fd" - PRIMITIVE - {fd}]
Starting: execute_forward
Current token: 4 - [object Token "60" - NUMBER - {}]
Current token: 5 - [object Token "rt" - PRIMITIVE - {rt}]
Starting: execute_right
Current token: 6 - [object Token "90" - NUMBER - {}]
Current token: 7 - [object Token "]" - DELIMITER - {}]
Current token: 3 - [object Token "fd" - PRIMITIVE - {fd}]
Starting: execute_forward
Current token: 4 - [object Token "60" - NUMBER - {}]
Current token: 5 - [object Token "rt" - PRIMITIVE - {rt}]
Starting: execute_right
Current token: 6 - [object Token "90" - NUMBER - {}]
Current token: 7 - [object Token "]" - DELIMITER - {}]
Current token: 3 - [object Token "fd" - PRIMITIVE - {fd}]
Starting: execute_forward
Current token: 4 - [object Token "60" - NUMBER - {}]
Current token: 5 - [object Token "rt" - PRIMITIVE - {rt}]
Starting: execute_right
Current token: 6 - [object Token "90" - NUMBER - {}]
Current token: 7 - [object Token "]" - DELIMITER - {}]
```

In the [next part](/logo/part4) we will do some refactoring before we start with graphics and we can finally see a turtle on the screen (well, kind of).
