# Registration project

## Project Overview

**Two Step Registration and Three-Tier Membership (RBAC)**

After experimenting with the `django-registation` (https://django-registration.readthedocs.io/en/3.0.1/), I wanted to create my own solution. My intention is implement a two-step registration process to my Community Lending Library app.

Once the original concept was coded and working, I set out to add a Membership system. I naively thought I could convert the simple "confirmed" Boolean to an integer denoting different "levels". It became a much more involved undertaking with several new Views, tables (models), new Member pages, error handling, and a purchase form.

It's been a great learning tool and hopefully architected to be a flexible skeleton for future Django apps.

## Functionality

### Version 1 ###
**Originally, this application was a simple registration and login system (URS) which included:**
- A two-step registration system and login,
- Token generator and confirmation emails,
- Simple error handling and messaging via url parameters,
- An unsecured page (anonymous visitors ok)
- Two secured pages (both require a logged in/confirmed user):
  - **VERSION 1** - <i>Confirmation status is calculated in views.py.</i>
    - If `confirmed=False`, user is redirected to the index page with a small error message and a link to resend the CLC link.
    - If `confirmed=True`, user is passed through to the secure page.
    - This implementation is used for directing users to different pages based on their confirmation status.
    - It is available on pages where it has been implemented in the view.
    - It could easily be retooled to return an integer for different member levels.
    - Then, be used for sending users to an upgrade/upsell page, for example.
  - **VERSION 2** - <i>Confirmation status is calculated in models.py and passed to the template.</i>
    - If `confirmed=False`, an error message is shown on the secure page.
    - If `confirmed=True`, the secure page content is visible.
    - This implementation is used for showing different content on the same page based on user's confirmation status.
    - It is available globally via an extension to the built-in user system.
    - It could easily be retooled to return an integer for different member levels.
    - Then, be used for showing different content or unlocking member-specific features, for example.

### Version 2 ###
**Update: A simple three-tiered membership system (RBAC) was added to this app.**
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

<div style="height:25px">&nbsp;</div>

## Views ##

### Homepage ###

```
- Purpose: Display home page
- Template: index.html
- View: index
- Path: /
```

This view displays the front door of the app. Anyone can access this page, anonymous, logged in, any membership level, and even users with inactive memberships. Error messages can be passed via `request.GET.get('message', '')`.

#### base.html ####
Note: The CSS rules, `navbar` and `blurb` are defined in a base template (base.html). Confirmation and membership related information is written to the console for debugging & troubleshooting.

This data is powered by User methods defined in `models.py`:
```
- user.is_confirmed
- user.membership_isactive
- user.membership_level
- user.membership_expiry
- user.membership_isexpired
```

### Registration / Login ###

```
- Purpose: Displays login / registration page
- Template: register_login.html
- View: register_login
- Path: register_login/
```

This view displays the combined login & registration page. Registration and login-related error messages can be passed via `request.GET.get('message', '')`.

Users are redirected to the homepage when they are already authenticated.

All the form fields on login and registration forms are **required** except the `address2`. The password fields have `autocomplete` explicitly turned off.

### Login User ###

```
- Purpose: Handles the login process
- Template: None
- View: login_user
- Path: login_user/
```

This view handles the login form submission. The supplied credentials are evaluated via the `authenticate` method of the User class. If this check fails, an error message is shown. If the check succeeds, users is logged in (with built-in `login` method of the User class) and redirected to the home page or the value of the `next` parameter.

Note: I originally tried to leverage the `is_active` Boolean in the User model but an inactive user is treated as unrecognized.
See: https://stackoverflow.com/questions/29742845/django-how-do-i-use-is-active-of-auth-user-table

### Register ###

```
- Purpose: Handles the registration process
- Template: None
- View: register_user
- Path: register_user/
```

This view handles the registration form submission. If the `username` already existing in the database, an error message is shown. Additional validation (_all fields are required_) is enforced only on the front-end.

If those checks succeed, the following actions occur:
1. Account is created (built-in `create_user` model of User class)
2. New user is logged in
3. Confirmation key is created
4. New key is fetched
5. Basic membership is created
6. Confirm Your Account email is sent

### Special Page 1 ###

```
- Purpose: Displays protected page 1
- Template: special_page.html
- View: special_page
- Path: special_page/
```

This view displays the special page. This page is only accessible for logged-in + confirmed users. If the user is not logged-in and/or confirmed, they are redirect to the index page. (As of writing this, no error message has been implemented.)

The logged-in requirement is enforced by the `@login_required` decorator from: `django.contrib.auth.decorators`

The confirmation requirement is enforced by the view. If `confirmed` is True and the user is sent to the special page.

This is an example of view-level evaluation of user's confirmation status. The `special_page.html` template is only rendered when the condition is met.

### Special Page 2 ###

```
- Purpose: Displays protected page 2
- Template: special_page2.html
- View: special_page2
- Path: special_page2/
```

This view displays another version of the special page. This page is accessible for logged-in users but unconfirmed users will see different content than confirmed users.

The template checks the user's confirmation status via the `user.is_confirmed` method for the User class and shows the appropriate content (if/else).

This is an example of page-level evaluation of user's confirmation status. The `special_page2.html` template is always rendered.

### Logout User ###

```
- Purpose: Handles logging out a user
- Template: None
- View: logout_user
- Path: logout_user/
```

This view handles the logout process (via `logout` method of the User class) and redirects user back to the homepage.

### Create Key ###

```
- Purpose: Handles creation of clc link
- Template: None
- View: create_key
- Path: create_key/
```

This view handles generating the account confirmation code. First, a date/time is calculated 3 days in the future. Then, a 32-digit number is generated by `secrets.token_hex(16)` via `secrets`, a built-in Python module. Finally, the record is assembled and saved to the database. Then, the `bignumber` is passed back to the calling view for use in the 'Confirm Your Account' email.

Note: There is only one record per user which gets overwritten when a new one is requested, therefore no history of them is maintained.

### Send New Key ###

```
- Purpose: Handles creation of new clc link
- Template: None
- View: send_new_key
- Path: send_new_key/
```

This view handles the destruction & regeneration of the account confirmation code. First, the current code is deleted from the database. Then, the `create_key` method is called which add a new code to the database and returned the code to the calling view. Then, an email is sent to the registered user with a CLC link. Then, the users is redirected to the index and a message is displayed confirming new code was generated.

This view is only called from the `homepage` when an expired confirmation is used or some other issue is found. See `message == "expired"` or `message == "error"`.

### Send Notification ###

```
- Purpose: Sends transaction emails
- Template: None
- View: send_notification
- Path: None
```

This view handles sending the various notification emails:
- Confirm Your Account (called by `register_user`)
- Confirm Your Account (called by `send_new_key`)
- Account Confirmed (called by `confirmation`)
- Membership purchased (called by `create_membership`)

The functionality is built around `send_mail` from `django.core.mail` and `render_to_string` from `django.template.loader`. `render_to_string` contains two parts, the template and data (variables) which are merged when (`send_mail`) is called. `send_mail` takes six parameters:
1. subject
2. msg_plain (string)
3. sender
4. recipient
5. fail_silently=False
6. html_message=msg_html (string)

### Confirmation ###

```
- Purpose: Handles validation of clc link
- Template: None
- View: confirmation
- Path: confirmation/
```

This view handles the validation of a 32-digit code that was sent to the registered email, confirming the registration was authorized.

The value is taken from the url parameter (clc_code). There are a couple short-circuit evaluations first: (1) if account is already confirmed, (2) if the code in the URL doesn't match code in the database.

Then, if the expiration date greater than the current date/time, the `confirmed` Boolean is switched to `True`.

Finally, a Welcome message is sent upon successfully confirming the account.

### Check Membership ###

```
- Purpose: Utility function used on Plus and Premium pages (views)
- Template: None
- View: check_membership
- Path: None
```

This view is called by membership specific pages like Plus and Premium. Since the `user.membership_level` method of the User class only returns [Basic, Plus, Premium], this function extends the possible return values to `Expired`, `Inactive`, `Error`. (Of course, this functionality could be added to the custom User methods.)

Note: This app design has a single entry per user for the Membership. There is no history at present. Additionally, a presumption is made that the Membership level is above Basic since expiration is set to New Year's Eve, 2099. Lastly, this evaluation is not done at login and only when access to a restricted page is attempted by design.

The following evaluations are performed:
- If the membership has expired, the user's membership type is converted to Basic with an expiration_date of Dec 31, 2099. Then "Expired" is returned to the calling view.
- If the membership has been marked "Inactive", that value is returned to the calling view.
- If some uncaught error is encountered, "Error" is returned to the calling view.
- If all evaluations succeed, the actual Membership level is returned to the calling view.

This gives the calling view flexibility to do whatever is best with the returned values.

### Plus ###

```
- Purpose: Displays Plus page
- Template: plus.html
- View: plus
- Path: plus/
```

This view displays an example of a page that requires as Plus or Premium membership. The membership is validated by calling the `check_membership(request)` function. The redirect logic is handled here for Basic and non-valid memberships (Inactive, Expired, Other). This templates supports URL `messages`.

The `membership_level` and `expiration` are displayed here. The expiration date is stored as UTC in the database but is converted to the user's local timezone via Javascript. The JS is included in the `base.html` template and is conditionally loaded based on the `request.path`.

### Premium ###

```
- Purpose: Displays Premium page
- Template: premium.html
- View: premium
- Path: premium/
```

This view displays an example of a page that requires as Premium membership. The membership is validated by calling the `check_membership(request)` function. The redirect logic is handled here for Basic, Plus and non-valid memberships (Inactive, Expired, Other). This templates supports URL `messages`.

The `membership_level` and `expiration` are displayed here. The expiration date is stored as UTC in the database but is converted to the user's local timezone via Javascript. The JS is included in the `base.html` template and is conditionally loaded based on the `request.path`.

### Upsell / Marketing ###

```
- Purpose: Displays Upsell page
- Template: upsell.html
- View: upsell
- Path: upsell/
```

This view displays the Upsell page which is used for marketing purposes.

It is shown when (1) a Plus user tries to access a Premium page, (2) a user with an expired Plus or Premium membership tries to access a Plus or Premium page.

### Inactive Membership ###

```
- Purpose: Displays Inactive Account page
- Template: inactive.html
- View: inactive
- Path: inactive/
```
This view displays the Inactive membership page which is used for customer service purposes.

It is shown when a user with an inactive membership of any level tries to access and Plus or Premium page.

### Account Error ###

```
- Purpose: Displays Account Error page
- Template: error.html
- View: account_error
- Path: account_error/
```
This view displays the Account Error page which is used for customer services purposes.

It is shown when the membership lookup for a user fails when they try to access a Plus or Premium page.

### Purchase Membership ###

```
- Purpose: Displays Membership purchase page
- Template: purchase_membership.html
- View: purchase_membership
- Path: purchase_membership/
```

This view displays the Purchase Membership page. Various checks are performed before allowing a user to reach the page:
1. If logged-in (`@login_required`), confirmed user (`request.user.is_confirmed()`) already has a valid (not `request.user.membership_isexpired()`), active (`request.user.membership_isactive()`) Premium membership (`request.user.membership_level()`)
2. If user has an Inactive membership (not `request.user.membership_isactive()`)
3. If user is not confirmed (not `request.user.is_confirmed()`)

When a Plus user visits the form, "Premium" is the only available option. (The "Plus" is disabled and "Premium" is selected.)

If there is a record for this user in `BillingInformation` then that data is loaded into the form. This is done with the template rendering and template literals on the value parameters for each field on the form. A reset button allows the user to clear the form values.

Credit Card validation - There are three checks for the three fields (credit card number, expiration date, CVC):

1. The form uses "pattern" with a regex expression that covers the formats of all the major credit cards.
2. \*\*\* There is a credit card validator script on the backend that is performed when the form is submitted. \*\*\*
3. An expiration date must be current month and current year, or later. This is done with Javascript on the form.

> *#2 - This is just for demonstration purposes. The transmission and storage of a credit card number, expiration date, and CVC should be handled securely to protect against fraudulent use. Only the creditcard is sent with the form but no information is saved in the database.*

The month will not be in the past currently as the first year is the current year, 2019. Future enhancement might be to dynamically populate the year pull-down and only include current and future years.

The CVC number cannot be longer than 4 digits on the form. Note: Unfortunately, there is an issue with the regex "pattern" to ensure the CVC is at least 3 digits.

_Note: This logic needs to be optimized, maybe to match `Create Membership`._

### Validate Credit Card ###

*Disclaimer*:
*This is just for demonstration purposes. The transmission and storage of a credit card number, expiration date, and CVC should be handled securely to protect against fraudulent use.*

```
- Purpose: Handles credit card validation for Create Membership
- Template: None
- View: validate_credit_card
- Path: None
```
```
+---------------------------------------------------------------------------------------------+
| Steps                                                | Data                                 |
+------------------------------------------------------+--------------------------------------+
| 1. Convert the input string into a list of ints      | 4 5 5 6 7 3 7 5 8 6 8 9 9 8 5 5      |
| 2. Slice off the last digit. That is the check digit | 4 5 5 6 7 3 7 5 8 6 8 9 9 8 5        |
| 3. Reverse the digits.                               | 5 8 9 9 8 6 8 5 7 3 7 6 5 5 4        |
| 4. Double every other element in the reversed list   | 10 8 18 9 16 6 16 5 14 3 14 6 10 5 8 |
| 5. Subtract nine from numbers over nine              | 1 8 9 9 7 6 7 5 5 3 5 6 1 5 8        |
| 6. Sum all values                                    | 85                                   |
| 7. Take the second digit of that sum                 | 5                                    |
+------------------------------------------------------+--------------------------------------+
| Result: If the resulting number matches the check digit, the whole card number is valid.    |
+---------------------------------------------------------------------------------------------+
```
Note: This is copied verbatim from the PDX Code Guild Bootcamp Python Lab 20.

### Create Membership ###

```
- Purpose: Handles creation of membership
- Template: None
- View: create_membership
- Path: create_membership/
```

This view handles the form submission for the `purchase_membership` form. The same checks done for the template view `Purchase Membership` are performed here, *belt and suspenders*.
1. `is not isconfirmed`
2. `is not isactive`
3. `validate_credit_card`
4. `level == "Premium" and not isexpired`

If all these checks succeed, the membership is created and saved in the database.

**First**, (a) the current membership (object) is fetched, (b) the membership_type object is fetched based on selection made on the form, and (c) the date/time one year from current date (`timezone.now()`) (+366 days).
(***Not currently accounting for leap years, the next being 2020.***)

**Second**, the user's membership record is updated in the database.

**Third**, the Transaction table is update is the purchase date, membership purchase, and the current user.

**Fourth**, the user's first and last name is added to their User record.

**Fifth**, the Billing (address) Information is added to the database. Some improvements need to be made here:
If a record for the user already exists, the form will have been pre-populated. The data transmitted via the form submission is used to update the record. If a records does not exist, the data transmitted will be used to create a new record.

**Sixth**, the Membership Purchase email is sent.

**Lastly**, the user is redirected to the page that matches the Membership purchased.

### Inactive Account ###

```
- Purpose: Displays Inactive Account page
- Template: inactive.html
- View: inactive
- Path: inactive/
```

This view displays the Inactive Membership page which is used as a path to the customer service funnel.

It is shown when a user with an inactive membership tries to access a member-only page or purchase a membership.

### Account Error ###

```
- Purpose: Displays Account Error page
- Template: error.html
- View: account_error
- Path: account_error/
```

This view displays the Error page which is used as a path to the customer service funnel.

It is shown when a user with an inactive membership tries to access a member-only page.

<div style="height:25px">&nbsp;</div>

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
purchaser                   ForeignKey(User)
```
