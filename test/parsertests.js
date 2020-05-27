runParserTests();
function runParserTests() {
    const tokenizer = new Tokenizer();
    const parser = new Parser();
    let testName = "";
    let expectedTurtleEvents = [];
    let actualTurtleEvents = [];
    let assertTurtleEvent = (expectedTurtleEvent = {}, actualTurtleEvent = {}) => {
        let success = expectedTurtleEvent[0] === actualTurtleEvent.primitive &&
            expectedTurtleEvent[1] === actualTurtleEvent.arg;
        if (success) {
            console.log(`TEST ${testName} PASSED`);
        } else {
            throw `TEST ${testName} FAILED`;
        }
    };
    let assertTurtleEvents = () => {
        if (expectedTurtleEvents.length !== actualTurtleEvents.length) {
            throw "Expected and actual events are different";
        }
        expectedTurtleEvents.every(
            (expectedTurtleEvent, index) => assertTurtleEvent(expectedTurtleEvent, actualTurtleEvents[index]));
    }
    let parserEventsStream = (event) => {
        switch(event.type) {
            case parser.parserStatusEventName():
                switch(event.detail.status) {
                    case logo.parserEvents.START_PARSING:
                        actualTurtleEvents = [];
                        break;
                    case logo.parserEvents.END_PARSING:
                        assertTurtleEvents();
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
    let assertScript = (testNameParameter = "", script = "", expectedTurtleEventsParameter = []) => {
        testName = testNameParameter;
        expectedTurtleEvents = expectedTurtleEventsParameter;
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
    assertScript(
        "Repeat 4",
        "repeat 4 [fd 60 rt 90]",
        [
            [logo.primitives.FORWARD, 60],
            [logo.primitives.RIGHT, 90],
            [logo.primitives.FORWARD, 60],
            [logo.primitives.RIGHT, 90],
            [logo.primitives.FORWARD, 60],
            [logo.primitives.RIGHT, 90],
            [logo.primitives.FORWARD, 60],
            [logo.primitives.RIGHT, 90]
        ]);
}