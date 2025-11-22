import app from "./app.js";
import connectMongo from "./config/mongo.js";
import connectPostgres from "./config/postgres.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
  console.log("Starting bhetiyo backend...");

  await connectMongo();
  await connectPostgres();

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
