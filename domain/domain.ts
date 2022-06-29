import { flow, pipe } from "fp-ts/function";
import { array, either, option, string } from "fp-ts";
import * as t from "io-ts";
import { Errors } from "io-ts";
import { nonEmptyArray, NumberFromString } from "io-ts-types";
import { format, parse } from "date-fns";
import { matchFirst } from "../utils/string";
import { not } from "fp-ts/Predicate";

interface ValidDateBrand {
  readonly ValidDate: unique symbol;
}
type ValidDate = t.Branded<Date, ValidDateBrand>;
export const validDatePredicate = (d: Date): d is ValidDate =>
  !isNaN(d.getTime());

const dateFormat = "dd.MM.yyyy";
export const validDateFromStringCodec = new t.Type<ValidDate, string>(
  "DateFromString",
  (u): u is ValidDate => u instanceof Date && validDatePredicate(u),
  (u, c) =>
    pipe(
      t.string.validate(u, c),
      either.chain((s) => {
        const onError = (e): Errors => [
          {
            value: u,
            context: c,
            message: `date value not in expected format '${dateFormat}': ${e}`,
          },
        ];

        return pipe(
          either.tryCatch(() => parse(s, dateFormat, new Date()), onError),
          either.filterOrElse(validDatePredicate, onError)
        );
      })
    ),
  (validDate) => format(validDate, dateFormat)
);

interface RateBrand {
  readonly Rate: unique symbol;
}
// Rate cannot be zero or negative
export const rateCodec = t.brand(
  t.number,
  (n): n is t.Branded<number, RateBrand> => n > 0,
  "Rate"
);
export type Rate = t.TypeOf<typeof rateCodec>;

const csDecimalSeparator = ",";
const commonDecimalSeparator = ".";
export const numberFromCsStringCodec = new t.Type<number, string>(
  "numberFromCsString",
  NumberFromString.is,
  (u, c) =>
    pipe(
      t.string.validate(u, c),
      either.map((s) => s.replace(csDecimalSeparator, commonDecimalSeparator)),
      either.chain((s) => NumberFromString.validate(s, c))
    ),
  (n) => n.toString().replace(commonDecimalSeparator, csDecimalSeparator)
);

const currencyCodec = t.type(
  {
    country: t.string,
    name: t.string,
    amount: NumberFromString,
    code: t.string,
    rate: numberFromCsStringCodec.pipe(rateCodec),
  },
  "Currency"
);
export type Currency = t.TypeOf<typeof currencyCodec>;

const currenciesResponseCodec = t.type({
  currencies: nonEmptyArray(currencyCodec),
  date: validDateFromStringCodec,
});
export type CurrenciesResponse = t.TypeOf<typeof currenciesResponseCodec>;

const decoderInputFromString = (textResponse: string) => {
  return pipe(
    textResponse.split("\n"),
    array.map(string.trim),
    array.filter(not(string.isEmpty)),
    (lines) => ({
      date: pipe(
        lines,
        array.head,
        option.chain(matchFirst("\\d{2}\\.\\d{2}.\\d{4}")),
        option.toNullable
      ),
      currencies: pipe(
        lines,
        array.dropLeft(2),
        array.map((currencyLine) =>
          pipe(currencyLine.split("|"), (splits) => ({
            country: splits[0],
            name: splits[1],
            amount: splits[2],
            code: splits[3],
            rate: splits[4],
          }))
        )
      ),
    })
  );
};

export const currenciesResponseFromStringCodec = new t.Type<
  CurrenciesResponse,
  string,
  unknown
>(
  "CurrenciesResponse",
  currenciesResponseCodec.is,
  (u, c) =>
    pipe(
      t.string.validate(u, c),
      either.chain(
        flow(decoderInputFromString, (rawResponse) =>
          currenciesResponseCodec.validate(rawResponse, c)
        )
      )
    ),
  String // encode not used => just stubbed for now
);

export const convert = (
  selectedCurrency: Pick<Currency, "amount" | "rate">,
  czkAmount: number
) =>
  (selectedCurrency.amount / selectedCurrency.rate) * // rate is ensured to be > 0
  czkAmount;
