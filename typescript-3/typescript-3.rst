Les nouveautés de Typescript 3
==============================

Typescript 3 vient de sortir, voici quelques nouveautés... et des exemples !

Les project references
----------------------

La principale nouveauté de Typescript 3, ce sont les **project references**. Ils sont intéressants quand vous travaillez sur un projet Typescript comprenant de nombreux modules dans un seul dépôt. Ils permettent de mieux organiser le code et surtout d'**optimiser la compilation**.

Vous pouvez décomposer votre projet en un module maître et plusieurs modules composites.

Chaque projet aura son propre tsconfig.json.

Une nouvelle option de compilation : `tsc --build` ou `tsc -b` permet de compiler l'ensemble des projets d'un seul coup.


**Exemple**


Vous trouverez ici un exemple de projet comprenant un package `main` et deux packages `foo` et `bar`

    .. _Python: https://github.com/makinacorpus/blogposts-angular/tree/master/typescript-3

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

L'option de compilation **"composite": true** indique que le projet est un sous-projet.

Il est nécessaire de définir la cible de chaque compilation pour générer une seule librairie js. Les **outDir** des différents projets sont configurés pour envoyer les assets dans le même dossier `/lib`


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
