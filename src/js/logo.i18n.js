const i18n = {
    "English": {
        "UI": [
            {
                "id": "run",
                "text": "Run ▶️"
            },
            {
                "id": "stop",
                "id": "Stop ⏹"
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
        ]
    },
    "Spanish": {
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
                    "  if :rama < 15 [para]",
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
        ]
    }
};
