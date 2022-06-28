import * as React from "react";
import { useQuery } from "react-query";
import { fetchCurrencies } from "../domain/api";

interface Props {}

export const Converter = (p: Props) => {
  const currenciesQuery = useCurrencies();

  return <div>{JSON.stringify(currenciesQuery)}</div>;
};

const useCurrencies = () => {
  return useQuery("currencies", fetchCurrencies());
};
