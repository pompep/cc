/// <reference types="cypress" />
import { Cypress, cy } from "local-cypress";

Cypress.Commands.add("getByData", (dataName: string) => {
  cy.get(`[data-cy="${dataName}"]`);
});

declare global {
  namespace Cypress {
    interface Chainable {
      getByData(subject: string): Chainable<Element>;
    }
  }
}

export {}; // solves ts isolatedModules
