function run(canvas, script) {
    console.log(canvas, script);
    let tokenizer = new Tokenizer();
    tokenizer.tokenize(script);
    console.log(tokenizer.gettokens);

}

const token_types = {
    NONE: 0,
    DELIMITER: 1,
    NUMBER: 2,
    STRING: 3,
    COMMAND: 4
};

const delimiters = {
    OPENING_BRACKET: "[",
    CLOSING_BRACKET: "]"
};

class Token {
    constructor(startindex = 0, text = "", tokentype = token_types.NONE) {
        this.startindex = startindex;
        this.text = text;
        this.endindex = startindex + text.length - 1;
        this.tokentype = tokentype;
    }
    get [Symbol.toStringTag]() {
        let tokenTypeKey = Object.keys(token_types).find(key => token_types[key] === this.tokentype);
        return `{${this.startindex}-${this.endindex}} ${tokenTypeKey} "${this.text}"`;
    }
}

class Tokenizer {
    EOF = "\0";

    get gettokens() {
        console.log("this is the tokens");
        return this.tokens.toString();
    }

    getCharacterIndex() {
        return this.index - 1;
    }

    getCharacter() {
        console.log(`[${this.index}] "${this.script[this.index]}"`);
        if (this.index < this.script.length) {
            let c = this.script[this.index];
            this.index++;
            return c;
        } else {
            return this.EOF;
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

    /* isDoubleQuote(c) {
        return c === double_quote;
    } */

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
        let c = "";

        while ((c = this.getCharacter()) !== this.EOF) {
            
            if (this.isWhiteSpace(c)) {
                c = this.getCharacter();
                while(this.isWhiteSpace(c)) {
                    c = this.getCharacter();
                }
            }

            if (this.isDelimiter(c)) {
                let token = new Token(this.getCharacterIndex(), c, token_types.DELIMITER);
                this.tokens.push(token);
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
                let token = new Token(startindex, word, token_types.STRING);
                this.tokens.push(token);
            }

        }

        
        console.log("finish tokenizer");
    }

}

module.exports.tokenizer = Tokenizer;