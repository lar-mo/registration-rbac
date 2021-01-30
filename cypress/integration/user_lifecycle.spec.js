//////////////////////////////////////
//
// Author: Larry Moiola
// Date: Jan 19, 2021
// Filename: user_lifecycle.spec.js
//
//////////////////////////////////////

const domain_under_test = Cypress.env('host')

const random_number = Math.floor(Math.random() * 100);
const random_username = "user" + random_number

describe('User Lifecycle - Anonymous & Register', () => {

  it('Homepage', () => {

    cy.visit(domain_under_test)

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

}) // end of 'User Lifecycle - Anonymous & Register'

describe('User Lifecycle - Registered User', () => {

  beforeEach(() => {

    cy.visit(domain_under_test + 'register_login/')
    cy.get('[action="/login_user/"] > [type="text"]').type(random_username).should('have.value', random_username)
    cy.get('[action="/login_user/"] > [type="password"]').type('test01').should('have.value', 'test01')
    cy.get('[action="/login_user/"] > .status_block > button').click()

  }) // end of 'beforeEach'

  it('Special Pages', () => {

    cy.visit(domain_under_test + 'special_page/')

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
    cy.get('.page_content > h2').should('contain', `Hello ${random_username}`)
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

  it('Confirmation link', () => {
    // Source: https://stackoverflow.com/questions/64083677/sample-database-connection-to-sqlite-database-in-cypress
    const query='SELECT * FROM clc_reg_verifyregistration INNER JOIN auth_user ON clc_reg_verifyregistration.user_id = auth_user.id WHERE clc_reg_verifyregistration.user_id = (SELECT id FROM auth_user WHERE username = "'+random_username+'")';
    cy.task('queryDb', query).then((rows) => {
      expect(rows).to.have.lengthOf(1);
      cy.wrap(rows[0].confirmation_code).as('ccode');
      // for(var i=0; i<rows.length; i++) {
      //   const ccode = rows[i].confirmation_code
      //   cy.wrap(ccode).as('ccode');
      // }
    })

    cy.get('@ccode').then(ccode => {
      cy.visit(domain_under_test + 'confirmation/?clc_code=' + ccode)
    });

    // Flag setting account to "confirmed" is updated in background
    // Redirect back to index (homepage) is handled in views.py
    cy.url().should('contain', '?message=confirmed')
    cy.get('.green_white_banner').should('contain', 'Your account is confirmed.')

    // HEADER
    // Logout: /logout_user/
    cy.get('.navbar > a').should('contain', 'Logout')
      .should('have.attr', 'href')
      .should('eq', '/logout_user/')

    // BODY
    // image: pigs_all_three0-basic_color.png
    cy.get('.page_image').find('img')
      .should('have.attr', 'src')
      .should('contain', 'pigs_all_three0-basic_color.png')
    // label: You have a Basic membership.
    cy.get('.memberlevel').should('contain', 'You have a Basic membership.')

    // h1: Unsecured page, anonymous ok
    cy.get('.page_content > h1').should('contain', 'Unsecured page, anonymous ok')

    // h2: Hello confirmed_user (/my_profile/)
    cy.get('.page_content > h2').should('contain', `Hello ${random_username}`)
    cy.get('.page_content > h2 > a')
      .should('have.attr', 'href', '/my_profile/')

    // h3: Secured Page version 1 (/special_page/)
    cy.get('.page_content > :nth-child(3)').should('contain', 'Go to: Secured Page version 1')
    cy.get('.page_content > :nth-child(3)').find('a')
      .should('have.attr', 'href', '/special_page/')

    // h3: Secured Page version 2 (/special_page2)
    cy.get('.page_content > :nth-child(4)').should('contain', 'Go to: Secured Page version 2')
    cy.get('.page_content > :nth-child(4) > a')
      .should('have.attr', 'href', '/special_page2/')

    // h3: Go to: Plus (/plus/)
    cy.get('.page_content > :nth-child(5)').should('contain', 'Go to: Plus')
    cy.get('.page_content > :nth-child(5) > a')
      .should('have.attr', 'href', '/plus/')

    // h3: Go to: Premium (/premium/)
    cy.get('.page_content > :nth-child(6)').should('contain', 'Go to: Premium')
    cy.get('.page_content > :nth-child(6) > a')
      .should('contain', 'Premium')
      .should('have.attr', 'href', '/premium/')

    // Click Logout link
    cy.get('[href="/logout_user/"]').should('contain', 'Logout').click()
    cy.url().should('contain', '?message=logout')
    cy.get('.blue_white_banner').should('contain', 'You\'ve been logged out.')

  }) // end of 'Confirmation link'

  it('Upgrade to Plus', () => {

    // cy.debug()

    cy.visit(domain_under_test + 'plus/')

    // Redirect to Upsell
    cy.url().should('contain', 'upsell/?message=redir_from_plus')

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
    cy.get('.page_content > h2').should('contain', `Hello ${random_username}`)

    // h3: Purchase a membership (/purchase_membership/?type=premium)
    cy.get('.page_content > :nth-child(3)').should('contain', 'Purchase a membership')
      .find('a')
      .should('contain', 'Purchase a membership')
      .should('have.attr', 'href')
      .should('eq', '/purchase_membership/?type=plus')

    //
    // Simulate click from Plus Upsell page
    //
    cy.visit(domain_under_test + 'purchase_membership/?type=plus')

    // Purchase Form
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

  }) // end of 'Upgrade to Plus'

  it('Upgrade to Premium', () => {

    cy.visit(domain_under_test + 'premium/')

    // redirected to Plus page
    cy.url().should('contain', 'plus/?message=redir_from_premium')

    // click Upgrade link in banner
    cy.get('.orange_black_banner').should('contain', 'Are you looking for the Premium page? Click here to upgrade.')
    cy.get('.orange_black_banner > a').click()

    // h3: Purchase a membership (/purchase_membership/?type=premium)
    cy.get('.page_content > :nth-child(3)').should('contain', 'Purchase a membership')
      .find('a')
      .should('contain', 'Purchase a membership')
      .should('have.attr', 'href')
      .should('eq', '/purchase_membership/?type=premium')

    //
    // Simulate click from Premium Upsell page
    //
    cy.visit(domain_under_test + 'purchase_membership/?type=premium')

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

  }) // end of 'Upgrade to Premium'

  // Check My Profile
  // Check My Purchases

  // // https://stackoverflow.com/questions/51821789/...
  // // ...how-will-we-call-a-function-written-in-a-separate-file-from-a-cypress-test/51844336
  // it('Custom Command test', () => {
  // cy
  //   .subValues(15, 8)
  //   .should('eq', 7) // true
  // });

}) // end of 'User Lifecycle - Registered User'
