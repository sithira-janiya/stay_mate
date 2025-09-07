import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Tenant from "./models/Tenant.js";

dotenv.config();
await connectDB();

async function seed() {
  await Tenant.deleteMany({});
  const t = await Tenant.create({
    tenantId: "T239",
    name: "John Doe",
    email: "john@example.com",
    password: "123456",
    status: "Absent"
  });
  console.log("Seeded tenant:", t.tenantId, t.email);
  process.exit(0);
}
seed();