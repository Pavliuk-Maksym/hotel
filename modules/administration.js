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

const Admin = mongoose.model("administration", administrationSchema);

export default Admin;
