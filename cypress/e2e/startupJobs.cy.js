

describe('StartupJobs', () => {
  it('Sorting', {
    retries: 1,
    runMode: 1
  }, () => {
    cy.visit('https://www.startupjobs.cz/')

    // Accept cookies
    cy.get('.cky-btn-accept').first().should('exist', { timeout: 20000 }).click()

    // Title check
    cy.title().should('eq', 'Práce, která vás posune vpřed | StartupJobs.cz')

    cy.get('.content-center > a').contains('Všechny nabídky práce').as('offers').should('exist')
    cy.get('@offers').click()

    // Sorting
    cy.get('[class="w-full"] > div > button[role="checkbox"]').eq(2).as('onSite').should('exist')
    cy.get('@onSite').click()
  })
})