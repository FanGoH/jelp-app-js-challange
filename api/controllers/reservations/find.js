const dayjs = require("dayjs");

module.exports = {
  friendlyName: "Find",

  description: "Find reservations.",

  inputs: {
    id: {
      type: "string",
      description:
        "The ID for the reservation that is being queried, can be the MongoDB ID or reservationId property",
    },
    orderStatus: {
      type: "string",
      description:
        "Query with the status of the reservation, by default, it ignores the 'cancelled' reservations, you can pass 'all' to return every reservation",
      isIn: ["all", "active", "cancelled"],
    },
    sortStart: {
      type: "boolean",
      description: "Sort the results by startDate",
    },
  },

  exits: {
    reservationNotFound: {
      description: "There is no reservation with this ID",
      responseType: "notFound",
    },
  },

  fn: async function ({ id, orderStatus, sortStart }) {
    const orderStatusToQuery = orderStatus || "active";

    if (id) {
      const reservationToReturn = await Reservations.findOne({
        or: [{ id: id }, { reservationId: id }],
      });

      if (!reservationToReturn) {
        throw { reservationNotFound: "There is no reservation with this ID" };
      }

      return reservationToReturn;
    }

    let reservations;

    if (orderStatusToQuery) {
      if (orderStatusToQuery === "all") {
        reservations = await Reservations.find();
      } else {
        reservations = await Reservations.find({
          orderStatus: orderStatusToQuery,
        });
      }
    } else {
      reservations = await Reservations.find({ orderStatus: "active" });
    }

    if (sortStart) {
      reservations.sort((a, b) => dayjs(a.startDate).diff(b.startDate, "d"));
    }

    // All done.
    return reservations;
  },
};
