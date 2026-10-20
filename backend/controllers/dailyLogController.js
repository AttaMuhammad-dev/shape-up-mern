import asyncHandler from "express-async-handler";
import DailyLog from "../models/dailyLogModel.js";
import User from "../models/userModel.js";

// @desc    Get daily logs for user
// @route   GET /api/daily-logs
// @access  Private
const getDailyLogs = asyncHandler(async (req, res) => {
  const logs = await DailyLog.find({ user: req.user._id }).sort({ date: -1 });
  res.json(logs);
});

// @desc    Create or Update daily log
// @route   POST /api/daily-logs
// @access  Private
const updateDailyLog = asyncHandler(async (req, res) => {
  const { date, calories, water, weight, foodItem, steps } = req.body; // 👈 Added 'steps' here

  // 1. Validate Date
  if (!date) {
    res.status(400);
    throw new Error("Date is required");
  }

  // 2. Find existing log
  let log = await DailyLog.findOne({ user: req.user._id, date });

  if (log) {
    // Update simple fields if provided
    if (calories !== undefined) log.calories = calories;
    if (water !== undefined) log.water = water;
    if (weight !== undefined) log.weight = weight;
    if (steps !== undefined) log.steps = steps; // 👈 ADDED THIS LINE (Updates steps)

    // Add Food Item if provided (For Nutrition Checker)
    if (foodItem) {
        log.foods.push(foodItem);
        // Auto-calculate total calories from foods array
        log.calories = log.foods.reduce((acc, item) => acc + item.calories, 0);
    }

    await log.save();
  } else {
    // Create new log
    log = await DailyLog.create({
      user: req.user._id,
      date,
      calories: foodItem ? Number(foodItem.calories) || 0 : calories || 0,
      water: water || 0,
      weight: weight || 0,
      steps: steps || 0, // 👈 ADDED THIS LINE (Creates steps)
      foods: foodItem ? [foodItem] : []
    });
  }

  // 3. Update User Profile Weight (Sync)
  if (weight && weight > 0) {
      const user = await User.findById(req.user._id);
      if (user) {
          user.weight = weight;
          await user.save();
      }
  }

  res.status(200).json(log);
});

// @desc    Delete a food item from log
// @route   DELETE /api/daily-logs/food
// @access  Private
const deleteFoodItem = asyncHandler(async (req, res) => {
    const { date, foodId } = req.body;

    const log = await DailyLog.findOne({ user: req.user._id, date });

    if (log) {
        // Remove the food item by ID
        log.foods = log.foods.filter((item) => item._id.toString() !== foodId);
        
        // Recalculate Total Calories
        log.calories = log.foods.reduce((acc, item) => acc + item.calories, 0);

        await log.save();
        res.json(log);
    } else {
        res.status(404);
        throw new Error("Log not found");
    }
});

// --- EXPORT ---
export { getDailyLogs, updateDailyLog, deleteFoodItem };
