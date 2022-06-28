import {
  CurrenciesResponse,
  currenciesResponseFromStringCodec,
  validDateFromStringCodec,
} from "./api";
import { expectLeft, expectRight } from "../utils/testing";
import { pipe } from "fp-ts/function";

describe("dateFromStringCodec", () => {
  describe("decode", () => {
    test("happy path", () => {
      pipe(
        "27.06.2022",
        validDateFromStringCodec.decode,
        expectRight((d) => {
          expect(d.getFullYear()).toEqual(2022);
          expect(d.getMonth()).toEqual(5);
          expect(d.getDate()).toEqual(27);
        })
      );
    });

    test("non existing date", () => {
      pipe("31.6.2022", validDateFromStringCodec.decode, expectLeft());
    });

    test("invalid input", () => {
      pipe("xyz", validDateFromStringCodec.decode, expectLeft());
    });
  });

  test("encode", () => {
    pipe(new Date(2022, 5, 28), validDateFromStringCodec.encode, (dateStr) =>
      expect(dateStr).toEqual("28.06.2022")
    );
  });
});

describe("currenciesResponseFromStringCodec", () => {
  test("valid input", () => {
    const expected = {
      date: new Date(2022, 5, 27),
      currencies: [
        {
          code: "AUD",
          amount: 1,
          country: "Austrálie",
          name: "dolar",
          rate: 16.187,
        },
        {
          code: "BRL",
          amount: 1,
          country: "Brazílie",
          name: "real",
          rate: 4.46,
        },
      ],
    };

    pipe(
      "27.06.2022 #124\n" +
        "země|měna|množství|kód|kurz\n" +
        "Austrálie|dolar|1|AUD|16,187\n" +
        "Brazílie|real|1|BRL|4,460",
      currenciesResponseFromStringCodec.decode,
      expectRight((res) => {
        expect(res).toEqual(expected);
      })
    );
  });

  test("missing header row", () => {
    pipe(
      `Austrálie|dolar|1|AUD|16,187
Brazílie|real|1|BRL|4,460`,
      currenciesResponseFromStringCodec.decode,
      expectLeft()
    );
  });
});
