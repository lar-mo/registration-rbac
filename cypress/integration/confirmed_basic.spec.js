//////////////////////////////////////
//
// Author: Larry Moiola
// Date: Jan 19, 2021
// Filename: confirmed_basic.spec.js
//
//////////////////////////////////////

// const domain_under_test = 'https://www.registration-rbac.com/' // PRODUCTION
const domain_under_test = 'http://localhost:8000/'                // DEV

describe('Basic/confirmed', () => {

  beforeEach(() => {

    cy.visit(domain_under_test)
    cy.get('.navbar').contains('Login').click()
    cy.get('[action="/login_user/"] > [type="text"]')
      .type('confirmed_user')
      .should('have.value', 'confirmed_user')
    cy.get('[action="/login_user/"] > [type="password"]')
      .type('test01')
      .should('have.value', 'test01')
    cy.get('[action="/login_user/"] > .status_block > button').click()

  }) // end of 'beforeEach'

  it('Homepage', () => {

    // HEADER
    // Note: Homepage not shown by design)
    // Logout: /logout_user/
    cy.get('.navbar > a').should('contain', 'Logout')
      .should('have.attr', 'href')
      .should('eq', '/logout_user/')


    // BODY
    // image: pigs_all_three0-basic_color.png
    cy.get('.page_image').find('img')
      .should('have.attr', 'src')
      .should('contain', 'pigs_all_three0-basic_color.png')
    // label: You have a Basic membership.
    cy.get('.memberlevel').should('contain', 'You have a Basic membership.')

    // h1: Unsecured page, anonymous ok
    cy.get('.page_content > h1').should('contain', 'Unsecured page, anonymous ok')

    // h2: Hello confirmed_user (/my_profile/)
    cy.get('.page_content > h2').should('contain', 'Hello confirmed_user')
    cy.get('.page_content > h2 > a')
      .should('have.attr', 'href', '/my_profile/')

    // h3: Secured Page version 1 (/special_page/)
    cy.get('.page_content > :nth-child(3)').should('contain', 'Go to: Secured Page version 1')
    cy.get('.page_content > :nth-child(3)').find('a')
      .should('have.attr', 'href', '/special_page/')

    // h3: Secured Page version 2 (/special_page2)
    cy.get('.page_content > :nth-child(4)').should('contain', 'Go to: Secured Page version 2')
    cy.get('.page_content > :nth-child(4) > a')
      .should('have.attr', 'href', '/special_page2/')

    // h3: Go to: Plus (/plus/)
    cy.get('.page_content > :nth-child(5)').should('contain', 'Go to: Plus')
    cy.get('.page_content > :nth-child(5) > a')
      .should('have.attr', 'href', '/plus/')

    // h3: Go to: Premium (/premium/)
    cy.get('.page_content > :nth-child(6)').should('contain', 'Go to: Premium')
    cy.get('.page_content > :nth-child(6) > a')
      .should('contain', 'Premium')
      .should('have.attr', 'href', '/premium/')

  }) // end of 'Homepage'

  it('Special page 1', () => {

    cy.visit(domain_under_test + 'special_page/')
    // HEADER
    // Homepage: /
    cy.get('.navbar').should('contain', 'Homepage')
    cy.get('.navbar > :nth-child(1)')
      .should('have.attr', 'href', '/')

    // Logout: /logout_user/
    cy.get('.navbar').should('contain', 'Logout')
    cy.get('.navbar > :nth-child(2)')
      .should('have.attr', 'href', '/logout_user/')

    // BODY
    // image: special_page_confirmed.png
    cy.get('.page_image').find('img')
      .should('have.attr', 'src')
      .should('contain', 'special_page_confirmed.png')

    // h1: Secured page version 1, verified account required
    cy.get('.page_content > h1').should('contain', 'Secured page version 1, verified account required')

    // h2: Hello confirmed_user (/my_profile/)
    cy.get('.page_content > h2').should('contain', 'Hello confirmed_user')
      .find('a')
      .should('contain', 'confirmed_user')
      .should('have.attr', 'href', '/my_profile/')

    // h3: Go to: Unsecured Page (/)
    cy.get('.page_content > :nth-child(3)').should('contain', 'Go to: Unsecured Page')
      .find('a')
      .should('contain', 'Unsecured Page')
      .should('have.attr', 'href', '/')

    // h3: Go to: Secured Page version 2 (/special_page2/)
    cy.get('.page_content > :nth-child(4)').should('contain', 'Go to: Secured Page version 2')
      .find('a')
      .should('contain', 'Secured Page')
      .should('have.attr', 'href', '/special_page2/')

  }) // end of 'Special page 1'

  it('Special page 2', () => {

    cy.visit(domain_under_test + 'special_page2/')
    // HEADER
    // Homepage: /
    cy.get('.navbar').should('contain', 'Homepage')
    cy.get('.navbar > :nth-child(1)')
      .should('have.attr', 'href', '/')

    // Logout: /logout_user/
    cy.get('.navbar').should('contain', 'Logout')
    cy.get('.navbar > :nth-child(2)')
      .should('have.attr', 'href', '/logout_user/')

    // BODY
    // image: special_page_confirmed.png
    cy.get('.page_image').find('img')
      .should('have.attr', 'src')
      .should('contain', 'special_page_confirmed.png')

    // h1: Secured page version 1, verified account required
    cy.get('.page_content > h1').should('contain', 'Secured page version 2, verified account required')

    // h2: Hello confirmed_user (/my_profile/)
    cy.get('.page_content > h2').should('contain', 'Hello confirmed_user')
      .find('a')
      .should('contain', 'confirmed_user')
      .should('have.attr', 'href', '/my_profile/')

    // h3: Go to: Unsecured Page (/)
    cy.get('.page_content > :nth-child(3)').should('contain', 'Go to: Unsecured Page')
      .find('a')
      .should('contain', 'Unsecured Page')
      .should('have.attr', 'href', '/')

    // h3: Go to: Secured Page version 1 (/special_page/)
    cy.get('.page_content > :nth-child(4)').should('contain', 'Go to: Secured Page version 1')
      .find('a')
      .should('contain', 'Secured Page')
      .should('have.attr', 'href', '/special_page/')

  }) // end of 'Special page 2'

  it('Plus', () => {

    cy.visit(domain_under_test + 'plus/')

    // redirect to upsell?message=redir_from_plus
    cy.url().should('contain', 'upsell/?message=redir_from_plus')

  }) // end of 'Plus'

  it('Premium', () => {

    cy.visit(domain_under_test + 'premium/')

    // redirect to upsell?message=redir_from_premium
    cy.url().should('contain', 'upsell/?message=redir_from_premium')

  }) // end of 'Premium'

}) // end of 'Describe'
