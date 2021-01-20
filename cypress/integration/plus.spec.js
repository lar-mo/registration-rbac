//////////////////////////////////////
//
// Author: Larry Moiola
// Date: Jan 19, 2021
// Filename: plus.spec.js
//
//////////////////////////////////////

// const domain_under_test = 'https://www.registration-rbac.com/' // PRODUCTION
const domain_under_test = 'http://localhost:8000/'                // DEV

describe('Plus', () => {

  beforeEach(() => {

    cy.visit(domain_under_test + 'register_login/?next=')
    cy.get('[action="/login_user/"] > [type="text"]')
      .type('plus_user').should('have.value', 'plus_user')
    cy.get('[action="/login_user/"] > [type="password"]')
      .type('test01').should('have.value', 'test01')
    cy.get('[action="/login_user/"] > .status_block > button').click()

  })

  it('Plus page', () => {

    cy.visit(domain_under_test + 'plus/')

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
    // image: pigs_all_three1-plus_color.png
    cy.get('.page_image').find('img')
      .should('have.attr', 'src')
      .should('contain', 'pigs_all_three1-plus_color.png')
    cy.get('.memberlevel').should('contain', 'You have a Plus membership which expires on')
    // date: Sep 30, 2021. (check: format, in the future-check year first, then month, then day)

    // h1: Secured page version 1, verified account required
    cy.get('.page_content > h1').should('contain', 'Plus page')

    // h2: Hello confirmed_user (/my_profile/)
    cy.get('.page_content > h2').should('contain', 'Hello PlusUser')
      .find('a')
      .should('contain', 'PlusUser')
      .should('have.attr', 'href', '/my_profile/')

    // h3: You have a Plus membership.
    cy.get('.page_content > h3').should('contain', 'You have a Plus membership.')

    // h3: Valid until 9/29/2021, 4:00:00 PM
    cy.get('.page_content > h3').should('contain', 'Valid until')
    // date: 9/29/2021, 4:00:00 PM. (check: format, in the future-check year first, then month, then day)

  })

  it('Premium page', () => {

    cy.visit(domain_under_test + 'premium/')

    // Message banner when redirecte back to Plus page
    cy.url().should('contain', '/plus/?message=redir_from_premium')
    cy.get('.orange_black_banner').should('contain', 'Are you looking for the Premium page? Click here to upgrade.')
    cy.get('.orange_black_banner > a')
      .should('have.attr', 'href')
      .should('contain', '/upsell/')

  })

})
