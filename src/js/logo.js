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

class Token {
    constructor(startindex = 0, text = "", tokentype = token_types.NONE) {
        this.startindex = startindex;
        this.text = text;
        this.endindex = startindex + text.length - 1;
        this.tokentype = tokentype;
    }
    get [Symbol.toStringTag]() {
        let tokenTypeKey = Object.keys(token_types).find(key => token_types[key] === this.tokentype);
        return `[${this.startindex.toString().padStart(3, '0')}-${this.endindex.toString().padStart(3, '3')}] ${tokenTypeKey.padEnd(12)} "${this.text}"`;
    }
}

class Tokenizer {
    EOF = "\0";

    get gettokens() {
        console.log("this is the tokens");
        return this.tokens;
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
                console.log("After pushing number, the character is" + c);        
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
                // TODO do a lookup in the commands table to see if it can find him.
                let token = new Token(startindex, word, token_types.COMMAND);
                this.tokens.push(token);
            }



        } while(c !== this.EOF)
        
        console.log("finish tokenizer");
    }

}

module.exports.tokenizer = Tokenizer;