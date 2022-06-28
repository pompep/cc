import * as React from "react";
import { CurrenciesResponse, Currency } from "../domain/api";
import { SubmitHandler, useForm } from "react-hook-form";
import { constNull, pipe } from "fp-ts/function";
import { array, option, string } from "fp-ts";
import { contramap } from "fp-ts/Ord";

interface Props extends CurrenciesResponse {}

interface FormValues {
  czkAmount: number;
  selectedCurrencyCode: Currency["code"];
}

export const ConvertForm = (p: Props) => {
  const sortedCurrencies = React.useMemo(() => {
    return pipe(p.currencies, array.sort(currencyOrdByCode));
  }, [p.currencies]);

  const [amountInSelectedValue, setAmountInSelectedValue] =
    React.useState<number>();

  const form = useForm<FormValues>();

  form.watch(() => {
    // clear computed amount with every input change
    setAmountInSelectedValue(undefined);
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    pipe(
      p.currencies,
      array.findFirst((c) => c.code === data.selectedCurrencyCode),
      option.map(
        (selectedCurrency) =>
          (selectedCurrency.amount * selectedCurrency.rate) / data.czkAmount
      ),
      option.toUndefined,
      setAmountInSelectedValue
    );
  };

  return (
    <>
      <p>Rates from {p.date.toLocaleDateString()}</p>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
        }}
      >
        <div>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div>
              <label>amount in CZK = </label>
              <input {...form.register("czkAmount")} type={"number"} />
            </div>
            <div>
              <label>amount in</label>
              <select {...form.register("selectedCurrencyCode")}>
                {pipe(
                  sortedCurrencies,
                  array.map((c) => <option key={c.code}>{c.code}</option>)
                )}
              </select>
              {pipe(
                amountInSelectedValue,
                option.fromNullable,
                option.fold(constNull, (amount) => <span> = {amount}</span>)
              )}
            </div>
            <div>
              <button type={"submit"}>calc</button>
            </div>
          </form>
        </div>

        <div>
          <table>
            <tbody>
              {pipe(
                sortedCurrencies,
                array.map((c) => (
                  <tr key={c.code}>
                    <td>
                      <span
                        style={{ color: "blue", cursor: "pointer" }}
                        onClick={() => {
                          form.setValue("selectedCurrencyCode", c.code);
                        }}
                      >
                        {c.code}
                      </span>
                    </td>
                    <td>{c.country}</td>
                    <td>{c.name}</td>
                    <td>
                      {c.amount} {c.code} = {c.rate} CZK
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

const currencyOrdByCode = contramap((currency: Currency) => currency.code)(
  string.Ord
);
