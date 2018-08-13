/*
 * Exemple avec parametres du reste seulement (fonctionne avant TS 3.0)
 */

function sum(...args: number[]) {
  let total = 0;
  for (let num of args) {
    total += num;
  }
  return total;
}

console.log(sum(...[1, 2, 3, 4]));

/*
 * Exemple avec des paramètres nommés (fonctionne à partir de TS 3.0)
 */

function pad(text: string, ...args: [number, string?]) {
  return rightPad(leftPad(text, ...args), ...args);
}

function leftPad(text: string, num: number, char: string = ' '): string {
  if (char === undefined) {
    char = ' ';
  }
  for (let i = 0; i < num; i++) {
    text = char + text;
  }
  return text;
}

function rightPad(text: string, num: number, char: string = ' '): string {
  if (char === undefined) {
    char = ' ';
  }
  for (let i = 0; i < num; i++) {
    text = text + char;
  }
  return text;
}

// ne compile pas si le typage des paramètres du reste est incorrect
// function pad(text: string, ...args: [number, object?]) {
//    return rightPad(leftPad(text, ...args), ...args);  // object à la place de string
// }


console.log('"' + pad('foo', 10) + '"');
console.log(pad('foo', 10, '.'));
// console.log('"' + pad('foo', 10, 0) + '"'); // ne compile pas

// il faut bien comprendre que l'on travaille avec un tuple, pas avec une décomposition arbitraire
console.log(pad('hello', ...[12, '!'] as [number, string]));
// console.log(pad('hello', ...[12, '!'] as any[])); ne compile pas car ça n'est pas un tuple
// console.log(pad('hello', ...[12, '!'])); ne compile pas nom plus pour la même raison

/*
 * Deux exemples avec un wrapper générique autour de fonctions avec des paramètres nommés (fonctionne à partir de TS 3.0)
 */

function logParamsAndDo<T extends any[], U>(func: ((...args: T) => U), ...args: T) {
  console.log(arguments);
  return func(...args)
}

console.log(logParamsAndDo(leftPad, 'hello', 12, '@'));  // compile
console.log(logParamsAndDo(leftPad, 'hello', 12));  // compile
// console.log(logParamsAndDo(leftPad, 'hello', '@', 12)) // ne compile pas


function doTwoFunctions<T extends any[], U>(func1: (arg1: U, ...args: T) => U,
                                            func2: (arg1: U, ...args: T) => U,
                                            arg1: U, ...args: T): U {
  return func2(func1(arg1, ...args))
}

doTwoFunctions(leftPad, rightPad, 'hello', 12);
