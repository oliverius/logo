function runTokenizerTests(i18n) {
    const LF = "\n";
    const tokenizer = new Tokenizer(i18n['English'].primitiveAliases); // Tests only with English primitives
    let testPassed = (testName) => {
        console.log(`%cTEST %cPASSED %c${testName}`, 'color: black;', 'color: green; font-weight:bold;', 'color: grey;');
    };
    let testFailed = (testName) => {
        console.log(`%cTEST %cFAILED %c${testName}`, 'color: black;', 'color: red; font-weight:bold;', 'color: grey;');
    };
    let assertToken = (expectedToken = {}, actualToken = {}) => {
        let success = actualToken.startIndex === expectedToken.startIndex &&
            actualToken.endIndex === expectedToken.endIndex &&
            actualToken.text === expectedToken.text &&
            actualToken.tokenType === expectedToken.tokenType &&
            actualToken.primitive === expectedToken.primitive;
        if (!success) {
            throw `Expected token: ${expectedToken} - Actual token: ${actualToken}`;
        }
        return success;
    };
    let assertTokens = (testName = "", expectedTokens = [], actualTokens = []) => {
        if (expectedTokens.length !== actualTokens.length) {
            throw `TEST "${testName}": Expected and actual have different number of tokens`;
        }
        let success = expectedTokens.every((expectedToken, index) => assertToken(expectedToken, actualTokens[index]));
        
        if (success) {
            testPassed(`Tokenizer "${testName}"`);
        } else {
            testFailed(`Tokenizer "${testName}"`);
        }

        return success;
    };
    let lines = (arr) => arr.join('\n');

    let tests = [];

    tests.push(
        assertTokens(
        'One space only',
        [],
        tokenizer.tokenize(" ")
        )
    );
    tests.push(
        assertTokens(
            'Two spaces only',
            [],
            tokenizer.tokenize("  ")
        )
    );
    tests.push(
        assertTokens(
            'Three spaces only',
            [],
            tokenizer.tokenize("   ")
        )
    );
    tests.push(
        assertTokens(
            'Unknown token found',
            [
                new Token(0, "fd", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.FORWARD),
                new Token(3, "2", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE),
                new Token(4, "^", Tokenizer.tokenTypes.UNKNOWN_TOKEN, Tokenizer.primitives.NONE),
                new Token(5, "3", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE)
            ],
            tokenizer.tokenize("fd 2^3")
        )
    );
    tests.push(
        assertTokens(
            'Square without REPEAT primitive',
            [
                new Token(0, "fd", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.FORWARD),
                new Token(3, "60", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE),
                new Token(6, "rt", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.RIGHT),
                new Token(9, "90", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE),
                new Token(12, "fd", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.FORWARD),
                new Token(15, "60", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE),
                new Token(18, "rt", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.RIGHT),
                new Token(21, "90", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE),
                new Token(24, "fd", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.FORWARD),
                new Token(27, "60", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE),
                new Token(30, "rt", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.RIGHT),
                new Token(33, "90", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE),
                new Token(36, "fd", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.FORWARD),
                new Token(39, "60", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE),
                new Token(42, "rt", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.RIGHT),
                new Token(45, "90", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE)
            ],
            tokenizer.tokenize("fd 60 rt 90 fd 60 rt 90 fd 60 rt 90 fd 60 rt 90")
        )
    );
    tests.push(
        assertTokens(
            'Square with REPEAT primitive and brackets next to other tokens',
            [
                new Token(0, "repeat", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.REPEAT),
                new Token(7, "4", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE),
                new Token(9, "[", Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(10, "fd", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.FORWARD),
                new Token(13, "60", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE),
                new Token(16, "rt", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.RIGHT),
                new Token(19, "90", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE),
                new Token(21, "]", Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE)
            ],
            tokenizer.tokenize("repeat 4 [fd 60 rt 90]")
        )
    );
    tests.push(
        assertTokens(
            'Square with REPEAT primitive and brackets with spaces each side',
            [
                new Token(0, "repeat", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.REPEAT),
                new Token(7, "4", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE),
                new Token(9, "[", Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(11, "fd", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.FORWARD),
                new Token(14, "60", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE),
                new Token(17, "rt", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.RIGHT),
                new Token(20, "90", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE),
                new Token(23, "]", Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE)
            ],
            tokenizer.tokenize("repeat 4 [ fd 60 rt 90 ]")
        )
    );
    tests.push(
        assertTokens(
            'Double REPEAT with inside one in the middle of the primitives of the first one',
            [
                new Token(0, "repeat", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.REPEAT),
                new Token(7, "3", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE),
                new Token(9, "[", Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(10, "fd", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.FORWARD),
                new Token(13, "60", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE),
                new Token(16, "repeat", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.REPEAT),
                new Token(23, "4", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE),
                new Token(25, "[", Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(26, "lt", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.LEFT),
                new Token(29, "90", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE),
                new Token(32, "bk", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.BACK),
                new Token(35, "20", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE),
                new Token(37, "]", Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(39, "rt", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.RIGHT),
                new Token(42, "120", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE),
                new Token(45, "]", Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE)
            ],
            tokenizer.tokenize("repeat 3 [fd 60 repeat 4 [lt 90 bk 20] rt 120]")
        )
    );
    tests.push(
        assertTokens(
            'PROCEDURE with no parameters in one line and the PROCEDURE is not called',
            [
                new Token(0, "to", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.TO),
                new Token(3, "line", Tokenizer.tokenTypes.PROCEDURE_NAME, Tokenizer.primitives.NONE),
                new Token(8, "fd", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.FORWARD),
                new Token(11, "60", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE),
                new Token(14, "end", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.END)
            ],
            tokenizer.tokenize("to line fd 60 end")
        )
    );
    tests.push(
        assertTokens(
            'PROCEDURE with no parameters in multiple lines and the PROCEDURE is not called',
            [
                new Token(0, "to", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.TO),
                new Token(3, "line", Tokenizer.tokenTypes.PROCEDURE_NAME, Tokenizer.primitives.NONE),
                new Token(7, LF, Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(8, "fd", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.FORWARD),
                new Token(11, "60", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE),
                new Token(13, LF, Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(14, "end", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.END)
            ],
            tokenizer.tokenize(
                lines([
                    "to line",
                    "fd 60",
                    "end"
                ])
            )
        )
    );
    tests.push(
        assertTokens(
            'PROCEDURE with no parameters in one line and the PROCEDURE is called once',
            [
                new Token(0, "to", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.TO),
                new Token(3, "line", Tokenizer.tokenTypes.PROCEDURE_NAME, Tokenizer.primitives.NONE),
                new Token(8, "fd", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.FORWARD),
                new Token(11, "60", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE),
                new Token(14, "end", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.END),
                new Token(18, "line", Tokenizer.tokenTypes.PROCEDURE_NAME, Tokenizer.primitives.NONE),
            ],
            tokenizer.tokenize("to line fd 60 end line")
        )
    );
    tests.push(
        assertTokens(
            'PROCEDURE with no parameters in multiple lines and the PROCEDURE is called once',
            [
                new Token(0, "to", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.TO),
                new Token(3, "line", Tokenizer.tokenTypes.PROCEDURE_NAME, Tokenizer.primitives.NONE),
                new Token(7, LF, Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(8, "fd", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.FORWARD),
                new Token(11, "60", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE),
                new Token(13, LF, Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(14, "end", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.END),
                new Token(17, LF, Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(18, "line", Tokenizer.tokenTypes.PROCEDURE_NAME, Tokenizer.primitives.NONE),
            ],
            tokenizer.tokenize(
                lines([
                    "to line",
                    "fd 60",
                    "end",
                    "line"
                ])
            )
        )
    );
    tests.push(
        assertTokens(
            'PROCEDURE with no parameters in one line and the PROCEDURE is called twice',
            [
                new Token(0, "to", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.TO),
                new Token(3, "line", Tokenizer.tokenTypes.PROCEDURE_NAME, Tokenizer.primitives.NONE),
                new Token(8, "fd", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.FORWARD),
                new Token(11, "60", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE),
                new Token(14, "end", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.END),
                new Token(18, "line", Tokenizer.tokenTypes.PROCEDURE_NAME, Tokenizer.primitives.NONE),
                new Token(23, "rt", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.RIGHT),
                new Token(26, "90", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE),
                new Token(29, "line", Tokenizer.tokenTypes.PROCEDURE_NAME, Tokenizer.primitives.NONE)
            ],
            tokenizer.tokenize("to line fd 60 end line rt 90 line")
        )
    );
    tests.push(
        assertTokens(
            'PROCEDURE with no parameters in multiple lines and the PROCEDURE is called twice',
            [
                new Token(0, "to", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.TO),
                new Token(3, "line", Tokenizer.tokenTypes.PROCEDURE_NAME, Tokenizer.primitives.NONE),
                new Token(7, LF, Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(8, "fd", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.FORWARD),
                new Token(11, "60", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE),
                new Token(13, LF, Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(14, "end", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.END),
                new Token(17, LF, Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(18, "line", Tokenizer.tokenTypes.PROCEDURE_NAME, Tokenizer.primitives.NONE),
                new Token(22, LF, Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(23, "rt", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.RIGHT),
                new Token(26, "90", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE),
                new Token(28, LF, Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(29, "line", Tokenizer.tokenTypes.PROCEDURE_NAME, Tokenizer.primitives.NONE)
            ],
            tokenizer.tokenize(
                lines([
                    "to line",
                    "fd 60",
                    "end",
                    "line",
                    "rt 90",
                    "line"
                ])
            )
        )
    );
    tests.push(
        assertTokens(
            'PROCEDURE with one parameter in one line and the PROCEDURE is called twice',
            [
                new Token(0, "to", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.TO),
                new Token(3, "line", Tokenizer.tokenTypes.PROCEDURE_NAME, Tokenizer.primitives.NONE),
                new Token(8, ":length", Tokenizer.tokenTypes.VARIABLE, Tokenizer.primitives.NONE),
                new Token(16, "fd", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.FORWARD),
                new Token(19, ":length", Tokenizer.tokenTypes.VARIABLE, Tokenizer.primitives.NONE),
                new Token(27, "end", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.END),
                new Token(31, "line", Tokenizer.tokenTypes.PROCEDURE_NAME, Tokenizer.primitives.NONE),
                new Token(36, "60", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE),
                new Token(39, "rt", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.RIGHT),
                new Token(42, "90", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE),
                new Token(45, "line", Tokenizer.tokenTypes.PROCEDURE_NAME, Tokenizer.primitives.NONE),
                new Token(50, "30", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE)
            ],
            tokenizer.tokenize("to line :length fd :length end line 60 rt 90 line 30")
        )
    );
    tests.push(
        assertTokens(
            'PROCEDURE with one parameter in multiple lines and the PROCEDURE is called twice',
            [
                new Token(0, "to", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.TO),
                new Token(3, "line", Tokenizer.tokenTypes.PROCEDURE_NAME, Tokenizer.primitives.NONE),
                new Token(8, ":length", Tokenizer.tokenTypes.VARIABLE, Tokenizer.primitives.NONE),
                new Token(15, LF, Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(16, "fd", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.FORWARD),
                new Token(19, ":length", Tokenizer.tokenTypes.VARIABLE, Tokenizer.primitives.NONE),
                new Token(26, LF, Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(27, "end", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.END),
                new Token(30, LF, Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(31, "line", Tokenizer.tokenTypes.PROCEDURE_NAME, Tokenizer.primitives.NONE),
                new Token(36, "60", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE),
                new Token(38, LF, Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(39, "rt", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.RIGHT),
                new Token(42, "90", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE),
                new Token(44, LF, Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(45, "line", Tokenizer.tokenTypes.PROCEDURE_NAME, Tokenizer.primitives.NONE),
                new Token(50, "30", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE)
            ],
            tokenizer.tokenize(
                lines([
                    "to line :length",
                    "fd :length",
                    "end",
                    "line 60",
                    "rt 90",
                    "line 30"
                ])
            )
        )
    );
    tests.push(
        assertTokens(
            'Primitive with an expression "a + b" as parameter',
            [
                new Token(0, "fd", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.FORWARD),
                new Token(3, "1", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE),
                new Token(5, "+", Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(7, "60", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE)            
            ],
            tokenizer.tokenize("fd 1 + 60")
        )
    );
    tests.push(
        assertTokens(
            'Primitive with an expression "a - b" as parameter',
            [
                new Token(0, "fd", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.FORWARD),
                new Token(3, "60", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE),
                new Token(6, "-", Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(8, "50", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE)            
            ],
            tokenizer.tokenize("fd 60 - 50")
        )
    );
    tests.push(
        assertTokens(
            'Primitive with an expression "a * b" as parameter',
            [
                new Token(0, "fd", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.FORWARD),
                new Token(3, "10", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE),
                new Token(6, "*", Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(8, "5", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE)
            ],
            tokenizer.tokenize("fd 10 * 5")
        )
    );
    tests.push(
        assertTokens(
            'Primitive with an expression "a / b" as parameter',
            [
                new Token(0, "fd", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.FORWARD),
                new Token(3, "100", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE),
                new Token(7, "/", Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(9, "5", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE)
            ],
            tokenizer.tokenize("fd 100 / 5")
        )
    );
    tests.push(
        assertTokens(
            'PROCEDURE with one parameter in multiple lines and the parameter is an expression "a + b"',
            [
                new Token(0, "to", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.TO),
                new Token(3, "line", Tokenizer.tokenTypes.PROCEDURE_NAME, Tokenizer.primitives.NONE),
                new Token(8, ":length", Tokenizer.tokenTypes.VARIABLE, Tokenizer.primitives.NONE),
                new Token(15, LF, Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(16, "fd", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.FORWARD),
                new Token(19, ":length", Tokenizer.tokenTypes.VARIABLE, Tokenizer.primitives.NONE),
                new Token(26, LF, Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(27, "end", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.END),
                new Token(30, LF, Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(31, "line", Tokenizer.tokenTypes.PROCEDURE_NAME, Tokenizer.primitives.NONE),
                new Token(36, "10", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE),
                new Token(39, "+", Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(41, "60", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE)
            ],
            tokenizer.tokenize(
                lines([
                    "to line :length",
                    "fd :length",
                    "end",
                    "line 10 + 60"
                ])
            )
        )
    );
    tests.push(
        assertTokens(
            'PROCEDURE with one parameter in multiple lines move FORWARD only if condition is met',
            [
                new Token(0, "to", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.TO),
                new Token(3, "line", Tokenizer.tokenTypes.PROCEDURE_NAME, Tokenizer.primitives.NONE),
                new Token(8, ":length", Tokenizer.tokenTypes.VARIABLE, Tokenizer.primitives.NONE),
                new Token(15, LF, Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(16, "if", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.IF),
                new Token(19, ":length", Tokenizer.tokenTypes.VARIABLE, Tokenizer.primitives.NONE),
                new Token(27, "<", Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(29, "50", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE),
                new Token(32, "[", Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(34, "stop", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.STOP),
                new Token(39, "]", Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(40, LF, Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(41, "fd", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.FORWARD),
                new Token(44, ":length", Tokenizer.tokenTypes.VARIABLE, Tokenizer.primitives.NONE),
                new Token(51, LF, Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(52, "end", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.END),
                new Token(55, LF, Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(56, "line", Tokenizer.tokenTypes.PROCEDURE_NAME, Tokenizer.primitives.NONE),
                new Token(61, "100", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE),
                new Token(64, LF, Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(65, "rt", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.RIGHT),
                new Token(68, "90", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE),
                new Token(70, LF, Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(71, "line", Tokenizer.tokenTypes.PROCEDURE_NAME, Tokenizer.primitives.NONE),
                new Token(76, "30", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE),
                new Token(78, LF, Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(79, "rt", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.RIGHT),
                new Token(82, "90", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE)
            ],
            tokenizer.tokenize(
                lines([
                    "to line :length",
                    "if :length < 50 [ stop ]",
                    "fd :length",
                    "end",
                    "line 100",
                    "rt 90",
                    "line 30",
                    "rt 90"
                ])
            )
        )
    );
    tests.push(
        assertTokens(
            'PROCEDURE with one parameter in multiple lines called recursively with IF and STOP',
            [
                new Token(0, "to", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.TO),
                new Token(3, "hook", Tokenizer.tokenTypes.PROCEDURE_NAME, Tokenizer.primitives.NONE),
                new Token(8, ":length", Tokenizer.tokenTypes.VARIABLE, Tokenizer.primitives.NONE),
                new Token(15, LF, Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(16, "if", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.IF),
                new Token(19, ":length", Tokenizer.tokenTypes.VARIABLE, Tokenizer.primitives.NONE),
                new Token(27, "<", Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(29, "10", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE),
                new Token(32, "[", Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(34, "stop", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.STOP),
                new Token(39, "]", Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(40, LF, Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(41, "fd", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.FORWARD),
                new Token(44, ":length", Tokenizer.tokenTypes.VARIABLE, Tokenizer.primitives.NONE),
                new Token(51, LF, Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(52, "rt", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.RIGHT),
                new Token(55, "45", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE),
                new Token(57, LF, Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(58, "hook", Tokenizer.tokenTypes.PROCEDURE_NAME, Tokenizer.primitives.NONE),
                new Token(63, ":length", Tokenizer.tokenTypes.VARIABLE, Tokenizer.primitives.NONE),
                new Token(70, "/", Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(71, "2", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE),
                new Token(72, LF, Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(73, "end", Tokenizer.tokenTypes.PRIMITIVE, Tokenizer.primitives.END),
                new Token(76, LF, Tokenizer.tokenTypes.DELIMITER, Tokenizer.primitives.NONE),
                new Token(77, "hook", Tokenizer.tokenTypes.PROCEDURE_NAME, Tokenizer.primitives.NONE),
                new Token(82, "120", Tokenizer.tokenTypes.NUMBER, Tokenizer.primitives.NONE)
            ],
            tokenizer.tokenize(
                lines([
                    "to hook :length",
                    "if :length < 10 [ stop ]",
                    "fd :length",
                    "rt 45",
                    "hook :length/2",
                    "end",
                    "hook 120"
                ])
            )
        )
    );

    return tests.every(test => test);
}