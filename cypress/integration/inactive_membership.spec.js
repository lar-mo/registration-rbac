//////////////////////////////////////
//
// Author: Larry Moiola
// Date: Jan 20, 2021
// Filename: inactive_membership.spec.js
//
// Note: Expiration is checked for Active/Inactive
// Not tested Expired/Inactive membership:
// -- first visit to Plus/Prem: (1) redirected to Upsell/expired; (2) downgrade to Basic/exp 2099
// -- second visit to Plus/Prem: (1) redirected to Account Error page
//
//////////////////////////////////////

// const domain_under_test = 'https://www.registration-rbac.com/' // PRODUCTION
const domain_under_test = 'http://localhost:8000/'                // DEV

describe('Inactive Membership', () => {

  it('Basic page', () => {

    // login with expired Plus member
    cy.visit(domain_under_test + 'register_login/?next=/')
    cy.get('[action="/login_user/"] > [type="text"]')
      .type('inactive_basic').should('have.value', 'inactive_basic')
    cy.get('[action="/login_user/"] > [type="password"]')
      .type('test01').should('have.value', 'test01')
    cy.get('[action="/login_user/"] > .status_block > button').click()

    // visiting the homepage (?next=/) does not enforce membership
    cy.get('.memberlevel').should('contain', 'You have a Basic membership')

    // only Plus and Premium enforce membership:isActive
    cy.visit(domain_under_test + 'plus/')

    // check url after redirect to Upsell
    cy.url().should('contain', '/inactive/')

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
    // image: pigs_all_three0-basic_color.png
    cy.get('.page_image').find('img')
      .should('have.attr', 'src')
      .should('contain', 'pigs_all_three0-basic_color.png')
    cy.get('.memberlevel').should('contain', 'You have a Basic membership.')
    // date: Sep 30, 2021. (check: format, in the future-check year first, then month, then day)

    // h1: Inactive Account page
    cy.get('.page_content > h1').should('contain', 'Inactive Account page')

    // h3: Contact customer service at:
    cy.get('.page_content > h3').should('contain', 'Contact customer service at:')

    // h3: help@domain.com (mailto:lmoiola@gmail.com)
    cy.get('.page_content > h3').should('contain', 'help@domain.com')
      .find('a')
      .should('have.attr', 'href')
      .should('contain', 'mailto:lmoiola@gmail.com')

  }) // end of 'Basic page'

  it('Plus page', () => {

    // login with expired Plus member
    cy.visit(domain_under_test + 'register_login/?next=/my_profile/')
    cy.get('[action="/login_user/"] > [type="text"]')
      .type('inactive_plus').should('have.value', 'inactive_plus')
    cy.get('[action="/login_user/"] > [type="password"]')
      .type('test01').should('have.value', 'test01')
    cy.get('[action="/login_user/"] > .status_block > button').click()

    // visiting the my_profile (?next=/my_profile/) does not enforce membership
    cy.get('.memberlevel').should('contain', 'You have a Plus membership')

    // only Plus and Premium enforce membership:isActive
    cy.visit(domain_under_test + 'plus/')

    // check url after redirect to Inactive
    cy.url().should('contain', '/inactive/')

  }) // end of 'Plus page'

  it('Premium page', () => {

    // login with expired Plus member
    cy.visit(domain_under_test + 'register_login/?next=/my_profile/')
    cy.get('[action="/login_user/"] > [type="text"]')
      .type('inactive_premium').should('have.value', 'inactive_premium')
    cy.get('[action="/login_user/"] > [type="password"]')
      .type('test01').should('have.value', 'test01')
    cy.get('[action="/login_user/"] > .status_block > button').click()

    // visiting the my_profile (?next=/my_profile/) does not enforce membership
    cy.get('.memberlevel').should('contain', 'You have a Premium membership')

    // only Plus and Premium enforce membership:isActive
    cy.visit(domain_under_test + 'premium/')

    // check url after redirect to Inactive
    cy.url().should('contain', '/inactive/')

  }) // end of 'Premium page'

}) // end of 'Describe'
