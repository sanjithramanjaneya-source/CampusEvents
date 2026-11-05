import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI ?? "mongodb://localhost:27017";
const globalForMongo = globalThis as unknown as {
  mongoClient?: Promise<MongoClient>;
};

function getClient() {
  if (!globalForMongo.mongoClient) {
    globalForMongo.mongoClient = new MongoClient(uri, {
      serverSelectionTimeoutMS: 3000,
    })
      .connect()
      .catch((err) => {
        globalForMongo.mongoClient = undefined; // try again on the next request
        throw err;
      });
  }
  return globalForMongo.mongoClient;
}

// One review per student per event (enforced by a unique index).
export async function feedbackCollection() {
  const client = await getClient();
  const col = client
    .db(process.env.MONGODB_DB ?? "campus_events")
    .collection("feedback");
  await col.createIndex({ event_id: 1, user_id: 1 }, { unique: true });
  return col;
}