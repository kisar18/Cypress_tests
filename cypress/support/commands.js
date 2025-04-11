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
Cypress.Commands.add('getByDataUiId', (data_ui_id) => {
  cy.get(`[data-ui-id="${data_ui_id}"]`)
})

Cypress.Commands.add('login', (email, password) => {
  cy.session([email, password], () => {

    cy.visit('https://app.idoklad.cz/Account/Login', { timeout: 15000 })
    cy.getByDataUiId('csw-username').as('email').should('exist')
    cy.get('@email').type(email)
    cy.getByDataUiId('csw-password').as('password').should('exist')
    cy.get('@password').type(password)
    cy.getByDataUiId('csw-login-button').as('loginButton').should('exist')
    cy.intercept('GET', '**/api/Billing/GetDashboardSubscription').as('loginTime')
    cy.get('@loginButton').click()
    cy.wait('@loginTime', { timeout: 15000 })

    // Close tip dialog
    cy.get('.dialog-buttons > div > button').as('closeTipButton').should('exist')
    cy.get('@closeTipButton').click()
  })
})

Cypress.Commands.add('addEmptyContact', (contact) => {
  cy.getByDataUiId('csw-new-item').click()
  cy.getByDataUiId('csw-new-item-contact').as('createContact').should('exist')
  cy.get('@createContact').click()
  cy.get('.heading-wrapper').find('h1').as('sectionTitle').should('exist')
  cy.get('@sectionTitle').contains('Nový kontakt')

  cy.get('[name="CompanyName"]').as('companyName').should('exist')
  cy.get('@companyName').type(contact.name)
  
  cy.getByDataUiId('csw-save-new-contact').as('saveNewContact').should('exist')
  cy.intercept('POST', '**/api/Contact/Create').as('saveContactTime')
  cy.get('@saveNewContact').click()
  cy.get('.errors-wrapper').should('not.exist')
  cy.getByDataUiId('csw-toast-message').should('be.visible').and('contain', contact.name)
  cy.wait('@saveContactTime')
})

Cypress.Commands.add('createTempEmail', () => {
  const domainUrl = 'https://api.mail.tm'
  const password = 'SuperSecret123!'

  // Get available domains
  return cy.request(`${domainUrl}/domains`).then((domainRes) => {
    const domain = domainRes.body['hydra:member'][0].domain
    const randomName = `user_${Date.now()}`
    const address = `${randomName}@${domain}`

    // Create an account
    return cy.request('POST', `${domainUrl}/accounts`, {
      address,
      password
    }).then(() => {
      // Login and get the token
      return cy.request('POST', `${domainUrl}/token`, {
        address,
        password
      }).then((loginRes) => {
        const token = loginRes.body.token
        return { address, token }
      })
    })
  })
})

Cypress.Commands.add('waitForEmail', (token, retries = 10) => {
  if (retries === 0) {
    throw new Error('E-mail nedorazil ani po několika pokusech')
  }

  return cy.request({
    method: 'GET',
    url: 'https://api.mail.tm/messages',
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then((res) => {
    const messages = res.body['hydra:member']

    if (!messages.length) {
      cy.wait(2000)
      return cy.waitForEmail(token, retries - 1)
    }

    const emailId = messages[0].id

    return cy.request({
      method: 'GET',
      url: `https://api.mail.tm/messages/${emailId}`,
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then((emailRes) => emailRes.body)
  })
})
