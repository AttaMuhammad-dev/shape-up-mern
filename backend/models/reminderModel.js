import mongoose from "mongoose";

const reminderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: { type: String, required: true, trim:true, maxlength:160 },
    time: { type:String,required:true,match:/^([01]\d|2[0-3]):[0-5]\d$/ },
    date: { type:String,required:true,match:/^\d{4}-\d{2}-\d{2}$/ },
    type: { type:String,enum:['General','Workout','Diet','Water'],default:'General' },
    priority: { type:String,enum:['Normal','High'],default:'Normal' },
  },
  {
    timestamps: true,
  }
);

reminderSchema.index({user:1,date:1,time:1});
const Reminder = mongoose.models.Reminder || mongoose.model("Reminder", reminderSchema);

export default Reminder;
