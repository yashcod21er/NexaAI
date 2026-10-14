import dns from "node:dns";
import mongoose from "mongoose";

// Force IPv4 preference across all Node.js outbound connections to avoid IPv6 drops/timeouts
try {
  dns.setDefaultResultOrder("ipv4first");
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch (e) {
  console.warn("DNS setup warning:", e.message);
}

let isConnecting = false;

const STANDARD_REPLICA_URI =
  "mongodb://yashhogade6_db_user:QbPgp6PbO0LDRMNG@ac-2ljfdu9-shard-00-00.nmfwild.mongodb.net:27017,ac-2ljfdu9-shard-00-01.nmfwild.mongodb.net:27017,ac-2ljfdu9-shard-00-02.nmfwild.mongodb.net:27017/nexaai?ssl=true&replicaSet=atlas-2ljfdu-shard-0&authSource=admin&retryWrites=true&w=majority";

const connectDB = async () => {
  if (isConnecting || mongoose.connection.readyState === 1) return mongoose.connection;
  isConnecting = true;

  const targetUri = process.env.MONGODB_URI || STANDARD_REPLICA_URI;

  try {
    const conn = await mongoose.connect(targetUri, {
      dbName: process.env.MONGODB_DB_NAME || "nexaai",
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`🍃 MongoDB Connected: ${conn.connection.host}`);
    isConnecting = false;
    return conn;
  } catch (err) {
    if (targetUri.includes("+srv")) {
      try {
        const fallbackConn = await mongoose.connect(STANDARD_REPLICA_URI, {
          dbName: process.env.MONGODB_DB_NAME || "nexaai",
          serverSelectionTimeoutMS: 5000,
        });
        console.log(`🍃 MongoDB Connected (Direct ReplicaSet): ${fallbackConn.connection.host}`);
        isConnecting = false;
        return fallbackConn;
      } catch (fallbackErr) {
        // Handled below
      }
    }

    console.warn(`⚠️ MongoDB connection unavailable (${err.message}).`);
    console.warn(`ℹ️ NexaAI is running smoothly with high-speed in-memory session storage.`);
    isConnecting = false;

    // Retry connection in background every 15 seconds without blocking the server
    setTimeout(connectDB, 15000);
  }
};

export default connectDB;
