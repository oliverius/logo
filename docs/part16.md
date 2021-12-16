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

English     |    | Spanish       |  
----------- | -  | ------------- | -
    forward | fd | avanza        | av
       back | bk | retrocede     | re
       left | lt | giraizquierda | gi
      right | rt | giraderecha   | gd
      penup | pu | subelapiz     | sl
    pendown | pd | bajalapiz     | bl
     repeat |    | repite        |
clearscreen | cs | borrapantalla | bp
         to |    | para          |
        end |    | fin           |
         if |    | si            |
       stop |    | alto          |

and after implementing these values, we are able to work in Spanish as well!

![square now in Spanish](/img/part16_square_in_spanish.gif)

There is an unintended side effect with the way we do the aliases and it is that we can mix and match English and Spanish, for example instead of:

`repeat 4 [forward 60 right 90]`

or

`repite 4 [avanza 60 giraderecha 90]`

we can have something like

`repeat 4 [forward 60 giraderecha 90]`

but that's something that can be easily done if we feed the aliases one language at a time.

Happy coding!