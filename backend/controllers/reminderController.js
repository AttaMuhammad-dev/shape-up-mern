import asyncHandler from "express-async-handler";
import Reminder from "../models/reminderModel.js";
import {day} from '../utils/validation.js';

// @desc    Get all reminders
// @route   GET /api/reminders
// @access  Private
const getReminders = asyncHandler(async (req, res) => {
  const reminders = await Reminder.find({ user: req.user._id }).sort({ time: 1 });
  res.json(reminders);
});

// @desc    Create a reminder
// @route   POST /api/reminders
// @access  Private
const createReminder = asyncHandler(async (req, res) => {
  const { title, time, type, date = new Date().toISOString().slice(0,10), priority = 'Normal' } = req.body;
  day(date);
  
  if (!title || !time) {
    res.status(400);
    throw new Error("Please add all fields");
  }

  const reminder = await Reminder.create({
    user: req.user._id,
    title,
    time,
    type,
    date,
    priority,
  });

  res.status(201).json(reminder);
});

// @desc    Delete a reminder
// @route   DELETE /api/reminders/:id
// @access  Private
const deleteReminder = asyncHandler(async (req, res) => {
  const reminder = await Reminder.findById(req.params.id);

  if (reminder && reminder.user.equals(req.user._id)) {
    await reminder.deleteOne();
    res.json({ message: "Reminder removed" });
  } else {
    res.status(404);
    throw new Error("Reminder not found");
  }
});

export { getReminders, createReminder, deleteReminder };
