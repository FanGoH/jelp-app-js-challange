const axios = require("axios");

const sendRecordsToServer = async (records) => {
  records.forEach((record) => {
    axios.post("http://localhost:1337/reservations", record);
  });
};

module.exports = { sendRecordsToServer };
