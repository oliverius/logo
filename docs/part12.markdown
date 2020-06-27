---
layout: page
title: Part 12
permalink: /part12/
---
# Test, love and rock'n'roll

In the previous part (TODO Reference) we did the hard work of managing any kind of expression instead of just only a parameter, i.e. we can now call a procedure not only like `square 60` but like `square 30 + 30` or `square 2 * 15 + 30` or `square 100 / 2 + 10` or even `square 2 * 10 + 50 - 70 / 7` and I will get the same result. This was necessary to make the spiral work because every time we rotate 90 degrees we needed to write a line slightly bigger than the previous one to continue the spiral growing. This should work, right? right? let's see:

```
to square :side
  repeat 4 [fd :side rt 90]
end
square 60
square 30 + 30
square 2 * 15 + 30
square 100 / 2 + 10
square 2 * 10 + 50 - 70 / 7
```

![Squares should be identical](/img/part12_squares_should_be_identical.gif)

It is like a mystery novel, two squares are identical, other two have different size and one is missing in action. How can we check where the problem lies? I think we have been avoiding doing testing for too long, it is time we take this seriously or we would have big problems in the future.

First, it makes sense to test separately the tokenizer and the parser. I am quite sure the current example the tokenizer is not the issue but it could be for other cases. Once I am sure the tokenizer is correct I will try to find a way to test the parser and we will find an elegant solution to do it so.

## Tokenizer testing

So far in some of our side experiments we've been creating some test tokens to play with, like with the expression parser. Let's see if we can formalize this with some kind of tests. I am quite fond of using [BDD tests](https://en.wikipedia.org/wiki/Behavior-driven_development) in C#, but since we are not using any testing framework in this current code we will just do some simple asserts to make sure the tokens are equal.

Let's start with something simple, just `fd 60 rt 90` which is the primitives I run when doing a square. So at the end of our javascript file we do:

```javascript
//const interpreter = new Interpreter('logo-editor', 'logo-graphics', primitiveAliases);
//interpreter.run();

runTokenizerTests();

function runTokenizerTests() {
  let tokenizer = new Tokenizer(primitiveAliases);
  let tokens = tokenizer.tokenize('fd 60 rt 90');
  tokens.forEach(token => console.log(token.toString()));
}
```

and this, of course, works since we've done that before the same way and in the log we get the correct tokens:

```javascript
[object Token "fd" - PRIMITIVE - {FORWARD}]
[object Token "60" - NUMBER - {NONE}]
[object Token "rt" - PRIMITIVE - {RIGHT}]
[object Token "90" - NUMBER - {NONE}]
```

Let's try to assert that effectively I get these 4 tokens, instead of relying in checking the `token.toString()` method. We can create an arrow function `assert` to check that one token is what it says it is. Since the properties of a token are `text`, `tokenType` and `primitive`:

```javascript
let assertToken = (expectedToken = {}, actualToken = {}) => {
  let success = actualToken.text === expectedToken.text &&
    actualToken.tokenType === expectedToken.tokenType &&
    actualToken.primitive === expectedToken.primitive;
  return success;
}
```

this will return either true or false. Let's try with only one token, to start with:

```javascript
function runTokenizerTests() {
  let tokenizer = new Tokenizer(primitiveAliases);

  let assertToken = (expectedToken = {}, actualToken = {}) => {
    let success = actualToken.text === expectedToken.text &&
      actualToken.tokenType === expectedToken.tokenType &&
      actualToken.primitive === expectedToken.primitive;
      return success;
  }

  let expectedToken = new Token("fd", tokenTypes.PRIMITIVE, primitives.FORWARD);
  let actualToken = tokenizer.tokenize("fd");
  console.log(assertToken(expectedToken, actualToken));

  //let tokens = tokenizer.tokenize('fd 60 rt 90');
  //tokens.forEach(token => console.log(token.toString()));
}
```

and this will return a surprising `false`. Why? well, actual token is **NOT** an array, it is only the first element of the array, so if we change:

```javascript
let actualToken = tokenizer.tokenize("fd");
```

with

```javascript
let actualToken = tokenizer.tokenize("fd");[0];
```

it will work. So let's formalize this for more than one token (for an array of tokens). Let's do `assertTokens` for the previous example `fd 60 rt 90`. Because when we assert the tokens we want to know what we are testing a.k.a. the name of the test, we will pass that argument:

```javascript
function runTokenizerTests() {
  let tokenizer = new Tokenizer(primitiveAliases);

  let assertToken = (expectedToken = {}, actualToken = {}) => {
    let success = actualToken.text === expectedToken.text &&
      actualToken.tokenType === expectedToken.tokenType &&
      actualToken.primitive === expectedToken.primitive;
    return success;
  }
  let assertTokens = (comment = "", expectedTokens = [], actualTokens = []) => {
    let success = expectedTokens.every((expectedToken, index) =>
      assertToken(expectedToken, actualTokens[index]));
      
    let testResult = success ? "PASSED" : "FAILED";
    console.log(`TEST "${comment}": ${testResult}`);
  }

  assertTokens(
    'Test primitives',
    [
      new Token("fd", tokenTypes.PRIMITIVE, primitives.FORWARD),
      new Token("60", tokenTypes.NUMBER, primitives.NONE),
      new Token("rt", tokenTypes.PRIMITIVE, primitives.RIGHT),
      new Token("90", tokenTypes.NUMBER, primitives.NONE)
    ],
    tokenizer.tokenize("fd 60 rt 90")
  );
}
```

And in the log we will get "TEST "Test primitives": PASSED" as expected. What we are doing is to check that every token asserted returns true and if not, the test will fail and we will need to find out why. So let's find out now if our 5 different ways to define a square all have the correct number of tokens. We won't worry about the name of the procedure (after all the tokenizer has no clue what a `square` is, and focus only on the expressions):

```javascript
assertTokens(
  'Test primitives',
  [
    new Token("fd", tokenTypes.PRIMITIVE, primitives.FORWARD),
    new Token("60", tokenTypes.NUMBER, primitives.NONE),
    new Token("rt", tokenTypes.PRIMITIVE, primitives.RIGHT),
    new Token("90", tokenTypes.NUMBER, primitives.NONE)
  ],
  tokenizer.tokenize("fd 60 rt 90")
);
assertTokens(
  'Test Expression: 60',
  [
    new Token("60", tokenTypes.NUMBER, primitives.NONE)
  ],
  tokenizer.tokenize("60")
);
assertTokens(
  'Test Expression: 30 + 30',
  [
    new Token("30", tokenTypes.NUMBER, primitives.NONE),
    new Token("+", tokenTypes.DELIMITER, primitives.NONE),
    new Token("30", tokenTypes.NUMBER, primitives.NONE)
  ],
  tokenizer.tokenize("30 + 30")
);
assertTokens(
  'Test Expression: 2 * 15 + 30',
  [
    new Token("2", tokenTypes.NUMBER, primitives.NONE),
    new Token("*", tokenTypes.DELIMITER, primitives.NONE),
    new Token("15", tokenTypes.NUMBER, primitives.NONE),
    new Token("+", tokenTypes.DELIMITER, primitives.NONE),
    new Token("30", tokenTypes.NUMBER, primitives.NONE)
  ],
  tokenizer.tokenize("2 * 15 + 30")
);
assertTokens(
  'Test Expression: 100 / 2 + 10',
  [
    new Token("100", tokenTypes.NUMBER, primitives.NONE),
    new Token("/", tokenTypes.DELIMITER, primitives.NONE),
    new Token("2", tokenTypes.NUMBER, primitives.NONE),
    new Token("+", tokenTypes.DELIMITER, primitives.NONE),
    new Token("10", tokenTypes.NUMBER, primitives.NONE)
  ],
  tokenizer.tokenize("100 / 2 + 10")
);
assertTokens(
  'Test Expression: 2 * 10 + 50 - 70 / 7',
  [
    new Token("2", tokenTypes.NUMBER, primitives.NONE),
    new Token("*", tokenTypes.DELIMITER, primitives.NONE),
    new Token("10", tokenTypes.NUMBER, primitives.NONE),
    new Token("+", tokenTypes.DELIMITER, primitives.NONE),
    new Token("50", tokenTypes.NUMBER, primitives.NONE),
    new Token("-", tokenTypes.DELIMITER, primitives.NONE),
    new Token("70", tokenTypes.NUMBER, primitives.NONE),
    new Token("/", tokenTypes.DELIMITER, primitives.NONE),
    new Token("7", tokenTypes.NUMBER, primitives.NONE)
  ],
  tokenizer.tokenize("2 * 10 + 50 - 70 / 7")
);
```

if we skim through the logs (at the moment we are showing in the log every character that goes through the tokenizer):

```
TEST "Test primitives": PASSED
TEST "Test Expression: 60": PASSED
TEST "Test Expression: 30 + 30": PASSED
TEST "Test Expression: 2 * 15 + 30": PASSED
TEST "Test Expression: 100 / 2 + 10": PASSED
TEST "Test Expression: 2 * 10 + 50 - 70 / 7": PASSED
```

now we are confident that our tokenizer works as expected (at least here), so we will delete all the debugging lines in the Tokenizer class. Of course in the final version of the code we test a lot more things but the "framework" for testing is there. And this is as much as I wanted to do here testing the tokenizer.

## Parser expression testing

Now that we are testing the tokenizer, let's go for the parser, and more exactly for the way it handles the expressions. We've just seen that our tokens for the different ways to call the square are correct, so the issue must lie in how we calculate expressions. Let's create a new function for testing:

```javascript
runParserTests();

function runParserTests() {
  let tokenizer = new Tokenizer(primitiveAliases);
  let parser = new Parser();
}
```

We have now the big issue that to test the parser we need to have a canvas object (for the turtle) and because we don't pass one we get an error:

```
Uncaught TypeError: Cannot read property 'getContext' of undefined
```

this highlights what I mentioned a while back, that I wasn't happy having the turtle inside the parser and it should be somewhere else (most likely in the interpreter because it ties all together). In the spirit of getting my parsing done first, let's comment out the lines that cause the problem in the parser with a big `TODO` comment to put them back later.

```javascript
 //this.turtle = new Turtle(canvasObject); TODO
```

and now we can move on with our lives. So to test the expression we will have to set the tokens we usually do in `parse()` and call `getExpression()`

```javascript
function runParserTests() {
  let tokenizer = new Tokenizer(primitiveAliases);
  let parser = new Parser();

  parser.tokens = tokenizer.tokenize('30 + 30');
  let value = parser.getExpression();
  console.log(value);
}
```


we get a new error:

```
Uncaught TypeError: Cannot read property 'tokenType' of undefined
```

when we check where the error happens is in `getExpression_Value()` because `currentToken` is not defined. I guess I missed more things to initialize when getting the expression than just the tokens. As such:

```javascript
function runParserTests() {
  let tokenizer = new Tokenizer(primitiveAliases);
  let parser = new Parser();

  parser.tokens = tokenizer.tokenize('30 + 30');
  parser.currentToken = {};
  parser.currentTokenIndex = -1;
  parser.lastTokenIndex = parser.tokens.length - 1;

  let value = parser.getExpression();
  console.log(value);
}
```

This will work and will give me the right value, 60. So let's refactor this code so we can reuse it for different tests:

```javascript
function runParserTests() {
  let tokenizer = new Tokenizer(primitiveAliases);
  let parser = new Parser();

  let assertExpression = (expression, expectedValue) => {
    parser.tokens = tokenizer.tokenize(expression);
    parser.currentToken = {};
    parser.currentTokenIndex = -1;
    parser.lastTokenIndex = parser.tokens.length - 1;

    actualValue = parser.getExpression();

    let success = expectedValue === actualValue;
    let testResult = success ? "PASSED" : `FAILED with value ${actualValue}`;
    console.log(`TEST expression "${expression}": ${testResult}`);
  }

  assertExpression("60", 60);
  assertExpression("30 + 30", 60);
  assertExpression("2 * 15 + 30", 60);
  assertExpression("100 / 2 + 10", 60);
  assertExpression("2 * 10 + 50 - 70 / 7", 60);
}
```

And we see in the log (among other things):

```
TEST expression "60": PASSED
TEST expression "30 + 30": PASSED
TEST expression "2 * 15 + 30": FAILED with value 30
TEST expression "100 / 2 + 10": FAILED with value 50
TEST expression "2 * 10 + 50 - 70 / 7": FAILED with value 20
```

It looks like if the first operation is a multiplication or division we stop reading tokens. Probably it has to do with us removing two `getNextToken()` that were causing us problem, so probably that fix didn't work in all cases. After looking at the issues, the problem is that I forgot to put a `getNextToken()` in `getExpression_Multiplication()`, so the the whole method is now (with the `NEW` comment to the one I've added):

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
      this.getNextToken(); // NEW
      console.log("Hold value: ", hold);
      this.getExpression_ApplyArithmeticOperation(operation, result, hold);
  }
}
```

and we can uncomment the code and run the interpreter to see it working (5 squares overwritten because the expression is always the same)


![All expression correct so squares overwrite each other](/img/part12_squares_identical.gif)

Now we can delete the runTokenizerTests  and runParserTests functions, however it seems a waste giving the effort we have done. Since we are not using any testing framework, the only way to run the tests is either calling the function itself or calling the function from the interpreter, so every time we initialize the interpreter we may sure that the tests are all running. Also from the interpreter we won't care that the turtle is inside the parser, so another problem sorted

Our two test functions will require to return something. We can make them return a list of tests passed or not, but it is simpler here to leave all the comments in the console and just return `true` if all tests pass or `false` if not all of them pass.

So the tokenizer tests are:

```javascript
function runTokenizerTests(tokenizer) {
  let assertToken = (expectedToken = {}, actualToken = {}) => {
    let success = actualToken.text === expectedToken.text &&
      actualToken.tokenType === expectedToken.tokenType &&
      actualToken.primitive === expectedToken.primitive;
    return success;
  }
  let test = (comment = "", expectedTokens = [], actualTokens = []) => {
    let success = expectedTokens.every((expectedToken, index) =>
      assertToken(expectedToken, actualTokens[index]));

    let testResult = success ? "PASSED" : "FAILED";
    console.log(`TEST "${comment}": ${testResult}`);

    return success;
  }

  let tests = [];

  tests.push(
    test(
      'Test primitives',
      [
        new Token("fd", tokenTypes.PRIMITIVE, primitives.FORWARD),
        new Token("60", tokenTypes.NUMBER, primitives.NONE),
        new Token("rt", tokenTypes.PRIMITIVE, primitives.RIGHT),
        new Token("90", tokenTypes.NUMBER, primitives.NONE)
      ],
      tokenizer.tokenize("fd 60 rt 90")
    )
  );
  tests.push(
    test(
      'Test Expression: 60',
      [
        new Token("60", tokenTypes.NUMBER, primitives.NONE)
      ],
      tokenizer.tokenize("60")
    )
  );
  tests.push(
    test(
      'Test Expression: 30 + 30',
      [
        new Token("30", tokenTypes.NUMBER, primitives.NONE),
        new Token("+", tokenTypes.DELIMITER, primitives.NONE),
        new Token("30", tokenTypes.NUMBER, primitives.NONE)
      ],
      tokenizer.tokenize("30 + 30")
    )
  );
  tests.push(
    test(
      'Test Expression: 2 * 15 + 30',
      [
        new Token("2", tokenTypes.NUMBER, primitives.NONE),
        new Token("*", tokenTypes.DELIMITER, primitives.NONE),
        new Token("15", tokenTypes.NUMBER, primitives.NONE),
        new Token("+", tokenTypes.DELIMITER, primitives.NONE),
        new Token("30", tokenTypes.NUMBER, primitives.NONE)
      ],
      tokenizer.tokenize("2 * 15 + 30")
    )
  );
  tests.push(
    test(
      'Test Expression: 100 / 2 + 10',
      [
        new Token("100", tokenTypes.NUMBER, primitives.NONE),
        new Token("/", tokenTypes.DELIMITER, primitives.NONE),
        new Token("2", tokenTypes.NUMBER, primitives.NONE),
        new Token("+", tokenTypes.DELIMITER, primitives.NONE),
        new Token("10", tokenTypes.NUMBER, primitives.NONE)
      ],
      tokenizer.tokenize("100 / 2 + 10")
    )
  );
  tests.push(
    test(
      'Test Expression: 2 * 10 + 50 - 70 / 7',
      [
        new Token("2", tokenTypes.NUMBER, primitives.NONE),
        new Token("*", tokenTypes.DELIMITER, primitives.NONE),
        new Token("10", tokenTypes.NUMBER, primitives.NONE),
        new Token("+", tokenTypes.DELIMITER, primitives.NONE),
        new Token("50", tokenTypes.NUMBER, primitives.NONE),
        new Token("-", tokenTypes.DELIMITER, primitives.NONE),
        new Token("70", tokenTypes.NUMBER, primitives.NONE),
        new Token("/", tokenTypes.DELIMITER, primitives.NONE),
        new Token("7", tokenTypes.NUMBER, primitives.NONE)
      ],
      tokenizer.tokenize("2 * 10 + 50 - 70 / 7")
    )
  );

  return tests.every(test => test);
}
```

and for the parser tests:

```javascript
function runParserTests(tokenizer, parser) {
  let assertExpression = (expression, expectedValue) => {
    parser.tokens = tokenizer.tokenize(expression);
    parser.currentToken = {};
    parser.currentTokenIndex = -1;
    parser.lastTokenIndex = parser.tokens.length - 1;

    actualValue = parser.getExpression();

    let success = expectedValue === actualValue;
    let testResult = success ? "PASSED" : `FAILED with value ${actualValue}`;
    console.log(`TEST expression "${expression}": ${testResult}`);

    return success;
  }

  let tests = [];

  tests.push(assertExpression("60", 60));
  tests.push(assertExpression("30 + 30", 60));
  tests.push(assertExpression("2 * 15 + 30", 60));
  tests.push(assertExpression("100 / 2 + 10", 60));
  tests.push(assertExpression("2 * 10 + 50 - 70 / 7", 60));

  return tests.every(test => test);
}
```

Finally we just need to uncomment the interpreter lines that we commented out before to avoid running it, plus reinstate the turtle line in the parser constructor.

The interpreter will require running the two test functions in the constructor:

```javascript
constructor(editorId, canvasId, aliases) {
  this.editor = document.getElementById(editorId);
  this.canvas = document.getElementById(canvasId);
  this.tokenizer = new Tokenizer(aliases);
  this.parser = new Parser(this.canvas);
  if (runTokenizerTests(this.tokenizer) && runParserTests(this.tokenizer, this.parser)) {
    console.log("All tests PASSED");
  } else {
    console.log("Please check the logs, some tests didn't pass");
  }
}
```

And I think for testing, this is enough. In the final version I added the `startTokenIndex` and `endTokenIndex` for each token, so we know that they start and finish in the correct character. These are just minor improvements but they help when debugging the tokenizer.

In the next part we will finally get the turtle out of the parser (it has been bothering me for a long time) and we will also get two more instructions, `if` and `stop` so we can stop in code the spiral instead of having to resort to press the `stop` button. And have some rest, we deserve it!
