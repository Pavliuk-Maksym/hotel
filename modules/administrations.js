import mongoose from "mongoose";

const Schema = mongoose.Schema;

const administrationSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const Admin = mongoose.model("administrations", administrationSchema);

export default Admin;
