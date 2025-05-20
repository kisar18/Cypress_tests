import domData from '../fixtures/ryanair.json'

describe('TS_02-RyanairSignup', () => {
  it('TC_02_01 - Sign up', () => {
    const startTime = Date.now()

    cy.visit(domData.ryanairUrl)

    // Decline cookies
    cy.get('.cookie-popup-with-overlay__buttons')
      .find('button')
      .contains(domData.declineCookies)
      .should('exist')
      .click()

    // Title check
    cy.title().should('eq', domData.title)

    // Open login/signup portal
    cy.get('button').contains(domData.portal).should('exist').click()

    // Handle iframe
    cy.get('iframe[data-ref="kyc-iframe"]').should('be.visible').then($iframe => {
      const iframeBody = $iframe.contents().find('body')

      cy.wrap(iframeBody).find('button').contains(domData.signUpBtn).as('signupLink').should('exist')
      cy.get('@signupLink').click()

      cy.wrap(iframeBody).find('button').contains(domData.createAccountBtn).as('createAccount').should('exist')

      // Empty fields
      cy.get('@createAccount').click()

      cy.wrap(iframeBody).find('ry-input-d[name="email"] > span').first().as('emailValidation').should('exist').and('be.visible')
      cy.wrap(iframeBody).find('ry-input-d[name="password"] > span').first().as('passwordValidation').should('exist').and('be.visible')

      cy.get('@emailValidation').should('have.text', domData.requiredEmail)
      cy.get('@passwordValidation').should('have.text', domData.requiredPassword)

      // Email field validation
      cy.wrap(iframeBody).find('input[name="email"]').as('emailField').should('exist').and('be.visible')
      cy.get('@emailField').type("email")
      cy.get('@emailValidation').should('be.visible').and('have.text', domData.invalidEmail)

      cy.get('@emailField').clear().type("email@email")
      cy.get('@emailValidation').should('be.visible').and('have.text', domData.invalidEmail)

      cy.get('@emailField').clear().type("email.email")
      cy.get('@emailValidation').should('be.visible').and('have.text', domData.invalidEmail)

      cy.get('@emailField').clear().type("Ema1l@l1amE.com")
      cy.get('@emailValidation').should('not.be.visible')

      // Password field validation
      cy.wrap(iframeBody).find('input[name="password"]').as('passwordField').should('exist').and('be.visible')
      cy.get('@passwordField').type("passwd")
      cy.get('@passwordValidation').should('not.be.visible')

      cy.wrap(iframeBody).find('ry-auth-password-validation > :nth-child(3) > :nth-child(1) > :nth-child(1)').as('oneNumberValidation').should('exist')
      cy.wrap(iframeBody).find('ry-auth-password-validation > :nth-child(4) > :nth-child(1) > :nth-child(1)').as('eightCharactersValidation').should('exist')
      cy.wrap(iframeBody).find('ry-auth-password-validation > :nth-child(5) > :nth-child(1) > :nth-child(1)').as('oneSmallLetterValidation').should('exist')
      cy.wrap(iframeBody).find('ry-auth-password-validation > :nth-child(6) > :nth-child(1) > :nth-child(1)').as('oneBigLetterValidation').should('exist')

      cy.get('@oneNumberValidation').should('have.class', 'icon--error')
      cy.get('@eightCharactersValidation').should('have.class', 'icon--error')
      cy.get('@oneSmallLetterValidation').should('have.class', 'icon--success')
      cy.get('@oneBigLetterValidation').should('have.class', 'icon--error')

      // Create an account
      cy.createTempEmail().then(({ address, token }) => {
        cy.log(`Používám email: ${address}`)

        cy.get('@emailField').clear().type(address)
        cy.get('@passwordField').clear().type("TestPassw0rd")
        cy.get('@createAccount').click({ force: true })

        cy.waitForEmail(token).then((email) => {
          const content = email.text || email.html
          if (!content) throw new Error('E-mail does not contain any HTML')

          const codeRegex = /Your eight-digit security code is:\s*(\d{8})/i
          const match = content.match(codeRegex)

          if (!match || !match[1]) throw new Error('Verification code was not found in the e-mail')

          const verificationCode = match[1]
          cy.log(`Verification code: ${verificationCode}`)

          // Fill the verification code
          cy.get('body').then(() => {
          const selector = 'ry-input-d[formcontrolname="emailVerificationCode"] > div > input'
              
          // Form is inside new iframe
          cy.get('iframe[data-ref="kyc-iframe"]', { timeout: 10000 }).should('be.visible').then($newIframe => {
            const newIframeBody = $newIframe.contents().find('body')

            cy.wrap(newIframeBody)
              .find(selector, { timeout: 10000 })
              .should('exist')
              .type(verificationCode)

            cy.wrap(newIframeBody)
              .find('button[data-ref="email-verification-continue"]')
              .should('exist')
              .click()
            })
          })

          // Check the header on the profile section
          cy.get('button.log-out').contains(domData.logoutBtn).should('exist', { timeout: 10000 })
        })
      })
    })

    cy.then(() => {
      const duration = Date.now() - startTime
      cy.log(`Test duration ${duration} ms`)
    })
  })
})