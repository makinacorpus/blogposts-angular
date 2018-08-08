import { bar } from '../bar';
import { foo } from '../foo';

export function foobar() {
  console.log(bar());
  console.log(foo());
}

foobar();
