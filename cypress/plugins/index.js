/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
// module.exports = (on, config) => {
//   // `on` is used to hook into various events Cypress emits
//   // `config` is the resolved Cypress config
// }

// SOURCES:
// https://stackoverflow.com/questions/64083677/sample-database-connection-to-sqlite-database-in-cypress
// MacOS specific: https://github.com/cypress-io/cypress/issues/9078
//            and: https://docs.cypress.io/guides/references/configuration.html#Node-version (cypress.json)

const sqlite3 = require('sqlite3').verbose();
module.exports = (on, _config) => {
    on('task', {
         queryDb: queryTestDb,
         //wait: timeout,
    });
};

var path='/Users/larrymoiola/software_dev/GitHub/django_projects/registration-rbac/db.sqlite3'
function queryTestDb(sql) {
    let db = new sqlite3.Database(path);
    return new Promise((resolve, reject) => {
        db.all(sql, [], (err, rows) => {
        if(err)
            reject(err);

        else  {
          db.close();
          console.log(rows)
          return resolve(rows);
        }//End else

      });//End db.run

    });
}
