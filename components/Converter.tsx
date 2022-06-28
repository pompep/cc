import * as React from "react";
import { useQuery } from "react-query";
import { fetchCurrencies } from "../domain/api";
import { pipe } from "fp-ts/function";
import { assertUnreachable } from "../utils/assertUnreachable";
import { Spinner } from "./atoms/Spinner";
import { either } from "fp-ts";
import { ApiError } from "./ApiError";
import { ConvertForm } from "./ConverterForm";

export const Converter = () => {
  const currenciesQuery = useCurrencies();

  return pipe(currenciesQuery, (query) => {
    switch (query.status) {
      case "idle":
      case "loading":
        return <Spinner />;

      case "error":
        return <ApiError />;

      case "success":
        return pipe(
          query.data,
          either.fold(
            () => <ApiError />,
            (response) => <ConvertForm {...response} />
          )
        );
    }
    assertUnreachable(query);
  });
};

const useCurrencies = () => {
  return useQuery("currencies", fetchCurrencies());
};
