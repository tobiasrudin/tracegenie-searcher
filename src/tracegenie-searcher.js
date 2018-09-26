(() => {
  let page;

  function login(WEBSITE, USERNAME, PASSWORD) {
    return new Promise((resolve, reject) => {
      const puppeteer = require("puppeteer");

      function delay(timeout) {
        return new Promise(resolve => {
          setTimeout(resolve, timeout);
        });
      }

      (async () => {
        const browser = await puppeteer.launch({ headless: false });
        page = await browser.newPage();
        await page.setViewport({ width: 1024, height: 768 });
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

        await delay(500);

        await Promise.all([
          page.$eval("#resource-link-folder-3", el => el.click()),
          page.waitForNavigation({ waitUntil: "networkidle2" })
        ]);
        resolve();
      })();
    });
  }

  function search(SURNAME, AREACODE) {
    (async () => {
      await page.$eval(
        "input[name=q52]",
        (el, value) => (el.value = value),
        SURNAME
      );

      await page.$eval("input[name=q3222]", el => (el.value = ""));

      await page.$eval(
        "input[name=q32]",
        (el, value) => (el.value = value),
        AREACODE
      );

      page.click("#ajax_bt8");
    })();
  }

  module.exports = {
    login,
    search
  };
})();
