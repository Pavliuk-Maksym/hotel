import mongoose from "mongoose";

const Schema = mongoose.Schema;

const roomsSchema = new Schema({
  hotelCity: String,
  classRoom: String,
  price: Number,
  quantity: Number,
  image: Array,
  description: String,
});

const Room = mongoose.model("rooms", roomsSchema);

export default Room;
