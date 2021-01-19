// const domain_under_test = 'https://www.registration-rbac.com/' // PRODUCTION
const domain_under_test = 'http://localhost:8000/'                // DEV

describe('Login', () => {
  beforeEach(() => {
    cy.visit(domain_under_test)
    cy.get('.navbar').contains('Login').click()
  })

  it('Login as Basic user', () => {

    // Login as Basic (confirmed) user
    cy.get('[action="/login_user/"] > [type="text"]').type('confirmed_user').should('have.value', 'confirmed_user')
    cy.get('[action="/login_user/"] > [type="password"]').type('test01').should('have.value', 'test01')
    cy.get('[action="/login_user/"] > .status_block > button').click()

    // Redirect to homepage if already logged in
    cy.visit(domain_under_test + 'register_login/')
    cy.url().should('equal', domain_under_test)

  }) // end of 'Login as Basic user'

  it('Invalid Login Credentials', () => {

    // try to login with incorrect password
    cy.get('[action="/login_user/"] > [type="text"]').type('confirmed_user').should('have.value', 'confirmed_user')
    cy.get('[action="/login_user/"] > [type="password"]').type('wrong').should('have.value', 'wrong')
    cy.get('[action="/login_user/"] > .status_block > button').click()

    // show error message
    cy.get('.navbar > a').should('contain', 'Homepage')
      .should('have.attr', 'href')
      .should('contain', '/')
    cy.get('.red_white_banner').should('contain', 'Your username and password did not match.')

  }) // end of 'Invalid Login Credentials'

  it('Username already in-use', () => {

    // try to register with existing username
    cy.get('[action="/register_user/"] > [name="username"]').type('confirmed_user').should('have.value', 'confirmed_user')
    cy.get('[action="/register_user/"] > [name="email"]').type('lmoiola@gmail.com').should('have.value', 'lmoiola@gmail.com')
    cy.get('#input_password').type('test01').should('have.value', 'test01')
    cy.get('#input_password2').type('test01').should('have.value', 'test01')
    cy.get('#bt_register').click()

    // show error message
    cy.get('.navbar > a').should('contain', 'Homepage')
      .should('have.attr', 'href')
      .should('eq', '/')
    cy.get('.red_white_banner').should('contain', 'That username is already in-use. Try again.')

  }) // end of 'Username already in-use'

  it('Plus', () => {

    cy.visit(domain_under_test + 'plus/')
    cy.url()
      .should('contain', '/register_login/')
      .should('contain', '?message=login_required')
      .should('contain', '&next=/plus/')
    cy.get('.blue_white_banner').should('contain', 'You must be logged in.')

  }) // end of 'Plus'

  it('Premium', () => {

    cy.visit(domain_under_test + 'premium/')
    cy.url()
      .should('contain', '/register_login/')
      .should('contain', '?message=login_required')
      .should('contain', '&next=/premium/')
    cy.get('.blue_white_banner').should('contain', 'You must be logged in.')

  }) // end of 'Premium'

}) // end of 'describe'
