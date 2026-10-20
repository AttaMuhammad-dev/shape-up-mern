import mongoose from 'mongoose';
import User from '../models/userModel.js';
import DailyLog from '../models/dailyLogModel.js';
import Workout from '../models/workoutModel.js';
import Reminder from '../models/reminderModel.js';
import Review from '../models/reviewModel.js';
import Status from '../models/userStatusModel.js';
import MealPlan from '../models/UserMealPlanModel.js';
import Water from '../models/userWaterIntakeModel.js';
export const accountModels=[[DailyLog,'user'],[Workout,'user'],[Reminder,'user'],[Review,'user'],[Status,'user'],[MealPlan,'userId'],[Water,'userId']];
// Related records and the account commit together; failure leaves the account intact.
export async function removeAccountData(userId,{connection=mongoose.connection,models=accountModels,users=User}={}) {
  const session=await connection.startSession();
  try {await session.withTransaction(async()=>{
    for(const [model,field] of models)await model.deleteMany({[field]:userId},{session});
    await users.deleteOne({_id:userId},{session});
  },{maxCommitTimeMS:5000});} finally {await session.endSession();}
}
