//////////////////////////////////////
//
// Author: Larry Moiola
// Date: Jan 19, 2021
// Filename: user_lifecycle.spec.js
//
//////////////////////////////////////

// const domain_under_test = 'https://www.registration-rbac.com/' // PRODUCTION
const domain_under_test = 'http://localhost:8000/'                // DEV
const random_number = Math.floor(Math.random() * 100);
const random_username = "user" + random_number

describe('User Lifecycle', () => {
  // beforeEach(() => {
  //   cy.visit('http://registration-rbac.com')
  // })

  it('Homepage', () => {

    cy.visit(domain_under_test)

    // *** ONLY UNCOMMENT THESE LINES WITH PRODUCTION "domain_under_test"
    // Verify 'www' is added (301) & http-https redirect (302) (done by Flask app)
    // cy.url().should('contain', 'https://www')

    // Verify all page elements; add check Logout link
    cy.get('.navbar > a').should('contain', 'Register or Login')
      .should('have.attr', 'href')
      .should('contain', '/register_login/?next=')
    cy.get('.page_content > h1').should('contain', 'Unsecured page, anonymous ok')
    cy.get('.page_content > h2').should('contain', 'Hello friend')
    cy.get('.page_image').find('img')
      .should('have.attr', 'src')
      .should('contain', 'pigs_all_three-anonymous.png')

  }) // end of 'Homepage'

  it('Register', () => {

    cy.visit(domain_under_test + 'register_login/')
    cy.get('[action="/register_user/"] > [name="username"]').type(random_username).should('have.value', random_username)
    cy.get('[action="/register_user/"] > [name="email"]').type('lmoiola@gmail.com').should('have.value', 'lmoiola@gmail.com')
    cy.get('#input_password').type('test01').should('have.value', 'test01')
    cy.get('#input_password2').type('test01').should('have.value', 'test01')
    cy.get('#bt_register').click()
    cy.get('.navbar').should('contain', 'Logout')
    cy.get('.page_content > h1').should('contain', 'Unsecured page, anonymous ok')
    cy.get('.page_content > h2').should('contain', 'Hello ' + random_username)
    cy.get('.page_content > h3').should('contain', 'Secured Page version 1')
    cy.get('.page_content > h3').should('contain', 'Secured Page version 2')
    cy.get('.page_image').find('img')
      .should('have.attr', 'src')
      .should('contain', 'pigs_all_three0-basic_color.png')
  }) // end of 'Register'

  it('Special Pages', () => {

    cy.visit(domain_under_test + 'register_login/?next=/special_page/')

    // Login with unconfirmed account
    cy.get('[action="/login_user/"] > [type="text"]').type('unconfirmed_user').should('have.value', 'unconfirmed_user')
    cy.get('[action="/login_user/"] > [type="password"]').type('test01').should('have.value', 'test01')
    cy.get('[action="/login_user/"] > .status_block > button').click()

    // Verify all page elements
    cy.get('.navbar > a').should('contain', 'Logout')
      .should('have.attr', 'href')
      .should('eq', '/logout_user/')
    cy.get('.orange_black_banner').should('contain', 'You need to confirm your account. Send new key')
    cy.get('.orange_black_banner > a')
      .should('have.attr', 'href')
      .should('contain', '/send_new_key/')

    cy.visit(domain_under_test + 'special_page2/')
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

    cy.get('[href="/logout_user/"]').should('contain', 'Logout').click()
    cy.url().should('contain', '?message=logout')
    cy.get('.blue_white_banner').should('contain', 'You\'ve been logged out.')

  }) // end of 'Special Pages'

  // Verify Registration
  // TBD

  // Go to Plus
  // Upsell
  // Upgrade to Plus

  // Go to Premium
  // Upsell
  // Upgrade to Premium

  // Check My Profile
  // Check My Purchases

  // Logout

  it('Database Cnx', () => {
    const query='select * from clc_reg_verifyregistration';
    cy.task('queryDb', query).then((rows) => {
      //expect(rows).to.have.lengthOf(4);
      for(var i=0; i<rows.length; i++) {
        cy.log(rows[i].user_id + " "+ rows[i].confirmation_code)
      }
    })
  }) // end of 'Database Cnx'

}) // end of 'describe'
