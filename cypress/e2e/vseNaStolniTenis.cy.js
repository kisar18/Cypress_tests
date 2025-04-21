import tables from '../fixtures/vseNaStolniTenis/tables.json'
import domData from '../fixtures/vseNaStolniTenis/domData.json'
import languages from '../fixtures/vseNaStolniTenis/languages.json'

Cypress.on('uncaught:exception', () => {
  return false
})

describe('Vse na stolni tenis', () => {
  beforeEach(() => {
    cy.visit('https://www.vsenastolnitenis.cz/', { timeout: 15000 })
  
    // Decline cookies
    cy.get('#consentNone').should('exist').click()
  })

  it('Sorting tables by price', () => {

    // Tables
    cy.get('#navBarWithMegaMenu').find('li.nav-item').contains(domData.categories[1]).should('exist').click({ force: true })

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

  it('Filtering tables by brand', () => {

    // Tables
    cy.get('#catmenu1').contains(domData.categories[1]).should('exist').click({ force: true })

    cy.get('div[data-name="znacka"] > div > ul > li').contains(tables[0].brand).as('firstBrand').should('exist')
    cy.get('div[data-name="znacka"] > div > ul > li').contains(tables[1].brand).as('secondBrand').should('exist')
    cy.get('div[data-name="znacka"] > div > ul > li').contains(tables[2].brand).as('thirdBrand').should('exist')

    cy.get('@firstBrand').click()
    cy.get('.pp-cat-item > a > .pp-pbody > .pp-titlebox').each(($el) => {
      cy.wrap($el).should('contain.text', tables[0].brand)
    })
    
    cy.get('@firstBrand').click()
    cy.get('@secondBrand').click()
    cy.get('.pp-cat-item > a > .pp-pbody > .pp-titlebox').each(($el) => {
      cy.wrap($el).should('contain.text', tables[1].brand)
    })

    cy.get('@secondBrand').click()
    cy.get('@thirdBrand').click()
    cy.get('.pp-cat-item > a > .pp-pbody > .pp-titlebox').each(($el) => {
      cy.wrap($el).should('contain.text', tables[2].brand)
    })
  })

  it('Check contact info of all stores', () => {

    // Go to contacts page
    cy.get('#navBarWithDropdown').find('li.nav-item').contains(domData.headerMenuItems[2]).should('exist').click({ force: true })

    // Check the number of stores
    cy.get('.pp-blog-item').as('stores').should('exist')
    cy.get('@stores').should('have.length', domData.stores.length)

    // Check the info of each store
    cy.get('@stores').each(($el, index) => {
      cy.wrap($el).should('contain.text', domData.stores[index].name)
      cy.wrap($el).should('contain.text', domData.stores[index].street)
      cy.wrap($el).should('contain.text', domData.stores[index].city)
      cy.wrap($el).invoke('text')
      .then((text) => {
        const cleanedText = text.replace(/\s+/g, ' ').trim()
        expect(cleanedText).to.contain(domData.stores[index].openingHours)
      })
    })
  })

  it('Language translations', () => {

    // Iterate trough all the languages
    languages.forEach((language, index) => {

      // Check the URL
      cy.url().should('eq', language.url)

      // Check the title
      cy.title().should('eq', language.title)

      // Check search field placeholder
      cy.get('#desktopsearch > form > input[type="search"]').as('searchField').should('exist')
      cy.get('@searchField').should('have.attr', 'placeholder', language.searchPlaceholder)

      // Check description of the flag image
      cy.get('#languageChooser').as('flag').should('exist')
      cy.get('@flag').find('#flag > img').should('have.attr', 'alt', language.flagAlt)

      // Change the language
      cy.get('@flag').click()
      cy.get('#languageDropdown').as('otherLanguages').should('be.visible')
      cy.get('@otherLanguages').find('.btn').should('have.length', languages.length - 1)

      if(index !== languages.length - 1) {
        cy.intercept('GET', '**/api/v1/widget/translations/lang/**').as('reloadTime')
        cy.get('@otherLanguages').find('.btn').eq(index).click()
        cy.wait('@reloadTime')
      }
    })
  })
})