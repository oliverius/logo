runParserTests();
function runParserTests() {
    const tokenizer = new Tokenizer();
    const parser = new Parser();
    let currentTest = {
        name: "",
        expectedTurtleEvents: [],
        actualTurtleEvents: []
    };
    let assertTurtleEvent = (testName = "", expectedTurtleEvent = {}, actualTurtleEvent = {}) => {
        let success = expectedTurtleEvent[0] === actualTurtleEvent.primitive &&
            expectedTurtleEvent[1] === actualTurtleEvent.arg;
        if (success) {
            console.log(`TEST ${testName} PASSED`);
        } else {
            throw `TEST ${testName} FAILED`;
        }
    };
    let assertTurtleEvents = (test = {}) => {
        if (test.expectedTurtleEvents.length !== test.actualTurtleEvents.length) {
            console.log(test);
            throw "Expected and actual events are different";
        }
        test.expectedTurtleEvents.every(
            (expectedTurtleEvent, index) => assertTurtleEvent(test.name, expectedTurtleEvent, test.actualTurtleEvents[index]));
    }
    let parserEventsStream = (event) => {
        switch(event.type) {
            case parser.parserStatusEventName():
                switch(event.detail.status) {
                    case logo.parserEvents.START_PARSING:
                        currentTest.actualTurtleEvents = [];
                        break;
                    case logo.parserEvents.END_PARSING:
                        assertTurtleEvents(currentTest);
                        break;
                }
                break;
            case parser.turtleDrawingQueueEventName():
                currentTest.actualTurtleEvents.push(event.detail);
                break;
        }
    }
    window.addEventListener(parser.parserStatusEventName(), parserEventsStream, false);
    window.addEventListener(parser.turtleDrawingQueueEventName(), parserEventsStream, false);
    let assertScript = (testName = "", script = "", expectedTurtleEvents = []) => {
        currentTest.name = testName;
        currentTest.expectedTurtleEvents = expectedTurtleEvents;
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
        "Square with REPEAT primitive",
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
    assertScript(
        "Double REPEAT with inside one in the middle of the primitives of the first one",
        "repeat 3 [fd 60 repeat 4 [lt 90 bk 20] rt 120]",
        [
            [logo.primitives.FORWARD, 60],

            [logo.primitives.LEFT, 90],
            [logo.primitives.BACK, 20],
            [logo.primitives.LEFT, 90],
            [logo.primitives.BACK, 20],
            [logo.primitives.LEFT, 90],
            [logo.primitives.BACK, 20],
            [logo.primitives.LEFT, 90],
            [logo.primitives.BACK, 20],

            [logo.primitives.RIGHT, 120],

            [logo.primitives.FORWARD, 60],

            [logo.primitives.LEFT, 90],
            [logo.primitives.BACK, 20],
            [logo.primitives.LEFT, 90],
            [logo.primitives.BACK, 20],
            [logo.primitives.LEFT, 90],
            [logo.primitives.BACK, 20],
            [logo.primitives.LEFT, 90],
            [logo.primitives.BACK, 20],

            [logo.primitives.RIGHT, 120],

            [logo.primitives.FORWARD, 60],

            [logo.primitives.LEFT, 90],
            [logo.primitives.BACK, 20],
            [logo.primitives.LEFT, 90],
            [logo.primitives.BACK, 20],
            [logo.primitives.LEFT, 90],
            [logo.primitives.BACK, 20],
            [logo.primitives.LEFT, 90],
            [logo.primitives.BACK, 20],

            [logo.primitives.RIGHT, 120]
        ]
    );
    assertScript(
        "PROCEDURE with no parameters in one line and the PROCEDURE is not called",
        "to line fd 60 end",
        []
    );
}