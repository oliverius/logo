---
layout: page
title: [7]
permalink: /part7/
---
# Adding a few more primitives and sorting out nested loops

## More primitives

Now that we can draw nicely, let's add a few more primitives to play with.

* The first one I want to add is the `clearscreen`. This simply clears the screen and puts the turtle in the middle facing up.
* The second one is `back`, which is the opposite of `forward`
* The third one is `left` which is the opposite of `right`

And that's it for now because we are going to be testing those primitives before we move any further. We will do them in one go so you can see how easy it is to extend what we have done so far.

Our primitives enum:

```javascript
const primitives = {
  NONE: 0,
  FORWARD: 1,
  RIGHT: 2,
  REPEAT: 3,
  CLEARSCREEN: 4,
  BACK: 5,
  LEFT: 6
};
```

Our extra primitive aliases:

```javascript
{
  primitive: primitives.CLEARSCREEN,
  aliases: ["clearscreen", "cs"]
},
{
  primitive: primitives.BACK,
  aliases: ["back", "bk"]
},
{
  primitive: primitives.LEFT,
  aliases: ["left", "lt"]
}
```

In the parser in the `parse()` method:
```javascript
case primitives.CLEARSCREEN:
  this.turtleGraphicsQueue.push({
    primitive: primitives.CLEARSCREEN
  });
  break;
case primitives.BACK:
  this.turtleGraphicsQueue.push({
    primitive: primitives.BACK,
    parameter: this.getParameter()
  });
  break;
case primitives.LEFT:
  this.turtleGraphicsQueue.push({
    primitive: primitives.LEFT,
    parameter: this.getParameter()
  });
```

In the parser in the `draw()` method:

```javascript
case primitives.CLEARSCREEN:
  this.turtle.execute_clearscreen();
  break;
case primitives.BACK:
  this.turtle.execute_back(item.parameter);
  break;
case primitives.LEFT:
  this.turtle.execute_left(item.parameter);
  break;
```

And since those "execute" methods don't exist in Turtle we need to create them, which is very simple because moving back is the opposite of moving forward and moving to the left is the opposite of moving to the right, so:

```javascript
execute_back(n = 0) {
  this.execute_forward(-n);
}
execute_left(deg = 0) {
  this.execute_right(-deg);
}
```

For `clearscreen` we need to create a method to delete the graphics, the same that we did with `deleteTurtle()`. All in all the two methods are:

```javascript
deleteGraphics() {
  this.drawingCtx.clearRect(0, 0, this.width, this.height);
}
execute_clearscreen() {
  this.deleteGraphics();
  this.deleteTurtle();

  this.updateTurtlePosition(this.centerX, this.centerY);
  this.incrementTurtleOrientation(-this.orientation);
  this.drawTurtle();

  this.renderFrame();
}
```

Since we don't need now the method `centerTurtle()` because this is better, we get rid of it. Also in the constructor we will execute `clearscreen` because that will draw the turtle from the beginning (before we start drawing) so we know where the turtle is. Let's be clear, I can keep the `centerTurtle()` method, however because we don't use it anywhere else but in the constructor and now we have something better, we use `execute_clearscreen()` (without the parameters, as we can see when pushing to the queue).

# Inception with nested loops

Playing around with jsLogo (TODO website) online I came up with a very simple drawing of a triangle with 3 squares, and we use all the primitives at once so we know if it works well or not.

`cs repeat 3 [ fd 60 repeat 4 [ lt 90 bk 20 ] rt 120 ]`

![Double loop screenshot done with jsLogo](/img/part7_jsLogo_doubleloop.png)


Let's see if we get the same ourselves: (we will use this script from now on in the html instead of the square):

```html
<textarea id="logo-editor">cs repeat 3 [ fd 60 repeat 4 [ lt 90 bk 20 ] rt 120 ]</textarea>
```
![Nested loop fail](/img/part7_nested_loop_fail.png)

And we didn't get it right. What seems to be the problem? It appears that we are doing only this:

```
cs fd 60 repeat 4 [ lt 90 bk 20 ] rt 120
```

the first loop is completely neglected. So how can we implement nested loops? we don't need to go very far because the answer is in the Tiny basic from Herbert Schildt (TODO link). In short, instead of having one loop variable like we do now we need to have a stack of loops so we keep track of where we were at any point, similar to how a call to a procedure or subroutine is done.

Our logic for loops is encapsulated in the parser in `execute_repeat_begin()` and `execute_repeat_end()`. In the `parse()` method instead of having a `loop` property, let's have a loop stack property.

```javascript
this.loopStack = [];
```

Let's go now to `execute_repeat_begin()`. This is quite simple, every time we encounter a `[` add it to the stack (before we did the same but just for one loop)

```javascript
execute_repeat_begin(n = 0) {
  console.log(`Starting: execute_repeat_begin ${n}`);
  this.getNextToken();
  if (this.currentToken.tokenType === tokenTypes.DELIMITER &&
    this.currentToken.text === delimiters.OPENING_BRACKET) {
    this.loopStack.push({
      startTokenIndex: this.currentTokenIndex,
      remainingLoops: n
    });
  }
}
```

And the `execute_repeat_end()` before was:

```javascript
execute_repeat_end() {
  console.log(`Starting: execute_repeat_end`);
  this.loop.remainingLoops--;
  console.log(`Remaining loops: ${this.loop.remainingLoops}`);
  if (this.loop.remainingLoops > 0) {
    this.currentTokenIndex = this.loop.startTokenIndex;
  } else {
    console.log("Loop has finished");
  }
}
```

And now we need to pop the latest value in the stack (as opposed to getting the first one that we had in the graphics queue).

```javascript
  execute_repeat_end() {
    console.log(`Starting: execute_repeat_end`);
    let currentLoop = this.loopStack.pop();
    currentLoop.remainingLoops--;
    console.log(`Remaining loops: ${currentLoop.remainingLoops}`);
    if (currentLoop.remainingLoops > 0) {
      this.currentTokenIndex = currentLoop.startTokenIndex;
      this.loopStack.push(currentLoop);
    } else {
      console.log("Loop has finished");
    }
  }
```

Here we show what's going on one token at a time. On the right it is the values hold in the stack.

![Double loop token animation with stack](/img/part7_double_loop_with_stack.gif)

and this is how it looks like executed:

![Double loop](/img/part7_doubleloop.gif)

## A few more primitives, and we are done for now

We are almost done with the graphical primitives, and because it is so simple we are going to add two more that are very simple to implement `penup` and `pendown`. We need to remember that LOGO started with a mechanical turtle, so if the pen was up when drawing it wouldn't draw anything (as it wasn't touching the paper/floor) and if it was down it was drawing. Since the only place where we really draw are in the `execute_forward()` method, that's where the logic will be.

All in all, this is what we do:

Two more primitives:

```javascript
const primitives = {
  NONE: 0,
  FORWARD: 1,
  RIGHT: 2,
  REPEAT: 3,
  CLEARSCREEN: 4,
  BACK: 5,
  LEFT: 6,
  PENUP: 7,
  PENDOWN: 8
};
```

Two primitive aliases:

```javascript
{
  primitive: primitives.PENUP,
  aliases: ["penup", "pu"]
},
{
  primitive: primitives.PENDOWN,
  aliases: ["pendown", "pd"]
}
```

The parsing loop `parse()` will add the right entries to the queue for drawing:

```javascript
case primitives.PENDOWN:
  this.turtleGraphicsQueue.push({
    primitive: primitives.PENDOWN
  });
  break;
case primitives.PENUP:
  this.turtleGraphicsQueue.push({
    primitive: primitives.PENUP
  });
  break;
```

and this will be dealt with in the queue by the `draw()` method that will direct to some action by the turtle to do:

```javascript
case primitives.PENUP:
  this.turtle.execute_penup();
  break;
case primitives.PENDOWN:
  this.turtle.execute_pendown();
  break;
```

and in the turtle:

```javascript
execute_pendown() {
  console.log("[Turtle] - execute_pendown");
  this.isPenDown = true;
}
execute_penup() {
  console.log("[Turtle] - execute_penup");
  this.isPenDown = false;
}
```

because we want to focus in `pendown` when we go to `execute_forward()` we check for pen down and... we draw with the `stroke` method:

```javascript
if (this.isPenDown) {
  this.drawingCtx.stroke();
}
```

and finally because the starting point of a turtle is with the pen down, in the turtle constructor after `execute_clearscreen()`

```javascript
this.execute_pendown();
```

Now we test with our tried and tested example with a triangle and the 3 squares but this time we don't draw the triangle.

So instead of

`cs repeat 3 [ fd 60 repeat 4 [ lt 90 bk 20 ] rt 120 ]`

we do

`cs repeat 3 [ pu fd 60 pd repeat 4 [ lt 90 bk 20 ] rt 120 ]`

![Double loop with penup and pendown](/img/part7_double_loop_penup_pendown.gif)