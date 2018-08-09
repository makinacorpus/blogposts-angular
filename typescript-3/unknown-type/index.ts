
class Car {
  constructor(public numberPlate: number) {};

  displayNumber(): string {
    return this.numberPlate.toString();
  }
}


function displayableAny(anyValue: any): string {
  return !!anyValue.displayNumber ? anyValue.display() : anyValue;
}
//
// // ne compile pas !
// function badDisplayableUnknown(unknownValue: unknown): string {
//   return !!unknownValue.display ? unknownValue.display() : unknownValue.toString();
// }
//

// // ne compile pas non plus !
// function badDisplayableUnknown(unknownValue: unknown): string {
//   return unknownValue instanceof Car ? unknownValue.displayNumber() : unknownValue;
// }
//

function displayUnknown(unknownValue: unknown): string {
  let displayedValue: string;
  if (typeof unknownValue === 'number') {
    displayedValue = unknownValue.toString();
  } else if (typeof unknownValue === 'string') {
    displayedValue = unknownValue;
  } else if (unknownValue instanceof Car) {
    displayedValue = unknownValue.displayNumber();
  } else {
    throw new Error('no display available')
  }
  return displayedValue;
}


displayUnknown(12);

displayableAny('toto');
