---
layout: page
title: Part 3
permalink: /part3/
---
# May I introduce you the parser
In the previous part we were able to convert a LOGO script into an array of tokens. These tokens have the token text and the token type (number, delimiter or primitive), and we managed to show in the console the string representation of the tokens in an easy way that will help us later when debugging.

So let's continue with the parser. The [parser](https://en.wikipedia.org/wiki/Parsing#Parser) runs the list of tokens and executes them correctly, so for our example:

`repeat` `4` `[` `fd` `60` `rt` `90` `]`

We would expect the parser to go (put in different lines for clarity)
TODO add part2_repeat4.gif picture.
TODO this with an animated gif, maybe using https://www.npmjs.com/package/canvas-gif-encoder

In short, we need to understand that after reading `repeat 4`, whatever is inside the brackets must be repeated 4 times. Seems easy, so let's start!

The tokenizer in [part 2] identified could identify the tokens as `primitive`, but we don't record in the token what kind of primitive it is.
Let's add another property in `Token` to give me the primitive:

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
Since we are giving defualt values, the only instance of `Token` in the tokenizer that we need to worry about i the one when it is a primitive. (the check with `isPrimitive`). We just need to convert the `tokenText` to lowercase since all the primitives are recorded in lowercase and we are all done:

```javascript
tokens.push(new Token(tokenText, tokenTypes.PRIMITIVE, tokenText.toLowerCase()));
```

We will get in the console:

```
[object Token "repeat" - PRIMITIVE - {repeat}]
[object Token "4" - NUMBER - {}]
[object Token "[" - DELIMITER - {}]
[object Token "fd" - PRIMITIVE - {fd}]
[object Token "60" - NUMBER - {}]
[object Token "rt" - PRIMITIVE - {rt}]
[object Token "90" - NUMBER - {}]
[object Token "]" - DELIMITER - {}]
```

which is quite easy to read. I've added the word `Token` just to be absolutely clear of what is this, and some curly braces around the primitive to make it easier on the eye, that's all.

So yes, finally, the parser. Because I can see that the parser can get complicated, instead of a function I will start directly with a class. I don't want to parse directly in the constructor, I want to have a method `parse` that is given the tokens:

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

And we will get the message `parser starting` in the console as expected. As we can see, the parser doesn't know anything about the original script, it only knows about the tokens. This is very important, separation of concerns (TODO hablar de esto junto con otros casos como react q todo esta junto)

Our first impulse is to write a loop through the tokens but since we are going to point to the same tokens over and over again (in the `repeat`), it makes more sense to create a method to point back to the first token after `[` when we find the `]` to complete the 4 repeats. Since every time we move we want to get the token there, we will call it `getNextToken()`.

The only problem with `getNextToken()` is that I don't know when it reaches the end. But that would be really easy checking that the index in the token array is greater than the last valid index. We will need to keep an `index` property available within the parser so `parse` and `getNextToken` can access it. So far our parser looks like:

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
* We have made `tokens` as well available in Parser, so `getNextToken()` can access it.
* The starting index is -1. Why? because as soon as I start parsing I ask for next token, so if I start in -1, my first token will be the next one, 0.
* We are using a `do-while` loop instead of a `while`. Why? because with a `do-while` you always try to run the code once, and we don't need to do a `getNextToken` and later a while loop. In short, it looks neater.

So our console will show as expected, only 8 tokens.

```
Current token: 0 - [object Token "repeat" - PRIMITIVE - {repeat}]
Current token: 1 - [object Token "4" - NUMBER - {}]
Current token: 2 - [object Token "[" - DELIMITER - {}]
Current token: 3 - [object Token "fd" - PRIMITIVE - {fd}]
Current token: 4 - [object Token "60" - NUMBER - {}]
Current token: 5 - [object Token "rt" - PRIMITIVE - {rt}]
Current token: 6 - [object Token "90" - NUMBER - {}]
Current token: 7 - [object Token "]" - DELIMITER - {}]
```

