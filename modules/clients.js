import mongoose from "mongoose";

const Schema = mongoose.Schema;

const clientsSchema = new Schema({
  userName: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  classRoom: {
    type: String,
    required: true,
  },
});

const Client = mongoose.model("users", clientsSchema);

export default Client;
