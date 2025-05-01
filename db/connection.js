const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect("mongodb+srv://microsoftinnotech:pyP6XZtXktZKrnIo@photizo-orom.hrmltig.mongodb.net/photizoorom2025?retryWrites=true&w=majority"
  // mongoose.connect("mongodb://127.0.0.1:27017/photizoorom2025"
, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log("MongoDB connection successful");
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
  });

  // mongodb://localhost:27017/