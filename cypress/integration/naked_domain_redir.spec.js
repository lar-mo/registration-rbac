//////////////////////////////////////
//
// Author: Larry Moiola
// Filename: naked_domain_redir.spec.js
//
//////////////////////////////////////

const naked_domain = "http://registration-rbac.com/"
const domain_under_test = Cypress.env('host')

describe('Naked Domain Redirect', () => {

  // Production only
  // Verify 'www' is added (301) & http-https redirect (302) occurs; (done by Flask app)
  if (domain_under_test == 'https://www.registration-rbac.com/') {

    it('Naked domain + SSL redirect', () => {
      cy.visit(naked_domain)
      cy.url().should('contain', 'https://www')
    })

  }

}) // end of 'describe - Naked Domain Redirect'
