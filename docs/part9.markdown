---
layout: page
title: Part 9
permalink: /part9/
---
# Your wish is my command (or my procedure)

In the previous part we refactored the code for the tokenizer so now we can accept that the brackets are "touching" another tokens like in `repeat 4 [fd 60 rt 90]`. In this part we are going to be able to create a procedure and call it as many times as we want, for example: (TODO REF to index.md)

```
to square :side
  repeat 4 [fd :side rt 90]
end
square 60
```

In this case we will define a square and by calling it with a parameter the square appears in the screen. And we can call it many more times if we want but for this example we wil call it once.

A procedure starts with the primitive `to` and end with the primitive `end`. 

The primitive `to` must be followed by the name of the procedure and after that a list of parameters (variables) starting with `:` or no parameters at all. The rest until `end` is content of the procedure.

Let's try to identify first the two new primitives, `to` and `end`. For that we would need to test the tokenizer, so it is a pity that I deleted the example we had in the previous part (TODO link) but we can do that again easily. Even better, we will use the editor box in the UI that it is used by the interpreter and we comment out the initialization of the parser, this way we will only do the tokenizer. So in the interpreter instead of having:

```javascript
run() {
  console.log("[Interpreter] Starting: run");
  let script = this.editor.value;
  let tokens = this.tokenizer.tokenize(script);
  this.parser.parse(tokens);
}
```

we will have:

```javascript
run() {
  console.log("[Interpreter] Starting: run");
  let script = this.editor.value;
  let tokens = this.tokenizer.tokenize(script);
  //this.parser.parse(tokens);
  tokens.forEach(token => console.log(token.toString()));
}
```

obviously in `index.html` we will change the current script with the one above with the procedure, so when we run, we will only run the tokenizer on it.

```html
    <textarea id="logo-editor">to square :side
repeat 4 [fd :side rt 90]
end
square 60</textarea>
```

When we try to run it, we get an `Out of memory` message. Let's take a look at the log, since we haven't removed any of the log messages from the previous part (TODO link)

The last four lines of the log before crashing were:

```javascript
logo.js:271 	Current character: 52 -  
logo.js:271 	Current character: 53 - 6
logo.js:303 Processing number starting with: 6
logo.js:271 	Current character: 54 - 0
```

So the issue seems to be int he character 54 which is a 0. As it happens this is the last character that I can see in the script, so the problem must be when getting the next character and checking if it is a number. If we add a `console.log("check is number");` inside `isNumber()` method we will see that that's the culprit, we entered an endless loop in `isNumber()`. But what could have happened?

Well, actually the issue is not in `isNumber()`. When we reach the last character and later we call `getNextCharacter()` we have only defined when the character is in the defined range, but we haven't done anything if we are out of that range. When we are in the last character the next one is out of the stream of characters so we don't do anything and effectively the `this.currentCharacter` doesn't change because it was changed inside the `if`. Let's show again what we do in `getNextCharacter()`:

```javascript
getNextCharacter() {
  this.currentIndex++;
  if (this.currentIndex <= this.lastCharacterIndex) {
    this.currentCharacter = this.script[this.currentIndex];
    console.log(`\tCurrent character: ${this.currentIndex} - ${this.currentCharacter}`);
  }
}
```

So in our `while-loop` when we say "get numbers until you find something that it is not a number" the loop keeps receiving the last number shown (0) validating the condition and checking for even more numbers (...that it never happened) so here is our endless loop that crashes the browser.

We need to find a way to signal that if we are over the last character allowed we should stop. We can think of having some boolean class property like `hasToStop`, and that would be fine, but we would need to add it to every single `while-loop` inside the big do-while loop, for example:

```javascript
while (this.isNumber(this.currentCharacter) && !this.hasToStop) {
  number += this.currentCharacter;
  this.getNextCharacter();
}
```

so as soon has we raise the `hasToStop` flag the condition in the while-loop will be false and we will stop it. And we will need to do the same in the `while` for the `do-while`. The issue I have with this is that it will be easier to forget adding this extra condition to every loop that can go "endless". There is an easier way and that's to have a special character that will determine the end of the string, something that doesn't appear in the text itself. This problem has been sorted long time ago with the [null terminated strings](https://en.wikipedia.org/wiki/Null-terminated_string) over 50 years ago. We just need `getNextCharacter()` to return a `NUL` character (value 0 in ASCII) and we will stop.

In the example above with the `while-loop` for number, because `0` is not a number the loop will stop and we don't need to keep adding an extra condition like `&& !this.hasToStop`.

So we define our special character at the beginning in the tokenizer (TODO check that it shows correctly \ 0). Note that this can cause issues with UTF-8 but since we are focused for simplicity in the latin alphabet that won't be an issue.

```javascript
NUL = '\0';
```

and in `getNextCharacter()`:

```javascript
getNextCharacter() {
  this.currentIndex++;
  if (this.currentIndex <= this.lastCharacterIndex) {
    this.currentCharacter = this.script[this.currentIndex];
    console.log(`\tCurrent character: ${this.currentIndex} - ${this.currentCharacter}`);
  } else {
    this.currentCharacter = this.NUL;
  }
}
```

we don't worry about the index because in the code we never manipulate the index on its own, only in `getNextCharacter()` and in the do-while-loop condition, and we just need a way to "escape" the do-while-loop.

and the condition in the do-while-loop will change from:

```javascript
while (this.currentIndex < this.lastCharacterIndex)
```

to

```javascript
while (this.currentCharacter !== this.NUL)
```

and when we run the program it won't choke and it will give me all the tokens that it knows so far:

```javascript
[object Token "repeat" - PRIMITIVE - {REPEAT}]
[object Token "4" - NUMBER - {NONE}]
[object Token "[" - DELIMITER - {NONE}]
[object Token "fd" - PRIMITIVE - {FORWARD}]
[object Token "rt" - PRIMITIVE - {RIGHT}]
[object Token "90" - NUMBER - {NONE}]
[object Token "]" - DELIMITER - {NONE}]
[object Token "60" - NUMBER - {NONE}]
```

## TO the END of the world (or the procedure)

Having sorted the issues with the tokenizer, let's add the two new primitives `to` and `end`.

```javascript
const primitives = {
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
  END: 10
};
```

with the new primitive aliases:

```javascript
{
  primitive: primitives.TO,
  aliases: ["to"]
},
{
  primitive: primitives.END,
  aliases: ["end"]
}
```

we don't need to add anything in the parser `draw()` method because we don't need the turtle to do anything, similar to the `repeat` primitive that it is dealt internally in the parser but the turtle doesn't have any clue what's going on. However we need to do something in the parsing loop, so we will do a stub:

```javascript
case primitives.TO:
  this.execute_to();
  break;
case lprimitives.END:
  this.execute_end();
  break;
`
and

```javascript
execute_to() {
  console.log(`Starting: execute_to`);
}
execute_end() {
  console.log(`Starting: execute_end`);
}
```

Do we need to do anything in the tokenizer? nope, because we didn't hardcode the primitives in it, as long as the primitives and primitive aliases are defined they will be found correctly.

```javascript
[object Token "to" - PRIMITIVE - {TO}]
[object Token "repeat" - PRIMITIVE - {REPEAT}]
[object Token "4" - NUMBER - {NONE}]
[object Token "[" - DELIMITER - {NONE}]
[object Token "fd" - PRIMITIVE - {FORWARD}]
[object Token "rt" - PRIMITIVE - {RIGHT}]
[object Token "90" - NUMBER - {NONE}]
[object Token "]" - DELIMITER - {NONE}]
[object Token "end" - PRIMITIVE - {END}]
[object Token "60" - NUMBER - {NONE}]
```

There are two things that we still don't recognize: the name of a procedure (in our case `square`) and the name of the variable (`:side`). As usual, let's get out of the way the easy one, on this case the name of the procedure.

Remember our code for the tokenizer, where we check if a "word" is a primitive or not? that's the place where we will check that, if something is not a primitive, it must be the name of a procedure. That's it. I know that this can be made better if we check that the procedure really exist. For example, this will look ok to the tokenizer:

```
to square :side
  repeat 4 [fd :side rt 90]
end
potato 60
```

because it can't find `potato` in the list of primitives it won't complain. But to be fair with the tokenizer, it is just **doing its job**, it is really up to the parser to make sense of the tokens.

Our code to recognize the name of the procedure will require a new token type that we will call `PROCEDURE_NAME`:

```javascript
const tokenTypes = {
  NONE: 0,
  DELIMITER: 1,
  NUMBER: 2,
  PRIMITIVE: 3,
  PROCEDURE_NAME: 4
};
```

and in the tokenizer we changed:

```javascript
if (primitive !== primitives.NONE) {
  tokens.push(new Token(word, tokenTypes.PRIMITIVE, primitive));
} else {
  console.log(`${word} is not a primitive!`);
}
```

with:

```javascript
if (primitive !== primitives.NONE) {
  tokens.push(new Token(word, tokenTypes.PRIMITIVE, primitive));
} else {
  tokens.push(new Token(word, tokenTypes.PROCEDURE_NAME, primitive));
}
```

Let's run it:

```javascript
[object Token "to" - PRIMITIVE - {TO}]
[object Token "square" - PROCEDURE_NAME - {NONE}]
[object Token "side" - PROCEDURE_NAME - {NONE}]
[object Token "repeat" - PRIMITIVE - {REPEAT}]
[object Token "4" - NUMBER - {NONE}]
[object Token "[" - DELIMITER - {NONE}]
[object Token "fd" - PRIMITIVE - {FORWARD}]
[object Token "side" - PROCEDURE_NAME - {NONE}]
[object Token "rt" - PRIMITIVE - {RIGHT}]
[object Token "90" - NUMBER - {NONE}]
[object Token "]" - DELIMITER - {NONE}]
[object Token "end" - PRIMITIVE - {END}]
[object Token "square" - PROCEDURE_NAME - {NONE}]
[object Token "60" - NUMBER - {NONE}]
```

and we have a nasty surprise. Not only we got the procedure names but because we haven't defined what to do with `:` which is the start of the variables, it ignores it and it thinks that the name of the variable without a `:` is a procedure name. So I guess I should have defined first what a variable is (another token type) and later the procedure name. Let's do it.

We add the new token type for `VARIABLE`. Because I should have defined it earlier we are going to put it in front of `PROCEDURE_NAME` in the enum of token types:

```javascript
const tokenTypes = {
  NONE: 0,
  DELIMITER: 1,
  NUMBER: 2,
  PRIMITIVE: 3,
  VARIABLE: 4,
  PROCEDURE_NAME: 5
};
```

It doesn't require a primitive alias because it is not a primitive. Also we won't touch the parser for now and focus on getting the tokenizer right. Because the variables all start with `:` it makes sense that we search for that character in the token stream (the script). We will call it `VARIABLE_PREFIX` and will be a property in the tokenizer:

```javascript
VARIABLE_PREFIX = ":";
```

and the same way we check is something `isNumber()` or `isLetter()` we can check if a character is `isVariablePrefix()`:

```javascript
isVariablePrefix(c) {
  return c === this.VARIABLE_PREFIX;
}
```

where do we do the check in the tokenizer loop? it really doesn't matter because the loop is just a big if-else so if something is not caught in the net for delimiters, numbers or letters it will fall into the new "net" for variable prefix. It would be different if instead of a big if-else we do `if` after `if` (an issue I originally had). We will put it as another `else` after `isLetter()`.

We can do some clever logic to say "when you find `:` loop again and you will find a "word" and that would be the name of the variable. I am not trying to be clever, but write code that it is easy to read and modify, so in this particular case we will duplicate the code we had to find a "word" inside the `isVariablePrefix()` block. The whole block is now:

```javascript
else if (this.isVariablePrefix(this.currentCharacter)) {
  let variable = this.currentCharacter;
  this.getNextCharacter();
  variable += this.currentCharacter;
  console.log(`Processing variable starting with: ${this.currentCharacter}`);
  this.getNextCharacter();
  while (this.isLetter(this.currentCharacter)) {
    variable += this.currentCharacter;
    this.getNextCharacter();
  }
  this.putbackCharacter();
  console.log(`End processing variable. Found :${variable}`);
  tokens.push(new Token(variable, tokenTypes.VARIABLE, primitives.NONE));
```

where we need to do an extra `getNextCharacter()` because the first character is a `:`. The log works as expected, all the tokens accounted for

```javascript
[object Token "to" - PRIMITIVE - {TO}]
[object Token "square" - PROCEDURE_NAME - {NONE}]
[object Token ":side" - VARIABLE - {NONE}]
[object Token "repeat" - PRIMITIVE - {REPEAT}]
[object Token "4" - NUMBER - {NONE}]
[object Token "[" - DELIMITER - {NONE}]
[object Token "fd" - PRIMITIVE - {FORWARD}]
[object Token ":side" - VARIABLE - {NONE}]
[object Token "rt" - PRIMITIVE - {RIGHT}]
[object Token "90" - NUMBER - {NONE}]
[object Token "]" - DELIMITER - {NONE}]
[object Token "end" - PRIMITIVE - {END}]
[object Token "square" - PROCEDURE_NAME - {NONE}]
[object Token "60" - NUMBER - {NONE}]
```

## Defining procedures

Since we have all the tokens ready, it is time we can work on the parser, which is the part of the code that would make sense of the tokens. We have created already two stub methods to deal with `to` and `end`, that is, `execute_to()` and `execute_end()`. Before that we comment out the line in Interpreter we commented before for our tokenizer tests.

For future reuse we need to be able to hold a list of procedures so when we need to call one we can point the current index inside, very similar to how we did with the loops. In fact, it is almost the same idea, when finding a procedure we save the procedure details (name, arguments and current index) and we don't do anything with the rest of the procedure until we hit `end` (because we are not executing it).

When we find a procedure name we look up if we have that procedure and if we do retrieve the index for the first token inside and once we reach `end` return the index to the original calling position. This is the same in any programming language, from the BASIC GOSUB ("**GO** to **SUB**routine) to javascript, C or even Assembler. Let's start with defining the procedure when reaching `execute_to()`.

In the parser we declare and initialize a property for the procedures. We do it here because the procedures change from script to script so it won't make any sense to define `procedures` in the constructor as we only initialize the constructor once and later we call `parse()` every time.

```javascript
this.procedures = [];
```

when reaching `execute_to()` the two first properties that come to mind is the procedure name and the name of the arguments. In short, we will first put into a json object `to square :side`.

```javascript
execute_to() {
  console.log(`Starting: execute_to`);
  let procedure = {};
  this.getNextToken();
  if (this.currentToken.tokenType === tokenTypes.PROCEDURE_NAME) {
    procedure["name"] = this.currentToken.text;
    procedure["parameters"] = [];
  }
}
```

so far, nothing difficult. Note that in the `else` part we should probably do some error handling but we will leave it for now.

For the parameters (or arguments, I am never sure the best name for it) we do a loop until it can't find any more. In this case is simple because we have only one but the loop will help us when we try more than one parameter.

```javascript
execute_to() {
  console.log(`Starting: execute_to`);
  let procedure = {};
  this.getNextToken();
  if (this.currentToken.tokenType === tokenTypes.PROCEDURE_NAME) {
    procedure["name"] = this.currentToken.text;
    procedure["parameters"] = [];

    this.getNextToken();
    while (this.currentToken.tokenType === tokenTypes.VARIABLE) {
      procedure["parameters"].push(this.currentToken.text);
      this.getNextToken();
    }

    console.log(procedure);
  }
}
```

Nothing new, as it is similar to the while loops in tokenizer. My guess is that we will need to put back the last token as we did in tokenizer with the last character but we will see. In the logs we get:

```javascript
Uncaught TypeError: Cannot read property 'remainingLoops' of undefined
```

Great. This must be because we are reading the `repeat` token that is the next after the only parameter `:side` and when reaching the opening brackets in the loop, because we haven't defined the loop, it complains. However when we check the logs and try to find our procedure, we see

```javascript
{name: "square", parameters: Array(1)}
  name: "square"
  parameters: [":side"]
```

so the code we've done to define the procedure is correct, it is the last `getNextToken()` that messes this up. Before starting coding furiously a `putBackToken()` in the parser, let's take a step back ourselves. The error is because the code tries to run the contents of the procedure. But we don't want the procedure to be run at this moment, only stored for future use when called. Therefore we don't need to act on it, just to move to the `end` token and continue happily from there.

Also, as in the `repeat` loop (TODO Reference) we will store the index of the first token that has to be run when running the procedure. As such the whole code for `execute_to()` is:

```javascript
execute_to() {
  console.log(`Starting: execute_to`);
  let procedure = {};
  this.getNextToken();
  if (this.currentToken.tokenType === tokenTypes.PROCEDURE_NAME) {
    procedure["name"] = this.currentToken.text;
    procedure["parameters"] = [];

    this.getNextToken();
    while (this.currentToken.tokenType === tokenTypes.VARIABLE) {
      procedure["parameters"].push(this.currentToken.text);
      this.getNextToken();
    }

    procedure["firstTokenInsideProcedureIndex"] = this.currentTokenIndex;

    while (this.currentToken.primitive !== primitives.END) {
      this.getNextToken();
    }

    this.procedures.push(procedure);
    console.log(JSON.stringify(procedure));
  }
}
```

which will give us the right token as the first one inside (3) since our array starts with 0-index.

### Call me by your name

Really, I wanted to call this part "hey, I just defined you and this is crazy, but here's my procedure, so call me maybe" but it was way too long 😁.

Note that we haven't done any code yet for `execute_end()`. This is because we didn't run the code in the procedure, only define it. We will come back to this shortly. In the meantime, let's do the code for when we find a procedure name outside a procedure (which is when we call it).

When we find a procedure name outside of the procedure definition, first we need to check if it is in the procedures list. If it is, we find out how many parameters it has and therefore link the current value when invoking the procedure to the variable name. We may need to get the current position because it is the position we will come back once the procedure is called, like we would do in calling any function in javascript we go, we execute the function and return to the previous position when we call it and go on from there.

Let's catch the procedure name in the parsing loop. For that, since it is not a primitive we will do a new `else` statement. We will try to find out the parameters as well:

```javascript
else if (this.currentToken.tokenType === tokenTypes.PROCEDURE_NAME) {
let name = this.currentToken.text;
let searchProcedureResults = this.procedures.filter(procedure => {
  return procedure.name === name;
});
if (searchProcedureResults.length === 1) {
  let procedure = searchProcedureResults[0];
  console.log(`Found procedure ${procedure.name}`);

  procedure.parameters.forEach(parameter => {
    this.getNextToken();
    let value = this.currentToken.text;
    console.log(`Parameter: ${parameter} = ${value}`);
  });
}
```
we will get in the logs (among other things):

```javascript
Found procedure square
...
Parameter: :side = 60
```

The parameter is currently just text, not a number. The more I look at it the more familiar it gets, have I done this before? yes! when getting the parameter for my `fd`, `rt` and `repeat` primitives! as such we would just need to do for the parameters:

```javascript
procedure.parameters.forEach(parameter => {
  let value = this.getParameter();
  console.log(`Parameter: ${parameter} = ${value}`);
});
```

Now we need to codify this information about the procedure in some kind of object that will also hold the returning point (index) when finishing the procedure. Let's call it `procedureCallInformation` and make it a class property. So the information we need is the procedure name (actually we don't need it but it is helpful), the parameters and its values and the point where we are returning, together with the `firstTokenInsideProcedureIndex` that was already available in the `procedure` object. Therefore:

```javascript
} else if (this.currentToken.tokenType === tokenTypes.PROCEDURE_NAME) {
  let name = this.currentToken.text;
  let searchProcedureResults = this.procedures.filter(procedure => {
    return procedure.name === name;
  });
  if (searchProcedureResults.length === 1) {
    let procedure = searchProcedureResults[0];
    console.log(`Found procedure ${procedure.name}`);          

    let values = [];
    procedure.parameters.forEach(parameter => {
      let value = {
        parameterName: parameter,
        parameterValue: this.getParameter()
      };
      values.push(value);
    });

    this.procedureCallInformation = {
      name: procedure.name,
      parameters: values,
      currentTokenIndexBeforeCallingProcedure: this.currentTokenIndex
    };
    console.log(JSON.stringify(this.procedureCallInformation));
  }
}
```

In the logs I get (here I show only the relevant parts for this):

```javascript
...
	Current token: 11 - [object Token "end" - PRIMITIVE - {END}]
{"name":"square","parameters":[":side"],"firstTokenInsideProcedureIndex":3}
	Current token: 12 - [object Token "square" - PROCEDURE_NAME - {NONE}]
Found procedure square
	Current token: 13 - [object Token "60" - NUMBER - {NONE}]
{"name":"square","parameters":[{"parameterName":":side","parameterValue":60}],"currentTokenIndexBeforeCallingProcedure":13}
[object Token "to" - PRIMITIVE - {TO}]
...
```

We see that the `currentTokenIndexBeforeCallingProcedure` is not something after the token `60`, I would assume that I return to the token after that i.e. 14 isntead of 13. However there is no token 14, `60` is the last one and if we put 14 we would get an error. Also keeping the token 13 makes sense because in the next parsing step in the parsing loop we will find out that there is no token 13 + 1 = 14 and stop the program. Perhaps `procedureCallLastTokenIndex` would make more sense because 13 is the last token of the procedure call `square 60`, so we will do that.

Now that the procedure call is defined, we just need to point the current index to the first item inside the procedure call. Really? no, it should be the one before that, the last token index of the procedure definition (TODO check if better call it definition or signature https://developer.mozilla.org/en-US/docs/Glossary/Signature/Function#:~:text=A%20function%20signature%20(or%20type,a%20return%20value%20and%20type), because in the next parsing step we are going to do `getNextToken()` and we will dive into the first token inside the procedure.

Before I move the index there, I need to fix what's going on when we reach the `end` primitive. If I don't do anything we will get an infinite loop because after we run what's inside the procedure we will call again `square 60` that will trigger again moving inside the procedure and so on. So the minimum we can do is when we reach `end` we move the index back to `procedureCallLastTokenIndex` and hope that it works the first time.

First, the final version of the `else if` for procedures in the parsing loop:

```javascript
else if (this.currentToken.tokenType === tokenTypes.PROCEDURE_NAME) {
  let name = this.currentToken.text;
  let searchProcedureResults = this.procedures.filter(procedure => {
    return procedure.name === name;
  });
  if (searchProcedureResults.length === 1) {
    let procedure = searchProcedureResults[0];
    console.log(`Found procedure ${procedure.name}`);

    let values = [];
    procedure.parameters.forEach(parameter => {
      let value = {
        parameterName: parameter,
        parameterValue: this.getParameter()
      };
      values.push(value);
    });

    this.procedureCallInformation = {
      name: procedure.name,
      parameters: values,
      procedureCallLastTokenIndex: this.currentTokenIndex
    };
    this.currentTokenIndex = procedure.firstTokenInsideProcedureIndex - 1;
    console.log(JSON.stringify(this.procedureCallInformation));
  }
}
```

Followed by something in `execute_end()` to get back to where I was:

```javascript
execute_end() {
  console.log(`Starting: execute_end`);
  let index = this.procedureCallInformation.procedureCallLastTokenIndex;
  this.currentTokenIndex = index;
  }
```

We run it and... not much, just the turtle "looking" in 4 directions but without moving. I realized that I missed the code to assign the value of the parameter `:side` so when we do in the procedure `fd :side` the parser doesn't know right now what to do so it won't do anything with `fd` and just rotate to the right 4 times because that's what's inside the `repeat` primitive that the parser can understand.

Where do we assign the variable? there is a place we cal to get the parameter for `repeat`, `fd` and `rt` in the code and that's `getParameter()`. We can extend that to get the value of the variable. So now we have:

```javascript
getParameter() {
  this.getNextToken();
  if (this.currentToken.tokenType === tokenTypes.NUMBER) {
    return parseInt(this.currentToken.text);
  }
}
```

and we check only if the token is a number. we will check now as well if it is a variable and get the information from `procedureCallInformation` to see the value

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

Without any error handling, as usual. With this when we run it we succeed and we can finally see or square again!

![Square drawm from procedure](/img/part9_square_from_procedure.gif)