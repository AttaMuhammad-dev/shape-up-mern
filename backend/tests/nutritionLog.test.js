import {test} from 'node:test';import assert from 'node:assert/strict';
import {updateDailyLog} from '../controllers/dailyLogController.js';
import DailyLog from '../models/dailyLogModel.js';
test('the first food of a new day contributes its calories immediately',async()=>{
  const original={find:DailyLog.findOne,create:DailyLog.create};let saved;
  DailyLog.findOne=async()=>null;DailyLog.create=async record=>record;
  const req={body:{date:'2026-10-20',water:750,steps:1500,foodItem:{name:'Synthetic oats',calories:150}},user:{_id:'synthetic-id'}};
  const res={status(){return this;},json(value){saved=value;}};
  try{await updateDailyLog(req,res,error=>{throw error;});assert.equal(saved.calories,150);assert.equal(saved.water,750);assert.equal(saved.steps,1500);assert.equal(saved.foods[0].calories,150);}
  finally{DailyLog.findOne=original.find;DailyLog.create=original.create;}
});
