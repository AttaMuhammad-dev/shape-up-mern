import express from 'express';
import { sendEmail } from '../controllers/emailController.js';
import {protect} from '../middleware/authMiddleware.js';
import {rateLimit} from 'express-rate-limit';

const router = express.Router();

router.post('/send',protect,rateLimit({windowMs:3600000,limit:5,keyGenerator:req=>String(req.user._id),standardHeaders:'draft-8',legacyHeaders:false,message:{message:'Please wait before sending another support message.'}}),sendEmail);

export default router;
