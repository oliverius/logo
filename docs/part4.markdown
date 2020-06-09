---
layout: page
title: Part 4
permalink: /part4/
---
# Palate cleanser, some refactoring before playing with the turtle
So in the last part we managed to tokenize a expression like this: `repeat 4 [ fd 60 rt 90 ]` and parse it, even if it is only with console.log.
Today we are going to do some refactoring before moving on with the turtle graphics.
I am trying to redo the project for this article with the same order of events that I created it, however in my original project I was so eager to see the turtle in the screen that I created the `canvas` for the graphics very early on and didn't refactor until later. That didn't help much because it created some expectations in what I was doing and set me back a few days (after all, I code only when I have free time and that's not much). So let's get this refactoring out of the way before we go and see how my turtle looks like!.

Also I will post the code so far at the end of this post because refactoring can get messy and it is difficult to follow up all the little changes.

## Refactor to get the parameter for different primitives
`repeat` requires a further numeric parameter. `fd` as well. And `rt` the same. It will make sense that the code and checks we did in `execute_repeat` can be done separately and we call `execute_repeat`, `execute_forward` and `execute_right` with a parameter. As such:

```javascript
getParameter() {
  this.getNextToken();
  if (this.currentToken.tokenType === tokenTypes.NUMBER) {
    return parseInt(this.currentToken.text);
  }
}
```

And the change in the `switch` in `parse`, which makes it more intuitive to read:

```javascript
switch (this.currentToken.primitive) {
  case primitives.FORWARD:
    this.execute_forward(this.getParameter());
    break;
  case primitives.RIGHT:
    this.execute_right(this.getParameter());
    break;
  case primitives.REPEAT:
    this.execute_repeat(this.getParameter());
    break;
}
```

This (together with the change in the methods that I will show at the end), makes the log more intuitive because we can see that after reading two tokens we execute those two together; with some extra logging, this is what I get:

```javascript
	Current token: 0 - [object Token "repeat" - PRIMITIVE - {repeat}]
	Current token: 1 - [object Token "4" - NUMBER - {}]
Starting: execute_repeat 4
	Current token: 2 - [object Token "[" - DELIMITER - {}]
{startTokenIndex: 2, remainingLoops: 4}
	Current token: 3 - [object Token "fd" - PRIMITIVE - {fd}]
	Current token: 4 - [object Token "60" - NUMBER - {}]
Starting: execute_forward 60
	Current token: 5 - [object Token "rt" - PRIMITIVE - {rt}]
	Current token: 6 - [object Token "90" - NUMBER - {}]
Starting: execute_right 90
	Current token: 7 - [object Token "]" - DELIMITER - {}]
Remaining loops: 3
	Current token: 3 - [object Token "fd" - PRIMITIVE - {fd}]
	Current token: 4 - [object Token "60" - NUMBER - {}]
Starting: execute_forward 60
	Current token: 5 - [object Token "rt" - PRIMITIVE - {rt}]
	Current token: 6 - [object Token "90" - NUMBER - {}]
Starting: execute_right 90
	Current token: 7 - [object Token "]" - DELIMITER - {}]
Remaining loops: 2
	Current token: 3 - [object Token "fd" - PRIMITIVE - {fd}]
	Current token: 4 - [object Token "60" - NUMBER - {}]
Starting: execute_forward 60
	Current token: 5 - [object Token "rt" - PRIMITIVE - {rt}]
	Current token: 6 - [object Token "90" - NUMBER - {}]
Starting: execute_right 90
	Current token: 7 - [object Token "]" - DELIMITER - {}]
Remaining loops: 1
	Current token: 3 - [object Token "fd" - PRIMITIVE - {fd}]
	Current token: 4 - [object Token "60" - NUMBER - {}]
Starting: execute_forward 60
	Current token: 5 - [object Token "rt" - PRIMITIVE - {rt}]
	Current token: 6 - [object Token "90" - NUMBER - {}]
Starting: execute_right 90
	Current token: 7 - [object Token "]" - DELIMITER - {}]
Remaining loops: 0
Loop has finished
```

which is it infinitely easier to read. I wish I spent more time doing it like this before. This will also help us when we try nested loops, so we can see what's going on at a glance.

## Repeat should have two methods, begin and end
I want to keep the logic for `repeat` out of the parsing loop, so I had `execute_repeat` and the logic when closing the loop directly in the parsing loop. I will rename `execute_repeat` to `execute_repeat_begin` and the logic for `]` to `execute_repeat_end`. At this point in time we don't need to do anything else, we will refactor more when we do multiple loops and later with the control flow primitive `if`.

## Tokenizer as a class
It is becoming obvious that it is easier to deal with classes, although having to use `this.` with everything is killing me as I am not used to it in C# where I come from.
So the tokenizer has been refactored to be a class, not a function. This will help when we implement the proper tokenizer and not the simple one we have now (the one I called poor man's tokenizer).
I was also not happy having the tokenizer receiving a DOM element (the editor) because in my opinion the tokenizer needs to receive only text and spits out tokens, that's all. So I moved out the editor reference outside. As such, we won't need a constructor for tokenizer and we will pass the text to the `tokenize` method instead.
The code outside the classes is now:

```javascript
const editor = document.getElementById('myTextarea');
const tokenizer = new Tokenizer();
let tokens = tokenizer.tokenize(editor.value);
const parser = new Parser();
parser.parse(tokens);
```

The use of `const` or `let` is on purpose. Objects that in real life won't change have `const`. However I expect the tokens to change with every script you do, so I am using `let` for the tokens.
And since we are at it, wouldn't it be nice to have a class `interpreter` that ties together the editor, the tokenizer and the parser (and in the future the canvas for graphics)?

```javascript
class Interpreter {
  constructor(editorId) {
    this.editor = document.getElementById(editorId);
    this.tokenizer = new Tokenizer();
    this.parser = new Parser();
  }
  run() {
    console.log("[Interpreter] Starting: run");
    let script = this.editor.value;
    let tokens = this.tokenizer.tokenize(script);
    this.parser.parse(tokens);
  }
}
const interpreter = new Interpreter('myTextarea');
interpreter.run();
```

I created the method `run` because I want people to run different scripts when pressing a button `run` or `play` in the UI. So now only the interpreter knows about the DOM elements (editor for now), the tokenizer only knows about text and the parser only knows how to move back and forth in a stream of tokens.

## Internal representation of a primitive
The internal representation of a primitive so far is:

```javascript
const primitives = {
  FORWARD: "fd",
  RIGHT: "rt",
  REPEAT: "repeat"
}
```

I was never very happy with this, because I don't like mixing the internal representation of the primitive with how it will look in the outside. You may ask, so what about the delimiters? Delimiters are different because the representation doesn't change, an opening bracket will always look like an opening bracket.

But for example `fd`. This can be shown as `fd` or `forward` or even `FoRwArD` if we are inclined. And what about when we deal with other languages? In Spanish it would be `av` and `avanza`. So I am inclined to create another enum for the internal representation similar to what we did with the token types. As such:

```javascript
const primitives = {
  NONE: 0,
  FORWARD: 1,
  RIGHT: 2,
  REPEAT: 3
};
```

But we need to find a way to identify the primitives by the tokenizer or it won't have a clue what primitive to assign when it finds one.
We can either hardcode the primitive list in the tokenizer (quick and dirty) or since we have a few enums we can pass the list of primitive representations to the tokenizer and it will know what to do with them, so we can pass different set of primitive representations for English than we do later for Spanish.

Since we can have more than one way of saying "forward" without taking into account the case, `fd` and `forward`, we will call them "aliases".

```javascript
const primitiveAliases = [
  {
    primitive: primitives.FORWARD,
    aliases: ["forward", "fd"]
  },
  {
    primitive: primitives.RIGHT,
    aliases: ["right", "rt"]
  },
  {
    primitive: primitives.REPEAT,
    aliases: ["repeat"]
  }
];
```

Remember, we can have references in one of our enums (e.g. primitives) from another one, as long as we don't have circular references. We add the parameter to the interpreter, and we pass it to the tokenizer:

```javascript
constructor(editorId, aliases) {
  this.editor = document.getElementById(editorId);
  this.tokenizer = new Tokenizer(aliases);
  this.parser = new Parser();
```

and

```javascript
const interpreter = new Interpreter('myTextarea', primitiveAliases);
interpreter.run();
```

## Let's build a dictionary
In the tokenizer, let's try this and see the values:

```javascript
constructor(primitiveAliases) {
  this.aliases = this.populatePrimitiveAliasesDictionary(primitiveAliases);
}
populatePrimitiveAliasesDictionary(primitiveAliases = []) {    
  primitiveAliases.forEach(item => {    
    item.aliases.forEach(alias => {
      console.log(item.primitive, alias);
    });
  });
}
```

Luckily we get the values we were expecting in the console:
```javascript
1 "forward"
1 "fd"
2 "right"
2 "rt"
3 "repeat"
```

So we just need to convert this into a dictionary, and as such:
```javascript
populatePrimitiveAliasesDictionary(primitiveAliases = []) { 
  let dictionary = {};   
  primitiveAliases.forEach(item => {
    item.aliases.forEach(alias => {
      dictionary[alias] = item.primitive;
    });
  });
  console.log(JSON.stringify(dictionary));
}
```

I strinified the results of the dictionary just to see how it looks like:
```javascript
{
  "forward":1,
  "fd":1,
  "right":2,
  "rt":2,
  "repeat":3
}
```

and you may think: why we don't do the `primitiveAliases` directly like this, instead of in the current format? The reason is that this is good for a dictionary but it is not so human-friendly to read. The current `primitiveAliases` puts the emphasis on the primitive and it is easier to see how many aliases each primitive has. Here the meaning of "alias" is lost.

The next step is to implement the dictionary in the `isPrimitive` method. At this point it is easier to make it a method than to keep it as a fat arrow function, mostly because we need to have access to `this` that contains the dictionary. Also now we need to return the primitive (before it was easier because it was the token text but now it is an enum), so we will rename `isPrimitive` to `getPrimitive`. If it can't find any, it will return `NONE`.

```javascript
getPrimitive(tokenText) {
  return this.aliases[tokenText.toLowerCase()] ?? primitives.NONE;
};
```

If the value in the dictionary is not found (at the end of the day it is just a json object where we can't find the key), that returns `undefined`. We want to return the value `NONE` instead so we use the new operator `??` which you may know already when dealing with nulls in C#. So our `else if` becomes just an `else`:

```javascript
else {
  let primitive = this.getPrimitive(tokenText);
  if (primitive !== primitives.NONE) {
    tokens.push(new Token(tokenText, tokenTypes.PRIMITIVE, tokenText.toLowerCase()));
  } else {
    console.log(`${tokenText} is not a primitive!`);
  }
}
```

I am leaving here room for checking some text that is not a primitive, because in the future that would be a procedure name but... still a while until we reach that 😊
The last part would be to store the primitive (internal value) instead of the token text in the `Token`. The final code for all the project is below, see you in part 5.

```javascript
const delimiters = {
  OPENING_BRACKET: "[",
  CLOSING_BRACKET: "]"
};

const primitives = {
  NONE: 0,
  FORWARD: 1,
  RIGHT: 2,
  REPEAT: 3
};

const primitiveAliases = [
  {
    primitive: primitives.FORWARD,
    aliases: ["forward", "fd"]
  },
  {
    primitive: primitives.RIGHT,
    aliases: ["right", "rt"]
  },
  {
    primitive: primitives.REPEAT,
    aliases: ["repeat"]
  }
];

const tokenTypes = {
  NONE: 0,
  DELIMITER: 1,
  NUMBER: 2,
  PRIMITIVE: 3
};

class Interpreter {
  constructor(editorId, aliases) {
    this.editor = document.getElementById(editorId);
    this.tokenizer = new Tokenizer(aliases);
    this.parser = new Parser();
  }
  run() {
    console.log("[Interpreter] Starting: run");
    let script = this.editor.value;
    let tokens = this.tokenizer.tokenize(script);
    this.parser.parse(tokens);
  }
}
class Parser {
  execute_forward(n = 0) {
    console.log(`Starting: execute_forward ${n}`);
  }
  execute_repeat_end() {
    console.log(`Starting: execute_repeat_end`);
    this.loop.remainingLoops--;
    console.log(`Remaining loops: ${this.loop.remainingLoops}`);
    if (this.loop.remainingLoops > 0) {
      this.currentTokenIndex = this.loop.startTokenIndex;
    } else {
      console.log("Loop has finished");
    }
  }
  execute_repeat_begin(n = 0) {
    console.log(`Starting: execute_repeat_begin ${n}`);
    this.getNextToken();
    if (this.currentToken.tokenType === tokenTypes.DELIMITER &&
      this.currentToken.text === delimiters.OPENING_BRACKET) {
      this.loop = {
        startTokenIndex: this.currentTokenIndex,
        remainingLoops: n
      };
    }
  }
  execute_right(n = 0) {
    console.log(`Starting: execute_right ${n}`);
  }
  getNextToken() {
    this.currentTokenIndex++;
    if (this.currentTokenIndex <= this.lastTokenIndex) {
      this.currentToken = this.tokens[this.currentTokenIndex];
      console.log(`\tCurrent token: ${this.currentTokenIndex} - ${this.currentToken}`);
    }
  }
  getParameter() {
    this.getNextToken();
    if (this.currentToken.tokenType === tokenTypes.NUMBER) {
      return parseInt(this.currentToken.text);
    }
  }
  parse(tokens) {
    console.log(`Starting: parse`);
    this.tokens = tokens;
    this.currentToken = {};
    this.currentTokenIndex = -1;
    this.lastTokenIndex = tokens.length - 1;
    this.loop = {};
    do {
      this.getNextToken();
      if (this.currentToken.tokenType === tokenTypes.PRIMITIVE) {
        switch (this.currentToken.primitive) {
          case primitives.FORWARD:
            this.execute_forward(this.getParameter());
            break;
          case primitives.RIGHT:
            this.execute_right(this.getParameter());
            break;
          case primitives.REPEAT:
            this.execute_repeat_begin(this.getParameter());
            break;
        }
      } else if (this.currentToken.tokenType === tokenTypes.DELIMITER) {
        if (this.currentToken.text === delimiters.CLOSING_BRACKET) {
          this.execute_repeat_end();
        }
      }
    } while (this.currentTokenIndex < this.lastTokenIndex)
  }
}

class Token {
  constructor (text = "", tokenType = tokenTypes.NONE, primitive = primitives.NONE) {
    this.text = text;
    this.tokenType = tokenType;
    this.primitive = primitive;
  }
  getKey = (value, jsonObject) => Object.keys(jsonObject).find(key => jsonObject[key] === value);
  get[Symbol.toStringTag]() {
    let tokenTypeKey = this.getKey(this.tokenType, tokenTypes);
    let primitiveKey = this.getKey(this.primitive, primitives);
    return `Token "${this.text}" - ${tokenTypeKey} - {${primitiveKey}}`;
  }
}

class Tokenizer {
  constructor(primitiveAliases) {
    this.aliases = this.populatePrimitiveAliasesDictionary(primitiveAliases);
  }
  getPrimitive(tokenText) {
    return this.aliases[tokenText.toLowerCase()] ?? primitives.NONE;
  };
  isNumber = (tokenText) => /^\d+$/.test(tokenText);
  isDelimiter = (tokenText) => {
    return tokenText === delimiters.OPENING_BRACKET ||
      tokenText === delimiters.CLOSING_BRACKET;
  }
  populatePrimitiveAliasesDictionary(primitiveAliases = []) { 
    let dictionary = {};   
    primitiveAliases.forEach(item => {
      item.aliases.forEach(alias => {
        dictionary[alias] = item.primitive;
      });
    });
    return dictionary;
  }
  tokenize(script = "") {
    let tokenTexts = script.split(' ');
    let tokens = [];
    tokenTexts.forEach(tokenText => {
      if (this.isNumber(tokenText)) {
        tokens.push(new Token(tokenText, tokenTypes.NUMBER));
      } else if (this.isDelimiter(tokenText)) {
        tokens.push(new Token(tokenText, tokenTypes.DELIMITER));
      } else {
        let primitive = this.getPrimitive(tokenText);
        if (primitive !== primitives.NONE) {
          tokens.push(new Token(tokenText, tokenTypes.PRIMITIVE, primitive));
        } else {
          console.log(`${tokenText} is not a primitive!`);
        }
      }
    });
    return tokens;
  }
}
const interpreter = new Interpreter('myTextarea', primitiveAliases);
interpreter.run();
```
