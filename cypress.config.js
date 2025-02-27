const { defineConfig } = require("cypress");

module.exports = defineConfig({
  modifyObstructiveCode: false,
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    experimentalMemoryManagement: true,
    numTestsKeptInMemory: 1
  },
});
