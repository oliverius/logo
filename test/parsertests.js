runParserTests();
function runParserTests() {
    const tokenizer = new Tokenizer();
    const parser = new Parser();
    let expectedTurtleEvents = [];
    let actualTurtleEvents = [];
    let assertTurtleEvents = () => {
        if (expectedTurtleEvents.length !== actualTurtleEvents.length) {
            throw "Expected and actual events are different";
        }

    }
    let parserEventsStream = (event) => {
        switch(event.type) {
            case parser.parserStatusEventName():
                switch(event.detail.status) {
                    case logo.parserEvents.START_PARSING:
                        actualTurtleEvents = [];
                        break;
                    case logo.parserEvents.END_PARSING:
                        console.log(actualTurtleEvents);
                        break;
                }
                break;
            case parser.turtleDrawingQueueEventName():
                actualTurtleEvents.push(event.detail);
                break;
        }
    }
    window.addEventListener(parser.parserStatusEventName(), parserEventsStream, false);
    window.addEventListener(parser.turtleDrawingQueueEventName(), parserEventsStream, false);
    let assertScript = (comments = "", script = "", expectedTurtleEvents = []) => {
        this.expectedTurtleEvents = expectedTurtleEvents;
        let tokens = tokenizer.tokenize(script);
        parser.parse(tokens);
    }




    assertScript(
        "Get it from tokenizer",
        "fd 60 rt 90",
        [
            [logo.primitives.FORWARD, 60],
            [logo.primitives.RIGHT, 90]
        ]);
    //assertScript("repeat 4 [fd 60 rt 90]");
}