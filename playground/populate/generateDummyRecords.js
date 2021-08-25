const dayjs = require("dayjs");
const axios = require("axios");

//const { verifyAvailability } = require("./verifyAvailability");
const { getRandomInt } = require("./helpers");

const generateDummyRecords = async (
  noRecords,
  _noOfRooms,
  noOfDaysForward = 14
) => {
  const names = (
    await axios.get(
      `https://randomuser.me/api/?inc=name&noinfo&results=${noRecords}&nat=us`
    )
  ).data.results.map((obj) => obj.name.first);

  const today = dayjs();

  //const records = [];

  for (let i = 0; i < noRecords; i++) {
    const startDateDelay = getRandomInt(0, noOfDaysForward);
    const endDateDelay = getRandomInt(startDateDelay, noOfDaysForward);

    const proposedStart = today
      .add(startDateDelay, "day")
      .toDate()
      .toDateString();
    const proposedEnd = today.add(endDateDelay, "day").toDate().toDateString();

    const daysAvailable = (
      await axios.post("http://localhost:1337/availability", {
        startDate: proposedStart,
        endDate: proposedEnd,
      })
    ).data;

    // verifyAvailability(
    //       records,
    //       {
    //         clientName: names[i],
    //         startDate: proposedStart,
    //         endDate: proposedEnd,
    //       },
    //       noOfRooms
    //     );

    if (daysAvailable.length === 0) {
      console.log("This registration cannot be made");
      continue;
    }

    await axios.post("http://localhost:1337/reservations", {
      clientName: names[i],
      startDate: proposedStart,
      endDate: proposedEnd,
    });

    // records.push({
    //   clientName: names[i],
    //   startDate: proposedStart,
    //   endDate: proposedEnd,
    // });
  }

  //  return records;
};

module.exports = {
  generateDummyRecords,
};
