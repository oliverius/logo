function run(canvas, script) {
    console.log(canvas, script);
    let tokenizer = new Tokenizer();
    tokenizer.tokenize(script);
    tokenizer.gettokens.forEach(x => console.log(x.toString()));
}

const token_types = {
    NONE: 0,
    DELIMITER: 1,
    NUMBER: 2,
    COMMAND: 3
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
            case "bk":
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
    }

}

module.exports.tokenizer = Tokenizer;