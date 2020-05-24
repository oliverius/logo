
function run(script) {
    interpreter.run(script);
}

// Totally annoyed with how mocha is running the tests, so for now we do simple ones in the browser itself for the tokenizer
function runtests() {
    let tokenizer = new Tokenizer();
    let assertToken = (expectedToken = {}, actualToken = {}) => {
            let success = actualToken.startIndex === expectedToken.startIndex &&
                actualToken.endIndex === expectedToken.endIndex &&
                actualToken.text === expectedToken.text &&
                actualToken.tokenType === expectedToken.tokenType &&
                actualToken.primitive === expectedToken.primitive;
            if (!success) {
                console.log(`Expected token: ${expectedToken} - Actual token: ${actualToken}`);
            }
            return success;
    };
    let assertTokens = (comment = "", expectedTokens = [], actualTokens = []) => {
        if (expectedTokens.length !== actualTokens.length) {
            throw `TEST "${comment}": Expected and actual have different number of tokens`;
        }
        let success = expectedTokens.every((expectedToken, index) => assertToken(expectedToken, actualTokens[index]) === true);
        let testResult = success ? "PASSED" : "FAILED";
        console.log(`TEST "${comment}": ${testResult}`);
    };
    let lines = (arr) => arr.join('\n');

    assertTokens(
        'One space only',
        [],
        tokenizer.tokenize(" ")
    );
    assertTokens(
        'Two spaces only',
        [],
        tokenizer.tokenize("  ")
    );
    assertTokens(
        'Three spaces only',
        [],
        tokenizer.tokenize("   ")
    );
    assertTokens(
        'Square without REPEAT primitive',
        [
            new Token(0, "fd", logo.tokenTypes.PRIMITIVE, logo.primitives.FORWARD),
            new Token(3, "60", logo.tokenTypes.NUMBER, logo.primitives.NONE),
            new Token(6, "rt", logo.tokenTypes.PRIMITIVE, logo.primitives.RIGHT),
            new Token(9, "90", logo.tokenTypes.NUMBER, logo.primitives.NONE),
            new Token(12, "fd", logo.tokenTypes.PRIMITIVE, logo.primitives.FORWARD),
            new Token(15, "60", logo.tokenTypes.NUMBER, logo.primitives.NONE),
            new Token(18, "rt", logo.tokenTypes.PRIMITIVE, logo.primitives.RIGHT),
            new Token(21, "90", logo.tokenTypes.NUMBER, logo.primitives.NONE),
            new Token(24, "fd", logo.tokenTypes.PRIMITIVE, logo.primitives.FORWARD),
            new Token(27, "60", logo.tokenTypes.NUMBER, logo.primitives.NONE),
            new Token(30, "rt", logo.tokenTypes.PRIMITIVE, logo.primitives.RIGHT),
            new Token(33, "90", logo.tokenTypes.NUMBER, logo.primitives.NONE),
            new Token(36, "fd", logo.tokenTypes.PRIMITIVE, logo.primitives.FORWARD),
            new Token(39, "60", logo.tokenTypes.NUMBER, logo.primitives.NONE),
            new Token(42, "rt", logo.tokenTypes.PRIMITIVE, logo.primitives.RIGHT),
            new Token(45, "90", logo.tokenTypes.NUMBER, logo.primitives.NONE)
        ],
        tokenizer.tokenize("fd 60 rt 90 fd 60 rt 90 fd 60 rt 90 fd 60 rt 90")
    );
    assertTokens(
        'Square with REPEAT primitive and brackets next to other tokens',
        [
            new Token(0, "repeat", logo.tokenTypes.PRIMITIVE, logo.primitives.REPEAT),
            new Token(7, "4", logo.tokenTypes.NUMBER, logo.primitives.NONE),
            new Token(9, "[", logo.tokenTypes.DELIMITER, logo.primitives.NONE),
            new Token(10, "fd", logo.tokenTypes.PRIMITIVE, logo.primitives.FORWARD),
            new Token(13, "60", logo.tokenTypes.NUMBER, logo.primitives.NONE),
            new Token(16, "rt", logo.tokenTypes.PRIMITIVE, logo.primitives.RIGHT),
            new Token(19, "90", logo.tokenTypes.NUMBER, logo.primitives.NONE),
            new Token(21, "]", logo.tokenTypes.DELIMITER, logo.primitives.NONE)
        ],
        tokenizer.tokenize("repeat 4 [fd 60 rt 90]")
    );
    assertTokens(
        'Square with REPEAT primitive and brackets with spaces each side',
        [
            new Token(0, "repeat", logo.tokenTypes.PRIMITIVE, logo.primitives.REPEAT),
            new Token(7, "4", logo.tokenTypes.NUMBER, logo.primitives.NONE),
            new Token(9, "[", logo.tokenTypes.DELIMITER, logo.primitives.NONE),
            new Token(11, "fd", logo.tokenTypes.PRIMITIVE, logo.primitives.FORWARD),
            new Token(14, "60", logo.tokenTypes.NUMBER, logo.primitives.NONE),
            new Token(17, "rt", logo.tokenTypes.PRIMITIVE, logo.primitives.RIGHT),
            new Token(20, "90", logo.tokenTypes.NUMBER, logo.primitives.NONE),
            new Token(23, "]", logo.tokenTypes.DELIMITER, logo.primitives.NONE)
        ],
        tokenizer.tokenize("repeat 4 [ fd 60 rt 90 ]")
    );
    assertTokens(
        'Double REPEAT with inside one in the middle of the primitives of the first one',
        [
            new Token(0, "repeat", logo.tokenTypes.PRIMITIVE, logo.primitives.REPEAT),
            new Token(7, "3", logo.tokenTypes.NUMBER, logo.primitives.NONE),
            new Token(9, "[", logo.tokenTypes.DELIMITER, logo.primitives.NONE),
            new Token(10, "fd", logo.tokenTypes.PRIMITIVE, logo.primitives.FORWARD),
            new Token(13, "60", logo.tokenTypes.NUMBER, logo.primitives.NONE),
            new Token(16, "repeat", logo.tokenTypes.PRIMITIVE, logo.primitives.REPEAT),
            new Token(23, "4", logo.tokenTypes.NUMBER, logo.primitives.NONE),
            new Token(25, "[", logo.tokenTypes.DELIMITER, logo.primitives.NONE),
            new Token(26, "lt", logo.tokenTypes.PRIMITIVE, logo.primitives.LEFT),
            new Token(29, "90", logo.tokenTypes.NUMBER, logo.primitives.NONE),
            new Token(32, "bk", logo.tokenTypes.PRIMITIVE, logo.primitives.BACK),
            new Token(35, "20", logo.tokenTypes.NUMBER, logo.primitives.NONE),
            new Token(37, "]", logo.tokenTypes.DELIMITER, logo.primitives.NONE),
            new Token(39, "rt", logo.tokenTypes.PRIMITIVE, logo.primitives.RIGHT),
            new Token(42, "120", logo.tokenTypes.NUMBER, logo.primitives.NONE),
            new Token(45, "]", logo.tokenTypes.DELIMITER, logo.primitives.NONE)
        ],
        tokenizer.tokenize("repeat 3 [fd 60 repeat 4 [lt 90 bk 20] rt 120]")
    );
    assertTokens(
        'PROCEDURE with no parameters in one line and the PROCEDURE is not called',
        [
            new Token(0, "to", logo.tokenTypes.PRIMITIVE, logo.primitives.PRIMITIVE_TO),
            new Token(3, "line", logo.tokenTypes.PROCEDURE_NAME, logo.primitives.NONE),
            new Token(8, "fd", logo.tokenTypes.PRIMITIVE, logo.primitives.FORWARD),
            new Token(11, "60", logo.tokenTypes.NUMBER, logo.primitives.NONE),
            new Token(14, "end", logo.tokenTypes.PRIMITIVE, logo.primitives.PRIMITIVE_END)
        ],
        tokenizer.tokenize("to line fd 60 end")
    );
    assertTokens(
        'PROCEDURE with no parameters in multiple lines and the PROCEDURE is not called',
        [
            new Token(0, "to", logo.tokenTypes.PRIMITIVE, logo.primitives.PRIMITIVE_TO),
            new Token(3, "line", logo.tokenTypes.PROCEDURE_NAME, logo.primitives.NONE),
            new Token(8, "fd", logo.tokenTypes.PRIMITIVE, logo.primitives.FORWARD),
            new Token(11, "60", logo.tokenTypes.NUMBER, logo.primitives.NONE),
            new Token(14, "end", logo.tokenTypes.PRIMITIVE, logo.primitives.PRIMITIVE_END)
        ],
        tokenizer.tokenize(
            lines([
                "to line",
                "fd 60",
                "end"
            ])
        )
    );
    assertTokens(
        'PROCEDURE with no parameters in one line and the PROCEDURE is called once',
        [
            new Token(0, "to", logo.tokenTypes.PRIMITIVE, logo.primitives.PRIMITIVE_TO),
            new Token(3, "line", logo.tokenTypes.PROCEDURE_NAME, logo.primitives.NONE),
            new Token(8, "fd", logo.tokenTypes.PRIMITIVE, logo.primitives.FORWARD),
            new Token(11, "60", logo.tokenTypes.NUMBER, logo.primitives.NONE),
            new Token(14, "end", logo.tokenTypes.PRIMITIVE, logo.primitives.PRIMITIVE_END),
            new Token(18, "line", logo.tokenTypes.PROCEDURE_NAME, logo.primitives.NONE),
        ],
        tokenizer.tokenize("to line fd 60 end line")
    );
    assertTokens(
        'PROCEDURE with no parameters in multiple lines and the PROCEDURE is called once',
        [
            new Token(0, "to", logo.tokenTypes.PRIMITIVE, logo.primitives.PRIMITIVE_TO),
            new Token(3, "line", logo.tokenTypes.PROCEDURE_NAME, logo.primitives.NONE),
            new Token(8, "fd", logo.tokenTypes.PRIMITIVE, logo.primitives.FORWARD),
            new Token(11, "60", logo.tokenTypes.NUMBER, logo.primitives.NONE),
            new Token(14, "end", logo.tokenTypes.PRIMITIVE, logo.primitives.PRIMITIVE_END),
            new Token(18, "line", logo.tokenTypes.PROCEDURE_NAME, logo.primitives.NONE),
        ],
        tokenizer.tokenize(
            lines([
                "to line",
                "fd 60",
                "end",
                "line"
            ])
        )
    );
    assertTokens(
        'PROCEDURE with no parameters in one line and the PROCEDURE is called twice',
        [
            new Token(0, "to", logo.tokenTypes.PRIMITIVE, logo.primitives.PRIMITIVE_TO),
            new Token(3, "line", logo.tokenTypes.PROCEDURE_NAME, logo.primitives.NONE),
            new Token(8, "fd", logo.tokenTypes.PRIMITIVE, logo.primitives.FORWARD),
            new Token(11, "60", logo.tokenTypes.NUMBER, logo.primitives.NONE),
            new Token(14, "end", logo.tokenTypes.PRIMITIVE, logo.primitives.PRIMITIVE_END),
            new Token(18, "line", logo.tokenTypes.PROCEDURE_NAME, logo.primitives.NONE),
            new Token(23, "rt", logo.tokenTypes.PRIMITIVE, logo.primitives.RIGHT),
            new Token(26, "90", logo.tokenTypes.NUMBER, logo.primitives.NONE),
            new Token(29, "line", logo.tokenTypes.PROCEDURE_NAME, logo.primitives.NONE)
        ],
        tokenizer.tokenize("to line fd 60 end line rt 90 line")
    );
    assertTokens(
        'PROCEDURE with no parameters in multiple lines and the PROCEDURE is called twice',
        [
            new Token(0, "to", logo.tokenTypes.PRIMITIVE, logo.primitives.PRIMITIVE_TO),
            new Token(3, "line", logo.tokenTypes.PROCEDURE_NAME, logo.primitives.NONE),
            new Token(8, "fd", logo.tokenTypes.PRIMITIVE, logo.primitives.FORWARD),
            new Token(11, "60", logo.tokenTypes.NUMBER, logo.primitives.NONE),
            new Token(14, "end", logo.tokenTypes.PRIMITIVE, logo.primitives.PRIMITIVE_END),
            new Token(18, "line", logo.tokenTypes.PROCEDURE_NAME, logo.primitives.NONE),
            new Token(23, "rt", logo.tokenTypes.PRIMITIVE, logo.primitives.RIGHT),
            new Token(26, "90", logo.tokenTypes.NUMBER, logo.primitives.NONE),
            new Token(29, "line", logo.tokenTypes.PROCEDURE_NAME, logo.primitives.NONE)
        ],
        tokenizer.tokenize(
            lines([
                "to line",
                "fd 60",
                "end",
                "line",
                "rt 90",
                "line"
            ])
        )
    );
    assertTokens(
        'PROCEDURE with one parameter in one line and the PROCEDURE is called twice',
        [
            new Token(0, "to", logo.tokenTypes.PRIMITIVE, logo.primitives.PRIMITIVE_TO),
            new Token(3, "line", logo.tokenTypes.PROCEDURE_NAME, logo.primitives.NONE),
            new Token(8, ":length", logo.tokenTypes.VARIABLE, logo.primitives.NONE),
            new Token(16, "fd", logo.tokenTypes.PRIMITIVE, logo.primitives.FORWARD),
            new Token(19, ":length", logo.tokenTypes.VARIABLE, logo.primitives.NONE),
            new Token(27, "end", logo.tokenTypes.PRIMITIVE, logo.primitives.PRIMITIVE_END),
            new Token(31, "line", logo.tokenTypes.PROCEDURE_NAME, logo.primitives.NONE),
            new Token(36, "60", logo.tokenTypes.NUMBER, logo.primitives.NONE),
            new Token(39, "rt", logo.tokenTypes.PRIMITIVE, logo.primitives.RIGHT),
            new Token(42, "90", logo.tokenTypes.NUMBER, logo.primitives.NONE),
            new Token(45, "line", logo.tokenTypes.PROCEDURE_NAME, logo.primitives.NONE),
            new Token(50, "30", logo.tokenTypes.NUMBER, logo.primitives.NONE)
        ],
        tokenizer.tokenize("to line :length fd :length end line 60 rt 90 line 30")
    );
    assertTokens(
        'PROCEDURE with one parameter in multiple lines and the PROCEDURE is called twice',
        [
            new Token(0, "to", logo.tokenTypes.PRIMITIVE, logo.primitives.PRIMITIVE_TO),
            new Token(3, "line", logo.tokenTypes.PROCEDURE_NAME, logo.primitives.NONE),
            new Token(8, ":length", logo.tokenTypes.VARIABLE, logo.primitives.NONE),
            new Token(16, "fd", logo.tokenTypes.PRIMITIVE, logo.primitives.FORWARD),
            new Token(19, ":length", logo.tokenTypes.VARIABLE, logo.primitives.NONE),
            new Token(27, "end", logo.tokenTypes.PRIMITIVE, logo.primitives.PRIMITIVE_END),
            new Token(31, "line", logo.tokenTypes.PROCEDURE_NAME, logo.primitives.NONE),
            new Token(36, "60", logo.tokenTypes.NUMBER, logo.primitives.NONE),
            new Token(39, "rt", logo.tokenTypes.PRIMITIVE, logo.primitives.RIGHT),
            new Token(42, "90", logo.tokenTypes.NUMBER, logo.primitives.NONE),
            new Token(45, "line", logo.tokenTypes.PROCEDURE_NAME, logo.primitives.NONE),
            new Token(50, "30", logo.tokenTypes.NUMBER, logo.primitives.NONE)
        ],
        tokenizer.tokenize(
            lines([
                "to line :length",
                "fd :length",
                "end",
                "line 60",
                "rt 90",
                "line 30"
            ])
        )
    );
}

const logo = {
    "delimiters" :{
        "OPENING_BRACKET": "[",
        "CLOSING_BRACKET": "]"
    },
    "primitives" : {
        "NONE": 0,
        "FORWARD": 1,
        "BACK": 2,
        "LEFT": 3,
        "RIGHT": 4,
        "REPEAT": 5,
        "CLEARSCREEN": 6,
        "PRIMITIVE_TO": 7,
        "PRIMITIVE_END": 8
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
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.turtle = new Turtle(this.canvas);
        this.tokenizer = new Tokenizer();
        this.fps = 5;
        this.turtleExecutionQueue = [];
        this.procedures = [];
        window.addEventListener(new Parser().eventName(), e => {
            this.turtleExecutionQueue.push({
                methodname: e.detail.methodname,
                arg: e.detail.arg
            });
        });

        this.executionLoop();
    }
    executionLoop() {
        setInterval(() => {
            console.log("*");
            if (this.turtleExecutionQueue.length > 0) {
                let obj = this.turtleExecutionQueue.shift();
                this.turtle[obj.methodname](obj.arg);
            }
        }, 1000/this.fps);
    }
    run(script = "") {
        let tokens = this.tokenizer.tokenize(script);
        let parser = new Parser();
        parser.parse(tokens);
        //tokens.forEach(x => console.log(x.toString()));
    }
}

class Parser {
    eventName() { return "PARSER_ADD_TO_TURTLE_EXECUTION_QUEUE_EVENT"; }

    assignVariable(variableName) {
        let item = this.peekLastGoToProcedureStackItem();
        let parameters = item.parameters;
        let parameter = parameters.find(p => p.parameterName === variableName);
        let value = parseInt(parameter.parameterValue);
        return value;
    }
    execute_procedure_end() {
        console.log("** Execute procedure END");
        let item = this.goToProcedureStack.pop();
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
        console.log("** REPEAT begin");
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
        console.log("** REPEAT end");
        let currentLoop = this.loopStack.pop();
        if (currentLoop.remainingLoops > 0) {
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
            this.currentToken = new Token(this.currentTokenIndex, "", logo.tokenTypes.END_OF_TOKEN_STREAM);
        }
        console.log(`Current token: ${this.currentTokenIndex.toString().padStart(2, '0')} - ${this.currentToken}`);
    }
    getPrimitiveParameter() {
        this.getNextToken();
        if (this.currentToken.tokenType === logo.tokenTypes.NUMBER) {
            return parseInt(this.currentToken.text);
        } else if (this.currentToken.tokenType === logo.tokenTypes.VARIABLE) {        
            let value = this.assignVariable(this.currentToken.text);
            return value;
        }
    }
    initialize(tokens) {
        this.tokens = tokens;
        this.currentToken = {};
        this.currentTokenIndex = -1; // So when we get the first token, it will be 0, first index in an array.
        this.loopStack = [];
        this.procedures = [];
        this.goToProcedureStack = [];
    }
    parse(tokens) {
        this.initialize(tokens);

        let n = 0;

        do {
            this.getNextToken();            
            if (this.currentToken.tokenType === logo.tokenTypes.PRIMITIVE) {
                switch(this.currentToken.primitive) {
                    case logo.primitives.FORWARD:
                        n = this.getPrimitiveParameter();
                        this.raiseTurtleExecutionQueueEvent("execute_forward", n);
                        break;
                    case logo.primitives.BACK:
                        n = this.getPrimitiveParameter();
                        this.raiseTurtleExecutionQueueEvent("execute_backward", n);
                        break;
                    case logo.primitives.LEFT:
                        n = this.getPrimitiveParameter();
                        this.raiseTurtleExecutionQueueEvent("execute_left", n);
                        break;
                    case logo.primitives.RIGHT:
                        n = this.getPrimitiveParameter();
                        this.raiseTurtleExecutionQueueEvent("execute_right", n);
                        break;
                    case logo.primitives.REPEAT:
                        n = this.getPrimitiveParameter();
                        this.execute_repeat_begin(n);
                        break;
                    case logo.primitives.CLEARSCREEN:
                        this.raiseTurtleExecutionQueueEvent("execute_clearscreen");
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
        console.log("Finish parsing");
    }
    peekLastGoToProcedureStackItem() {
        return this.goToProcedureStack[this.goToProcedureStack.length - 1];
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
            
            let goToProcedureStackItem = {};
            goToProcedureStackItem["name"] = procedure.name;

            let values = [];
            procedure.parameters.forEach(p => {
                this.getNextToken();
                let value = {
                    parameterName: p,
                    parameterValue: this.currentToken.text
                };
                values.push(value);
            });
            goToProcedureStackItem["parameters"] = values;
            goToProcedureStackItem["currentTokenIndexBeforeJumpingToProcedure"] = this.currentTokenIndex;

            this.goToProcedureStack.push(goToProcedureStackItem);
            let indexBeforeFirstTokenInsideProcedure = procedure.firstTokenInsideProcedureIndex - 1;

            this.setCurrentTokenIndex(indexBeforeFirstTokenInsideProcedure); // So in the next getNextToken we have the first token inside the procedure
            console.log(`** Index set to: ${procedure.firstTokenInsideProcedureIndex}`, goToProcedureStackItem);
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
    EOF = "\0";
    LF = "\n";
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
        return `${logo.delimiters.OPENING_BRACKET}${logo.delimiters.CLOSING_BRACKET}`.indexOf(c) !== -1;
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
                this.getNextCharacter();
                while(this.isNewLine(this.currentCharacter)) {
                    this.getNextCharacter();
                }
                this.putbackCharacter();
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

module.exports.Tokenizer = Tokenizer;