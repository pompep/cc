import * as React from "react";
import {
  convert,
  CurrenciesResponse,
  Currency,
  numberFromCsStringCodec,
} from "../domain/domain";
import { SubmitHandler, useForm } from "react-hook-form";
import { constNull, flow, pipe } from "fp-ts/function";
import { array, either, option, string } from "fp-ts";
import { contramap } from "fp-ts/Ord";
import { not } from "fp-ts/Predicate";
import clsx from "clsx";
import styled from "styled-components";
import { Button } from "./atoms/Button";
import { CurrencyAmount } from "./atoms/CurrencyAmount";
import { sequenceS } from "fp-ts/Apply";

interface Props extends CurrenciesResponse {
  className?: string;
}

interface FormValues {
  czkAmount: number;
  selectedCurrencyCode: Currency["code"];
}

const ConvertForm = (p: Props) => {
  const sortedCurrencies = React.useMemo(() => {
    return pipe(p.currencies, array.sort(currencyOrdByCode));
  }, [p.currencies]);

  const [conversionResult, setConversionResult] = React.useState<number>();

  const form = useForm<FormValues>();

  form.watch(() => {
    // clear computed amount with every input change
    setConversionResult(undefined);
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    pipe(
      p.currencies,
      array.findFirst((c) => c.code === data.selectedCurrencyCode),
      option.map((selectedCurrency) =>
        convert(selectedCurrency, data.czkAmount)
      ),
      option.toUndefined,
      setConversionResult
    );
  };

  return (
    <div className={p.className}>
      <div className={"leftCol"}>
        <p>Rates update at {p.date.toLocaleDateString()}</p>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div>
            <input
              {...form.register("czkAmount", {
                required: true,
                setValueAs: flow(
                  numberFromCsStringCodec.decode,
                  either.getOrElse(() => Number.NaN)
                ),
                validate: not(Number.isNaN),
              })}
              className={clsx(form.formState.errors.czkAmount && "error")}
              size={10}
              data-cy={"czkAmount"}
            />
            <label>CZK</label>
          </div>
          <div>
            <label>convert to</label>
            <select
              {...form.register("selectedCurrencyCode", { required: true })}
            >
              {pipe(
                sortedCurrencies,
                array.map((c) => <option key={c.code}>{c.code}</option>)
              )}
            </select>
          </div>
          <div>
            <Button type={"submit"} data-cy={"submit"}>
              convert
            </Button>
          </div>
        </form>

        {pipe(
          {
            result: option.fromNullable(conversionResult),
            currencyCode: option.fromNullable(
              form.getValues("selectedCurrencyCode")
            ),
          },
          sequenceS(option.Apply),
          option.fold(constNull, (ctx) => (
            <div data-cy={"result"} className={"result"}>
              <CurrencyAmount currency={ctx.currencyCode} amount={ctx.result} />
            </div>
          ))
        )}
      </div>

      <table>
        <tbody>
          {pipe(
            sortedCurrencies,
            array.map((c) => (
              <tr key={c.code}>
                <td>
                  <Button
                    data-cy={"quickSet"}
                    onClick={() => {
                      form.setValue("selectedCurrencyCode", c.code);
                    }}
                  >
                    {c.code}
                  </Button>
                </td>
                <td>{c.country}</td>
                <td>{c.name}</td>
                <td>
                  <CurrencyAmount currency={c.code} amount={c.amount} />
                  {" = "}
                  <CurrencyAmount currency={"CZK"} amount={c.rate} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default styled(ConvertForm)`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1rem;

  .leftCol {
    p {
      margin-top: 0;
    }

    .result {
      margin: 0.5rem 0;
      font-weight: bold;
    }

    form {
      input,
      select {
        border: 1px solid;
        margin: 0.125rem;
        &.error {
          border-color: ${({ theme }) => theme.colors.error};
        }
      }
      div {
        padding: 0.125rem;
      }
    }
  }

  table {
    border-collapse: collapse;

    td {
      padding: 0.125rem;
    }

    tr:nth-child(even) {
      background: ${({ theme }) => theme.colors.lightBg};
    }
  }
`;

const currencyOrdByCode = contramap((currency: Currency) => currency.code)(
  string.Ord
);
