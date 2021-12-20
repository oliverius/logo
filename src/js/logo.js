const logo = {
    "tokenizer": {
        "delimiters": {
            "OPENING_BRACKET": "[",
            "CLOSING_BRACKET": "]",
            "PLUS": "+",
            "MINUS": "-",
            "MULTIPLIEDBY": "*",
            "DIVIDEDBY": "/",
            "GREATERTHAN": ">",
            "LESSERTHAN": "<"
        },
        "primitives": {
            "NONE": 0,
            "FORWARD": 1,
            "BACK": 2,
            "LEFT": 3,
            "RIGHT": 4,
            "PENUP": 5,
            "PENDOWN": 6,
            "REPEAT": 7,
            "CLEARSCREEN": 8,
            "TO": 9,
            "END": 10,
            "IF": 11,
            "STOP": 12
        },
        "tokenTypes": {
            "NONE": 0,
            "DELIMITER": 1,
            "NUMBER": 2,
            "PRIMITIVE": 3,
            "VARIABLE": 4,
            "PROCEDURE_NAME": 5,
            "END_OF_TOKEN_STREAM": 6
        }
    },
    "parser": {
        "fps": 10,
        "maxProcedureCallStack": 100,
        "statusEvent": {
            "name": "PARSER_STATUS_EVENT",
            "values": {
                "NONE": 0,
                "START_PARSING": 1,
                "END_PARSING": 2
            }
        },
        "turtleDrawingEvent": {
            "name": "PARSER_TURTLE_DRAWING_EVENT"
        },
        "errorEvent": {
            "name": "PARSER_ERROR_EVENT",
            "values": {
                "NONE": 0,
                "PROCEDURE_CALL_STACK_OVERFLOW": 1
            }
        }
    },
    "interpreter": {
        "storageKey": "oliverius_logo",
        "localization": {
            "parserErrors": {
                "PROCEDURE_CALL_STACK_OVERFLOW": "You have called a procedure more than {0} times and we stop the program"
            }
        }
    },
    "primitiveAliases": [
        {
            "primitive": "FORWARD",
            "aliases": ["forward", "fd", "av"]
        },
        {
            "primitive": "BACK",
            "aliases": ["back", "bk", "re"]
        },
        {
            "primitive": "LEFT",
            "aliases": ["left", "lt", "gi"]
        },
        {
            "primitive": "RIGHT",
            "aliases": ["right", "rt", "gd"]
        },
        {
            "primitive": "PENUP",
            "aliases": ["penup", "pu", "sl"]
        },
        {
            "primitive": "PENDOWN",
            "aliases": ["pendown", "pd", "bl"]
        },
        {
            "primitive": "REPEAT",
            "aliases": ["repeat", "repite"]
        },
        {
            "primitive": "CLEARSCREEN",
            "aliases": ["clearscreen", "cs", "bp"]
        },
        {
            "primitive": "TO",
            "aliases": ["to", "para"]
        },
        {
            "primitive": "END",
            "aliases": ["end", "fin"]
        }, {
            "primitive": "IF",
            "aliases": ["if", "si"]
        },
        {
            "primitive": "STOP",
            "aliases": ["stop", "alto"]
        }]
};

class Procedure {
    name = "";
    inputs = [];
    primitiveToTokenIndex = 0;
    primitiveEndTokenIndex = 0;
    procedureBodyFirstTokenIndex = 0;
}

class Interpreter {
    constructor(editorId, canvasId, statusBarId, examplesDropdownId, languageDropdownId, i18n) {
        this.editor = document.getElementById(editorId);
        this.canvas = document.getElementById(canvasId);
        this.statusbar = document.getElementById(statusBarId);
        this.turtle = new Turtle(this.canvas);
        this.tokenizer = new Tokenizer(logo.primitiveAliases);
        this.parser = new Parser();
        
        logo.i18n = i18n;
        
        runTokenizerTests(this.tokenizer);
        runParserTests(this.tokenizer, this.parser);
        
        this.setUI("English", examplesDropdownId, languageDropdownId);
        
        this.addWindowEventListeners();
    }
    addWindowEventListeners() {
        window.addEventListener(logo.parser.errorEvent.name, e => {
            let message = "";
            switch (e.detail.errorCode) {
                case logo.parser.errorEvent.values.PROCEDURE_CALL_STACK_OVERFLOW:
                    message = logo.interpreter.localization.parserErrors.PROCEDURE_CALL_STACK_OVERFLOW;
                    message = message.replace("{0}", e.detail.args[0]);
                    break;
            }
            this.setStatusBar(message);
        });
        window.addEventListener(logo.parser.statusEvent.name, e => {
            if (e.detail.status === logo.parser.statusEvent.values.END_PARSING) {
                this.editor.focus();
            }
        });
        window.addEventListener(logo.parser.turtleDrawingEvent.name, e => {
            let arg = e.detail.arg;
            switch (e.detail.primitive) {
                case logo.tokenizer.primitives.FORWARD:
                    this.turtle.execute_forward(arg);
                    break;
                case logo.tokenizer.primitives.BACK:
                    this.turtle.execute_back(arg);
                    break;
                case logo.tokenizer.primitives.LEFT:
                    this.turtle.execute_left(arg);
                    break;
                case logo.tokenizer.primitives.RIGHT:
                    this.turtle.execute_right(arg);
                    break;
                case logo.tokenizer.primitives.PENUP:
                    this.turtle.execute_penup();
                    break;
                case logo.tokenizer.primitives.PENDOWN:
                    this.turtle.execute_pendown();
                    break;
                case logo.tokenizer.primitives.CLEARSCREEN:
                    this.turtle.execute_clearscreen();
                    break;
            }
        });
    }
    clear() {
        this.setEditor("");
        this.turtle.execute_clearscreen();
    }
    getLatestScriptRun() {
        return localStorage.getItem(logo.interpreter.storageKey) ?? "";
    }
    saveLatestScriptRun(script) {
        localStorage.setItem(logo.interpreter.storageKey, script);
    }
    setEditor(text) {
        this.editor.value = text;
        this.editor.focus();
    }
    setStatusBar(message) {
        this.statusbar.innerText = message;
    }
    setUI(language, examplesDropdownId, languageDropdownId) {
        this.setEditor(this.getLatestScriptRun());

        this.populateExamples(examplesDropdownId, language);

        let select = document.getElementById(languageDropdownId);
        select.addEventListener('change', (event) => {
            let selectedLanguage = event.target.value;
            logo.i18n[selectedLanguage].UI.forEach(uiElement => {
                let control = document.getElementById(uiElement.id);
                //control.innerText = uiElement.text;
                console.log(control.type);
            });
            
            
            this.populateExamples(examplesDropdownId, selectedLanguage);
        });
    }
    populateExamples(dropdownId, language = "English") {
        let select = document.getElementById(dropdownId);
        while (select.options.length > 0) {
            select.remove(0); // TODO we also remove the disable option that we didn't want to remove because it is the "title"
        }
        
        let examples = logo.i18n[language].examples;
        examples.forEach(example => {
            let option = document.createElement('option');
            option.value = example.name;
            option.text = example.name;
            select.appendChild(option);
        });

        select.removeEventListener('change', this);
        select.addEventListener('change', (event) => {            
            let example = examples.find(ex => ex.name === event.target.value);
            if (example !== undefined) {
                let code = example.code.join('\n');
                this.setEditor(code);
            }
        });
    }
    stop() {
        this.parser.stopParsing();
    }
    run() {
        let script = this.editor.value;
        this.setStatusBar("");
        this.saveLatestScriptRun(script);
        let tokens = this.tokenizer.tokenize(script);
        this.parser.parse(tokens);
    }
}

class Parser {    

    assignVariable(variableName) {
        let item = this.peekLastProcedureCallStackItem();
        let inputs = item.inputs;
        let input  = inputs.find(i => i.name === variableName);
        let value = parseInt(input.value); // TODO check value should be a number
        return value;
    }
    beginCodeBlock(primitive = logo.tokenizer.primitives.NONE, arg = 0) {
        this.getNextToken();
        if (this.currentToken.tokenType === logo.tokenizer.tokenTypes.DELIMITER &&
            this.currentToken.text === logo.tokenizer.delimiters.OPENING_BRACKET) {
            let firstTokenInsideCodeBlockIndex = this.currentTokenIndex;
            switch (primitive) {
                case logo.tokenizer.primitives.IF:
                    this.codeBlockStack.push({
                        primitive: primitive,
                        firstTokenInsideCodeBlockIndex: firstTokenInsideCodeBlockIndex
                    });
                    break;
                case logo.tokenizer.primitives.REPEAT:
                    this.codeBlockStack.push({
                        primitive: primitive,
                        firstTokenInsideCodeBlockIndex: firstTokenInsideCodeBlockIndex,
                        remainingLoops: arg - 1 // Why arg -1 if we send arg?
                    });
                    break;
            }
        } else {
            console.log("this should be an error"); // TODO better handling of this
        }
    }
    endCodeBlock() {
        if (this.codeBlockStack.length > 0) {
            let currentCodeBlock = this.codeBlockStack.pop();
            switch (currentCodeBlock.primitive) {
                case logo.tokenizer.primitives.IF:
                    break;
                case logo.tokenizer.primitives.REPEAT:
                    if (currentCodeBlock.remainingLoops > 0) {
                        currentCodeBlock.remainingLoops--;
                        this.setCurrentTokenIndex(currentCodeBlock.firstTokenInsideCodeBlockIndex);
                        this.codeBlockStack.push(currentCodeBlock);
                    }
                    break;
            }
        } else {
            throw "found a ] without being part of a IF or REPEAT"; // TODO more explicit
        }
    }
    execute_if() {
        let left = this.getExpression();
        this.getNextToken();
        let operator = this.currentToken.text;
        let right = this.getExpression();

        let condition = false;
        switch (operator) {
            case logo.tokenizer.delimiters.LESSERTHAN:
                condition = left < right;
                break;
            case logo.tokenizer.delimiters.GREATERTHAN:
                condition = left > right;
        }
        if (condition) {
            this.beginCodeBlock(logo.tokenizer.primitives.IF);
        } else {
            this.skipCodeBlock();
        }
    }
    skipCodeBlock() {
        this.getNextToken();
        if (this.currentToken.text === logo.tokenizer.delimiters.OPENING_BRACKET) {
            while (this.currentToken.text !== logo.tokenizer.delimiters.CLOSING_BRACKET) {
                this.getNextToken();
            }
        } else {
            throw "malformed code block";
        }
    }
    skipUntilEndOfProcedure() {
        while (this.currentToken.primitive !== logo.tokenizer.primitives.END) {
            this.getNextToken();
        }
    }
    execute_end() {
        let item = this.procedureCallStack.pop();
        this.setCurrentTokenIndex(item.procedureCallLastTokenIndex);
    }
    execute_to() {
        /*
            Procedure definition

            TO procedure_name :input1 :input2 ...
              ... body of the procedure ...
            END

            There must be only one procedure with procedure_name.
            Names of procedures and inputs are not case-sensitive.
            The number of inputs can be 0, 1, 2, ...
        */
        let procedure = new Procedure();

        procedure.primitiveToTokenIndex = this.currentTokenIndex;
        this.getNextToken();

        if (this.currentToken.tokenType === logo.tokenizer.tokenTypes.PROCEDURE_NAME) {
            
            procedure.name = this.currentToken.text;
            
            this.getNextToken();
            while (this.currentToken.tokenType === logo.tokenizer.tokenTypes.VARIABLE) {            
                procedure.inputs.push(this.currentToken.text);
                this.getNextToken();
            }
            procedure.procedureBodyFirstTokenIndex = this.currentTokenIndex;            

            this.skipUntilEndOfProcedure();

            procedure.primitiveEndTokenIndex = this.currentTokenIndex;

            console.table(procedure);

            this.procedures[procedure.name] = procedure;
        }
    }
    execute_repeat(n = 0) {
        this.beginCodeBlock(logo.tokenizer.primitives.REPEAT, n);
    }
    execute_stop() {
        this.skipUntilEndOfProcedure(); // The STOP will be inside a procedure, so we don't do anything until we reach the end
        this.putBackToken(); // So the END primitive will be the next one read in the next parsing step and we execute the END primitive code.
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
            this.getExpression_ApplyArithmeticOperation(operation, result, hold);
        }
    }
    getExpression_ApplyArithmeticOperation(operation, result, hold) {
        switch (operation) {
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
            default:
                break; // TODO will be an error
        }
    }
    getExpression_MultiplicationOrDivision(result) {
        let operation = "";
        this.getExpression_NumberOrVariableValue(result);
        while (this.currentToken.text === logo.tokenizer.delimiters.MULTIPLIEDBY ||
            this.currentToken.text === logo.tokenizer.delimiters.DIVIDEDBY) {
            operation = this.currentToken.text;
            this.getNextToken();
            let hold = {
                value: 0
            };
            this.getExpression_NumberOrVariableValue(hold);
            this.getExpression_ApplyArithmeticOperation(operation, result, hold);
        }
    }
    getExpression_NumberOrVariableValue(result) {
        switch (this.currentToken.tokenType) {
            case logo.tokenizer.tokenTypes.NUMBER:
                result.value = parseInt(this.currentToken.text);
                this.getNextToken();
                break;
            case logo.tokenizer.tokenTypes.VARIABLE:
                result.value = this.assignVariable(this.currentToken.text);
                this.getNextToken();
                break;
            default:
                // TODO error
                break;
        }
    }
    getNextToken() {
        this.currentTokenIndex++;
        if (this.currentTokenIndex < this.tokens.length) {
            this.currentToken = this.tokens[this.currentTokenIndex];
            console.log(`Current token: ${this.currentTokenIndex.toString().padStart(2, '0')} - ${this.currentToken}`);
        } else {
            this.currentToken = new Token(this.currentTokenIndex, "", logo.tokenizer.tokenTypes.END_OF_TOKEN_STREAM);
        }
    }
    initializeParsing(tokens = []) {
        this.tokens = tokens;
        this.currentToken = {};
        this.currentTokenIndex = -1; // So when we get the first token, it will be 0, first index in an array.
        this.codeBlockStack = [];
        this.procedures = {};
        this.procedureCallStack = [];
        this.stopParsingRequested = false;
    }
    parse(tokens) {
        this.initializeParsing(tokens);        

        this.raiseStatusEvent(logo.parser.statusEvent.values.START_PARSING);

        this.parsingLoop = setInterval(() => {
            console.log("⌛️💓"); // heartbeat
            if (this.currentToken.tokenType !== logo.tokenizer.tokenTypes.END_OF_TOKEN_STREAM &&
                !this.stopParsingRequested) {
                this.parsingStep();
            } else {
                clearInterval(this.parsingLoop);
                this.raiseStatusEvent(logo.parser.statusEvent.values.END_PARSING);
            }
        }, 1000 / logo.parser.fps);
    }
    parsingStep() {
        this.getNextToken();
        if (this.currentToken.tokenType === logo.tokenizer.tokenTypes.PRIMITIVE) {
            switch (this.currentToken.primitive) {
                case logo.tokenizer.primitives.FORWARD:
                    this.raiseTurtleDrawingEvent(logo.tokenizer.primitives.FORWARD, this.getExpression());
                    break;
                case logo.tokenizer.primitives.BACK:
                    this.raiseTurtleDrawingEvent(logo.tokenizer.primitives.BACK, this.getExpression());
                    break;
                case logo.tokenizer.primitives.LEFT:
                    this.raiseTurtleDrawingEvent(logo.tokenizer.primitives.LEFT, this.getExpression());
                    break;
                case logo.tokenizer.primitives.RIGHT:
                    this.raiseTurtleDrawingEvent(logo.tokenizer.primitives.RIGHT, this.getExpression());
                    break;
                case logo.tokenizer.primitives.PENUP:
                    this.raiseTurtleDrawingEvent(logo.tokenizer.primitives.PENUP);
                    break;
                case logo.tokenizer.primitives.PENDOWN:
                    this.raiseTurtleDrawingEvent(logo.tokenizer.primitives.PENDOWN);
                    break;
                case logo.tokenizer.primitives.REPEAT:
                    this.execute_repeat(this.getExpression());
                    break;
                case logo.tokenizer.primitives.CLEARSCREEN:
                    this.raiseTurtleDrawingEvent(logo.tokenizer.primitives.CLEARSCREEN);
                    break;
                case logo.tokenizer.primitives.TO:
                    this.execute_to();
                    break;
                case logo.tokenizer.primitives.END:
                    this.execute_end();
                    break;
                case logo.tokenizer.primitives.IF:
                    this.execute_if()
                    break;
                case logo.tokenizer.primitives.STOP:
                    this.execute_stop();
                    break;
            }
        } else if (this.currentToken.tokenType === logo.tokenizer.tokenTypes.DELIMITER) {
            if (this.currentToken.text === logo.tokenizer.delimiters.CLOSING_BRACKET) {
                this.endCodeBlock();
            }
        } else if (this.currentToken.tokenType === logo.tokenizer.tokenTypes.PROCEDURE_NAME) {
            this.jumpToProcedure(this.currentToken.text);
        }
    }
    peekLastProcedureCallStackItem() {
        return this.procedureCallStack[this.procedureCallStack.length - 1];
    }
    putBackToken() {
        this.currentTokenIndex--;
        this.currentToken = this.tokens[this.currentTokenIndex];
    }
    raiseErrorEvent(errorCode = logo.parser.errorEvent.values.NONE, args = []) {
        let event = new CustomEvent(logo.parser.errorEvent.name, {
            bubbles: true,
            detail: {
                errorCode: errorCode,
                args: args
            }
        });
        window.dispatchEvent(event);
    }
    raiseStatusEvent(status = logo.parser.statusEvent.values.NONE) {
        let event = new CustomEvent(logo.parser.statusEvent.name, {
            bubbles: true,
            detail: {
                status: status
            }
        });
        window.dispatchEvent(event);
    }
    raiseTurtleDrawingEvent(primitive = logo.tokenizer.primitives.NONE, arg = 0) {
        let event = new CustomEvent(logo.parser.turtleDrawingEvent.name, {
            bubbles: true,
            detail: {
                primitive: primitive,
                arg: arg
            }
        });
        window.dispatchEvent(event);
    }
    jumpToProcedure(name) {
        if (this.procedures[name] !== undefined) {
            if (this.procedureCallStack.length + 1 > logo.parser.maxProcedureCallStack) {
                this.stopParsing();
                this.raiseErrorEvent(
                    logo.parser.errorEvent.values.PROCEDURE_CALL_STACK_OVERFLOW,
                    [
                        logo.parser.maxProcedureCallStack
                    ]);
                return;
            }

            let procedure = this.procedures[name];

            let assignedInputs = [];
            procedure.inputs.forEach(input => {
                assignedInputs.push({
                    name: input,
                    value: this.getExpression()
                });
            });

            let procedureCallStackItem = {
                name : procedure.name,
                inputs: assignedInputs,
                procedureCallLastTokenIndex: this.currentTokenIndex
            };

            this.procedureCallStack.push(procedureCallStackItem);

            this.setCurrentTokenIndex(procedure.procedureBodyFirstTokenIndex - 1);
        }
    }
    setCurrentTokenIndex(index) {
        this.currentTokenIndex = index;
    }
    stopParsing() {
        this.stopParsingRequested = true;
    }
}
class Token {
    constructor(startIndex = 0, text = "", tokenType = logo.tokenizer.tokenTypes.NONE, primitive = logo.tokenizer.primitives.NONE) {
        this.startIndex = startIndex;
        this.text = text;
        this.endIndex = startIndex + text.length - 1;
        this.tokenType = tokenType;
        this.primitive = primitive;
    }
    getKey = (value, jsonObject) => Object.keys(jsonObject).find(key => jsonObject[key] === value);
    get[Symbol.toStringTag]() {
        let tokenTypeKey = this.getKey(this.tokenType, logo.tokenizer.tokenTypes);
        let primitiveKey = this.getKey(this.primitive, logo.tokenizer.primitives);

        let paddedStartIndex = this.startIndex.toString().padStart(3, '0');
        let paddedEndIndex = this.endIndex.toString().padStart(3, '0');

        let tokenWithEscapedCharacters = this.text !== "\n" ? this.text : "\\n";

        return `Token (${paddedStartIndex}-${paddedEndIndex}) "${tokenWithEscapedCharacters}" ${tokenTypeKey} {${primitiveKey}}`;
    }
}

class Tokenizer {
    LF = "\n";
    NUL = "\0";
    VARIABLE_PREFIX = ":";
    constructor(primitiveAliases = []) {
        this.aliases = this.populatePrimitiveAliasesDictionary(primitiveAliases);
    }
    getNextCharacter() {
        this.currentIndex++;
        if (this.currentIndex < this.script.length) {
            this.currentCharacter = this.script[this.currentIndex];
        } else {
            this.currentCharacter = this.NUL;
        }
        //console.log(`Current character: ${this.currentIndex.toString().padStart(2, '0')} - ${this.currentCharacter}`);
    }
    getPrimitive(primitiveAlias = "") {
        let key = this.aliases[primitiveAlias.toLowerCase()];
        let primitive = logo.tokenizer.primitives[key] ?? logo.tokenizer.primitives.NONE;
        return primitive;
    }
    initialize(script) {
        this.script = script;
        this.tokens = [];
        this.currentIndex = -1; // So when we get the first character, it will be script[0]
        this.currentCharacter = '';
        this.delimiters = [
            logo.tokenizer.delimiters.OPENING_BRACKET,
            logo.tokenizer.delimiters.CLOSING_BRACKET,
            logo.tokenizer.delimiters.PLUS,
            logo.tokenizer.delimiters.MINUS,
            logo.tokenizer.delimiters.MULTIPLIEDBY,
            logo.tokenizer.delimiters.DIVIDEDBY,
            logo.tokenizer.delimiters.GREATERTHAN,
            logo.tokenizer.delimiters.LESSERTHAN
        ].join(''); // TODO to do reflection in logo.tokenizer.delimiters and get them from there
    }
    isDelimiter(c) {
        return this.delimiters.indexOf(c) !== -1;
    }
    isEndOfFile(c) {
        return c === this.NUL;
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
    populatePrimitiveAliasesDictionary(primitiveAliases = []) { 
        let dictionary = {};
        primitiveAliases.forEach(item => {
          item.aliases.forEach(alias => {
            dictionary[alias] = item.primitive;
          });
        });
        return dictionary;
      }
    putBackCharacter() {
        this.currentIndex--;
        this.currentCharacter = this.script[this.currentIndex];
    }
    tokenize(script = "") {
        this.initialize(script);

        do {
            this.getNextCharacter();
            if (this.isWhiteSpace(this.currentCharacter)) {
                this.getNextCharacter();
                while (this.isWhiteSpace(this.currentCharacter)) {
                    this.getNextCharacter();
                }
                this.putBackCharacter();
            } else if (this.isNewLine(this.currentCharacter)) {
                let token = new Token(this.currentIndex, this.currentCharacter, logo.tokenizer.tokenTypes.DELIMITER);
                this.tokens.push(token);
            } else if (this.isDelimiter(this.currentCharacter)) {
                let token = new Token(this.currentIndex, this.currentCharacter, logo.tokenizer.tokenTypes.DELIMITER);
                this.tokens.push(token);
            } else if (this.isNumber(this.currentCharacter)) {
                let number = this.currentCharacter;
                let startIndex = this.currentIndex;
                this.getNextCharacter();
                while (this.isNumber(this.currentCharacter)) {
                    number += this.currentCharacter;
                    this.getNextCharacter();
                }
                let token = new Token(startIndex, number, logo.tokenizer.tokenTypes.NUMBER);
                this.tokens.push(token);
                this.putBackCharacter();
            } else if (this.isLetter(this.currentCharacter)) {
                let word = this.currentCharacter;
                let startIndex = this.currentIndex;
                this.getNextCharacter();
                while (this.isLetter(this.currentCharacter)) {
                    word += this.currentCharacter;
                    this.getNextCharacter();
                }
                this.putBackCharacter();
                let primitive = this.getPrimitive(word);
                if (primitive === logo.tokenizer.primitives.NONE) {
                    let token = new Token(startIndex, word, logo.tokenizer.tokenTypes.PROCEDURE_NAME, primitive);
                    this.tokens.push(token);
                } else {
                    let token = new Token(startIndex, word, logo.tokenizer.tokenTypes.PRIMITIVE, primitive);
                    this.tokens.push(token);
                }
            } else if (this.isVariablePrefix(this.currentCharacter)) {
                let variable = this.currentCharacter;
                let startIndex = this.currentIndex;
                this.getNextCharacter();
                while (this.isLetter(this.currentCharacter)) {
                    variable += this.currentCharacter;
                    this.getNextCharacter();
                }
                this.putBackCharacter();
                let token = new Token(startIndex, variable, logo.tokenizer.tokenTypes.VARIABLE);
                this.tokens.push(token);
            } else {
                if (!this.isEndOfFile(this.currentCharacter)) {
                    console.log(`Unexpected character: "${this.currentCharacter}" ${this.currentCharacter.charCodeAt(0)}`);
                }
            }
            //console.log(`Check last token index with current index  ${this.currentIndex}`)
        } while (!this.isEndOfFile(this.currentCharacter))

        return this.tokens;
    }
}

class Turtle {
    DEGREE_TO_RADIAN = Math.PI / 180;
    toRadians = (deg = 0) => Number(deg * this.DEGREE_TO_RADIAN);

    constructor(canvasObject) {
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
        this.incrementTurtleOrientation(-this.orientation);
        this.drawTurtle();

        this.renderFrame();
    }
    execute_forward(n = 0) {
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
        this.isPenDown = true;
    }
    execute_penup() {
        this.isPenDown = false;
    }
    execute_right(deg = 0) {
        this.incrementTurtleOrientation(deg);

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
        let y1 = this.y - height / 2;
        let x2 = x1 + r * Math.cos(angle);
        let y2 = y1 - r * Math.sin(angle);
        let x3 = x2 - 2 * halfbase;
        let y3 = y2;

        this.turtleCtx.resetTransform();;
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
const interpreter = new Interpreter(
    'logo-editor',
    'logo-graphics',
    'logo-statusbar',
    'logo-examples',
    'logo-languages',
    i18n);