(() => {
  require("dotenv").config();
  const tracegenieSearcher = require("./src/tracegenie-searcher");

  const WEBSITE = process.env.WEBSITE;
  const USERNAME = process.env.USERNAME;
  const PASSWORD = process.env.PASSWORD;

  tracegenieSearcher.login(WEBSITE, USERNAME, PASSWORD);
})();
