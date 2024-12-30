import domData from '../fixtures/booking.json';

/*
Useful command for git: git config core.autocrlf true

Přidat:
- run mode, aby to zkusilo 2 krat
*/ 

describe('Booking sign-up', () => {
  it('Sign up', () => {
    cy.visit('https://www.booking.com/');

    // Decline cookies
    cy.get('#onetrust-reject-all-handler').should('exist').click();

    // Title check
    cy.title().should('eq',domData.title);
  });
});