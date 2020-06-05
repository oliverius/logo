---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

#layout: home
---
# Logo
## What this project does
This project creates a simple user interface for running [LOGO](https://en.wikipedia.org/wiki/Logo_(programming_language)) scripts (only the turtle graphics) with some examples built-in and the possibility to switch between English and Spanish.
In the documentation I will show how the code is the way it is, with all the pitfalls and issues that I had to overcome and all the refactoring I did. It is probably more iluminating to show how I failed than how I succeeded.
## Why vanilla javascript
Since my journey is mostly enterprise C# I wasn't very familiar with the javascript toolchain. I wanted to make a project that was easy to iterate (just refresh the browser and look at the console instead of fighting with different dependencies and node.js).

I tried though, but [ESLint](https://eslint.org/) was giving me a strange error and it couldn't make up its mind if it wanted to be global or not; I couldn't make [Mocha](https://mochajs.org/) test in the browser because I had some `require` commands and if I tried to run it in node it complained that it didn't know what `document` was, so at the end for simplicity I decided to do it in vanilla javascript and in the future see if I can improve it (I am not proud of having tests running in the console but here we go).
## Motivation for this project
When I was 11 years old I signed up for free computer classes once a week in my school since, as everybody kept saying in the 80's, "computers are the future".
The problem was that the school enthusiasm didn't match the resources and for a little while we had only the teacher's personal 8-bit computer with us.

So around 20 kids crammed together in one room to a [MSX](https://en.wikipedia.org/wiki/MSX) connected to the school TV and running a [SONY Logo cartridge](https://www.generation-msx.nl/software/idealogic/logo-msx/release/3178/). I was intrigued to why we had a turtle over a blue background and what does a turtle have to do with learning about computers. But then after some introduction and showing us how to draw a square, the teacher typed:
```Lisp
to square :side
repeat 4 [forward :side right 90]
end
> square is defined
```
and he said "and from now on the computer knows what a square is and we can use it again and again". And I was intrigued with the power in his hands "the computer knows how to make a square because he told him so and it will remember"

Years later I found in a book fair the same book my teacher used and I kept it with me in case I decided to create my own Logo. And here we are :)
## References
This LOGO intepreter is based on Herbert Schildt (book name here and pic) the chapter for Tiny Basic. This book can be found easily (and cheap) second hand.

This LOGO provides a subset of primitives (only graphical ones). If you are interested in a more complete LOGO in javascript please go to the excellent [jsLogo](https://github.com/inexorabletash/jslogo) project.
## Posts
Part 1: We are not psychopaths, we start with functions, not classes
Part 2: Poor man's tokenizer in action
