---
layout: page
title: [16]
permalink: /part16/
---

## Hola amigos! parser now also in Spanish

We have already solved the 4 different examples that I wanted to be able to run in our LOGO interpreter. The only thing missing is to run a script in Spanish (because I learned LOGO in Spain) and this will be a lot simpler that you think because of our primitive aliases. Let's take a look for example of `forward`:

```javascript
{
  primitive: logo.tokenizer.primitives.FORWARD,
  aliases: ["forward", "fd"]
}
```

we can see that we have two aliases already, `forward` and `fd`. Therefore the easiest way to add Spanish (and thanks to the primitives in both languages don't have any clash where one primitive is the name of another primitive in the other language) we can do:

```javascript
{
  primitive: logo.tokenizer.primitives.FORWARD,
  aliases: ["forward", "fd", "avanza", "av"]
}
```

and that's it! instead of showing the code here I will show a table comparing the primitives in both languages:

English     |    | Spanish |  
----------- | -  | ------- | -
    forward | fd | avanza  | av
       back | bk |         | re
       left | lt |
      right | rt |
      penup | pu |
    pendown | pd |
     repeat |    |
clearscreen | cs |
         to |    |
        end |    |
         if |    |
       stop |    |