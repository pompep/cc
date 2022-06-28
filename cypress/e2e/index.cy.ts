import { cy, it, describe } from "local-cypress";

describe("index page", () => {
  it("spinner on slow connection", () => {
    cy.intercept(
      "/api/cnbProxy",
      {
        middleware: true,
      },
      (req) => {
        req.on("response", (res) => {
          res.setDelay(2000);
        });
      }
    );

    cy.visit("/");
    cy.getByData("spinner");
  });

  it("unexpected response", () => {
    cy.intercept("/api/cnbProxy", "unexpected response");
    cy.visit("/");
    cy.getByData("alert");
  });

  it.only("happy path", () => {
    cy.visit("/");
  });
});

export {}; // solves ts isolatedModules
