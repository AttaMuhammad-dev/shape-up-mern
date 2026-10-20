import {test} from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/userModel.js';
test('saving profile details does not salt or hash an unchanged password',async()=>{
  const passwordHash=await bcrypt.hash('synthetic-test-only-password',10);
  const user=User.hydrate({_id:new mongoose.Types.ObjectId(),name:'Synthetic user',email:'demo@example.invalid',password:passwordHash,isAdmin:false});
  user.name='Updated synthetic user';
  const oldSalt=bcrypt.genSalt,oldUpdate=User.collection.updateOne;let saltCalls=0;
  bcrypt.genSalt=(...args)=>{saltCalls++;return oldSalt(...args);};
  User.collection.updateOne=async()=>({acknowledged:true,matchedCount:1,modifiedCount:1});
  try{await user.save();assert.equal(saltCalls,0);assert.equal(user.password,passwordHash);assert.equal(await user.matchPassword('synthetic-test-only-password'),true);}
  finally{bcrypt.genSalt=oldSalt;User.collection.updateOne=oldUpdate;}
});
