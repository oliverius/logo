---
layout: page
title: [6]
permalink: /part6/
---
## Dude, where is my turtle?
In the [previous part](/logo/part5) we were able to draw a square using the `repeat` primitive after we sort out the coordinates of the turtle.
In this part we will draw the turtle, since until now we didn't have one, and we will also draw the turtle differently according to the orientation so it will look like it is moving.

The easiest way to draw a turtle is... to draw a circle, with the drawing point in the center of the circle.

So we create a method for that and we add `this.drawTurtle()` at the end of `execute_forward()`.

```javascript
drawTurtle() {
  this.ctx.beginPath();
  this.ctx.arc(this.x, this.y, 10, 0, this.toRadians(360));
  this.ctx.stroke();
}
```

That's it, we get something like this:

![Square with turtle as a circle in each corner](/img/part6_circle_turtle.png)

which looks even cute, isn't it? I have a major problem with this and it is that the drawing is so fast that I can't even see the turtle moving. As something that I wanted kids to appreciate, it is very important to me that the turtle moves at a lower pace so we can see how the drawing is executed, or when we change the turtle when rotating we won't be able to see anything. So... how do we do that?

I would want all the graphical primitives to be drawn with some delay, so I can see them being drawn. We will do something different at the end but in essence we will create a queue of graphical primitives and we will set an interval to process only one graphical primitive at a time. Similar to a CPU when processing instructions following the internal clock ticking.

All the changes will be in the parser, which is where the turtle object is at the moment and it is the one processing all the primitives.

Three new methods: `startClock()`, `endClock()` and the proper method where we do the graphics, `draw()`.

Also one variable: `turtleGraphicsQueue`.

In the parser:

```javascript
constructor(canvasObject) {
  this.turtle = new Turtle(canvasObject);
  this.turtleGraphicsQueue = [];
  this.startClock();
}
startClock() {
  this.clock = setInterval(this.draw, 500);
}
stopClock() {
  clearInterval(this.clock);
}
draw() {
  console.log("*");
}
```

When run, hopefully you will see a `*` with a number on its left growing in value. This is the console spitting out one `*` every 500ms (half a second) and because nothing happens when we call again the clock instead of creating a new line with another `*` Chrome is clever enough to just add a counter on the left.

Now we need to refactor the parsing. Before it was running the `forward` primitive or the `right` primitive, now those methods will push what they wanted to do to the queue and in a timely manner the queue will act upon them.

If we do

```javascript
switch (this.currentToken.primitive) {
  case primitives.FORWARD:
    this.turtleGraphicsQueue.push({
      primitive: primitives.FORWARD,
      parameter: this.getParameter()
    });
    break;
  case primitives.RIGHT:
    this.turtleGraphicsQueue.push({
      primitive: primitives.RIGHT,
      parameter: this.getParameter()
    });
    break;
  case primitives.REPEAT:
    this.execute_repeat_begin(this.getParameter());
    break;
}
```

and after the parsing loop we do a `console.log(this.turtleGraphicsQueue);` we will see effectively that we have 8 actions, 4 x forwards and 4 x rights:

```javascript
Array(8)
0: {primitive: 1, parameter: 60}
1: {primitive: 2, parameter: 90}
2: {primitive: 1, parameter: 60}
3: {primitive: 2, parameter: 90}
4: {primitive: 1, parameter: 60}
5: {primitive: 2, parameter: 90}
6: {primitive: 1, parameter: 60}
7: {primitive: 2, parameter: 90}
```
We just need to do something in the `draw()` method with those, which is quite simple:

```javascript
draw() {    
  if (this.turtleGraphicsQueue.length > 0) {
    let item = this.turtleGraphicsQueue.shift();
    switch (item.primitive) {
      case primitives.FORWARD:
        this.turtle.execute_forward(item.parameter);
        break;
      case primitives.RIGHT:
        this.turtle.execute_right(item.parameter);
        break;
    }
  }
}
```
We take the first element of the queue (after all, it is a queue, not a stack, so we start always with the first element) and we call the turtle object directly so we can get rid of the shell methods in parser `execute_forward()` and `execute_right()`. With this we have practically decoupled the turtle from the parser, so I am thinking of having the turtle object in the interpreter instead of the parser, only having the `turtleGraphicsQueue` in the parser.

So the moment of truth has come, we click run and bang! error!.

```
Uncaught TypeError: Cannot read property 'length' of undefined
```

## U can't touch this

I don't think I did anything wrong, the code is really simple and it can't read the property `this.turtleGraphicsQueue`, so we try in `draw()` to log the object `this.turtle` from parser and... `undefined`. With this I remember an old joke of a guy that goes to the doctor saying that he has pains everywhere, so he points to his chest with his finger and it hurts, he points to his leg and it hurts and so on, so the doctor said "your problem is that you have a broken finger". In our case, we can't read `this.turtleGraphicsQueue` or `this.turtle` so most likely I have a "broken" `this`.

There is a lot of fun in javascript because of `this` not being what you expect `this` to be. Since we are doing a callback the meaning of `this` is different. This is a good answer in [Stack overflow about it](https://stackoverflow.com/questions/20279484/how-to-access-the-correct-this-inside-a-callback)
The easiest way for us is to use the arrow functions, so instead of:

```javascript
this.clock = setInterval(this.draw, 500);
```

we do

```javascript
this.clock = setInterval(() => this.draw(), 500);
```

and presto! we have our square drawn slowly for us.

![Square animation](/img/part6_square_animated.gif)

We will try to put our turtle on a diet and see how it goes when drawing the square.

## A tale of two canvases

The easiest way to make the turtle show differently when rotating is to make it a triangle. I know, it doesn't look like a turtle (and it won't in this tutorial though), but the old LOGO programs all have the turtle as a triangle because of the graphics limitations of the time.

Since we have a method to draw the turtle, we just need to modify that. I must confess that it took me a while to get the size correctly for this turtle but I got it in the end.

```javascript
drawTurtle() {
  let vertexAngleInDeg = 40;
  let alpha = vertexAngleInDeg / 2;
  let angle = this.toRadians(270 + alpha);

  let r = 20;
  let halfbase = r * Math.sin(this.toRadians(alpha));
  let height = r * Math.cos(this.toRadians(alpha));

  let x1 = this.x;
  let y1 = this.y - height / 2;
  let x2 = x1 + r * Math.cos(angle);
  let y2 = y1 - r * Math.sin(angle);
  let x3 = x2 - 2 * halfbase;
  let y3 = y2;

  this.ctx.beginPath();
  this.ctx.moveTo(x1, y1);
  this.ctx.lineTo(x2, y2);
  this.ctx.lineTo(x3, y3);
  this.ctx.lineTo(x1, y1);
  this.ctx.stroke();    
}
```

This will draw a simple triangle around the point that draws. We will get a result like this:

![Turtle as triangles in the corners of the square](/img/part6_turtle_all_triangles.png)

And now with the rotation, how can we do it in an easy way?

Since our turtle so far is very simple, just a triangle, we can calculate how the triangle will look like for a specific rotation. This seems ok, but as soon as we change the triangle to something else we would need to do the same operation, and if the turtle by any chance is a bitmap we wouldn't be able to do anything like this.
Also, we want to have the background untouched when the turtle moves, kind of having the background in one layer and the turtle in the layer on top. Did I say layers?

We can achieve a good result if we have two different canvases, one on top of another in the UI, one canvas with the background and another one with the turtle; that way we can draw/erase the turtle as many times as we want when moving. However it complicates having to put the two canvases perfectly on top of one another with css and as soon as one is a little bit offset it doesn't look good. Finally if we try to copy the canvas as a picture in the browser we would be able to take only the top layer, not all of it because they are different canvases.

But that I don't want two canvases in the UI doesn't mean that I can't have two canvases, except that the second one is a virtual one, and I will draw that one on top of the background graphics. More than this, if we have two virtual canvases, one for the turtle and one for the graphics we can always draw them together every time we have a `forward` or a `right` primitive, only erasing the turtle in its own canvas without interfering with the graphics. If anybody has a better idea, please let me know, but I think for LOGO this is the most economical one.
Let's create the virtual canvases in the constructor so we can access them throughout the `Turtle` class:

```javascript
let virtualTurtleCanvas = document.createElement('canvas');
virtualTurtleCanvas.width = this.width;
virtualTurtleCanvas.height = this.height;
this.turtleCtx = virtualTurtleCanvas.getContext('2d');

let virtualDrawingCanvas = document.createElement('canvas');
virtualDrawingCanvas.width = this.width;
virtualDrawingCanvas.height = this.height;
this.drawingCtx = virtualDrawingCanvas.getContext('2d');
```

We don't need to make the canvas itself a property in the class because the 2d context has a property `canvas` itself and we can access it.

So now we need to use the right context, so when we draw the turtle in `drawTurtle()` we use `turtleCtx` and when we do `execute_forward()` we use `drawingCtx`.

```javascript
this.turtleCtx.beginPath();
this.turtleCtx.moveTo(x1, y1);
this.turtleCtx.lineTo(x2, y2);
this.turtleCtx.lineTo(x3, y3);
this.turtleCtx.lineTo(x1, y1);
this.turtleCtx.stroke();
```

```javascript
this.drawingCtx.lineWidth = 1;
this.drawingCtx.beginPath();
this.drawingCtx.moveTo(this.x, this.y);
this.drawingCtx.lineTo(x1, y1);
this.drawingCtx.stroke();
```

Since the only time we are drawing the turtle and the graphics is in `execute_forward()`, let's add a method called `renderFrame()` that adds the two virtual canvases to the `ctx` that is the real one in the DOM.

So in `execute_forward()` at the bottom:

```javascript
this.updateTurtlePosition(x1, y1);
this.drawTurtle();
this.renderFrame();
```

And the method `renderFrame()`:
```javascript
renderFrame() {
  this.ctx.clearRect(0, 0, this.width, this.height);
  this.ctx.drawImage(this.drawingCtx.canvas, 0, 0, this.width, this.height);
  this.ctx.drawImage(this.turtleCtx.canvas, 0, 0, this.width, this.height);
}
```
and if we run it now we get exactly the same as before, but with the massive difference that now we can play around with the turtle without disturbing the graphics.
The reason I called it `renderFrame()` instead of something like `draw()` is because what we are really doing is creating a frame of animation like we would do with [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame).

I was thinking hard if `requestAnimationFrame` is the way forward here, however since our frames per seconds is going to be small (at the moment we have a frame every 500ms which is 2 frames per second or fps) for simplicity and due to the nature of what we are doing (we are not doing any parallax backgrounds or complicated sprites), this is enough.

And now, before we start removing the turtle from each frame so we can move it to the next frame instead of having 4 copies simultaneously, let's check how we can rotate our turtle.

If we go back to `drawTurtle()`, since the only thing we have in this virtual canvas is the turtle it would be ideal if we can rotate the canvas and therefore rotate the turtle. Every time I tried I failed because my turtle was moving somewhere else when rotating and I didn't have a clue why.

So I will save you this misery. All had to do with the way rotations are done. The best article I found (and the one that helped me) is [Sara Soueidan's SVG transformations](https://www.sarasoueidan.com/blog/svg-transformations/). The trick for a good rotation is:
* • move to the point you want to rotate around (x,y)
* • rotate the angle
* • move back to (x,y), but since we have rotated it will be (-x,-y)

For good measure we do a `resetTransform()` before we do any rotation. And the result is the correct one:

![Drawing a square with turtle as a triangle rotating](/img/part6_square_with_triangle_turtle_rotating.gif)

## How to animate the turtle properly

The turtle keeps being drawn in every frame. The trick to get it to "move" is to delete it in every frame and draw it again in the new position. That's supereasy because we have the graphics and the turtle in different canvases now. We create a method `deleteTurtle()`

```javascript
deleteTurtle() {
  this.turtleCtx.clearRect(0, 0, this.width, this.height);
}
```
And add the `deleteTurtle()` at the end of `execute_forward()`:
```javascript
this.updateTurtlePosition(x1, y1);
this.deleteTurtle();
this.drawTurtle();
this.renderFrame();
```

Let's see how it goes:

![Square with triangle turtle finished in wrong position](/img/part6_square_turtle_facing_left.gif)

All sorted? not really, there is something missing, the turtle is facing left instead of facing up at the end of the execution. Our script starts with the turtle facing up (0 degrees) and after doing 4 times `rt 90` which is 360 degrees it should end up facing up again but it doesn't, so something is wrong.

The solution is that since we are doing deleteTurtle/drawTurtle/renderFrame in `execute_forward()` we will do the same in `execute_right()`. At the moment we only draw the turtle when doing `fd 60` and because after drawing the last side of the square which is from left to right, that's the ending position for the turtle.

A final comment about some refactoring, wee could also add the `deleteTurtle()` and `drawTurtle()` into `renderFrame()`, however I like to keep them apart because the code reads nicely like this, you know what's going on without having to dig into `renderFrame()`, but that's my personal preference.

And now, ladies and gentlemen, let me present you the final result, feel free to create different scripts and click `run` and all will be drawn properly (and also on top of the previous drawing)

![Square drawn with turtle animation correctly](/img/part6_square_correct.gif)

In the [next part](/logo/part7) since we have done all the groundwork already we will add more primitives to play with when drawing.
