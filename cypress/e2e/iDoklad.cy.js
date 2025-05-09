import loginData from '../fixtures/iDoklad/login.json'
import contacts from '../fixtures/iDoklad/contacts.json'
import domData from '../fixtures/iDoklad/domData.json'
import searchData from '../fixtures/iDoklad/searchData.json'

let startTime

describe('i-Doklad', () => {
  beforeEach(() => {
    startTime = Date.now()

    cy.intercept('https://www.clarity.ms/**', {
      statusCode: 403,
    }).as('blockClarity')

    // Login
    cy.iDokladLogin(loginData.email, loginData.password)

    cy.addEmptyContact(contacts[0])
    cy.addEmptyContact(contacts[3])
    cy.addEmptyContact(contacts[4])

    cy.intercept('GET', '**/api/Dashboard/UnpaidInvoices**').as('loadHomeTime')
    cy.getByDataUiId('csw-side-menu-home').should('exist').click()
    cy.wait('@loadHomeTime')
  })

  afterEach(() => {
    // Go to contacts list
    cy.visit('https://app.idoklad.cz/', { timeout: 15000 })
    
    cy.intercept('GET', '**/api/Contact/ReadAjax**').as('readContactsStartTime')
    cy.getByDataUiId('csw-side-menu-address-book').should('exist').click()
    cy.wait('@readContactsStartTime', { timeout: 5000 })

    // Delete all contacts
    cy.get('thead[role="presentation"] > tr > th > input').should('exist').check()
    cy.get('[data-ui-id="csw-grid-delete"] > button').should('exist').click()

    cy.intercept('GET', '**/api/Contact/ReadAjax**').as('readContactsEndTime')
    cy.getByDataUiId('csw-dialog-confirm').should('exist').click()
    cy.wait('@readContactsEndTime', { timeout: 5000 })

    const duration = Date.now() - startTime
    cy.log(`Test duration: ${duration} ms`)
  })

  it('Create contact', () => {

    // Open new contact form
    cy.getByDataUiId('csw-new-item').click()
    cy.getByDataUiId('csw-new-item-contact').as('createContact').should('exist')
    cy.get('@createContact').click()
    cy.get('.heading-wrapper').find('h1').as('sectionTitle').should('exist')
    cy.get('@sectionTitle').contains('Nový kontakt')

    cy.getByDataUiId('csw-save-new-contact').as('saveNewContact').should('exist')
    cy.get('@saveNewContact').click()
    cy.get('.errors-wrapper').as('validations').should('be.visible')

    cy.get('[name="CountryId"]').parent().find('button').as('country').should('exist')
    cy.get('@country').click()
    cy.get('.k-list-filter').as('countrySearch').should('exist')
    cy.get('@countrySearch').type(contacts[2].countrySearchValue)
    cy.get('ul[role="listbox"]').find('li').as('targetCountry').should('have.length', 1)
    cy.get('@targetCountry').should('contain', contacts[2].country).click()
    cy.get('[name="CompanyName"]').as('companyName').should('exist')
    cy.get('@companyName').type(contacts[2].name)
    cy.get('[name="IdentificationNumber"]').as('identificationNumber').should('exist')
    cy.get('@identificationNumber').type(contacts[2].identificationNumber)

    cy.intercept('GET', '**/api/Contact/ReadAjax**').as('readContactsPageTime')
    cy.get('@saveNewContact').click()
    cy.get('.errors-wrapper').should('not.exist')
    cy.getByDataUiId('csw-toast-message').should('be.visible').and('contain', contacts[2].name)
    cy.wait('@readContactsPageTime', { timeout: 5000 })
  })

  it('Edit first contact', () => {
    
    // Go to contacts list
    cy.intercept('GET', '**/api/Contact/IndexData').as('getContactsPageTime')
    cy.getByDataUiId('csw-side-menu-address-book').should('exist').click()
    cy.wait('@getContactsPageTime', { timeout: 5000 })

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
    cy.getByDataUiId('csw-save-new-contact').as('saveNewContact').should('exist')
    cy.intercept('GET', '**/api/Contact/ReadAjax**').as('readContactsPageTime')
    cy.get('@saveNewContact').click()
    cy.get('.errors-wrapper').should('not.exist')
    cy.getByDataUiId('csw-toast-message').should('be.visible').and('contain', domData.contactEdited)
    cy.wait('@readContactsPageTime', { timeout: 5000 })
  })

  it('Delete first contact', () => {

    // Go to contacts list
    cy.intercept('GET', '**/api/Contact/IndexData').as('getContactsPageTime')
    cy.getByDataUiId('csw-side-menu-address-book').should('exist').click()
    cy.wait('@getContactsPageTime', { timeout: 5000 })
    
    // Delete contact
    cy.get('.k-grid-container > div > div > table[role="presentation"]').as('contactsTable').should('exist')
    cy.get('@contactsTable').find('tr').first().as('selectedContact').should('exist')

    cy.get('@selectedContact').within(() => {
      cy.getByDataUiId('csw-row-action-show-more-action').as('moreActions').should('exist')
      cy.get('@moreActions').click()
    })
    
    cy.getByDataUiId('csw-row-action-delete').as('deleteContact').should('exist')
    cy.get('@deleteContact').click()

    cy.intercept('GET', '**/api/Contact/ReadAjax**').as('readContactsPageTime')
    cy.getByDataUiId('csw-dialog-confirm').should('exist').click()
    cy.getByDataUiId('csw-toast-message').should('be.visible').and('contain', domData.contactDeleted)
    cy.wait('@readContactsPageTime', { timeout: 5000 })
  })

  it('Search contacts', () => {

    // Go to contacts list
    cy.intercept('GET', '**/api/Contact/IndexData').as('getContactsPageTime')
    cy.getByDataUiId('csw-side-menu-address-book').should('exist').click()
    cy.wait('@getContactsPageTime', { timeout: 5000 })

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

      const searchTerm = searchData[0].input.toLowerCase()
      $rows.each((_, row) => {
        const rowText = row.innerText.toLowerCase()
        expect(rowText).to.include(searchTerm)
      })
    })
  })

  it('Sort contacts', () => {

    // Go to contacts list
    cy.intercept('GET', '**/api/Contact/ReadAjax**').as('getContactsPageTime')
    cy.getByDataUiId('csw-side-menu-address-book').should('exist').click()
    cy.wait('@getContactsPageTime', { timeout: 5000 })

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
      const contactTexts = $contacts.map((_, el) => Cypress.$(el).text().trim()).get()
      const sortedContacts = [...contactTexts].sort().reverse()
      expect(contactTexts).to.deep.equal(sortedContacts)
    })
  })
})
