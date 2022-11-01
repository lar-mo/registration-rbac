//////////////////////////////////////
//
// Author: Larry Moiola
// Filename: clc_link.spec.js
//
// Valid Code: 16fe74d9f9b318900ae7091f8dff84d2, exp 2023-01-24 (user: valid_clc)
//  e.g. http://localhost:8000/confirmation/?clc_code=16fe74d9f9b318900ae7091f8dff84d2
// Invalid Code: 1a2b3c4d5e6f7g8h9i0j9k8l7m6n5o4p (user: expired_clc)
//  e.g. http://localhost:8000/confirmation/?clc_code=1a2b3c4d5e6f7g8h9i0j9k8l7m6n5o4p
// Expired Code: 82a8e94db003952d538fe813baf271d9, exp 2020-01-24 (user: expired_clc)
//  e.g. http://localhost:8000/confirmation/?clc_code=82a8e94db003952d538fe813baf271d9
//
//////////////////////////////////////

const domain_under_test = Cypress.env('host')

const valid_code = '16fe74d9f9b318900ae7091f8dff84d2'
const invalid_code = '1a2b3c4d5e6f7g8h9i0j9k8l7m6n5o4p'
const expired_code = '82a8e94db003952d538fe813baf271d9'

describe('Confirmation Link', () => {

  it('Valid CLC link', () => {

    // login as 'valid_clc' user
    cy.visit(domain_under_test + 'register_login/?next=')
    cy.get('[action="/login_user/"] > [type="text"]')
      .type('valid_clc').should('have.value', 'valid_clc')
    cy.get('[action="/login_user/"] > [type="password"]')
      .type('test01').should('have.value', 'test01')
    cy.get('[action="/login_user/"] > .status_block > button').click()

    cy.visit(domain_under_test + 'confirmation/?clc_code=' + valid_code)

    // Message banner when redirected back to Homepage
    cy.url().should('contain', '/?message=confirmed')
    cy.get('.green_white_banner').should('contain', 'Your account is confirmed.')

  }) // end of 'Valid CLC link'

  it('Account Already confirmed', () => {

    // login as 'valid_clc' user
    cy.visit(domain_under_test + 'register_login/?next=')
    cy.get('[action="/login_user/"] > [type="text"]')
      .type('valid_clc').should('have.value', 'valid_clc')
    cy.get('[action="/login_user/"] > [type="password"]')
      .type('test01').should('have.value', 'test01')
    cy.get('[action="/login_user/"] > .status_block > button').click()

    cy.visit(domain_under_test + 'confirmation/?clc_code=' + valid_code)

    // Message banner when redirected back to Homepage
    cy.url().should('contain', '/?message=verified')
    cy.get('.blue_white_banner').should('contain', 'Your account is already verified.')

  }) // end of 'Account Already confirmed'

  it('Invalid CLC link', () => {

    // login as 'valid_clc' user
    cy.visit(domain_under_test + 'register_login/?next=')
    cy.get('[action="/login_user/"] > [type="text"]')
      .type('expired_clc').should('have.value', 'expired_clc')
    cy.get('[action="/login_user/"] > [type="password"]')
      .type('test01').should('have.value', 'test01')
    cy.get('[action="/login_user/"] > .status_block > button').click()

    cy.visit(domain_under_test + 'confirmation/?clc_code=' + invalid_code)

    // Message banner when redirected back to Homepage
    cy.url().should('contain', '/?message=error')
    cy.get('.red_white_banner').should('contain', 'There was a problem confirming your account. Send new key')
    cy.get('.red_white_banner > a')
      .should('contain', 'Send new key')
      .should('have.attr', 'href')
      .should('contain', '/send_new_key/')

  }) // end of 'Invalid CLC link'

  it('Expired CLC link', () => {

    // login as 'expired_clc' user
    cy.visit(domain_under_test + 'register_login/?next=')
    cy.get('[action="/login_user/"] > [type="text"]')
      .type('expired_clc').should('have.value', 'expired_clc')
    cy.get('[action="/login_user/"] > [type="password"]')
      .type('test01').should('have.value', 'test01')
    cy.get('[action="/login_user/"] > .status_block > button').click()

    cy.visit(domain_under_test + 'confirmation/?clc_code=' + expired_code)

    // Message banner when redirected back to Homepage
    cy.url().should('contain', '/?message=expired')
    cy.get('.red_white_banner').should('contain', 'Your confirmation code is expired. Send new key')
    cy.get('.red_white_banner > a')
      .should('contain', 'Send new key')
      .should('have.attr', 'href')
      .should('contain', '/send_new_key/')

  }) // end of 'Expired CLC link'

  it('Send New Link', () => {

    // login as 'expired_clc' user
    cy.visit(domain_under_test + 'register_login/?next=/special_page/')
    cy.get('[action="/login_user/"] > [type="text"]')
      .type('expired_clc').should('have.value', 'expired_clc')
    cy.get('[action="/login_user/"] > [type="password"]')
      .type('test01').should('have.value', 'test01')
    cy.get('[action="/login_user/"] > .status_block > button').click()

    // Message banner when redirected from /special_page/ to Homepage
    cy.url().should('contain', '/?message=pending')
    cy.get('.orange_black_banner').should('contain', 'You need to confirm your account. Send new key')
    cy.get('.orange_black_banner > a')
      .should('contain', 'Send new key')
      .should('have.attr', 'href')
      .should('contain', '/send_new_key/')
    cy.get('.orange_black_banner > a').click()

    cy.url().should('contain', '/?message=resent')
    cy.get('.blue_white_banner').should('contain', 'Your new code was sent.')

  }) // end of 'Send New Link'

// NOT TESTED: Verify new code is generated, sent to user's email, and is valid for more 3 days.

}) // end of 'describe'
