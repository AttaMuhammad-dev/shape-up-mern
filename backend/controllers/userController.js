import asyncHandler from 'express-async-handler';
import generateToken,{clearToken} from '../utils/generateToken.js';
import User from '../models/userModel.js';
import {email,password,text,number,choice,invalid} from '../utils/validation.js';
import {accountModels,removeAccountData} from '../services/accountService.js';
const publicUser=user=>Object.fromEntries(['_id','name','email','image','age','height','weight','gender','goal'].map(k=>[k,user[k]]));
const emailQuery=value=>({email:{$regex:'^'+value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$',$options:'i'}});
const authUser=asyncHandler(async(req,res)=>{
  const address=email(req.body.email),secret=password(req.body.password);
  const user=await User.findOne(emailQuery(address));
  if(!user||!await user.matchPassword(secret))return res.status(401).json({message:'Invalid user credentials'});
  generateToken(res,user._id,user.sessionVersion||0);res.status(200).json(publicUser(user));
});
const registerUser=asyncHandler(async(req,res)=>{
  const name=text(req.body.name,'Name',1,100),address=email(req.body.email),secret=password(req.body.password,true);
  if(await User.findOne(emailQuery(address)))return res.status(409).json({message:'An account with this email already exists.'});
  const user=await User.create({name,email:address,password:secret});
  generateToken(res,user._id,user.sessionVersion||0);res.status(201).json(publicUser(user));
});
const logoutUser=asyncHandler(async(req,res)=>{clearToken(res);res.json({message:'Signed out.'});});
const getUserProfile=asyncHandler(async(req,res)=>res.json(publicUser(req.user)));
const updateUserProfile=asyncHandler(async(req,res)=>{
  const user=await User.findById(req.user._id);
  if(!user)return res.status(404).json({message:'User not found'});
  let renew=false,pendingPassword;
  if(req.body.password!==undefined&&req.body.password!==''){
    const fresh=password(req.body.password,true),current=password(req.body.currentPassword);
    if(!await user.matchPassword(current))return res.status(400).json({message:'Invalid current password.'});
    pendingPassword=fresh;renew=true;
  }
  if(req.body.name!==undefined)user.name=text(req.body.name,'Name',1,100);
  if(req.body.email!==undefined){const address=email(req.body.email);if(address!==user.email){
    if(!await user.matchPassword(password(req.body.currentPassword)))return res.status(400).json({message:'Enter your current password to change email.'});
    const existing=await User.findOne(emailQuery(address));if(existing&&String(existing._id)!==String(user._id))return res.status(409).json({message:'That email is already in use.'});
    user.email=address;renew=true;
  }}
  for(const [key,min,max] of [['age',1,120],['height',30,300],['weight',1,700]])if(req.body[key]!==undefined&&req.body[key]!=='')user[key]=number(req.body[key],key,min,max,key==='age');
  if(req.body.gender!==undefined)user.gender=choice(req.body.gender,['Male','Female'],'gender');
  if(req.body.goal!==undefined)user.goal=choice(req.body.goal,['Cut','Bulk','Maintain'],'goal');
  if(req.body.image!==undefined){const image=req.body.image;let https=false;try{const u=new URL(image);https=u.protocol==='https:'&&!u.username&&!u.password;}catch{}if(typeof image!=='string'||image.length>180000||(image&&!https&&!/^data:image\/(?:jpeg|png|webp);base64,[a-zA-Z0-9+/=]+$/.test(image)))invalid('Use a valid PNG, JPEG or WebP avatar.');user.image=image;}
  if(pendingPassword)user.password=pendingPassword;
  if(renew)user.sessionVersion=(user.sessionVersion||0)+1;
  const updated=await user.save();if(renew)generateToken(res,updated._id,updated.sessionVersion);res.json(publicUser(updated));
});
const deleteUserAccount=asyncHandler(async(req,res)=>{
  if(req.body.confirmation!=='DELETE')invalid('Type DELETE to confirm permanent account deletion.');
  const secret=password(req.body.password),user=await User.findById(req.user._id);
  if(!user||!await user.matchPassword(secret))return res.status(400).json({message:'Invalid current password. Account was not deleted.'});
  await removeAccountData(user._id);clearToken(res);res.json({message:'Your account and related data have been deleted.'});
});
const exportUserData=asyncHandler(async(req,res)=>{
  const data={exportedAt:new Date().toISOString(),profile:publicUser(req.user)};
  const names=['dailyLogs','workouts','reminders','reviews','dietProfile','mealPlans','waterIntake'];
  for(let i=0;i<accountModels.length;i++){const [model,field]=accountModels[i];data[names[i]]=await model.find({[field]:req.user._id}).lean();}
  res.set('Cache-Control','no-store');res.json(data);
});
export {authUser,registerUser,logoutUser,getUserProfile,updateUserProfile,deleteUserAccount,exportUserData};
