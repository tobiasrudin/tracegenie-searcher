(() => {
  function getDateTimeString() {
    const d = new Date();
    const date = formatDate(d);
    const time = d
      .toTimeString()
      .split(" ")[0]
      .split(":")
      .join("-");
    return date + "_" + time;
  }

  function formatDate(date) {
    var d = new Date(date),
      month = "" + (d.getMonth() + 1),
      day = "" + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  }
  module.exports = getDateTimeString;
})();
