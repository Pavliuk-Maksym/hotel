import mongoose from "mongoose";

const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  userName: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  date: String,
  time: String,
  beforeDate: String,
  hotelCity: String,
  classRoom: String,
  night: Number,
  price: Number,
  phoneNumber: {
    type: String,
    required: true,
  },
  fullName: String,
});

const Booking = mongoose.model("booking", bookingSchema);

export default Booking;
