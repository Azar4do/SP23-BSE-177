// const mongoose = require("mongoose");

// mongoose.connect

// const connectDB = async () => {
//   try {
//     //const uri = "mongodb+srv://fatima123:fatima123@cluster0.mongodb.net/fatimaDataBase?retryWrites=true&w=majority";
//     const uri = "mongodb+srv://sadiamujahid000:hahahaha@cluster1.bnalj.mongodb.net";

//     // Connect to MongoDB
//     await mongoose.connect(uri, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       serverSelectionTimeoutMS: 30000, // Increase server selection timeout to 30s
//       bufferCommands: false,          // Disable buffering for better control
//     });

//     // Confirm the connection is open
//     mongoose.connection.once("open", () => {
//       console.log("Connected to MongoDB successfully");
//     });

//   } catch (error) {
//     console.error("Error connecting to MongoDB:", error.message);
//     process.exit(1); // Exit process on connection failure
//   }
// };

// module.exports = connectDB;
