import asyncHandler from 'express-async-handler';
import {text} from '../utils/validation.js';
import {deliverSupport} from '../services/emailService.js';
export const sendEmail=asyncHandler(async(req,res)=>{
  const subject=text(req.body.subject,'Subject',1,120);
  if(/[\r\n\0]/.test(subject))return res.status(400).json({message:'Enter a valid subject.'});
  const message=text(req.body.message,'Message',10,5000);
  const result=await deliverSupport({subject,message,senderEmail:req.user.email,senderName:req.user.name});
  res.status(result.status).json({message:result.message});
});
