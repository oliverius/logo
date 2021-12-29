const i18n = {
    "English": {
        "primitiveAliases": [
            {
                "primitive": "BACK",
                "aliases": [ "back", "bk" ]
            },
            {
                "primitive": "CLEAN",
                "aliases": [ "clean" ]
            },
            {
                "primitive": "CLEARSCREEN",
                "aliases": [ "clearscreen", "cs" ]
            },
            {
                "primitive": "END",
                "aliases": [ "end" ]
            },
            {
                "primitive": "FORWARD",
                "aliases": [ "forward", "fd" ]
            },
            {
                "primitive": "HIDETURTLE",
                "aliases": [ "hideturtle", "ht" ]
            },
            {
                "primitive": "HOME",
                "aliases": [ "home" ]
            },
            {
                "primitive": "IF",
                "aliases": [ "if" ]
            },
            {
                "primitive": "LABEL",
                "aliases": [ "label" ]
            },
            {
                "primitive": "LEFT",
                "aliases": [ "left", "lt" ]
            },
            {
                "primitive": "PENDOWN",
                "aliases": [ "pendown", "pd" ]
            },
            {
                "primitive": "PENUP",
                "aliases": [ "penup", "pu" ]
            },
            {
                "primitive": "REPEAT",
                "aliases": [ "repeat" ]
            },
            {
                "primitive": "RIGHT",
                "aliases": [ "right", "rt" ]
            },
            {
                "primitive": "SETBACKGROUND",
                "aliases": [ "setbackground", "setbg" ]
            },
            {
                "primitive": "SETHEADING",
                "aliases": [ "setheading", "seth" ]
            },
            {
                "primitive": "SETLABELHEIGHT",
                "aliases": [ "setlabelheight" ]
            },
            {
                "primitive": "SETPENCOLOR",
                "aliases": [ "setpencolor", "setpc" ]
            },
            {
                "primitive": "SETPENSIZE",
                "aliases": [ "setpensize" ]
            },
            {
                "primitive": "SHOWTURTLE",
                "aliases": [ "showturtle", "st" ]
            },
            {
                "primitive": "STOP",
                "aliases": [ "stop" ]
            },
            {
                "primitive": "TO",
                "aliases": [ "to" ]
            },
            {
                "primitive": "WAIT",
                "aliases": [ "wait" ]
            }
        ],
        "UI": [
            {
                "id": "run",
                "text": "Run ▶️"
            },
            {
                "id": "stop",
                "text": "Stop ⏹"
            },
            {
                "id": "clear",
                "text": "Clear ❌"
            },
            {
                "id": "logo-examples",
                "text": "Examples 🐢"
            }
        ],
        "examples": [
            {
                "name": "A square with REPEAT",
                "code": [
                    "repeat 4 [fd 60 rt 90]"
                ]
            },
            {
                "name": "A square in a procedure",
                "code": [
                    "to square :side",
                    "  repeat 4 [fd :side rt 90]",
                    "end",
                    "cs",
                    "square 60"
                ]
            },
            {
                "name": "Pentagon flower",
                "code": [
                    "to pentagon :side",
                    "  repeat 5 [fd :side rt 360/5]",
                    "end",
                    "cs",
                    "repeat 8 [pentagon 50 rt 45]"                   
                ]
            },
            {
                "name": "A spiral",
                "code": [
                    "to spiral :side",
                    "  fd :side rt 90",
                    "  spiral :side + 3",
                    "end",
                    "cs",
                    "spiral 10"
                ]
            },
            {
                "name": "Tree",
                "code": [
                    "to tree :length",
                    "  if :length < 15 [stop]",
                    "  fd :length",
                    "  lt 45",
                    "  tree :length/2",
                    "  rt 90",
                    "  tree :length/2",
                    "  lt 45",
                    "  bk :length",
                    "end",
                    "cs",
                    "bk 100",
                    "tree 160"
                ]
            },
            {
                "name": "Table and chairs",
                "code": [
                    "to leftchair",
                    "  fd 100",
                    "  pu bk 60 pd",
                    "  rt 90 fd 40",
                    "  rt 90 fd 40",
                    "end",
                    "",
                    "to rightchair",
                    "  fd 100",
                    "  pu bk 60 pd",
                    "  lt 90 fd 40",
                    "  lt 90 fd 40",
                    "end",
                    "",
                    "to table",
                    "  fd 60 lt 90",
                    "  pu fd 20 pd",
                    "  bk 100",
                    "  pu fd 20 pd",
                    "  lt 90 fd 60",
                    "end",
                    "",
                    "to leftchairinposition",
                    "  lt 90",
                    "  pu fd 100 pd",
                    "  rt 90",
                    "end",
                    "",
                    "to tableinposition",
                    "  lt 90",
                    "  pu fd 20 pd",
                    "  lt 90",
                    "end",
                    "",
                    "to rightchairinposition",
                    "  lt 90",
                    "  pu fd 60 pd",
                    "  lt 90",
                    "end",
                    "",
                    "cs",
                    "leftchairinposition",
                    "leftchair",
                    "tableinposition",
                    "table",
                    "rightchairinposition",
                    "rightchair"
                ]
            },
            {
                "name": "Colorful star",
                "code": [
                    "to colorfulstar :length :counter",
                    "  if :counter>15 [stop]",
                    "  home",
                    "  rt :counter*360/16",
                    "  setpc :counter",
                    "  fd :length",
                    "  colorfulstar :length :counter+1",
                    "end",
                    "clean",
                    "colorfulstar 100 0",
                    "home"
                ]
            },
            {
                "name": "One 💩 to rule them all",
                "code": [
                    "to pooemoji :size",
                    "  setlabelheight :size",
                    '  label "💩',
                    "end",
                    "to hexagon :side",
                    "  repeat 6 [fd :side pooemoji 40 rt 60]",
                    "end",
                    "to moveleft :length",
                    "  lt 90 pu fd :length pd rt 90",
                    "end",
                    "cs",
                    "setbg 9",
                    "pooemoji 100",
                    "moveleft 130",
                    "rt 30",
                    "pu hexagon 130 pd"
                ]
            }
        ],
        "errors": {
            "CODEBLOCK_EXPECTED_OPENING_BRACKET": "Expected opening bracket [ after an 'IF' or 'REPEAT'",
            "EXPECTED_NUMBER_OR_VARIABLE": "Expected a number or a variable and instead we have: {0}",
            "PROCEDURE_CALL_STACK_OVERFLOW": "You have called a procedure more than {0} times and we stop the program",
            "PROCEDURE_NOT_DEFINED": "The procedure {0} hasn't been defined yet before using it",
            "UNKNOWN_TOKEN_FOUND": "Found a symbol '{0}' that wasn't recognized",
            "UNMATCHED_CLOSING_BRACKET": "A closing bracket ] was found without a matching opening bracket [ first"
        }
    },
    "Spanish": {
        "primitiveAliases": [
            {
                "primitive": "BACK",
                "aliases": [ "retrocede", "re" ]
            },
            {
                "primitive": "CLEAN",
                "aliases": [ "limpia" ]
            },
            {
                "primitive": "CLEARSCREEN",
                "aliases": [ "borrapantalla", "bp"]
            },
            {
                "primitive": "END",
                "aliases": [ "fin" ]
            },
            {
                "primitive": "FORWARD",
                "aliases": [ "avanza", "av" ]
            },
            {
                "primitive": "HIDETURTLE",
                "aliases": [ "ocultatortuga", "ot" ]
            },
            {
                "primitive": "HOME",
                "aliases": [ "centro" ]
            },
            {
                "primitive": "IF",
                "aliases": [ "si" ]
            },
            {
                "primitive": "LABEL",
                "aliases": [ "etiqueta" ]
            },
            {
                "primitive": "LEFT",
                "aliases": [ "giraizquierda", "gi"]
            },
            {
                "primitive": "PENDOWN",
                "aliases": [ "bajalapiz", "pd", "bl"]
            },
            {
                "primitive": "PENUP",
                "aliases": [ "subelapiz", "sl"]
            },
            {
                "primitive": "REPEAT",
                "aliases": [ "repite" ]
            },
            {
                "primitive": "RIGHT",
                "aliases": [ "giraderecha", "gd"]
            },
            {
                "primitive": "SETBACKGROUND",
                "aliases": [ "ponfondo" ]
            },
            {
                "primitive": "SETHEADING",
                "aliases": [ "ponrumbo", "ponr" ]
            },
            {
                "primitive": "SETLABELHEIGHT",
                "aliases": [ "ponfuente", "pf" ]
            },
            {
                "primitive": "SETPENCOLOR",
                "aliases": [ "poncolorlapiz", "poncl" ]
            },
            {
                "primitive": "SETPENSIZE",
                "aliases": [ "pongrosor", "pong" ]
            },
            {
                "primitive": "SHOWTURTLE",
                "aliases": [ "muestratortuga", "mt" ]
            },
            {
                "primitive": "STOP",
                "aliases": [ "alto" ]
            },
            {
                "primitive": "TO",
                "aliases": [ "para" ]
            },
            {
                "primitive": "WAIT",
                "aliases": [ "espera" ]
            }
        ],
        "UI": [
            {
                "id": "run",
                "text": "Corre ▶️"
            },
            {
                "id": "stop",
                "text": "Para ⏹"
            },
            {
                "id": "clear",
                "text": "Limpia ❌"
            },
            {
                "id": "logo-examples",
                "text": "Ejemplos 🐢"
            }
        ],
        "examples": [
            {
                "name": "Un cuadrado con REPITE",
                "code": [
                    "repite 4 [av 60 gd 90]"
                ]
            },
            {
                "name": "Un cuadrado en un procedimiento",
                "code": [
                    "para cuadrado :lado",
                    "  repite 4 [av :lado gd 90]",
                    "fin",
                    "bp",
                    "cuadrado 60"
                ]
            },
            {
                "name": "Flor de pentagonos",
                "code": [
                    "para pentagono :lado",
                    "  repite 5 [av :lado gd 360/5]",
                    "fin",
                    "bp",
                    "repite 8 [pentagono 50 gd 45]"                   
                ]
            },
            {
                "name": "Una espiral",
                "code": [
                    "para espiral :lado",
                    "  av :lado gd 90",
                    "  espiral :lado + 3",
                    "fin",
                    "bp",
                    "espiral 10"
                ]
            },
            {
                "name": "Arbol",
                "code": [
                    "para arbol :rama",
                    "  si :rama < 15 [alto]",
                    "  av :rama",
                    "  gi 45",
                    "  arbol :rama/2",
                    "  gd 90",
                    "  arbol :rama/2",
                    "  gi 45",
                    "  re :rama",
                    "fin",
                    "bp",
                    "re 100",
                    "arbol 160"
                ]
            },
            {
                "name": "Mesa y sillas",
                "code": [
                    "para sillaizquierda",
                    "  av 100",
                    "  sl re 60 bl",
                    "  gd 90 av 40",
                    "  gd 90 av 40",
                    "fin",
                    "",
                    "para silladerecha",
                    "  av 100",
                    "  sl re 60 bl",
                    "  gi 90 av 40",
                    "  gi 90 av 40",
                    "fin",
                    "",
                    "para mesa",
                    "  av 60 gi 90",
                    "  sl av 20 bl",
                    "  re 100",
                    "  sl av 20 bl",
                    "  gi 90 av 60",
                    "fin",
                    "",
                    "para posicionsillaizquierda",
                    "  gi 90",
                    "  sl av 100 bl",
                    "  gd 90",
                    "fin",
                    "",
                    "para posicionmesa",
                    "  gi 90",
                    "  sl av 20 bl",
                    "  gi 90",
                    "fin",
                    "",
                    "para posicionsilladerecha",
                    "  gi 90",
                    "  sl av 60 bl",
                    "  gi 90",
                    "fin",
                    "",
                    "bp",
                    "posicionsillaizquierda",
                    "sillaizquierda",
                    "posicionmesa",
                    "mesa",
                    "posicionsilladerecha",
                    "silladerecha"
                ]
            },
            {
                "name": "Estrella de colores",
                "code": [
                    "para estrelladecolores :rayo :contador",
                    "  si :contador>15 [alto]",
                    "  centro",
                    "  gd :contador*360/16",
                    "  poncl :contador",
                    "  av :rayo",
                    "  estrelladecolores :rayo :contador+1",
                    "fin",
                    "limpia",
                    "estrelladecolores 100 0",
                    "centro"
                ]
            },
            {
                "name": "Una 💩 para gobernarlos a todos",
                "code": [
                    "para caca :tamano",
                    "  pf :tamano",
                    '  etiqueta "💩',
                    "fin",
                    "para hexagono :lado",
                    "  repite 6 [av :lado caca 40 gd 60]",
                    "fin",
                    "para mueveizquierda :longitud",
                    "  gi 90 sl av :longitud bl gd 90",
                    "fin",
                    "bp",
                    "ponfondo 9",
                    "caca 100",
                    "mueveizquierda 130",
                    "gd 30",
                    "sl hexagono 130 bl"
                ]
            }
        ],
        "errors": {
            "CODEBLOCK_EXPECTED_OPENING_BRACKET": "Esperábamos un corchete abierto [ en un 'SI' o 'REPITE'",
            "EXPECTED_NUMBER_OR_VARIABLE": "Esperábamos un número o una variable y en vez de eso tenemos: {0}",
            "PROCEDURE_CALL_STACK_OVERFLOW": "Has llamado un procedimiento mas de {0} veces y hemos parado el programa",
            "PROCEDURE_NOT_DEFINED": "El procedimiento {0} tiene que ser definido antes de usarlo",
            "UNKNOWN_TOKEN_FOUND": "Hemos encontrado un símbolo '{0}' que no hemos reconocido",
            "UNMATCHED_CLOSING_BRACKET": "Un corchete ] fue encontrado sin encontrar primero un corchete ["
        }
    }
};
