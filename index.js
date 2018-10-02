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

  const NAME_LIST_PATH = process.env.NAME_LIST_PATH;
  const NAME_LIST_PATH_TEMP = process.env.NAME_LIST_PATH_TEMP;

  const AREA_CODE_LIST_PATH = process.env.AREA_CODE_LIST_PATH;
  const AREA_CODE_LIST_PATH_TEMP = process.env.AREA_CODE_LIST_PATH_TEMP;

  const RESULT_LIST_TEMP = process.env.RESULT_LIST_TEMP;

  /*
  Read list of names
  */
  let nameListTemp;
  const NAME_LIST = babyparse
    .parse(await fileSystemHelper.readFile(NAME_LIST_PATH))
    .data.map(element => element[0]);
  if (await fileSystemHelper.fileExists(NAME_LIST_PATH_TEMP)) {
    nameListTemp = babyparse
      .parse(await fileSystemHelper.readFile(NAME_LIST_PATH_TEMP))
      .data.map(element => element[0]);
  } else {
    nameListTemp = NAME_LIST.slice();
  }

  /*
  Read list of area codes
  */
  let areaCodeList;
  if (await fileSystemHelper.fileExists(AREA_CODE_LIST_PATH_TEMP)) {
    areaCodeList = await fileSystemHelper.readFile(AREA_CODE_LIST_PATH_TEMP);
  } else {
    areaCodeList = await fileSystemHelper.readFile(AREA_CODE_LIST_PATH);
  }
  areaCodeList = babyparse.parse(areaCodeList).data.map(element => element[0]);

  let areaCodeListTemp = areaCodeList.slice();

  /*
  Check if unfinished earlier search
  */
  let results;
  if (await fileSystemHelper.fileExists(RESULT_LIST_TEMP)) {
    results = babyparse.parse(await fileSystemHelper.readFile(RESULT_LIST_TEMP))
      .data;
  } else {
    results = [];
  }

  await tracegenieSearcher.login(WEBSITE, USERNAME, PASSWORD);

  for (let areaCode of areaCodeList) {
    searchNameList = nameListTemp.slice();
    for (let name of searchNameList) {
      let tempResults = await tracegenieSearcher.search(name, areaCode);
      results = results.concat(tempResults);

      nameListTemp.shift();
      if (nameListTemp.length > 0) {
        await fileSystemHelper.writeFile(NAME_LIST_PATH_TEMP, nameListTemp);
      } else {
        await fileSystemHelper.writeFile(NAME_LIST_PATH_TEMP, "");
      }
      await fileSystemHelper.writeFile(
        RESULT_LIST_TEMP,
        babyparse.unparse(results)
      );
    }
    nameListTemp = NAME_LIST.slice();
    areaCodeListTemp.shift();
    if (areaCodeList.length > 0) {
      await fileSystemHelper.writeFile(
        AREA_CODE_LIST_PATH_TEMP,
        areaCodeListTemp
      );
    } else {
      await fileSystemHelper.writeFile(AREA_CODE_LIST_PATH_TEMP, "");
    }
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

  /*
    Cleaning up
    */
  await fileSystemHelper.removeFile(AREA_CODE_LIST_PATH_TEMP);
  await fileSystemHelper.removeFile(NAME_LIST_PATH_TEMP);
  await fileSystemHelper.removeFile(RESULT_LIST_TEMP);
})();
