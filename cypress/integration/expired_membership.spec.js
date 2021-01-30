//////////////////////////////////////
//
// Author: Larry Moiola
// Date: Jan 19, 2021
// Filename: expired_membership.spec.js
//
// Prerequisites for the test:
// Update: clc_reg/membership/expired_plus/type => 'Plus'
// Update: clc_reg/membership/expired_plus/expiration => '<any date in past>'
// Update: clc_reg/membership/expired_premium/type => 'Premium'
// Update: clc_reg/membership/expired_premium/expiration => '<any date in past>'
//
//////////////////////////////////////

const domain_under_test = Cypress.env('host')

describe('Expired Membership', () => {

  it('Plus page', () => {

    // login with expired Plus member
    cy.visit(domain_under_test + 'register_login/?next=/')
    cy.get('[action="/login_user/"] > [type="text"]')
      .type('expired_plus').should('have.value', 'expired_plus')
    cy.get('[action="/login_user/"] > [type="password"]')
      .type('test01').should('have.value', 'test01')
    cy.get('[action="/login_user/"] > .status_block > button').click()

    // visiting the homepage (?next=/) does not downgrade to Basic/Expire in 2099
    cy.get('.memberlevel').should('contain', 'You have a Plus membership')

    // only Plus and Premium enforce membership (i.e. downgrade to Basic/Expire in 2099)
    cy.visit(domain_under_test + 'plus/')

    // check url after redirect to Upsell
    cy.url().should('contain', '/upsell/?message=expired')

    // check banner
    cy.get('.orange_black_banner').should('contain', 'Your membership has expired.')

  }) // end of 'Plus page'

  it('Premium page', () => {

    // login with expired Plus member
    cy.visit(domain_under_test + 'register_login/?next=/my_profile/')
    cy.get('[action="/login_user/"] > [type="text"]')
      .type('expired_premium').should('have.value', 'expired_premium')
    cy.get('[action="/login_user/"] > [type="password"]')
      .type('test01').should('have.value', 'test01')
    cy.get('[action="/login_user/"] > .status_block > button').click()

    // visiting the my_profile (?next=/my_profile/) does not downgrade to Basic/Expire in 2099
    cy.get('.memberlevel').should('contain', 'You have a Premium membership')

    // only Plus and Premium enforce membership (i.e. downgrade to Basic/Expire in 2099)
    cy.visit(domain_under_test + 'premium/')

    // check url after redirect to Upsell
    cy.url().should('contain', '/upsell/?message=expired')

    // check banner
    cy.get('.orange_black_banner').should('contain', 'Your membership has expired.')

  }) // end of 'Premium page'

}) // end of 'Describe'
