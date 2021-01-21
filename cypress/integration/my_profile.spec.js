//////////////////////////////////////
//
// Author: Larry Moiola
// Date: Jan 20, 2021
// Filename: my_profile.spec.js
//
// Prerequisites for the test:
// Restore these tables: auth/user, clc_reg/billinginformation
//  [profile_blank - Unconfirmed/Basic] - N/A (auth/user.profile_blank)
//  [profile_name_only - Confirmed/Basic]
//    Default values:
//      First Name: Dan (auth/user.profile_name_only)
//      Last Name: Soder
//  [profile_name_billing - Confirmed/Plus]
//    Type: Plus
//    Default values:
//      First Name: Big Jay (auth/user.profile_name_billing)
//      Last Name: Oakerson
//      Address 1: 123 NE Street (billinginformation.profile_name_billing)
//      Address 2: Apt 101
//      City: New York City
//      State: NY
//      Country: USA
//      Postal Code: 10002
//
//////////////////////////////////////

// const domain_under_test = 'https://www.registration-rbac.com/' // PRODUCTION
const domain_under_test = 'http://localhost:8000/'                // DEV

describe('My Profile', () => {

  beforeEach(() => {
    cy.visit(domain_under_test + 'register_login/?next=/my_profile/')
  })

  it('Blank', () => {

    // Login as user with user with no profile
    cy.get('[action="/login_user/"] > [type="text"]').type('profile_blank').should('have.value', 'profile_blank')
    cy.get('[action="/login_user/"] > [type="password"]').type('test01').should('have.value', 'test01')
    cy.get('[action="/login_user/"] > .status_block > button').click()

    // Check url after redirect to My Profile
    cy.url().should('contain', '/my_profile/')

    // Check that there are only two fields: First Name, Last Name
    cy.get('.my_profile_label').should('contain', 'First Name')
    cy.get('.my_profile_label').should('contain', 'Last Name')

    // Check that the input boxes are blank
    cy.get('#firstname').should('have.value', '')
    cy.get('#lastname').should('have.value', '')

    // Check that there are no other form input fields
    cy.get('.my_profile_label').find('contain', 'Address 1').should('not.exist')
    cy.get('#address1').should('not.exist')

    // The rest of the form fields are tested below

  }) // end of 'Blank'

  it('Name Only', () => {

    // Login as user with user with no profile
    cy.get('[action="/login_user/"] > [type="text"]').type('profile_name_only').should('have.value', 'profile_name_only')
    cy.get('[action="/login_user/"] > [type="password"]').type('test01').should('have.value', 'test01')
    cy.get('[action="/login_user/"] > .status_block > button').click()

    // check that there are both input boxes are populated (see: profile_name_only)
    // check that there are only two fields: First Name, Last Name
    cy.get('.my_profile_label').should('contain', 'First Name')
    cy.get('.my_profile_label').should('contain', 'Last Name')
    // check that the input boxes are populated
    cy.get('#firstname').should('have.value', 'Dan')
    cy.get('#lastname').should('have.value', 'Soder')

    // Verify My Purchases link does not exists
    cy.get('p > a').should('not.exist')

    // The rest of the form fields are tested below

  }) // end of 'Name Only'

  it('Name & Billing', () => {

    // Login as user with user with no profile
    cy.get('[action="/login_user/"] > [type="text"]').type('profile_name_billing').should('have.value', 'profile_name_billing')
    cy.get('[action="/login_user/"] > [type="password"]').type('test01').should('have.value', 'test01')
    cy.get('[action="/login_user/"] > .status_block > button').click()

    // check url after redirect to My Profile
    cy.url().should('contain', '/my_profile/')

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
      .should('contain', 'pigs_all_three1-plus_color.png')
    cy.get('.memberlevel').should('contain', 'You have a Plus membership which expires on')
    // date: Sep 30, 2021. (check: format, in the future-check year first, then month, then day)

    // Check that My Purchases link exists
    cy.get('p > a').should('contain', 'My Purchases')
      .should('have.attr', 'href')
      .should('contain', '/purchases/')

    // h1: My Profile
    cy.get('.page_title').should('contain', 'My Profile')

    // Check that there are all input boxes & selects are populated (see: profile_name_billing)
    cy.get(':nth-child(1) > .my_profile_label').should('contain', 'First Name')
    cy.get('#firstname')
      .should('have.value', 'Big Jay')
      .clear()
      .type('Howard').should('have.value', 'Howard')
    cy.get(':nth-child(2) > .my_profile_label').should('contain', 'Last Name')
    cy.get('#lastname')
      .should('have.value', 'Oakerson')
      .clear()
      .type('Stern').should('have.value', 'Stern')
    cy.get(':nth-child(3) > .my_profile_label').should('contain', 'Address 1')
    cy.get('#address1')
      .should('have.value', '123 NE Street')
      .clear()
      .type('9988 Park Ave').should('have.value', '9988 Park Ave')
    cy.get(':nth-child(4) > .my_profile_label').should('contain', 'Address 2')
    cy.get('#address2')
      .should('have.value', 'Apt 101')
      .clear()
      .type('c/o SiriusXM').should('have.value', 'c/o SiriusXM')
    cy.get(':nth-child(5) > .my_profile_label').should('contain', 'City')
    cy.get('#city')
      .should('have.value', 'New York City')
      .clear()
      .type('Manhattan').should('have.value', 'Manhattan')
    cy.get(':nth-child(6) > .my_profile_label').should('contain', 'State')
    cy.get('#state')
      .should('have.value', 'NY')
    cy.get(':nth-child(7) > .my_profile_label').should('contain', 'Country')
    cy.get('#country')
      .should('have.value', 'US')
    cy.get(':nth-child(8) > .my_profile_label').should('contain', 'Postal Code')
    cy.get('#zipcode')
      .should('have.value', '10002')
      .clear()
      .type('10003').should('have.value', '10003')

    // Submit form
    cy.get('#btnUpdateProfile').click()

    // Verify notification banner
    cy.get('.green_white_banner').should('contain', 'Your profile was successfully updated.')

    // Verify new values are saved
    cy.get('#firstname').should('have.value', 'Howard')
    cy.get('#lastname').should('have.value', 'Stern')
    cy.get('#address1').should('have.value', '9988 Park Ave')
    cy.get('#address2').should('have.value', 'c/o SiriusXM')
    cy.get('#city').should('have.value', 'Manhattan')
    cy.get('#state').should('have.value', 'NY')
    cy.get('#country').should('have.value', 'US')
    cy.get('#zipcode').should('have.value', '10003')

    //
    // Verify changes made on My Profile are reflected on Purchase Membership
    //

    cy.visit(domain_under_test + 'purchase_membership/?type=premium')
    // Verify new values are shown here too
    cy.get('#firstname').should('have.value', 'Howard')
    cy.get('#lastname').should('have.value', 'Stern')
    cy.get('#address1').should('have.value', '9988 Park Ave')
    cy.get('#address2').should('have.value', 'c/o SiriusXM')
    cy.get('#city').should('have.value', 'Manhattan')
    cy.get('#state').should('have.value', 'NY')
    cy.get('#country').should('have.value', 'US')
    cy.get('#zipcode').should('have.value', '10003')

    // Clear form
    cy.get('#btnResetForm').click()

    // Verify form fields are blank
    cy.get('#firstname').should('have.value', '')
    cy.get('#lastname').should('have.value', '')
    cy.get('#address1').should('have.value', '')
    cy.get('#address2').should('have.value', '')
    cy.get('#city').should('have.value', '')
    cy.get('#state').should('have.value', null)
    cy.get('#country').should('have.value', null)
    cy.get('#zipcode').should('have.value', '')

    // Enter new values
    cy.get('#firstname').type('Christine').should('have.value', 'Christine')
    cy.get('#lastname').type('Evans').should('have.value', 'Evans')
    cy.get('#address1').type('1001 Main St').should('have.value', '1001 Main St')
    cy.get('#address2').type('Apt B').should('have.value', 'Apt B')
    cy.get('#city').type('NYC').should('have.value', 'NYC')
    cy.get('#state').select('NY').should('have.value', 'NY')
    cy.get('#country').select('US').should('have.value', 'US')
    cy.get('#zipcode').type('10007').should('have.value', '10007')

    // Submit form
    cy.get('#btnPurchase').click()

    //
    // Verify changes made on Purchase Membership are reflected on My Profile
    //

    cy.visit(domain_under_test + 'my_profile/')
    // Verify new values were saved
    cy.get('#firstname').should('have.value', 'Christine')
    cy.get('#lastname').should('have.value', 'Evans')
    cy.get('#address1').should('have.value', '1001 Main St')
    cy.get('#address2').should('have.value', 'Apt B')
    cy.get('#city').should('have.value', 'NYC')
    cy.get('#state').should('have.value', 'NY')
    cy.get('#country').should('have.value', 'US')
    cy.get('#zipcode').should('have.value', '10007')

  }) // end of 'Name & Billing'

}) // end of 'describe'
