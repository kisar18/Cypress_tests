import domData from '../fixtures/iDoklad.json';

describe('i-Doklad', () => {
  it('Sorting', {
    //retries: 1,
    //runMode: 1
  }, () => {
    cy.intercept('https://www.clarity.ms/**', {
      statusCode: 403,
    }).as('blockClarity');

    cy.visit('https://app.idoklad.cz/Account/Login', { timeout: 10000})

    // Login
    cy.get('.login-wrapper > .row > div > input').as('email').should('exist')
    cy.get('@email').type(domData.email)
    cy.get('.login-wrapper > :nth-child(3) > div > div > input').as('password').should('exist')
    cy.get('@password').type(domData.password)
    cy.get('.login-wrapper > :nth-child(4) > div > button').as('loginButton').should('exist')
    cy.intercept('POST', '/api/Account/Login').as('loginTime');
    cy.get('@loginButton').click()
    cy.wait('@loginTime', { timeout: 5000 })

    // Close tip dialog
    cy.get('.dialog-buttons > div > button').as('closeTipButton').should('exist')
    cy.get('@closeTipButton').click()

    // Go to contacts
    cy.get('.menu > ul').find('div').contains('Adresář').as('contacts').should('exist')
    cy.get('@contacts').click()
    cy.get('.heading-wrapper').find('h1').as('sectionTitle').should('exist')
    cy.get('@sectionTitle').contains('Kontakty')

    // Create new contact
    cy.get('[role="tabpanel"]').find('button').as('createContact').should('exist')
    cy.get('@createContact').click()
    cy.get('@sectionTitle').contains('Nový kontakt')

    cy.get('[name="CompanyName"]').as('companyName').should('exist')
  })
})