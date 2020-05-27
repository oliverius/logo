runParserTests();
function runParserTests() {
    let parserTestEventName = "PARSER_TEST_EVENT";
    const tokenizer = new Tokenizer();
    const parser = new Parser();
    let events = [];
    let raiseParserTestEvent = () => {
        let event = new CustomEvent(parserTestEventName);
        window.dispatchEvent(event);
        console.log("dispatch", event);
    }
    let parserEventsStream = (event) => {
        switch(event.type) {
            case parserTestEventName:
                events = [];
                break;
            case parser.parserStatusEventName():
                console.log("get status");
                break;
            case parser.turtleDrawingQueueEventName():
                console.log("turtle");
                break;
        }
        console.log(event.type,  event.detail);
    }
    window.addEventListener(parser.parserStatusEventName(), parserEventsStream, false);
    window.addEventListener(parser.turtleDrawingQueueEventName(), parserEventsStream, false);
    window.addEventListener(parserTestEventName, parserEventsStream, false);
    let assertScript = (script = "") => {
        raiseParserTestEvent();
        let tokens = tokenizer.tokenize(script);
        parser.parse(tokens);
    }




    assertScript("fd 60");
    //assertScript("repeat 4 [fd 60 rt 90]");
}