(() => {
  const fs = require("fs");

  function readFile(FILEPATH) {
    console.log("reading file: " + FILEPATH);
    return new Promise((resolve, reject) => {
      fs.readFile(FILEPATH, "utf8", (err, data) => {
        if (err) {
          console.log("ERROR: Couldn't read file: " + FILEPATH);
          reject(err);
        }
        resolve(data);
      });
    });
  }

  function writeFile(FILEPATH, DATA) {
    console.log("writing file: " + FILEPATH);
    return new Promise((resolve, reject) => {
      fs.writeFile(FILEPATH, DATA, err => {
        if (err) {
          console.log("ERROR: Couldn't write file: " + FILEPATH);
          reject(err);
        }
        resolve();
      });
    });
  }

  function removeFile(FILEPATH) {
    console.log("Removing file: " + FILEPATH);
    return new Promise((resolve, reject) => {
      fs.unlink(FILEPATH, err => {
        if (err) {
          console.log("ERROR: Couldn't remove file: " + FILEPATH);
          reject(err);
        }
        resolve();
      });
    });
  }

  function fileExists(FILEPATH) {
    console.log("checking file exists: " + FILEPATH);
    return new Promise((resolve, reject) => {
      fs.access(FILEPATH, fs.constants.F_OK, err => {
        if (err) {
          resolve(false);
        }
        resolve(true);
      });
    });
  }

  function renameFile(OLD_FILEPATH, NEW_FILEPATH) {
    return new Promise((resolve, reject) => {
      fs.rename(OLD_FILEPATH, NEW_FILEPATH, err => {
        if (err) {
          resolve(false);
        }
        resolve(true);
      });
    });
  }

  function getWriteStream(FILEPATH) {
    return fs.createWriteStream(FILEPATH, { flags: "a" });
  }

  module.exports = {
    readFile,
    writeFile,
    removeFile,
    fileExists,
    renameFile,
    getWriteStream
  };
})();
