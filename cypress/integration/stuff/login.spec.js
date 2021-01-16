describe('Login as Basic User', () => {
  beforeEach(() => {
    cy.visit('http://registration-rbac.com')
    cy.get('.navbar').contains('Login').click()
  })

  it('Login as Basic user', () => {
    // Verify 'www' is added (301) & http-https redirect (302) (done by Flask app)
    // Verify url is for Login & Register page
    // Verify destination (next) page is homepage "/"
    cy.url()
      .should('contain', 'https://www')
      .should('contain', '/register_login/')
      .should('contain', '?next=/')

    // Login as Basic (confirmed) user
    cy.get('[action="/login_user/"] > [type="text"]').type('camper').should('have.value', 'camper')
    cy.get('[action="/login_user/"] > [type="password"]').type('7*0Ri?s!Bn2X%c2X').should('have.value', '7*0Ri?s!Bn2X%c2X')
    cy.get('[action="/login_user/"] > .status_block > button').click()

    // Verify url is homepage
    cy.url().should('eq', 'https://www.registration-rbac.com/')

    // Verify all page elements; add check Logout link
    cy.get('.page_content > h1').should('contain', 'Unsecured page, anonymous ok')
    cy.get('.page_content > h2').should('contain', 'Hello Dan')
    cy.get('.page_content > h3').should('contain', 'Secured Page version 1')
    cy.get('.page_content > h3').should('contain', 'Secured Page version 2')
    cy.get('.page_content > h3').should('contain', 'Plus')
    cy.get('.page_content > h3').should('contain', 'Premium')
    cy.get('.page_image').find('img')
      .should('have.attr', 'src')
      .should('contain', 'pigs_all_three0-basic_color.png')

  })
})
