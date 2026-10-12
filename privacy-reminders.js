/* Local reminders and private-on-device document storage. */
(function(){
'use strict';
const escapeText=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const STORE='huellitas-private-docs', DB='huellitas-documents-v1';
function dbOpen(){return new Promise((resolve,reject)=>{if(!('indexedDB'in window))return reject(Error('No compatible'));const req=indexedDB.open(DB,1);req.onupgradeneeded=()=>req.result.createObjectStore(STORE,{keyPath:'id'});req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
async function getDocs(){const db=await dbOpen();return new Promise((resolve,reject)=>{const t=db.transaction(STORE,'readonly');const r=t.objectStore(STORE).getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);t.oncomplete=()=>db.close()})}
async function addDoc(row){const db=await dbOpen();return new Promise((resolve,reject)=>{const t=db.transaction(STORE,'readwrite');t.objectStore(STORE).put(row);t.oncomplete=()=>{db.close();resolve()};t.onerror=()=>reject(t.error)})}
async function delDoc(id){const db=await dbOpen();return new Promise((resolve,reject)=>{const t=db.transaction(STORE,'readwrite');t.objectStore(STORE).delete(id);t.oncomplete=()=>{db.close();resolve()};t.onerror=()=>reject(t.error)})}
const prevRender=render;
render=function(){
 prevRender();
 if(section==='recordatorios')renderReminders();
 if(section==='documentos')renderPrivateDocs();
};
function localDay(date){return date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0')}
function nextOccurrence(x,now){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(x.fecha||''))return null;
 const time=/^\d{2}:\d{2}$/.test(x.hora||'')?x.hora:'09:00';
 const base=new Date(x.fecha+'T'+time+':00');if(Number.isNaN(base.getTime()))return null;
 const mode=(x.repeticion||'Una vez').toLowerCase();
 if(base>=now||mode==='una vez')return base;
 const d=new Date(base);
 if(mode==='diaria'){const n=Math.max(0,Math.floor((now-base)/86400000));d.setDate(d.getDate()+n);while(d<now)d.setDate(d.getDate()+1)}
 else if(mode==='semanal'){const n=Math.max(0,Math.floor((now-base)/(7*86400000)));d.setDate(d.getDate()+7*n);while(d<now)d.setDate(d.getDate()+7)}
 else if(mode==='mensual'){const target=base.getDate();d.setDate(1);d.setMonth(d.getMonth()+Math.max(0,(now.getFullYear()-base.getFullYear())*12+now.getMonth()-base.getMonth()));d.setDate(Math.min(target,new Date(d.getFullYear(),d.getMonth()+1,0).getDate()));while(d<now){d.setDate(1);d.setMonth(d.getMonth()+1);d.setDate(Math.min(target,new Date(d.getFullYear(),d.getMonth()+1,0).getDate()))}}
 return d;
}
function renderReminders(){
 const el=document.getElementById('content');if(!el)return;
 const now=new Date(),upcoming=(data.recordatorios||[]).map(x=>({x,next:nextOccurrence(x,now)})).filter(o=>o.next).sort((a,b)=>a.next-b.next).slice(0,8);
 const panel=document.createElement('div');panel.className='card';panel.innerHTML='<h3>🔔 Próximos recordatorios</h3><p>Los avisos del navegador funcionan únicamente mientras Huellitas esté abierta. No son notificaciones en segundo plano.</p><button id="allowLocalNotifications" class="secondary">Activar avisos mientras uso Huellitas</button><div>'+upcoming.map(({x,next})=>'<p>• '+escapeText(x.nombre)+' — '+escapeText(data.mascotas.find(p=>p.id===x.pet)?.nombre||'')+' · '+escapeText(next.toLocaleString('es-CR',{dateStyle:'medium',timeStyle:'short'}))+'</p>').join('')+'</div>';el.prepend(panel);
 panel.querySelector('#allowLocalNotifications').onclick=async()=>{if(!('Notification'in window)){alert('Este navegador no admite notificaciones.');return}try{const p=await Notification.requestPermission();alert(p==='granted'?'Avisos habilitados mientras la página esté abierta.':'No se concedió permiso para avisos.')}catch{alert('No fue posible activar los avisos.')}};
}
const fired=new Set();
function checkDue(){
 if(!('Notification'in window)||Notification.permission!=='granted'||document.visibilityState!=='visible')return;
 const now=new Date();
 for(const x of data.recordatorios||[]){
   const due=nextOccurrence(x,new Date(now.getTime()-60000));
   if(!due||Math.abs(now-due)>60000)continue;
   const key=x.id+'-'+due.getTime();if(fired.has(key))continue;fired.add(key);
   try{new Notification('🐾 Huellitas: '+x.nombre,{body:'Recordatorio para '+(data.mascotas.find(p=>p.id===x.pet)?.nombre||'tu mascota')})}catch{}
 }
}
setInterval(checkDue,30000);
async function renderPrivateDocs(){
 const el=document.getElementById('content');if(!el)return;
 const panel=document.createElement('section');panel.className='card';panel.innerHTML='<h3>🔒 Archivos guardados en este dispositivo</h3><p>Los archivos se almacenan en el navegador de este dispositivo, sin subirlos a GitHub ni a servidores. <strong>No están cifrados ni sincronizados</strong>; otras personas con acceso a este navegador podrían verlos. Borrar los datos del sitio puede eliminarlos. El respaldo JSON no incluye estos archivos.</p><label for="privatePet">Mascota</label><select id="privatePet">'+data.mascotas.map(p=>'<option value="'+escapeText(p.id)+'">'+escapeText(p.nombre)+'</option>').join('')+'</select><label for="privateFile">Archivo PDF o imagen (máximo 5 MB)</label><input id="privateFile" type="file" accept="application/pdf,image/png,image/jpeg,image/webp"><button id="savePrivateFile">Guardar archivo en el dispositivo</button><p id="privateFileStatus" role="status"></p><div id="privateFiles"></div>';
 el.prepend(panel);
 const list=panel.querySelector('#privateFiles'),status=panel.querySelector('#privateFileStatus');
 async function refresh(){try{const docs=await getDocs();list.replaceChildren();for(const doc of docs){const row=document.createElement('div');row.className='record';const label=document.createElement('span');label.textContent=doc.name+' · '+(data.mascotas.find(p=>p.id===doc.pet)?.nombre||'Mascota eliminada');const open=document.createElement('button');open.textContent='Abrir';open.className='secondary';open.onclick=()=>{const url=URL.createObjectURL(doc.blob),a=document.createElement('a');a.href=url;a.download=doc.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000)};const remove=document.createElement('button');remove.textContent='Eliminar';remove.onclick=async()=>{if(confirm('¿Eliminar definitivamente este archivo local?')){await delDoc(doc.id);refresh()}};row.append(label,open,remove);list.append(row)}}catch{status.textContent='Este navegador no permite guardar archivos locales.'}}
 panel.querySelector('#savePrivateFile').onclick=async()=>{const f=panel.querySelector('#privateFile').files[0];if(!f)return status.textContent='Selecciona un archivo.';if(!data.mascotas.length)return status.textContent='Primero registra una mascota.';if(f.size>5*1024*1024)return status.textContent='El archivo supera 5 MB.';if(!['application/pdf','image/png','image/jpeg','image/webp'].includes(f.type))return status.textContent='Solo PDF, JPG, PNG o WebP.';try{await addDoc({id:crypto.randomUUID(),pet:panel.querySelector('#privatePet').value,name:f.name,blob:f,date:localDay(new Date())});status.textContent='Archivo guardado en este navegador.';panel.querySelector('#privateFile').value='';await refresh()}catch{status.textContent='No se pudo guardar. Puede faltar espacio de almacenamiento.'}};
 await refresh();
}
render();
})();