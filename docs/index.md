---
layout: home
title: LOGO
---
## About this project
This project creates a simple user interface for running [LOGO](https://en.wikipedia.org/wiki/Logo_(programming_language)) scripts (only the turtle graphics) with some examples built-in and the possibility to switch between English and Spanish.

In this documentation we will show how the code started, what problems we had and how we overcame them; it is something I rarely see in other projects where you see only the polished final product.
## Why vanilla javascript
Since my journey is mostly enterprise C# I wasn't very familiar with the javascript toolchain. I wanted to make a project that was easy to iterate (just refresh the browser and look at the console instead of fighting with different dependencies and [node.js](https://nodejs.org/)).

I tried though, but [ESLint](https://eslint.org/) was giving me a strange error and it couldn't make up its mind if it wanted to be global or not; I couldn't make [Mocha](https://mochajs.org/) test in the browser because I had some `require` commands and if I tried to run it in [node.js](https://nodejs.org/) it complained that it didn't know what `document` was, so at the end for simplicity I decided to do it in vanilla javascript and in the future see if I can improve it (I am not proud of having tests running in the console but here we go).

My thoughts can be better expressed with this comic strip, taken from [Toggl.com - Git the princess](https://toggl.com/programming-princess/) where you need to save the princess using 8 programming languages. This is the example for javascript:

![Toggl.com Git the princess javascript](/img/index_toggl.com-git-save-the-princess-javascript.jpg)
## Motivation for this project
When I was 11 years old I signed up for free computer classes once a week in my school since, as everybody kept saying in the 80's, "computers are the future".
The problem was that the school enthusiasm didn't match the resources and for a little while we had only the teacher's personal 8-bit computer with us.

So around 20 kids crammed together in one room to a [MSX](https://en.wikipedia.org/wiki/MSX) connected to the school TV and running a [SONY Logo cartridge](https://www.generation-msx.nl/software/idealogic/logo-msx/release/3178/). I was intrigued by why we had a triangle over a blue background and what does a turtle have to do with learning about computers. But then after some introduction and showing us how to draw a square, the teacher typed:
```
to square :side
repeat 4 [forward :side right 90]
end
> square is defined
```
and he said "and from now on the computer knows what a square is and we can use it again and again". For me it was a revelation: "the computer knows how to make a square because he told him so and it will remember".

Years later I found in a book fair the same book my teacher used and I kept it with me in case I decided to create my own Logo. And here we are :)
## References
This LOGO intepreter is based on the chapter about language interpreters in Herbert Schildt's "C Power user's guide" from 1988 which I got very cheap second hand. It creates an interpreter of BASIC that he calls "Small BASIC" and even though the book is for C this chapter is quite easy to follow.

This LOGO provides a subset of primitives (only graphical ones). If you are interested in a more complete LOGO in javascript please go to the excellent [jsLogo](https://github.com/inexorabletash/jslogo) project.

## Scope
From the beginning there were 4 examples that I wanted to be able to run in my project:
### A square using REPEAT
```
repeat 4 [fd 60 rt 90]
```
This will teach me how to do loops
### A square in a procedure
```
to square :side
  repeat 4 [fd :side rt 90]
end
square 60
```

With this we can create any procedure and reuse it.

### A spiral

```
to spiral :side
  fd :side rt 90
  spiral :side + 3
end
spiral 10
```

With this I can learn how to use expressions, since we call recursively the spiral with a different value every time.

### A tree

```
to  tree :length
  if :length < 15 [stop]
  fd :length
  lt 45
  tree :length/2
  rt 90
  tree :length/2
  lt 45
  re :length
end
cs
bk 100
tree 160
```
This will teach us control flow and how to stop a recursive procedure without causing a stack overflow. We will learn more about this later on.
## Posts
TODO post links



