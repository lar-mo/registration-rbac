const { defineConfig } = require('cypress')

module.exports = defineConfig({
  projectId: 'szy1dm',
  nodeVersion: 'system',
  e2e: {
    baseUrl: 'http://localhost:8000',
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    // specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
    specPattern: [
      'cypress/e2e/anonymous.spec.js',
      'cypress/e2e/unconfirmed.spec.js',
      'cypress/e2e/clc_link.spec.js',
      'cypress/e2e/confirmed_basic.spec.js',
      'cypress/e2e/inactive_membership.spec.js',
      'cypress/e2e/expired_membership.spec.js',
      'cypress/e2e/login_error.spec.js',
      'cypress/e2e/my_profile.spec.js',
      'cypress/e2e/plus.spec.js',
      'cypress/e2e/premium.spec.js',
      'cypress/e2e/purchase_flow.spec.js',
      // 'cypress/e2e/naked_domain_redir.spec.js',
      'cypress/e2e/user_lifecycle.spec.js',
    ]
  },
})
