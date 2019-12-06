# Registration project

## Project Overview

**Lorem ipsum Lorem ipsum** Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum

## Functionality

### Version 1 ###
**Originally, this application was a simple registration and login system (URS) which included:**
- A two-step registration system and login,
- Token generator and confirmation emails,
- Simple error handling and messaging via url parameters,
- An unsecured page (anonymous visitors ok)
- Two secured pages (both require a logged in/confirmed user):
  - **VERSION 1** - Confirmation status is calculated in views.py.
    - <u>If confirmed=False</u>, user is redirected to the index page with a small error message and a link to resend the CLC link.
    - <u>If confirmed=True</u>, user is passed through to the secure page.
    - This implementation is used for directing users to different pages based on their confirmation status.
    - It is available on pages where it has been implemented in the view.
    - It could easily be retooled to return an integer for different member levels.
    - Then, be used for sending users to an upgrade/upsell page, for example.
  - **VERSION 2** - Confirmation status is calculated in models.py and passed to the template.
    - <u>If confirmed=False</u>, an error message is shown on the secure page.
    - <u>If confirmed=True</u>, the secure page content is visible.
    - This implementation is used for showing different content on the same page based on user's confirmation status.
    - It is available globally via an extension to the built-in user system.
    - It could easily be retooled to return an integer for different member levels.
    - Then, be used for showing different content or unlocking member-specific features, for example.

### Version 2 ###
**<u>Update</u>: A simple three-tiered membership system was added to this app.**
<pre>
--------------------------------------------------------
<b>Features        Basic   Plus    Premium   (page)</b>
--------------------------------------------------------
cool thing        x       x       x       (index.html)
--------------------------------------------------------
special thing             x       x       (plus.html)
--------------------------------------------------------
amazing thing                     x       (premium.html)
--------------------------------------------------------
</pre>

- All registered users automatically have a Basic membership.
- The middle level is Plus and the top level is Premium.
- Premium users can see the Plus user's page(s).
- Basic memberships have an expiration of 2099-12-31 at midnight.
- Plus and Premium memberships must have a expiration date.
- When a Plus or Premium membership expires it reverts a Basic membership.
- The is_active flag is meant as a way to temporarily disable an account.
- There are 6 additional page types:
  - **Plus** - content that is available to Plus members (and Premium)
  - **Premium** - content that is available to Premium members
  - **Account Error** - landing page for Inactive accounts when trying to access a membership page
  - **Inactive Account** - landing page for Inactive accounts when trying to access a membership page
  - **Upsell/Marketing** - landing page for when Basic or Expired accounts when trying to access a membership page
  - **Error** - Error page for account with other errors when trying to access a membership page

## Views ##

### Homepage ###

- Template: index.html
- View: Display home page
- URL: /

### Registration / Login ###

- Template: register_login.html
- View: Display login / registration page
- URL: register_login/

### Login User ###

- Template: None
- View: Handles the login process
- URL: login_user/

### Register ###

- Template: None
- View: Handles the registration process
- URL: register_user/

### Special Page 1 ###

- Template: special_page.html
- View: Displays protected page 1
- URL: special_page/

### Special Page 1 ###

- Template: special_page2.html
- View: Displays protected page 2
- URL: special_page2/

### Logout User ###

- Template: None
- View: Handles logging out a user
- URL: logout_user/

### Confirmation ###

- Template: None
- View: Handles validation of clc link
- URL: confirmation/

### Create Key ###

- Template: None
- View: Handles creation of clc link
- URL: create_key/

### Send New Key ###

- Template: None
- View: Handles creation of new clc link
- URL: send_new_key/

### Upsell / Marketing ###

- Template: upsell.html
- View: Displays Upsell page
- URL: upsell/

### Plus membership ###

- Template: plus.html
- View: Displays Plus page
- URL: plus/

### Premium membership ###
- Template: premium.html
- View: Displays Premium page
- URL: premium/

### Inactive Membership ###

- Template: inactive.html
- View: Displays Inactive Account page
- URL: inactive/

### Account Error ###

- Template: error.html
- View: Displays Account Error page
- URL: account_error/

### Purchase Membership ###

- Template: purchase_membership.html
- View: Displays Membership purchase page
- URL: purchase_membership/

### Create Membership ###

- Template: None
View: Handles creation of membership
- URL: create_membership/

## Data Model

### User ###
_Django built-in feature_
```
id                          Automatic PK field
username                    CharField
email                       CharField  
first_name                  CharField
last_name                   CharField
```
### MembershipType ###
```
id                          Automatic PK field
name                        CharField

- Basic
- Plus
- Premium
```
### VerifyRegistration ###
```
id                          Automatic PK field
confirmation_code           CharField
expiration                  DateTimeField
confirmed                   BooleanField
user                        ForeignKey(User)
```
### Membership ###
```
id                          Automatic PK field
membership_type             ForeignKey(MembershipType)
is_active                   BooleanField
expiration                  DateTimeField
user                        ForeignKey(User)
```
### Transaction ###
```
id                          Automatic PK field
transaction_date            DateTimeField
item_purchased              CharField
purchaser                   ForeignKey(User)
```
### BillingInformation ###
```
id                          Automatic PK field
address1                    CharField
address2                    CharField
city                        CharField
state                       CharField
zipcode                     CharField
creditcard                  CharField
expiration_month            CharField
expiration_year             CharField
cid                         CharField
purchaser                   ForeignKey(User)
```
