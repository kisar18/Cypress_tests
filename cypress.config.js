const { defineConfig } = require("cypress")

module.exports = defineConfig({
  modifyObstructiveCode: false,
  e2e: {
    setupNodeEvents(on, config) {},
    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: 'cypress/results',
      overwrite: false,
      html: false,
      json: true
    },
    retries: {
      runMode: 1,
      openMode: 1
    },
    experimentalMemoryManagement: true,
    numTestsKeptInMemory: 1
  },
})
