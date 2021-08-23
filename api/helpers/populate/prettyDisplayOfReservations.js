const dayjs = require("dayjs");

const prettyDisplayOfRecords = (records) => {
  const finalThing = {};

  records.forEach((record) => {
    const { startDate, endDate, roomNo } = record;

    for (
      let i = 0;
      dayjs(startDate).add(i, "day").diff(dayjs(endDate), "days") <= 0;
      i++
    ) {
      const currentDay = dayjs(startDate).add(i, "day").toDate().toDateString();

      if (Object.keys(finalThing).includes(currentDay)) {
        finalThing[currentDay].push({ name: record.clientName, roomNo });
      } else {
        finalThing[currentDay] = [{ name: record.clientName, roomNo }];
      }
    }
  });

  const finalFinalThing = Object.keys(finalThing)
    .sort((a, b) => new Date(a) - new Date(b))
    .map((date) => ({ date, reservations: finalThing[date] }));

  return finalFinalThing;
};

module.exports = {
  prettyDisplayOfRecords,
};
