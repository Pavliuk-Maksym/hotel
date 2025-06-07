import mongoose from "mongoose";

const Schema = mongoose.Schema;

const roomsSchema = new Schema({
  classRoom: String,
  price: Number,
  quantity: Number,
  image: Array,
});

const Room = mongoose.model("rooms", roomsSchema);

export default Room;
