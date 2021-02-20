//////////////////////////////////////
//
// Author: Larry Moiola
// Date: Jan 19, 2021
// Filename: premium.spec.js
//
//////////////////////////////////////

const domain_under_test = Cypress.env('host')

describe('Premium', () => {

  beforeEach(() => {

    cy.visit(domain_under_test + 'register_login/?next=')
    cy.get('[action="/login_user/"] > [type="text"]')
      .type('premium_user').should('have.value', 'premium_user')
    cy.get('[action="/login_user/"] > [type="password"]')
      .type('test01').should('have.value', 'test01')
    cy.get('[action="/login_user/"] > .status_block > button').click()

  }) // end of 'beforeEach'

  it('Premium page', () => {

    cy.visit(domain_under_test + 'premium/')

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
    // image: pigs_all_three2-premium_color.png
    cy.get('.page_image').find('img')
      .should('have.attr', 'src')
      .should('contain', 'pigs_all_three2-premium_color.png')
    cy.get('.memberlevel').should('contain', 'You have a Premium membership which expires on')
    // date: Sep 30, 2021. (check: format, in the future-check year first, then month, then day)

    // h1: Secured page version 1, verified account required
    cy.get('.page_content > h1').should('contain', 'Premium page')

    // h2: Hello confirmed_user (/my_profile/)
    cy.get('.page_content > h2').should('contain', 'Hello PremiumUser')
      .find('a')
      .should('contain', 'PremiumUser')
      .should('have.attr', 'href', '/my_profile/')

    // h3: You have a Premium membership.
    cy.get('.page_content > h3').should('contain', 'You have a Premium membership.')

    // h3: Valid until 9/29/2021, 4:00:00 PM
    cy.get('.page_content > h3').should('contain', 'Valid until')
    // date: 9/29/2021, 4:00:00 PM. (check: format, in the future-check year first, then month, then day)

  }) // end of 'Premium page'

}) // end of 'describe'
