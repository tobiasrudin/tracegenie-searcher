(async () => {
  require("dotenv").config();
  const tracegenieSearcher = require("./src/tracegenie-searcher");
  const fileSystemHelper = require("./src/file-system-helper");
  const getDateTimeString = require("./src/get-date-time-string");
  const babyparse = require("babyparse");
  const albaHelper = require("./src/alba-helper");

  const OUTPUT_PATH = process.env.OUTPUT_PATH;

  const WEBSITE = process.env.WEBSITE;
  const USERNAME = process.env.USERNAME;
  const PASSWORD = process.env.PASSWORD;
  const WEBSITE_YEAR = process.env.WEBSITE_YEAR;

  const NAME_LIST_PATH = process.env.NAME_LIST_PATH;
  const AREA_CODE_LIST_PATH = process.env.AREA_CODE_LIST_PATH;
  const TEMP_RESULT_PATH = "tmpresults.csv";

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

  await fileSystemHelper.writeFile(
    TEMP_RESULT_PATH,
    babyparse.unparse([albaHelper.getAlbaHeaders()])
  );

  const tempFileStream = fileSystemHelper.getWriteStream(TEMP_RESULT_PATH);
  tempFileStream.on("error", error => {
    console.log(error);
  });

  await tracegenieSearcher.login(WEBSITE, USERNAME, PASSWORD);

  for (let [index, areaCode] of AREA_CODE_LIST.entries()) {
    let tempResults;
    let NAME_COUNTER = 1 + (index * NAME_LIST.length);

    try {
      tempResults = await Promise.all(
        NAME_LIST.map(
          name =>
            new Promise(async resolve => {
              result = await tracegenieSearcher.search(
                name,
                areaCode,
                WEBSITE_YEAR
              );

              console.log(
                "name: " +
                  name +
                  ", " +
                  " (" +
                  NAME_COUNTER +
                  " of " +
                  NAME_LIST.length * AREA_CODE_LIST.length +
                  "), " +
                  result.length +
                  " results for area " +
                  areaCode
              );
              NAME_COUNTER += 1;
              if (result.length) {
                let tempFileResults = result.map(albaHelper.mapAlbaColumns);

                tempFileStream.write("\n" + babyparse.unparse(tempFileResults));
              }
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

  await fileSystemHelper.writeFile(
    OUTPUT_PATH + "/results_" + getDateTimeString() + ".csv",
    babyparse.unparse(results)
  );

  tempFileStream.on("finish", async function() {
    await fileSystemHelper.renameFile(
      TEMP_RESULT_PATH,
      OUTPUT_PATH + "/" + getDateTimeString() + ".csv"
    );

    console.log(" \nFINISHED. " + results.length + " Addresses Found\n");
  });
  tempFileStream.end();
})();
