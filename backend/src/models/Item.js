import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["lost", "found"], required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  locationText: { type: String, default: "" },
  imageUrl: { type: String, default: "" },       // store path or URL
  embedding: { type: [Number], default: [] },     // text embedding (array of floats)
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ["open", "closed"], default: "open" }
});

export default mongoose.model("Item", ItemSchema);
