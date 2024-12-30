import domData from '../fixtures/booking.json';

/*
Useful command for git: git config core.autocrlf true

Přidat:
- run mode, aby to zkusilo 2 krat
*/ 

describe('Booking sign-up', () => {
  it('Sign up', () => {
    cy.visit('https://www.booking.com')

    // Decline cookies
    cy.get('#onetrust-reject-all-handler').should('exist').click()

    // Decline login
    cy.get('[role="dialog"]').find('button').should('exist').click()

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
  });
});