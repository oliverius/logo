function runParserTests(tokenizer, parser) {
    let assertExpression = (expression = "", expectedValue = 0) => {
        let tokens = tokenizer.tokenize(expression);
        parser.initializeParsing(tokens);

        let actualValue = parser.getExpression();

        let success = expectedValue === actualValue;
        let testResult = success ? "PASSED" : `FAILED with value ${actualValue}`;
        console.log(`TEST expression "${expression}": ${testResult}`);

        return success;
    };
    let assertTurtleDrawingEvent = (testName = "", expectedTurtleDrawingEvent = {}, actualTurtleDrawingEvent = {}) => {
        let success = expectedTurtleDrawingEvent[0] === actualTurtleDrawingEvent.primitive &&
            expectedTurtleDrawingEvent[1] === actualTurtleDrawingEvent.arg;
        if (success) {
            console.log(`TEST ${testName} PASSED`);
        } else {
            throw `TEST ${testName} FAILED`;
        }
        return success;
    };
    let assertTurtleDrawingEvents = (testName = "", script = "", expectedTurtleDrawingEvents = []) => {
        let tokens = tokenizer.tokenize(script);
        let actualTurtleDrawingEvents = [];

        window.addEventListener(logo.parser.turtleDrawingEvent.name, (event) => {
            actualTurtleDrawingEvents.push(event.detail);
        }, false);

        // This parser is blocking, the process will continue after the do-while loop fininshes.
        // This is a workaround to avoid having an event based parsing with a clock (timer)
        // This will also run as fast as it can instead of waiting for the tick of the clock every 500ms
        parser.initializeParsing(tokens);
        do {
            parser.parsingStep();
        } while(parser.currentToken.tokenType !== logo.tokenizer.tokenTypes.END_OF_TOKEN_STREAM &&
            !parser.stopParsingRequested)

        if (expectedTurtleDrawingEvents.length !== actualTurtleDrawingEvents.length) {
            console.table(actualTurtleDrawingEvents);
            throw "Expected and actual events are different";
        }

        let success = expectedTurtleDrawingEvents.every( (expectedTurtleDrawingEvent, index) => {
            assertTurtleDrawingEvent(testName, expectedTurtleDrawingEvent, actualTurtleDrawingEvents[index]);
        });

        window.removeEventListener(logo.parser.turtleDrawingEvent.name, this);

        return success;
    };

    let lines = (arr) => arr.join('\n');

    let tests = [];

    tests.push(assertExpression("60", 60));
    tests.push(assertExpression("30 + 30", 60));
    tests.push(assertExpression("2 * 15 + 30", 60));
    tests.push(assertExpression("100 / 2 + 10", 60));
    tests.push(assertExpression("2 * 10 + 50 - 70 / 7", 60));

    assertTurtleDrawingEvents(
        "Forward and right only",
        "fd 60 rt 90",
        [
            [logo.tokenizer.primitives.FORWARD, 60],
            [logo.tokenizer.primitives.RIGHT, 90]
        ]
    );
    assertTurtleDrawingEvents(
        "Square with REPEAT primitive",
        "repeat 4 [fd 60 rt 90]",
        [
            [logo.tokenizer.primitives.FORWARD, 60],
            [logo.tokenizer.primitives.RIGHT, 90],
            [logo.tokenizer.primitives.FORWARD, 60],
            [logo.tokenizer.primitives.RIGHT, 90],
            [logo.tokenizer.primitives.FORWARD, 60],
            [logo.tokenizer.primitives.RIGHT, 90],
            [logo.tokenizer.primitives.FORWARD, 60],
            [logo.tokenizer.primitives.RIGHT, 90]
        ]
    );
    assertTurtleDrawingEvents(
        "Double REPEAT with inside one in the middle of the primitives of the first one",
        "repeat 3 [fd 60 repeat 4 [lt 90 bk 20] rt 120]",
        [
            [logo.tokenizer.primitives.FORWARD, 60],

            [logo.tokenizer.primitives.LEFT, 90],
            [logo.tokenizer.primitives.BACK, 20],
            [logo.tokenizer.primitives.LEFT, 90],
            [logo.tokenizer.primitives.BACK, 20],
            [logo.tokenizer.primitives.LEFT, 90],
            [logo.tokenizer.primitives.BACK, 20],
            [logo.tokenizer.primitives.LEFT, 90],
            [logo.tokenizer.primitives.BACK, 20],

            [logo.tokenizer.primitives.RIGHT, 120],

            [logo.tokenizer.primitives.FORWARD, 60],

            [logo.tokenizer.primitives.LEFT, 90],
            [logo.tokenizer.primitives.BACK, 20],
            [logo.tokenizer.primitives.LEFT, 90],
            [logo.tokenizer.primitives.BACK, 20],
            [logo.tokenizer.primitives.LEFT, 90],
            [logo.tokenizer.primitives.BACK, 20],
            [logo.tokenizer.primitives.LEFT, 90],
            [logo.tokenizer.primitives.BACK, 20],

            [logo.tokenizer.primitives.RIGHT, 120],

            [logo.tokenizer.primitives.FORWARD, 60],

            [logo.tokenizer.primitives.LEFT, 90],
            [logo.tokenizer.primitives.BACK, 20],
            [logo.tokenizer.primitives.LEFT, 90],
            [logo.tokenizer.primitives.BACK, 20],
            [logo.tokenizer.primitives.LEFT, 90],
            [logo.tokenizer.primitives.BACK, 20],
            [logo.tokenizer.primitives.LEFT, 90],
            [logo.tokenizer.primitives.BACK, 20],

            [logo.tokenizer.primitives.RIGHT, 120]
        ]
    );

    assertTurtleDrawingEvents(
        "Recursive tree",
        lines([
            "to tree :length",
            "  if :length < 15 [stop]",
            "  fd :length",
            "  lt 45",
            "  tree :length/2",
            "  rt 90",
            "  tree :length/2",
            "  lt 45",
            "  bk :length",
            "end",
            "cs",
            "bk 100",
            "tree 160"
        ]),
        [
            [logo.tokenizer.primitives.CLEARSCREEN, 0],
            [logo.tokenizer.primitives.BACK, 100],

            // start tree 160 --------------------------------------------------------------
            [logo.tokenizer.primitives.FORWARD, 160],                                     //
            [logo.tokenizer.primitives.LEFT, 45],                                         //
            //                                                                            //
            // start tree 80 ---------------------------------------------------          //
            [logo.tokenizer.primitives.FORWARD, 80],                          //          //
            [logo.tokenizer.primitives.LEFT, 45],                             //          //
            //                                                                //          //
            // start tree 40 ---------------------------------------          //          //
            [logo.tokenizer.primitives.FORWARD, 40],              //          //          //
            [logo.tokenizer.primitives.LEFT, 45],                 //          //          //
            //                                                    //          //          //
            // start tree 20 ---------------------------          //          //          //
            [logo.tokenizer.primitives.FORWARD, 20],  //          //          //          //
            [logo.tokenizer.primitives.LEFT, 45],     //          //          //          //
            //                                        //          //          //          //
            [logo.tokenizer.primitives.RIGHT, 90],    //          //          //          //
            //                                        //          //          //          //
            [logo.tokenizer.primitives.LEFT, 45],     //          //          //          //
            [logo.tokenizer.primitives.BACK, 20],     //          //          //          //
            // end tree 20 -----------------------------          //          //          //
            //                                                    //          //          //
            [logo.tokenizer.primitives.RIGHT, 90],                //          //          //
            //                                                    //          //          //
            // start tree 20 ---------------------------          //          //          //
            [logo.tokenizer.primitives.FORWARD, 20],  //          //          //          //
            [logo.tokenizer.primitives.LEFT, 45],     //          //          //          //
            //                                        //          //          //          //
            [logo.tokenizer.primitives.RIGHT, 90],    //          //          //          //
            //                                        //          //          //          //
            [logo.tokenizer.primitives.LEFT, 45],     //          //          //          //
            [logo.tokenizer.primitives.BACK, 20],     //          //          //          //
            // end tree 20 -----------------------------          //          //          //
            //                                                    //          //          //
            [logo.tokenizer.primitives.LEFT, 45],                 //          //          //
            [logo.tokenizer.primitives.BACK, 40],                 //          //          //
            // end tree 40 -----------------------------------------          //          //
            //                                                                //          //
            [logo.tokenizer.primitives.RIGHT, 90],                            //          //
            //                                                                //          //
            // start tree 40 ---------------------------------------          //          //
            [logo.tokenizer.primitives.FORWARD, 40],              //          //          //
            [logo.tokenizer.primitives.LEFT, 45],                 //          //          //
            //                                                    //          //          //
            // start tree 20 ---------------------------          //          //          //
            [logo.tokenizer.primitives.FORWARD, 20],  //          //          //          //
            [logo.tokenizer.primitives.LEFT, 45],     //          //          //          //
            //                                        //          //          //          //
            [logo.tokenizer.primitives.RIGHT, 90],    //          //          //          //
            //                                        //          //          //          //
            [logo.tokenizer.primitives.LEFT, 45],     //          //          //          //
            [logo.tokenizer.primitives.BACK, 20],     //          //          //          //
            // end tree 20 -----------------------------          //          //          //
            //                                                    //          //          //
            [logo.tokenizer.primitives.RIGHT, 90],                //          //          //
            //                                                    //          //          //
            // start tree 20 ---------------------------          //          //          //
            [logo.tokenizer.primitives.FORWARD, 20],  //          //          //          //
            [logo.tokenizer.primitives.LEFT, 45],     //          //          //          //
            //                                        //          //          //          //
            [logo.tokenizer.primitives.RIGHT, 90],    //          //          //          //
            //                                        //          //          //          //
            [logo.tokenizer.primitives.LEFT, 45],     //          //          //          //
            [logo.tokenizer.primitives.BACK, 20],     //          //          //          //
            // end tree 20 -----------------------------          //          //          //
            //                                                    //          //          //
            [logo.tokenizer.primitives.LEFT, 45],                 //          //          //
            [logo.tokenizer.primitives.BACK, 40],                 //          //          //
            // end tree 40 -----------------------------------------          //          //
            //                                                                //          //
            [logo.tokenizer.primitives.LEFT, 45],                             //          //
            [logo.tokenizer.primitives.BACK, 80],                             //          //
            // end tree 80 -----------------------------------------------------          //
            //                                                                            //
            [logo.tokenizer.primitives.RIGHT, 90],                                        //
            //                                                                            //
            // start tree 80 ---------------------------------------------------          //
            [logo.tokenizer.primitives.FORWARD, 80],                          //          //
            [logo.tokenizer.primitives.LEFT, 45],                             //          //
            //                                                                //          //
            // start tree 40 ---------------------------------------          //          //
            [logo.tokenizer.primitives.FORWARD, 40],              //          //          //
            [logo.tokenizer.primitives.LEFT, 45],                 //          //          //
            //                                                    //          //          //
            // start tree 20 ---------------------------          //          //          //
            [logo.tokenizer.primitives.FORWARD, 20],  //          //          //          //
            [logo.tokenizer.primitives.LEFT, 45],     //          //          //          //
            //                                        //          //          //          //
            [logo.tokenizer.primitives.RIGHT, 90],    //          //          //          //
            //                                        //          //          //          //
            [logo.tokenizer.primitives.LEFT, 45],     //          //          //          //
            [logo.tokenizer.primitives.BACK, 20],     //          //          //          //
            // end tree 20 -----------------------------          //          //          //
            //                                                    //          //          //
            [logo.tokenizer.primitives.RIGHT, 90],                //          //          //
            //                                                    //          //          //
            // start tree 20 ---------------------------          //          //          //
            [logo.tokenizer.primitives.FORWARD, 20],  //          //          //          //
            [logo.tokenizer.primitives.LEFT, 45],     //          //          //          //
            //                                        //          //          //          //
            [logo.tokenizer.primitives.RIGHT, 90],    //          //          //          //
            //                                        //          //          //          //
            [logo.tokenizer.primitives.LEFT, 45],     //          //          //          //
            [logo.tokenizer.primitives.BACK, 20],     //          //          //          //
            // end tree 20 -----------------------------          //          //          //
            //                                                    //          //          //
            [logo.tokenizer.primitives.LEFT, 45],                 //          //          //
            [logo.tokenizer.primitives.BACK, 40],                 //          //          //
            // end tree 40 -----------------------------------------          //          //
            //                                                                //          //
            [logo.tokenizer.primitives.RIGHT, 90],                            //          //
            //                                                                //          //
            // start tree 40 ---------------------------------------          //          //
            [logo.tokenizer.primitives.FORWARD, 40],              //          //          //
            [logo.tokenizer.primitives.LEFT, 45],                 //          //          //
            //                                                    //          //          //
            // start tree 20 ---------------------------          //          //          //
            [logo.tokenizer.primitives.FORWARD, 20],  //          //          //          //
            [logo.tokenizer.primitives.LEFT, 45],     //          //          //          //
            //                                        //          //          //          //
            [logo.tokenizer.primitives.RIGHT, 90],    //          //          //          //
            //                                        //          //          //          //
            [logo.tokenizer.primitives.LEFT, 45],     //          //          //          //
            [logo.tokenizer.primitives.BACK, 20],     //          //          //          //
            // end tree 20 -----------------------------          //          //          //
            //                                                    //          //          //
            [logo.tokenizer.primitives.RIGHT, 90],                //          //          //
            //                                                    //          //          //
            // start tree 20 ---------------------------          //          //          //
            [logo.tokenizer.primitives.FORWARD, 20],  //          //          //          //
            [logo.tokenizer.primitives.LEFT, 45],     //          //          //          //
            //                                        //          //          //          //
            [logo.tokenizer.primitives.RIGHT, 90],    //          //          //          //
            [logo.tokenizer.primitives.LEFT, 45],     //          //          //          //
            [logo.tokenizer.primitives.BACK, 20],     //          //          //          //
            // end tree 20 -----------------------------          //          //          //
            //                                                    //          //          //
            [logo.tokenizer.primitives.LEFT, 45],                 //          //          //
            [logo.tokenizer.primitives.BACK, 40],                 //          //          //
            // end tree 40 -----------------------------------------          //          //
            //                                                                //          //
            [logo.tokenizer.primitives.LEFT, 45],                             //          //
            [logo.tokenizer.primitives.BACK, 80],                             //          //
            // end tree 80 -----------------------------------------------------          //
            //                                                                            //                    
            [logo.tokenizer.primitives.LEFT, 45],                                         //
            [logo.tokenizer.primitives.BACK, 160]                                         //
            // end tree 160 ----------------------------------------------------------------
        ]
    );

    return tests.every(test => test);
}