import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false },
    
    // --- Profile Stats ---
    image: { type: String },
    age: { type: Number },
    height: { type: Number }, // cm
    weight: { type: Number }, // kg
    gender: { type: String, enum: ['Male', 'Female'], default: 'Male' },
    
    // 👇 YEH LINE CHECK KAREIN (Zaroori Hai) 👇
    goal: { 
        type: String, 
        enum: ['Cut', 'Bulk', 'Maintain'], 
        default: 'Maintain' 
    },
  },
  {
    timestamps: true,
  }
);

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);
export default User;
