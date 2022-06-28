import axios from "axios";
import { flow, pipe } from "fp-ts/function";
import { array, either, option, string, task, taskEither } from "fp-ts";
import * as t from "io-ts";
import { Errors } from "io-ts";
import { nonEmptyArray, NumberFromString } from "io-ts-types";
import { format, parse } from "date-fns";
import { matchFirst } from "../utils/string";
import { TaskEither } from "fp-ts/TaskEither";
import { failure } from "io-ts/lib/PathReporter";
import { not } from "fp-ts/Predicate";

type ApiError = string; // keep it simple for now

export const fetchCurrencies = (): TaskEither<ApiError, CurrenciesResponse> => {
  return pipe(
    taskEither.tryCatch(
      () => axios.get("/api/cnbProxy").then((response) => response.data),
      (e) => `fetch failed: ${e}`
    ),
    task.map(
      either.chain(
        flow(
          currenciesResponseFromStringCodec.decode,
          either.mapLeft(
            (validationErrors) =>
              `api response in unexpected format: ${errorsToMessage(
                validationErrors
              )}`
          )
        )
      )
    )
  );
};

const errorsToMessage = (errors: Errors): string => failure(errors).join(";\n");

const csDecimalSeparator = ",";
const commonDecimalSeparator = ".";
export const numberFromCsStringCodec = new t.Type<number, string>(
  "numberFromCsString",
  t.number.is,
  (u, c) =>
    pipe(
      t.string.validate(u, c),
      either.map((s) => s.replace(csDecimalSeparator, commonDecimalSeparator)),
      either.chain((s) => NumberFromString.validate(s, c))
    ),
  (n) => n.toString().replace(commonDecimalSeparator, csDecimalSeparator)
);

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

const currencyCodec = t.type(
  {
    country: t.string,
    name: t.string,
    amount: NumberFromString,
    code: t.string,
    rate: numberFromCsStringCodec,
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
