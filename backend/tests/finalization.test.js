import {test} from 'node:test';import assert from 'node:assert/strict';
import {email,password,day,number} from '../utils/validation.js';
import {removeAccountData} from '../services/accountService.js';
import {deliverSupport,emailReady} from '../services/emailService.js';
import {authUser,deleteUserAccount} from '../controllers/userController.js';
import User from '../models/userModel.js';
import {updateUserMealPlan} from '../controllers/UserMealPlanController.js';
import MealPlan from '../models/UserMealPlanModel.js';
const response=()=>({code:200,status(code){this.code=code;return this;},json(data){this.data=data;}});
test('credentials reject operator objects, weak passwords and bcrypt truncation',()=>{
  for(const v of [{$ne:null},[],null,'x\n@y.z'])assert.throws(()=>email(v));
  assert.equal(email(' Demo+one@Example.invalid '),'demo+one@example.invalid');
  assert.throws(()=>password('short',true));assert.throws(()=>password('é'.repeat(37),true));assert.equal(password('valid-test-secret',true),'valid-test-secret');
});
test('calendar validation rejects impossible dates and malformed numeric payloads',()=>{
  for(const v of ['2026-02-30','2026-13-01','not-date',{},'2026-1-1'])assert.throws(()=>day(v));
  assert.equal(day('2028-02-29'),'2028-02-29');
  for(const v of [-1,Infinity,{},[],null,''])assert.throws(()=>number(v,'water',0,30));
});
test('invalid login data is rejected before any database query',async()=>{
  const old=User.findOne;let calls=0;User.findOne=()=>{calls++;throw Error('Should not run');};
  try{let error;await authUser({body:{email:{$ne:null},password:'synthetic'}},response(),e=>{error=e;});assert.equal(error.status,400);assert.equal(calls,0);}finally{User.findOne=old;}
});
test('deletion requires explicit confirmation before consulting the database',async()=>{
  const res=response();let error;await deleteUserAccount({body:{confirmation:'yes',password:'synthetic'},user:{_id:'owned'}},res,e=>{error=e;});assert.equal(error.status,400);
});
test('all owned collections and account use one transaction and scoped IDs',async()=>{
  const calls=[],session={withTransaction:async fn=>fn(),endSession:async()=>calls.push('end')};
  const models=['user','userId'].map(field=>[{deleteMany:async(filter,options)=>{assert.deepEqual(filter,{[field]:'owned'});assert.equal(options.session,session);calls.push(field);}},field]);
  await removeAccountData('owned',{connection:{startSession:async()=>session},models,users:{deleteOne:async(filter,options)=>{assert.deepEqual(filter,{_id:'owned'});assert.equal(options.session,session);calls.push('account');}}});
  assert.deepEqual(calls,['user','userId','account','end']);
});
test('deletion failure aborts account removal and always closes the transaction session',async()=>{
  let deleted=false,ended=false;const session={withTransaction:async fn=>fn(),endSession:async()=>{ended=true;}};
  await assert.rejects(removeAccountData('owned',{connection:{startSession:async()=>session},models:[[{deleteMany:async()=>{throw Error('database failure');}},'user']],users:{deleteOne:async()=>{deleted=true;}}}));assert.equal(deleted,false);assert.equal(ended,true);
});
test('email remains unavailable unless both private credentials and enable flag exist',async()=>{
  assert.equal(emailReady({EMAIL_ENABLED:'true',EMAIL_USER:'demo@example.invalid'}),false);
  const result=await deliverSupport({}, {env:{},createTransport:()=>{throw Error('Should not connect');}});assert.equal(result.status,503);assert.match(result.message,/not been sent/);
});
test('support mail has a fixed owner recipient, authenticated reply-to and bounded timeouts',async()=>{
  let sent,closed=false;const env={EMAIL_ENABLED:'true',EMAIL_USER:'owner@example.invalid',EMAIL_PASS:'synthetic-secret',SUPPORT_EMAIL:'inbox@example.invalid'};
  const result=await deliverSupport({subject:'Test',message:'Synthetic verification only',senderName:'Demo',senderEmail:'demo@example.invalid'},{env,createTransport:config=>{assert.equal(config.socketTimeout,8000);return {sendMail:async mail=>{sent=mail;return {accepted:['inbox@example.invalid']};},close:()=>{closed=true;}};}});
  assert.equal(result.ok,true);assert.equal(sent.to,env.SUPPORT_EMAIL);assert.equal(sent.replyTo,'demo@example.invalid');assert.equal(closed,true);
});
test('SMTP failure never fabricates delivery success or exposes credentials',async()=>{
  const result=await deliverSupport({},{env:{EMAIL_ENABLED:'true',EMAIL_USER:'owner@example.invalid',EMAIL_PASS:'do-not-show'},createTransport:()=>({sendMail:async()=>{throw Error('SMTP password do-not-show');},close(){}})});assert.equal(result.ok,false);assert.equal(result.status,503);assert.doesNotMatch(JSON.stringify(result),/do-not-show/);
});
test('a meal-plan field can be cleared without erasing other meals',async()=>{
  const old=MealPlan.findOne;const plan={meal1:'old breakfast',meal2:'keep lunch',save:async function(){return this;}};MealPlan.findOne=async()=>plan;
  try{const res=response();await updateUserMealPlan({body:{date:'2026-10-20',meal1:''},params:{},user:{_id:'owned'}},res,e=>{throw e;});assert.equal(res.code,200);assert.equal(plan.meal1,'');assert.equal(plan.meal2,'keep lunch');}finally{MealPlan.findOne=old;}
});
