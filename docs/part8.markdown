---
layout: page
title: Part 8
permalink: /part8/
---
# A tokenizer to make your mama proud

On part 2 (TODO link) we created a very simple tokenizer that was only splitting the tokens by the space between then, so

`repeat 4 [ fd 60 rt 90 ]`

becomes

`repeat` `4` `[` `fd` `60` `rt` `90` `]`

This was helpful for us because we didn't have to get dirty with the tokenizer for cases where the tokens were, for example, next to each other like in this case where the brackets are "touching" the primitive `fd` and the parameter `90`:

`repeat 4 [fd 60 rt 90]`

for cases like that we can do a manual tokenizer where we check each character and as such we build the tokens one character at a time. This is the approach from Tiny Basic (TODO reference), the example that we've been following as a reference to build our LOGO interpreter.

Do we need to get rid of the previous tokenizer? yes, but not right away. We will "clone it" and build it slowly, kind of like in [Invasion of the body snatchers](https://en.wikipedia.org/wiki/Invasion_of_the_Body_Snatchers_(1978_film)) and when we are ready we do the "switcheroo".

The easiest way to know that the tokenizer is doing the correct thing is to test the tokenizer on its own, without the parser or the interpreter, just input a string and output an array of tokens. Since we are working only with vanilla javascript we won't use any frameworks for testing (after all, this is a very small project), and if at this point we go into the rabbit hole of testing frameworks it would take us twice as much to complete the interpreter.

## Testing the current tokenizer

So let's start commenting out the lines where we define the interpreter and run it, therefore:

```javascript
//const interpreter = new Interpreter('logo-editor', 'logo-graphics', primitiveAliases);
//interpreter.run();
```

we don't want anything in the console, not even the "beating heart" of the `interval` in the parser writing down  `*` every half a second (500ms).

We want to test the tokenizer, so let's call it and show the tokens for our square example:

```javascript
const tokenizer = new Tokenizer(primitiveAliases);
let tokens = tokenizer.tokenize("repeat 4 [ fd 60 rt 90 ]");
tokens.forEach(token => console.log(token.toString()));
```

and the result:

```javascript
[object Token "repeat" - PRIMITIVE - {REPEAT}]
[object Token "4" - NUMBER - {NONE}]
[object Token "[" - DELIMITER - {NONE}]
[object Token "fd" - PRIMITIVE - {FORWARD}]
[object Token "60" - NUMBER - {NONE}]
[object Token "rt" - PRIMITIVE - {RIGHT}]
[object Token "90" - NUMBER - {NONE}]
[object Token "]" - DELIMITER - {NONE}]
```

if this sounds familiar is because it is similar to what we did in part 2 (TODO link) when we were starting with the poor man's tokenizer. Let's start with this humble beginnings for our new Tokenizer which we will call... Tokenizer2. Disappointed? don't be, this is just some refactoring, we don't need a great deal of soul-searching here because we will do a "switcheroo" with the old tokenizer later on, so we keep things simple.

So let's start the new tokenizer just with the constructor and stubs for some of the methods:

```javascript
class Tokenizer2 {
  constructor(primitiveAliases) {
    this.aliases = this.populatePrimitiveAliasesDictionary(primitiveAliases);
  }
  populatePrimitiveAliasesDictionary(primitiveAliases = []) { 
    let dictionary = {};   
    primitiveAliases.forEach(item => {
      item.aliases.forEach(alias => {
        dictionary[alias] = item.primitive;
      });
    });
    return dictionary;
  }
  tokenize(script = "") {
    let tokens = [];
    return tokens;
  }
}
```

Nothing much going on here. We kept the `aliases` because we will use the same code in the new tokenizer (and also so the constructor from the old one and the new one have the same parameters so we can test easily replacing Tokenizer with Tokenizer2). The rest is up for grabs at the moment.

Let's start with trying to read back to the console all the characters of the script in `tokenize()`, that will show us that we can read the full stream of characters correctly. After that we will focus in the different token types we have: delimiters, numbers and primitives. From the beginning I know that I need to keep the current character and its index in the class scope, similar to what we did in the parser. In the parser we did:

```javascript
getNextToken() {
  this.currentTokenIndex++;
  if (this.currentTokenIndex <= this.lastTokenIndex) {
    this.currentToken = this.tokens[this.currentTokenIndex];
    console.log(`\tCurrent token: ${this.currentTokenIndex} - ${this.currentToken}`);
  }
}
parse(tokens) {
  console.log(`Starting: parse`);
  this.tokens = tokens;
  this.currentToken = {};
  this.currentTokenIndex = -1;
  this.lastTokenIndex = tokens.length - 1;
  this.loopStack = [];
  do {
    this.getNextToken();
    // More code
  } while (this.currentTokenIndex < this.lastTokenIndex)
}
```

And for the tokenizer we will do pretty much the same logic:

```javascript
getNextCharacter() {
  this.currentIndex++;
  if (this.currentIndex <= this.lastCharacterIndex) {
    this.currentCharacter = this.script[this.currentIndex];
    console.log(`\tCurrent character: ${this.currentIndex} - ${this.currentCharacter}`);
  }
}
tokenize(script = "") {
  this.script = script;
  let tokens = [];
  this.currentIndex = -1;
  this.currentCharacter = '';
  this.lastCharacterIndex = script.length - 1;
  do {
    this.getNextCharacter();
    // The code will go here
  } while (this.currentIndex < this.lastCharacterIndex)
  return tokens;
}
```

And this will output to the console what we expected:

```javascript
	Current character: 0 - r
	Current character: 1 - e
	Current character: 2 - p
	Current character: 3 - e
	Current character: 4 - a
	Current character: 5 - t
	Current character: 6 -  
	Current character: 7 - 4
	Current character: 8 -  
	Current character: 9 - [
	Current character: 10 -  
	Current character: 11 - f
	Current character: 12 - d
	Current character: 13 -  
	Current character: 14 - 6
	Current character: 15 - 0
	Current character: 16 -  
	Current character: 17 - r
	Current character: 18 - t
	Current character: 19 -  
	Current character: 20 - 9
	Current character: 21 - 0
	Current character: 22 -  
	Current character: 23 - ]
```

Let's concentrate in delimiters (in the previous tokenizer we did first numbers but I think it is easier to start with delimiters as all of them are only one character).

We will use the same `repeat` example we've been carrying over in all this article, because it contains two delimiters and examples of primitives and numbers as well.

Let's test the delimiter and we will ignore the rest

```javascript
isDelimiter(c) {
  return c === delimiters.OPENING_BRACKET || delimiters.CLOSING_BRACKET;
}
```

We call the parameter **c** for "character". All together, pushing some delimiter tokens to the array:

```javascript
tokenize(script = "") {
  this.script = script;
  let tokens = [];
  this.currentIndex = -1;
  this.currentCharacter = '';
  this.lastCharacterIndex = script.length - 1;
  do {
    this.getNextCharacter();
    if (this.isDelimiter(this.currentCharacter)) {
      tokens.push(new Token(this.currentCharacter, tokenTypes.DELIMITER, primitives.NONE));
    }
  } while (this.currentIndex < this.lastCharacterIndex)
  return tokens;
}
```

And in the console, apart from having all the characters one by one as before we get at the end:

```javascript
[object Token "[" - DELIMITER - {NONE}]
[object Token "]" - DELIMITER - {NONE}]
```

which is what we wanted. So we have one out of the way. We go now for numbers. For numbers we go for the assumption that we deal only with integers so we only need to deal with [0-9]. We may use regex but since we are talking about one character at a time it seems a bit over the top. Instead and since our pool of possible characters is only ten (from 0 to 9) I will use `indexOf()`. As such:

```javascript
isNumber(c) {
  return "0123456789".indexOf(c) !== -1;
}
```

which is quite simple to read and assert that we do only integers. And for the code in the loop in `tokenize()`:

```javascript
do {
  this.getNextCharacter();
  if (this.isDelimiter(this.currentCharacter)) {
    tokens.push(new Token(this.currentCharacter, tokenTypes.DELIMITER, primitives.NONE));
  } else if (this.isNumber(this.currentCharacter)) {
    tokens.push(new Token(this.currentCharacter, tokenTypes.NUMBER, primitives.NONE));
  }
} while (this.currentIndex < this.lastCharacterIndex)
```

and the result:

```javascript
[object Token "4" - NUMBER - {NONE}]
[object Token "[" - DELIMITER - {NONE}]
[object Token "6" - NUMBER - {NONE}]
[object Token "0" - NUMBER - {NONE}]
[object Token "9" - NUMBER - {NONE}]
[object Token "0" - NUMBER - {NONE}]
[object Token "]" - DELIMITER - {NONE}]
```

The good news is that it is able to find numbers and delimiters. The bad news is that it considers every individual number like `6` `0` instead of putting together `60`.

That's easy to fix:

```javascript
do {
  this.getNextCharacter();
  if (this.isDelimiter(this.currentCharacter)) {
    tokens.push(new Token(this.currentCharacter, tokenTypes.DELIMITER, primitives.NONE));
  } else if (this.isNumber(this.currentCharacter)) {
    let number = this.currentCharacter;
    this.getNextCharacter();
    while (this.isNumber(this.currentCharacter)) {
      number += this.currentCharacter;
      this.getNextCharacter();
    }
    tokens.push(new Token(number, tokenTypes.NUMBER, primitives.NONE));
  }
} while (this.currentIndex < this.lastCharacterIndex)
```

I hope the code is easy to understand. For numbers, we check if the current character is a number (duh). If it is, get another character and don't stop getting characters and gluing them at the end of the first one we found **UNTIL** the current character is not a number. This gives the correct tokens:

```javascript
[object Token "4" - NUMBER - {NONE}]
[object Token "[" - DELIMITER - {NONE}]
[object Token "60" - NUMBER - {NONE}]
[object Token "90" - NUMBER - {NONE}]
[object Token "]" - DELIMITER - {NONE}]
```

however the code is wrong but it won't show wrong in this example. Have you spotted what the issue is? Let's use a slightly different example, we won't have spaces around all the tokens but we will have the brackets in the way that we would normally write them, together some other tokens. So instead of

```
repeat 4 [ fd 60 rt 90 ]
```

we have

```
repeat 4 [fd 60 rt 90]
```

If we run the tokenizer with this example, we will see:

```javascript
[object Token "4" - NUMBER - {NONE}]
[object Token "[" - DELIMITER - {NONE}]
[object Token "60" - NUMBER - {NONE}]
[object Token "90" - NUMBER - {NONE}]
```

we are missing the closing bracket token!!! how come? Let's add some debugging to the loop:

```javascript
do {
  this.getNextCharacter();
  if (this.isDelimiter(this.currentCharacter)) {
    console.log(`Processing delimiter: ${this.currentCharacter}`);
    tokens.push(new Token(this.currentCharacter, tokenTypes.DELIMITER, primitives.NONE));
  } else if (this.isNumber(this.currentCharacter)) {
    console.log(`Processing number starting with: ${this.currentCharacter}`);
    let number = this.currentCharacter;
    this.getNextCharacter();
    while (this.isNumber(this.currentCharacter)) {
      number += this.currentCharacter;
      this.getNextCharacter();
    }
    console.log(`End processing number. Found ${number}`);
    tokens.push(new Token(number, tokenTypes.NUMBER, primitives.NONE));
  }
} while (this.currentIndex < this.lastCharacterIndex)
```

And the whole log (we are going to learn a lesson here) is:

```javascript
	Current character: 0 - r
	Current character: 1 - e
	Current character: 2 - p
	Current character: 3 - e
	Current character: 4 - a
	Current character: 5 - t
	Current character: 6 -  
	Current character: 7 - 4
Processing number starting with: 4
	Current character: 8 -  
End processing number. Found 4
	Current character: 9 - [
Processing delimiter: [
	Current character: 10 - f
	Current character: 11 - d
	Current character: 12 -  
	Current character: 13 - 6
Processing number starting with: 6
	Current character: 14 - 0
	Current character: 15 -  
End processing number. Found 60
	Current character: 16 - r
	Current character: 17 - t
	Current character: 18 -  
	Current character: 19 - 9
Processing number starting with: 9
	Current character: 20 - 0
	Current character: 21 - ]
End processing number. Found 90
[object Token "4" - NUMBER - {NONE}]
[object Token "[" - DELIMITER - {NONE}]
[object Token "60" - NUMBER - {NONE}]
[object Token "90" - NUMBER - {NONE}]
```

What's wrong? if you pay attention every time we find a number we read an extra character (the next one) because the only way to know if a character is a number or not is to read it!!! And this worked before because we had spaces (that we don't care) between all the tokens. But here the last 3 characters are `90]` so when reading `90` to be a number we also read (and ignore) the `]` and that's why we are missing the last token.

What can we do? There a few ways we can check this, one is to "peek" the next character but not moving the index and if it is a number we read it (and therefore moving the index). There is an easier way. If we can move forward reading the text stream we can also probably move backwards, so at the end of the checks for numbers we can put back the latest character into the stream and that one will be the first one to be read when we go to the top of the loop in the next loop step.

```javascript
putbackCharacter() {
  console.log(`\tPut back current character: ${this.currentIndex} - ${this.currentCharacter}`);
  this.currentIndex--;
  this.currentCharacter = this.script[this.currentIndex];
}
```

and inside the `if` for numbers:

```javascript
console.log(`Processing number starting with: ${this.currentCharacter}`);
let number = this.currentCharacter;
this.getNextCharacter();
while (this.isNumber(this.currentCharacter)) {
  number += this.currentCharacter;
  this.getNextCharacter();
}
this.putbackCharacter();
console.log(`End processing number. Found ${number}`);
tokens.push(new Token(number, tokenTypes.NUMBER, primitives.NONE));
```

And the logs will show clearly what's going on:

```javascript
	Current character: 0 - r
	Current character: 1 - e
	Current character: 2 - p
	Current character: 3 - e
	Current character: 4 - a
	Current character: 5 - t
	Current character: 6 -  
	Current character: 7 - 4
Processing number starting with: 4
	Current character: 8 -  
	Put back Current character: 8 -  
End processing number. Found 4
	Current character: 8 -  
	Current character: 9 - [
Processing delimiter: [
	Current character: 10 - f
	Current character: 11 - d
	Current character: 12 -  
	Current character: 13 - 6
Processing number starting with: 6
	Current character: 14 - 0
	Current character: 15 -  
	Put back Current character: 15 -  
End processing number. Found 60
	Current character: 15 -  
	Current character: 16 - r
	Current character: 17 - t
	Current character: 18 -  
	Current character: 19 - 9
Processing number starting with: 9
	Current character: 20 - 0
	Current character: 21 - ]
	Put back Current character: 21 - ]
End processing number. Found 90
	Current character: 21 - ]
Processing delimiter: ]
[object Token "4" - NUMBER - {NONE}]
[object Token "[" - DELIMITER - {NONE}]
[object Token "60" - NUMBER - {NONE}]
[object Token "90" - NUMBER - {NONE}]
[object Token "]" - DELIMITER - {NONE}]
```

We just need to read primitives. But what is a primitive to me but a word that I recognize as a primitive because it is in my `aliases` list?

We can do something really similar to find "words" as we did to find numbers. If for simplicity we stick to [a-z][A-Z] characters only:

```javascript
isLetter(c) {
  return "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".indexOf(c) !== -1;
}
```

which seems like a mouthful but it is actually really easy to understand what it does, just check that `c` is in that string or not. Now taking into account the problem we have with putting back the character when looking for numbers, let's copy the block for number and change some names:

```javascript
do {
  this.getNextCharacter();
  if (this.isDelimiter(this.currentCharacter)) {
    console.log(`Processing delimiter: ${this.currentCharacter}`);
    tokens.push(new Token(this.currentCharacter, tokenTypes.DELIMITER, primitives.NONE));
  } else if (this.isNumber(this.currentCharacter)) {
    console.log(`Processing number starting with: ${this.currentCharacter}`);
    let number = this.currentCharacter;
    this.getNextCharacter();
    while (this.isNumber(this.currentCharacter)) {
      number += this.currentCharacter;
      this.getNextCharacter();
    }
    this.putbackCharacter();
    console.log(`End processing number. Found ${number}`);
    tokens.push(new Token(number, tokenTypes.NUMBER, primitives.NONE));
  } else if (this.isLetter(this.currentCharacter)) {
    console.log(`Processing word starting with: ${this.currentCharacter}`);
    let word = this.currentCharacter;
    this.getNextCharacter();
    while (this.isLetter(this.currentCharacter)) {
      word += this.currentCharacter;
      this.getNextCharacter();
    }
    this.putbackCharacter();
    console.log(`End processing word. Found ${word}`);
    //tokens.push(new Token(number, tokenTypes.NUMBER, primitives.NONE));
  }
} while (this.currentIndex < this.lastCharacterIndex)
```

Please note that we have commented out the `tokens.push` because we only want to push when the word we find is a primitive. Let's see the log (I am just showing the lines we are interested, not the whole log):

```javascript
End processing word. Found repeat  
End processing number. Found 4
Processing delimiter: [  
End processing word. Found fd  
End processing number. Found 60 
End processing word. Found rt
End processing number. Found 90
Processing delimiter: ]
```

which looks correct to me. Now to find if something is a primitive or not we do as the original tokenizer but this time once we are sure we have a "word".

In the previous tokenizer we did

```javascript
getPrimitive(tokenText) {
  return this.aliases[tokenText.toLowerCase()] ?? primitives.NONE;
};
```

and inside the `tokenize()` method in the final `else`:

```javascript
let primitive = this.getPrimitive(tokenText);
if (primitive !== primitives.NONE) {
  tokens.push(new Token(tokenText, tokenTypes.PRIMITIVE, primitive));
} else {
  console.log(`${tokenText} is not a primitive!`);
}
```

so now we will use verbatim `getPrimitive()` and pretty much copy what we did in `tokenize()`

```javascript
else if (this.isLetter(this.currentCharacter)) {
  console.log(`Processing word starting with: ${this.currentCharacter}`);
  let word = this.currentCharacter;
  this.getNextCharacter();
  while (this.isLetter(this.currentCharacter)) {
    word += this.currentCharacter;
    this.getNextCharacter();
  }
  this.putbackCharacter();
  console.log(`End processing word. Found ${word}`);
  let primitive = this.getPrimitive(word);
  if (primitive !== primitives.NONE) {
    tokens.push(new Token(word, tokenTypes.PRIMITIVE, primitive));
  } else {
    console.log(`${word} is not a primitive!`);
  }
}
```

and we finally get the tokens we expected (with primitives!)

```javascript
[object Token "repeat" - PRIMITIVE - {REPEAT}]
[object Token "4" - NUMBER - {NONE}]
[object Token "[" - DELIMITER - {NONE}]
[object Token "fd" - PRIMITIVE - {FORWARD}]
[object Token "60" - NUMBER - {NONE}]
[object Token "rt" - PRIMITIVE - {RIGHT}]
[object Token "90" - NUMBER - {NONE}]
[object Token "]" - DELIMITER - {NONE}]
```

And we just need to get rid of our test with only the new tokenizer, do the "switcheroo" with the previous tokenizer and comment out the lines we commented before (for the interpreter). Done. You've got yourself a better tokenizer (even though it seems a lot of work for nothing it will pay off later on).