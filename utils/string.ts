import { pipe } from "fp-ts/function";
import { array, option } from "fp-ts";

export const matchFirst = (groupRegexp: string) => {
  const re = new RegExp(`(${groupRegexp})`);
  return (input: string) =>
    pipe(input.match(re), option.fromNullable, option.chain(array.lookup(1)));
};
