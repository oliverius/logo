# logo


#TODO SVG turtle
#hello

para exagono
repite 6 [av 60 gd 60]
gd 15
exagono
fin

esto no funciona todavia:
para linea av 10 gd 20 linea fin
do poncolor

example of dialog modal: https://www.w3.org/TR/wai-aria-practices-1.1/examples/dialog-modal/dialog.html
show errors in the screen in the status bar
popup for help in english and spanish
popup for examples in english and spanish
ui.js file to swap language in the ui
background from cssgradient.io
interesting for grid layout: https://cssgrid-generator.netlify.app/


copied from https://nrich.maths.org/4858 REPEAT 12 [PU FD 60 PD REPEAT 4 [FD 45 RT 90]PU BK 60 LT 30] this will leave status penup

cs
to pentagon :side
repeat 5 [fd :side rt 72]
end
repeat 10 [pentagon 60 gd 36]


cs
to exagon :side
repeat 6 [fd :side rt 60]
end
lt 30
repeat 6 [pu fd 40 pd exagon 40 pu bk 40 pd gd 60]

this blocks the UI "to line fd 10 line end line"

this works now, a spiral:
para spiral :lado
av :lado gd 90
spiral :lado + 3
fin
spiral 10

this also works
para arbol :longitud
if :longitud < 15 [stop]
av :longitud
gi 45
arbol :longitud/2
gd 90
arbol :longitud/2
gi 45
re :longitud
fin
cs
re 100
arbol 160