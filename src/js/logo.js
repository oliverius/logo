
function run(script) {
    //parser.parse(script);
    //parser.parse("para cuadrado :lado av 60");
    //parser.parse("gd 45 av 60");
    //parser.parse("repite 4 [av 60 gd 90]");
    //parser.parse("av 120 repite 4 [av 60 gd 90] bp");
    interpreter.run("av 60 gd 90 av 30");
}

const token_types = {
    NONE: 0,
    DELIMITER: 1,
    NUMBER: 2,
    COMMAND: 3,
    VARIABLE: 4,
    TEXT: 5,
    END_OF_SCRIPT : 6 // TODO rename "End of token stream"
};

const delimiters = {
    OPENING_BRACKET: "[",
    CLOSING_BRACKET: "]"
};

const commands = {
    NONE: 0,
    FORWARD: 1,
    BACK: 2,
    LEFT: 3,
    RIGHT: 4,
    REPEAT: 5,
    CLEARSCREEN: 6,
    COMMAND_TO: 7,
    COMMAND_END: 8
};

class Interpreter {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.turtle = new Turtle(this.canvas);
        this.tokenizer = new Tokenizer();
        this.fps = 5;
        this.executionQueue = [];
        window.addEventListener('awesome', e => console.log(e.detail.text()));

        this.executionLoop();
    }
    executionLoop() {
        setInterval(() => {
            console.log("*");
            if (this.executionQueue.length > 0) {
                //let obj = this.executionqueue.shift();                
                //this[obj.objectname][obj.methodname](obj.arg);
            }
        }, 1000/this.fps);
    }
    run(script = "") {
        let tokens = this.tokenizer.tokenize(script);
        let parser = new Parser2(this.turtle, tokens);
    }

}

class Parser2 {
    constructor(turtle, tokens) {
        this.turtle = turtle;
        this.tokens = tokens;

        this.tokenIndex = 0;
        this.loopStack = [];

        this.parse();
    }
    getToken() {
        return this.tokens[this.tokenIndex++];
    }
    parse() {
        let token;
        let argumentToken;
        do {
            token = this.getToken();
            if(token.tokentype === token_types.COMMAND) {
                switch(token.command) {
                    case commands.FORWARD:
                        argumentToken = this.getToken();
                        if (argumentToken.tokentype === token_types.NUMBER) {
                            let n = parseInt(argumentToken.text);
                            window.dispatchEvent(new CustomEvent('awesome', {bubbles:true, detail:{text:() => `execute forward ${n}`}}));
                            //this.addToExecutionQueue("turtle", "execute_forward", n);
                        }
                        break;
                    case commands.BACK:
                        argumentToken = this.getToken();
                        if (argumentToken.tokentype === token_types.NUMBER) {
                            let n = parseInt(argumentToken.text);
                            //this.addToExecutionQueue("turtle", "execute_backward", n);
                        }
                        break;
                    case commands.LEFT:
                        argumentToken = this.getToken();
                        if (argumentToken.tokentype === token_types.NUMBER) {
                            let n = parseInt(argumentToken.text);
                            //this.addToExecutionQueue("turtle", "execute_left", n);
                        }
                        break;
                    case commands.RIGHT:
                        argumentToken = this.getToken();
                        if (argumentToken.tokentype === token_types.NUMBER) {
                            let n = parseInt(argumentToken.text);
                            //this.addToExecutionQueue("turtle", "execute_right", n);
                        }
                        break;
                    case commands.REPEAT:
                        argumentToken = this.getToken();
                        if (argumentToken.tokentype === token_types.NUMBER) {
                            let n = parseInt(argumentToken.text);
                            //this.execute_repeat_begin(n);
                        }
                        break;
                    case commands.CLEARSCREEN:
                        //this.addToExecutionQueue("turtle", "execute_clearscreen");
                        break;
                    case commands.COMMAND_TO:
                        //this.execute_to();
                        break;
                    case commands.COMMAND_END:
                        break;
                }
            }
            if(token.tokentype === token_types.DELIMITER) {
                if (token.text === delimiters.CLOSING_BRACKET) {
                    //this.execute_repeat_end();
                }
            }
        } while(token.tokentype !== token_types.END_OF_SCRIPT)
        console.log("finish parsing", this.tokens);
    }
}

class Parser {
    constructor(canvasId) {
        let canvas = document.getElementById(canvasId);
        this.tokenizer = new Tokenizer();
        this.turtle = new Turtle(canvas);
        this.fps = 5;
        this.procedures = [];
    }
    addToExecutionQueue(objectname = "", methodname = "", arg = 0) {
        this.executionqueue.push({
            objectname: objectname,
            methodname: methodname,
            arg: arg
        })
    }
    executionLoop() {
        setInterval(() => {
            if (this.executionqueue.length > 0) {
                let obj = this.executionqueue.shift();                
                this[obj.objectname][obj.methodname](obj.arg);
            }
        }, 1000/this.fps);
    }
    execute_repeat_begin(n = 0) {
        let openingBracketToken = this.get_token();
        if (openingBracketToken.tokentype === token_types.DELIMITER
            && openingBracketToken.text === delimiters.OPENING_BRACKET) {
            this.loopstack.push({loopStartIndex: this.index, remainingLoops: n - 1});
        }
    }
    execute_repeat_end() {
        let currentLoop = this.loopstack.pop();
        if (currentLoop?.remainingLoops > 0) {
            this.index = currentLoop.loopStartIndex;
            this.loopstack.push({loopStartIndex: currentLoop.loopStartIndex, remainingLoops: currentLoop.remainingLoops - 1});
        }
    }
    execute_to() {
        let procedure = {};
        let token = this.get_token();
        if (token.tokentype === token_types.TEXT) {
            procedure["name"] = token.text;
            procedure["variables"] = [];
            token = this.get_token();
            while(token.tokentype === token_types.VARIABLE) {
                procedure["variables"].push(token.text);
                token = this.get_token();
            }
        }
        console.log(procedure);
    }
    get_token() {
        return this.tokenizer.tokens[this.index++];
    }
    initialize() {
        this.index = 0;
        this.loopstack = [];
        this.executionqueue = [];
        this.executionLoop();
    }
    parse(script = "") {
        this.initialize();
        this.tokenizer.tokenize(script);
        this.tokenizer.tokens.forEach(x => console.log(x.toString()));
        let token;
        let argumentToken;
        do {
            token = this.get_token();
            if(token.tokentype === token_types.COMMAND) {
                switch(token.command) {
                    case commands.FORWARD:
                        argumentToken = this.get_token();
                        if (argumentToken.tokentype === token_types.NUMBER) {
                            let n = parseInt(argumentToken.text);
                            this.addToExecutionQueue("turtle", "execute_forward", n);
                        }
                        break;
                    case commands.BACK:
                        argumentToken = this.get_token();
                        if (argumentToken.tokentype === token_types.NUMBER) {
                            let n = parseInt(argumentToken.text);
                            this.addToExecutionQueue("turtle", "execute_backward", n);
                        }
                        break;
                    case commands.LEFT:
                        argumentToken = this.get_token();
                        if (argumentToken.tokentype === token_types.NUMBER) {
                            let n = parseInt(argumentToken.text);
                            this.addToExecutionQueue("turtle", "execute_left", n);
                        }
                        break;
                    case commands.RIGHT:
                        argumentToken = this.get_token();
                        if (argumentToken.tokentype === token_types.NUMBER) {
                            let n = parseInt(argumentToken.text);
                            this.addToExecutionQueue("turtle", "execute_right", n);
                        }
                        break;
                    case commands.REPEAT:
                        argumentToken = this.get_token();
                        if (argumentToken.tokentype === token_types.NUMBER) {
                            let n = parseInt(argumentToken.text);
                            this.execute_repeat_begin(n);
                        }
                        break;
                    case commands.CLEARSCREEN:
                        this.addToExecutionQueue("turtle", "execute_clearscreen");
                        break;
                    case commands.COMMAND_TO:
                        this.execute_to();
                        break;
                    case commands.COMMAND_END:
                        break;
                }
            }
            if(token.tokentype === token_types.DELIMITER) {
                if (token.text === delimiters.CLOSING_BRACKET) {
                    this.execute_repeat_end();
                }
            }
        } while(token.tokentype !== token_types.END_OF_SCRIPT)
    }
}

class Token {
    constructor(startindex = 0, text = "", tokentype = token_types.NONE, command = commands.NONE) {
        this.startindex = startindex;
        this.text = text;
        this.endindex = startindex + text.length - 1;
        this.tokentype = tokentype;
        this.command = command;
    }
    get [Symbol.toStringTag]() {
        let tokenTypeKey = Object.keys(token_types).find(key => token_types[key] === this.tokentype);
        let commandKey = Object.keys(commands).find(key => commands[key] === this.command);
        
        let paddedStartIndex = this.startindex.toString().padStart(3, '0');
        let paddedEndIndex = this.endindex.toString().padStart(3, '0');
        let paddedTokenTypeKey = tokenTypeKey.padEnd(12);
        let paddedCommandKey = commandKey.padStart(8, ' '); 
        
        return `Token (${paddedStartIndex}-${paddedEndIndex}) ${paddedTokenTypeKey}\t${paddedCommandKey}\t"${this.text}"`;
    }
}

class Tokenizer {
    EOF = "\0";
    VARIABLE_PREFIX = ":";

    addEndOfScriptToken() {
        let token = new Token(this.getCharacterIndex(), this.EOF, token_types.END_OF_SCRIPT);
        this.tokens.push(token);
    }

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

    getCommand(commandString="") {
        switch(commandString.toLowerCase()) {
            case "av":
                return commands.FORWARD;
            case "re":
                return commands.BACK;
            case "gd":
                return commands.RIGHT;
            case "gi":
                return commands.LEFT;
            case "repite":
                return commands.REPEAT;
            case "bp":
                return commands.CLEARSCREEN;
            case "para":
                return commands.COMMAND_TO;
            case "fin":
                return commands.COMMAND_END;
            default:
                return commands.NONE; // This will produce an error.
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
                let startindex = this.getCharacterIndex();
                while(this.isNumber(c)) {
                    number += c;
                    c = this.getCharacter();
                }
                let token = new Token(startindex, number, token_types.NUMBER);
                this.tokens.push(token);
            } else if (this.isLetter(c)) {
                let word = c;
                c = this.getCharacter();
                let startindex = this.getCharacterIndex();
                while(this.isLetter(c)) {
                    word += c;
                    c = this.getCharacter();
                }
                let command = this.getCommand(word);
                if (command === commands.NONE) {
                    let token = new Token(startindex, word, token_types.TEXT, command);
                    this.tokens.push(token);
                } else {
                    let token = new Token(startindex, word, token_types.COMMAND, command);
                    this.tokens.push(token);
                }
            } else if (this.isVariablePrefix(c)) {
                let variable = c;
                c = this.getCharacter();
                let startindex = this.getCharacterIndex();
                while(this.isLetter(c)) {
                    variable += c;
                    c = this.getCharacter();
                }
                let token = new Token(startindex, variable, token_types.VARIABLE);
                this.tokens.push(token);
            } else {
                console.log(`Unexpected character: ${c}`);
                c = this.getCharacter(); // This avoids an endless loop
            }
        } while(!this.isEndOfFile(c))

        this.addEndOfScriptToken();

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

        this.drawingCtx.lineWidth = 2;
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

console.log("hello");
const interpreter = new Interpreter('logocanvas');


//module.exports.tokenizer = Tokenizer;