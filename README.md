# LOGO

This project creates a LOGO interpreter in vanilla javascript, just download the master branch, go to `src` and run `index.html`, no external dependencies needed.

![Demo preview](/readme_demo_preview.gif)

It is based on the chapter about language interpreters in Herbert Schildt's "C Power user's guide" from 1988. In this chapter he develops a BASIC interpreter in C that he calls "Small BASIC". This interpreter is a recursive descent parser.

This LOGO interpreter only has a subset of instructions mostly to deal with the turtle graphics. I created a tutorial on how I developed it from scratch in:

[https://oliverius.github.io/logo](https://oliverius.github.io/logo)

There is also a [Live demo](http://htmlpreview.github.io/?https://raw.githubusercontent.com/oliverius/logo/master/src/index.html)

The parts that are covered are:

* [Part 1](https://oliverius.github.io/logo/part1): project file structure
* [Part 2](https://oliverius.github.io/logo/part2): poor man's tokenizer
* [Part 3](https://oliverius.github.io/logo/part3): parser, tokens and single loops
* [Part 4](https://oliverius.github.io/logo/part4): refactoring, internal representation of a token
* [Part 5](https://oliverius.github.io/logo/part5): graphics! understanding coordinates when moving the turtle
* [Part 6](https://oliverius.github.io/logo/part6): finally the turtle. Virtual canvases
* [Part 7](https://oliverius.github.io/logo/part7): more graphical primitives. Nested loops
* [Part 8](https://oliverius.github.io/logo/part8): a proper tokenizer
* [Part 9](https://oliverius.github.io/logo/part9): write your own procedures in LOGO
* [Part 10](https://oliverius.github.io/logo/part10): how to stop a recursive procedure. Refactoring the graphics queue
* [Part 11](https://oliverius.github.io/logo/part11): a expression parser a.k.a. calculator
* [Part 12](https://oliverius.github.io/logo/part12): tokenizer and parser unit tests
* [Part 13](https://oliverius.github.io/logo/part13): parser events and more refactoring
* [Part 14](https://oliverius.github.io/logo/part14): control flow with "if" and "stop" for a recursive spiral
* [Part 15](https://oliverius.github.io/logo/part15): a recursive tree
* [Part 16](https://oliverius.github.io/logo/part16): parser now also in Spanish

There are more modifications in the code after this tutorial but I think the tutorial covers all the important concepts and more importantly we covered the scope of the project which is to run 4 specific examples and be able to run them in English or Spanish.