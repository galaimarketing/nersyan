import { guestBookingConfirmedHtml, receptionNewBookingHtml } from "./lib/email.ts";
const sample = { id:"BK-10428",guestName:"علاء",email:"alagalai624@gmail.com",phone:"+966500000000",room:"جناح ملكي",roomNumber:"203",checkIn:"2026-06-10",checkOut:"2026-06-13",guests:2,amount:750,paymentStatus:"paid" };
const key = process.env.RESEND_API_KEY!;
async function send(to:string,subject:string,html:string){const r=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({from:"Nersyan Taiba <noreply@nersyantaiba.com>",to:[to],subject,html})});console.log(to,r.status,(await r.json()).id??"");}
await send("alagalai624@gmail.com","معاينة تصميم: تأكيد الحجز",guestBookingConfirmedHtml(sample));
await send("nt2030n@gmail.com","معاينة تصميم: إشعار الاستقبال",receptionNewBookingHtml(sample,"paid"));
