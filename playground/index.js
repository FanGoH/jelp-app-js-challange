const { generateDummyRecords } = require("./populate/generateDummyRecords");
const { sendRecordsToServer } = require("./populate/sendToServer");

const main = async (
  numberOfReservations = 20,
  numberOfRooms = 15,
  noOfDaysForward = 14
) => {
  const dummyRecords = await generateDummyRecords(
    numberOfReservations,
    numberOfRooms,
    noOfDaysForward
  );

  sendRecordsToServer(dummyRecords);
};

main();
