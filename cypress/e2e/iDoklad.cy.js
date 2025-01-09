import loginData from '../fixtures/iDoklad/login.json'
import contacts from '../fixtures/iDoklad/contacts.json'

describe('i-Doklad', () => {
  beforeEach(() => {
    cy.intercept('https://www.clarity.ms/**', {
      statusCode: 403,
    }).as('blockClarity')

    cy.visit('https://app.idoklad.cz/Account/Login', { timeout: 10000 })

    // Login
    cy.get('.login-wrapper > .row > div > input').as('email').should('exist')
    cy.get('@email').type(loginData.email)
    cy.get('.login-wrapper > :nth-child(3) > div > div > input').as('password').should('exist')
    cy.get('@password').type(loginData.password)
    cy.get('.login-wrapper > :nth-child(4) > div > button').as('loginButton').should('exist')
    cy.intercept('POST', '**/api/Account/Login').as('loginTime')
    cy.get('@loginButton').click()
    cy.wait('@loginTime', { timeout: 5000 })

    // Close tip dialog
    cy.get('.dialog-buttons > div > button').as('closeTipButton').should('exist')
    cy.get('@closeTipButton').click()
  })

  it.only('Create contact', {
    //retries: 1,
    //runMode: 1
  }, () => {

    // Open new contact form
    cy.get('[data-ui-id="csw-new-item"]').click()
    cy.get('[data-ui-id="csw-new-item-contact"]').as('createContact').should('exist')
    cy.get('@createContact').click()
    cy.get('.heading-wrapper').find('h1').as('sectionTitle').should('exist')
    cy.get('@sectionTitle').contains('Nový kontakt')

    cy.get('[data-ui-id="csw-save-new-contact"]').as('saveContact').should('exist')
    cy.get('@saveContact').click()
    cy.get('.errors-wrapper').as('validations').should('be.visible')

    cy.get('[name="CountryId"]').parent().find('button').as('country').should('exist')
    cy.get('@country').click()
    cy.get('.k-list-filter').as('countrySearch').should('exist')
    cy.get('@countrySearch').type(contacts[0].countrySearchValue)
    cy.get('ul[role="listbox"]').find('li').as('targetCountry').should('have.length', 1)
    cy.get('@targetCountry').should('contain', contacts[0].country).click()
    cy.get('[name="CompanyName"]').as('companyName').should('exist')
    cy.get('@companyName').type(contacts[0].name)
    cy.get('[name="IdentificationNumber"]').as('identificationNumber').should('exist')
    cy.get('@identificationNumber').type(contacts[0].identificationNumber)

    cy.intercept('POST', '**/api/Contact/Create').as('saveContactTime')
    cy.get('@saveContact').click()
    cy.wait('@saveContactTime')
    cy.get('.errors-wrapper').should('not.exist')
    cy.get('[data-ui-id="csw-toast-message"]').should('be.visible').and('contain', contacts[0].name)
  })

  it('Edit contact', {
    //retries: 1,
    //runMode: 1
  }, () => {
    // Go to contacts
    cy.intercept('GET', '**/api/Contact/ReadAjax**').as('getContactsTime')
    cy.get('[data-ui-id="csw-side-menu-address-book"]').should('exist').click()
    cy.wait('@getContactsTime')

    // Edit contact
    cy.get('[data-ui-id="csw-row-action-edit"]').as('editContact').should('exist')
    cy.get('@editContact').click()

    cy.get('[name="CountryId"]').parent().find('button').as('country').should('exist')
    cy.get('@country').click()
    cy.get('.k-list-filter').as('countrySearch').should('exist')
    cy.get('@countrySearch').type(contacts[1].countrySearchValue)
    cy.get('ul[role="listbox"]').find('li').as('targetCountry').should('have.length', 1)
    cy.get('@targetCountry').should('contain', contacts[1].country).click()
    cy.get('[name="CompanyName"]').as('companyName').should('exist')
    cy.get('@companyName').clear().type(contacts[1].name)
    cy.get('[name="IdentificationNumber"]').as('identificationNumber').should('exist')
    cy.get('@identificationNumber').clear().type(contacts[1].identificationNumber)

    cy.get('[name="Street"]').as('street').should('exist')
    cy.get('@street').clear().type(contacts[1].street)
    cy.get('[name="PostalCode"]').as('postalCode').should('exist')
    cy.get('@postalCode').clear().type(contacts[1].postalCode)
    cy.get('[name="City"]').as('city').should('exist')
    cy.get('@city').clear().type(contacts[1].city)

    // Save contact
    cy.get('[data-ui-id="csw-save-new-contact"]').as('saveContact').should('exist')
    cy.intercept('POST', '**/api/Contact/Update').as('saveContactTime')
    cy.get('@saveContact').click()
    cy.wait('@saveContactTime')
  })

  it('Delete contact', {
    //retries: 1,
    //runMode: 1
  }, () => {

    // Go to contacts
    cy.intercept('GET', '**/api/Contact/ReadAjax**').as('getContactsTime')
    cy.get('[data-ui-id="csw-side-menu-address-book"]').should('exist').click()
    cy.wait('@getContactsTime')
    
    // Delete contact
    cy.get('[data-ui-id="csw-company-name"]').as('myContact').should('have.length', 1)
    cy.get('@myContact').should('contain', contacts[1].name)
    cy.get('[data-ui-id="csw-row-action-show-more-action"]').as('moreActions').should('exist')
    cy.get('@moreActions').click()
    cy.get('[data-ui-id="csw-row-action-delete"]').as('deleteContact').should('exist')
    cy.get('@deleteContact').click()
    cy.intercept('POST', '**/api/Contact/DeleteRecords').as('deleteContactTime')
    cy.get('[data-ui-id="csw-dialog-confirm"]').should('exist').click()
    cy.wait('@deleteContactTime')

    cy.get('[data-ui-id="csw-grid"]').find('span').contains('Seznam neobsahuje žádné položky').should('exist')
  })
})