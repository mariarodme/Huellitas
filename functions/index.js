const {onCall,HttpsError}=require('firebase-functions/v2/https');
const {onSchedule}=require('firebase-functions/v2/scheduler');
const {defineSecret}=require('firebase-functions/params');
const admin=require('firebase-admin');
const webpush=require('web-push');
const crypto=require('crypto');
admin.initializeApp();
const db=admin.firestore();
const privateKey=defineSecret('HUELLITAS_VAPID_PRIVATE_KEY');
const publicKey=defineSecret('HUELLITAS_VAPID_PUBLIC_KEY');
const idFor=endpoint=>crypto.createHash('sha256').update(endpoint).digest('hex');
const valid=s=>s&&typeof s.endpoint==='string'&&s.endpoint.startsWith('https://')&&s.keys&&typeof s.keys.auth==='string'&&typeof s.keys.p256dh==='string';
exports.registerPush=onCall({region:'us-central1'},async request=>{
 const uid=request.auth?.uid;if(!uid)throw new HttpsError('unauthenticated','Inicia sesión.');
 const owner=String(request.data?.owner||uid);
 if(!/^[\w-]{10,128}$/.test(owner))throw new HttpsError('invalid-argument','Cuenta inválida.');
 if(owner!==uid){const access=await db.doc(`users/${owner}/sharing/access`).get();if(access.data()?.members?.[uid]!==true)throw new HttpsError('permission-denied','No autorizado.')}
 const subscription=request.data?.subscription;
 if(!valid(subscription))throw new HttpsError('invalid-argument','Suscripción inválida.');
 await db.doc(`users/${owner}/pushSubscriptions/${idFor(subscription.endpoint)}`).set({uid,subscription,updatedAt:admin.firestore.FieldValue.serverTimestamp()});
 return {ok:true};
});
exports.unregisterPush=onCall({region:'us-central1'},async request=>{
 const uid=request.auth?.uid;if(!uid)throw new HttpsError('unauthenticated','Inicia sesión.');
 const owner=String(request.data?.owner||uid),endpoint=request.data?.endpoint;
 if(typeof endpoint!=='string'||!endpoint.startsWith('https://'))throw new HttpsError('invalid-argument','Suscripción inválida.');
 const ref=db.doc(`users/${owner}/pushSubscriptions/${idFor(endpoint)}`),snap=await ref.get();
 if(snap.data()?.uid!==uid)throw new HttpsError('permission-denied','No autorizado.');
 await ref.delete();return {ok:true};
});
function due(x,now){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(x.fecha||''))return false;
 const hour=/^\d{2}:\d{2}$/.test(x.hora||'')?x.hora:'09:00';
 if(hour.slice(0,2)!==now.hour.slice(0,2)||Math.floor(Number(hour.slice(3))/5)!==Math.floor(Number(now.hour.slice(3))/5))return false;
 const start=new Date(x.fecha+'T12:00:00Z'),today=new Date(now.date+'T12:00:00Z');
 const diff=Math.round((today-start)/86400000);
 if(diff<0)return false;
 const mode=(x.repeticion||'Una vez').toLowerCase();
 if(mode==='diaria')return true;
 if(mode==='semanal')return diff%7===0;
 if(mode==='mensual')return start.getUTCDate()===today.getUTCDate();
 return diff===0;
}
exports.sendReminders=onSchedule({schedule:'every 5 minutes',timeZone:'America/Costa_Rica',region:'us-central1',secrets:[privateKey,publicKey]},async()=>{
 webpush.setVapidDetails('mailto:admin@huellitas.app',publicKey.value(),privateKey.value());
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Costa_Rica',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date());
 const get=t=>parts.find(x=>x.type===t)?.value;
 const now={date:get('year')+'-'+get('month')+'-'+get('day'),hour:get('hour')+':'+String(Math.floor(Number(get('minute'))/5)*5).padStart(2,'0')};
 const owners=await db.collection('users').listDocuments();
 for(const owner of owners){
  const [data,subs]=await Promise.all([owner.collection('data').doc('huellitas').get(),owner.collection('pushSubscriptions').get()]);
  if(!data.exists||subs.empty)continue;
  let state;try{state=JSON.parse(data.data().payload||'{}')}catch{continue}
  const reminders=(state.recordatorios||[]).filter(x=>due(x,now));
  for(const item of reminders){
   const dedupe=owner.collection('sentReminders').doc(idFor(now.date+'|'+now.hour+'|'+item.id));
   try{await db.runTransaction(async tx=>{const snap=await tx.get(dedupe);if(snap.exists)throw Error('already-sent');tx.create(dedupe,{at:admin.firestore.FieldValue.serverTimestamp()})})}catch{continue}
   for(const sub of subs.docs){
    const petName=(state.mascotas||[]).find(p=>p.id===item.pet)?.nombre||'Mascota';const payload=JSON.stringify({title:'🐾 Huellitas',body:(item.nombre||'Recordatorio')+' · '+petName,tag:'huellitas-'+item.id});
    try{await webpush.sendNotification(sub.data().subscription,payload)}catch(e){if(e.statusCode===404||e.statusCode===410)await sub.ref.delete();else console.error('Push failed',e.statusCode||e.message)}
   }
  }
 }
});
