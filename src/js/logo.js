function run(canvas, script) {
    console.log(canvas, script);
    let parser = new Parser(canvas);
    parser.parse(script);
    //parser.parse("gd 45 av 60");
}

const token_types = {
    NONE: 0,
    DELIMITER: 1,
    NUMBER: 2,
    COMMAND: 3,
    END_OF_SCRIPT : 4
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
    REPEAT: 5
};

class Parser {
    constructor(canvasObject) {
        this.tokenizer = new Tokenizer();
        this.turtle = new Turtle(canvasObject);
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
            console.log("*");
            if (this.executionqueue.length > 0) {
                let obj = this.executionqueue.shift();                
                this[obj.objectname][obj.methodname](obj.arg);
            }
        }, 500);
    }
    get_token() {
        return this.tokens[this.index++];
    }
    initialize() {
        this.index = 0;
        this.tokens = [];
        this.executionqueue = [];
        this.executionLoop();
    }
    parse(script = "") {
        this.initialize();
        this.tokenizer.tokenize(script);
        this.tokens = this.tokenizer.gettokens;
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
                        break;
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
        
        return `[${paddedStartIndex}-${paddedEndIndex}] ${paddedTokenTypeKey}\t${paddedCommandKey}\t"${this.text}"`;
    }
}

class Tokenizer {
    EOF = "\0";

    get gettokens() {
        return this.tokens;
    }

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
            }

            if (this.isDelimiter(c)) {
                let token = new Token(this.getCharacterIndex(), c, token_types.DELIMITER);
                this.tokens.push(token);
                c = this.getCharacter();
            }

            if (this.isNumber(c)) {
                let number = c;
                c = this.getCharacter();
                let startindex = this.getCharacterIndex();
                while(this.isNumber(c)) {
                    number += c;
                    c = this.getCharacter();
                }
                let token = new Token(startindex, number, token_types.NUMBER);
                this.tokens.push(token);
            }

            if (this.isLetter(c)) {
                let word = c;
                c = this.getCharacter();
                let startindex = this.getCharacterIndex();
                while(this.isLetter(c)) {
                    word += c;
                    c = this.getCharacter();
                }
                // without variables, only commands.
                let command = this.getCommand(word);
                let token = new Token(startindex, word, token_types.COMMAND, command);
                this.tokens.push(token);
            }
        } while(!this.isEndOfFile(c))

        this.addEndOfScriptToken();
    }
}

class Turtle {
    DEGREE_TO_RADIAN = Math.PI/180;
    toRadians = (deg=0) => { return Number(deg * this.DEGREE_TO_RADIAN) };

    constructor(canvasObject) {
        this.ctx = canvasObject.getContext('2d');
        this.width = canvasObject.width;
        this.height = canvasObject.height;
        this.x = parseInt(this.width / 2);
        this.y = parseInt(this.height / 2);
        this.angleInDegrees = 0;

        this.virtualTurtleCanvas = document.createElement('canvas');
        this.virtualTurtleCanvas.width = this.width;
        this.virtualTurtleCanvas.height = this.height;
        this.turtleCtx = this.virtualTurtleCanvas.getContext('2d');

        this.virtualDrawingCanvas = document.createElement('canvas');
        this.virtualDrawingCanvas.width = this.width;
        this.virtualDrawingCanvas.height = this.height;
        this.drawingCtx = this.virtualDrawingCanvas.getContext('2d');
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.drawImage(this.virtualDrawingCanvas, 0, 0, this.width, this.height);
        this.ctx.drawImage(this.virtualTurtleCanvas, 0, 0, this.width, this.height);
    }

    execute_backward(n = 0) {
        this.execute_forward(-n);
    }

    execute_forward(n = 0) {
        let angleFromYaxis = 90 - this.angleInDegrees;
        let angleFromYaxisInRadians = this.toRadians(angleFromYaxis);

        // Rounding issues if parseInt doesn't include this.x or this.y
        let newX = parseInt(this.x + n * Math.cos(angleFromYaxisInRadians));
        let newY = parseInt(this.y - n * Math.sin(angleFromYaxisInRadians));

        this.drawingCtx.lineWidth = 2;
        this.drawingCtx.beginPath();
        this.drawingCtx.moveTo(this.x, this.y);
        this.drawingCtx.lineTo(newX, newY);
        this.drawingCtx.stroke();

        this.updateTurtlePosition(newX, newY);        
        this.drawTurtle();
        this.draw();
    }

    execute_left(deg = 0) {
        this.execute_right(-deg);
    }

    execute_right(deg = 0) {
        this.updateTurtleOrientation(deg);
        this.drawTurtle();
        this.draw();
    }

    drawTurtle() {
        let vertexAngleInDeg = 20;
        let alpha = vertexAngleInDeg / 2;
        let angle = this.toRadians(270 + alpha);
        
        let r = 50;
        let halfbase = r * Math.sin(this.toRadians(alpha));
        let height = r * Math.cos(this.toRadians(alpha));
        
        let x1 = this.x;
        let y1 = this.y - height/2;
        let x2 = parseInt(x1 + r * Math.cos(angle));
        let y2 = parseInt(y1 - r * Math.sin(angle));
        let x3 = parseInt(x2 - 2 * halfbase);
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

        console.log(`When gd ${this.x}, ${this.y} ${this.angleInDegrees}`);
    }

    updateTurtleOrientation(deg = 0) {
        this.angleInDegrees += deg;
    }

    updateTurtlePosition(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
}

module.exports.tokenizer = Tokenizer;