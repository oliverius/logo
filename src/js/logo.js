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
        return this.index < this.script.length;
    }

    getCharacter() {
        console.log(`[${this.index}] ${this.script[this.index]}`);
        return this.script[this.index];
    }

    initialize(script) {
        this.tokens = [];
        this.index = 0;
        this.script = script;
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
        if (script.length === 0) {
            return;
        }
        this.initialize(script);
        let c = "";

        do {
            c = this.getCharacter();
            this.moveForward();
        } while(this.canMoveForward());
    }

}

module.exports.tokenizer = Tokenizer;