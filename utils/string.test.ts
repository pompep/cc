import { pipe } from "fp-ts/function";
import { matchFirst } from "./string";
import { expectNone, expectSome } from "./testing";

describe("matchFirst", () => {
  test("happy path", () => {
    pipe(
      "xx01.05.2021 27.06.2022 #124",
      matchFirst("\\d{2}\\.\\d{2}.\\d{4}"),
      expectSome((res) => {
        expect(res).toEqual("01.05.2021");
      })
    );
  });

  test("not found", () => {
    pipe("27.06.20", matchFirst("\\d{2}\\.\\d{2}.\\d{4}"), expectNone);
  });
});
