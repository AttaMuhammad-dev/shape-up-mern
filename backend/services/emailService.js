import nodemailer from 'nodemailer';
export function emailReady(env=process.env) {return env.EMAIL_ENABLED==='true'&&Boolean(env.EMAIL_USER?.trim()&&env.EMAIL_PASS?.trim());}
export async function deliverSupport({subject,message,senderEmail,senderName}, {env=process.env,createTransport=nodemailer.createTransport}={}) {
  if(!emailReady(env))return {ok:false,status:503,message:'Support email is not configured yet. Your message has not been sent.'};
  const transporter=createTransport({service:'gmail',auth:{user:env.EMAIL_USER,pass:env.EMAIL_PASS},connectionTimeout:5000,greetingTimeout:5000,socketTimeout:8000,logger:false,debug:false});
  try {
    const result=await transporter.sendMail({from:{name:'Shape Up',address:env.EMAIL_USER},to:env.SUPPORT_EMAIL||env.EMAIL_USER,replyTo:senderEmail,subject:`Shape Up Support: ${subject}`,text:`From: ${senderName} <${senderEmail}>\n\n${message}`});
    if(!result.accepted?.length)return {ok:false,status:502,message:'The email service did not accept the message. Please try again later.'};
    return {ok:true,status:200,message:'Your message was accepted by the email service. Inbox delivery may take a moment.'};
  }catch{return {ok:false,status:503,message:'The email service is unavailable. Your message has not been confirmed as sent. Please try again later.'};}
  finally {transporter.close();}
}
