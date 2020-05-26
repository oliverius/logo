runParserTests();
function runParserTests() {
    let tokenizer = new Tokenizer();
    let parser = new Parser();
    let parserEventsStream = (event) => {
        console.log(event.detail);
    }
    window.addEventListener(parser.parserStatusEventName(), parserEventsStream, false);
    window.addEventListener(parser.turtleDrawingQueueEventName(), parserEventsStream, false);
    let assertParser = (script = "") => {
        let tokens = tokenizer.tokenize(script);
        parser.parse(tokens);
    }
    




    //assertParser("fd 60");
    assertParser("repeat 4 [fd 60 rt 90]");
}