import {test} from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import express from 'express';
import handler from '../../api/index.js';
test('the real Vercel handler serves chat without database/JWT configuration',async()=>{
  const old={mongo:process.env.MONGO_URI,jwt:process.env.JWT_SECRET};delete process.env.MONGO_URI;delete process.env.JWT_SECRET;
  const wrapper=express();wrapper.use(handler);const server=wrapper.listen(0,'127.0.0.1');await once(server,'listening');
  const base=`http://127.0.0.1:${server.address().port}`;
  try{
    const greeting=await fetch(base+'/api/ai/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:'hello'})});
    assert.equal(greeting.status,200);assert.equal((await greeting.json()).mode,'guide');
    const invalid=await fetch(base+'/api/ai/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:''})});assert.equal(invalid.status,400);
    assert.equal((await fetch(base+'/api/users/profile')).status,503);
  }finally{await new Promise(resolve=>server.close(resolve));if(old.mongo!==undefined)process.env.MONGO_URI=old.mongo;if(old.jwt!==undefined)process.env.JWT_SECRET=old.jwt;}
});
