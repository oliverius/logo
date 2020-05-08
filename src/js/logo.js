function run(canvas, script) {
    console.log(canvas, script);
    let tokenizer = new Tokenizer();
    tokenizer.tokenize(script);
    console.log(tokenizer.gettokens);

}

const token_types = {
    NONE: 0,
    COMMAND: 1
};

class Token {
    constructor(startindex = 0, text = "") {
        this.startindex = startindex;
        this.text = text;
        this.endindex = startindex + text.length();
    }
}

class Tokenizer {

    get gettokens() {
        console.log("this is the tokens");
        return this.tokens;
    }

    canMoveForward() {
        return this.index < this.lastindex;
    }

    getCharacter() {
        return this.script[this.index];
    }

    getCharacterAndMoveForward() {
        let c = this.getCharacter();
        this.moveForward();
        return c;
    }

    initialize(script) {
        this.tokens = [];
        this.index = 0;
        this.script = script;
        this.lastindex = script.length - 1;
    }

    isNumber(c) {
        return "0123456789".indexOf(c) != -1;
    }

    isWhiteSpace(c) {
        return c === " " || c === "\t";
    }

    moveForward() {
        this.index++;
    }

    tokenize(script = "") {
        this.initialize(script);
        let c = "";

        do {
            c = this.getCharacterAndMoveForward();
            console.log(c);
            if (this.isWhiteSpace(c)) {
                console.log(`yes ${c} is whitespace`);
               c = this.getCharacterAndMoveForward();
               console.log("**" + c);
               while (this.isWhiteSpace(c) && this.canMoveForward()) {
                   console.log("continue");
                   c = this.getCharacterAndMoveForward();
               }
            }
           
        } while (this.canMoveForward())
    }

}