// test-connection.js
import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function testConnection() {
  try {
    console.log("🔗 Testing connection to MongoDB Atlas...");
    console.log(
      "Connection string:",
      process.env.MONGO_URI ? "Exists" : "Missing"
    );

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected successfully to MongoDB Atlas");

    // Check if we can perform a simple operation
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(
      "📂 Collections found:",
      collections.map((c) => c.name)
    );

    // Close the connection
    await mongoose.connection.close();
    console.log("🔌 Connection closed");
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
    console.log("\n🔧 Troubleshooting steps:");
    console.log("1. Check your IP is whitelisted in MongoDB Atlas");
    console.log("2. Verify your username/password in the connection string");
    console.log("3. Make sure your cluster is not paused");
    console.log("4. Check your internet connection");
  }
}

// Run the test
testConnection();
