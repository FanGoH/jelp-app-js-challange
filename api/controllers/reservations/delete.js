module.exports = {
  friendlyName: "Delete",

  description: "Delete reservations.",

  inputs: {
    id: {
      type: "string",
      description:
        "The Mongo ID or reservationID of the order to cancel/delete",
      required: true,
    },
    keep: {
      type: "boolean",
      description:
        "Setting this parameter to true won't delete the reservation for the database, it will change it's status to \"cancelled\", which makes it invisible for most operations",
    },
  },

  exits: {
    reservationNotFound: {
      description: "There is no reservation with this ID",
      responseType: "notFound",
    },
  },

  fn: async function ({ id, keep }) {
    if (keep) {
      const updatedReservation = await Reservations.updateOne({
        or: [{ id: id }, { reservationId: id }],
      }).set({ orderStatus: "cancelled" });

      return updatedReservation;
    }

    const deletedReservation = await Reservations.destroyOne({
      or: [{ id: id }, { reservationId: id }],
    });

    // All done.
    return deletedReservation;
  },
};
