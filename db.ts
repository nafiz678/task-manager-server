import { MongoClient, Db, ServerApiVersion } from "mongodb";
require("dotenv").config();

const uri = `${process.env.MONGO_URI}`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db: Db | null = null;

export async function connectDB(): Promise<Db> {

  if (!db) {
    await client.connect();
    db = client.db("Task-Manager");
  }

  try {
    const db = await client.connect();
    const database = client.db("Task-Manager"); 

    console.log("Connected to MongoDB");
    // Should show "collections"

    return database;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
}

export { client };
