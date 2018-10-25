(() => {
  let browser;
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

  async function search(SURNAME, AREACODE) {
    let page = await browser.newPage();
    return new Promise((resolve, reject) => {
      let PAGE_NUMBER = 0;
      let hasResults = true;
      let results = [];
      (async () => {
        while (hasResults) {
          try {
            console.log(
              'Searching ' + 
              SURNAME + 
              ' in ' + 
              AREACODE + 
              ' - p' + 
              PAGE_NUMBER);
              
              await page.goto(
              "https://www.tracegenie.com/amember4/amember/1DAY/14ntmysqliunion9.php?" +
                pageString(PAGE_NUMBER) +
                "q52=" +
                SURNAME +
                "&q3222=&q222=&q32=" +
                AREACODE,
              { waitUntil: "networkidle2" }
            );

            const $ = cheerio.load(await page.content());
            $("br").replaceWith(",");
            $("table").each((index, element) => {
              const name = $($(element).find("th:nth-child(2)"))
                .text()
                .replace(/\ \u00a0\ \u00a0\ /g, ",")
                .split(",");
              const address = $($(element).find("td > h4:nth-child(1)"))
                .text()
                .split(",");
              let person = {
                firstname: name[0],
                surname: name[1],
                street: address[0],
                city: address[1],
                areacode: address[2]
              };

              if (
                person.surname
                  .toUpperCase()
                  .split(" ")
                  .includes(SURNAME.toUpperCase().trim())
              ) {
                results.push(person);
              }
            });

            hasResults = $("table").length ? true : false;
            PAGE_NUMBER += 1;
          } catch (e) {
            if(!e.toString().includes('Navigation')) console.log(e.toString());
          }
        }
        resolve(results);
      })();
    });
  }

  module.exports = {
    login,
    search
  };
})();
