describe('Login as Basic User', () => {
  beforeEach(() => {
    cy.visit('https://registration-rbac.com')
    cy.get('.navbar').contains('Login').click()
  })

  it('Login as Basic user', () => {
    cy.get('[action="/login_user/"] > [type="text"]')
      .type('camper').should('have.value', 'camper')
    cy.get('[action="/login_user/"] > [type="password"]')
      .type('7*0Ri?s!Bn2X%c2X').should('have.value', '7*0Ri?s!Bn2X%c2X')
    cy.get('[action="/login_user/"] > .status_block > button').click()
  })

})
