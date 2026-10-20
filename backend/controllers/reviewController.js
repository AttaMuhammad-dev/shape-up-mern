import asyncHandler from "express-async-handler";
import Review from "../models/reviewModel.js";
import {number,text} from '../utils/validation.js';

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
const getReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({}).sort({ createdAt: -1 });
  res.json(reviews);
});

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  number(rating,'rating',1,5,true);text(comment,'Comment',1,2000);

  if (!rating || !comment) {
    res.status(400);
    throw new Error("Please add a rating and comment");
  }

  const review = await Review.create({
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  });

  if (review) {
    res.status(201).json(review);
  } else {
    res.status(400);
    throw new Error("Invalid review data");
  }
});

export { getReviews, createReview };
