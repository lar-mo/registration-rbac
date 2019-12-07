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
  - **VERSION 1** - <i>Confirmation status is calculated in views.py.</i>
    - <u>If confirmed=False</u>, user is redirected to the index page with a small error message and a link to resend the CLC link.
    - <u>If confirmed=True</u>, user is passed through to the secure page.
    - This implementation is used for directing users to different pages based on their confirmation status.
    - It is available on pages where it has been implemented in the view.
    - It could easily be retooled to return an integer for different member levels.
    - Then, be used for sending users to an upgrade/upsell page, for example.
  - **VERSION 2** - <i>Confirmation status is calculated in models.py and passed to the template.</i>
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
- Plus and Premium memberships must have an expiration date.
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

```
- Template: index.html
- View: Display home page
- Path: /
```

This view displays the front door of the app. Anyone can access this page, anonymous, logged in, any membership level, and even users with inactive memberships. Error messages can be passed via ```request.GET.get('message', '')```.

#### base.html ####
Note: The CSS rules, ```navbar``` and ```blurb``` are defined in a base template (base.html). Confirmation and membership related information is written to the console for debugging & troubleshooting.

This data is powered by User methods defined in ```models.py```:
```
- user.is_confirmed
- user.membership_isactive
- user.membership_level
- user.membership_expiry
- user.membership_isexpired
```

### Registration / Login ###

```
- Template: register_login.html
- View: Displays login / registration page
- Path: register_login/
```

This view displays the combined login & registration page. Registration and login-related error messages can be passed via ```request.GET.get('message', '')```.

Users are redirected to the homepage when they are already authenticated.

All the form fields on login and registration forms are **required** except the ```address2```. The password fields have ```autocomplete``` explicitly turned off.

### Login User ###

```
- Template: None
- View: Handles the login process
- Path: login_user/
```

This view handles the login form submission. The supplied credentials are evaluated via the ```authenticate``` method of the User class. If this check fails, an error message is shown. If the check succeeds, users is logged in (with built-in ```login``` method of the User class) and redirected to the home page or the value of the ```next``` parameter.

Note: I originally tried to leverage the ```is_active``` boolean in the User model but an inactive user is treated as unrecognized.
See: https://stackoverflow.com/questions/29742845/django-how-do-i-use-is-active-of-auth-user-table

### Register ###

```
- Template: None
- View: Handles the registration process
- Path: register_user/
```

This view handles the registration form submission. If the ```username``` already existing in the database, an error message is shown. Additional validation (_all fields are required_) is enforced only on the front-end.

If those checks succeed, the following actions occur:
1. Account is created (built-in ```create_user``` model of User class)
2. New user is logged in
3. Confirmation key is created
4. New key is fetched
5. Basic membership is created
6. Confirm Your Account email is sent

### Special Page 1 ###

```
- Template: special_page.html
- View: Displays protected page 1
- Path: special_page/
```

This view displays the special page. This page is only accessible for logged-in + confirmed users. If the user is not logged-in and/or confirmed, they are redirect to the index page. (As of writing this, no error message has been implemented.)

The logged-in requirement is enforced by the ```@login_required``` decorator from: ```django.contrib.auth.decorators```

The confirmation requirement is enforced by the view. If ```confirmed``` is True and the user is sent to the special page.

This is an example of view-level evaluation of user's confirmation status. The ```special_page.html``` template is only rendered when the condition is met.

### Special Page 2 ###

```
- Template: special_page2.html
- View: Displays protected page 2
- Path: special_page2/
```

This view displays another version of the special page. This page is accessible for logged-in users but unconfirmed users will see different content than confirmed users.

The template checks the user's confirmation status via the ```user.is_confirmed``` method for the User class and shows the appropriate content (if/else).

This is an example of page-level evaluation of user's confirmation status. The ```special_page2.html``` template is always rendered.

### Logout User ###

```
- Template: None
- View: Handles logging out a user
- Path: logout_user/
```

This view handles the logout process (via ```logout``` method of the User class) and redirects user back to the homepage.

### Create Key ###

```
- Template: None
- View: Handles creation of clc link
- Path: create_key/
```

This view handles generating the account confirmation code. First, a date/time is calculated 3 days in the future. Then, a 32-digit number is generated by ```secrets.token_hex(16)``` via ```secrets```, a built-in Python module. Finally, the record is assembled and saved to the database. Then, the ```bignumber``` is passed back to the calling view for use in the 'Confirm Your Account' email.

Note: There is only one record per user which gets overwritten when a new one is requested, therefore no history of them is maintained.

### Send New Key ###

```
- Template: None
- View: Handles creation of new clc link
- Path: send_new_key/
```

This view handles the destruction & regeneration of the account confirmation code. First, the current code is deleted from the database. Then, the ```create_key``` method is called which add a new code to the database and returned the code to the calling view. Then, an email is sent to the registered user with a CLC link. Then, the users is redirected to the index and a message is displayed confirming new code was generated.

This view is only called from the ```homepage``` when an expired confirmation is used or some other issue is found. See ```message == "expired"``` or ```message == "error"```.

### Send Notification ###

```
- Template: None
- View: Sends transaction emails
- Path: None
```

This view handles sending the various notification emails:
- Confirm Your Account (called by ```register_user```)
- Confirm Your Account (called by ```send_new_key```)
- Account Confirmed (called by ```confirmation```)
- Membership purchased (called by ```create_membership```)

The functionality is built around ```send_mail``` from ```django.core.mail``` and ```render_to_string``` from ```django.template.loader```. ```render_to_string``` contains two parts, the template and data (variables) which are merged when (```send_mail```) is called. ```send_mail``` takes six parameters:
1. subject
2. msg_plain (string)
3. sender
4. recipient
5. fail_silently=False
6. html_message=msg_html (string)

### Confirmation ###

```
- Template: None
- View: Handles validation of clc link
- Path: confirmation/
```

This view handles the validation of a 32-digit code that was sent to the registered email, confirming the registration was authorized.

The value is taken from the url parameter (clc_code). There are a couple short-circuit evaluations first: (1) if account is already confirmed, (2) if the code in the URL doesn't match code in the database.

Then, if the expiration date greater than the current date/time, the ```confirmed``` boolean is switched to ```True```.

Finally, a Welcome message is sent upon successfully confirming the account.

### Check Membership ###

```
- Template: None
- View: Utility function used on Plus and Premium pages (views)
- Path: None
```

This view is called by membership specific pages like Plus and Premium. Since the ```user.membership_level``` method of the User class only returns [Basic, Plus, Premium], this function extends the possible return values to ```Expired```, ```Inactive```, ```Error```. (Of course, this functionality could be added to the custom User methods.)

Note: This app design has a single entry per user for the Membership. There is no history at present. Additionally, a presumption is made that the Membership level is above Basic since expiration is set to New Year's Eve, 2099. Lastly, this evaluation is not done at login and only when access to a restricted page is attempted by design.

The following evaluations are performed:
- If the membership has expired, the user's membership type is converted to Basic with an expiration_date of Dec 31, 2099. Then "Expired" is returned to the calling view.
- If the membership has been marked "Inactive", that value is returned to the calling view.
- If some uncaught error is encountered, "Error" is returned to the calling view.
- If all evaluations succeed, the actual Membership level is returned to the calling view.

This gives the calling view flexibility to do whatever is best with the returned values.

### Plus ###

```
- Template: plus.html
- View: Displays Plus page
- Path: plus/
```

description
check_membership(request)

### Premium ###

```
- Template: premium.html
- View: Displays Premium page
- Path: premium/
```

description
see check_membership(request)

### Upsell / Marketing ###

```
- Template: upsell.html
- View: Displays Upsell page
- Path: upsell/
```

This view displays the Upsell page which is used for marketing purposes.

It is shown when (1) a Plus user tries to access a Premium page, (2) a user with an expired Plus or Premium membership tries to access and Plus or Premium page.

### Inactive Membership ###

```
- Template: inactive.html
- View: Displays Inactive Account page
- Path: inactive/
```

description

### Account Error ###

```
- Template: error.html
- View: Displays Account Error page
- Path: account_error/
```

description

### Purchase Membership ###

```
- Template: purchase_membership.html
- View: Displays Membership purchase page
- Path: purchase_membership/
```

description

### Create Membership ###

```
- Template: None
- View: Handles creation of membership
- Path: create_membership/
```

description

### Inactive Account ###

```
- Template: inactive.html
- View: Displays Inactive Account page
- Path: inactive/
```

This view displays the Inactive Membership page which is used as a path to the customer service funnel.

It is shown when a user with an inactive membership tries to access a member-only page or purchase a membership.

### Account Error ###

```
- Template: error.html
- View: Displays Account Error page
- Path: account_error/
```

This view displays the Error page which is used as a path to the customer service funnel.

It is shown when a user with an inactive membership tries to access a member-only page.

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
### VerifyRegistration ###
```
id                          Automatic PK field
confirmation_code           CharField
expiration                  DateTimeField
confirmed                   BooleanField
user                        ForeignKey(User)
```
### MembershipType ###
```
id                          Automatic PK field
name                        CharField

- Values: Basic, Plus, Premium
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
