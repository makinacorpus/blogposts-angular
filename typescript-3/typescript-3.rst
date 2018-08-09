Typescript 3.0 vient de sortir, voici quelques nouveautés... et des exemples !

Vous les trouverez à cette adresse : https://github.com/makinacorpus/blogposts-angular/tree/master/typescript-3/


Contrôle statique des paramètres du reste
=========================================

Pour rappel, le spread operator javascript *"..."* permet, notamment :

- de passer par décomposition (*spread*) des paramètres à une fonction (https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Op%C3%A9rateurs/Syntaxe_d%C3%A9composition)
- et de récupérer dans un tableau les paramètres "du reste" (*rest parameters*) déclarés en plus des paramètres nommés (https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Fonctions/param%C3%A8tres_du_reste )

Typescript fournissait un support, limité, du passage de paramètres par décomposition. Ce code par exemple est fonctionnel en Typescript 2.9

.. code :: typescript

    function somme(...args: number[]) {  // rest parameters
        let total = 0;
        for (let num of args) {
            total += num;
        }
        return total;
    }
    console.log(somme(1, 2, 3, 4);
    console.log(somme(...[1, 2, 3, 4]));  // spread operator in function call


Typescript 3.0 autorise le passage en paramètre d'un tuple typé par décomposition **vers des paramètres nommés** et permet d'améliorer le check statique des paramètres du reste (rest parameters).


Les paramètres du reste, en combinaison avec le passage de paramètres par décomposition (spread arguments), sont très utiles lorsque vous utilisez des wrapper de fonctions.

Prenons par exemple ces deux fonctions, *leftPad* et *rightPad*, aux signatures similaires :

.. code :: typescript

    //typescript-3/spread-params/index.ts

    /*
     * leftPad("hello", 3, '@') -> "@@@hello"
     */
    function leftPad(text: string, num: number, char: string = ' '): string {  // paramètres nommés
        for (let i = 0; i < num; i++) {
            text = char + text;
        }
        return text;
    }

    /*
     * rightPad("hello", 3, '@') -> "hello@@@"
     */
    function rightPad(text: string, num: number, char: string = ' '): string {
        for (let i = 0; i < num; i++) {
            text = text + char;
        }
        return text;
    }

Nous souhaitons écrire une fonction *pad* qui effectue consécutivement les deux opérations.

On peut écrire cela de cette façon :

.. code :: typescript

    /*
     * pad("hello", 3, '@') -> "@@@hello@@@"
     */
    function pad(text: string, num: number, char?: string) {
        return rightPad(leftPad(text, num, char), num, char);
    }

C'est pas mal, mais si nous faisons évoluer les signatures de **leftPad** et **rightPad**, pour ajouter de nouvelles options, la maintenance de **pad** pourrait devenir pénible.

À partir de Typescript 3.0 on a une solution très satisfaisante pour faire cela grâce à la décomposition.

.. code :: typescript

    /* Typescript >= 3.0
     * pad("hello", 3, '@') -> "@@@hello@@@"
     */
    function pad(text: string, ...args: [number, string?]) {  //  possible en TS >= 3
        return rightPad(leftPad(text, ...args), ...args);  // possible en TS >= 3
    }

C'est mieux : il ne reste plus qu'une seule liste de types à maintenir, et en plus tout est vérifié statiquement !

Détaillons :

Typage des paramètres du reste
------------------------------

Pour commencer, il est devenu possible de typer les paramètres du reste en tant que tuples. On peut maintenant écrire :

.. code :: typescript

    function pad(text: string, ...args: [number, string]) {


Grâce à cela, l'appel **pad('hello', 12, '!')** fonctionnera mais la typo **pad('hello', '!', 12)** provoquera une erreur de compilation.


Passage de paramètres nommés par décomposition d'un tuple
---------------------------------------------------------

Ensuite, on peut maintenant **passer, par décomposition, un tuple** en paramètre d'**une fonction qui attend des paramètres nommés**.

On peut donc écrire :

.. code :: typescript

    function pad(text: string, ...args: [number, string]) {
        return rightPad(leftPad(text, ...args), ...args); // num = args[0] et char = args[1]
    }

*Avant, ça n'aurait été possible que si leftPad et rightPad avaient pour signature **leftPad(text: string, ...args: any[])**.*

Les *tuples* **...args** sont décomposés pour l'appel de **rightPad** et **leftPad** vers les variables **num** et **args** et les types sont vérifiés statiquement.


*À noter: il faut bien comprendre que pour mapper avec une liste définie de paramètres, on doit travailler explicitement avec des tuples, pas avec des tableaux arbitraires.*

.. code :: typescript

    rightPad('hello', ...[12, '!'] as [number, string])  // compile
    rightPad('hello', ...[12, '!'] as any[]  // ne compile pas
    rightPad('hello', ...[12, '!']  // ne compile pas non plus car ça revient au précédent



Valeurs optionnelles dans les tuples et les paramètres du reste
---------------------------------------------------------------

Enfin, on peut maintenant rendre optionnelles les valeurs de tuples, avec l'écriture *?*, comme pour les attributs d'objets sur les interfaces. C'est particulièrement utile avec des paramètres qu'on veut repasser par décomposition à une fonction ayant des paramètres optionnels.

.. code :: typescript

    function pad(text: string, ...args: [number, string?]) {  // le paramètre 'char' est facultatif
        return rightPad(leftPad(text, ...args), ...args);
    }

On pourra donc écrire :

.. code :: typescript

    pad('hello', 12, ' ')  // compile
    pad('hello', 12)  // compile


En bref
-------

Dans notre exemple, vous avez la garantie qu'une erreur de compilation surviendra au niveau de *pad*, puis des appels de *pad*, si vous faites une modification impactante au niveau de la signature de *leftPad* ou *rightPad*.

Vous pouvez donc maintenant réutiliser les paramètres du reste par décomposition sans casser le typage.


Le type 'unknown'
=================

Typescript ajoute un nouveau builtin type: *unknown*. Il remplacera avantageusement le *any* dans de nombreux cas.

*unknown* permet, comme *any*, de déclarer qu'on ne peut déterminer le type d'une variable. Mais son comportement est inverse : alors que le **any** permettait d'indiquer au compilateur que **n'importe quelle propriété** était disponible, **unknown** indique qu'**aucune** propriété n'est disponible, à moins de faire des vérifications de type explicites. Il est **type-safe**.

Prenons ce code :

.. code :: typescript

    class Car {
      constructor(public numberPlate: number) {};

      displayNumber(): string {
        return this.numberPlate.toString();
      }
    }

Vous avez déjà fait des choses comme ça, ça compile :

.. code :: typescript

    function displayableAny(anyValue: any): string {
      return !!anyValue.displayNumber ? anyValue.displayNumber() : anyValue;
    }

Mais c'est dangereux. Imaginons que anyValue reçoive un nombre ou une *Mobylette*, vous pourriez provoquer un contre sens au runtime.

Eh bien avec **unknown**, ça ne **compilera pas** :

.. code :: typescript

    // ne compile pas : ni display ni toString ne sont disponibles
    function badDisplayableUnknown(unknownValue: unknown): string {
      return !!unknownValue.displayNumber ? unknownValue.displayNumber() : unknownValue.toString();
    }

.. code :: typescript

    // ne compile pas non plus !
    // car le type unknown, contrairement au type any, ne peut être assigné au type de retour string
    function badDisplayableUnknown(unknownValue: unknown): string {
      return unknownValue instanceof Car ? unknownValue.display() : unknownValue;
    }

**unknown** vous oblige à checker les types avant de pouvoir utiliser les propriétés (fondamentalement: *vous pouvez faire l'intersection de unknown avec n'importe quel type pour obtenir ce type*). Vous serez donc **obligés** (avec any, vous pouvez mais n'êtes pas obligés...) d'écrire quelque chose comme ça :

.. code :: typescript

    function displayableUnknown(unknownValue: unknown): string {
      let displayedValue: string;
      if (typeof unknownValue === 'number') {
        displayedValue = unknownValue.toString();
      } else if (typeof unknownValue === 'string') {
        displayedValue = unknownValue;
      } else if (unknownValue instanceof Car) {
        displayedValue = unknownValue.displayNumber();
      } else {  // Mobylette ou autre...
        displayedValue = "not displayable value";
        console.error("not displayable value", typeof unknownValue, unknownValue);
      }
      return displayedValue;
    }

Vous ne risquez pas de provoquer une erreur au runtime parce que vous n'avez pas pensé à un cas.
C'est beaucoup plus sûr !


Les project references
======================

Typescript offre une nouvelle option de configuration de la compilation : les **project references**.

Ils sont intéressants quand vous travaillez sur un projet comprenant de nombreux modules dans un seul dépôt. Ils permettent de mieux organiser le code et surtout d'**optimiser la compilation**.

Vous pouvez décomposer votre projet en un module maître et plusieurs modules composites.

Chaque projet aura son propre *tsconfig.json*.

Une nouvelle option de compilation : **tsc --build** ou **tsc -b** permet de compiler l'ensemble des projets d'un seul coup.


Exemple
-------

Vous trouverez sur le dépôt github un exemple de projet comprenant un package **main** et deux packages **foo** et **bar**.

https://github.com/makinacorpus/blogposts-angular/tree/master/typescript-3/

J'ai choisi ici de mettre les trois paquets dans trois dossiers de même niveau (on aurait pu mettre le contenu du main à la racine, mais pour cette démo, je l'ai séparé, afin de bien montrer la différence avec le fonctionnement 'classique' de typescript).

::

    project-references
    ├── bar
    │   ├── index.ts  # exporte une fonction bar()
    │   └── tsconfig.json
    ├── foo
    │   ├── index.ts  # exporte une fonction foo()
    │   └── tsconfig.json
    ├── main
    │   ├── index.ts  # appelle les fonctions foo() et bar()
    │   └── tsconfig.json
    ├── *lib*
    ├── *node_modules*
    └── package.json # dépendance typescript


Regardons les **tsconfig.json** de **foo** et **main**.

Package foo
-----------

.. code :: javascript

    // ./foo/tsconfig.json
    {
      "compilerOptions": {
        "composite": true,
        "declaration": true,
        "outDir": "../lib/foo"  // dans ./bar/tsconfig.json on aura "./lib/bar"
      }
    }

.. code :: typescript

    // ./foo/index.ts
    export function foo(): string {
      return 'foo';
    }

L'option de compilation **"composite": true** indique que le module est un sous-projet.

Il est nécessaire de définir la cible de chaque compilation pour générer une seule librairie js. Ici, les **outDir** des différents projets sont configurés pour envoyer les assets dans le même dossier **/lib**


Package main
------------

.. code :: javascript

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


.. code :: typescript

    // ./main/index.ts
    import { bar } from '../bar';
    import { foo } from '../foo';

    export function foobar() {
      console.log(bar());
      console.log(foo());
    }

    foobar();


L'option racine **"references"** permet de spécifier les sous-projets du projet maître.

Compilons tout ça
-----------------

On peut compiler tous les projets par une seule opération : **tsc -b**. Vous obtenez la structure suivante :

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


Cela fait sens particulièrement en mode watch : avec **tsc -b --watch**. La compilation incrémentale est optimisée : les autres sous-projets ne sont pas recompilés quand un projet est modifié.

*À noter : il s'agit bien d'une fonctionnalité permettant d'optimiser la compilation d'un seul et même projet. Elle permet par ailleurs d'ajouter un niveau d'organisation supplémentaire. Mais il ne s'agit pas d'une fonctionnalité permettant de gérer plusieurs projets en même temps, et encore moins d'une solution de bundling.*

tsc --build
-----------

La nouvelle option *--build* permet

- comme on l'a vu, de builder un module avec ses *project references*
- de builder plusieurs projets en même temps, si plusieurs fichiers tsconfig.json sont passés en paramètre (par exemple, on peut faire **tsc -b bar/tsconfig.json foo/tsconfig.json**)

Le changelog officiel : https://github.com/Microsoft/TypeScript/wiki/What's-new-in-TypeScript#typescript-30
