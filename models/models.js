const mongoose = require('mongoose');

const PhotizoOromSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: Number, required: true },
    nationality: { type: String, required: true },
    state: { type: String, required: true },
    role: { type: String, required: true },
  },
  { timestamps: true }
);

const PhotizoModel = mongoose.model('oromrecords', PhotizoOromSchema);
module.exports = PhotizoModel;
