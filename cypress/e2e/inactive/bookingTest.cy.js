import domData from '../../fixtures/booking.json';

/*
Useful command for git: git config core.autocrlf true

Přidat:
- run mode, aby to zkusilo 2 krat
*/ 

describe('Booking', () => {
  it.skip('Sorting', () => {
    cy.visit('https://www.booking.com')

    // Decline cookies
    cy.get('#onetrust-reject-all-handler').should('exist', { timeout: 20000 }).click()

    // Decline login
    cy.get('[role="dialog"]').find('button').should('exist', { timeout: 20000 }).click()

    // Title check
    cy.title().should('eq',domData.title)

    cy.get('[data-testid="destination-container"]').find('input').as('destination').should('exist')
    cy.get('@destination').click()
    cy.get('@destination').type(domData.destination)

    cy.get('[data-testid="date-display-field-start"]').as('startDate').should('exist')
    cy.get('@startDate').click()

    cy.get('span[tabindex="0"]').then(today => {
      cy.wrap(today).click()
      cy.wrap(today).invoke('attr', 'data-date').then(todayDate => {
        if (todayDate) {
          const originalDate = new Date(todayDate)
          const newDate = new Date(originalDate)
          newDate.setDate(originalDate.getDate() + domData.tripDays)
    
          const leavingDateSelector = `span[data-date="${newDate.toISOString().split('T')[0]}"]`
          cy.get(leavingDateSelector).click()
        }
        else {
          cy.log('Attribute data-date is null or not found')
        }
      })
    })
    
    cy.get('button[type="submit"]').as('searchButton').should('exist')
    cy.get('@searchButton').click()
    cy.title().should('match', new RegExp(domData.destination))
    cy.get('div[data-results-container="1"]').as('results').should('exist')

    // Testing sorting
    cy.get('[data-testid="sorters-dropdown-trigger"]').as('sortingDropdown').should('exist')
    cy.get('@sortingDropdown').click({ force: true })
    cy.get('[data-testid="sorters-dropdown"]').as('sortingOptions').should('exist')
    cy.get('[data-id="price"]').as('lowestPriceFirst').should('exist')
    cy.get('@lowestPriceFirst').click()

    cy.get('[data-testid="property-card"]') // Nahraď '.container' a '.item' správnými selektory
      .then(($items) => {
        // Omezit na první 3 elementy
        const firstThreeItems = $items.slice(0, 3)

        // Extrahovat ceny a převést je na čísla
        const prices = [...firstThreeItems].map((item) => {
          const priceText = Cypress.$(item).find('[data-testid="price-and-discounted-price"]').text() // Nahraď '.price' správným selektorem
          return parseFloat(priceText.replace(/[^\d.-]/g, '')) // Odstraní symboly jako "Kč", "$" apod.
        });

        // Zkontrolovat, zda jsou ceny seřazeny od nejnižší po nejvyšší
        const sortedPrices = [...prices].sort((a, b) => a - b)
        expect(prices).to.deep.equal(sortedPrices)
      })
  })
})