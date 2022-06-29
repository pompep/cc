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

  it("happy path", () => {
    cy.visit("/");

    cy.getByData("czkAmount").type("invalidNumber");
    cy.getByData("submit").click();
    cy.getByData("czkAmount").should("have.class", "error");
    cy.getByData("result").should("not.exist");

    cy.getByData("czkAmount").clear();
    cy.getByData("czkAmount").type("10");
    cy.getByData("submit").click();
    cy.getByData("result").should("exist");

    cy.getByData("quickSet").last().click();
    cy.getByData("result").should("not.exist");
    cy.getByData("submit").click();
    cy.getByData("result").should("exist");
  });
});

export {}; // solves ts isolatedModules
