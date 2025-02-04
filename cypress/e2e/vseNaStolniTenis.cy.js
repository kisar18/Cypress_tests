import tables from '../fixtures/vseNaStolniTenis/tables.json'
import domData from '../fixtures/vseNaStolniTenis/domData.json'

Cypress.on('uncaught:exception', (err, runnable) => {
  return false
})

beforeEach(() => {
  cy.visit('https://www.vsenastolnitenis.cz/', { timeout: 15000 })

  // Decline cookies
  cy.get('#consentNone').should('exist').click()
})

describe('Vse na stolni tenis', () => {
  it('Sorting tables by price', {
    retries: 1,
    runMode: 1
  }, () => {

    // Tables
    cy.get('#navBarWithMegaMenu').find('li.nav-item').contains(domData.navItems[1]).should('exist').click({ force: true })

    cy.get('[class="product_price asc"]').as('sortByPriceAsc').should('exist')
    cy.get('@sortByPriceAsc').click()

    cy.get('.pp-cat-item > a > .pp-pbody > .pp-pricebox > .price')
      .then(($prices) => {
        // Choose first 5 elements
        const firstFivePrices = $prices.slice(0, 5).map((i, el) => {
          return parseFloat(el.innerText.replace(/\s?kč/i, '').replace(/\./g, '').replace(',', '.'))
        }).get()

        // Verify that the prices are sorted ascending
        const sortedPrices = [...firstFivePrices].sort((a, b) => a - b)
        expect(firstFivePrices).to.deep.equal(sortedPrices)
      })

    cy.get('[class="product_price desc"]').as('sortByPriceDesc').should('exist')
    cy.get('@sortByPriceDesc').click()

    cy.get('.pp-cat-item > a > .pp-pbody > .pp-pricebox > .price')
      .then(($prices) => {
        // Choose first 5 elements
        const firstFivePrices = $prices.slice(0, 5).map((i, el) => {
          return parseFloat(el.innerText.replace(/\s?kč/i, '').replace(/\./g, '').replace(',', '.'))
        }).get()

        // Verify that the prices are sorted descending
        const sortedPrices = [...firstFivePrices].sort((a, b) => b - a)
        expect(firstFivePrices).to.deep.equal(sortedPrices)
      })
  })

  it('Filtering tables by brand', {
    retries: 1,
    runMode: 1
  }, () => {

    // Tables
    cy.get('#navBarWithMegaMenu').find('li.nav-item').contains(domData.navItems[1]).should('exist').click({ force: true })

    cy.get('div[data-name="znacka"] > div > ul > li').contains(tables[0].brand).as('firstBrand').should('exist')
    cy.get('@firstBrand').click()

    cy.get('.pp-cat-item > a > .pp-pbody > .pp-titlebox').each(($el) => {
      cy.wrap($el).should('contain.text', tables[0].brand)
    })
  })
})