const { Schema, model } = require("mongoose");

const NotificationSchema = new Schema(
  {
    reciever_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    view: { type: Boolean, default: false },
  },
  { timestamps: true }
);

exports.Notification = model("Notification", NotificationSchema);

