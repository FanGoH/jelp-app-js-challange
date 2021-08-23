const dayjs = require("dayjs");
const axios = require("axios");

const { verifyAvailability } = require("./verifyAvailability");
const { getRandomInt, getRandomPickForArray } = require("./helpers");

const generateDummyRecords = async (noRecords, noOfRooms) => {
  const names = (
    await axios.get(
      `https://randomuser.me/api/?inc=name&noinfo&results=${noRecords}&nat=us`
    )
  ).data.results.map((obj) => obj.name.first);

  const today = dayjs();

  const records = [];

  for (let i = 0; i < noRecords; i++) {
    const startDateDelay = getRandomInt(0, 7);
    const endDateDelay = getRandomInt(startDateDelay, 7);

    const proposedStart = today
      .add(startDateDelay, "day")
      .toDate()
      .toDateString();
    const proposedEnd = today.add(endDateDelay, "day").toDate().toDateString();

    const daysAvailable = verifyAvailability(
      records,
      {
        clientName: names[i],
        startDate: proposedStart,
        endDate: proposedEnd,
      },
      noOfRooms
    );

    if (daysAvailable.length === 0) {
      console.log("This registration cannot be made");
      continue;
    }

    records.push({
      clientName: names[i],
      roomNo: getRandomPickForArray(daysAvailable),
      startDate: proposedStart,
      endDate: proposedEnd,
    });
  }

  return records;
};

module.exports = {
  generateDummyRecords,
};
