(() => {
  const cheerio = require("cheerio");

  function scrapePersons(
    PAGE_CONTENT,
    WEBSITE_YEAR,
    NAME_SELECTOR,
    ADDRESS_SELECTOR
  ) {
    const $ = cheerio.load(PAGE_CONTENT);
    const result = [];

    $("br").replaceWith(",");
    $("table").each((index, element) => {
      const name = $($(element).find(NAME_SELECTOR))
        .text()
        .replace(/\ \u00a0\ \u00a0\ /g, ",")
        .split(",");
      const address = $($(element).find(ADDRESS_SELECTOR))
        .text()
        .split(",");

      if (WEBSITE_YEAR) {
        result.push({
          firstname: name[0],
          surname: name[1],
          street: address[1] + " " + address[2],
          city: address[5],
          areacode: address[6]
        });
      } else {
        result.push({
          firstname: name[0],
          surname: name[1],
          street: address[0],
          city: address[1],
          areacode: address[2]
        });
      }
    });
    return result;
  }

  module.exports = {
    scrapePersons
  };
})();
