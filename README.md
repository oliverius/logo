# Logo

This project creates a LOGO interpreter in vanilla javascript, just download the master branch, go to `src` and run `index.html`.

It is based on the chapter about language interpreters in Herbert Schildt's "C Power user's guide" from 1988. In this chapter he develops a BASIC interpreter in C that he calls "Small BASIC". This interpreter is a recursive descent parser.

This LOGO interpreter only has a subset of instructions mostly to deal with the turtle graphics. I created a tutorial on how I developed it from scratch in:

[https://oliverius.github.io/logo](https://oliverius.github.io/logo)

The parts that are covered are:

* [Introduction](/logo/index): about the project and the scope. We are aiming to run 4 specific examples: a loop, a procedure, a spiral and a tree
* [Part 1](/logo/part1): project file structure
* [Part 2](/logo/part2): poor man's tokenizer
* [Part 3](/logo/part3): parser, tokens and single loops
* [Part 4](/logo/part4): refactoring, internal representation of a token
* [Part 5](/logo/part5): graphics! understanding coordinates when moving the turtle
* [Part 6](/logo/part6): finally the turtle. Virtual canvases
* [Part 7](/logo/part7): more graphical primitives. Nested loops
* [Part 8](/logo/part8): a proper tokenizer
* [Part 9](/logo/part9): write your own procedures in LOGO
* [Part 10](/logo/part10): how to stop a recursive procedure. Refactoring the graphics queue
* [Part 11](/logo/part11): a expression parser a.k.a. calculator
* [Part 12](/logo/part12): tokenizer and parser unit tests
* [Part 13](/logo/part13): *work in progress*