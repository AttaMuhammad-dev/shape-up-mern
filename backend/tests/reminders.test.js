import {test} from 'node:test';import assert from 'node:assert/strict';import mongoose from 'mongoose';
import Reminder from '../models/reminderModel.js';import Review from '../models/reviewModel.js';
test('reminders have their own model and retain date, time and priority',async()=>{
  const reminder=new Reminder({user:new mongoose.Types.ObjectId(),title:'Synthetic workout',time:'12:30',date:'2026-10-20',type:'Workout',priority:'High'});
  await reminder.validate();assert.notEqual(Reminder.collection.name,Review.collection.name);assert.equal(reminder.date,'2026-10-20');assert.equal(reminder.priority,'High');assert.equal(reminder.time,'12:30');
});
test('malformed reminder times are rejected before a database write',async()=>{
  const reminder=new Reminder({user:new mongoose.Types.ObjectId(),title:'Synthetic',time:'99:00',date:'2026-10-20'});
  await assert.rejects(reminder.validate(),{name:'ValidationError'});
});
