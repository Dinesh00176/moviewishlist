import mongoose from "mongoose";
import Movie from "../models/Movie.js";

if (!mongoose.connections[0].readyState) {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
}

export default async function handler(req, res) {
  const method = req.method;

  switch (method) {
    case "GET":
      const movies = await Movie.find();
      res.status(200).json(movies);
      break;

    case "POST":
      const movie = new Movie(req.body);
      await movie.save();
      res.status(201).json(movie);
      break;

    case "DELETE":
      const { id } = req.query;
      await Movie.findByIdAndDelete(id);
      res.status(200).json({ message: "Movie deleted" });
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
