---
layout: page
title: [13]
permalink: /part13/
---
## Goodbye to the turtle in the parser

In the [previous part](/logo/part12) we created some tests and incorporated them in the interpreter because we weren't using any testing framework so the easiest way was to add the test to the instance of the interpreter. We commented how we had to hack the parser to avoid the canvas for the turtle not being defined and erroring. We will try to find a way to get the turtle out and incidentally be able to test the parser in action, not only the expressions.

We want to decouple the turtle and the parser, so when we do parser tests we don't need to hack the parser as we did before to run it.

The turtle in parser was already refactored before and all the calls are in the `draw()` method. The `draw()` is then called by any corresponding primitive in the `parsingStep()`. The way we are going to do is, for me, the simplest one in a case like this. We are going to ask the parser to emit events and the interpreter will read the events and call the turtle to do the drawing. We could add the event listener in the turtle itself but I want to keep my turtle as dumb as possible only concern with drawing graphics. The interpreter is the one that should know about the tokenizer, the parser and now the turtle. Let's start with renaming the calls to `draw()` inside `parsingStep()` as `raiseTurtleDrawingEvent()` because we are raising an event and it has to do with drawing with the turtle (if you think I came up with this obvious name at first you are wrong, this is probably the third different name for the event because at the beginning I didn't really know if I wanted the event to be a `parsingEvent()` for everything or just for the turtle to draw). Now I know, so I will save you the time. so the `switch` in `parsingStep()` becomes:

```javascript
switch (this.currentToken.primitive) {
  case primitives.FORWARD:
    this.raiseTurtleDrawingEvent(primitives.FORWARD, this.getExpression());
    break;
  case primitives.RIGHT:
    this.raiseTurtleDrawingEvent(primitives.RIGHT, this.getExpression());
    break;
  case primitives.REPEAT:
    this.execute_repeat_begin(this.getExpression());
    break;
  case primitives.CLEARSCREEN:
    this.raiseTurtleDrawingEvent(primitives.CLEARSCREEN);
    break;
  case primitives.BACK:
    this.raiseTurtleDrawingEvent(primitives.BACK, this.getExpression());
    break;
  case primitives.LEFT:
    this.raiseTurtleDrawingEvent(primitives.LEFT, this.getExpression());
    break;
  case primitives.PENDOWN:
    this.raiseTurtleDrawingEvent(primitives.PENDOWN);
    break;
  case primitives.PENUP:
    this.raiseTurtleDrawingEvent(primitives.PENUP);
    break;
  case primitives.TO:
    this.execute_to();
    break;
  case primitives.END:
    this.execute_end();
    break;
}
```

Before we delete `draw()`, our `raiseTurtleDrawingEvent` will be very simple:

```javascript
raiseTurtleDrawingEvent(primitive = primitives.NONE, arg = 0) {
  let event = new CustomEvent("PARSER_TURTLE_DRAWING_EVENT", {
    bubbles: false,
    detail: {
      primitive: primitive,
      arg: arg
    }
  });
  window.dispatchEvent(event);
}
```

We needed to have the name of our [custom event](https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events) and since this is for me a constant I tend to honour the tradition and put everything in capital letters. Because we don't have this event attached to any element in the screen (well, technically it could be attached to the canvas where the turtle draws but we don't want to have a dependency between the parser and an element in the DOM (the canvas), we want the parser to be as "free spirit" as possible.

And now, we get rid of the turtle in the parser constructor. And more, since this is the only thing in the parser constructor we can get rid of the constructor altogether!! In the interpreter instead of

```javascript
this.parser = new Parser(this.canvas);
```

we will have

```javascript
this.turtle = new Turtle(this.canvas);
this.parser = new Parser();
```

We move the method `draw()` from parser to the interpreter, but we are still not calling it, we need to add an event listener in the interpreter. We will do it also at the end of the interpreter constructor. Since we don't want to lose the context for `this` I will use the fat arrows.

```javascript
window.addEventListener("PARSER_TURTLE_DRAWING_EVENT", e => this.draw(e.detail.primitive, e.detail.arg));
```

where it is really clear what the event listener is doing. If we run it, because we are still having the spiral example we will be able to see the spiral again.

One thing that is really bugging me is that I don't want to have [magic strings](https://help.semmle.com/wiki/display/JAVA/Magic+strings%3A+use+defined+constant) in the code and suddenly `PARSER_TURTLE_DRAWING_EVENT` appears twice, once in the parser and again in the interpreter.

I can create a `const` for this, but since I have more constants already (delimiter, primitives, primitive aliases and token types) I am wondering if it is not better to consolidate them all in one json (we won't do it here but that's part of the final version of the code). We will do here only `PARSER_TURTLE_DRAWING_EVENT`.

Because my program is called "Logo" that's how I will call the constant. I have a few classes, it makes sense that each of them will have a section in the "logo" object but since we are going to do only one for `PARSER_TURTLE_DRAWING_EVENT` and this is created in the parser, let's create the entry for parser in "logo":

```javascript
const logo = {
  parser: {
    turtleDrawingEvent: {
      name: "PARSER_TURTLE_DRAWING_EVENT"
    }
  }
};
```

which is very much explicit. I avoided creating an entry called "turtleDrawingEventName" because it feels more natural (at least to me!!!) to keep "name" as a property. Also this can help us if we define some other property for `turtleDrawingEvent` (we won't, but we will for other events so this will help us defining all the events the same way).

As such my code in the interpreter changes to

```javascript
window.addEventListener(logo.parser.turtleDrawingEvent.name, e => this.draw(e.detail.primitive, e.detail.arg));
```

and in the parser:

```javascript
let event = new CustomEvent(logo.parser.turtleDrawingEvent.name, {
  bubbles: false,
  detail: {
    primitive: primitive,
    arg: arg
  }
});
```

## Comments about testing

There is another benefit of using events with the parser, and that's that we can test what the parser is doing instead of relying in looking at the screen.

For example, for our typical square `repeat 4 [fd 60 rt 90]` the parser will emit 8 events:

`fd 60` `rt 90` `fd 60` `rt 90` `fd 60` `rt 90` `fd 60` `rt 90`

which is very easy to test and will be always the same events for that script. In the final version of the code I did those tests tweaking the method `parse()` in the parser to avoid using the clock since the use of the clock was mostly to avoid endless loops in the javascript thread blocking everything and since we are doing tests we won't be testing endless loops recursively anyway.

Note (just in case) that you won't really see values like `fd 60` but `1`, `60` because `1` is the value in the enum for the `forward` primitive.



