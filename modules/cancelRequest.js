import mongoose from "mongoose";

const Schema = mongoose.Schema;

const cancelRequestSchema = new Schema({
  bookingId: { type: Schema.Types.ObjectId, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  fullName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  hotelCity: { type: String, required: true },
  classRoom: { type: String, required: true },
  date: { type: String, required: true },
  price: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "confirmed", "declined"],
    default: "pending",
  },
  refundAmount: { type: Number },
  refundPercentage: { type: Number },
  adminComment: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const CancelRequest = mongoose.model("cancelRequest", cancelRequestSchema);

export default CancelRequest;
