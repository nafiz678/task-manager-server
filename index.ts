import { Hono } from "hono";
import { connectDB } from "./db";
import { cors } from "hono/cors"; // Import CORS middleware
import { ObjectId } from "mongodb";

const app = new Hono();


app.use(
  "*",
  cors({
    origin: [
      "http://localhost:3000",
      "https://task-manager-zeta-flame.vercel.app",
    ], // Allows all origins (change to specific domain in production)
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

    // User add to database route
    app.post("/users/:email", async (c) => {
      try {
        const data = await c.req.json();
        const email = c.req.param("email");

        // Check if user already exists
        const existingUser = await usersCollection.findOne({ email });

        if (existingUser) {
          return c.json({ message: "User already exists", user: existingUser }, 200);
        }

        // Create new user
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

    // Get all tasks for a specific user by email
    app.get("/tasks/:email", async (c) => {
      try {
        const email = c.req.param("email");

        if (!email) {
          return c.json({ error: "Email parameter is required" }, 400);
        }
        // Log query filter
        const query = { userEmail: email };

        const tasks = await tasksCollection.find(query).toArray();
        return c.json(tasks);
      } catch (error) {
        console.error("❌ Error fetching tasks:", error);
        return c.json({ error: "Failed to get tasks" }, 500);
      }
    });



    // Update task category
    app.patch("/tasks/:id", async (c) => {
      try {
        const { id } = c.req.param();
        const { category } = await c.req.json();

        if (!ObjectId.isValid(id)) {
          return c.json({ error: "Invalid task ID" }, 400);
        }

        const result = await tasksCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { category } }
        );

        if (result.matchedCount === 0) {
          return c.json({ error: "Task not found" }, 404);
        }

        return c.json({ message: "Task updated successfully" });

      } catch (error) {
        console.error("❌ Error updating category:", error);
        return c.json({ error: "Failed to update category" }, 500);
      }
    });

    // delete a task
    app.delete("/tasks/:id", async (c) => {
      try {
        const id = c.req.param("id");
        const query = { _id: new ObjectId(id) }

        const result = await tasksCollection.deleteOne(query)

        if (result.deletedCount === 1) {
          return c.json({ message: "Task deleted successfully" }, 200);
        } else {
          console.warn("⚠️ Task not found.");
          return c.json({ error: "Task not found" }, 404);
        }

      } catch (error) {
        console.error("❌ Error deleting task:", error);
        return c.json({ error: "Failed to delete task" }, 500);
      }
    })


    // update a task
    app.put("/tasks/:id", async (c) => {
      try {
        const id = c.req.param("id");
        const query = { _id: new ObjectId(id) };
        const { title, description } = await c.req.json();

        const updatedDoc = {
          $set: {
            title: title,
            description: description,
          }
        };

        const result = await tasksCollection.updateOne(query, updatedDoc);

        if (result.matchedCount === 1) {
          return c.json({ message: "Task updated successfully" });
        } else {
          return c.json({ error: "Task not found" }, 404);
        }

      } catch (error) {
        console.error("❌ Error updating task:", error);
        return c.json({ error: "Failed to update task" }, 500);
      }
    })

    // Home Route
    app.get("/", (c) => {
      return c.text("Hello Hono!");
    });

  } catch (error) {
    console.error("❌ Error initializing the database connection:", error);
  }
})();

export default {
  port: 3001,
  fetch: app.fetch,
};
