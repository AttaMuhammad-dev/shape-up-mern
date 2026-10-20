import asyncHandler from "express-async-handler";
import {day,text} from '../utils/validation.js';
import UserMealPlan from "../models/UserMealPlanModel.js";

// @desc      Create user meal plan
// @route     POST /api/user/meal-plan
// @access    Private
const createUserMealPlan = asyncHandler(async (req, res) => {
  const { date, meal1, meal2, meal3, meal4, meal5, snacks } = req.body;
  const userId = req.user._id;

  const userMealPlan = await UserMealPlan.create({
    userId,
    date,
    meal1,
    meal2,
    meal3,
    meal4,
    meal5,
    snacks,
  });

  if (userMealPlan) {
    res.status(201).json(userMealPlan);
  } else {
    res.status(400);
    throw new Error("Invalid user meal plan data");
  }
});

// @desc      Get user meal plan for a specific date
// @route     GET /api/user/meal-plan/:date
// @access    Private
const getUserMealPlan = asyncHandler(async (req, res) => {
  const date = day(req.params.date);
  const userId = req.user._id;

  const userMealPlan = await UserMealPlan.findOne({ userId, date });

  if (userMealPlan) {
    res.status(200).json(userMealPlan);
  } else {
    res.status(404);
    throw new Error("User meal plan not found");
  }
});

// @desc      Update user meal plan for a specific date
// @route     PUT /api/user/meal-plan/:date
// @access    Private
const updateUserMealPlan = asyncHandler(async (req, res) => {
  const { date, meal1, meal2, meal3, meal4, meal5, snacks } = req.body;
  const userId = req.user._id;

  day(date);
  if(req.params.date && req.params.date!==date) return res.status(400).json({message:"Date does not match the requested plan."});
  for(const key of ["meal1","meal2","meal3","meal4","meal5","snacks"]) if(req.body[key]!==undefined)text(req.body[key],key,0,1000);
  let userMealPlan = await UserMealPlan.findOne({ userId, date });

  if (!userMealPlan) {
    // If user meal plan doesn't exist, create a new one
    userMealPlan = await UserMealPlan.create({
      userId,
      date:day(date),
      meal1,
      meal2,
      meal3,
      meal4,
      meal5,
      snacks,
    });
    res.status(201).json(userMealPlan);
  } else {
    // If user meal plan exists, update it
    if (meal1 !== undefined) userMealPlan.meal1 = meal1;
    if (meal2 !== undefined) userMealPlan.meal2 = meal2;
    if (meal3 !== undefined) userMealPlan.meal3 = meal3;
    if (meal4 !== undefined) userMealPlan.meal4 = meal4;
    if (meal5 !== undefined) userMealPlan.meal5 = meal5;
    if (snacks !== undefined) userMealPlan.snacks = snacks;

    const updatedUserMealPlan = await userMealPlan.save();
    res.status(200).json(updatedUserMealPlan);
  }
});

export { createUserMealPlan, getUserMealPlan, updateUserMealPlan };
