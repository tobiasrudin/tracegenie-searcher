(() => {
  function getAlbaHeaders() {
    return [
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
    ];
  }

  function mapAlbaColumns(person) {
    return [
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
    ];
  }

  module.exports = { getAlbaHeaders, mapAlbaColumns };
})();
