import asyncHandler from 'express-async-handler';
import MealPlan from '../models/UserMealPlanModel.js';import {day,text,invalid} from '../utils/validation.js';
const fields=['meal1','meal2','meal3','meal4','meal5','snacks'];
async function savePlan(req,res){
 const date=day(req.body.date),userId=req.user._id,values={};
 if(req.params?.date&&req.params.date!==date)invalid('Date does not match the requested plan.');
 for(const key of fields)if(req.body[key]!==undefined)values[key]=text(req.body[key],key,0,1000);
 const plan=await MealPlan.findOne({userId,date});
 if(plan){for(const [key,value] of Object.entries(values))plan[key]=value;return res.json(await plan.save());}
 return res.status(201).json(await MealPlan.create({userId,date,...values}));
}
const createUserMealPlan=asyncHandler(savePlan),updateUserMealPlan=asyncHandler(savePlan);
const getUserMealPlan=asyncHandler(async(req,res)=>{
 const date=day(req.params.date),plan=await MealPlan.findOne({userId:req.user._id,date});
 if(!plan)return res.status(404).json({message:'Meal plan not found.'});res.json(plan);
});
export {createUserMealPlan,updateUserMealPlan,getUserMealPlan};
