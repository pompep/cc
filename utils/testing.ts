import { Either, isLeft, isRight } from "fp-ts/Either";
import { isSome, none, Option } from "fp-ts/Option";

export const expectRight =
  <L, R>(expected?: (r: R) => void) =>
  (e: Either<L, R>) => {
    if (isLeft(e)) {
      console.error("right expected:", e.left);
    }

    expect(isRight(e)).toBe(true);

    if (expected != null) {
      if (isRight(e)) {
        expected(e.right);
      }
    }
  };

export const expectLeft =
  <L, R>(expected?: (l: L) => void) =>
  (e: Either<L, R>) => {
    if (isRight(e)) {
      console.error("left expected:", e);
    }

    expect(isLeft(e)).toBe(true);

    if (expected != null) {
      if (isLeft(e)) {
        expected(e.left);
      }
    }
  };

export const expectSome =
  <A>(expected: (v: A) => void) =>
  (o: Option<A>) => {
    if (!isSome(o)) {
      console.error("some expected:", o);
    }

    expect(isSome(o)).toBe(true);

    if (isSome(o)) {
      expected(o.value);
    }
  };

export const expectNone = (i: unknown) => {
  expect(i).toBe(none);
};
