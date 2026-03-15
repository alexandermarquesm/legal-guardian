import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      console.warn("⚠️ MONGO_URI is missing. Database features will fail.");
      return;
    }

    // Prevent multiple connections
    if (mongoose.connection.readyState >= 1) {
      return;
    }

    // Mask sensitive part for logging
    const maskedURI = mongoURI.replace(
      /mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/,
      "mongodb$1://$2:****@",
    );
    console.log(`🔌 Attempting to connect to MongoDB: ${maskedURI}`);

    await mongoose.connect(mongoURI, {
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
    });
    console.log("📦 MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
  }
};
