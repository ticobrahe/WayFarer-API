import add from './util';

it('should add two number', () => {
  const res = add(5, 2);
  if (res !== 7) {
    throw new Error(`Expected to return 7 but ${res} was returned`);
  }
});
