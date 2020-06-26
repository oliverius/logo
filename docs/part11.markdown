---
layout: page
title: Part 11
permalink: /part11/
---
# Do you want to build a expression parser?

In the previous part (TODO link) we wanted to create a spiral, however we ran into some problems and I decided that it was better to nail down how to stop a recursive procedure call (like a spiral) and do some refactoring before we commit fully to deal with expressions.

What do I mean exactly with a expression parser? let's take a look again at the code for the spiral:

```
to spiral :side
  fd :side rt 90
  spiral :side + 3
end
spiral 10
```

An expression for us is where the parameter we send (to spiral in this case) is not a single value but it can be any mathematical expression, in our case an addition of `:side` and `3`. Because we are using a recursive descent parser the way we deal with the expression is calling  the same methods until we sort out completely the expression. A good article about it (although for Python) is [here](https://ruslanspivak.com/lsbasi-part7/). In our case it will be simpler because we will follow the example for Tiny Basic (TODO ref. here) and he has already sorted it out without having to worry about grammars or abstract syntax trees or anything.

In Tiny Basic (which is written in C) to provide the values correctly it sends them by reference so we can build on them and return the value together with any operations done to it. In javascript [we don't have passing values by reference](https://stackoverflow.com/questions/13104494/does-javascript-pass-by-reference) however we can pass objects and alter the contents of the object which at the end of the day will do the same job.

So let's start. Let's focus in getting the line `spiral :side + 3` correctly.

The `+` is a new delimiter and as such we need to take it into account.

```javascript
const delimiters = {
  OPENING_BRACKET: "[",
  CLOSING_BRACKET: "]",
  PLUS: "+"
};
```

and in the tokenizer:

```javascript
isDelimiter(c) {
return c === delimiters.OPENING_BRACKET ||
    c === delimiters.CLOSING_BRACKET ||
    c === delimiters.PLUS;
}
```

That's it, now the `+` is a proper token. Let's see what we do in the parser. We need to be able to recognize `spiral :side + 3` where `:side + 3` is the parameter.

So in our code it will make sense that `getParameter()` which is now:

```javascript
getParameter() {
  this.getNextToken();
  switch (this.currentToken.tokenType) {
    case tokenTypes.NUMBER:
      return parseInt(this.currentToken.text);
    case tokenTypes.VARIABLE:
      let variableName = this.currentToken.text;
      let parameter = this.procedureCallInformation.parameters
        .find(p => p.parameterName === variableName);
      return parseInt(parameter.parameterValue);
  }
}
```

it should take not only one token (either a number or a variable) but a bunch of tokens following this pattern `a + b + c + ...` because `+` is the only operation delimiter we have (we will add later `-`, `*` and `/`)

But I don't want to mess what I have here, so just in this case, we are going to create some code that won't be used anywhere else and we will delete, but it will help us to understand how an expression parser is done. May I present you, the expression parser

## The expression parser project

(TODO herbert schild example)

At the end of our javascript file we are going to create a test example of an expression parser. What we learn here we can use it to incorporate the logic inside the parser itself so we are not wasting time, we would waste more time if we try to do it with the current parser without testing if it works or not first. We also comment out the interpreter, we don't want anything that we don't need in the console

```javascript
//const interpreter = new Interpreter('logo-editor', 'logo-graphics', primitiveAliases);
//interpreter.run();

let testTokens = new Tokenizer(primitiveAliases).tokenize(":side + 3");
testTokens.forEach(token => console.log(token));
```

This will give us 3 tokens as expected

```javascript
[object Token ":side" - VARIABLE - {NONE}]
[object Token "+" - DELIMITER - {NONE}]
[object Token "3" - NUMBER - {NONE}]
```

Don't worry about the value of `:side` we will create a mock to return a fake value mimicking what we would get in the real parser if we call `getParameter()`

Because parser is a class, our expression parser will also be a class (easier later to copy code from class to class).

We will copy also `getNextToken()` and a bit of `parse()` like this:

```javascript
class ExpressionParser {
  getNextToken() {
    this.currentTokenIndex++;
    if (this.currentTokenIndex <= this.lastTokenIndex) {
      this.currentToken = this.tokens[this.currentTokenIndex];
      console.log(`\tCurrent token: ${this.currentTokenIndex} - ${this.currentToken}`);
    }
  }
  parse(tokens) {
    console.log(`Starting: parse`);
    this.tokens = tokens;
    this.currentToken = {};
    this.currentTokenIndex = -1;
    this.lastTokenIndex = tokens.length - 1;

    do {
      this.getNextToken();
    } while (this.currentTokenIndex < this.lastTokenIndex);

  }
}

let expressionParser = new ExpressionParser();
expressionParser.parse(testTokens);
```

This will give us our tokens, as expected

The trick about the recursive parser (in our case recursive descent parser) is that we will deal with the expression according to the order of evaluation, for example a multiplication has to be dealt first before an addition or subtraction.

Let's go overboard and define the 4 operations we want to deal with, `+`, `-`, `*` and `/`. We won't do parenthesis `(` or `)` just to keep it simple. As such

```javascript
const delimiters = {
  OPENING_BRACKET: "[",
  CLOSING_BRACKET: "]",
  PLUS: "+",
  MINUS: "-",
  MULTIPLIEDBY: "*",
  DIVIDEDBY: "/"
};
```

And the same that we did for `+`, the only place we need to implement this for the tokenizer is in `isDelimiter()`:

```javascript
isDelimiter(c) {
  return c === delimiters.OPENING_BRACKET ||
    c === delimiters.CLOSING_BRACKET ||
    c === delimiters.PLUS ||
    c === delimiters.MINUS ||
    c === delimiters.MULTIPLIEDBY ||
    c === delimiters.DIVIDEDBY;
}
```

Let's try something only with `+` and `-` which is simpler, like:

`3 + 4 - 5 = 2`

I chose the numbers carefully so we get a positive result and the result is not found doing `3 + 4` or `4 -5` so there is no doubt that we have done the value correctly.

We change our `testTokens` to be that, so:

```javascript
let testTokens = new Tokenizer(primitiveAliases).tokenize("3 + 4 - 5");
```

I the do-while loop instead of a `this.getNextToken()` we do:

```javascript
do {
  let result = this.getExpression();
  console.log(`Result: ${result}`);
} while (this.currentTokenIndex < this.lastTokenIndex);
```

because we know that all the tokens are just a expression. Let's see clearly what I want from `getExpression()`.

I want it to find a number, check that the next token is either a `+` or `-` and hold an intermediate value to keep adding or subtracting and at the end return the whole value. As we said before javascript doesn't have values passed by reference BUT we can pass an object and change the values inside which pretty much is the same for our purpose. So we do:

To get the value, we do something very simple, like we do in the current parser:

This is the code, let's break it down afterwards:

```javascript
getExpression() {
  let result = {
    value: 0
  };

  this.getNextToken();
  this.getExpression_AdditionOrSubtraction(result);

  return result.value;
}
getExpression_AdditionOrSubtraction(result) {
  console.log("getExpression_AdditionOrSubtraction", result);
  
  let operation = "";
  this.getExpression_Value(result);
  this.getNextToken();
  while (this.currentToken.text === delimiters.PLUS ||
    this.currentToken.text === delimiters.MINUS) {
      operation = this.currentToken.text;
      this.getNextToken();
      let hold = {
        value: 0
      };
      this.getExpression_Value(hold);
      console.log("Hold value: ", hold);
      this.getExpression_ApplyArithmeticOperation(operation, result, hold);
      this.getNextToken();
  }
}
getExpression_ApplyArithmeticOperation(operation, result, hold) {
  switch(operation) {
    case delimiters.PLUS:
      console.log(`${result.value} ${operation} ${hold.value}`);
      result.value += hold.value;
      break;
    case delimiters.MINUS:
      console.log(`${result.value} ${operation} ${hold.value}`);
      result.value -= hold.value;
      break;
  }
}
getExpression_Value(result) {
  if (this.currentToken.tokenType === tokenTypes.NUMBER) {
    result.value += parseInt(this.currentToken.text);
  } else {
    console.log("token is not a number");
  }
}
```

Ok a lot to digest (and we haven't even started with the multiplication and division!). The trick is to know the tokens you are dealing with, and ending up in the loop in a way that the next token is the same type as the starting token.

Let's say we are going to do `3 + 4 - 5` which is an example with positive and negative numbers and returning the final number a positive one.

The log will be:

```javascript
[object Token "2" - NUMBER - {NONE}]
[object Token "-" - DELIMITER - {NONE}]
[object Token "3" - NUMBER - {NONE}]
[object Token "+" - DELIMITER - {NONE}]
[object Token "7" - NUMBER - {NONE}]
Starting: parse
	Current token: 0 - [object Token "2" - NUMBER - {NONE}]
getExpression_AdditionOrSubtraction {value: 0}
	Current token: 1 - [object Token "-" - DELIMITER - {NONE}]
	Current token: 2 - [object Token "3" - NUMBER - {NONE}]
Hold value:  {value: 3}
2 - 3
	Current token: 3 - [object Token "+" - DELIMITER - {NONE}]
	Current token: 4 - [object Token "7" - NUMBER - {NONE}]
Hold value:  {value: 7}
-1 + 7
Result: 6
```

In `getExpression()` we define `result` which is the place where we store the final value. Because it is an object we define a property called `value` that will contain, ehem, our values.

We get the next token, which is `2`, and we call `getExpression_AdditionOrSubtraction(result)`.

We assign result the value of the current token `2` to `result.value`.

We get the next token, which is a `-`. Now because we have only `+` and `-` available I am going to loop and operate all the tokens, making it that the loop always ends with the token that should be a delimiter, either a `+` or a `-`.

So we check that the current token is a `+` or a `-` (it is a `-`). Save that operation name (minus) for future use.

Get the next token `3` and put the value into a temporary variable called `hold`, so `hold.value` is now 3. Apply the operation `result.value + hold.value` being 2 - 3 = -1 and keep this value in `result.value`.

Ask for the next token, which will be a delimiter (a `+` this time), and save that operation for later.

Get the next token (a `7`) and save the value in the `hold` variable which has been reset to 0 so it is not accumulating the other values.

We apply the `+` to our previous `result.value` which is `-1`, so `-1 + 7 = 6` and we are done. We can add as many as we want and it will give me the right result.

## Multiplication

Multiplication is more important than addition so we have to stop our addition/subtraction and do the multiplication, coming back to our addition. This is very simple to see with an example.

`2 + 3 * 4 - 5`

This is not `2 + 3 * 4 - 5 = 5 * 4 - 5 = 20 - 5 = 15`, this is wrong. We really have three operands for the addition:

`2`, `3 * 4` and `5`, so we need to sort out the multiplication and we have 3 operands for the addition: `2`, `12` and `5` and the final result is

`2 + 12 - 5 = 14 - 5 = 9`

So in the code what we need to do before we do the addition is to call the multiplication. I know it takes a while to get used to it but following the code and understanding this you can make whatever kind of calculator you want.

In `getExpression_AdditionOrSubtraction()` we don't ask anymore for `getExpressionValue(result)` to start with, but we call the multiplication code sending `result` as well, so if there is any multiplication or division I will get the correct value (this is the code that will get me the 12 from 3 * 4).
That means that really every time I was asking for the `getExpression_Value()` now I need to call `getExpression_MultiplicationOrSubtraction()`, taking into consideration if I am sending the full result or the temporary value `hold`.

The final code for `getExpression_AdditionOrSubtraction()` is:

```javascript
getExpression_AdditionOrSubtraction(result) {
  console.log("getExpression_AdditionOrSubtraction", result);
  
  let operation = "";
  this.getExpression_MultiplicationOrDivision(result);
  while (this.currentToken.text === delimiters.PLUS ||
    this.currentToken.text === delimiters.MINUS) {
      operation = this.currentToken.text;
      this.getNextToken();
      let hold = {
        value: 0
      };
      this.getExpression_MultiplicationOrDivision(hold);
      console.log("Hold value: ", hold);
      this.getExpression_ApplyArithmeticOperation(operation, result, hold);
      this.getNextToken();
  }
}
```

Where the `hold` initialization must be inside the while-loop (if not we will hold more than we wanted to) and we got rid of one `getNextToken()` after the first `getExpression_MultiplicationOrDivision()`. I must confess that it took me a while to get this correctly as I didn't know why I was getting one token less than I thought.

And now for `getExpression_MultiplicationOrDivision()`. Well pretty much it is the same as `getExpression_AdditionOrSubtraction` but because we don't have any other method to call, we call as before `getExpression_Value()`. Again in a while-loop because if we keep doing multiplications or divisions we will hold the temporary value and return it to the addition/subtraction code. We also needed to put the `hold` variable inside the while-loop and remove one of the `getNextToken()`.

```javascript
getExpression_MultiplicationOrDivision(result) {
  console.log("getExpression_MultiplicationOrDivision", result);
  let operation = "";
  this.getExpression_Value(result);
  this.getNextToken();
  while (this.currentToken.text === delimiters.MULTIPLIEDBY ||
    this.currentToken.text === delimiters.DIVIDEDBY) {
      operation = this.currentToken.text;
      this.getNextToken();
      let hold = {
        value: 0
      };
      this.getExpression_Value(hold);
      console.log("Hold value: ", hold);
      this.getExpression_ApplyArithmeticOperation(operation, result, hold);
  }
}
```

and of course we need to add the multiplication and division to our `getExpression_ApplyArithmeticOperation()`:

```javascript
getExpression_ApplyArithmeticOperation(operation, result, hold) {
  console.log(`${result.value} ${operation} ${hold.value}`);
  switch(operation) {
    case delimiters.PLUS:
      result.value += hold.value;
      break;
    case delimiters.MINUS:
      result.value -= hold.value;
      break;
    case delimiters.MULTIPLIEDBY:
      result.value *= hold.value;
      break;
    case delimiters.DIVIDEDBY:
      result.value /= hold.value;
      break;
  }
}
```

where I did a minor refactor to put the console at the beginning because that way we don't repeat the same 4 times. The log is:

The log for my example `2 + 3 * 4 - 5` is

```javascript
[object Token "2" - NUMBER - {NONE}]
[object Token "+" - DELIMITER - {NONE}]
[object Token "3" - NUMBER - {NONE}]
[object Token "*" - DELIMITER - {NONE}]
[object Token "4" - NUMBER - {NONE}]
[object Token "-" - DELIMITER - {NONE}]
[object Token "5" - NUMBER - {NONE}]
Starting: parse
	Current token: 0 - [object Token "2" - NUMBER - {NONE}]
getExpression_AdditionOrSubtraction {value: 0}
getExpression_MultiplicationOrDivision {value: 0}
	Current token: 1 - [object Token "+" - DELIMITER - {NONE}]
	Current token: 2 - [object Token "3" - NUMBER - {NONE}]
getExpression_MultiplicationOrDivision {value: 0}
	Current token: 3 - [object Token "*" - DELIMITER - {NONE}]
	Current token: 4 - [object Token "4" - NUMBER - {NONE}]
Hold value:  {value: 4}
3 * 4
Hold value:  {value: 12}
2 + 12
	Current token: 5 - [object Token "-" - DELIMITER - {NONE}]
	Current token: 6 - [object Token "5" - NUMBER - {NONE}]
getExpression_MultiplicationOrDivision {value: 0}
Hold value:  {value: 5}
14 - 5
Result: 9
```

## Implementing the expression parser and finally getting the spiral

So now it is time to implement everything into the current parser and delete the expression parser. Since we used some code already from parser it will be really easy. In fact, `getExpression()`, `getExpression_AdditionOrSubtraction()`, `getExpression_MultiplicationOrDivision()` and `getExpression_ApplyArithmeticOperation()` will be copied verbatim. The only other method that we have, `getExpression_Value()` will need some changes to accept parameters.

If we remember the current `getParameter()`:

```javascript
getParameter() {
  this.getNextToken();
  switch (this.currentToken.tokenType) {
    case tokenTypes.NUMBER:
      return parseInt(this.currentToken.text);
    case tokenTypes.VARIABLE:
      let variableName = this.currentToken.text;
      let parameter = this.procedureCallInformation.parameters
        .find(p => p.parameterName === variableName);
      return parseInt(parameter.parameterValue);
  }
}
```

and compare it to our `getExpression_Value()`

```javascript
getExpression_Value(result) {
  if (this.currentToken.tokenType === tokenTypes.NUMBER) {
    result.value += parseInt(this.currentToken.text);
  } else {
    console.log("token is not a number");
  }
}
```

the only difference is that `getParameter()` deals also with variables like `:side`. We can modify `getExpression_Value()` as:

```javascript
getExpression_Value(result) {
  switch (this.currentToken.tokenType) {
    case tokenTypes.NUMBER:
      result.value = parseInt(this.currentToken.text);
      break;
    case tokenTypes.VARIABLE:
      let variableName = this.currentToken.text;
      let parameter = this.procedureCallInformation.parameters
        .find(p => p.parameterName === variableName);
      result.value = parseInt(parameter.parameterValue);
      break;
  }
}
```

The final touch is to get rid of `getParameter()` and any calls to it rename them as `getExpression()`, that's it.

Let's run it with our trusted square procedure and... a total flop, the turtle just moved to the right, that's all, no lines were drawn. What's wrong?
If we check the logs we don't have any logs for when we assign the expression in `getExpression_Value()`, so let's add some logging there at the end:

`console.log(`getExpression_Value -> ${result.value}`);`

when we run it again we see only two expression values, one for the `4` in the `repeat` and one for the `90` in `rt 90`.

So we may think that the issue is that we didn't know how to process variables. So let's try `fd 60` instead of `fd :side` and... the same. So there is something wrong in the code, but all looks correct. I will save you again one hour of your life, the thing missing is to put back one of the tokens after `getExpression_AdditionOrSubtraction()` in `getExpression()`. Because we read one extra token we couldn't process correctly the other values and we were always in the wrong, that's why the `repeat` didn't execute. As such, this will get me the square as before:

```javascript
getExpression() {
  let result = {
    value: 0
  };

  this.getNextToken();
  this.getExpression_AdditionOrSubtraction(result);
  this.putBackToken();

  return result.value;
  }
```

and finally, the spiral:

```
to spiral :side
  fd :side rt 90
  spiral :side + 3
end
spiral 10
```

![Spiral with manual stop](/img/part11_spiral_manual_stop.gif)
e