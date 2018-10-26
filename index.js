(async () => {
  require("dotenv").config();
  const tracegenieSearcher = require("./src/tracegenie-searcher");
  const fileSystemHelper = require("./src/file-system-helper");
  const getDateTimeString = require("./src/get-date-time-string");
  const babyparse = require("babyparse");
  const AddAlbaHeaders = require("./src/add-alba-headers");

  const OUTPUT_PATH = process.env.OUTPUT_PATH;

  const WEBSITE = process.env.WEBSITE;
  const USERNAME = process.env.USERNAME;
  const PASSWORD = process.env.PASSWORD;
  const WEBSITE_YEAR = process.env.WEBSITE_YEAR;

  const NAME_LIST_PATH = process.env.NAME_LIST_PATH;
  const AREA_CODE_LIST_PATH = process.env.AREA_CODE_LIST_PATH;

  /*
  Read list of names
  */
  const NAME_LIST = babyparse
    .parse(await fileSystemHelper.readFile(NAME_LIST_PATH))
    .data.map(element => element[0]);

  /*
  Read list of area codes
  */
  let AREA_CODE_LIST = babyparse
    .parse(await fileSystemHelper.readFile(AREA_CODE_LIST_PATH))
    .data.map(element => element[0]);

  let results = [];

  await tracegenieSearcher.login(WEBSITE, USERNAME, PASSWORD);

  for (let areaCode of AREA_CODE_LIST) {
    let tempResults;
    let NAME_COUNTER = 1;

    try {
      tempResults = await Promise.all(
        NAME_LIST.map(
          name =>
            new Promise(async resolve => {
              if(WEBSITE_YEAR){
                result = await tracegenieSearcher.search_year(name, areaCode, WEBSITE_YEAR);
              } else {
                result = await tracegenieSearcher.search(name, areaCode);
              }
              console.log(
                "name: " +
                  name +
                  ", " +
                  " (" + 
                  NAME_COUNTER + 
                  " of " + 
                  NAME_LIST.length + 
                  "), " +
                  result.length +
                  " results for area " +
                  areaCode
              );
              NAME_COUNTER += 1;
              resolve(result);
            })
        )
      );
    } catch (error) {
      console.log(error);
    }
    results = results.concat(
      tempResults.reduce((accumulator, currentValue) =>
        accumulator.concat(currentValue)
      )
    );
  }

  results = results.map(person => [
    ,
    ,
    ,
    ,
    person.firstname + " " + person.surname,
    ,
    person.street,
    person.city,
    ,
    person.areacode,
    "England",
    ,
    ,
    ,
    ,
    ,
  ]);

  AddAlbaHeaders(results);

  console.log("final results: ", results);

  await fileSystemHelper.writeFile(
    OUTPUT_PATH + "/" + getDateTimeString() + ".csv",
    babyparse.unparse(results)
  );

  console.log(" \nFINISHED\n");
})();
