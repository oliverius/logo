const logo = {
    "delimiters": {
        "OPENING_BRACKET": "[",
        "CLOSING_BRACKET": "]",
        "PLUS": "+",
        "MINUS": "-",
        "MULTIPLIEDBY": "*",
        "DIVIDEDBY": "/"
    },
    "interpreter": {
        "storageKey": "oliverius_logo"
    },
    "parserEvents": {
        "START_PARSING": 1,
        "END_PARSING": 2
    },
    "primitives" : {
        "NONE": 0,
        "FORWARD": 1,
        "BACK": 2,
        "LEFT": 3,
        "RIGHT": 4,
        "PENUP": 5,
        "PENDOWN": 6,
        "REPEAT": 7,
        "CLEARSCREEN": 8,
        "PRIMITIVE_TO": 9,
        "PRIMITIVE_END": 10
    },
    "primitiveAliases": [{
        "name": "FORWARD",
        "aliases": [ "forward", "fd", "av" ]
    }, {
        "name": "BACK",
        "aliases": [ "back", "bk", "re"]
    }, {
        "name": "LEFT",
        "aliases": [ "left", "lt", "gi" ]
    }, {
        "name": "RIGHT",
        "aliases": [ "right", "rt", "gd" ]
    }, {
        "name": "PENUP",
        "aliases": [ "penup", "pu", "sl" ]
    }, {
        "name": "PENDOWN",
        "aliases": [ "pendown", "pd", "bl" ]
    }, {
        "name": "REPEAT",
        "aliases": [ "repeat", "repite" ]
    }, {
        "name": "CLEARSCREEN",
        "aliases": [ "clearscreen", "cs", "bp" ]
    }, {
        "name": "PRIMITIVE_TO",
        "aliases": ["to", "para"]
    }, {
        "name": "PRIMITIVE_END",
        "aliases": [ "end", "fin" ]
    }],
    "tokenTypes" : {
        "NONE": 0,
        "DELIMITER": 1,
        "NUMBER": 2,
        "PRIMITIVE": 3,
        "VARIABLE": 4,
        "PROCEDURE_NAME": 5,
        "END_OF_TOKEN_STREAM" : 6
    }
};

class Interpreter {
    constructor(editorId, canvasId) {
        this.editor = document.getElementById(editorId);
        this.canvas = document.getElementById(canvasId);
        this.turtle = new Turtle(this.canvas);
        this.tokenizer = new Tokenizer();
        this.parser = new Parser();
        this.fps = 5;
        this.turtleDrawingQueue = [];
        this.editor.value = this.getLatestScriptRun();
        window.addEventListener(this.parser.turtleDrawingQueueEventName(), e => {
            let turtleMethodName = "";
            switch(e.detail.primitive) {
                case logo.primitives.FORWARD:
                    turtleMethodName = "execute_forward";
                    break;
                case logo.primitives.BACK:
                    turtleMethodName = "execute_back";
                    break;
                case logo.primitives.LEFT:
                    turtleMethodName = "execute_left";
                    break;
                case logo.primitives.RIGHT:
                    turtleMethodName = "execute_right";
                    break;
                case logo.primitives.PENUP:
                    turtleMethodName = "execute_penup";
                    break;
                case logo.primitives.PENDOWN:
                    turtleMethodName = "execute_pendown";
                    break;
                case logo.primitives.CLEARSCREEN:
                    turtleMethodName = "execute_clearscreen";
                    break;
            }
            this.turtleDrawingQueue.push({
                methodname: turtleMethodName,
                arg: e.detail.arg
            });
        });
        this.executionLoop();
    }
    clear() {
        this.editor.value = "";
    }
    executionLoop() {
        setInterval(() => {
            console.log("*");
            if (this.turtleDrawingQueue.length > 0) {
                let obj = this.turtleDrawingQueue.shift();
                this.turtle[obj.methodname](obj.arg);
            }
        }, 1000/this.fps);
    }
    getLatestScriptRun() {
        return localStorage.getItem(logo.interpreter.storageKey) ?? "";
    }
    saveLatestScriptRun(script) {
        localStorage.setItem(logo.interpreter.storageKey, script);
    }
    stop() {
        this.turtleDrawingQueue = []; // No more graphic instructions to execute
    }
    run() {
        let script = this.editor.value;
        this.saveLatestScriptRun(script);
        let tokens = this.tokenizer.tokenize(script);
        this.parser.parse(tokens);
    }
}

class Parser {
    turtleDrawingQueueEventName() { return "PARSER_ADD_TO_TURTLE_DRAWING_QUEUE_EVENT"; }
    parserStatusEventName() { return "PARSER_STATUS_EVENT"; }
    applyArithmeticOperation(operation, result, hold) {
        switch(operation) {
            case logo.delimiters.PLUS:
                result.value += hold.value;
                break;
            case logo.delimiters.MINUS:
                result.value -= hold.value;
                break;
            case logo.delimiters.MULTIPLIEDBY:
                result.value *= hold.value;
                break;
            case logo.delimiters.DIVIDEDBY:
                result.value /= hold.value;
            default:
                break; // TODO will be an error
        }
    }
    assignVariable(variableName) {
        let item = this.peekLastProcedureCallStackItem();
        let parameters = item.parameters;
        let parameter = parameters.find(p => p.parameterName === variableName);
        let value = parseInt(parameter.parameterValue);
        return value;
    }
    execute_procedure_end() {
        console.log("** Execute procedure END");
        let item = this.procedureCallStack.pop();
        this.setCurrentTokenIndex(item.currentTokenIndexBeforeJumpingToProcedure);
        console.log("** Execute procedure END - move the index to: " + item.currentTokenIndexBeforeJumpingToProcedure);
    }
    execute_procedure_to() {
        console.log("** Execute procedure TO");
        let procedure = {};
        this.getNextToken();
        if (this.currentToken.tokenType === logo.tokenTypes.PROCEDURE_NAME) {
            procedure["name"] = this.currentToken.text;
            procedure["parameters"] = [];
            
            this.getNextToken();
            while(this.currentToken.tokenType === logo.tokenTypes.VARIABLE) {
                procedure["parameters"].push(this.currentToken.text);
                this.getNextToken();
            }
            procedure["firstTokenInsideProcedureIndex"] = this.currentTokenIndex;
            
            while(this.currentToken.primitive !== logo.primitives.PRIMITIVE_END) {
                this.getNextToken();
            }
            let indexLastTokenNotIncludingEndToken = this.currentTokenIndex - 1;
            procedure["lastTokenInsideProcedureIndex"] = indexLastTokenNotIncludingEndToken;

            this.procedures.push(procedure);
            console.log("** Added procedure: ", procedure);
        }
    }
    execute_repeat_begin(n = 0) {
        this.getNextToken();
        if (this.currentToken.tokenType === logo.tokenTypes.DELIMITER
            && this.currentToken.text === logo.delimiters.OPENING_BRACKET) {
            let firstTokenInsideTheLoopIndex = this.currentTokenIndex;
            this.loopStack.push({
                firstTokenInsideTheLoopIndex: firstTokenInsideTheLoopIndex,
                remainingLoops: n - 1});
        }
    }
    execute_repeat_end() {
        let currentLoop = this.loopStack.pop();
        if (currentLoop.remainingLoops > 0) {
            this.setCurrentTokenIndex(currentLoop.firstTokenInsideTheLoopIndex);
            this.loopStack.push({
                firstTokenInsideTheLoopIndex: currentLoop.firstTokenInsideTheLoopIndex,
                remainingLoops: currentLoop.remainingLoops - 1
            });
        }
    }
    getExpression() {
        this.getNextToken();

        let result = { value: 0 };
        this.getExpression_AdditionOrSubtraction(result);
        
        this.putBackToken();
        return result.value;
    }
    getExpression_AdditionOrSubtraction(result) {
        let hold = { value: 0 };
        let operation = "";
        this.getExpression_MultiplicationOrDivision(result);
        while (this.currentToken.text === logo.delimiters.PLUS
            || this.currentToken.text === logo.delimiters.MINUS) {
            operation = this.currentToken.text;
            this.getNextToken();
            this.getExpression_MultiplicationOrDivision(hold);
            this.applyArithmeticOperation(operation, result, hold);
        }
    }
    getExpression_MultiplicationOrDivision(result) {
        let hold = { value: 0 };
        let operation = "";
        this.getNumberOrVariableValue(result);
        while (this.currentToken.text === logo.delimiters.MULTIPLIEDBY
            || this.currentToken.text === logo.delimiters.DIVIDEDBY) {
            operation = this.currentToken.text;
            this.getNextToken();
            this.getNumberOrVariableValue(hold);
            this.applyArithmeticOperation(operation, result, hold);
        }
    }
    getNextToken() {
        this.currentTokenIndex++;
        if (this.currentTokenIndex < this.tokens.length) {
            this.currentToken = this.tokens[this.currentTokenIndex];
        } else {
            this.currentToken = new Token(this.currentTokenIndex, "", logo.tokenTypes.END_OF_TOKEN_STREAM);
        }
        //console.log(`Current token: ${this.currentTokenIndex.toString().padStart(2, '0')} - ${this.currentToken}`);
    }
    getNumberOrVariableValue(result) {
        switch (this.currentToken.tokenType) {
            case logo.tokenTypes.NUMBER:
                result.value = parseInt(this.currentToken.text);
                this.getNextToken();
                break;
            case logo.tokenTypes.VARIABLE:
                result.value = this.assignVariable(this.currentToken.text);
                this.getNextToken();
                break;
            default:
                // TODO error
                break;
        }
    }
    initialize(tokens) {
        this.tokens = tokens;
        this.currentToken = {};
        this.currentTokenIndex = -1; // So when we get the first token, it will be 0, first index in an array.
        this.loopStack = [];
        this.procedures = [];
        this.procedureCallStack = [];
        this.raiseParserStatusEventName(logo.parserEvents.START_PARSING);
    }
    parse(tokens) {
        this.initialize(tokens);

        let n = 0;

        do {
            this.getNextToken();
            if (this.currentToken.tokenType === logo.tokenTypes.PRIMITIVE) {
                switch(this.currentToken.primitive) {
                    case logo.primitives.FORWARD:
                        n = this.getExpression();
                        this.raiseTurtleDrawingQueueEvent(logo.primitives.FORWARD, n);
                        break;
                    case logo.primitives.BACK:
                        n = this.getExpression();;
                        this.raiseTurtleDrawingQueueEvent(logo.primitives.BACK, n);
                        break;
                    case logo.primitives.LEFT:
                        n = this.getExpression();
                        this.raiseTurtleDrawingQueueEvent(logo.primitives.LEFT, n);
                        break;
                    case logo.primitives.RIGHT:
                        n = this.getExpression();
                        this.raiseTurtleDrawingQueueEvent(logo.primitives.RIGHT, n);
                        break;
                    case logo.primitives.PENUP:
                        this.raiseTurtleDrawingQueueEvent(logo.primitives.PENUP);
                        break;
                    case logo.primitives.PENDOWN:
                        this.raiseTurtleDrawingQueueEvent(logo.primitives.PENDOWN);
                        break;
                    case logo.primitives.REPEAT:
                        n = this.getExpression();
                        this.execute_repeat_begin(n);
                        break;
                    case logo.primitives.CLEARSCREEN:
                        this.raiseTurtleDrawingQueueEvent(logo.primitives.CLEARSCREEN);
                        break;
                    case logo.primitives.PRIMITIVE_TO:
                        this.execute_procedure_to();
                        break;
                    case logo.primitives.PRIMITIVE_END:
                        this.execute_procedure_end();
                        break;
                }
            } else if(this.currentToken.tokenType === logo.tokenTypes.DELIMITER) {
                if (this.currentToken.text === logo.delimiters.CLOSING_BRACKET) {
                    this.execute_repeat_end();
                }
            } else if(this.currentToken.tokenType === logo.tokenTypes.PROCEDURE_NAME) {
                this.scanProcedure(this.currentToken.text);
            }
        } while(this.currentToken.tokenType !== logo.tokenTypes.END_OF_TOKEN_STREAM)
        this.raiseParserStatusEventName(logo.parserEvents.END_PARSING);
        console.log("Finish parsing");
    }
    peekLastProcedureCallStackItem() {
        return this.procedureCallStack[this.procedureCallStack.length - 1];
    }
    putBackToken() {
        this.currentTokenIndex--;
        this.currentToken = this.tokens[this.currentTokenIndex];
    }
    raiseParserStatusEventName(status = "") {
        let event = new CustomEvent(this.parserStatusEventName(), {
            bubbles: true,
            detail: {
                status: status
            }
        });
        window.dispatchEvent(event);
    }
    raiseTurtleDrawingQueueEvent(primitive = logo.primitives.NONE, arg = 0) {
        let event = new CustomEvent(this.turtleDrawingQueueEventName(), {
            bubbles: true,
            detail: {
                primitive: primitive,
                arg: arg
            }
        });
        window.dispatchEvent(event);
    }
    scanProcedure(name) {
        console.log(`** Scan procedure: ${name}`);
        let searchProcedureResults = this.procedures.filter(procedure => {
            return procedure.name === name;
        });
        if (searchProcedureResults.length > 0) {
            let procedure = searchProcedureResults[0];
            
            let procedureCallStackItem = {};
            procedureCallStackItem["name"] = procedure.name;

            let values = [];
            procedure.parameters.forEach(p => {
                let value = {
                    parameterName: p,
                    parameterValue: this.getExpression()
                };
                values.push(value);
            });
            procedureCallStackItem["parameters"] = values;
            procedureCallStackItem["currentTokenIndexBeforeJumpingToProcedure"] = this.currentTokenIndex;

            this.procedureCallStack.push(procedureCallStackItem);
            let indexBeforeFirstTokenInsideProcedure = procedure.firstTokenInsideProcedureIndex - 1;

            this.setCurrentTokenIndex(indexBeforeFirstTokenInsideProcedure); // So in the next getNextToken we have the first token inside the procedure
            console.log(`** Index set to: ${procedure.firstTokenInsideProcedureIndex}`, procedureCallStackItem);
        }
        
    }
    setCurrentTokenIndex(index) {
        this.currentTokenIndex = index;
    }
}

class Token {
    constructor(startIndex = 0, text = "", tokenType = logo.tokenTypes.NONE, primitive = logo.primitives.NONE) {
        this.startIndex = startIndex;
        this.text = text;
        this.endIndex = startIndex + text.length - 1;
        this.tokenType = tokenType;
        this.primitive = primitive;
    }
    get [Symbol.toStringTag]() {
        let tokenTypeKey = Object.keys(logo.tokenTypes).find(key => logo.tokenTypes[key] === this.tokenType);
        let primitiveKey = Object.keys(logo.primitives).find(key => logo.primitives[key] === this.primitive);
        
        let paddedStartIndex = this.startIndex.toString().padStart(3, '0');
        let paddedEndIndex = this.endIndex.toString().padStart(3, '0');
        
        return `Token (${paddedStartIndex}-${paddedEndIndex}) "${this.text}" ${tokenTypeKey} {${primitiveKey}}`;
    }
}

class Tokenizer {
    LF = "\n";
    EOF = "\0";
    VARIABLE_PREFIX = ":";

    getNextCharacter() {
        this.currentIndex++;
        if (this.currentIndex < this.script.length) {
            this.currentCharacter = this.script[this.currentIndex];
        } else {
            this.currentCharacter = this.EOF;
        }
        //console.log(`Current character: ${this.currentIndex.toString().padStart(2, '0')} - ${this.currentCharacter}`);
    }
    getPrimitive(primitiveAlias = "") {
        let foundPrimitives = logo.primitiveAliases.filter(p =>
            p.aliases.includes(primitiveAlias.toLowerCase())
        );

        if (foundPrimitives.length === 1) {
            return logo.primitives[foundPrimitives[0].name];
            
        }
        return logo.primitives.NONE;
    }
    initialize(script) {
        this.script = script;
        this.tokens = [];
        this.currentIndex = -1; // So when we get the first character, it will be script[0]
        this.currentCharacter = '';
    }
    isDelimiter(c) {
        let delimiters = [
            logo.delimiters.OPENING_BRACKET,
            logo.delimiters.CLOSING_BRACKET,
            logo.delimiters.PLUS,
            logo.delimiters.MINUS,
            logo.delimiters.MULTIPLIEDBY,
            logo.delimiters.DIVIDEDBY
        ].join('');
        return delimiters.indexOf(c) !== -1;
    }
    isEndOfFile(c) {
        return c === this.EOF;
    }
    isLetter(c) {
        return "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".indexOf(c) !== -1;
    }
    isNewLine(c) {
        return this.LF.indexOf(c) !== -1;
    }
    isNumber(c) {
        return "0123456789".indexOf(c) !== -1;
    }
    isVariablePrefix(c) {
        return c === this.VARIABLE_PREFIX;
    }
    isWhiteSpace(c) {
        return c === " " || c === "\t";
    }
    putbackCharacter() {
        this.currentIndex--;
        this.currentCharacter = this.script[this.currentIndex];
    }
    tokenize(script = "") {
        this.initialize(script);
        
        do {
            this.getNextCharacter();
            if (this.isWhiteSpace(this.currentCharacter)) {
                this.getNextCharacter();
                while(this.isWhiteSpace(this.currentCharacter)) {
                    this.getNextCharacter();
                }
                this.putbackCharacter();
            } else if (this.isNewLine(this.currentCharacter)) {
                let token = new Token(this.currentIndex, this.currentCharacter, logo.tokenTypes.DELIMITER);
                this.tokens.push(token);
            } else if (this.isDelimiter(this.currentCharacter)) {
                let token = new Token(this.currentIndex, this.currentCharacter, logo.tokenTypes.DELIMITER);
                this.tokens.push(token);
            } else if (this.isNumber(this.currentCharacter)) {
                let number = this.currentCharacter;
                let startIndex = this.currentIndex;
                this.getNextCharacter();                
                while(this.isNumber(this.currentCharacter)) {
                    number += this.currentCharacter;
                    this.getNextCharacter();
                }
                let token = new Token(startIndex, number, logo.tokenTypes.NUMBER);
                this.tokens.push(token);
                this.putbackCharacter();
            } else if (this.isLetter(this.currentCharacter)) {
                let word = this.currentCharacter;
                let startIndex = this.currentIndex;
                this.getNextCharacter();                
                while(this.isLetter(this.currentCharacter)) {
                    word += this.currentCharacter;
                    this.getNextCharacter();
                }
                this.putbackCharacter();
                let primitive = this.getPrimitive(word);
                if (primitive === logo.primitives.NONE) {
                    let token = new Token(startIndex, word, logo.tokenTypes.PROCEDURE_NAME, primitive);
                    this.tokens.push(token);
                } else {
                    let token = new Token(startIndex, word, logo.tokenTypes.PRIMITIVE, primitive);
                    this.tokens.push(token);
                }
            } else if (this.isVariablePrefix(this.currentCharacter)) {
                let variable = this.currentCharacter;
                let startIndex = this.currentIndex;
                this.getNextCharacter();                
                while(this.isLetter(this.currentCharacter)) {
                    variable += this.currentCharacter;
                    this.getNextCharacter();
                }
                this.putbackCharacter();
                let token = new Token(startIndex, variable, logo.tokenTypes.VARIABLE);
                this.tokens.push(token);
            } else {
                if (!this.isEndOfFile(this.currentCharacter)) {
                    console.log(`Unexpected character: "${this.currentCharacter}" ${this.currentCharacter.charCodeAt(0)}`);
                }
            }
            //console.log(`Check last token index with current index  ${this.currentIndex}`)
        } while(!this.isEndOfFile(this.currentCharacter))

        return this.tokens;
    }
}

class Turtle {
    DEGREE_TO_RADIAN = Math.PI/180;
    toRadians = (deg=0) => { return Number(deg * this.DEGREE_TO_RADIAN) };

    constructor(canvasObject) {
        this.ctx = canvasObject.getContext('2d');
        this.width = canvasObject.width;
        this.height = canvasObject.height;
        this.centerX = parseInt(this.width / 2);
        this.centerY = parseInt(this.height / 2);
        this.angleInDegrees = 0;

        this.virtualTurtleCanvas = document.createElement('canvas');
        this.virtualTurtleCanvas.width = this.width;
        this.virtualTurtleCanvas.height = this.height;
        this.turtleCtx = this.virtualTurtleCanvas.getContext('2d');

        this.virtualDrawingCanvas = document.createElement('canvas');
        this.virtualDrawingCanvas.width = this.width;
        this.virtualDrawingCanvas.height = this.height;
        this.drawingCtx = this.virtualDrawingCanvas.getContext('2d');

        this.execute_clearscreen();
        this.execute_pendown()
    }
    deleteGraphics() {
        this.drawingCtx.clearRect(0, 0, this.width, this.height);
    }
    deleteTurtle() {
        this.turtleCtx.clearRect(0, 0, this.width, this.height);
    }
    execute_back(n = 0) {
        this.execute_forward(-n);
    }
    execute_clearscreen() {
        this.deleteGraphics();
        this.deleteTurtle();

        this.updateTurtlePosition(this.centerX, this.centerY);
        this.updateTurtleOrientation(-this.angleInDegrees);
        this.drawTurtle();

        this.renderFrame();
    }
    execute_forward(n = 0) {
        let angleFromYaxis = 90 - this.angleInDegrees;
        let angleFromYaxisInRadians = this.toRadians(angleFromYaxis);

        let newX = this.x + n * Math.cos(angleFromYaxisInRadians);
        let newY = this.y - n * Math.sin(angleFromYaxisInRadians);

        this.drawingCtx.lineWidth = 1;
        this.drawingCtx.beginPath();
        this.drawingCtx.moveTo(this.x, this.y);
        this.drawingCtx.lineTo(newX, newY);
        if (this.isPenDown) {
            this.drawingCtx.stroke();
        }
        this.updateTurtlePosition(newX, newY);
        
        this.deleteTurtle();
        this.drawTurtle();
        this.renderFrame();
    }
    execute_left(deg = 0) {
        this.execute_right(-deg);
    }
    execute_pendown() {
        this.isPenDown = true;
    }
    execute_penup() {
        this.isPenDown = false;
    }
    execute_right(deg = 0) {
        this.updateTurtleOrientation(deg);

        this.deleteTurtle();
        this.drawTurtle();
        this.renderFrame();
    }
    drawTurtle() {
        let vertexAngleInDeg = 40;
        let alpha = vertexAngleInDeg / 2;
        let angle = this.toRadians(270 + alpha);
        
        let r = 20;
        let halfbase = r * Math.sin(this.toRadians(alpha));
        let height = r * Math.cos(this.toRadians(alpha));
        
        let x1 = this.x;
        let y1 = this.y - height/2;
        let x2 = x1 + r * Math.cos(angle);
        let y2 = y1 - r * Math.sin(angle);
        let x3 = x2 - 2 * halfbase;
        let y3 = y2;

        this.turtleCtx.resetTransform();;

        this.turtleCtx.translate(this.x, this.y);
        this.turtleCtx.rotate(this.toRadians(this.angleInDegrees));
        this.turtleCtx.translate(-this.x, -this.y);

        this.turtleCtx.beginPath();
        this.turtleCtx.moveTo(x1, y1);
        this.turtleCtx.lineTo(x2, y2);
        this.turtleCtx.lineTo(x3, y3);
        this.turtleCtx.lineTo(x1, y1);
        this.turtleCtx.stroke();
    }
    renderFrame() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.drawImage(this.virtualDrawingCanvas, 0, 0, this.width, this.height);
        this.ctx.drawImage(this.virtualTurtleCanvas, 0, 0, this.width, this.height);
    }
    updateTurtleOrientation(deg = 0) {
        this.angleInDegrees += deg;
    }
    updateTurtlePosition(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
}

const interpreter = new Interpreter('logo-editor', 'logo-graphics');

//export { Token, Tokenizer }