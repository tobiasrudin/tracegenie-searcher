(() => {
  let page;
  const cheerio = require("cheerio");

  function login(WEBSITE, USERNAME, PASSWORD) {
    console.log("logging in");
    return new Promise((resolve, reject) => {
      const puppeteer = require("puppeteer");

      (async () => {
        try {
          const OPTIONS = {
            //headless: false
          };
          const browser = await puppeteer.launch(OPTIONS);
          page = await browser.newPage();

          await page.setViewport({ width: 1200, height: 800 });
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
            page.waitForNavigation({ waitUntil: "networkidle2" }),
            page.waitForSelector("#resource-link-folder-3")
          ]);
          resolve();
        } catch (error) {
          console.log(error);
        }
      })();
    });
  }

  function pageString(PAGE_NUMBER) {
    if (PAGE_NUMBER == 0) {
      return "";
    } else {
      return "s=" + PAGE_NUMBER * 5 + "&";
    }
  }

  function search(SURNAME, AREACODE) {
    console.log("searching name: " + SURNAME + ", area code: " + AREACODE);
    return new Promise((resolve, reject) => {
      let PAGE_NUMBER = 0;
      let hasResults = true;
      let results = [];
      (async () => {
        try {
          while (hasResults) {
            await page.goto(
              "https://www.tracegenie.com/amember4/amember/1DAY/14ntmysqliunion9.php?" +
                pageString(PAGE_NUMBER) +
                "q52=" +
                SURNAME +
                "&q3222=&q222=&q32=" +
                AREACODE +
                "&D59=",
              { waitUntil: "networkidle2" }
            );

            const $ = cheerio.load(await page.content());
            $("br").replaceWith(",");
            $("table").each((index, element) => {
              const name = $($(element).find("th:nth-child(2)"))
                .text()
                .match(/\S+/g);
              const address = $($(element).find("td > h4:nth-child(1)"))
                .text()
                .split(",");
              const person = {
                firstname: name[0],
                surname: name[1],
                street: address[0],
                city: address[1],
                areacode: address[2]
              };
              results.push(person);
            });

            hasResults = $("table").length ? true : false;
            PAGE_NUMBER += 1;
          }
          resolve(results);
        } catch (e) {
          console.log(e);
        }
      })();
    });
  }

  module.exports = {
    login,
    search
  };
})();
