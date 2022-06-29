import { Either } from "fp-ts/Either";
import { isSome, none, Option } from "fp-ts/Option";
import { identity, pipe } from "fp-ts/function";
import { either } from "fp-ts";

export const expectRight =
  <L, R>(expected?: (r: R) => void) =>
  (e: Either<L, R>) => {
    if (either.isLeft(e)) {
      console.error("right expected:", e.left);
    }

    expect(either.isRight(e)).toBe(true);

    if (expected != null) {
      if (either.isRight(e)) {
        expected(e.right);
      }
    }
  };

export const expectLeft =
  <L, R>(expected?: (l: L) => void) =>
  (e: Either<L, R>) => {
    if (either.isRight(e)) {
      console.error("left expected:", e);
    }

    expect(either.isLeft(e)).toBe(true);

    if (expected != null) {
      if (either.isLeft(e)) {
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

export const rightOrThrow = <L, R>(e: Either<L, R>): R =>
  pipe(
    e,
    either.fold((l) => {
      throw new Error(
        `Right expected, instead got left: ${JSON.stringify(l)}"`
      );
    }, identity)
  );
