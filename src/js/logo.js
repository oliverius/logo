function run(canvas, script) {
    console.log(canvas, script);
    let parser = new Parser(canvas);
    parser.parse(script);
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
        this.turtle.showturtle();
    }
    get_token() {
        return this.tokens[this.index++];
    }
    initialize() {
        this.index = 0;
        this.tokens = [];
    }
    parse(script = "") {
        this.initialize();
        this.tokenizer.tokenize(script);
        this.tokens = this.tokenizer.gettokens;
        let token;
        let argumentToken;
        do {
            token = this.get_token();
            console.log(token.toString());
            if(token.tokentype === token_types.COMMAND) {
                switch(token.command) {
                    case commands.FORWARD:
                        argumentToken = this.get_token();
                        if (argumentToken.tokentype === token_types.NUMBER) {
                            let n = parseInt(argumentToken.text);
                            this.turtle.execute_forward(n);
                        }
                        break;
                    case commands.BACK:
                        argumentToken = this.get_token();
                        if (argumentToken.tokentype === token_types.NUMBER) {
                            let n = parseInt(argumentToken.text);
                            this.turtle.execute_backward(n);
                        }
                        break;
                    case commands.LEFT:
                        argumentToken = this.get_token();
                        if (argumentToken.tokentype === token_types.NUMBER) {
                            let n = parseInt(argumentToken.text);
                            this.turtle.execute_left(n);
                        }
                        break;
                    case commands.RIGHT:
                        argumentToken = this.get_token();
                        if (argumentToken.tokentype === token_types.NUMBER) {
                            let n = parseInt(argumentToken.text);
                            this.turtle.execute_right(n);
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
    constructor(canvasObject) {
        this.canvasObject = canvasObject;
        this.ctx = canvasObject.getContext('2d');        
        this.x = parseInt(this.canvasObject.width / 2);
        this.y = parseInt(this.canvasObject.height / 2);
        this.angleInDegrees = 0;
    }

    execute_backward(n = 0) {
        this.execute_forward(-n);
    }

    execute_forward(n = 0) {
        let newX = parseInt(this.x - n * Math.sin(this.DEGREE_TO_RADIAN * this.angleInDegrees));
        let newY = parseInt(this.y - n * Math.cos(this.DEGREE_TO_RADIAN * this.angleInDegrees));

        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(this.x, this.y);
        this.ctx.lineTo(newX, newY);
        this.ctx.stroke();

        this.updateTurtlePosition(newX, newY);
    }

    execute_left(deg = 0) {
        this.angleInDegrees -= deg;
    }

    execute_right(deg = 0) {
        this.angleInDegrees += deg;
    }

    showturtle() {
        let r = 10;        
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, r, 0, 2 * Math.PI);
        this.ctx.stroke();
    }

    updateTurtleOrientation(deg = 0) {
        // todo rotate the turtle
        this.angleInDegrees += deg;
    }

    updateTurtlePosition(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
}

module.exports.tokenizer = Tokenizer;