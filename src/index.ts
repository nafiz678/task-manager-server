import { Hono } from "hono";
import { connectDB } from "./db";
import { cors } from "hono/cors"; // Import CORS middleware

const app = new Hono();


app.use(
  "*",
  cors({
    origin: "*", // Allows all origins (change to specific domain in production)
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowHeaders: ["Content-Type"],
  })
);

(async () => {
  try {
    // Connect to the database once and reuse the connection
    const database = await connectDB();
    const usersCollection = database.collection("users");
    const tasksCollection = database.collection("tasks")

    // User Creation Route
    app.post("/users", async (c) => {
      try {
        const data = await c.req.json();
        const result = await usersCollection.insertOne(data);
        return c.json({ message: "User created successfully", id: result.insertedId }, 201);
      } catch (error) {
        console.error("❌ Error inserting user:", error);
        return c.json({ error: "Failed to create user" }, 500);
      }
    });

    // Get All Users Route
    app.get("/users", async (c) => {
      try {
        const users = await usersCollection.find().toArray();
        return c.json(users);
      } catch (error) {
        console.error("❌ Error fetching users:", error);
        return c.json({ error: "Failed to fetch users" }, 500);
      }
    });

    // add task in db 
    app.post("/tasks", async (c) => {
      try {
        const data = await c.req.json();
        const result = await tasksCollection.insertOne(data);
        return c.json({ message: "Task added successfully", task: result }, 201);
      } catch (error) {
        console.error("❌ Error inserting user:", error);
        return c.json({ error: "Failed to add task" }, 500);
      }
    })

    // get all the tasks
    app.get("/tasks", async (c) => {
      try {
        const tasks = await tasksCollection.find().toArray()
        return c.json(tasks);
      } catch (error) {
        console.error("❌ Error inserting user:", error);
        return c.json({ error: "Failed to get task" }, 500);
      }
    })



    // Home Route
    app.get("/", (c) => {
      return c.text("Hello Hono!");
    });

    console.log("Server is running on port 3001");
  } catch (error) {
    console.error("❌ Error initializing the database connection:", error);
  }
})();

export default {
  port: 3001,
  fetch: app.fetch,
};
