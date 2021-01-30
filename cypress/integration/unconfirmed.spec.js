//////////////////////////////////////
//
// Author: Larry Moiola
// Date: Jan 19, 2021
// Filename: unconfirmed.spec.js
//
//////////////////////////////////////

const domain_under_test = Cypress.env('host')

describe('Basic/Unconfirmed', () => {

  beforeEach(() => {

    cy.visit(domain_under_test)
    cy.get('.navbar').contains('Login').click()
    cy.get('[action="/login_user/"] > [type="text"]').type('unconfirmed_user').should('have.value', 'unconfirmed_user')
    cy.get('[action="/login_user/"] > [type="password"]').type('test01').should('have.value', 'test01')
    cy.get('[action="/login_user/"] > .status_block > button').click()

  }) // end of 'beforeEach'

  it('Homepage', () => {

    cy.get('.navbar').should('contain', 'Logout')
    cy.get('.navbar > a')
      .should('have.attr', 'href')
      .should('eq', '/logout_user/')
    cy.get('.page_content > h1').should('contain', 'Unsecured page, anonymous ok')
    cy.get('.page_content > h2').should('contain', 'Hello unconfirmed_user')
    cy.get('.page_content > h2 > a')
      .should('have.attr', 'href')
      .should('contain', '/my_profile/')
    cy.get('.page_content > :nth-child(3)').should('contain', 'Secured Page version 1')
    cy.get('.page_content > :nth-child(3)').find('a')
      .should('have.attr', 'href')
      .should('contain', '/special_page/')
    cy.get('.page_content > :nth-child(4)').should('contain', 'Secured Page version 2')
    cy.get('.page_content > :nth-child(4) > a')
      .should('have.attr', 'href')
      .should('contain', '/special_page2/')
    cy.get('.page_content > :nth-child(5)').should('not.exist')
    cy.get('.page_image').find('img')
      .should('have.attr', 'src')
      .should('contain', 'pigs_all_three0-basic_color.png')
    cy.get('.memberlevel').should('contain', 'You have a Basic membership.')

  }) // end of 'Homepage'

  it('Special Pages', () => {

    // Special page
    cy.visit(domain_under_test + 'special_page/')
    // You should be redirected to Homepage with banner
    cy.url().should('include', '?message=pending')
    cy.get('.orange_black_banner').should('contain', 'You need to confirm your account. Send new key')
    cy.get('.orange_black_banner > a')
      .should('have.attr', 'href')
      .should('contain', '/send_new_key/')

    // Special page 2
    cy.visit(domain_under_test + 'special_page2/')
    cy.get('.navbar').should('contain', 'Homepage').should('contain', 'Logout')
    cy.get('.navbar > [href="/"]').should('exist')
    cy.get('[href="/logout_user/"]').should('exist')
    cy.get('h1').should('contain', 'Secured page version 2, verified account required')
    cy.get('.page_content > h2').should('contain', 'Hello unconfirmed_user')
    cy.get('.page_content > :nth-child(3)').should('contain', 'Your account is not confirmed. Send new key')
    cy.get('.page_content > :nth-child(3) > a')
      .should('have.attr', 'href')
      .should('contain', '/send_new_key/')
    cy.get('.page_content > h3').should('contain', 'Go to: Unsecured Page')
    cy.get('.page_content > :nth-child(4) > a')
      .should('have.attr', 'href')
      .should('eq', '/')
    cy.get('.special_page_img')
      .should('have.attr', 'src')
      .should('eq', 'https://lar-mo.com/images/special_page_pending.png')

  }) // end of 'Special Pages'

  it('Member Pages', () => {

    // Plus
    cy.visit(domain_under_test + 'plus/')
    cy.get('.orange_black_banner').should('contain', 'You need to confirm your account. Send new key')
    // Premium
    cy.visit(domain_under_test + 'premium/')
    cy.get('.orange_black_banner').should('contain', 'You need to confirm your account. Send new key')

  }) // end of 'Member Pages'

}) // end of 'describe'
