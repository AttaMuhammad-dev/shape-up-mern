import {test} from 'node:test';import assert from 'node:assert/strict';
import {updateDailyLog} from '../controllers/dailyLogController.js';import DailyLog from '../models/dailyLogModel.js';
test('invalid food and daily totals cannot mutate the database',async()=>{
 const old=DailyLog.findOneAndUpdate;let calls=0;DailyLog.findOneAndUpdate=async()=>{calls++;};
 try{for(const body of [{date:'2026-02-30'},{date:'2026-10-20',water:-10},{date:'2026-10-20',foodItem:{name:'Food',calories:-1}},{date:'2026-10-20',foodItem:null}]){let failure;await updateDailyLog({body,user:{_id:'synthetic'}},{},e=>{failure=e;});assert.equal(failure?.status,400);}assert.equal(calls,0);}finally{DailyLog.findOneAndUpdate=old;}
});
