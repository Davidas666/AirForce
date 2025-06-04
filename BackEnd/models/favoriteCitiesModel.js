import mongoose from "mongoose";

const favoriteCitiesSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  cities: [{ type: String }]
});

const FavoriteCities = mongoose.model("FavoriteCities", favoriteCitiesSchema);

export default FavoriteCities;