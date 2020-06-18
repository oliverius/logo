---
layout: page
title: Part 1
permalink: /part1/
---
# Project file structure
If you know the typical folder structure of a project, you can skip this part and move to part 2.

```




```

Ok, are you still with me? good!

Let's start with a blank html file that we call `index.html` in the `src` folder; `src` stands for `source` as in *source code* for the project. This is the default convention in most projects in github and has been pretty common since the days of [Unix](https://en.wikipedia.org/wiki/Unix).

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Logo</title>
  </head>
  <body>
    Hello
  </body>
</html>
```

This will just print `Hello` in the browser.
Let's add some javascript to the `<body>` element:

```html
<body>
  Hello
  <script>
    console.log("and goodbye");
  </script>
</body>
```

And this will show "Hello" in the browser and "and goodbye" in the console.
Some people may wonder why we don't add the script in the `<head>` element. This is because the `html` file is read top-bottom and if we need to reference the [DOM](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction) and the DOM is not ready, our code won't work as expected.
For example, let's say we run some code at startup that gets the value of a `textarea` and spits the value to the console.
We would expect this to work:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Logo</title>
    <script>
      var textarea = document.getElementById('myTextarea');
      console.log(textarea.value);
    </script>
  </head>
  <body>
    Hello
    <textarea id="myTextarea">Inside</textarea>
    <script>
      console.log("and goodbye");
    </script>
  </body>
</html>
```

But in the console we get `null` instead of the value. This is because by the time we run the first script the DOM hasn't initialized yet `myTextarea`.
There is an easy way to fix this and it is to run the script after the DOM has been loaded, so the script will be:

```html
<script>
  window.onload = () => {
    var textarea = document.getElementById('myTextarea');
    console.log(textarea.value);
  }
</script>
```

And we will get the value `Inside` in the console as expected.
This is similar to what you can see in a lot of [jQuery](https://api.jquery.com/ready/#ready-handler) code, which in our case would be:

```javascript
$(function() {
  var textarea = document.getElementById('myTextarea');
  console.log(textarea.value);
});
```

But since we don't use jQuery we don't need it that way. Also, we just want the code to run from an external javascript file in the future and we don't want to be worried that we waited for the event `window.onload` or not, so the easiest way since the code is read top to bottom is to add to the bottom of the `body` element the code:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Logo</title>    
  </head>
  <body>
    Hello
    <textarea id="myTextarea">Inside</textarea>
    <script>
      var textarea = document.getElementById('myTextarea');
      console.log(textarea.value);
      console.log("and goodbye");
    </script>
  </body>
</html>
```

And we are back in business 👍

We will move that code to a proper javascript file in the `src\js` folder and we replace the script block with:

```html
<script type="text/javascript" src="js/logo.js"></script>
```

And we should see the same result.
And now we create the `css`. We can also do the `css` inline but we expect that to grow as well, so we will create a file in the `src\css` folder with this content:

```css
body {
  background-color: pink;
}
```

And in the html in the `head` element: 

```html
<link rel="stylesheet" type="text/css" href="css/logo.css" media="screen" />
```

So next time we run it we should see something like this:

![Browser screenshot](/img/part1_screenshot.png)

In the next part we will start creating a simple tokenizer to recognize two primitives