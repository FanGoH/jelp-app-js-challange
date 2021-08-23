const { generateDummyRecords } = require("./populate/generateDummyRecords");
const { sendRecordsToServer } = require("./populate/sendToServer");

const main = async (numberOfReservations = 20, numberOfRooms = 15) => {
  const dummyRecords = await generateDummyRecords(
    numberOfReservations,
    numberOfRooms
  );

  sendRecordsToServer(dummyRecords);
};

main();
