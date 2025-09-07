import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import TestSample from "./src/models/TestSample.js";

dotenv.config();
connectDB();

const insertTest = async () => {
  try {
    const testDoc = new TestSample({
      fullName: "Test User",                  // required
      email: "testuser@example.com",          // required
      password: "password123",                // required
    });

    await testDoc.save();
    console.log("✅ Test document inserted:", testDoc);
  } catch (error) {
    console.error("❌ Error inserting test document:", error);
  } finally {
    process.exit(); // close DB connection
  }
};

insertTest();
