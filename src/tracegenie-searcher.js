(() => {
  let browser;
  const domParser = require("./dom-parser");
  const fs = require('fs');

  function login(WEBSITE, USERNAME, PASSWORD) {
    return new Promise((resolve, reject) => {
      const puppeteer = require("puppeteer");

      (async () => {
        try {
          const OPTIONS = {
            //headless: false
          };
          browser = await puppeteer.launch(OPTIONS);
          let page = await browser.newPage();

          await page.setViewport({ width: 1200, height: 800 });
          await page.setDefaultNavigationTimeout(90000);
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
          console.log("logged in, starting search...");
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

  async function search(SURNAME, AREACODE, WEBSITE_YEAR) {
    let page = await browser.newPage();
    let RANDOM_TIMEOUT_TIME = Math.floor((Math.random() * 40000) + 50000);
    await page.setDefaultNavigationTimeout(RANDOM_TIMEOUT_TIME);
    return new Promise((resolve, reject) => {
      let PAGE_NUMBER = 0;
      let ATTEMPT_NUMBER = 0;
      let hasResults = true;
      const results = [];
      (async () => {
        while (hasResults) {
          try {
            ATTEMPT_NUMBER += 1;
            if (ATTEMPT_NUMBER == 50) {
              console.log(
                "WARNING: Searching " +
                  SURNAME +
                  " in " +
                  AREACODE +
                  " " +
                  WEBSITE_YEAR +
                  " attempted p" +
                  PAGE_NUMBER +
                  " 50 times, 50 tries remaining..."
              );
            }
            if(ATTEMPT_NUMBER == 100) {
              let error_message = 'ERROR: Searching ' + 
              SURNAME + 
              ' in ' + 
              AREACODE + 
              ' failed on p' + 
              PAGE_NUMBER;
              console.log(error_message + '\r\n');
              fs.appendFile('error_log.txt', SURNAME + ', ' + AREACODE + '\r\n', function (err) {
                if (err) throw err;
                resolve([]);//Exit
              });
            }

            if (WEBSITE_YEAR) {
              await page.goto(
                "https://www.tracegenie.com/amember4/amember/1DAY/" +
                  WEBSITE_YEAR +
                  "nt.php?" +
                  pageString(PAGE_NUMBER) +
                  "q52=" +
                  SURNAME +
                  "*&q3222=&D79=&q222=&q322=" +
                  AREACODE,
                { waitUntil: "networkidle2" }
              );
              var NAME_SELECTOR = ".c200 b";
              var ADDRESS_SELECTOR = "tr:nth-child(2) td b:first-child";
            } else {
              await page.goto(
                "https://www.tracegenie.com/amember4/amember/1DAY/14ntmysqliunion9.php?" +
                  pageString(PAGE_NUMBER) +
                  "q52=" +
                  SURNAME +
                  "&q3222=&q222=&q32=" +
                  AREACODE,
                { waitUntil: "networkidle2" }
              );
              var NAME_SELECTOR = "th:nth-child(2)";
              var ADDRESS_SELECTOR = "td > h4:nth-child(1)";
            }

            ATTEMPT_NUMBER = 0;
            let pageContent = await page.content();

            const scrapeResult = domParser.scrapePersons(
              pageContent,
              WEBSITE_YEAR,
              NAME_SELECTOR,
              ADDRESS_SELECTOR
            );

            for (let person of scrapeResult) {
              if (
                person.surname
                  .toUpperCase()
                  .split(" ")
                  .includes(SURNAME.toUpperCase().trim()) &&
                (await nameInLatestYear(person, SURNAME))
              ) {
                results.push(person);
              }
            }

            hasResults = scrapeResult.length ? true : false;

            PAGE_NUMBER += 1;
          } catch (e) {
            if (!e.toString().includes("Navigation")) console.log(e.toString());
          }
        }
        await page.close();
        resolve(results);
      })();
    });
  }

  function nameInLatestYear(person, SURNAME) {
    return new Promise(async (resolve, reject) => {
      let page = await browser.newPage();
      await page.setDefaultNavigationTimeout(90000);

      await page.goto(
        "https://www.tracegenie.com/amember4/amember/1DAY/occs.php?q52o=" +
          person.street +
          "&q322o=" +
          person.areacode,
        { waitUntil: "networkidle2" }
      );

      let pageContent = await page.content();
      await page.close();
      let names = domParser.scrapePossibleOptOut(pageContent);
      if (names.some(array => array.includes(SURNAME.toUpperCase().trim()))) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }

  module.exports = {
    login,
    search
  };
})();
