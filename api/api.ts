import { either, task, taskEither } from "fp-ts";
import { TaskEither } from "fp-ts/TaskEither";
import { flow, pipe } from "fp-ts/function";
import axios from "axios";
import { Errors } from "io-ts";
import { failure } from "io-ts/PathReporter";
import {
  CurrenciesResponse,
  currenciesResponseFromStringCodec,
} from "../domain/domain";

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
