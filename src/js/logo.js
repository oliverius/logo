// LOGO
class Procedure {
    name = "";
    inputs = [];
    primitiveToTokenIndex = 0;
    primitiveEndTokenIndex = 0;
    procedureBodyFirstTokenIndex = 0;
}

class Interpreter {
    // Color names taken from Berkely LOGO 6.1 manual
    // Colors taken from css colors, except Grey which matches our grey background
    // The values are the index in the array 0..15
    static colors = [
        {   "name": "black",
            "color": "#000000"
        },
        {
            "name": "blue",
            "color": "#0000FF"
        },
        {
            "name": "green",
            "color": "#008000"
        },
        {
            "name": "cyan",
            "color": "#00FFFF"
        },
        {
            "name": "red",
            "color": "#FF0000"
        },
        {
            "name": "magenta",
            "color": "#FF00FF"
        },
        {
            "name": "yellow",
            "color": "#FFFF00"
        },
        {
            "name": "white",
            "color": "#FFFFFF"
        },
        {
            "name": "brown",
            "color": "#A52A2A"
        },
        {
            "name": "tan",
            "color": "#D2B48C"
        },
        {
            "name": "forest",
            "color": "#228B22" // ForestGreen in css
        },
        {
            "name": "aqua",
            "color": "#00FFFF" // Same as cyan in css
        },
        {
            "name": "salmon",
            "color": "#FA8072"
        },
        {
            "name": "purple",
            "color": "#800080"
        },
        {
            "name": "orange",
            "color": "#FFA500"
        },
        {
            "name": "grey",
            "color": "#E8E8E8" // Different than css, this one matches our background color
        }
    ];
    constructor(editorId, canvasId, statusBarId, examplesDropdownId, languageDropdownId, i18n, defaultLanguage) {
        
        this.storageKey = "oliverius_logo";

        this.i18n = i18n;
        this.locale = this.i18n[defaultLanguage];

        this.editor = document.getElementById(editorId);
        this.canvas = document.getElementById(canvasId);
        this.statusbar = document.getElementById(statusBarId);
        this.turtle = new Turtle(this.canvas);
        this.tokenizer = new Tokenizer(this.locale.primitiveAliases);
        this.parser = new Parser();

        runTokenizerTests(i18n);
        runParserTests(Tokenizer, Parser, i18n);

        this.setUI(examplesDropdownId, languageDropdownId);
        
        this.addWindowEventListeners();
    }
    addWindowEventListeners() {
        window.addEventListener(Parser.events.logEvent.name, e => {
            switch(e.detail.type) {
                case Parser.events.logEvent.types.INFO:
                    console.log(`%c${e.detail.message}`, "color:blue");
                    break;
                case Parser.events.logEvent.types.ERROR:
                    let message = "";
                    switch (e.detail.errorCode) {
                        case Parser.errors.PROCEDURE_CALL_STACK_OVERFLOW:
                            message = this.locale.errors.PROCEDURE_CALL_STACK_OVERFLOW;
                            message = message.replace("{0}", e.detail.args[0]);
                            break;
                        case Parser.errors.UNMATCHED_CLOSING_BRACKET:
                            message = this.locale.errors.UNMATCHED_CLOSING_BRACKET;
                            break;
                        case Parser.errors.CODEBLOCK_EXPECTED_OPENING_BRACKET:
                            message = this.locale.errors.CODEBLOCK_EXPECTED_OPENING_BRACKET;
                            break;
                        case Parser.errors.EXPECTED_NUMBER_OR_VARIABLE:
                            message = this.locale.errors.EXPECTED_NUMBER_OR_VARIABLE;
                            message = message.replace("{0}", e.detail.args[0]);
                            break;
                        case Parser.errors.PROCEDURE_NOT_DEFINED:
                            message = this.locale.errors.PROCEDURE_NOT_DEFINED;
                            message = message.replace("{0}", e.detail.args[0]);
                            break;
                        case Parser.errors.UNKNOWN_TOKEN_FOUND:
                            message = this.locale.errors.UNKNOWN_TOKEN_FOUND;
                            message = message.replace("{0}", e.detail.args[0]);
                            break;
                    }
                    this.setStatusBar(message);
                    this.stop();
                    break;
            }
        });
        window.addEventListener(Parser.events.statusEvent.name, e => {
            if (e.detail.status === Parser.events.statusEvent.values.END_PARSING) {
                this.editor.focus();
            }
        });
        window.addEventListener(Parser.events.turtleDrawingEvent.name, e => {
            let arg = e.detail.arg;
            switch (e.detail.primitive) {
                case Tokenizer.primitives.FORWARD:
                    this.turtle.execute_forward(arg);
                    break;
                case Tokenizer.primitives.BACK:
                    this.turtle.execute_back(arg);
                    break;
                case Tokenizer.primitives.LEFT:
                    this.turtle.execute_left(arg);
                    break;
                case Tokenizer.primitives.RIGHT:
                    this.turtle.execute_right(arg);
                    break;
                case Tokenizer.primitives.PENUP:
                    this.turtle.execute_penup();
                    break;
                case Tokenizer.primitives.PENDOWN:
                    this.turtle.execute_pendown();
                    break;
                case Tokenizer.primitives.CLEARSCREEN:
                    this.turtle.execute_clearscreen();
                    break;
                case Tokenizer.primitives.SETPENCOLOR:
                    this.turtle.execute_setpencolor(this.getColor(arg));
                    break;
                case Tokenizer.primitives.SETBACKGROUND:
                    this.turtle.execute_setbackground(this.getColor(arg));
                    break;
                case Tokenizer.primitives.HOME:
                    this.turtle.execute_home();
                    break;
                case Tokenizer.primitives.CLEAN:
                    this.turtle.execute_clean();
                    break;
            }
        });
    }
    clear() {
        this.setEditor("");
        this.setStatusBar("");
        this.turtle.execute_clearscreen();
    }
    getColor(value = 0) {
        if (value < 0 || value > Interpreter.colors.length) {
            // TODO Error if color not found or if we find more than one
        }        
        return Interpreter.colors[value].color;
    }
    getLatestScriptRun() {        
        return localStorage.getItem(this.storageKey) ?? "";
    }
    populateExamples(dropdownId, language, title, examples) {
        let select = document.getElementById(dropdownId);

        select.removeEventListener('change', this);

        while (select.options.length > 0) {
            select.remove(0);
        }

        let titleOption = document.createElement('option');
        titleOption.value = title;
        titleOption.text = title;
        titleOption.disabled = true;
        titleOption.selected = true;
        select.appendChild(titleOption);

        examples.forEach(example => {
            let option = document.createElement('option');
            option.value = example.name;
            option.text = example.name;
            select.appendChild(option);
        });

        select.addEventListener('change', (event) => {
            let example = examples.find(ex => ex.name === event.target.value);
            if (example !== undefined) {
                let code = example.code.join('\n');
                this.setEditor(code);
            }
        });        
    }
    saveLatestScriptRun(script) {
        localStorage.setItem(this.storageKey, script);
    }
    setEditor(text) {
        this.editor.value = text;
        this.editor.focus();
    }
    setStatusBar(message) {
        this.statusbar.innerText = message;
    }
    setUI(examplesDropdownId, languageDropdownId) {
        let select = document.getElementById(languageDropdownId);
        select.addEventListener('change', (event) => {
            let selectedLanguage = event.target.value;

            this.locale = this.i18n[selectedLanguage];
            
            this.locale.UI.forEach(uiElement => {
                let control = document.getElementById(uiElement.id);
                switch(control.type) {
                    case "button":
                        control.innerText = uiElement.text;
                        break;
                    case "select-one":
                        let title = uiElement.text;
                        let examples = this.locale.examples;
                        this.populateExamples(examplesDropdownId, selectedLanguage, title, examples);
                        break;
                }
            });
            this.tokenizer = new Tokenizer(this.locale.primitiveAliases);
            this.clear();
        });

        this.triggerChange(select); // To populate it for the first time

        this.setEditor(this.getLatestScriptRun());
    }
    triggerChange(element) {
        let changeEvent = new Event('change');
        element.dispatchEvent(changeEvent);
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
    static errors = {
        "NONE": 0,
        "PROCEDURE_CALL_STACK_OVERFLOW": 1,
        "UNMATCHED_CLOSING_BRACKET": 2,
        "CODEBLOCK_EXPECTED_OPENING_BRACKET": 3,
        "EXPECTED_NUMBER_OR_VARIABLE": 4,
        "PROCEDURE_NOT_DEFINED": 5,
        "UNKNOWN_TOKEN_FOUND": 6
    };
    static events = {
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
        "logEvent": {
            "name": "PARSER_LOG_EVENT",
            "types": {
                "NONE": 0,
                "INFO": 1,
                "ERROR": 2
            }           
        }
    };
    constructor() {
        this.fps = 10;
        this.maxProcedureCallStack = 100;
    }
    assignVariable(variableName) {        
        let item = this.peekLastProcedureCallStackItem();
        let inputs = item.inputs;
        let input  = inputs.find(i => i.name === variableName);        
        let value = parseInt(input.value);
        return value;
    }
    beginCodeBlock(primitive = Tokenizer.primitives.NONE, arg = 0) {
        this.getNextToken();
        if (this.currentToken.tokenType === Tokenizer.tokenTypes.DELIMITER &&
            this.currentToken.text === Tokenizer.delimiters.OPENING_BRACKET) {
            let firstTokenInsideCodeBlockIndex = this.currentTokenIndex;
            switch (primitive) {
                case Tokenizer.primitives.IF:
                    this.codeBlockStack.push({
                        primitive: primitive,
                        firstTokenInsideCodeBlockIndex: firstTokenInsideCodeBlockIndex
                    });
                    break;
                case Tokenizer.primitives.REPEAT:
                    this.codeBlockStack.push({
                        primitive: primitive,
                        firstTokenInsideCodeBlockIndex: firstTokenInsideCodeBlockIndex,
                        remainingLoops: arg - 1
                    });
                    break;
            }
        } else {
            this.raiseErrorEvent(Parser.errors.CODEBLOCK_EXPECTED_OPENING_BRACKET, []);
        }
    }
    endCodeBlock() {
        if (this.codeBlockStack.length > 0) {
            let currentCodeBlock = this.codeBlockStack.pop();
            switch (currentCodeBlock.primitive) {
                case Tokenizer.primitives.IF:
                    break;
                case Tokenizer.primitives.REPEAT:
                    if (currentCodeBlock.remainingLoops > 0) {
                        currentCodeBlock.remainingLoops--;
                        this.setCurrentTokenIndex(currentCodeBlock.firstTokenInsideCodeBlockIndex);
                        this.codeBlockStack.push(currentCodeBlock);
                    }
                    break;
            }
        } else {
            this.raiseErrorEvent(Parser.errors.UNMATCHED_CLOSING_BRACKET, []);
        }
    }
    execute_if() {
        let left = this.getExpression();
        this.getNextToken();
        let operator = this.currentToken.text;
        let right = this.getExpression();

        let condition = false;
        switch (operator) {
            case Tokenizer.delimiters.LESSERTHAN:
                condition = left < right;
                break;
            case Tokenizer.delimiters.GREATERTHAN:
                condition = left > right;
        }
        if (condition) {
            this.beginCodeBlock(Tokenizer.primitives.IF);
        } else {
            this.skipCodeBlock();
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

        if (this.currentToken.tokenType === Tokenizer.tokenTypes.PROCEDURE_NAME) {
            
            procedure.name = this.currentToken.text;
            
            this.getNextToken();
            while (this.currentToken.tokenType === Tokenizer.tokenTypes.VARIABLE) {
                procedure.inputs.push(this.currentToken.text);
                this.getNextToken();
            }
            procedure.procedureBodyFirstTokenIndex = this.currentTokenIndex;

            this.skipUntilEndOfProcedure();

            procedure.primitiveEndTokenIndex = this.currentTokenIndex;

            this.procedures[procedure.name] = procedure;
        }
    }
    execute_repeat(n = 0) {
        this.beginCodeBlock(Tokenizer.primitives.REPEAT, n);
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
        while (this.currentToken.text === Tokenizer.delimiters.PLUS ||
            this.currentToken.text === Tokenizer.delimiters.MINUS) {
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
            case Tokenizer.delimiters.PLUS:
                result.value += hold.value;
                break;
            case Tokenizer.delimiters.MINUS:
                result.value -= hold.value;
                break;
            case Tokenizer.delimiters.MULTIPLIEDBY:
                result.value *= hold.value;
                break;
            case Tokenizer.delimiters.DIVIDEDBY:
                result.value /= hold.value;
                break;
            default:
                break;
        }
    }
    getExpression_MultiplicationOrDivision(result) {
        let operation = "";
        this.getExpression_NumberOrVariableValue(result);
        while (this.currentToken.text === Tokenizer.delimiters.MULTIPLIEDBY ||
            this.currentToken.text === Tokenizer.delimiters.DIVIDEDBY) {
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
            case Tokenizer.tokenTypes.NUMBER:
                result.value = parseInt(this.currentToken.text);
                this.getNextToken();
                break;
            case Tokenizer.tokenTypes.VARIABLE:
                result.value = this.assignVariable(this.currentToken.text);
                this.getNextToken();
                break;
            default:
                this.raiseErrorEvent(Parser.errors.EXPECTED_NUMBER_OR_VARIABLE, [ this.currentToken.text ]);
                break;
        }
    }
    getNextToken() {
        this.currentTokenIndex++;
        if (this.currentTokenIndex < this.tokens.length) {
            this.currentToken = this.tokens[this.currentTokenIndex];
            this.raiseLogEvent(
                Parser.events.logEvent.types.INFO,
                `Current token: ${this.currentTokenIndex.toString().padStart(2, '0')} - ${this.currentToken}`);
        } else {
            this.currentToken = new Token(this.currentTokenIndex, "", Tokenizer.tokenTypes.END_OF_TOKEN_STREAM);
        }
    }
    initializeParsing(tokens = []) {
        // The check for unknown token is here and not in 'parse(tokens)' because for tests we override 'parse(tokens)'
        // with another method that doesn't require a timer (so tests work as fast as they can)
        // and this is the method that will be called always when parsing
        let firstUnknownToken = tokens.find(token => token.tokenType === Tokenizer.tokenTypes.UNKNOWN_TOKEN);
        if (firstUnknownToken !== undefined) {
            this.raiseErrorEvent(Parser.errors.UNKNOWN_TOKEN_FOUND, [ firstUnknownToken.text ]);
        }
        this.tokens = tokens;
        this.currentToken = {};
        this.currentTokenIndex = -1; // So when we get the first token, it will be 0, first index in an array.
        this.codeBlockStack = [];
        this.procedures = {};
        this.procedureCallStack = [];
        this.stopParsingRequested = false;
    }
    jumpToProcedure(name) {
        if (this.procedures[name] !== undefined) {
            if (this.procedureCallStack.length + 1 > this.maxProcedureCallStack) {
                this.stopParsing();
                this.raiseErrorEvent(Parser.errors.PROCEDURE_CALL_STACK_OVERFLOW, [this.maxProcedureCallStack]);
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
        } else {
            this.raiseErrorEvent(Parser.errors.PROCEDURE_NOT_DEFINED, [ name ]);
        }
    }
    parse(tokens) {
        this.initializeParsing(tokens);        

        this.raiseStatusEvent(Parser.events.statusEvent.values.START_PARSING);

        this.parsingLoop = setInterval(() => {
            this.raiseLogEvent(Parser.events.logEvent.types.INFO, "⌛️💓"); // heartbeat
            if (this.currentToken.tokenType !== Tokenizer.tokenTypes.END_OF_TOKEN_STREAM &&
                !this.stopParsingRequested) {
                this.parsingStep();
            } else {
                clearInterval(this.parsingLoop);
                this.raiseStatusEvent(Parser.events.statusEvent.values.END_PARSING);
            }
        }, 1000 / this.fps);
    }
    parsingStep() {
        this.getNextToken();
        if (this.currentToken.tokenType === Tokenizer.tokenTypes.PRIMITIVE) {
            switch (this.currentToken.primitive) {
                case Tokenizer.primitives.FORWARD:
                    this.raiseTurtleDrawingEvent(Tokenizer.primitives.FORWARD, this.getExpression());
                    break;
                case Tokenizer.primitives.BACK:
                    this.raiseTurtleDrawingEvent(Tokenizer.primitives.BACK, this.getExpression());
                    break;
                case Tokenizer.primitives.LEFT:
                    this.raiseTurtleDrawingEvent(Tokenizer.primitives.LEFT, this.getExpression());
                    break;
                case Tokenizer.primitives.RIGHT:
                    this.raiseTurtleDrawingEvent(Tokenizer.primitives.RIGHT, this.getExpression());
                    break;
                case Tokenizer.primitives.PENUP:
                    this.raiseTurtleDrawingEvent(Tokenizer.primitives.PENUP);
                    break;
                case Tokenizer.primitives.PENDOWN:
                    this.raiseTurtleDrawingEvent(Tokenizer.primitives.PENDOWN);
                    break;
                case Tokenizer.primitives.REPEAT:
                    this.execute_repeat(this.getExpression());
                    break;
                case Tokenizer.primitives.CLEARSCREEN:
                    this.raiseTurtleDrawingEvent(Tokenizer.primitives.CLEARSCREEN);
                    break;
                case Tokenizer.primitives.TO:
                    this.execute_to();
                    break;
                case Tokenizer.primitives.END:
                    this.execute_end();
                    break;
                case Tokenizer.primitives.IF:
                    this.execute_if()
                    break;
                case Tokenizer.primitives.STOP:
                    this.execute_stop();
                    break;
                case Tokenizer.primitives.SETPENCOLOR:
                    this.raiseTurtleDrawingEvent(Tokenizer.primitives.SETPENCOLOR, this.getExpression());
                    break;
                case Tokenizer.primitives.SETBACKGROUND:
                    this.raiseTurtleDrawingEvent(Tokenizer.primitives.SETBACKGROUND, this.getExpression());
                    break;
                case Tokenizer.primitives.HOME:
                    this.raiseTurtleDrawingEvent(Tokenizer.primitives.HOME);
                    break;
                case Tokenizer.primitives.CLEAN:
                    this.raiseTurtleDrawingEvent(Tokenizer.primitives.CLEAN);
                    break;
            }
        } else if (this.currentToken.tokenType === Tokenizer.tokenTypes.DELIMITER) {
            if (this.currentToken.text === Tokenizer.delimiters.CLOSING_BRACKET) {
                this.endCodeBlock();
            }
        } else if (this.currentToken.tokenType === Tokenizer.tokenTypes.PROCEDURE_NAME) {
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
    raiseEvent(name = "", payload = {}) {
        let event = new CustomEvent(name, {
            bubbles: true,
            detail: payload
        });
        window.dispatchEvent(event);
    }
    raiseLogEvent(type = Parser.events.logEvent.types.NONE, message = "") {
        this.raiseEvent(Parser.events.logEvent.name, {
            type: Parser.events.logEvent.types.INFO,
            message: message
        });
    }
    raiseErrorEvent(errorCode = Parser.errors.NONE, args = []) {
        this.raiseEvent(Parser.events.logEvent.name, {
            type: Parser.events.logEvent.types.ERROR,
            errorCode: errorCode,
            args: args
        });
    }    
    raiseStatusEvent(status = Parser.events.statusEvent.values.NONE) {
        this.raiseEvent(Parser.events.statusEvent.name, { status: status });
    }
    raiseTurtleDrawingEvent(primitive = Tokenizer.primitives.NONE, arg = 0) {
        this.raiseEvent(Parser.events.turtleDrawingEvent.name, {
            primitive: primitive,
            arg: arg
        });
    }
    skipCodeBlock() {
        this.getNextToken();
        if (this.currentToken.text === Tokenizer.delimiters.OPENING_BRACKET) {
            while (this.currentToken.text !== Tokenizer.delimiters.CLOSING_BRACKET) {
                this.getNextToken();
            }
        } else {
            this.raiseErrorEvent(Parser.errors.CODEBLOCK_EXPECTED_OPENING_BRACKET, []);
        }
    }
    skipUntilEndOfProcedure() {
        while (this.currentToken.primitive !== Tokenizer.primitives.END) {
            this.getNextToken();
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
    constructor(startIndex = 0, text = "", tokenType = Tokenizer.tokenTypes.NONE, primitive = Tokenizer.primitives.NONE) {
        this.startIndex = startIndex;
        this.text = text;
        this.endIndex = startIndex + text.length - 1;
        this.tokenType = tokenType;
        this.primitive = primitive;
    }
    getKey = (value, jsonObject) => Object.keys(jsonObject).find(key => jsonObject[key] === value);
    get[Symbol.toStringTag]() {
        let tokenTypeKey = this.getKey(this.tokenType, Tokenizer.tokenTypes);
        let primitiveKey = this.getKey(this.primitive, Tokenizer.primitives);

        let paddedStartIndex = this.startIndex.toString().padStart(3, '0');
        let paddedEndIndex = this.endIndex.toString().padStart(3, '0');

        let tokenWithEscapedCharacters = this.text !== "\n" ? this.text : "\\n";

        return `Token (${paddedStartIndex}-${paddedEndIndex}) "${tokenWithEscapedCharacters}" ${tokenTypeKey} {${primitiveKey}}`;
    }
}

class Tokenizer {
    static delimiters = {
        "OPENING_BRACKET": "[",
        "CLOSING_BRACKET": "]",
        "PLUS": "+",
        "MINUS": "-",
        "MULTIPLIEDBY": "*",
        "DIVIDEDBY": "/",
        "GREATERTHAN": ">",
        "LESSERTHAN": "<"
    };
    static primitives = {
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
        "STOP": 12,
        "SETPENCOLOR": 13,
        "SETBACKGROUND": 14,
        "HOME": 15,
        "CLEAN": 16,

    };
    static tokenTypes = {
        "NONE": 0,
        "DELIMITER": 1,
        "NUMBER": 2,
        "PRIMITIVE": 3,
        "VARIABLE": 4,
        "PROCEDURE_NAME": 5,
        "END_OF_TOKEN_STREAM": 6,
        "UNKNOWN_TOKEN": 7
    };    
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
        let primitive = Tokenizer.primitives[key] ?? Tokenizer.primitives.NONE;
        return primitive;
    }
    initialize(script) {
        this.script = script;
        this.tokens = [];
        this.currentIndex = -1; // So when we get the first character, it will be script[0]
        this.currentCharacter = '';
    }
    isDelimiter(c) {
        return Object.values(Tokenizer.delimiters).includes(c);
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
                let token = new Token(this.currentIndex, this.currentCharacter, Tokenizer.tokenTypes.DELIMITER);
                this.tokens.push(token);
            } else if (this.isDelimiter(this.currentCharacter)) {
                let token = new Token(this.currentIndex, this.currentCharacter, Tokenizer.tokenTypes.DELIMITER);
                this.tokens.push(token);
            } else if (this.isNumber(this.currentCharacter)) {
                let number = this.currentCharacter;
                let startIndex = this.currentIndex;
                this.getNextCharacter();
                while (this.isNumber(this.currentCharacter)) {
                    number += this.currentCharacter;
                    this.getNextCharacter();
                }
                let token = new Token(startIndex, number, Tokenizer.tokenTypes.NUMBER);
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
                if (primitive === Tokenizer.primitives.NONE) {
                    let token = new Token(startIndex, word, Tokenizer.tokenTypes.PROCEDURE_NAME, primitive);
                    this.tokens.push(token);
                } else {
                    let token = new Token(startIndex, word, Tokenizer.tokenTypes.PRIMITIVE, primitive);
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
                let token = new Token(startIndex, variable, Tokenizer.tokenTypes.VARIABLE);
                this.tokens.push(token);
            } else {
                if (!this.isEndOfFile(this.currentCharacter)) {
                    let startIndex = this.currentIndex;
                    let token = new Token(startIndex, this.currentCharacter, Tokenizer.tokenTypes.UNKNOWN_TOKEN);
                    this.tokens.push(token);                    
                }
            }
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

        this.state = {
            isPenDown: true,
            penColor: "#000000",       // Black
            backgroundColor: "#E8E8E8" // Light grey
        };

        this.execute_clearscreen();
        this.execute_pendown()
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
    execute_back(n = 0) {
        this.execute_forward(-n);
    }
    execute_clean() {
        this.deleteGraphics();
        this.execute_setbackground(this.state.backgroundColor);
        this.renderFrame();
    }
    execute_clearscreen() {
        this.execute_home();
        this.execute_clean();
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
        if (this.state.isPenDown) {
            this.drawingCtx.strokeStyle = this.state.penColor;
            console.log(this.state.penColor, this.drawingCtx.strokeStyle);
            this.drawingCtx.stroke();
        }
        this.updateTurtlePosition(x1, y1);

        this.deleteTurtle();
        this.drawTurtle();
        this.renderFrame();
    }
    execute_home() {
        this.deleteTurtle();
        this.updateTurtlePosition(this.centerX, this.centerY);
        this.incrementTurtleOrientation(-this.orientation);
        this.drawTurtle();
        this.renderFrame();
    }
    execute_left(deg = 0) {
        this.execute_right(-deg);
    }
    execute_pendown() {
        this.state.isPenDown = true;
    }
    execute_penup() {
        this.state.isPenDown = false;
    }
    execute_right(deg = 0) {
        this.incrementTurtleOrientation(deg);

        this.deleteTurtle();
        this.drawTurtle();
        this.renderFrame();
    }
    execute_setbackground(color = "") {
        this.state.backgroundColor = color;
        this.drawingCtx.fillStyle = this.state.backgroundColor;
        this.drawingCtx.fillRect(0, 0, this.width, this.height);
        this.renderFrame();
    }
    execute_setpencolor(color = "") {
        this.state.penColor = color;
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
    i18n,
    'English');