/* Huellitas stable app: single controller, backwards compatible local records. */
(function(){
'use strict';
const K='huellitas-v1', sections={inicio:'🏡 Inicio',mascotas:'🐾 Mascotas',agenda:'📅 Agenda',vacunas:'💉 Vacunas',medicamentos:'💊 Medicamentos',gastos:'💰 Gastos',salud:'🩺 Historial médico',desparasitacion:'🪱 Desparasitación',alimentacion:'🥣 Alimentación',peso:'⚖️ Peso',recordatorios:'🔔 Recordatorios',dosis:'💊 Dosis',documentos:'📁 Documentos',identificacion:'🪪 Carné digital',calendario:'🗓️ Calendario',contactos:'☎️ Contactos',galeria:'📷 Galería',configuracion:'⚙️ Configuración',diagnostico:'🧪 Diagnóstico',familia:'👪 Familia'};
let state;try{state=JSON.parse(localStorage.getItem(K))||{}}catch{state={}};if(!state||typeof state!=='object'||Array.isArray(state))state={};for(const k of Object.keys(sections))if(!['inicio','identificacion','calendario','diagnostico','familia'].includes(k)&&!Array.isArray(state[k]))state[k]=[];
let page='inicio',month=new Date().getMonth(),year=new Date().getFullYear();
const $=id=>document.getElementById(id),escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const date=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const pet=id=>state.mascotas.find(p=>p.id===id)?.nombre||'';
function save(){try{localStorage.setItem(K,JSON.stringify(state));render()}catch{alert('No se pudo guardar: almacenamiento lleno o bloqueado.')}}
function nav(){const keys=Object.keys(sections);$('nav').innerHTML=keys.map(k=>'<button data-page="'+k+'" class="'+(page===k?'active':'')+'">'+sections[k]+'</button>').join('');$('bottom').innerHTML=['inicio','mascotas','agenda','recordatorios','configuracion'].map(k=>'<button data-page="'+k+'">'+sections[k]+'</button>').join('')}
function render(){nav();$('heading').textContent=sections[page];const el=$('content');
 if(page==='inicio'){el.innerHTML='<div class="cards"><div class="card"><h3>Mascotas</h3><h1>'+state.mascotas.length+'</h1></div><div class="card"><h3>Citas</h3><h1>'+state.agenda.length+'</h1></div><div class="card"><h3>Gastos</h3><h1>₡'+state.gastos.reduce((n,x)=>n+Number(x.monto||0),0).toLocaleString('es-CR')+'</h1></div></div><p><button data-action="addpet">+ Agregar mascota</button></p>';return}
 if(page==='documentos'&&window.HuellitasDocs){window.HuellitasDocs.render(el,state.mascotas);return}
 if(page==='familia'){el.innerHTML='<div class="card"><h3>Familia</h3><p>Compartir cuentas estará disponible después de configurar Supabase.</p></div>';return}
 if(page==='configuracion'){el.innerHTML='<div class="cards"><div class="card"><h3>Respaldo</h3><button data-action="backup">Descargar JSON</button></div><div class="card"><h3>Restaurar</h3><input type="file" id="restore" accept=".json,application/json"><button data-action="restore">Restaurar respaldo</button></div><div class="card"><h3>Importar registros sin borrar los actuales</h3><input type="file" id="importRecords" accept=".json,application/json"><button data-action="importRecords">Importar registros</button></div><div class="card"><h3>Notificaciones</h3><button data-action="permission">Activar avisos</button> <button data-action="test">Aviso de prueba</button><p>Los avisos automáticos con la app cerrada necesitan un servidor.</p></div></div>';return}
 if(page==='diagnostico'){el.innerHTML='<div class="card"><h3>Compatibilidad</h3><p>Almacenamiento: '+(typeof localStorage!=='undefined'?'disponible':'no disponible')+'</p><p>Archivos locales: '+('indexedDB'in window?'compatible':'no compatible')+'</p><p>Notificaciones: '+('Notification'in window?'compatible':'no compatible')+'</p><p>Service Worker: '+('serviceWorker'in navigator?'compatible':'no compatible')+'</p></div>';return}
 if(page==='identificacion'){el.innerHTML='<div class="cards">'+state.mascotas.map(p=>'<div class="card"><h3>🐾 '+escape(p.nombre)+'</h3><p>'+escape(p.especie||'')+' · '+escape(p.raza||'')+'</p><p>Microchip: '+escape(p.microchip||'No registrado')+'</p><button data-action="qr" data-id="'+escape(p.id)+'">Generar QR básico</button><div id="qr-'+escape(p.id)+'"></div></div>').join('')+'</div><p>El QR contiene solo nombre y especie. No incluye información privada.</p>';return}
 if(page==='calendario'){const offset=(new Date(year,month,1).getDay()+6)%7,days=new Date(year,month+1,0).getDate();const events=['agenda','vacunas','medicamentos','recordatorios','desparasitacion'].flatMap(k=>state[k].map(x=>({...x,kind:k})));let html='<div class="calendar-toolbar"><button data-action="prev">←</button><h3>'+new Date(year,month,1).toLocaleDateString('es-CR',{month:'long',year:'numeric'})+'</h3><button data-action="next">→</button></div><div class="calendar-grid">'+['L','M','X','J','V','S','D'].map(x=>'<div class="calendar-weekday">'+x+'</div>').join('');for(let i=0;i<offset;i++)html+='<div class="calendar-day empty-day"></div>';for(let i=1;i<=days;i++){const d=year+'-'+String(month+1).padStart(2,'0')+'-'+String(i).padStart(2,'0');html+='<div class="calendar-day"><strong>'+i+'</strong>'+events.filter(x=>x.fecha===d).slice(0,2).map(x=>'<div class="calendar-event">'+escape(x.nombre||x.kind)+'</div>').join('')+'</div>'}el.innerHTML=html+'</div>';return}
 if(page==='mascotas'){el.innerHTML='<p><button data-action="add">+ Agregar mascota</button></p><div class="cards">'+state.mascotas.map(p=>'<div class="card"><div style="display:flex;align-items:center;gap:12px">'+(p.foto?'<img src="'+escape(p.foto)+'" style="width:80px;height:80px;object-fit:cover;border-radius:50%" alt="Foto de '+escape(p.nombre)+'">':'<span style="width:80px;height:80px;border-radius:50%;background:#fce4ef;display:inline-flex;align-items:center;justify-content:center;font-size:42px;flex-shrink:0">🐾</span>')+'<div><h3>'+escape(p.nombre)+'</h3><p>'+escape(p.especie||'')+'</p></div></div><button data-action="profile" data-id="'+escape(p.id)+'">Ver perfil</button> <button data-action="edit" data-id="'+escape(p.id)+'">Editar y cambiar foto</button> <button data-action="delete" data-id="'+escape(p.id)+'" class="secondary">Eliminar</button></div>').join('')+'</div>';return}
 const list=state[page]||[];el.innerHTML='<p><button data-action="add">+ Agregar '+sections[page]+'</button></p>'+(list.length?'<div class="cards">'+list.map(x=>'<div class="card"><h3>'+escape(x.nombre||x.peso+' kg')+'</h3><p>'+escape(page==='mascotas'?x.especie||'':pet(x.pet))+' · '+escape(x.fecha||'')+'</p><p>'+escape(x.notas||x.alergias||'')+'</p>'+'<button data-action="edit" data-id="'+escape(x.id)+'">Editar</button> '+'<button class="secondary" data-action="delete" data-id="'+escape(x.id)+'">Eliminar</button></div>').join('')+'</div>':'<div class="empty">🐾 Aún no hay registros.</div>');
}
function showProfile(id){const p=state.mascotas.find(x=>x.id===id);if(!p)return;const keys=['peso','desparasitacion','vacunas','agenda','medicamentos','recordatorios','salud'];const history=keys.map(k=>{const rows=(state[k]||[]).filter(x=>x.pet===id);return rows.length?'<h3>'+sections[k]+'</h3>'+rows.map(x=>'<p>'+escape(x.fecha||'')+' — '+escape(x.nombre||x.peso+' kg')+' '+escape(x.notas||'')+'</p>').join(''):''}).join('');$('content').innerHTML='<button data-page="mascotas">← Volver</button><div class="card" style="text-align:center">'+(p.foto?'<img src="'+escape(p.foto)+'" alt="Foto" style="width:150px;height:150px;object-fit:cover;border-radius:50%">':'<p style="font-size:64px">🐾</p>')+'<h2>'+escape(p.nombre)+'</h2><p>'+escape(p.especie||'')+' · '+escape(p.raza||'')+'</p><p>Microchip: '+escape(p.microchip||'No registrado')+'</p><p>Alergias: '+escape(p.alergias||'No registradas')+'</p><button data-action="edit" data-id="'+escape(id)+'">Editar y cambiar foto</button></div><div class="card">'+(history||'Sin registros todavía')+'</div>'}
async function resizePhoto(file){if(!file.type.startsWith('image/'))throw Error('Selecciona una imagen');if(file.size>8000000)throw Error('La foto supera 8 MB');const url=URL.createObjectURL(file);try{const img=new Image();img.src=url;await img.decode();const canvas=document.createElement('canvas');canvas.width=300;canvas.height=300;const ctx=canvas.getContext('2d');const side=Math.min(img.naturalWidth,img.naturalHeight);ctx.drawImage(img,(img.naturalWidth-side)/2,(img.naturalHeight-side)/2,side,side,0,0,300,300);return canvas.toDataURL('image/jpeg',0.7)}finally{URL.revokeObjectURL(url)}}
function field(label,name,type='text',value='',required=false){return '<label>'+label+'</label><input name="'+name+'" type="'+type+'" value="'+escape(value)+'" '+(required?'required':'')+'>'}
function showForm(id){if(page!=='mascotas'&&page!=='contactos'&&!state.mascotas.length){alert('Primero registra una mascota.');go('mascotas');return}const old=(state[page]||[]).find(x=>x.id===id)||{};let fields='';
 if(page==='mascotas')fields=field('Nombre','nombre','text',old.nombre,true)+'<label>Especie</label><select name="especie">'+['Perro','Gato','Otro'].map(x=>'<option '+(old.especie===x?'selected':'')+'>'+x+'</option>').join('')+'</select>'+field('Raza','raza','text',old.raza)+field('Nacimiento','nacimiento','date',old.nacimiento)+field('Microchip','microchip','text',old.microchip)+field('Alergias','alergias','text',old.alergias)+field('Veterinario','veterinario','text',old.veterinario);
 if(page==='mascotas')fields+='<label>Foto de perfil</label><input name="fotoArchivo" type="file" accept="image/*">';
 else{if(page!=='contactos')fields='<label>Mascota</label><select name="pet">'+state.mascotas.map(p=>'<option value="'+escape(p.id)+'" '+(old.pet===p.id?'selected':'')+'>'+escape(p.nombre)+'</option>').join('')+'</select>';fields+=field(page==='gastos'?'Concepto':page==='peso'?'Descripción': 'Nombre','nombre','text',old.nombre,page!=='peso')+field('Fecha','fecha','date',old.fecha||date());if(page==='gastos')fields+=field('Monto en colones','monto','number',old.monto,true);if(page==='peso')fields+=field('Peso (kg)','peso','number',old.peso,true);if(page==='recordatorios'||page==='dosis')fields+=field('Hora','hora','time',old.hora);if(page==='recordatorios')fields+='<label>Repetición</label><select name="repeticion">'+['Una vez','Diaria','Semanal','Mensual'].map(x=>'<option '+(old.repeticion===x?'selected':'')+'>'+x+'</option>').join('')+'</select>';if(page==='dosis')fields+=field('Cantidad','cantidad','text',old.cantidad);if(page==='contactos')fields+=field('Teléfono','telefono','tel',old.telefono);fields+='<label>Notas</label><textarea name="notas">'+escape(old.notas||'')+'</textarea>'}
 $('modal').innerHTML='<div class="modal"><div class="dialog"><h2>'+sections[page]+'</h2><form id="petEntry">'+fields+'<div class="actions"><button type="button" data-action="cancel" class="secondary">Cancelar</button><button type="submit">Guardar</button></div></form></div></div>';
 $('petEntry').onsubmit=async e=>{e.preventDefault();try{const v=Object.fromEntries(new FormData(e.target));delete v.fotoArchivo;if(page==='mascotas'){const file=e.target.elements.fotoArchivo.files[0];if(file)v.foto=await resizePhoto(file)}if(id)Object.assign(old,v);else state[page].push({id:crypto.randomUUID(),...v});$('modal').innerHTML='';save()}catch(err){alert('No se pudo guardar: '+err.message)}};
}

// Recordatorios locales: solo mientras la app está abierta; no son push en segundo plano.
const notified=new Set();
function reminderDate(x,now){
 if(!/^\\d{4}-\\d{2}-\\d{2}$/.test(x.fecha||''))return null;
 const h=/^\\d{2}:\\d{2}$/.test(x.hora||'')?x.hora:'09:00';
 const d=new Date(x.fecha+'T'+h+':00');if(!Number.isFinite(d.getTime()))return null;
 const mode=(x.repeticion||'Una vez').toLowerCase();
 if(d>now||mode==='una vez')return d;
 if(mode==='diaria'||mode==='semanal'){
  const step=mode==='diaria'?1:7;
  while(d<now)d.setDate(d.getDate()+step);
 }else if(mode==='mensual'){
  const day=d.getDate();while(d<now){d.setDate(1);d.setMonth(d.getMonth()+1);d.setDate(Math.min(day,new Date(d.getFullYear(),d.getMonth()+1,0).getDate()))}
 }
 return d;
}
function checkReminders(){
 if(document.visibilityState!=='visible'||!Array.isArray(state.recordatorios))return;
 const now=new Date(),cutoff=new Date(now.getTime()-120000);
 for(const x of state.recordatorios){
  const due=reminderDate(x,cutoff);
  if(!due||due>now||now-due>120000)continue;
  const key=x.id+'-'+due.getTime();
  if(notified.has(key))continue;
  try{
   const log=JSON.parse(localStorage.getItem('huellitas-notified')||'{}');
   if(log[key]){notified.add(key);continue}
   log[key]=Date.now();for(const k of Object.keys(log))if(Date.now()-log[k]>604800000)delete log[k];
   localStorage.setItem('huellitas-notified',JSON.stringify(log));
  }catch{}
  notified.add(key);
  const title='🐾 Huellitas: '+String(x.nombre||'Recordatorio').slice(0,80);
  const body='Para '+(pet(x.pet)||'tu mascota');
  if('Notification'in window&&Notification.permission==='granted'){
   if('serviceWorker'in navigator)navigator.serviceWorker.getRegistration('./').then(reg=>reg?reg.showNotification(title,{body,icon:'./icon.svg',tag:key}):new Notification(title,{body})).catch(()=>alert(title+' — '+body));
   else try{new Notification(title,{body})}catch{alert(title+' — '+body)}
  }else{
   const box=document.createElement('div');box.setAttribute('role','alert');box.style.cssText='position:fixed;top:10px;right:10px;z-index:9999;background:#ffdf70;border:2px solid #26251f;border-radius:16px;padding:18px;max-width:300px';box.textContent=title+' — '+body+' (toca para cerrar)';box.onclick=()=>box.remove();document.body.append(box);
  }
 }
}
setInterval(checkReminders,30000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')checkReminders()});
setTimeout(checkReminders,1500);
function go(s){if(!sections[s])return;page=s;render()}
function download(name,blob){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)}
document.addEventListener('click',async e=>{const btn=e.target.closest('button');if(!btn)return;try{
 if(btn.dataset.page){go(btn.dataset.page);return}
 const a=btn.dataset.action,id=btn.dataset.id;
 if(a==='profile'){showProfile(id);return}
 if(a==='addpet'){page='mascotas';showForm();return}
 if(a==='add'||a==='edit'){showForm(a==='edit'?id:null);return}
 if(a==='cancel'){$('modal').innerHTML='';return}
 if(a==='delete'){if(confirm('¿Eliminar registro?')){state[page]=state[page].filter(x=>x.id!==id);save()}return}
 if(a==='importRecords'){const f=$('importRecords')?.files[0];if(!f)return alert('Selecciona un archivo JSON.');const obj=JSON.parse(await f.text());if(!obj||!Array.isArray(obj.mascotas)||!Array.isArray(obj.desparasitacion)||!Array.isArray(obj.peso)||!Array.isArray(obj.recordatorios))throw Error('Archivo de importación inválido');const p=obj.mascotas[0];if(!p||!p.nombre)throw Error('Mascota sin nombre');let existing=state.mascotas.find(x=>x.nombre.toLowerCase()===p.nombre.toLowerCase());if(!existing){existing={...p,id:crypto.randomUUID()};state.mascotas.push(existing)}const add=(section,rows)=>{for(const row of rows){const signature=row.importKey;if(signature&&state[section].some(x=>x.importKey===signature))continue;state[section].push({...row,id:crypto.randomUUID(),pet:existing.id})}};add('desparasitacion',obj.desparasitacion);add('peso',obj.peso);add('recordatorios',obj.recordatorios);save();alert('Registros importados para '+existing.nombre+'.');return}
 if(a==='backup'){download('huellitas-respaldo.json',new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));return}
 if(a==='restore'){const f=$('restore').files[0];if(!f)return alert('Selecciona un respaldo JSON.');const obj=JSON.parse(await f.text());if(!obj||!Array.isArray(obj.mascotas))throw Error('Respaldo inválido');if(confirm('¿Reemplazar los datos actuales?')){for(const k of Object.keys(sections))if(Array.isArray(state[k]))state[k]=Array.isArray(obj[k])?obj[k]:[];save()}return}
 if(a==='prev'||a==='next'){month+=a==='next'?1:-1;if(month<0){month=11;year--}if(month>11){month=0;year++}render();return}
 if(a==='permission'){if(!('Notification'in window))return alert('Este navegador no admite avisos.');alert('Permiso: '+await Notification.requestPermission());return}
 if(a==='test'){if(!('Notification'in window)||Notification.permission!=='granted')return alert('Primero activa los permisos.');const reg='serviceWorker'in navigator?await navigator.serviceWorker.ready:null;if(reg)await reg.showNotification('🐾 Huellitas',{body:'Aviso de prueba',icon:'./icon.svg'});else new Notification('🐾 Huellitas',{body:'Aviso de prueba'});return}
 if(a==='qr'){const p=state.mascotas.find(x=>x.id===id),target=$('qr-'+id);if(!p||!target)return;target.replaceChildren();if(typeof QRCode==='undefined')return target.textContent='El generador QR necesita conexión a internet.';new QRCode(target,{text:'Huellitas | '+p.nombre+' | '+p.especie,width:180,height:180});return}
 }catch(err){console.error(err);alert('No se pudo completar la acción: '+err.message)}});
window.change=go;window.form=()=>showForm();window.backup=()=>download('huellitas-respaldo.json',new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));
render();
})();