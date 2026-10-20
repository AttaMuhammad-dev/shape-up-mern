import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import DailyLog from '../models/dailyLogModel.js';import User from '../models/userModel.js';
import {day,number,text,invalid} from '../utils/validation.js';
const getDailyLogs=asyncHandler(async(req,res)=>res.json(await DailyLog.find({user:req.user._id}).sort({date:-1})));
const updateDailyLog=asyncHandler(async(req,res)=>{
 const date=day(req.body.date),fields={};
 for(const [key,max] of [['calories',50000],['water',30000],['weight',700],['steps',200000]])if(req.body[key]!==undefined)fields[key]=number(req.body[key],key,0,max,key==='steps');
 const food=req.body.foodItem;let item;
 if(food!==undefined){if(!food||typeof food!=='object'||Array.isArray(food))invalid('Enter a valid food item.');item={_id:new mongoose.Types.ObjectId(),name:text(food.name,'Food name',1,160),calories:number(food.calories,'food calories',0,20000)};for(const key of ['protein','carbs','fat'])item[key]=number(food[key]??0,key,0,5000);}
 const defaults={user:{$literal:req.user._id},date:{$literal:date},foods:{$ifNull:['$foods',[]]},createdAt:{$ifNull:['$createdAt',new Date()]},updatedAt:new Date()};
 for(const key of ['calories','water','weight','steps'])defaults[key]=fields[key]??{$ifNull:['$'+key,0]};
 const pipeline=[{$set:defaults}];
 if(item)pipeline.push({$set:{foods:{$concatArrays:['$foods',{$literal:[item]}]}}},{$set:{calories:{$sum:'$foods.calories'}}});
 const filter={user:req.user._id,date};let log;
 try{log=await DailyLog.findOneAndUpdate(filter,pipeline,{upsert:true,new:true});}
 catch(error){if(error.code!==11000)throw error;log=await DailyLog.findOneAndUpdate(filter,pipeline,{new:true});}
 if(fields.weight>0)await User.updateOne({_id:req.user._id},{$set:{weight:fields.weight}});
 res.json(log);
});
const deleteFoodItem=asyncHandler(async(req,res)=>{
 const date=day(req.body.date),id=req.body.foodId;
 if(typeof id!=='string'||!/^[a-f0-9]{24}$/i.test(id))invalid('Select a valid food item.');
 const log=await DailyLog.findOneAndUpdate({user:req.user._id,date,'foods._id':new mongoose.Types.ObjectId(id)},[{$set:{foods:{$filter:{input:'$foods',as:'food',cond:{$ne:['$$food._id',new mongoose.Types.ObjectId(id)]}}}}},{$set:{calories:{$sum:'$foods.calories'}}}],{new:true});
 if(!log)return res.status(404).json({message:'Food item not found.'});res.json(log);
});
export {getDailyLogs,updateDailyLog,deleteFoodItem};
