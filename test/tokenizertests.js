runTokenizerTests();
function runTokenizerTests() {
  const LF = "\n";
  let tokenizer = new Tokenizer();
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
  let assertTokens = (comment = "", expectedTokens = [], actualTokens = []) => {
      if (expectedTokens.length !== actualTokens.length) {
          throw `TEST "${comment}": Expected and actual have different number of tokens`;
      }
      let success = expectedTokens.every((expectedToken, index) => assertToken(expectedToken, actualTokens[index]) === true);
      let testResult = success ? "PASSED" : "FAILED";      
      console.log(`TEST "${comment}": ${testResult}`);
  };
  let lines = (arr) => arr.join('\n');

  assertTokens(
      'One space only',
      [],
      tokenizer.tokenize(" ")
  );
  assertTokens(
      'Two spaces only',
      [],
      tokenizer.tokenize("  ")
  );
  assertTokens(
      'Three spaces only',
      [],
      tokenizer.tokenize("   ")
  );
  assertTokens(
      'Square without REPEAT primitive',
      [
          new Token(0, "fd", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.FORWARD),
          new Token(3, "60", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
          new Token(6, "rt", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.RIGHT),
          new Token(9, "90", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
          new Token(12, "fd", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.FORWARD),
          new Token(15, "60", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
          new Token(18, "rt", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.RIGHT),
          new Token(21, "90", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
          new Token(24, "fd", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.FORWARD),
          new Token(27, "60", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
          new Token(30, "rt", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.RIGHT),
          new Token(33, "90", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
          new Token(36, "fd", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.FORWARD),
          new Token(39, "60", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
          new Token(42, "rt", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.RIGHT),
          new Token(45, "90", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE)
      ],
      tokenizer.tokenize("fd 60 rt 90 fd 60 rt 90 fd 60 rt 90 fd 60 rt 90")
  );
  assertTokens(
      'Square with REPEAT primitive and brackets next to other tokens',
      [
          new Token(0, "repeat", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.REPEAT),
          new Token(7, "4", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
          new Token(9, "[", logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE),
          new Token(10, "fd", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.FORWARD),
          new Token(13, "60", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
          new Token(16, "rt", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.RIGHT),
          new Token(19, "90", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
          new Token(21, "]", logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE)
      ],
      tokenizer.tokenize("repeat 4 [fd 60 rt 90]")
  );
  assertTokens(
      'Square with REPEAT primitive and brackets with spaces each side',
      [
          new Token(0, "repeat", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.REPEAT),
          new Token(7, "4", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
          new Token(9, "[", logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE),
          new Token(11, "fd", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.FORWARD),
          new Token(14, "60", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
          new Token(17, "rt", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.RIGHT),
          new Token(20, "90", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
          new Token(23, "]", logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE)
      ],
      tokenizer.tokenize("repeat 4 [ fd 60 rt 90 ]")
  );
  assertTokens(
      'Double REPEAT with inside one in the middle of the primitives of the first one',
      [
          new Token(0, "repeat", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.REPEAT),
          new Token(7, "3", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
          new Token(9, "[", logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE),
          new Token(10, "fd", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.FORWARD),
          new Token(13, "60", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
          new Token(16, "repeat", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.REPEAT),
          new Token(23, "4", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
          new Token(25, "[", logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE),
          new Token(26, "lt", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.LEFT),
          new Token(29, "90", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
          new Token(32, "bk", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.BACK),
          new Token(35, "20", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
          new Token(37, "]", logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE),
          new Token(39, "rt", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.RIGHT),
          new Token(42, "120", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
          new Token(45, "]", logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE)
      ],
      tokenizer.tokenize("repeat 3 [fd 60 repeat 4 [lt 90 bk 20] rt 120]")
  );
  assertTokens(
      'PROCEDURE with no parameters in one line and the PROCEDURE is not called',
      [
          new Token(0, "to", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.TO),
          new Token(3, "line", logo.tokenizer.tokenTypes.PROCEDURE_NAME, logo.tokenizer.primitives.NONE),
          new Token(8, "fd", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.FORWARD),
          new Token(11, "60", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
          new Token(14, "end", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.END)
      ],
      tokenizer.tokenize("to line fd 60 end")
  );
  assertTokens(
      'PROCEDURE with no parameters in multiple lines and the PROCEDURE is not called',
      [
          new Token(0, "to", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.TO),
          new Token(3, "line", logo.tokenizer.tokenTypes.PROCEDURE_NAME, logo.tokenizer.primitives.NONE),
          new Token(7, LF, logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE),
          new Token(8, "fd", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.FORWARD),
          new Token(11, "60", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
          new Token(13, LF, logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE),
          new Token(14, "end", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.END)
      ],
      tokenizer.tokenize(
          lines([
              "to line",
              "fd 60",
              "end"
          ])
      )
  );
  assertTokens(
      'PROCEDURE with no parameters in one line and the PROCEDURE is called once',
      [
          new Token(0, "to", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.TO),
          new Token(3, "line", logo.tokenizer.tokenTypes.PROCEDURE_NAME, logo.tokenizer.primitives.NONE),
          new Token(8, "fd", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.FORWARD),
          new Token(11, "60", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
          new Token(14, "end", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.END),
          new Token(18, "line", logo.tokenizer.tokenTypes.PROCEDURE_NAME, logo.tokenizer.primitives.NONE),
      ],
      tokenizer.tokenize("to line fd 60 end line")
  );
  assertTokens(
      'PROCEDURE with no parameters in multiple lines and the PROCEDURE is called once',
      [
          new Token(0, "to", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.TO),
          new Token(3, "line", logo.tokenizer.tokenTypes.PROCEDURE_NAME, logo.tokenizer.primitives.NONE),
          new Token(7, LF, logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE),
          new Token(8, "fd", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.FORWARD),
          new Token(11, "60", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
          new Token(13, LF, logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE),
          new Token(14, "end", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.END),
          new Token(17, LF, logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE),
          new Token(18, "line", logo.tokenizer.tokenTypes.PROCEDURE_NAME, logo.tokenizer.primitives.NONE),
      ],
      tokenizer.tokenize(
          lines([
              "to line",
              "fd 60",
              "end",
              "line"
          ])
      )
  );
  assertTokens(
      'PROCEDURE with no parameters in one line and the PROCEDURE is called twice',
      [
          new Token(0, "to", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.TO),
          new Token(3, "line", logo.tokenizer.tokenTypes.PROCEDURE_NAME, logo.tokenizer.primitives.NONE),
          new Token(8, "fd", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.FORWARD),
          new Token(11, "60", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
          new Token(14, "end", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.END),
          new Token(18, "line", logo.tokenizer.tokenTypes.PROCEDURE_NAME, logo.tokenizer.primitives.NONE),
          new Token(23, "rt", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.RIGHT),
          new Token(26, "90", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
          new Token(29, "line", logo.tokenizer.tokenTypes.PROCEDURE_NAME, logo.tokenizer.primitives.NONE)
      ],
      tokenizer.tokenize("to line fd 60 end line rt 90 line")
  );
  assertTokens(
      'PROCEDURE with no parameters in multiple lines and the PROCEDURE is called twice',
      [
          new Token(0, "to", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.TO),
          new Token(3, "line", logo.tokenizer.tokenTypes.PROCEDURE_NAME, logo.tokenizer.primitives.NONE),
          new Token(7, LF, logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE),
          new Token(8, "fd", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.FORWARD),
          new Token(11, "60", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
          new Token(13, LF, logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE),
          new Token(14, "end", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.END),
          new Token(17, LF, logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE),
          new Token(18, "line", logo.tokenizer.tokenTypes.PROCEDURE_NAME, logo.tokenizer.primitives.NONE),
          new Token(22, LF, logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE),
          new Token(23, "rt", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.RIGHT),
          new Token(26, "90", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
          new Token(28, LF, logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE),
          new Token(29, "line", logo.tokenizer.tokenTypes.PROCEDURE_NAME, logo.tokenizer.primitives.NONE)
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
  );
  assertTokens(
      'PROCEDURE with one parameter in one line and the PROCEDURE is called twice',
      [
          new Token(0, "to", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.TO),
          new Token(3, "line", logo.tokenizer.tokenTypes.PROCEDURE_NAME, logo.tokenizer.primitives.NONE),
          new Token(8, ":length", logo.tokenizer.tokenTypes.VARIABLE, logo.tokenizer.primitives.NONE),
          new Token(16, "fd", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.FORWARD),
          new Token(19, ":length", logo.tokenizer.tokenTypes.VARIABLE, logo.tokenizer.primitives.NONE),
          new Token(27, "end", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.END),
          new Token(31, "line", logo.tokenizer.tokenTypes.PROCEDURE_NAME, logo.tokenizer.primitives.NONE),
          new Token(36, "60", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
          new Token(39, "rt", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.RIGHT),
          new Token(42, "90", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
          new Token(45, "line", logo.tokenizer.tokenTypes.PROCEDURE_NAME, logo.tokenizer.primitives.NONE),
          new Token(50, "30", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE)
      ],
      tokenizer.tokenize("to line :length fd :length end line 60 rt 90 line 30")
  );
  assertTokens(
      'PROCEDURE with one parameter in multiple lines and the PROCEDURE is called twice',
      [
          new Token(0, "to", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.TO),
          new Token(3, "line", logo.tokenizer.tokenTypes.PROCEDURE_NAME, logo.tokenizer.primitives.NONE),
          new Token(8, ":length", logo.tokenizer.tokenTypes.VARIABLE, logo.tokenizer.primitives.NONE),
          new Token(15, LF, logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE),
          new Token(16, "fd", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.FORWARD),
          new Token(19, ":length", logo.tokenizer.tokenTypes.VARIABLE, logo.tokenizer.primitives.NONE),
          new Token(26, LF, logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE),
          new Token(27, "end", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.END),
          new Token(30, LF, logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE),
          new Token(31, "line", logo.tokenizer.tokenTypes.PROCEDURE_NAME, logo.tokenizer.primitives.NONE),
          new Token(36, "60", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
          new Token(38, LF, logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE),
          new Token(39, "rt", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.RIGHT),
          new Token(42, "90", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
          new Token(44, LF, logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE),
          new Token(45, "line", logo.tokenizer.tokenTypes.PROCEDURE_NAME, logo.tokenizer.primitives.NONE),
          new Token(50, "30", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE)
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
  );
  assertTokens(
      'Primitive with an expression "a + b" as parameter',
      [
          new Token(0, "fd", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.FORWARD),
          new Token(3, "1", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
          new Token(5, "+", logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE),
          new Token(7, "60", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE)            
      ],
      tokenizer.tokenize("fd 1 + 60")
  );
  assertTokens(
      'Primitive with an expression "a - b" as parameter',
      [
          new Token(0, "fd", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.FORWARD),
          new Token(3, "60", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
          new Token(6, "-", logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE),
          new Token(8, "50", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE)            
      ],
      tokenizer.tokenize("fd 60 - 50")
  );
  assertTokens(
      'Primitive with an expression "a * b" as parameter',
      [
          new Token(0, "fd", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.FORWARD),
          new Token(3, "10", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
          new Token(6, "*", logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE),
          new Token(8, "5", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE)            
      ],
      tokenizer.tokenize("fd 10 * 5")
  );
  assertTokens(
      'Primitive with an expression "a / b" as parameter',
      [
          new Token(0, "fd", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.FORWARD),
          new Token(3, "100", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
          new Token(7, "/", logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE),
          new Token(9, "5", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE)            
      ],
      tokenizer.tokenize("fd 100 / 5")
  );
  assertTokens(
      'PROCEDURE with one parameter in multiple lines and the parameter is an expression "a + b"',
      [
          new Token(0, "to", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.TO),
          new Token(3, "line", logo.tokenizer.tokenTypes.PROCEDURE_NAME, logo.tokenizer.primitives.NONE),
          new Token(8, ":length", logo.tokenizer.tokenTypes.VARIABLE, logo.tokenizer.primitives.NONE),
          new Token(15, LF, logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE),
          new Token(16, "fd", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.FORWARD),
          new Token(19, ":length", logo.tokenizer.tokenTypes.VARIABLE, logo.tokenizer.primitives.NONE),
          new Token(26, LF, logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE),
          new Token(27, "end", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.END),
          new Token(30, LF, logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE),
          new Token(31, "line", logo.tokenizer.tokenTypes.PROCEDURE_NAME, logo.tokenizer.primitives.NONE),
          new Token(36, "10", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
          new Token(39, "+", logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE),
          new Token(41, "60", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE)
      ],
      tokenizer.tokenize(
          lines([
              "to line :length",
              "fd :length",
              "end",
              "line 10 + 60"
          ])
      )
  );
  assertTokens(
    'PROCEDURE with one parameter in multiple lines called recursively with IF and STOP',
    [
        new Token(0, "to", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.TO),
        new Token(3, "hook", logo.tokenizer.tokenTypes.PROCEDURE_NAME, logo.tokenizer.primitives.NONE),
        new Token(8, ":length", logo.tokenizer.tokenTypes.VARIABLE, logo.tokenizer.primitives.NONE),

        new Token(15, LF, logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE),
        new Token(16, "if", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.IF),
        new Token(19, ":length", logo.tokenizer.tokenTypes.VARIABLE, logo.tokenizer.primitives.NONE),
        new Token(27, "<", logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE),
        new Token(29, "20", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
        new Token(32, "[", logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE),
        new Token(34, "stop", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.STOP),
        new Token(39, "]", logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE),

        new Token(40, LF, logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE),
        new Token(41, "fd", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.FORWARD),
        new Token(44, ":length", logo.tokenizer.tokenTypes.VARIABLE, logo.tokenizer.primitives.NONE),
        new Token(51, LF, logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE),
        new Token(52, "rt", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.RIGHT),
        new Token(55, "45", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
        new Token(57, LF, logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE),
        new Token(58, "hook", logo.tokenizer.tokenTypes.PROCEDURE_NAME, logo.tokenizer.primitives.NONE),
        new Token(63, ":length", logo.tokenizer.tokenTypes.VARIABLE, logo.tokenizer.primitives.NONE),
        new Token(70, "/", logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE),
        new Token(71, "2", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE),
        new Token(72, LF, logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE),
        new Token(73, "end", logo.tokenizer.tokenTypes.PRIMITIVE, logo.tokenizer.primitives.END),
        new Token(76, LF, logo.tokenizer.tokenTypes.DELIMITER, logo.tokenizer.primitives.NONE),
        new Token(77, "hook", logo.tokenizer.tokenTypes.PROCEDURE_NAME, logo.tokenizer.primitives.NONE),
        new Token(82, "100", logo.tokenizer.tokenTypes.NUMBER, logo.tokenizer.primitives.NONE)
    ],
    tokenizer.tokenize(
        lines([
            "to hook :length",
            "if :length < 20 [ stop ]",
            "fd :length",
            "rt 45",
            "hook :length/2",
            "end",
            "hook 100"
        ])
    )
);
}