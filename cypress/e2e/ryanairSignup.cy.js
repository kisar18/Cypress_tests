import domData from '../fixtures/ryanair.json';

/*
Useful command for git: git config core.autocrlf true
*/ 

describe('Ryanair sign-up', () => {
  it('Sign up', {
    retries: {
      runMode: 1,
      openMode: 1
    }
  }, () => {
    cy.visit('https://www.ryanair.com/cz/cs')

    // Decline cookies
    cy.get('.cookie-popup-with-overlay__buttons').find('button').contains(domData.declineCookies).should('exist').click()

    // Title check
    cy.title().should('eq',domData.title)

    cy.get('ry-log-in-button > button').should('exist').click()

    // Handle iframe
    cy.get('iframe[data-ref="kyc-iframe"]').should('be.visible').then(($iframe) => {
      cy.wait(1000)
      const iframeBody = $iframe.contents().find('body')

      cy.wrap(iframeBody).find('button').contains('Registrovat').should('exist').click()
      cy.wrap(iframeBody).find('button').contains('Vytvořit účet').as('createAccount').should('exist').and('be.visible')

      // Empty fields
      cy.get('@createAccount').click()

      cy.wrap(iframeBody).find('ry-input-d[name="email"] > span').first().as('emailValidation').should('exist').and('be.visible')
      cy.wrap(iframeBody).find('ry-input-d[name="password"] > span').first().as('passwordValidation').should('exist').and('be.visible')

      cy.get('@emailValidation').should('have.text', domData.requiredEmail)
      cy.get('@passwordValidation').should('have.text', domData.requiredPassword)

      // Testing email field
      cy.wrap(iframeBody).find('input[name="email"]').as('emailField').should('exist').and('be.visible')
      cy.get('@emailField').type("email")
      cy.get('@emailValidation').should('be.visible').and('have.text', domData.invalidEmail)

      cy.get('@emailField').clear()
      cy.get('@emailField').type("email@email")
      cy.get('@emailValidation').should('be.visible').and('have.text', domData.invalidEmail)

      cy.get('@emailField').clear()
      cy.get('@emailField').type("email.email")
      cy.get('@emailValidation').should('be.visible').and('have.text', domData.invalidEmail)

      cy.get('@emailField').clear()
      cy.get('@emailField').type("Ema1l@l1amE.com")
      cy.get('@emailValidation').should('not.be.visible')

      // Testing password field
      cy.wrap(iframeBody).find('input[name="password"]').as('passwordField').should('exist').and('be.visible')
      cy.get('@passwordField').type("passwd")
      cy.get('@passwordValidation').should('not.be.visible')

      cy.wrap(iframeBody).find('ry-auth-password-validation > :nth-child(3) > :nth-child(1) > :nth-child(1)').as('oneNumberValidation').should('exist').and('have.class', 'icon--error')
      cy.wrap(iframeBody).find('ry-auth-password-validation > :nth-child(4) > :nth-child(1) > :nth-child(1)').as('eightCharactersValidation').should('exist').and('have.class', 'icon--error')
      cy.wrap(iframeBody).find('ry-auth-password-validation > :nth-child(5) > :nth-child(1) > :nth-child(1)').as('oneSmallLetterValidation').should('exist').and('have.class', 'icon--success')
      cy.wrap(iframeBody).find('ry-auth-password-validation > :nth-child(6) > :nth-child(1) > :nth-child(1)').as('oneBigLetterValidation').should('exist').and('have.class', 'icon--error')
    });
  });
});