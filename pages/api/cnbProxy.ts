import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

// proxy to deal with cors
export default (req: NextApiRequest, res: NextApiResponse) => {
  return axios
    .get(
      "http://www.cnb.cz/cs/financni_trhy/devizovy_trh/kurzy_devizoveho_trhu/denni_kurz.txt",
      {
        responseEncoding: "utf-8",
      }
    )
    .then((res) => res.data)
    .then((text) => {
      res.setHeader("Content-Type", "text/plain;charset=UTF-8");
      res.setHeader("Cache-Control", "no-store"); // no caching in demo
      res.status(200).send(text);
    })
    .catch((e) => {
      res.status(500).send(`${e}`);
    });
};
