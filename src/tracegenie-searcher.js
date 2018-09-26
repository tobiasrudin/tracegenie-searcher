(() => {
  function login(WEBSITE, USERNAME, PASSWORD) {
    const puppeteer = require("puppeteer");

    function delay(timeout) {
      return new Promise(resolve => {
        setTimeout(resolve, timeout);
      });
    }

    (async () => {
      const browser = await puppeteer.launch({ headless: false });
      const page = await browser.newPage();
      await page.goto(WEBSITE);

      await page.$eval(
        "input[name=amember_pass]",
        (el, value) => (el.value = value),
        PASSWORD
      );
      await page.$eval(
        "input[name=amember_login]",
        (el, value) => (el.value = value),
        USERNAME
      );

      await Promise.all([
        page.click('input[type="submit"]'),
        page.waitForNavigation({ waitUntil: "networkidle2" })
      ]);

      await delay(100);

      await Promise.all([
        page.$eval("#resource-link-folder-3", el => el.click()),
        page.waitForNavigation({ waitUntil: "networkidle2" })
      ]);
    })();
  }

  module.exports = {
    login
  };
})();
