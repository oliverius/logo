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
              console.log(`Expected token: ${expectedToken} - Actual token: ${actualToken}`);
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
          new Token(0, "fd", logo.tokenTypes.PRIMITIVE, logo.primitives.FORWARD),
          new Token(3, "60", logo.tokenTypes.NUMBER, logo.primitives.NONE),
          new Token(6, "rt", logo.tokenTypes.PRIMITIVE, logo.primitives.RIGHT),
          new Token(9, "90", logo.tokenTypes.NUMBER, logo.primitives.NONE),
          new Token(12, "fd", logo.tokenTypes.PRIMITIVE, logo.primitives.FORWARD),
          new Token(15, "60", logo.tokenTypes.NUMBER, logo.primitives.NONE),
          new Token(18, "rt", logo.tokenTypes.PRIMITIVE, logo.primitives.RIGHT),
          new Token(21, "90", logo.tokenTypes.NUMBER, logo.primitives.NONE),
          new Token(24, "fd", logo.tokenTypes.PRIMITIVE, logo.primitives.FORWARD),
          new Token(27, "60", logo.tokenTypes.NUMBER, logo.primitives.NONE),
          new Token(30, "rt", logo.tokenTypes.PRIMITIVE, logo.primitives.RIGHT),
          new Token(33, "90", logo.tokenTypes.NUMBER, logo.primitives.NONE),
          new Token(36, "fd", logo.tokenTypes.PRIMITIVE, logo.primitives.FORWARD),
          new Token(39, "60", logo.tokenTypes.NUMBER, logo.primitives.NONE),
          new Token(42, "rt", logo.tokenTypes.PRIMITIVE, logo.primitives.RIGHT),
          new Token(45, "90", logo.tokenTypes.NUMBER, logo.primitives.NONE)
      ],
      tokenizer.tokenize("fd 60 rt 90 fd 60 rt 90 fd 60 rt 90 fd 60 rt 90")
  );
  assertTokens(
      'Square with REPEAT primitive and brackets next to other tokens',
      [
          new Token(0, "repeat", logo.tokenTypes.PRIMITIVE, logo.primitives.REPEAT),
          new Token(7, "4", logo.tokenTypes.NUMBER, logo.primitives.NONE),
          new Token(9, "[", logo.tokenTypes.DELIMITER, logo.primitives.NONE),
          new Token(10, "fd", logo.tokenTypes.PRIMITIVE, logo.primitives.FORWARD),
          new Token(13, "60", logo.tokenTypes.NUMBER, logo.primitives.NONE),
          new Token(16, "rt", logo.tokenTypes.PRIMITIVE, logo.primitives.RIGHT),
          new Token(19, "90", logo.tokenTypes.NUMBER, logo.primitives.NONE),
          new Token(21, "]", logo.tokenTypes.DELIMITER, logo.primitives.NONE)
      ],
      tokenizer.tokenize("repeat 4 [fd 60 rt 90]")
  );
  assertTokens(
      'Square with REPEAT primitive and brackets with spaces each side',
      [
          new Token(0, "repeat", logo.tokenTypes.PRIMITIVE, logo.primitives.REPEAT),
          new Token(7, "4", logo.tokenTypes.NUMBER, logo.primitives.NONE),
          new Token(9, "[", logo.tokenTypes.DELIMITER, logo.primitives.NONE),
          new Token(11, "fd", logo.tokenTypes.PRIMITIVE, logo.primitives.FORWARD),
          new Token(14, "60", logo.tokenTypes.NUMBER, logo.primitives.NONE),
          new Token(17, "rt", logo.tokenTypes.PRIMITIVE, logo.primitives.RIGHT),
          new Token(20, "90", logo.tokenTypes.NUMBER, logo.primitives.NONE),
          new Token(23, "]", logo.tokenTypes.DELIMITER, logo.primitives.NONE)
      ],
      tokenizer.tokenize("repeat 4 [ fd 60 rt 90 ]")
  );
  assertTokens(
      'Double REPEAT with inside one in the middle of the primitives of the first one',
      [
          new Token(0, "repeat", logo.tokenTypes.PRIMITIVE, logo.primitives.REPEAT),
          new Token(7, "3", logo.tokenTypes.NUMBER, logo.primitives.NONE),
          new Token(9, "[", logo.tokenTypes.DELIMITER, logo.primitives.NONE),
          new Token(10, "fd", logo.tokenTypes.PRIMITIVE, logo.primitives.FORWARD),
          new Token(13, "60", logo.tokenTypes.NUMBER, logo.primitives.NONE),
          new Token(16, "repeat", logo.tokenTypes.PRIMITIVE, logo.primitives.REPEAT),
          new Token(23, "4", logo.tokenTypes.NUMBER, logo.primitives.NONE),
          new Token(25, "[", logo.tokenTypes.DELIMITER, logo.primitives.NONE),
          new Token(26, "lt", logo.tokenTypes.PRIMITIVE, logo.primitives.LEFT),
          new Token(29, "90", logo.tokenTypes.NUMBER, logo.primitives.NONE),
          new Token(32, "bk", logo.tokenTypes.PRIMITIVE, logo.primitives.BACK),
          new Token(35, "20", logo.tokenTypes.NUMBER, logo.primitives.NONE),
          new Token(37, "]", logo.tokenTypes.DELIMITER, logo.primitives.NONE),
          new Token(39, "rt", logo.tokenTypes.PRIMITIVE, logo.primitives.RIGHT),
          new Token(42, "120", logo.tokenTypes.NUMBER, logo.primitives.NONE),
          new Token(45, "]", logo.tokenTypes.DELIMITER, logo.primitives.NONE)
      ],
      tokenizer.tokenize("repeat 3 [fd 60 repeat 4 [lt 90 bk 20] rt 120]")
  );
  assertTokens(
      'PROCEDURE with no parameters in one line and the PROCEDURE is not called',
      [
          new Token(0, "to", logo.tokenTypes.PRIMITIVE, logo.primitives.PRIMITIVE_TO),
          new Token(3, "line", logo.tokenTypes.PROCEDURE_NAME, logo.primitives.NONE),
          new Token(8, "fd", logo.tokenTypes.PRIMITIVE, logo.primitives.FORWARD),
          new Token(11, "60", logo.tokenTypes.NUMBER, logo.primitives.NONE),
          new Token(14, "end", logo.tokenTypes.PRIMITIVE, logo.primitives.PRIMITIVE_END)
      ],
      tokenizer.tokenize("to line fd 60 end")
  );
  assertTokens(
      'PROCEDURE with no parameters in multiple lines and the PROCEDURE is not called',
      [
          new Token(0, "to", logo.tokenTypes.PRIMITIVE, logo.primitives.PRIMITIVE_TO),
          new Token(3, "line", logo.tokenTypes.PROCEDURE_NAME, logo.primitives.NONE),
          new Token(7, LF, logo.tokenTypes.DELIMITER, logo.primitives.NONE),
          new Token(8, "fd", logo.tokenTypes.PRIMITIVE, logo.primitives.FORWARD),
          new Token(11, "60", logo.tokenTypes.NUMBER, logo.primitives.NONE),
          new Token(13, LF, logo.tokenTypes.DELIMITER, logo.primitives.NONE),
          new Token(14, "end", logo.tokenTypes.PRIMITIVE, logo.primitives.PRIMITIVE_END)
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
          new Token(0, "to", logo.tokenTypes.PRIMITIVE, logo.primitives.PRIMITIVE_TO),
          new Token(3, "line", logo.tokenTypes.PROCEDURE_NAME, logo.primitives.NONE),
          new Token(8, "fd", logo.tokenTypes.PRIMITIVE, logo.primitives.FORWARD),
          new Token(11, "60", logo.tokenTypes.NUMBER, logo.primitives.NONE),
          new Token(14, "end", logo.tokenTypes.PRIMITIVE, logo.primitives.PRIMITIVE_END),
          new Token(18, "line", logo.tokenTypes.PROCEDURE_NAME, logo.primitives.NONE),
      ],
      tokenizer.tokenize("to line fd 60 end line")
  );
  assertTokens(
      'PROCEDURE with no parameters in multiple lines and the PROCEDURE is called once',
      [
          new Token(0, "to", logo.tokenTypes.PRIMITIVE, logo.primitives.PRIMITIVE_TO),
          new Token(3, "line", logo.tokenTypes.PROCEDURE_NAME, logo.primitives.NONE),
          new Token(7, LF, logo.tokenTypes.DELIMITER, logo.primitives.NONE),
          new Token(8, "fd", logo.tokenTypes.PRIMITIVE, logo.primitives.FORWARD),
          new Token(11, "60", logo.tokenTypes.NUMBER, logo.primitives.NONE),
          new Token(13, LF, logo.tokenTypes.DELIMITER, logo.primitives.NONE),
          new Token(14, "end", logo.tokenTypes.PRIMITIVE, logo.primitives.PRIMITIVE_END),
          new Token(17, LF, logo.tokenTypes.DELIMITER, logo.primitives.NONE),
          new Token(18, "line", logo.tokenTypes.PROCEDURE_NAME, logo.primitives.NONE),
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
          new Token(0, "to", logo.tokenTypes.PRIMITIVE, logo.primitives.PRIMITIVE_TO),
          new Token(3, "line", logo.tokenTypes.PROCEDURE_NAME, logo.primitives.NONE),
          new Token(8, "fd", logo.tokenTypes.PRIMITIVE, logo.primitives.FORWARD),
          new Token(11, "60", logo.tokenTypes.NUMBER, logo.primitives.NONE),
          new Token(14, "end", logo.tokenTypes.PRIMITIVE, logo.primitives.PRIMITIVE_END),
          new Token(18, "line", logo.tokenTypes.PROCEDURE_NAME, logo.primitives.NONE),
          new Token(23, "rt", logo.tokenTypes.PRIMITIVE, logo.primitives.RIGHT),
          new Token(26, "90", logo.tokenTypes.NUMBER, logo.primitives.NONE),
          new Token(29, "line", logo.tokenTypes.PROCEDURE_NAME, logo.primitives.NONE)
      ],
      tokenizer.tokenize("to line fd 60 end line rt 90 line")
  );
  assertTokens(
      'PROCEDURE with no parameters in multiple lines and the PROCEDURE is called twice',
      [
          new Token(0, "to", logo.tokenTypes.PRIMITIVE, logo.primitives.PRIMITIVE_TO),
          new Token(3, "line", logo.tokenTypes.PROCEDURE_NAME, logo.primitives.NONE),
          new Token(7, LF, logo.tokenTypes.DELIMITER, logo.primitives.NONE),
          new Token(8, "fd", logo.tokenTypes.PRIMITIVE, logo.primitives.FORWARD),
          new Token(11, "60", logo.tokenTypes.NUMBER, logo.primitives.NONE),
          new Token(13, LF, logo.tokenTypes.DELIMITER, logo.primitives.NONE),
          new Token(14, "end", logo.tokenTypes.PRIMITIVE, logo.primitives.PRIMITIVE_END),
          new Token(17, LF, logo.tokenTypes.DELIMITER, logo.primitives.NONE),
          new Token(18, "line", logo.tokenTypes.PROCEDURE_NAME, logo.primitives.NONE),
          new Token(22, LF, logo.tokenTypes.DELIMITER, logo.primitives.NONE),
          new Token(23, "rt", logo.tokenTypes.PRIMITIVE, logo.primitives.RIGHT),
          new Token(26, "90", logo.tokenTypes.NUMBER, logo.primitives.NONE),
          new Token(28, LF, logo.tokenTypes.DELIMITER, logo.primitives.NONE),
          new Token(29, "line", logo.tokenTypes.PROCEDURE_NAME, logo.primitives.NONE)
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
          new Token(0, "to", logo.tokenTypes.PRIMITIVE, logo.primitives.PRIMITIVE_TO),
          new Token(3, "line", logo.tokenTypes.PROCEDURE_NAME, logo.primitives.NONE),
          new Token(8, ":length", logo.tokenTypes.VARIABLE, logo.primitives.NONE),
          new Token(16, "fd", logo.tokenTypes.PRIMITIVE, logo.primitives.FORWARD),
          new Token(19, ":length", logo.tokenTypes.VARIABLE, logo.primitives.NONE),
          new Token(27, "end", logo.tokenTypes.PRIMITIVE, logo.primitives.PRIMITIVE_END),
          new Token(31, "line", logo.tokenTypes.PROCEDURE_NAME, logo.primitives.NONE),
          new Token(36, "60", logo.tokenTypes.NUMBER, logo.primitives.NONE),
          new Token(39, "rt", logo.tokenTypes.PRIMITIVE, logo.primitives.RIGHT),
          new Token(42, "90", logo.tokenTypes.NUMBER, logo.primitives.NONE),
          new Token(45, "line", logo.tokenTypes.PROCEDURE_NAME, logo.primitives.NONE),
          new Token(50, "30", logo.tokenTypes.NUMBER, logo.primitives.NONE)
      ],
      tokenizer.tokenize("to line :length fd :length end line 60 rt 90 line 30")
  );
  assertTokens(
      'PROCEDURE with one parameter in multiple lines and the PROCEDURE is called twice',
      [
          new Token(0, "to", logo.tokenTypes.PRIMITIVE, logo.primitives.PRIMITIVE_TO),
          new Token(3, "line", logo.tokenTypes.PROCEDURE_NAME, logo.primitives.NONE),
          new Token(8, ":length", logo.tokenTypes.VARIABLE, logo.primitives.NONE),
          new Token(15, LF, logo.tokenTypes.DELIMITER, logo.primitives.NONE),
          new Token(16, "fd", logo.tokenTypes.PRIMITIVE, logo.primitives.FORWARD),
          new Token(19, ":length", logo.tokenTypes.VARIABLE, logo.primitives.NONE),
          new Token(26, LF, logo.tokenTypes.DELIMITER, logo.primitives.NONE),
          new Token(27, "end", logo.tokenTypes.PRIMITIVE, logo.primitives.PRIMITIVE_END),
          new Token(30, LF, logo.tokenTypes.DELIMITER, logo.primitives.NONE),
          new Token(31, "line", logo.tokenTypes.PROCEDURE_NAME, logo.primitives.NONE),
          new Token(36, "60", logo.tokenTypes.NUMBER, logo.primitives.NONE),
          new Token(38, LF, logo.tokenTypes.DELIMITER, logo.primitives.NONE),
          new Token(39, "rt", logo.tokenTypes.PRIMITIVE, logo.primitives.RIGHT),
          new Token(42, "90", logo.tokenTypes.NUMBER, logo.primitives.NONE),
          new Token(44, LF, logo.tokenTypes.DELIMITER, logo.primitives.NONE),
          new Token(45, "line", logo.tokenTypes.PROCEDURE_NAME, logo.primitives.NONE),
          new Token(50, "30", logo.tokenTypes.NUMBER, logo.primitives.NONE)
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
          new Token(0, "fd", logo.tokenTypes.PRIMITIVE, logo.primitives.FORWARD),
          new Token(3, "1", logo.tokenTypes.NUMBER, logo.primitives.NONE),
          new Token(5, "+", logo.tokenTypes.DELIMITER, logo.primitives.NONE),
          new Token(7, "60", logo.tokenTypes.NUMBER, logo.primitives.NONE)            
      ],
      tokenizer.tokenize("fd 1 + 60")
  );
  assertTokens(
      'Primitive with an expression "a - b" as parameter',
      [
          new Token(0, "fd", logo.tokenTypes.PRIMITIVE, logo.primitives.FORWARD),
          new Token(3, "60", logo.tokenTypes.NUMBER, logo.primitives.NONE),
          new Token(6, "-", logo.tokenTypes.DELIMITER, logo.primitives.NONE),
          new Token(8, "50", logo.tokenTypes.NUMBER, logo.primitives.NONE)            
      ],
      tokenizer.tokenize("fd 60 - 50")
  );
  assertTokens(
      'Primitive with an expression "a * b" as parameter',
      [
          new Token(0, "fd", logo.tokenTypes.PRIMITIVE, logo.primitives.FORWARD),
          new Token(3, "10", logo.tokenTypes.NUMBER, logo.primitives.NONE),
          new Token(6, "*", logo.tokenTypes.DELIMITER, logo.primitives.NONE),
          new Token(8, "5", logo.tokenTypes.NUMBER, logo.primitives.NONE)            
      ],
      tokenizer.tokenize("fd 10 * 5")
  );
  assertTokens(
      'Primitive with an expression "a / b" as parameter',
      [
          new Token(0, "fd", logo.tokenTypes.PRIMITIVE, logo.primitives.FORWARD),
          new Token(3, "100", logo.tokenTypes.NUMBER, logo.primitives.NONE),
          new Token(7, "/", logo.tokenTypes.DELIMITER, logo.primitives.NONE),
          new Token(9, "5", logo.tokenTypes.NUMBER, logo.primitives.NONE)            
      ],
      tokenizer.tokenize("fd 100 / 5")
  );
  assertTokens(
      'PROCEDURE with one parameter in multiple lines and the parameter is an expression "a + b"',
      [
          new Token(0, "to", logo.tokenTypes.PRIMITIVE, logo.primitives.PRIMITIVE_TO),
          new Token(3, "line", logo.tokenTypes.PROCEDURE_NAME, logo.primitives.NONE),
          new Token(8, ":length", logo.tokenTypes.VARIABLE, logo.primitives.NONE),
          new Token(15, LF, logo.tokenTypes.DELIMITER, logo.primitives.NONE),
          new Token(16, "fd", logo.tokenTypes.PRIMITIVE, logo.primitives.FORWARD),
          new Token(19, ":length", logo.tokenTypes.VARIABLE, logo.primitives.NONE),
          new Token(26, LF, logo.tokenTypes.DELIMITER, logo.primitives.NONE),
          new Token(27, "end", logo.tokenTypes.PRIMITIVE, logo.primitives.PRIMITIVE_END),
          new Token(30, LF, logo.tokenTypes.DELIMITER, logo.primitives.NONE),
          new Token(31, "line", logo.tokenTypes.PROCEDURE_NAME, logo.primitives.NONE),
          new Token(36, "10", logo.tokenTypes.NUMBER, logo.primitives.NONE),
          new Token(39, "+", logo.tokenTypes.DELIMITER, logo.primitives.NONE),
          new Token(41, "60", logo.tokenTypes.NUMBER, logo.primitives.NONE)
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
}