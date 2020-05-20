
function run(script) {
    //parser.parse(script);
    //parser.parse("para cuadrado :lado av 60");
    //parser.parse("gd 45 av 60");
    //parser.parse("repite 4 [av 60 gd 90]");
    //parser.parse("av 120 repite 4 [av 60 gd 90] bp");
    // repite 4 [av 60 repite 5 [gi 72 re 20] gd 90]
    interpreter.run(script);
}

const token_types = {
    NONE: 0,
    DELIMITER: 1,
    NUMBER: 2,
    PRIMITIVE: 3,
    VARIABLE: 4,
    PROCEDURE_NAME: 5,
    END_OF_TOKEN_STREAM : 6 // TODO rename "End of token stream"
};

const delimiters = {
    OPENING_BRACKET: "[",
    CLOSING_BRACKET: "]"
};

const primitives = {
    NONE: 0,
    FORWARD: 1,
    BACK: 2,
    LEFT: 3,
    RIGHT: 4,
    REPEAT: 5,
    CLEARSCREEN: 6,
    PRIMITIVE_TO: 7,
    PRIMITIVE_END: 8
};

class Interpreter {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.turtle = new Turtle(this.canvas);
        this.tokenizer = new Tokenizer();
        this.fps = 5;
        this.turtleExecutionQueue = [];
        this.procedures = [];
        window.addEventListener("PARSER_ADD_TO_TURTLE_EXECUTION_QUEUE_EVENT", e => {
            this.turtleExecutionQueue.push({
                objectname: e.detail.objectname,
                methodname: e.detail.methodname,
                arg: e.detail.arg
            });
        }); // TODO can't make it static in the parser though;

        this.executionLoop();
    }
    executionLoop() {
        setInterval(() => {
            console.log("*");
            if (this.turtleExecutionQueue.length > 0) {
                let obj = this.turtleExecutionQueue.shift();
                this[obj.objectname][obj.methodname](obj.arg);
            }
        }, 1000/this.fps);
    }
    run(script = "") {
        let tokens = this.tokenizer.tokenize(script);
        let parser = new Parser();
        parser.parse(tokens);
    }
}

class Parser {
    eventName() { return "PARSER_ADD_TO_TURTLE_EXECUTION_QUEUE_EVENT"; }

    assignVariable(variableName) {
        let item = this.peekLastProcedureStackItem();
        let parameters = item.parameters;
        let parameter = parameters.find(p => p.parameterName === variableName);
        let value = parseInt(parameter.parameterValue);
        return value;
    }
    execute_procedure_end() {
        console.log("** Execute procedure END");
        let item = this.procedureStack.pop();
        this.setCurrentTokenIndex(item.currentTokenIndexBeforeJumpingToProcedure);
        console.log("** Execute procedure END - move the index to: " + item.currentTokenIndexBeforeJumpingToProcedure);
    }
    execute_procedure_to() {
        console.log("** Execute procedure TO");
        let procedure = {};
        this.getNextToken();
        if (this.currentToken.tokenType === token_types.PROCEDURE_NAME) {
            procedure["name"] = this.currentToken.text;
            procedure["parameters"] = [];
            
            this.getNextToken(); // todo maybe putback if no variables
            while(this.currentToken.tokenType === token_types.VARIABLE) {
                procedure["parameters"].push(this.currentToken.text);
                this.getNextToken();
            }
            procedure["firstTokenInsideProcedureIndex"] = this.currentTokenIndex;
            
            while(this.currentToken.primitive !== primitives.PRIMITIVE_END) {
                this.getNextToken();
            }
            let indexLastTokenNotIncludingEndToken = this.currentTokenIndex - 1;
            procedure["lastTokenInsideProcedureIndex"] = indexLastTokenNotIncludingEndToken;

            this.procedures.push(procedure);
            console.log("** Added procedure: ", procedure);
        }
    }
    execute_repeat_begin(n = 0) {
        console.log("** REPEAT begin");
        this.getNextToken();
        if (this.currentToken.tokenType === token_types.DELIMITER
            && this.currentToken.text === delimiters.OPENING_BRACKET) {
            let firstTokenInsideTheLoopIndex = this.currentTokenIndex;
            this.loopStack.push({
                firstTokenInsideTheLoopIndex: firstTokenInsideTheLoopIndex,
                remainingLoops: n - 1});
        }
    }
    execute_repeat_end() {
        console.log("** REPEAT end");
        let currentLoop = this.loopStack.pop();
        if (currentLoop?.remainingLoops > 0) {
            this.setCurrentTokenIndex(currentLoop.firstTokenInsideTheLoopIndex);
            this.loopStack.push({
                firstTokenInsideTheLoopIndex: currentLoop.firstTokenInsideTheLoopIndex,
                remainingLoops: currentLoop.remainingLoops - 1
            });
        }
    }
    getNextToken() {
        this.currentTokenIndex++;
        if (this.currentTokenIndex < this.tokens.length) {
            this.currentToken = this.tokens[this.currentTokenIndex];
        } else {
            this.currentToken = new Token(this.currentTokenIndex, "", token_types.END_OF_TOKEN_STREAM);
        }
        console.log(`Current token: ${this.currentTokenIndex.toString().padStart(2, '0')} - ${this.currentToken}`);
    }
    getPrimitiveParameter() {
        this.getNextToken();
        if (this.currentToken.tokenType === token_types.NUMBER) {
            return parseInt(this.currentToken.text);
        } else if (this.currentToken.tokenType === token_types.VARIABLE) {        
            let value = this.assignVariable(this.currentToken.text);
            return value;
        }
    }
    initialize() {
        this.currentToken = {};
        this.currentTokenIndex = -1; // So when we get the first token, it will be 0, first index in an array.
        this.loopStack = [];
        this.procedures = [];
        this.procedureStack = [];
    }
    parse(tokens) {
        this.tokens = tokens;
        this.initialize();

        let n = 0;

        do {
            this.getNextToken();            
            if (this.currentToken.tokenType === token_types.PRIMITIVE) {
                switch(this.currentToken.primitive) {
                    case primitives.FORWARD:
                        n = this.getPrimitiveParameter();
                        this.raiseTurtleExecutionQueueEvent("execute_forward", n);
                        break;
                    case primitives.BACK:
                        n = this.getPrimitiveParameter();
                        this.raiseTurtleExecutionQueueEvent("execute_backward", n);
                        break;
                    case primitives.LEFT:
                        n = this.getPrimitiveParameter();
                        this.raiseTurtleExecutionQueueEvent("execute_left", n);
                        break;
                    case primitives.RIGHT:
                        n = this.getPrimitiveParameter();
                        this.raiseTurtleExecutionQueueEvent("execute_right", n);
                        break;
                    case primitives.REPEAT:
                        n = this.getPrimitiveParameter();
                        this.execute_repeat_begin(n);
                        break;
                    case primitives.CLEARSCREEN:
                        this.raiseTurtleExecutionQueueEvent("execute_clearscreen");
                        break;
                    case primitives.PRIMITIVE_TO:
                        this.execute_procedure_to();
                        break;
                    case primitives.PRIMITIVE_END:
                        this.execute_procedure_end();
                        break;
                }
            } else if(this.currentToken.tokenType === token_types.DELIMITER) {
                if (this.currentToken.text === delimiters.CLOSING_BRACKET) {
                    this.execute_repeat_end();
                }
            } else if(this.currentToken.tokenType === token_types.PROCEDURE_NAME) {
                this.scanProcedure(this.currentToken.text);
            }
        } while(this.currentToken.tokenType !== token_types.END_OF_TOKEN_STREAM)
        console.log("Finish parsing");
    }
    peekLastProcedureStackItem() {
        return this.procedureStack[this.procedureStack.length - 1];
    }
    raiseTurtleExecutionQueueEvent(methodname = "", arg = 0) {
        let event = new CustomEvent(this.eventName(), {
            bubbles: true,
            detail: {
                objectname: "turtle",
                methodname: methodname,
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
            
            let procedureStackItem = {};
            procedureStackItem["name"] = procedure.name;

            let values = [];
            procedure.parameters.forEach(p => {
                this.getNextToken();
                let value = {
                    parameterName: p,
                    parameterValue: this.currentToken.text
                };
                values.push(value);
            });
            procedureStackItem["parameters"] = values;
            procedureStackItem["currentTokenIndexBeforeJumpingToProcedure"] = this.currentTokenIndex;

            this.procedureStack.push(procedureStackItem);
            let indexBeforeFirstTokenInsideProcedure = procedure.firstTokenInsideProcedureIndex - 1;
            console.log(indexBeforeFirstTokenInsideProcedure);
            this.setCurrentTokenIndex(indexBeforeFirstTokenInsideProcedure); // So in the next getNextToken we have the first token inside the procedure
            console.log(`** Index set to: ${procedure.firstTokenInsideProcedureIndex}`, procedureStackItem);
        }
        
    }
    setCurrentTokenIndex(index) {
        this.currentTokenIndex = index;
    }
}

class Token {
    constructor(startIndex = 0, text = "", tokenType = token_types.NONE, primitive = primitives.NONE) {
        this.startIndex = startIndex;
        this.text = text;
        this.endIndex = startIndex + text.length - 1;
        this.tokenType = tokenType;
        this.primitive = primitive;
    }
    get [Symbol.toStringTag]() {
        let tokenTypeKey = Object.keys(token_types).find(key => token_types[key] === this.tokenType);
        let primitiveKey = Object.keys(primitives).find(key => primitives[key] === this.primitive);
        
        let paddedStartIndex = this.startIndex.toString().padStart(3, '0');
        let paddedEndIndex = this.endIndex.toString().padStart(3, '0');
        let paddedTokenTypeKey = tokenTypeKey.padEnd(12);
        let paddedPrimitiveKey = primitiveKey.padStart(8, ' '); 
        
        return `Token (${paddedStartIndex}-${paddedEndIndex}) "${this.text}" ${paddedTokenTypeKey}\t${paddedPrimitiveKey}`;
    }
}

class Tokenizer {
    EOF = "\0";
    VARIABLE_PREFIX = ":";

    isEndOfFile(c) {
        return c === this.EOF;
    }

    getCharacterIndex() {
        return this.index - 1;
    }

    getCharacter() {
        if (this.index < this.script.length) {
            let c = this.script[this.index];
            //console.log(`[${this.index}] ${c}`);
            this.index++;
            return c;
        } else {
            return this.EOF;
        }
    }

    getPrimitive(primitiveString="") {
        switch(primitiveString.toLowerCase()) {
            case "av":
                return primitives.FORWARD;
            case "re":
                return primitives.BACK;
            case "gd":
                return primitives.RIGHT;
            case "gi":
                return primitives.LEFT;
            case "repite":
                return primitives.REPEAT;
            case "bp":
                return primitives.CLEARSCREEN;
            case "para":
                return primitives.PRIMITIVE_TO;
            case "fin":
                return primitives.PRIMITIVE_END;
            default:
                return primitives.NONE; // This will produce an error.
        }
    }

    initialize(script) {
        this.tokens = [];
        this.index = 0;
        this.script = script;
    }

    isDelimiter(c) {
        return `${delimiters.OPENING_BRACKET}${delimiters.CLOSING_BRACKET}`.indexOf(c) !== -1;
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

    isWhiteSpace(c) {
        return c === " " || c === "\t";
    }

    tokenize(script = "") {
        this.initialize(script);
        let c = this.getCharacter();
        do {
            if (this.isWhiteSpace(c)) {
                c = this.getCharacter();
                while(this.isWhiteSpace(c)) {
                    c = this.getCharacter();
                }
            } else if (this.isDelimiter(c)) {
                let token = new Token(this.getCharacterIndex(), c, token_types.DELIMITER);
                this.tokens.push(token);
                c = this.getCharacter();
            } else if (this.isNumber(c)) {
                let number = c;
                c = this.getCharacter();
                let startIndex = this.getCharacterIndex();
                while(this.isNumber(c)) {
                    number += c;
                    c = this.getCharacter();
                }
                let token = new Token(startIndex, number, token_types.NUMBER);
                this.tokens.push(token);
            } else if (this.isLetter(c)) {
                let word = c;
                c = this.getCharacter();
                let startIndex = this.getCharacterIndex();
                while(this.isLetter(c)) {
                    word += c;
                    c = this.getCharacter();
                }
                let primitive = this.getPrimitive(word);
                if (primitive === primitives.NONE) {
                    let token = new Token(startIndex, word, token_types.PROCEDURE_NAME, primitive);
                    this.tokens.push(token);
                } else {
                    let token = new Token(startIndex, word, token_types.PRIMITIVE, primitive);
                    this.tokens.push(token);
                }
            } else if (this.isVariablePrefix(c)) {
                let variable = c;
                c = this.getCharacter();
                let startIndex = this.getCharacterIndex();
                while(this.isLetter(c)) {
                    variable += c;
                    c = this.getCharacter();
                }
                let token = new Token(startIndex, variable, token_types.VARIABLE);
                this.tokens.push(token);
            } else {
                console.log(`Unexpected character: "${c}"`);
                c = this.getCharacter(); // This avoids an endless loop
            }
        } while(!this.isEndOfFile(c))

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
    }    

    deleteGraphics() {
        this.drawingCtx.clearRect(0, 0, this.width, this.height);
    }

    deleteTurtle() {
        this.turtleCtx.clearRect(0, 0, this.width, this.height);
    }

    execute_backward(n = 0) {
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
        this.drawingCtx.stroke();

        this.updateTurtlePosition(newX, newY);
        
        this.deleteTurtle();
        this.drawTurtle();
        this.renderFrame();
    }

    execute_left(deg = 0) {
        this.execute_right(-deg);
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

const interpreter = new Interpreter('logocanvas');

//module.exports.tokenizer = Tokenizer;