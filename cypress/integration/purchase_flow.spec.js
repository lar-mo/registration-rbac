//////////////////////////////////////
//
// Author: Larry Moiola
// Date: Jan 19, 2021
// Filename: purchase_flow.spec.js
//
// Prerequisites for the test:
// Update: auth/user/purchase_path_user/first_name => ''
// Update: auth/user/purchase_path_user/last_name => ''
// Delete: clc_reg/billinginformation/purchase_path_user/*
// Update: clc_reg/membership/purchase_path_user/type => Basic
//
//////////////////////////////////////

// const domain_under_test = 'https://www.registration-rbac.com/' // PRODUCTION
const domain_under_test = 'http://localhost:8000/'                // DEV

describe('Purchase Flow', () => {

  beforeEach(() => {

    cy.visit(domain_under_test + 'register_login/?next=')
    cy.get('[action="/login_user/"] > [type="text"]')
      .type('purchase_path_user').should('have.value', 'purchase_path_user')
    cy.get('[action="/login_user/"] > [type="password"]')
      .type('test01').should('have.value', 'test01')
    cy.get('[action="/login_user/"] > .status_block > button').click()

  }) // end of 'beforeEach'

  it('Upsell', () => {

    //
    // Simulate redirect from /plus/
    //
    cy.visit(domain_under_test + 'upsell/?message=redir_from_plus')

    // HEADER
    // Homepage: /
    cy.get('.navbar').should('contain', 'Homepage')
    cy.get('.navbar > :nth-child(1)')
      .should('have.attr', 'href', '/')

    // Logout: /logout_user/
    cy.get('.navbar').should('contain', 'Logout')
    cy.get('.navbar > :nth-child(2)').should('have.attr', 'href', '/logout_user/')

    // BODY
    // image: pigs_all_three.png
    cy.get('.page_image').find('img')
      .should('have.attr', 'src')
      .should('contain', 'pigs_all_three.png')

    // h1: Upsell page
    cy.get('.page_content > h1').should('contain', 'Upsell page')

    // h2: Hello confirmed_user
    cy.get('.page_content > h2').should('contain', 'Hello purchase_path_user')

    // h3: Purchase a membership (/purchase_membership/?type=premium)
    cy.get('.page_content > :nth-child(3)').should('contain', 'Purchase a membership')
      .find('a')
      .should('contain', 'Purchase a membership')
      .should('have.attr', 'href')
      .should('eq', '/purchase_membership/?type=plus')

    //
    // Simulate redirect from /premium/
    //
    cy.visit(domain_under_test + 'upsell/?message=redir_from_premium')

    // h3: Purchase a membership (/purchase_membership/?type=premium)
    cy.get('.page_content > :nth-child(3)').should('contain', 'Purchase a membership')
      .find('a')
      .should('contain', 'Purchase a membership')
      .should('have.attr', 'href')
      .should('eq', '/purchase_membership/?type=premium')

  }) // end of Upsell

  it('Purchase - Radio button logic', () => {

    //
    // Simulate redirect from Plus Upsell page
    //
    cy.visit(domain_under_test + 'purchase_membership/?type=plus')

    // HEADER
    // Homepage: /
    cy.get('.navbar').should('contain', 'Homepage')
    cy.get('.navbar > :nth-child(1)').should('have.attr', 'href', '/')

    // Logout: /logout_user/
    cy.get('.navbar').should('contain', 'Logout')
    cy.get('.navbar > :nth-child(2)').should('have.attr', 'href', '/logout_user/')

    // BODY
    // image: pigs_all_three0-basic_color.png
    cy.get('.page_image').find('img')
      .should('have.attr', 'src')
      .should('contain', 'pigs_all_three0-basic_color.png')

    // label: You have a Basic membership.
    cy.get('.memberlevel').should('contain', 'You have a Basic membership.')

    // Verify radio button for Plus is pre-selected
    cy.get(':nth-child(1) > :nth-child(2) > input').should('have.attr', 'checked')

    //
    // Simulate redirect from Premium Upsell page
    //
    cy.visit(domain_under_test + 'purchase_membership/?type=premium')

    // Verify radio button for Premium is pre-selected
    cy.get(':nth-child(3) > input').should('have.attr', 'checked')

    // Test w/o 'type' flag
    // cy.visit(domain_under_test + 'purchase_membership/')
    // Verify no radio button is pre-selected
    // do something (no easy way to check that a radio button is NOT checked; tag param is just checked='')

  }) // end of 'Purchase - Radio button logic'

  it('Purchase - Basic to Plus/Premium', () => {

    //
    // Simulate redirect from Plus Upsell page
    //
    cy.visit(domain_under_test + 'purchase_membership/?type=plus')

    // HEADER
    // Homepage: /
    cy.get('.navbar').should('contain', 'Homepage')
    cy.get('.navbar > :nth-child(1)').should('have.attr', 'href', '/')

    // Logout: /logout_user/
    cy.get('.navbar').should('contain', 'Logout')
    cy.get('.navbar > :nth-child(2)').should('have.attr', 'href', '/logout_user/')

    // BODY
    // image: pigs_all_three1-plus_color.png
    cy.get('.page_image').find('img')
      .should('have.attr', 'src')
      .should('contain', 'pigs_all_three0-basic_color.png')

    // label: You have a Basic membership.
    cy.get('.memberlevel').should('contain', 'You have a Basic membership.')

    // Member Information
    cy.get('.page_title').should('contain', 'Purchase Membership')
    cy.get(':nth-child(3) > .form_title').should('contain', 'Member Information')
    cy.get(':nth-child(1) > .field_title').should('contain', 'Membership')
    cy.get(':nth-child(1) > :nth-child(2) > input').should('have.attr', 'checked')
    cy.get(':nth-child(3) > .fine_print').should('contain', 'Note: This information is retrieved from the database.')

    // Purchaser Information
    // First Name
    cy.get(':nth-child(3) > :nth-child(4) > .field_title')
      .should('contain', 'First Name')
    cy.get('#firstname')
      .should('have.value', '')
      .type('John').should('have.value', 'John')

    // Last Name
    cy.get(':nth-child(3) > :nth-child(5) > .field_title')
      .should('contain', 'Last Name')
    cy.get('#lastname')
      .should('have.value', '')
      .type('Smith').should('have.value', 'Smith')

    // Address 1
    cy.get(':nth-child(6) > .field_title')
      .should('contain', 'Address 1')
    cy.get('#address1')
      .should('have.value', '')
      .type('123 Any Street').should('have.value', '123 Any Street')

    // Address 2
    cy.get(':nth-child(7) > .field_title')
      .should('contain', 'Address 2')
    cy.get('#address2')
      .should('have.value', '')

    // City
    cy.get(':nth-child(8) > .field_title')
      .should('contain', 'City')
    cy.get('#city')
      .should('have.value', '')
      .type('Springfield').should('have.value', 'Springfield')

    // State
    cy.get(':nth-child(9) > .field_title')
      .should('contain', 'State')
    cy.get('#state')
      .should('have.value', null)
      .select('OR')

    // Country
    cy.get(':nth-child(10) > .field_title')
      .should('contain', 'Country')
    cy.get('#country')
      .should('have.value', null)
      .select('US')

    // Postal/Zip code
    cy.get(':nth-child(11) > .field_title')
      .should('contain', 'Postal Code')
    cy.get('#zipcode')
      .should('have.value', '')
      .type('97475').should('have.value', '97475')

    // Billing Information
    cy.get(':nth-child(5) > .form_title').should('contain', 'Payment Information')
    cy.get(':nth-child(5) > .fine_print').should('contain', 'Note: This information is not stored, it\'s hardcoded in the HTML for testing.')

    // Card Number
    cy.get(':nth-child(3) > .field_title').should('contain', 'Card Number')
    cy.get(':nth-child(3) > :nth-child(2) > input').should('have.value', '5105105105105100')

    // Expiration
    cy.get(':nth-child(5) > :nth-child(4) > .field_title').should('contain', 'Expiration')
    cy.get('#exp_month').should('have.value', '10')
    cy.get('#exp_year').should('have.value', '2022')

    // CVV
    cy.get(':nth-child(5) > :nth-child(5) > .field_title').should('contain', 'CVV')
    cy.get(':nth-child(5) > :nth-child(5) > :nth-child(2) > input').should('have.value', '567')

    // Click Submit button
    cy.get('#btnPurchase').should('contain', 'Purchase Membership').click()

    // You will be redirected to Plus with a banner message
    cy.url().should('contain', '/plus/?message=membership_upgraded')
    cy.get('.green_white_banner').should('contain', 'You have successfully upgraded to Plus.')

  }) // end of 'Purchase - Basic to Plus/Premium'

  it('Purchase - Plus to Premium', () => {

    //
    // Simulate redirect from Plus Upsell page
    //
    cy.visit(domain_under_test + 'purchase_membership/?type=premium')

    // HEADER
    // Homepage: /
    cy.get('.navbar').should('contain', 'Homepage')
    cy.get('.navbar > :nth-child(1)').should('have.attr', 'href', '/')

    // Logout: /logout_user/
    cy.get('.navbar').should('contain', 'Logout')
    cy.get('.navbar > :nth-child(2)').should('have.attr', 'href', '/logout_user/')

    // BODY
    // image: pigs_all_three1-plus_color.png
    cy.get('.page_image').find('img')
      .should('have.attr', 'src')
      .should('contain', 'pigs_all_three1-plus_color.png')

    // label: You have a Basic membership.
    cy.get('.memberlevel').should('contain', 'You have a Plus membership which expires on')

    // Verify radio button for Plus is disabled & Premium is pre-selected
    cy.get(':nth-child(1) > :nth-child(2) > input').should('have.attr', 'disabled')
    cy.get(':nth-child(3) > input').should('have.attr', 'checked')

    // click Submit button
    cy.get('#btnPurchase').should('contain', 'Purchase Membership').click()

    // You will be redirected to Plus with a banner message
    cy.url().should('contain', '/premium/?message=membership_upgraded')
    cy.get('.green_white_banner').should('contain', 'You have successfully upgraded to Premium.')

  }) // end of 'Purchase - Plus to Premium'

}) // end of 'describe'
