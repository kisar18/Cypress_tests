// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
Cypress.Commands.add('login', (email, password) => {
  cy.get('.login-wrapper > .row > div > input').as('email').should('exist')
  cy.get('@email').type(email)
  cy.get('.login-wrapper > :nth-child(3) > div > div > input').as('password').should('exist')
  cy.get('@password').type(password)
  cy.get('.login-wrapper > :nth-child(4) > div > button').as('loginButton').should('exist')
  cy.intercept('GET', '**/api/Billing/GetDashboardSubscription').as('loginTime')
  cy.get('@loginButton').click()
  cy.wait('@loginTime', { timeout: 15000 })
})

Cypress.Commands.add('addEmptyContact', (contact) => {
  cy.get('[data-ui-id="csw-new-item"]').click()
  cy.get('[data-ui-id="csw-new-item-contact"]').as('createContact').should('exist')
  cy.get('@createContact').click()
  cy.get('.heading-wrapper').find('h1').as('sectionTitle').should('exist')
  cy.get('@sectionTitle').contains('Nový kontakt')

  cy.get('[name="CompanyName"]').as('companyName').should('exist')
  cy.get('@companyName').type(contact.name)
  
  cy.get('[data-ui-id="csw-save-new-contact"]').as('saveContact').should('exist')
  cy.intercept('POST', '**/api/Contact/Create').as('saveContactTime')
  cy.get('@saveContact').click()
  cy.wait('@saveContactTime')
  cy.get('.errors-wrapper').should('not.exist')
  cy.get('[data-ui-id="csw-toast-message"]').should('be.visible').and('contain', contact.name)
})