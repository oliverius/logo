---
layout: page
title: [14]
permalink: /part14/
---
## Stop the unstoppable spiral with code

In the [previous part](/logo/part13) we were doing some refactoring to have most of the constants all together and we also found a way to decouple the turtle from the parser by raising parser events. [Before that](/logo/part11) we were having a spiral test with recursion and we added a `stop` button to the UI. As someone that prefers to do things programatically I was wondering if we can stop the script through code. In fact, we can, LOGO has two instructions to do this, `if` and `stop`.

The original code for the spiral was:

```
to spiral :side
  fd :side rt 90
  spiral :side + 3
end
spiral 10
```

And we want that to be:

```
to spiral :side
  if :side > 50 [stop]
  fd :side rt 90
  spiral :side + 3
end
spiral 10
```

which means that if the parameter sent to the spiral is greater than 50 we should stop the procedure. The use of `[stop]` with brackets instead of just simply `stop` is not a mistake. The brackets are the same as the curly braces in javascript or C#, they start the code block that will be execute when the control flow from `if` is satisfied.

To start with, let's add a new delimiter `>`, two new primitives `if` and `stop` and two new primitive aliases:

```javascript
delimiters: {
  OPENING_BRACKET: "[",
  CLOSING_BRACKET: "]",
  PLUS: "+",
  MINUS: "-",
  MULTIPLIEDBY: "*",
  DIVIDEDBY: "/",
  GREATERTHAN: ">"
},
primitives: {
  NONE: 0,
  FORWARD: 1,
  RIGHT: 2,
  REPEAT: 3,
  CLEARSCREEN: 4,
  BACK: 5,
  LEFT: 6,
  PENUP: 7,
  PENDOWN: 8,
  TO: 9,
  END: 10,
  IF: 11,
  STOP: 12
}
```

```javascript
{
  primitive: logo.tokenizer.primitives.IF,
  aliases: ["if"]
},
{
  primitive: logo.tokenizer.primitives.STOP,
  aliases: ["stop"]
}
```

So far so good. Now the tokenizer knows these new tokens. The tokens are being read in the `parsingStep()` method so we add two entries for them and a stub of two other methods `execute_if` and `execute_stop` in the parser.

In `parsingStep`:

```javascript
case logo.tokenizer.primitives.IF:
  this.execute_if();
  break;
case logo.tokenizer.primitives.STOP:
  this.execute_stop();
  break;
```

and the two new stubs in the parser itself:

```javascript
execute_if() {

}
execute_stop() {

}
```

If we run the original spiral code (not the one with the `if` but the original one) we can see that we haven't broken anything.

## 'If' but not by Rudyard Kipling

Branching is a feature common to most programming languages. For example in javascript or C# this is valid:

```javascript
if (condition) {
  // do something
} else {
  // do something else
}
```

we evaluate a condition (for javascript and C# the brackets are necessary) and if the condition is met we "do something" and if it is not met we "do something else".

For LOGO the condition doesn't need to be inside brackets and the curly brackets are replaced with square brackets `[` and `]`. We don't realize but we have used them before when we did the `repeat` primitive.

We will do only the "true" part, we won't do the `else` part because LOGO has another primitive called `ifelse` to deal with those cases but that's out of scope for us at the moment (remember that we just wanted to be able to run 4 different examples in this LOGO and we need to focus on that).

For that, the order of things we need to find are:
1. `IF` token (already found, a call made to `execute_if`)
2. An expression (whatever number of tokens) before we find a delimiter `>`
3. A delimiter `>`
4. Another expression (whatever number of tokens) before finding the delimiter `[`
5. Delimiter `[`, same as when we did `repeat`.
6. Whatever inside the code block until finding a delimiter `]`.
7. Delimiter `]`

It seems a bit complicated but we have most of the code already there, let's break it down.

What we have in the condition is just something we need to evaluate to true or false, so points 2, 3 and 4 are just evaluate two expressions with an operator, in our case `>`.

So in `execute_if`:

```javascript
execute_if() {
  let left = this.getExpression();
  this.getNextToken();
  let operator = this.currentToken.text;
  let right = this.getExpression();

  let condition = false;
  switch (operator) {
    case logo.tokenizer.delimiters.GREATERTHAN:
      condition = left > right;
      break;
  }
  if (condition) {
    console.log("do something");
  } else {
    console.log("we don't do the 'else' so skip the code inside the '[' and ']'");
  }
}
```

We try to run a very simple script, just to check if we get the comments expected in the console, something like `if 7 > 5`. When we run it we realize that nothing happens. Why?

When we debug we realize that `>` is not considered a delimiter (it doesn't appear in the list of tokens). The reason is because it is not in the check we do in the tokenizer in `isDelimiter`. When we fix it:

```javascript
isDelimiter(c) {
  return c === logo.tokenizer.delimiters.OPENING_BRACKET ||
    c === logo.tokenizer.delimiters.CLOSING_BRACKET ||
    c === logo.tokenizer.delimiters.PLUS ||
    c === logo.tokenizer.delimiters.MINUS ||
    c === logo.tokenizer.delimiters.MULTIPLIEDBY ||
    c === logo.tokenizer.delimiters.DIVIDEDBY ||
    c === logo.tokenizer.delimiters.GREATERTHAN;
}
```

Now with the example `if 7 > 5` we get the `true` part of the `if` (just a message in the console) and if we do `if 5 > 7` because it is false we get the `false` part of the condition, which for us will be just to run until the end of the code block between brackets.

And here we tackle the code block in `[` `]`. But we already have code to deal with brackets because of the `repeat` primitive in `execute_repeat_begin` and `execute_repeat_end`

```javascript
execute_repeat_end() {
  console.log(`Starting: execute_repeat_end`);   
  let currentLoop = this.loopStack.pop();
  currentLoop.remainingLoops--;
  console.log(`Remaining loops: ${currentLoop.remainingLoops}`);
  if (currentLoop.remainingLoops > 0) {
    this.currentTokenIndex = currentLoop.startTokenIndex;
    this.loopStack.push(currentLoop);
  } else {
    console.log("Loop has finished");
  }
}
execute_repeat_begin(n = 0) {
  console.log(`Starting: execute_repeat_begin ${n}`);
  this.getNextToken();
  if (this.currentToken.tokenType === logo.tokenizer.tokenTypes.DELIMITER &&
    this.currentToken.text === logo.tokenizer.delimiters.OPENING_BRACKET) {
    this.loopStack.push({
      startTokenIndex: this.currentTokenIndex,
      remainingLoops: n
    });
  }
}
```

This is going to be a big headache as we need to "hack" where we check for the opening bracket and accommodate for the code block for `if`.

## Refactor the "repeat" code to allow for generic codeblocks

Let's create a new method called `beginCodeBlock` where we will check for a code block for an `if` or for a `repeat`. At the moment it will be just the code inside `execute_repeat_begin`

```javascript
execute_repeat_begin(n = 0) {
  this.beginCodeBlock(n);
}
```

but we want to tell what primitive we are sending for the code block, either an `if` or a `repeat`. Then:

```javascript
execute_repeat_begin(n = 0) {
  this.beginCodeBlock(logo.tokenizer.primitives.REPEAT, n);
}
beginCodeBlock(primitive = logo.tokenizer.primitives.NONE, n = 0) {
  this.getNextToken();
  if (this.currentToken.tokenType === logo.tokenizer.tokenTypes.DELIMITER &&
    this.currentToken.text === logo.tokenizer.delimiters.OPENING_BRACKET) {
    switch(primitive) {
      case logo.tokenizer.primitives.IF:
        // stub for IF
        break;
      case logo.tokenizer.primitives.REPEAT:
        this.loopStack.push({
          startTokenIndex: this.currentTokenIndex,
          remainingLoops: n
        });
        break;
    }
  }
}
```

As we said, we just moved things around a little bit and accommodate for the `if` code. But what about when we end the code block? Very similar.

In the `parsingStep` instead of:

```javascript
else if (this.currentToken.tokenType === logo.tokenizer.tokenTypes.DELIMITER) {
  if (this.currentToken.text === logo.tokenizer.delimiters.CLOSING_BRACKET) {
    this.execute_repeat_end();
  }
}
```

We will have:

```javascript
else if (this.currentToken.tokenType === logo.tokenizer.tokenTypes.DELIMITER) {
  if (this.currentToken.text === logo.tokenizer.delimiters.CLOSING_BRACKET) {
    this.endCodeBlock();
  }
}
```

And we of course rename `execute_repeat_end` to be `endCodeBlock` because we don't use it anywhere else. If we run an example with a `repeat` like `repeat 4 [ fd 60 rt 90]` it will work just as before.

The problem is, how we identify when it is a loop counter or an `if` counter because we have only the loop stack?

Well, the answer is easy, we get rid of the `loopStack` and we call it `codeBlockStack`.
So everywhere we have it, we rename it (only 4 places).

In the `loopStack` we were sending only 2 properties:
* startTokenIndex: this.currentTokenIndex
* remainingLoops: n
We will need to send another property that we call `primitive` (the one we use in the `switch`) to know exactly if it was an `if` or a `repeat` starting the code block. This won't affect at all in `beginCodeBlock` but it will affect in `endCodeBlock` because we just want to subtract the remaining loops when we have a `repeat` and not when we have an `if`. So the code goes like:

```javascript
beginCodeBlock(primitive = logo.tokenizer.primitives.NONE, arg = 0) {
  this.getNextToken();
  if (this.currentToken.tokenType === logo.tokenizer.tokenTypes.DELIMITER &&
    this.currentToken.text === logo.tokenizer.delimiters.OPENING_BRACKET) {
    switch(primitive) {
      case logo.tokenizer.primitives.IF:
        this.codeBlockStack.push({
          primitive: primitive,
          startTokenIndex: this.currentTokenIndex
        });
        break;
      case logo.tokenizer.primitives.REPEAT:
        this.codeBlockStack.push({
          primitive: primitive,
          startTokenIndex: this.currentTokenIndex,
          remainingLoops: arg
        });
        break;
    }
  }
}
endCodeBlock() {
  if (this.codeBlockStack.length > 0) {
    let currentCodeBlock = this.codeBlockStack.pop();
    switch (currentCodeBlock.primitive) {
      case logo.tokenizer.primitives.IF:
        // Nothing to do
        break;
      case logo.tokenizer.primitives.REPEAT:
        currentCodeBlock.remainingLoops--;
        if (currentCodeBlock.remainingLoops > 0) {
          this.currentTokenIndex = currentCodeBlock.startTokenIndex;
          this.codeBlockStack.push(currentCodeBlock);
        }
        break;
    }
  } else {
    throw "Found a ] without being part of an IF or a REPEAT";
  }    
}
```

I changed `n` to `arg` because it seems more appropiate now that we don't know if the primitive we send is an `if` or a `repeat`. I've also added an exception in case that we reach an end block but we don't have anything (brackets mismatch). If we run again the example for the square

`repeat 4 [fd 60 rt 90]`

it will work. But when we run an `if` like `if 7>5 [fd 60]` we have the exception thrown. Why? because for an `if` we never do the `beginCodeBlock` part. This is easy to fix in `execute_if` with:

```javascript
if (condition) {
  this.beginCodeBlock(logo.tokenizer.primitives.IF);
}
```

that somehow I missed.

Finally, what to do if we don't want to run the code block, like when the condition for the `if` is not met? then we should just skip all the tokens until we find the `]`.

```javascript
skipCodeBlock() {
  this.getNextToken();
  if (this.currentToken.text === logo.tokenizer.delimiters.OPENING_BRACKET) {
    while (this.currentToken.text !== logo.tokenizer.delimiters.CLOSING_BRACKET) {
      this.getNextToken();
    }
  } else {
    throw "Malformed code block, we are expecting a [";
  }
}
```

And of course in the code for `execute_if` now the whole control flow is like:

```javascript
if (condition) {
  this.beginCodeBlock(logo.tokenizer.primitives.IF);
} else {
  this.skipCodeBlock();
}
```

## Don't stop me now!

Yes, we can't stop you now because we haven't done anything if we find a `stop`!!

Actually, this is quite easy as we left the stub for `execute_stop` and we have the functionality that we did in the UI to stop the execution of a script, so:

```javascript
execute_stop() {
  this.stopParsingRequested = true;
}
```

And that's it! Ready to test our spiral, that we almost forgot about it after such a long post.

```
to spiral :side
  if :side > 50 [stop]
  fd :side rt 90
  spiral :side + 3
end
spiral 10
```

![Spiral with stop](/img/part14_spiral_with_stop.gif)

In the [next part](/logo/part15) we will try to finish our fourth example that was in the scope of this project, a recursive tree since we have all the primitives we need and functionality (procedures and recursion).