import * as React from "react";

interface Props {
  currency: string;
  amount: number;
}

export const CurrencyAmount = (p: Props) => {
  return (
    <span>
      {p.amount.toLocaleString(undefined, {
        currency: p.currency,
        currencyDisplay: "code",
        style: "currency",
      })}
    </span>
  );
};
