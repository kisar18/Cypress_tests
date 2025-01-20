import loginData from '../fixtures/iDoklad/login.json'
import contacts from '../fixtures/iDoklad/contacts.json'
import domData from '../fixtures/iDoklad/domData.json'
import searchData from '../fixtures/iDoklad/searchData.json'

describe('i-Doklad', () => {
  beforeEach(() => {
    cy.intercept('https://www.clarity.ms/**', {
      statusCode: 403,
    }).as('blockClarity')

    cy.visit('https://app.idoklad.cz/Account/Login', { timeout: 15000 })

    // Login
    cy.login(loginData.email, loginData.password)

    // Close tip dialog
    cy.get('.dialog-buttons > div > button').as('closeTipButton').should('exist')
    cy.get('@closeTipButton').click()
  })

  it('Create contact', {
    retries: 1,
    runMode: 1
  }, () => {

    // Open new contact form
    cy.getByDataUiId('csw-new-item').click()
    cy.getByDataUiId('csw-new-item-contact').as('createContact').should('exist')
    cy.get('@createContact').click()
    cy.get('.heading-wrapper').find('h1').as('sectionTitle').should('exist')
    cy.get('@sectionTitle').contains('Nový kontakt')

    cy.getByDataUiId('csw-save-new-contact').as('saveContact').should('exist')
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
    
    // Check if there is same existing contact
    cy.intercept('GET', `**/api/Contact/CheckEmailDuplicity?contactEmail=&contactIn=${contacts[0].identificationNumber}&contactId=0`).as('checkDupliciteIcoTime')
    cy.intercept('POST', '**/api/Contact/Create').as('saveContactTime')

    cy.get('@saveContact').click()
    cy.wait('@checkDupliciteIcoTime')

    cy.get('@saveContact').then(($btn) => {
      const btnText = $btn.text().trim()
  
      if (btnText === domData.saveDuplicateContact) {
        // Duplicate contact found
        cy.log('Duplicate found, proceeding with "Přesto uložit"')
        cy.get('@saveContact').click({ force: true })
        cy.wait('@saveContactTime', { timeout: 15000 })
      } else {
        // No duplicate found
        cy.log('No duplicate found, proceeding with "Uložit"')
        cy.wait('@saveContactTime')
      }
    })

    cy.get('.errors-wrapper').should('not.exist')
    cy.getByDataUiId('csw-toast-message').should('be.visible').and('contain', contacts[0].name)
  })

  it('Edit first contact', {
    retries: 1,
    runMode: 1
  }, () => {

    // Go to contacts list
    cy.intercept('GET', '**/api/Contact/IndexData').as('getContactsPageTime')
    cy.getByDataUiId('csw-side-menu-address-book').should('exist').click()
    cy.wait('@getContactsPageTime', { timeout: 5000 })

    // Check if there is atleast one existing contact
    cy.get('body').then(($body) => {
      if ($body.find('button[data-ui-id="csw-empty-list-new-item"]').length > 0) {
        cy.addEmptyContact(contacts[0])
      }
    })

    // Edit contact
    cy.get('.k-grid-container > div > div > table[role="presentation"]').as('contactsTable').should('exist')
    cy.get('@contactsTable').find('tr').first().as('selectedContact').should('exist')
    cy.get('@selectedContact').within(() => {
      cy.getByDataUiId('csw-row-action-edit').as('editContact').should('exist')
      cy.get('@editContact').click()
    })

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
    cy.getByDataUiId('csw-save-new-contact').as('saveContact').should('exist')
    cy.intercept('POST', '**/api/Contact/Update').as('saveContactTime')
    cy.get('@saveContact').click()
    cy.wait('@saveContactTime')
    cy.get('.errors-wrapper').should('not.exist')
    cy.getByDataUiId('csw-toast-message').should('be.visible').and('contain', domData.contactEdited)
  })

  it('Delete first contact', {
    retries: 1,
    runMode: 1
  }, () => {

    // Go to contacts list
    cy.intercept('GET', '**/api/Contact/IndexData').as('getContactsPageTime')
    cy.getByDataUiId('csw-side-menu-address-book').should('exist').click()
    cy.wait('@getContactsPageTime', { timeout: 5000 })

    // Check if there is atleast one existing contact
    cy.get('body').then(($body) => {
      if ($body.find('button[data-ui-id="csw-empty-list-new-item"]').length > 0) {
        cy.addEmptyContact(contacts[0])
      }
    })
    
    // Delete contact
    cy.get('.k-grid-container > div > div > table[role="presentation"]').as('contactsTable').should('exist')
    cy.get('@contactsTable').find('tr').first().as('selectedContact').should('exist')

    cy.get('@selectedContact').within(() => {
      cy.getByDataUiId('csw-row-action-show-more-action').as('moreActions').should('exist')
      cy.get('@moreActions').click()
    })
    
    cy.getByDataUiId('csw-row-action-delete').as('deleteContact').should('exist')
    cy.get('@deleteContact').click()

    cy.intercept('POST', '**/api/Contact/DeleteRecords').as('deleteContactTime')
    cy.getByDataUiId('csw-dialog-confirm').should('exist').click()
    cy.wait('@deleteContactTime')

    cy.getByDataUiId('csw-toast-message').should('be.visible').and('contain', domData.contactDeleted)
  })

  it('Search contacts', {
    retries: 1,
    runMode: 1
  }, () => {

    // Go to contacts list
    cy.intercept('GET', '**/api/Contact/IndexData').as('getContactsPageTime')
    cy.intercept('GET', '**/api/Contact/ReadAjax**').as('readContactsPageTime')
    cy.getByDataUiId('csw-side-menu-address-book').should('exist').click()
    cy.wait('@getContactsPageTime', { timeout: 5000 })

    cy.get('body').then(($body) => {
      if ($body.find('button[data-ui-id="csw-empty-list-new-item"]').length > 0) {
        cy.addEmptyContact(contacts[0])
      }
    })
    
    cy.wait('@readContactsPageTime', { timeout: 15000 })
    cy.addContactIfNotPresent(contacts[0])
    cy.addContactIfNotPresent(contacts[3])
    cy.addContactIfNotPresent(contacts[4])

    let allContactsLength

    cy.get('tr.k-master-row').then(($rows) => {
      allContactsLength = $rows.length
    })
    
    // Searching
    cy.getByDataUiId('csw-grid-search').as('searchField').should('exist')
    cy.intercept('GET', '**/api/Contact/ReadAjax**').as('readContactsPageTime')
    cy.get('@searchField').clear().type(searchData[0].input)
    cy.wait('@readContactsPageTime', { timeout: 5000 })
    
    cy.get('tr.k-master-row').should(($rows) => {
      expect($rows.length).to.be.lessThan(allContactsLength)
    })
  })

  it('Filter contacts', {
    retries: 1,
    runMode: 1
  }, () => {

    // Go to contacts list
    cy.intercept('GET', '**/api/Contact/IndexData').as('getContactsPageTime')
    cy.intercept('GET', '**/api/Contact/ReadAjax**').as('readContactsPageTime')
    cy.getByDataUiId('csw-side-menu-address-book').should('exist').click()
    cy.wait('@getContactsPageTime', { timeout: 5000 })

    cy.get('body').then(($body) => {
      if ($body.find('button[data-ui-id="csw-empty-list-new-item"]').length > 0) {
        cy.addEmptyContact(contacts[0])
      }
    })
    
    cy.wait('@readContactsPageTime', { timeout: 15000 })
    cy.addContactIfNotPresent(contacts[0])
    cy.addContactIfNotPresent(contacts[3])
    cy.addContactIfNotPresent(contacts[4])

    // A to Z sorting
    cy.get('th[aria-colindex="2"]').as('sortByName').should('exist')
    cy.get('@sortByName').click()
    cy.get('tr.k-master-row').find('[data-ui-id="csw-company-name"]').then(($contacts) => {
      const contactTexts = $contacts.map((_, el) => Cypress.$(el).text().trim()).get()
      const sortedContacts = [...contactTexts].sort()
      expect(contactTexts).to.deep.equal(sortedContacts)
    })

    // Z to A sorting
    cy.get('@sortByName').click()
    cy.get('tr.k-master-row').find('[data-ui-id="csw-company-name"]').then(($contacts) => {
      const contactTexts = $contacts.map((_, el) => Cypress.$(el).text().trim()).get();
      const sortedContacts = [...contactTexts].sort().reverse()
      expect(contactTexts).to.deep.equal(sortedContacts)
    })
  })
})
