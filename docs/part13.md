---
layout: page
title: [13]
permalink: /part13/
---
## Goodbye to the turtle in the parser

In the [previous part](/logo/part12) we created some tests and incorporated them in the interpreter because we weren't using any testing framework so the easiest way was to add the test to the instance of the interpreter. We commented how we had to hack the parser to avoid the canvas for the turtle not being defined and erroring. We will try to find a way to get the turtle out and incidentally be able to test the parser in action, not only the expressions.

We want to decouple the turtle and the parser, so when we do parser tests we don't need to hack the parser as we did before to run it.

The turtle in parser was already refactored before and all the calls are in the `draw()` method. The `draw()` is then called by any corresponding primitive in the `parsingStep()`. The way we are going to do is, for me, the simplest one in a case like this. We are going to ask the parser to emit events and the interpreter will read the events and call the turtle to do the drawing. We could add the event listener in the turtle itself but I want to keep my turtle as dumb as possible only concern with drawing graphics. The interpreter is the one that should know about the tokenizer, the parser and now the turtle.

Let's start with renaming the calls to `draw()` inside `parsingStep()` as `raiseTurtleDrawingEvent()` because we are raising an event and it has to do with drawing with the turtle (if you think I came up with this obvious name at first you are wrong, this is probably the third different name for the event because at the beginning I didn't really know if I wanted the event to be a `parsingEvent()` for everything or just for the turtle to draw). Now I know, so I will save you the time.

So the `switch` in `parsingStep()` becomes:

```javascript
switch (this.currentToken.primitive) {
  case primitives.FORWARD:
    this.raiseTurtleDrawingEvent(primitives.FORWARD, this.getExpression());
    break;
  case primitives.RIGHT:
    this.raiseTurtleDrawingEvent(primitives.RIGHT, this.getExpression());
    break;
  case primitives.REPEAT:
    this.execute_repeat_begin(this.getExpression());
    break;
  case primitives.CLEARSCREEN:
    this.raiseTurtleDrawingEvent(primitives.CLEARSCREEN);
    break;
  case primitives.BACK:
    this.raiseTurtleDrawingEvent(primitives.BACK, this.getExpression());
    break;
  case primitives.LEFT:
    this.raiseTurtleDrawingEvent(primitives.LEFT, this.getExpression());
    break;
  case primitives.PENDOWN:
    this.raiseTurtleDrawingEvent(primitives.PENDOWN);
    break;
  case primitives.PENUP:
    this.raiseTurtleDrawingEvent(primitives.PENUP);
    break;
  case primitives.TO:
    this.execute_to();
    break;
  case primitives.END:
    this.execute_end();
    break;
}
```

Before we delete `draw()`, our `raiseTurtleDrawingEvent` will be very simple:

```javascript
raiseTurtleDrawingEvent(primitive = primitives.NONE, arg = 0) {
  let event = new CustomEvent("PARSER_TURTLE_DRAWING_EVENT", {
    bubbles: false,
    detail: {
      primitive: primitive,
      arg: arg
    }
  });
  window.dispatchEvent(event);
}
```

We needed to have the name of our [custom event](https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events) and since this is for me a constant I tend to honour the tradition and put everything in capital letters. Because we don't have this event attached to any element in the screen (well, technically it could be attached to the canvas where the turtle draws but we don't want to have a dependency between the parser and an element in the DOM (the canvas), we want the parser to be as "free spirit" as possible.

And now we get rid of the turtle in the parser constructor. But wait!, since this is the only thing in the parser constructor we can get rid of the constructor altogether!! In the interpreter instead of

```javascript
this.parser = new Parser(this.canvas);
```

we will have

```javascript
this.turtle = new Turtle(this.canvas);
this.parser = new Parser();
```

We move the method `draw()` from parser to the interpreter, but we are still not calling it, we need to add an event listener in the interpreter. We will do it also at the end of the interpreter constructor. Since we don't want to lose the context for `this` I will use the fat arrows.

```javascript
window.addEventListener("PARSER_TURTLE_DRAWING_EVENT", e => this.draw(e.detail.primitive, e.detail.arg));
```

where it is really clear what the event listener is doing. If we run it, because we are still having the spiral example we will be able to see the spiral again.

One thing that is really bugging me is that I don't want to have [magic strings](https://softwareengineering.stackexchange.com/questions/365339/what-is-wrong-with-magic-strings) in the code and suddenly `PARSER_TURTLE_DRAWING_EVENT` appears twice, once in the parser and again in the interpreter.

I can create a `const` for this, but since I have more constants already (delimiter, primitives, primitive aliases and token types) I am wondering if it is not better to consolidate them all in one json (we won't do it here but that's part of the final version of the code). We will do here only `PARSER_TURTLE_DRAWING_EVENT`.

Because my program is called "Logo" that's how I will call the constant. I have a few classes, it makes sense that each of them will have a section in the "logo" object but since we are going to do only one for `PARSER_TURTLE_DRAWING_EVENT` and this is created in the parser, let's create the entry for parser in "logo":

```javascript
const logo = {
  parser: {
    turtleDrawingEvent: {
      name: "PARSER_TURTLE_DRAWING_EVENT"
    }
  }
};
```

which is very much explicit. I avoided creating an entry called "turtleDrawingEventName" because it feels more natural (at least to me!!!) to keep "name" as a property. Also this can help us if we define some other property for `turtleDrawingEvent` (we won't, but we will for other events so this will help us defining all the events the same way).

As such my code in the interpreter changes to

```javascript
window.addEventListener(logo.parser.turtleDrawingEvent.name, e => this.draw(e.detail.primitive, e.detail.arg));
```

and in the parser inside `raiseTurtleDrawingEvent`:

```javascript
let event = new CustomEvent(logo.parser.turtleDrawingEvent.name, {
  bubbles: false,
  detail: {
    primitive: primitive,
    arg: arg
  }
});
```
## Refactor the constants (and everything else)
Just to make sure, let me recap all the different `const` that we have in the code so far:
* logo
* delimiters
* primitives
* primitiveAliases
* tokenTypes


We can see clearly that in the near future we would refactor all these `const` to be under the umbrella of the logo `const` as it looks a lot neater. Did I say in the near future? the future is now!

If you want to move to the [next part](/logo/part14) this is the time. The code below is just a dump of all the javascript so far but with the constants all under "logo". There are a lot of small refactorings everywhere so I thought it would be easier to put them all together and we will move on from this.

Note that the only `const` I didn't add to "logo" was `primitiveAliases`. This is because in their definition they use the json for `primitives` and they couldn't be added in the same json object, but we will find a way in the future to do it.

```javascript
const logo = {
  tokenizer: {
    delimiters: {
      OPENING_BRACKET: "[",
      CLOSING_BRACKET: "]",
      PLUS: "+",
      MINUS: "-",
      MULTIPLIEDBY: "*",
      DIVIDEDBY: "/"
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
      END: 10
    },
    tokenTypes: {
      NONE: 0,
      DELIMITER: 1,
      NUMBER: 2,
      PRIMITIVE: 3,
      VARIABLE: 4,
      PROCEDURE_NAME: 5
    }
  },
  parser: {
    turtleDrawingEvent: {
      name: "PARSER_TURTLE_DRAWING_EVENT"
    }
  }
};

const primitiveAliases = [
  {
    primitive: logo.tokenizer.primitives.FORWARD,
    aliases: ["forward", "fd"]
  },
  {
    primitive: logo.tokenizer.primitives.RIGHT,
    aliases: ["right", "rt"]
  },
  {
    primitive: logo.tokenizer.primitives.REPEAT,
    aliases: ["repeat"]
  },
  {
    primitive: logo.tokenizer.primitives.CLEARSCREEN,
    aliases: ["clearscreen", "cs"]
  },
  {
    primitive: logo.tokenizer.primitives.BACK,
    aliases: ["back", "bk"]
  },
  {
    primitive: logo.tokenizer.primitives.LEFT,
    aliases: ["left", "lt"]
  },
  {
    primitive: logo.tokenizer.primitives.PENUP,
    aliases: ["penup", "pu"]
  },
  {
    primitive: logo.tokenizer.primitives.PENDOWN,
    aliases: ["pendown", "pd"]
  },
  {
    primitive: logo.tokenizer.primitives.TO,
    aliases: ["to"]
  },
  {
    primitive: logo.tokenizer.primitives.END,
    aliases: ["end"]
  }
];

class Interpreter {
  constructor(editorId, canvasId, aliases) {
    this.editor = document.getElementById(editorId);
    this.canvas = document.getElementById(canvasId);
    this.tokenizer = new Tokenizer(aliases);
    this.turtle = new Turtle(this.canvas);
    this.parser = new Parser();
    if (runTokenizerTests(this.tokenizer) && runParserTests(this.tokenizer, this.parser)) {
      console.log("All tests PASSED");
    } else {
      console.log("Please check the logs, some tests didn't pass");
    }
    window.addEventListener(logo.parser.turtleDrawingEvent.name, e => this.draw(e.detail.primitive, e.detail.arg));
  }
  draw(primitive = logo.tokenizer.primitives.NONE, parameter = 0) {   
    console.log("*");
    switch (primitive) {
      case logo.tokenizer.primitives.FORWARD:
        this.turtle.execute_forward(parameter);
        break;
      case logo.tokenizer.primitives.RIGHT:
        this.turtle.execute_right(parameter);
        break;
      case logo.tokenizer.primitives.CLEARSCREEN:
        this.turtle.execute_clearscreen();
        break;
      case logo.tokenizer.primitives.BACK:
        this.turtle.execute_back(parameter);
        break;
      case logo.tokenizer.primitives.LEFT:
        this.turtle.execute_left(parameter);
        break;
      case logo.tokenizer.primitives.PENUP:
        this.turtle.execute_penup();
        break;
      case logo.tokenizer.primitives.PENDOWN:
        this.turtle.execute_pendown();
        break;
    }
  }
  run() {
    console.log("[Interpreter] Starting: run");
    let script = this.editor.value;
    let tokens = this.tokenizer.tokenize(script);
    this.parser.parse(tokens);
    tokens.forEach(token => console.log(token.toString()));
  }
  stop() {
    this.parser.stopParsingRequested = true;
  }
}

class Parser {
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
  execute_to() {
    console.log(`Starting: execute_to`);
    let procedure = {};
    this.getNextToken();
    if (this.currentToken.tokenType === logo.tokenizer.tokenTypes.PROCEDURE_NAME) {
      procedure["name"] = this.currentToken.text;
      procedure["parameters"] = [];

      this.getNextToken();
      while (this.currentToken.tokenType === logo.tokenizer.tokenTypes.VARIABLE) {
        procedure["parameters"].push(this.currentToken.text);
        this.getNextToken();
      }

      procedure["firstTokenInsideProcedureIndex"] = this.currentTokenIndex;

      while (this.currentToken.primitive !== logo.tokenizer.primitives.END) {
        this.getNextToken();
      }

      this.procedures.push(procedure);
      console.log(JSON.stringify(procedure));
    }
  }
  execute_end() {
    console.log(`Starting: execute_end`);
    let index = this.procedureCallInformation.procedureCallLastTokenIndex;
    this.currentTokenIndex = index;
  }
  getExpression() {
    let result = {
      value: 0
    };

    this.getNextToken();
    this.getExpression_AdditionOrSubtraction(result);
    this.putBackToken();

    return result.value;
  }
  getExpression_AdditionOrSubtraction(result) {
    console.log("getExpression_AdditionOrSubtraction", result);
    
    let operation = "";
    this.getExpression_MultiplicationOrDivision(result);
    while (this.currentToken.text === logo.tokenizer.delimiters.PLUS ||
      this.currentToken.text === logo.tokenizer.delimiters.MINUS) {
        operation = this.currentToken.text;
        this.getNextToken();
        let hold = {
          value: 0
        };
        this.getExpression_MultiplicationOrDivision(hold);
        console.log("Hold value: ", hold);
        this.getExpression_ApplyArithmeticOperation(operation, result, hold);
    }
  }
  getExpression_MultiplicationOrDivision(result) {
    console.log("getExpression_MultiplicationOrDivision", result);
    let operation = "";
    this.getExpression_Value(result);
    this.getNextToken();
    while (this.currentToken.text === logo.tokenizer.delimiters.MULTIPLIEDBY ||
      this.currentToken.text === logo.tokenizer.delimiters.DIVIDEDBY) {
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
  getExpression_ApplyArithmeticOperation(operation, result, hold) {
    console.log(`${result.value} ${operation} ${hold.value}`);
    switch(operation) {
      case logo.tokenizer.delimiters.PLUS:
        result.value += hold.value;
        break;
      case logo.tokenizer.delimiters.MINUS:
        result.value -= hold.value;
        break;
      case logo.tokenizer.delimiters.MULTIPLIEDBY:
        result.value *= hold.value;
        break;
      case logo.tokenizer.delimiters.DIVIDEDBY:
        result.value /= hold.value;
        break;
    }
  }
  getExpression_Value(result) {
    console.log("my current token", this.currentToken);
    switch (this.currentToken.tokenType) {
      case logo.tokenizer.tokenTypes.NUMBER:
        result.value = parseInt(this.currentToken.text);
        break;
      case logo.tokenizer.tokenTypes.VARIABLE:
        let variableName = this.currentToken.text;
        let parameter = this.procedureCallInformation.parameters
          .find(p => p.parameterName === variableName);
        result.value = parseInt(parameter.parameterValue);
        break;
    }
    console.log(`getExpression_Value -> ${result.value}`);
  }
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
    this.loopStack = [];
    this.procedures = [];
    this.stopParsingRequested = false;
    this.startClock();
  }
  parsingStep() {
    this.getNextToken();
      if (this.currentToken.tokenType === logo.tokenizer.tokenTypes.PRIMITIVE) {
        switch (this.currentToken.primitive) {
          case logo.tokenizer.primitives.FORWARD:
            this.raiseTurtleDrawingEvent(logo.tokenizer.primitives.FORWARD, this.getExpression());
            break;
          case logo.tokenizer.primitives.RIGHT:
            this.raiseTurtleDrawingEvent(logo.tokenizer.primitives.RIGHT, this.getExpression());
            break;
          case logo.tokenizer.primitives.REPEAT:
            this.execute_repeat_begin(this.getExpression());
            break;
          case logo.tokenizer.primitives.CLEARSCREEN:
            this.raiseTurtleDrawingEvent(logo.tokenizer.primitives.CLEARSCREEN);
            break;
          case logo.tokenizer.primitives.BACK:
            this.raiseTurtleDrawingEvent(logo.tokenizer.primitives.BACK, this.getExpression());
            break;
          case logo.tokenizer.primitives.LEFT:
            this.raiseTurtleDrawingEvent(logo.tokenizer.primitives.LEFT, this.getExpression());
            break;
          case logo.tokenizer.primitives.PENDOWN:
            this.raiseTurtleDrawingEvent(logo.tokenizer.primitives.PENDOWN);
            break;
          case logo.tokenizer.primitives.PENUP:
            this.raiseTurtleDrawingEvent(logo.tokenizer.primitives.PENUP);
            break;
          case logo.tokenizer.primitives.TO:
            this.execute_to();
            break;
          case logo.tokenizer.primitives.END:
            this.execute_end();
            break;
        }
      } else if (this.currentToken.tokenType === logo.tokenizer.tokenTypes.DELIMITER) {
        if (this.currentToken.text === logo.tokenizer.delimiters.CLOSING_BRACKET) {
          this.execute_repeat_end();
        }
      } else if (this.currentToken.tokenType === logo.tokenizer.tokenTypes.PROCEDURE_NAME) {
          this.jumpToProcedure(this.currentToken.text);
      }
  }
  putBackToken() {
    this.currentTokenIndex--;
    this.currentToken = this.tokens[this.currentTokenIndex];
  }
  raiseTurtleDrawingEvent(primitive = logo.tokenizer.primitives.NONE, arg = 0) {
    let event = new CustomEvent(logo.parser.turtleDrawingEvent.name, {
      bubbles: false,
      detail: {
        primitive: primitive,
        arg: arg
      }
    });
    window.dispatchEvent(event);
  }
  jumpToProcedure(name = "") {
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
          parameterValue: this.getExpression()
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
  startClock() {
    this.clock = setInterval(() => {
      if (this.currentTokenIndex < this.lastTokenIndex && !this.stopParsingRequested) {
        this.parsingStep();
      } else {
        this.stopClock();
      }
    }, 500);
  }
  stopClock() {
    clearInterval(this.clock);
  }
}

class Token {
  constructor (
    text = "",
    tokenType = logo.tokenizer.tokenTypes.NONE,
    primitive = logo.tokenizer.primitives.NONE) {
    this.text = text;
    this.tokenType = tokenType;
    this.primitive = primitive;
  }
  getKey = (value, jsonObject) => Object.keys(jsonObject).find(key => jsonObject[key] === value);
  get[Symbol.toStringTag]() {
    let tokenTypeKey = this.getKey(this.tokenType, logo.tokenizer.tokenTypes);
    let primitiveKey = this.getKey(this.primitive, logo.tokenizer.primitives);
    return `Token "${this.text}" - ${tokenTypeKey} - {${primitiveKey}}`;
  }
}
class Tokenizer {
  NUL = '\0';
  VARIABLE_PREFIX = ":";
  constructor(primitiveAliases) {
    this.aliases = this.populatePrimitiveAliasesDictionary(primitiveAliases);
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
  getNextCharacter() {
    this.currentIndex++;
    if (this.currentIndex <= this.lastCharacterIndex) {
      this.currentCharacter = this.script[this.currentIndex];
    } else {
      this.currentCharacter = this.NUL;
    }
  }
  getPrimitive(tokenText) {
    return this.aliases[tokenText.toLowerCase()] ?? logo.tokenizer.primitives.NONE;
  };
  isDelimiter(c) {
    return c === logo.tokenizer.delimiters.OPENING_BRACKET ||
      c === logo.tokenizer.delimiters.CLOSING_BRACKET ||
      c === logo.tokenizer.delimiters.PLUS ||
      c === logo.tokenizer.delimiters.MINUS ||
      c === logo.tokenizer.delimiters.MULTIPLIEDBY ||
      c === logo.tokenizer.delimiters.DIVIDEDBY;
  }
  isLetter(c) {
    return "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".indexOf(c) !== -1;
  }
  isNumber(c) {
    return "0123456789".indexOf(c) !== -1;
  }
  isVariablePrefix(c) {
    return c === this.VARIABLE_PREFIX;
  }
  putbackCharacter() {
    this.currentIndex--;
    this.currentCharacter = this.script[this.currentIndex];
  }
  tokenize(script = "") {
    this.script = script;
    let tokens = [];
    this.currentIndex = -1;
    this.currentCharacter = '';
    this.lastCharacterIndex = script.length - 1;
  do {
    this.getNextCharacter();
    if (this.isDelimiter(this.currentCharacter)) {
      tokens.push(new Token(
        this.currentCharacter,
        logo.tokenizer.tokenTypes.DELIMITER,
        logo.tokenizer.primitives.NONE));
    } else if (this.isNumber(this.currentCharacter)) {
      let number = this.currentCharacter;
      this.getNextCharacter();
      while (this.isNumber(this.currentCharacter)) {
        number += this.currentCharacter;
        this.getNextCharacter();
      }
      this.putbackCharacter();
      tokens.push(new Token(
        number,
        logo.tokenizer.tokenTypes.NUMBER,
        logo.tokenizer.primitives.NONE));
    } else if (this.isLetter(this.currentCharacter)) {
      let word = this.currentCharacter;
      this.getNextCharacter();
      while (this.isLetter(this.currentCharacter)) {
        word += this.currentCharacter;
        this.getNextCharacter();
      }
      this.putbackCharacter();
      let primitive = this.getPrimitive(word);
      if (primitive !== logo.tokenizer.primitives.NONE) {
        tokens.push(new Token(word, logo.tokenizer.tokenTypes.PRIMITIVE, primitive));
      } else {
        tokens.push(new Token(word, logo.tokenizer.tokenTypes.PROCEDURE_NAME, primitive));
      }
    } else if (this.isVariablePrefix(this.currentCharacter)) {
      let variable = this.currentCharacter;
      this.getNextCharacter();
      variable += this.currentCharacter;
      this.getNextCharacter();
      while (this.isLetter(this.currentCharacter)) {
        variable += this.currentCharacter;
        this.getNextCharacter();
      }
      this.putbackCharacter();
      tokens.push(new Token(
        variable,
        logo.tokenizer.tokenTypes.VARIABLE,
        logo.tokenizer.primitives.NONE));
    }
  } while (this.currentCharacter !== this.NUL)
    return tokens;
  }
}

class Turtle {
  DEGREE_TO_RADIAN = Math.PI / 180;
  toRadians = (deg = 0) => Number(deg * this.DEGREE_TO_RADIAN);

  constructor(canvasObject) {
    console.log("🐢");
    this.ctx = canvasObject.getContext('2d');
    this.width = canvasObject.width;
    this.height = canvasObject.height;
    this.centerX = parseInt(this.width / 2);
    this.centerY = parseInt(this.height / 2);
    this.orientation = 0;

    let virtualTurtleCanvas = document.createElement('canvas');
    virtualTurtleCanvas.width = this.width;
    virtualTurtleCanvas.height = this.height;
    this.turtleCtx = virtualTurtleCanvas.getContext('2d');

    let virtualDrawingCanvas = document.createElement('canvas');
    virtualDrawingCanvas.width = this.width;
    virtualDrawingCanvas.height = this.height;
    this.drawingCtx = virtualDrawingCanvas.getContext('2d');

    this.execute_clearscreen();
    this.execute_pendown();
  }
  deleteGraphics() {
    this.drawingCtx.clearRect(0, 0, this.width, this.height);
  }
  deleteTurtle() {
    this.turtleCtx.clearRect(0, 0, this.width, this.height);
  }
  drawTurtle() {
    let vertexAngleInDeg = 40;
    let alpha = vertexAngleInDeg / 2;
    let angle = this.toRadians(270 + alpha);

    let r = 20;
    let halfbase = r * Math.sin(this.toRadians(alpha));
    let height = r * Math.cos(this.toRadians(alpha));

    let x1 = this.x;
    let y1 = this.y - height / 2;
    let x2 = x1 + r * Math.cos(angle);
    let y2 = y1 - r * Math.sin(angle);
    let x3 = x2 - 2 * halfbase;
    let y3 = y2;

    this.turtleCtx.resetTransform();
    this.turtleCtx.translate(this.x, this.y);
    this.turtleCtx.rotate(this.toRadians(this.orientation));
    this.turtleCtx.translate(-this.x, -this.y);

    this.turtleCtx.beginPath();
    this.turtleCtx.moveTo(x1, y1);
    this.turtleCtx.lineTo(x2, y2);
    this.turtleCtx.lineTo(x3, y3);
    this.turtleCtx.lineTo(x1, y1);
    this.turtleCtx.stroke();
  }
  execute_back(n = 0) {
    this.execute_forward(-n);
  }
  execute_clearscreen() {
    this.deleteGraphics();
    this.deleteTurtle();

    this.updateTurtlePosition(this.centerX, this.centerY);
    this.incrementTurtleOrientation(-this.orientation);
    this.drawTurtle();

    this.renderFrame();
  }
  execute_forward(n = 0) {
    console.log(`[Turtle] - execute_forward(${n})`);
    /*
      α: angle from y-axis to the path of the turtle
      Normal coordinates start on the x-axis => 90-α angle
      x1 = x + r·cos(90-α) = x + r·sin(α)
      y1 = y + r·sin(90-α) = y + r·cos(α)
      Since y coordinates grow down instead of grow up,
      the increment in y should change sign. So finally
      x1 = x + r·sin(α)
      y1 = y - r·cos(α)
    */
    let alpha = this.toRadians(this.orientation);
    let x1 = this.x + n * Math.sin(alpha);
    let y1 = this.y - n * Math.cos(alpha);

    this.drawingCtx.lineWidth = 1;
    this.drawingCtx.beginPath();
    this.drawingCtx.moveTo(this.x, this.y);
    this.drawingCtx.lineTo(x1, y1);
    if (this.isPenDown) {
      this.drawingCtx.stroke();
    }
    this.updateTurtlePosition(x1, y1);

    this.deleteTurtle();
    this.drawTurtle();
    this.renderFrame();
  }
  execute_left(deg = 0) {
    this.execute_right(-deg);
  }
  execute_pendown() {
    console.log("[Turtle] - execute_pendown");
    this.isPenDown = true;
  }
  execute_penup() {
    console.log("[Turtle] - execute_penup");
    this.isPenDown = false;
  }
  execute_right(deg = 0) {
    console.log(`[Turtle] - execute_right(${deg})`);
    this.incrementTurtleOrientation(deg);

    this.deleteTurtle();
    this.drawTurtle();
    this.renderFrame();
  }
  incrementTurtleOrientation(deg = 0) {
    this.orientation += deg;
  }
  renderFrame() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.drawImage(this.drawingCtx.canvas, 0, 0, this.width, this.height);
    this.ctx.drawImage(this.turtleCtx.canvas, 0, 0, this.width, this.height);
  }
  updateTurtlePosition(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}

const interpreter = new Interpreter('logo-editor', 'logo-graphics', primitiveAliases);
interpreter.run();

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
        new Token("fd", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.FORWARD),
        new Token("60", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
        new Token("rt", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.RIGHT),
        new Token("90", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE)
      ],
      tokenizer.tokenize("fd 60 rt 90")
    )
  );
  tests.push(
    test(
      'Test Expression: 60',
      [
        new Token("60", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE)
      ],
      tokenizer.tokenize("60")
    )
  );
  tests.push(
    test(
      'Test Expression: 30 + 30',
      [
        new Token("30", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
        new Token("+", logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE),
        new Token("30", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE)
      ],
      tokenizer.tokenize("30 + 30")
    )
  );
  tests.push(
    test(
      'Test Expression: 2 * 15 + 30',
      [
        new Token("2", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
        new Token("*", logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE),
        new Token("15", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
        new Token("+", logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE),
        new Token("30", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE)
      ],
      tokenizer.tokenize("2 * 15 + 30")
    )
  );
  tests.push(
    test(
      'Test Expression: 100 / 2 + 10',
      [
        new Token("100", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
        new Token("/", logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE),
        new Token("2", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
        new Token("+", logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE),
        new Token("10", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE)
      ],
      tokenizer.tokenize("100 / 2 + 10")
    )
  );
  tests.push(
    test(
      'Test Expression: 2 * 10 + 50 - 70 / 7',
      [
        new Token("2", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
        new Token("*", logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE),
        new Token("10", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
        new Token("+", logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE),
        new Token("50", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
        new Token("-", logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE),
        new Token("70", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
        new Token("/", logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE),
        new Token("7", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE)
      ],
      tokenizer.tokenize("2 * 10 + 50 - 70 / 7")
    )
  );

  return tests.every(test => test);
}
```