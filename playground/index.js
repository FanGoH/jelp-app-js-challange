const { generateDummyRecords } = require("./populate/generateDummyRecords");

const main = async (
  numberOfReservations = 20,
  numberOfRooms = 15,
  noOfDaysForward = 14
) => {
  await generateDummyRecords(
    numberOfReservations,
    numberOfRooms,
    noOfDaysForward
  );
};

main();
