// const domain_under_test = 'https://www.registration-rbac.com/' // PRODUCTION
const domain_under_test = 'http://localhost:8000/'                // DEV

describe('Anonymous', () => {
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

  it('Plus', () => {

    cy.visit(domain_under_test + 'plus/')
    cy.url()
      .should('contain', '/register_login/')
      .should('contain', '?message=login_required')
      .should('contain', '&next=/plus/')
    cy.get('.blue_white_banner').should('contain', 'You must be logged in.')

  }) // end of 'Plus'

}) // end of 'describe'
