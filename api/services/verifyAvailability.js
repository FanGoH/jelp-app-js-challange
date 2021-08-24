const dayjs = require("dayjs");

const verifyAvailability = (records, intendedRegistration, noOfRooms) => {
  const { startDate, endDate } = intendedRegistration;

  const roomsOcuppiedDays = {};

  for (
    let i = 0;
    dayjs(startDate).add(i, "day").diff(dayjs(endDate), "days") <= 0;
    i++
  ) {
    const currentDay = dayjs(startDate).add(i, "day").toDate().toDateString();

    roomsOcuppiedDays[currentDay] = new Array(noOfRooms)
      .fill(0)
      .map((_, idx) => idx + 1);
  }

  const overlappingKeys = Object.keys(roomsOcuppiedDays);

  records.forEach((record) => {
    const { startDate, endDate, roomNo } = record;

    for (
      let i = 0;
      dayjs(startDate).add(i, "day").diff(dayjs(endDate), "days") <= 0;
      i++
    ) {
      const currentDay = dayjs(startDate).add(i, "day").toDate().toDateString();

      if (overlappingKeys.includes(currentDay)) {
        roomsOcuppiedDays[currentDay] = roomsOcuppiedDays[currentDay].filter(
          (availableRoom) => availableRoom !== roomNo
        );
      }
    }
  });

  const availabilityOfRoomsPerDays = Object.values(roomsOcuppiedDays);

  const canAccomodateIn = new Array(noOfRooms)
    .fill(0)
    .map((_, idx) => idx + 1)
    .filter((roomNumber) =>
      availabilityOfRoomsPerDays.every((arrayOfRooms) =>
        arrayOfRooms.includes(roomNumber)
      )
    );

  return canAccomodateIn;
};

module.exports = {
  verifyAvailability,
};
