(() => {
  function AddAlbaHeaders(array) {
    array.unshift([
      "Address_ID",
      "Territory_ID",
      "Language",
      "Status",
      "Name",
      "Suite",
      "Address",
      "City",
      "Province",
      "Postal_code",
      "Country",
      "Latitude",
      "Longitude",
      "Telephone",
      "Notes",
      "Notes_private"
    ]);
  }

  module.exports = AddAlbaHeaders;
})();
