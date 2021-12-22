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
            }
        ],
        "errors": {
            "PROCEDURE_CALL_STACK_OVERFLOW": "You have called a procedure more than {0} times and we stop the program"
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
                    "lp",
                    "re 100",
                    "arbol 160"
                ]
            }
        ],
        "errors": {
            "PROCEDURE_CALL_STACK_OVERFLOW": "Has llamado un procedimiento mas de {0} y hemos parado el programa"
        }
    }
};
