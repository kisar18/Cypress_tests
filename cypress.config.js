const { defineConfig } = require("cypress");

module.exports = defineConfig({
  modifyObstructiveCode: false,
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    retries: {
      runMode: 1,
      openMode: 1
    },
    experimentalMemoryManagement: true,
    numTestsKeptInMemory: 1
  },
})
