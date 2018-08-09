Les nouveautés de Typescript 3
==============================

Typescript 3.0 vient de sortir, voici quelques nouveautés... et des exemples !


Check statique des paramètres du reste
--------------------------------------

Pour rappel, javascript permet de passer par décomposition des paramètres à une fonction et de récupérer dans une array les paramètres 'du reste' passés en plus, grâce au spread operator '...'.

Ce code est fonctionnel en Typescript 2.9

    ..code: typescript
    function somme(...args: number[]) {  // rest parameters
        let total = 0;
        for (let num of args) {
            total += num;
        }
        return total;
    }
    console.log(somme(1, 2, 3, 4);
    console.log(somme(...[1, 2, 3, 4]));  // spread operator in function call



Typescript 3.0 permet d'améliorer le check statique des paramètres du reste (rest parameters) et autorise le passage en paramètres de tuples typés par décomposition vers des paramètres nommés.


Les paramètres du reste, en combinaison avec le passage de paramètres par décomposition (spread arguments), sont très utiles lorsque vous utilisez des wrapper de fonctions.

Prenons par exemple ces deux fonctions, leftPad et rightPad, aux signatures similaires :

    ..code: typescript

    //typescript-3/spread-params/index.ts

    function leftPad(text: string, num: number, char: string = ' '): string {  // paramètres nommés
        for (let i = 0; i < num; i++) {
            text = char + text;
        }
        return text;
    }

    function rightPad(text: string, num: number, char: string = ' '): string {
        for (let i = 0; i < num; i++) {
            text = text + char;
        }
        return text;
    }

Nous souhaitons écrire une fonction `pad` qui effectue consécutivement les deux opérations.

En Typescript <3, on aurait écrit ça:

    ..code: typescript

    function pad(text: string, num: number, char?: string) {
        return rightPad(leftPad(text, num, char), num, char);
    }

On aurait aimé utiliser la décomposition par souci d'économie du code et de maintenabilité.
Mais il aurait fallu écrire ça :

    ..code: typescript

    function pad(text: string, ...args) {  // pas de typage
        // en typescript, le spread n'était pas possible quand les fonctions appelées n'attendent pas de rest parameters
        return rightPad(leftPad(text, args[0], args[1]), args[0], args[1]);
    }

Autant rester à la version précédente : on ne pouvait pas passer d'arguments par décomposition si la fonction appelée n'attendait pas explicitement de paramètre du reste...

Et en plus, on n'avait pas de check sur les arguments. Si un développeur écrit malencontreusement :
`pad('hello', '!', 12)`, il aura une erreur au runtime !

De fait, on ne pouvait pas profiter de la décomposition dans ce genre de cas.


**typage des paramètres du reste**

Pour commencer, il est devenu possible de typer les paramètres du reste en tant que tuples. On peut écrire :

    ..code: typescript

    function pad(text: string, ...args: [number, string]) {
        return rightPad(leftPad(text, ...args), ...args); // num = args[0] et char = args[1]
    }

Du coup :

- les *tuples* `...args` sont décomposés et leurs valeurs checkées statiquement, respectivement,
- `pad('hello', 12, '!')` fonctionnera mais `pad('hello', '!', 12)` provoquera une erreur de compilation.

*À noter: il faut bien comprendre que pour mapper avec une liste définie de paramètres, on travaille forcément avec des tuples, pas avec des séquences arbitraires : on peut écrire
`console.log(pad('hello', ...[12, '!'] as [number, string]));` mais pas `console.log(pad('hello', ...[12, '!'])); // erreur de compilation`
*


**valeurs optionnelles dans les tuples et les paramètres du reste**

Ensuite, on peut maintenant rendre optionnelles les valeurs de tuples, avec l'écriture `?`, comme pour les attributs d'objets sur les interfaces. C'est particulièrement utile avec des paramètres du reste qu'on veut repasser par décomposition.

    ..code: typescript

    function pad(text: string, ...args: [number, string?]) {  // le paramètre 'caractère' est facultatif
        return rightPad(leftPad(text, ...args), ...args);
    }

    On pourra donc écrire `pad('hello', 12, ' ')` ou `pad('hello', 12)`.


Vous pouvez donc maintenant utiliser les paramètres du reste en Typescript sans casser le typage.
Vous avez ainsi la garantie qu'une erreur de compilation surviendra au niveau de `pad`, puis des appels de `pad`, si vous faites une modification impactante au niveau de la signature de `leftPad` ou `rightPad`.


Les project references
----------------------

Ils sont intéressants quand vous travaillez sur un projet Typescript comprenant de nombreux modules dans un seul dépôt. Ils permettent de mieux organiser le code et surtout d'**optimiser la compilation**.

Vous pouvez décomposer votre projet en un module maître et plusieurs modules composites.

Chaque projet aura son propre tsconfig.json.

Une nouvelle option de compilation : `tsc --build` ou `tsc -b` permet de compiler l'ensemble des projets d'un seul coup.


**Exemple**


Vous trouverez ici un exemple de projet comprenant un package `main` et deux packages `foo` et `bar`

    .. _Exemple: https://github.com/makinacorpus/blogposts-angular/tree/master/typescript-3/project-references

J'ai choisi ici de mettre les trois paquets dans trois dossiers de même niveau (on aurait pu mettre le contenu du main à la racine, mais pour cette démo, je l'ai séparé, afin de bien montrer la différence avec le fonctionnement 'classique' de typescript).

::

    project-references
    ├── bar
    │   ├── index.ts  # exporte une fonction bar()
    │   ├── tsconfig.json
    │   └── package.json
    ├── foo
    │   ├── index.ts  # exporte une fonction foo()
    │   ├── tsconfig.json
    │   └── package.json
    ├── main
    │   ├── index.ts  # appelle les fonctions foo() et bar()
    │   ├── tsconfig.json
    │   └── package.json
    ├── *lib*
    ├── *node_modules*
    └── package.json # dépendance typescript


Regardons les `tsconfig.json` de `foo` et `main` :

**package foo**

    ..code: json

    // ./foo/tsconfig.json
    {
      "compilerOptions": {
        "composite": true,
        "declaration": true,
        "outDir": "../lib/foo"
      }
    }

    ..code: typescript

    // ./foo/index.ts
    export function foo(): string {
      return 'foo';
    }

L'option de compilation **"composite": true** indique que le module est un sous-projet.

Il est nécessaire de définir la cible de chaque compilation pour générer une seule librairie js. Ici, les **outDir** des différents projets sont configurés pour envoyer les assets dans le même dossier `/lib`


**package main**

    ..code: json

    // ./main/tsconfig.json
    {
      "compilerOptions": {
        "module": "commonjs",
        "outDir": "../lib/main"
      },
      "references": [
        {
          "path": "../foo"
        },
        {
          "path": "../bar"
        }
      ]
    }


    ..code: typescript

    // ./main/tsconfig.json
    import { bar } from '../bar';
    import { foo } from '../foo';

    export function foobar() {
      console.log(bar());
      console.log(foo());
    }

    foobar();


L'option racine **"references"** permet de spécifier les sous-projets du projet maître.

**compilons tout ça**

On peut compiler tous les projets par une seule opération : `tsc -b`. Vous obtenez la structure suivante :

::

    │
    lib
    ├── bar
    │   ├── index.js  # exporte une fonction bar()
    │   └── index.d.ts
    ├── foo
    │   ├── index.js  # exporte une fonction foo()
    │   └── index.d.ts
    ├── main
    │   ├── index.js  # appelle les fonctions foo() et bar()
    │   └── index.d.ts


Cela fait sens particulièrement en mode watch : avec `tsc -b --watch`. La compilation incrémentale est optimisée : les autres sous-projets ne sont pas recompilés quand un projet est modifié.

*À noter : il s'agit bien d'une fonctionnalité permettant d'optimiser la compilation d'un seul et même projet. Elle permet par ailleurs d'ajouter un niveau d'organisation supplémentaire. Mais il ne s'agit pas d'une fonctionnalité permettant de gérer plusieurs projets en même temps, et encore moins d'une solution de bundling.*

**tsc --build**

La nouvelle option --build permet
- comme on l'a vu, de builder un module avec ses *project references*
- de builder plusieurs projets en même temps, si plusieurs fichiers tsconfig.json sont passés en paramètre (par exemple, on peut faire `tsc -b bar/tsconfig.json foo/tsconfig.json`)


Typage des paramètres par expansion
-----------------------------------

Typescript 3 permet de typer
