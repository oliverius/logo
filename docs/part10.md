---
layout: page
title: [10]
permalink: /part10/
---
## Going for a spiral and ending with a little rocket

In the previous (long) [part](/logo/part9) we learned how to create a procedure with parameters and how to use the parameters to move the turtle forward.

The next example we wanted to conquer in the scope we gave [at the beginning](/logo/index) is a spiral with straight lines where instead of doing a square each side of the square is slightly bigger than the previous one. With the current code we can do it manually, something like this:

```
fd 10 rt 90
fd 13 rt 90
fd 16 rt 90
fd 19 rt 90
fd 22 rt 90
fd 25 rt 90
fd 28 rt 90
fd 31 rt 90
fd 34 rt 90
fd 37 rt 90
fd 40 rt 90
```

and this is the result

![Spiral only with primitives](/img/part10_spiral_with_primitives.gif)

but what we really want to do is to have a spiral that calls itself recursively but with bigger and bigger increments, we want this:

```
to spiral :side
  fd :side rt 90
  spiral :side + 3
end
spiral 10
```

This example won't stop it, will continue drawing but we will deal with that problem later, for now we will worry on how to make recursion work, and once we have the recursion sorted out we will worry about having parameters that take instead of a value `:side`, they take an expression like `:side + 3`.

## Inception

Since we have two problems to sort out (recursion and dealing with expressions) we select a simple example to start with

```
to line
  fd 5
  line
end
line
```

In theory, this will do `fd 5` and it will call itself and do `fd 5` again, and again and again until we stop the program (we will have to stop it manually for now as we don't have any `STOP` button).

So we do it and... nothing on the screen and the log keeps growing but it freezes (and in fact the UI also becomes unresponsive). If we try to copy the log to the clipboard we don't get it all so the best bet is to save it as soon as possible after running the script. What we get seems all correct (note: showing only the parsing bit and a few procedure calls):

```javascript
Starting: parse
​ 	Current token: 0 - [object Token "to" - PRIMITIVE - {TO}]
​ Starting: execute_to
​ 	Current token: 1 - [object Token "line" - PROCEDURE_NAME - {NONE}]
​ 	Current token: 2 - [object Token "fd" - PRIMITIVE - {FORWARD}]
​ 	Current token: 3 - [object Token "5" - NUMBER - {NONE}]
​ 	Current token: 4 - [object Token "line" - PROCEDURE_NAME - {NONE}]
​ 	Current token: 5 - [object Token "end" - PRIMITIVE - {END}]
​ {"name":"line","parameters":[],"firstTokenInsideProcedureIndex":2}
​ 	Current token: 6 - [object Token "line" - PROCEDURE_NAME - {NONE}]
​ Found procedure line
​ {"name":"line","parameters":[],"procedureCallLastTokenIndex":6}
​ 	Current token: 2 - [object Token "fd" - PRIMITIVE - {FORWARD}]
​ 	Current token: 3 - [object Token "5" - NUMBER - {NONE}]
​ 	Current token: 4 - [object Token "line" - PROCEDURE_NAME - {NONE}]
​ Found procedure line
​ {"name":"line","parameters":[],"procedureCallLastTokenIndex":4}
​ 	Current token: 2 - [object Token "fd" - PRIMITIVE - {FORWARD}]
​ 	Current token: 3 - [object Token "5" - NUMBER - {NONE}]
​ 	Current token: 4 - [object Token "line" - PROCEDURE_NAME - {NONE}]
​ Found procedure line
​ {"name":"line","parameters":[],"procedureCallLastTokenIndex":4}
​ 	Current token: 2 - [object Token "fd" - PRIMITIVE - {FORWARD}]
​ 	Current token: 3 - [object Token "5" - NUMBER - {NONE}]
​ 	Current token: 4 - [object Token "line" - PROCEDURE_NAME - {NONE}]
```

It looks like all my tokens have been processed correctly and every time `line` is found we call it again repeating the tokens 2, 3, 4 which are the ones inside the procedure. But still, no graphics showing. What's wrong this time?

There is nothing wrong and it all has to do with the way javascript is designed. For those old enough to remember this is what was typically called "blocking the UI thread", so the UI is not updated when it should. Since javascript is single threaded by blocking the UI we block everything. We need to understand the javascript event loop and [this article](https://flaviocopes.com/javascript-event-loop/) has a good explanation of what's going on.

Basically, since we entered an infinite loop processing the tokens the browser never had the chance to start processing the graphics queue and show us the turtle moving. At this point we have a few options:

1. Try to refactor so we don't block the javascript thread.
2. Use [web workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) that have their own thread for either parsing or doing the graphics.

As a developer using web workers seems very exciting and full of possibilities... and headaches. I have a problem with web workers and it is the same I have with regex. Just because you can, doesn't mean you should. We need to remember that our project is a simple one and we won't require much interactivity apart from pressing some buttons and see the graphics, we don't need to run anything intensive in the background (think about image processing for example) so when possible we need to find an alternative.

So the issue here is that the array of tokens is never finished because we enter an infinite loop. What if we don't have a loop and instead we call the body of the do-while loop with a clock, similar to how we do the graphics queue? What's more, why would you have two clocks when you can draw directly with every clock tick without even having a queue? Let's not go ahead of ourselves and refactor the do-while loop first.

Ok, another refactoring due. Since e try to keep the code in the parsing loop mostly clean and only with calls to some methods, we will extract the code we put for jumping to a procedure in a method as well, therefore:

```javascript
jumpToProcedure(name = "") {
  let searchProcedureResults = this.procedures.filter(procedure => {
    return procedure.name === name;
  });
  if (searchProcedureResults.length === 1) {
    let procedure = searchProcedureResults[0];
    console.log(`Found procedure ${procedure.name}`);

    let values = [];
    procedure.parameters.forEach(parameter => {
      let value = {
        parameterName: parameter,
        parameterValue: this.getParameter()
      };
      values.push(value);
    });

    this.procedureCallInformation = {
      name: procedure.name,
      parameters: values,
      procedureCallLastTokenIndex: this.currentTokenIndex
    };
    this.currentTokenIndex = procedure.firstTokenInsideProcedureIndex - 1;
    console.log(JSON.stringify(this.procedureCallInformation));
  }
}
```

and in the parsing loop:

```javascript
else if (this.currentToken.tokenType === tokenTypes.PROCEDURE_NAME) {
  this.jumpToProcedure(this.currentToken.text);
}
```

we test with our trusty square with a procedure and all should work.

Next, we get everything inside the do-while in `parse()` into a new method that I call `parsingStep()` since that's what we do in every iteration of the loop. Maybe `parsingIteration()`? nah, I prefer `parsingStep()`, also because I will put it later inside a clock and "step" suits more than "iteration" with a timer tick.

Our do-while loop inside `parse()` will look like:

```javascript
do {
  this.parsingStep();
} while (this.currentTokenIndex < this.lastTokenIndex)
```

And of course check that it works (it will because all the variables have a class scope). Let's check what we have in the current clock:

```javascript
startClock() {
  this.clock = setInterval(() => this.draw(), 500);
}
```

For now, we will keep what's inside `draw()` because it doesn't bother us (a big refactoring is coming soon anyway) and just focus in what to do. So we have a `parsingStep()` and we want to add it to `startClock()` as:

```javascript
startClock() {
  this.clock = setInterval(() => {
    this.parsingStep();
    this.draw();
  }, 500);
}
```

But I still need to stop parsing when the condition in the do-while is met, so I move it here, only keeping the `parsingStep()` inside. That way if the queue is filled up quickly we can continue drawing until the queue is empty (remember, we need to refactor this so don't worry for now).

We will get rid of the do-while completely from `parse()` and just keep the initialization of variables as we had before. So if we run our code, it works! we can see that the log gets now mixed the tokens logging with the [Turtle] logging and that's correct as we are doing them almost at the same time. So far so good.

One last thing, since I don't like having timers running if I don't need to. I would like the timer only to run when I am parsing and stop when I finish parsing (and by the way, I never implemented `stopClock()`, I forgot about it). Now it is a good time to do it.

So we remove the `startClock()` from the constructor and we add it to `parse()`

```javascript
parse(tokens) {
  console.log(`Starting: parse`);
  this.tokens = tokens;
  this.currentToken = {};
  this.currentTokenIndex = -1;
  this.lastTokenIndex = tokens.length - 1;
  this.loopStack = [];
  this.procedures = [];
  this.startClock();
}
```

Incidentally this makes for code that it is easier to read. Basically in `parse()` we receive the tokens, initialize the parser and start the clock which in turn will start processing tokens every half a second in each parsing step, filling up the drawing queue and therefore drawing at the same time we are still parsing.

In the clock once we don't have any more tokens to process we should stop the clock (itself) so we don't have any timers running. This is done with this code:

```javascript
startClock() {
  this.clock = setInterval(() => {
    if (this.currentTokenIndex < this.lastTokenIndex) {
      this.parsingStep();
    } else {
      this.stopClock();
    }
    this.draw();
  }, 500);
}
```

and the clock will stop two ticks after we finish drawing. How do I know? I can see in the console two `*` which is what we show in the console for every tick of the clock.

Will this code work for what we needed it to work, i.e. to avoid an infinite loop without any drawings on the screen? I hope so, let's try the same script as before:

```
to line
  fd 5
  line
end
line
```

And... there it goes, like a little rocket going to the sky (very slowly though)

![Recursive line going up](/img/part10_recursive_line.gif)

## Refactoring or new functionality. Refactoring

The next step is clear, let's try to create the spiral. However I feel that it is more important to deal with the a few things that are annoying me:

1. I can't stop the parsing whenever I want to and I don't like infinite processes
2. The script window is really small and it bothers me copy and paste to run new scripts
3. Now that I have the chance I want to get rid of the turtle queue.

So I think we need to hold our breath and "do what we have to do first" so we can focus completely in the expression parser in the next part which will be quite interesting because it is the basis for writing our own calculator!

### Can't stop a recursive script

Since now we have the logic for parsing inside the clock, if we stop the clock we stop the parsing, that's simple. Well, more accurately is "if we don't have more tokens **OR** we stop the clock, we stop parsing".

To this effect we will have another property in the parser `stopParsingRequested` which will have an initial value (set up in `parse()` of `false` since we dont' want this condition to stop parsing as soon as we click `run`. So once we define it in `parse()`, in the `parsingStep()`:

```javascript
startClock() {
  this.clock = setInterval(() => {
    if (this.currentTokenIndex < this.lastTokenIndex && !this.stopParsingRequested) {
      this.parsingStep();
    } else {
      this.stopClock();
    }
    this.draw();
  }, 500);
}
```

but... how do we request to stop? for that we will add another button to the UI to keep company to the lonely `run` button that we had from the beginning. So in the html:

```html
<button onclick="interpreter.stop()">stop</button>
```

which has a corresponding method in the interpreter:

```javascript
stop() {
  this.parser.stopParsingRequested = true;
}
```

and that will work perfectly for any script because it will stop parsing (the clock will stop ticking and as such no more parsing steps)

So issue number one is sorted

### Increase editor size

This is very simple, just check the id of the editor in html (logo-editor) and add some css to the css file:

```css
#logo-editor {
  width: 400px;
  height: 400px;
  resize: none;
  border: 2px solid black;
}
```

I've added the same border as we have in the graphics and keep the same size also as the graphics. The `resize` property stops us from having a grabbable area on the bottom rigth corner.

Finally, not needed, but I would like to change the background to some kind of shade of blue (my intention from the beginning), for now `cornflowerblue` would do.

```css
body {
  background-color: cornflowerblue;
}
```

The final result:

![Editor and graphics after some css changes](/img/part10_css_changes.png)

so issue number 2 also sorted.

### Refactoring the graphics queue

The final task I wanted to do before we move to getting the spiral working is to get rid of the graphics queue. I know I was proud before for decoupling the parsing loop from the turtle but I think it is important to get rid of the graphics queue because it simplifies the code. How can we reach a compromise and not adding the turtle back to the parsing loop? the easiest way is to pass the parameters that we were sending to the graphics queue directly to the `draw()` method, so instead of

```javascript
draw() {}
```

we have

```javascript
draw(primitive = primitives.NONE, paramater = 0) {}
```

Let's start with the parsing step, how the `switch` for primitives looks like now:

```javascript
switch (this.currentToken.primitive) {
  case primitives.FORWARD:
    this.draw(primitives.FORWARD, this.getParameter());
    break;
  case primitives.RIGHT:
    this.draw(primitives.RIGHT, this.getParameter());
    break;
  case primitives.REPEAT:
    this.execute_repeat_begin(this.getParameter());
    break;
  case primitives.CLEARSCREEN:
    this.draw(primitives.CLEARSCREEN);
    break;
  case primitives.BACK:
    this.draw(primitives.BACK, this.getParameter());
    break;
  case primitives.LEFT:
    this.draw(primitives.LEFT, this.getParameter());
    break;
  case primitives.PENDOWN:
    this.draw(primitives.PENDOWN);
    break;
  case primitives.PENUP:
    this.draw(primitives.PENUP);
    break;
  case primitives.TO:
      this.execute_to();
      break;
  case primitives.END:
      this.execute_end();
      break;
}
```

which is even shorter than before and we clearly show what we are doing in the code, which is even better.

The full `draw()` method, which is also a bit shorter this time because we remove the queue code:

```javascript
draw(primitive = primitives.NONE, parameter = 0) {   
  console.log("*");
  switch (primitive) {
    case primitives.FORWARD:
      this.turtle.execute_forward(parameter);
      break;
    case primitives.RIGHT:
      this.turtle.execute_right(parameter);
      break;
    case primitives.CLEARSCREEN:
      this.turtle.execute_clearscreen();
      break;
    case primitives.BACK:
      this.turtle.execute_back(parameter);
      break;
    case primitives.LEFT:
      this.turtle.execute_left(parameter);
      break;
    case primitives.PENUP:
      this.turtle.execute_penup();
      break;
    case primitives.PENDOWN:
      this.turtle.execute_pendown();
      break;
  }
}
```

finally we get rid of the like `this.draw();` inside `startClock()` because the logic is now in the parsing step. Our square will look like:

![Square after refactoring and removing graphics queue](/img/part10_square_no_graphics_queue.gif)

Note that there is a delay at the beginning that we didn't have before with the graphics queue. This is because the parser is processing the tokens from the procedure, and those tokens don't draw anything, hence the delay.

Finally (yes, I know I said it before but this is the final comment in this part) we will see how we can stop our "rocket" from getting too high when pressing `stop`:

![Line with infinite loop stopped by button Stop](/img/part10_recursive_line_stop_button.gif)

In the [next part](/logo/part11) we will deal with an expression parser a.k.a. calculator, which is needed when dealing with arguments that require some math, like adding two values together when calling a procedure.