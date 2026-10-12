/* Huellitas — funciones adicionales sin servidor.
   Los registros se guardan en el navegador; NO son cuentas privadas. */
(function(){
'use strict';
const extra={peso:'⚖️',recordatorios:'🔔',contactos:'☎️',galeria:'📷',configuracion:'⚙️'};
Object.assign(names,{peso:'Peso',recordatorios:'Recordatorios',contactos:'Contactos',galeria:'Galería',configuracion:'Configuración'});
Object.assign(icons,extra);
for(const k of Object.keys(extra)) if(!Array.isArray(data[k])) data[k]=[];
const originalRender=render;
const today=()=>new Date().toLocaleDateString('en-CA');
function field(label,name,type='text',required=false,value=''){return '<label>'+label+'</label><input type="'+type+'" name="'+name+'" '+(required?'required':'')+' value="'+esc(value)+'">'}
function choosePet(){return '<label>Mascota</label><select name="pet" required>'+data.mascotas.map(p=>'<option value="'+esc(p.id)+'">'+esc(p.nombre)+'</option>').join('')+'</select>'}
function extraForm(s,id){
 if(['peso','recordatorios','galeria'].includes(s)&&!data.mascotas.length){alert('Primero registra una mascota.');change('mascotas');return}
 const old=data[s].find(x=>x.id===id)||{};
 let fields='';
 if(s==='contactos') fields=field('Nombre','nombre','text',true,old.nombre)+field('Teléfono','telefono','tel',false,old.telefono)+field('Dirección','direccion','text',false,old.direccion)+field('Servicio','servicio','text',false,old.servicio);
 if(s==='peso')fields=choosePet()+field('Fecha','fecha','date',true,old.fecha||today())+field('Peso (kg)','peso','number',true,old.peso);
 if(s==='recordatorios')fields=choosePet()+field('Actividad','nombre','text',true,old.nombre)+field('Fecha','fecha','date',true,old.fecha||today())+field('Hora','hora','time',false,old.hora)+ '<label>Repetición</label><select name="repeticion"><option>Una vez</option><option>Diaria</option><option>Semanal</option><option>Mensual</option></select>';
 if(s==='galeria')fields=choosePet()+field('Descripción','nombre','text',true,old.nombre)+'<label>Fotografía (máximo 1 MB)</label><input name="foto" type="file" accept="image/*" '+(id?'':'required')+'>';
 document.getElementById('modal').innerHTML='<div class="modal"><div class="dialog"><h2>'+names[s]+'</h2><form id="extraEntry">'+fields+'<div class="actions"><button type="button" class="secondary" onclick="closeForm()">Cancelar</button><button>Guardar</button></div></form></div></div>';
 document.getElementById('extraEntry').onsubmit=async e=>{
 e.preventDefault();const fd=new FormData(e.target),v=Object.fromEntries(fd);delete v.foto;
 if(s==='galeria'){const file=fd.get('foto');if(file&&file.size){if(file.size>1048576){alert('La imagen debe pesar menos de 1 MB.');return}v.imagen=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)})}else v.imagen=old.imagen||''}
 if(s==='peso'&&!(Number(v.peso)>0)){alert('Ingresa un peso válido.');return}
 if(id)Object.assign(old,v);else data[s].push({id:crypto.randomUUID(),...v});
 try{persist();closeForm()}catch(err){alert('No hay suficiente espacio en el navegador. Descarga un respaldo y elimina fotos grandes.')}
 };
}
window.extraForm=extraForm;
window.extraDelete=function(s,id){if(confirm('¿Eliminar este registro?')){data[s]=data[s].filter(x=>x.id!==id);persist()}};
function renderExtra(s){
 if(s==='configuracion')return '<div class="cards"><div class="card"><h3>💾 Respaldo</h3><p>Descarga todos tus datos antes de cambiar de dispositivo.</p><button onclick="backup()">Descargar JSON</button></div><div class="card"><h3>📥 Restaurar</h3><p>Reemplaza los registros actuales por los de un respaldo anterior.</p><input type="file" id="restoreFile" accept=".json,application/json"><button onclick="restoreBackup()">Restaurar respaldo</button></div><div class="card"><h3>📊 Exportar</h3><p>Descarga los gastos en formato CSV.</p><button onclick="exportExpenses()">Exportar gastos</button></div></div><div class="card"><h3>🔒 Privacidad</h3><p>Esta versión guarda datos solamente en este navegador. No existe registro de usuarios ni sincronización entre dispositivos todavía. No ingreses información médica sensible de otras personas.</p></div>';
 const list=data[s]||[];
 let cards=list.map(x=>{
 const pet=data.mascotas.find(p=>p.id===x.pet)?.nombre||'';
 let extraText=s==='peso'?esc(x.peso)+' kg':s==='contactos'?esc(x.telefono||'')+' '+esc(x.servicio||''):s==='recordatorios'?esc(x.hora||'')+' · '+esc(x.repeticion||''):s==='galeria'?'Fotografía':'';
 const pic=s==='galeria'&&x.imagen?'<img alt="Foto de mascota" src="'+esc(x.imagen)+'" style="max-width:100%;max-height:240px;border-radius:16px">':'';
 return '<div class="card">'+pic+'<h3>'+esc(x.nombre||'Registro de peso')+'</h3><p class="muted">'+esc(pet)+' '+esc(x.fecha||'')+' '+extraText+'</p><button class="secondary" onclick="extraForm(\''+s+'\',\''+x.id+'\')">Editar</button> <button class="secondary" onclick="extraDelete(\''+s+'\',\''+x.id+'\')">Eliminar</button></div>'
 }).join('');
 if(s==='recordatorios')cards='<div class="card"><p>Los recordatorios se muestran aquí. Las alertas automáticas en segundo plano todavía no están disponibles.</p></div>'+cards;
 return '<p><button onclick="extraForm(\''+s+'\')">+ Agregar '+names[s]+'</button></p>'+(list.length?'<div class="cards">'+cards+'</div>':'<div class="empty">🐾 Todavía no hay registros.</div>');
}
render=function(){
 if(!Object.prototype.hasOwnProperty.call(extra,section)){originalRender();document.getElementById('nav').innerHTML=Object.keys(names).map(s=>'<button class="'+(s===section?'active':'')+'" onclick="change(\\''+s+'\\')">'+icons[s]+' '+names[s]+'</button>').join('');document.getElementById('bottom').innerHTML=['inicio','mascotas','agenda','recordatorios','configuracion'].map(s=>'<button onclick="change(\\''+s+'\\')">'+icons[s]+'<br>'+names[s]+'</button>').join('');return}
 document.getElementById('heading').textContent=names[section];
 document.getElementById('nav').innerHTML=Object.keys(names).map(s=>'<button class="'+(s===section?'active':'')+'" onclick="change(\''+s+'\')">'+icons[s]+' '+names[s]+'</button>').join('');
 document.getElementById('bottom').innerHTML=['inicio','mascotas','agenda','recordatorios','configuracion'].map(s=>'<button onclick="change(\''+s+'\')">'+icons[s]+'<br>'+names[s]+'</button>').join('');
 document.getElementById('content').innerHTML=renderExtra(section);
};
window.restoreBackup=async function(){
 const f=document.getElementById('restoreFile').files[0];if(!f)return alert('Selecciona un archivo JSON.');
 try{const obj=JSON.parse(await f.text());if(!obj||!Array.isArray(obj.mascotas)||!Array.isArray(obj.agenda)||!Array.isArray(obj.vacunas)||!Array.isArray(obj.medicamentos)||!Array.isArray(obj.gastos))throw Error('Formato inválido');
 if(!confirm('Esto reemplazará los datos guardados en este navegador. ¿Continuar?'))return;
 for(const k of Object.keys(data))data[k]=Array.isArray(obj[k])?obj[k]:[];persist();alert('Respaldo restaurado.');
 }catch(e){alert('No se pudo restaurar: '+e.message)}
};
window.exportExpenses=function(){
 const rows=[['Mascota','Concepto','Fecha','Monto CRC'],...data.gastos.map(x=>[data.mascotas.find(p=>p.id===x.pet)?.nombre||'',x.nombre,x.fecha,x.monto])];
 const csv='\uFEFF'+rows.map(r=>r.map(c=>'"'+String(c??'').replaceAll('"','""')+'"').join(',')).join('\r\n');
 const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='huellitas-gastos.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
render();
})();
