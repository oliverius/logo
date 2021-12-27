const i18n = {
    "English": {
        "primitiveAliases": [
            {
                "primitive": "FORWARD",
                "aliases": [ "forward", "fd" ]
            },
            {
                "primitive": "BACK",
                "aliases": [ "back", "bk" ]
            },
            {
                "primitive": "LEFT",
                "aliases": [ "left", "lt" ]
            },
            {
                "primitive": "RIGHT",
                "aliases": [ "right", "rt" ]
            },
            {
                "primitive": "PENUP",
                "aliases": [ "penup", "pu" ]
            },
            {
                "primitive": "PENDOWN",
                "aliases": [ "pendown", "pd" ]
            },
            {
                "primitive": "REPEAT",
                "aliases": [ "repeat" ]
            },
            {
                "primitive": "CLEARSCREEN",
                "aliases": [ "clearscreen", "cs" ]
            },
            {
                "primitive": "TO",
                "aliases": [ "to" ]
            },
            {
                "primitive": "END",
                "aliases": [ "end" ]
            }, {
                "primitive": "IF",
                "aliases": [ "if" ]
            },
            {
                "primitive": "STOP",
                "aliases": [ "stop" ]
            },
            {
                "primitive": "SETPENCOLOR",
                "aliases": [ "setpencolor", "setpc" ]
            },
            {
                "primitive": "SETBACKGROUND",
                "aliases": [ "setbackground", "setbg" ]
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
            }
        ],
        "errors": {
            "PROCEDURE_CALL_STACK_OVERFLOW": "You have called a procedure more than {0} times and we stop the program",
            "UNMATCHED_CLOSING_BRACKET": "A closing bracket ] was found without a matching opening bracket [ first",
            "CODEBLOCK_EXPECTED_OPENING_BRACKET": "Expected opening bracket [ after an 'IF' or 'REPEAT'",
            "EXPECTED_NUMBER_OR_VARIABLE": "Expected a number or a variable and instead we have: {0}",
            "PROCEDURE_NOT_DEFINED": "The procedure {0} hasn't been defined yet before using it",
            "UNKNOWN_TOKEN_FOUND": "Found a symbol '{0}' that wasn't recognized"
        }
    },
    "Spanish": {
        "primitiveAliases": [
            {
                "primitive": "FORWARD",
                "aliases": [ "avanza", "av" ]
            },
            {
                "primitive": "BACK",
                "aliases": [ "retrocede", "re" ]
            },
            {
                "primitive": "LEFT",
                "aliases": [ "giraizquierda", "gi"]
            },
            {
                "primitive": "RIGHT",
                "aliases": [ "giraderecha", "gd"]
            },
            {
                "primitive": "PENUP",
                "aliases": [ "subelapiz", "sl"]
            },
            {
                "primitive": "PENDOWN",
                "aliases": [ "bajalapiz", "pd", "bl"]
            },
            {
                "primitive": "REPEAT",
                "aliases": [ "repite" ]
            },
            {
                "primitive": "CLEARSCREEN",
                "aliases": [ "borrapantalla", "bp"]
            },
            {
                "primitive": "TO",
                "aliases": [ "para" ]
            },
            {
                "primitive": "END",
                "aliases": [ "fin" ]
            }, {
                "primitive": "IF",
                "aliases": [ "si" ]
            },
            {
                "primitive": "STOP",
                "aliases": [ "alto" ]
            },
            {
                "primitive": "SETPENCOLOR",
                "aliases": [ "poncolorlapiz", "setpc" ]
            },
            {
                "primitive": "SETBACKGROUND",
                "aliases": [ "ponfondo" ]
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
            }
        ],
        "errors": {
            "PROCEDURE_CALL_STACK_OVERFLOW": "Has llamado un procedimiento mas de {0} veces y hemos parado el programa",
            "UNMATCHED_CLOSING_BRACKET": "Un corchete ] fue encontrado sin encontrar primero un corchete [",
            "CODEBLOCK_EXPECTED_OPENING_BRACKET": "Esperábamos un corchete abierto [ en un 'SI' o 'REPITE'",
            "EXPECTED_NUMBER_OR_VARIABLE": "Esperábamos un número o una variable y en vez de eso tenemos: {0}",
            "PROCEDURE_NOT_DEFINED": "El procedimiento {0} tiene que ser definido antes de usarlo",
            "UNKNOWN_TOKEN_FOUND": "Hemos encontrado un símbolo '{0}' que no hemos reconocido"
        }
    }
};
