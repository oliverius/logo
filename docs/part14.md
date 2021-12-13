---
layout: page
title: [14]
permalink: /part14/
---
## Stop the unstoppable spiral in code

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


