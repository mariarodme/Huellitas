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
 if(!Object.prototype.hasOwnProperty.call(extra,section)){originalRender();document.getElementById('nav').innerHTML=Object.keys(names).map(s=>'<button class="'+(s===section?'active':'')+'" onclick="change(\''+s+'\')">'+icons[s]+' '+names[s]+'</button>').join('');document.getElementById('bottom').innerHTML=['inicio','mascotas','agenda','recordatorios','configuracion'].map(s=>'<button onclick="change(\''+s+'\')">'+icons[s]+'<br>'+names[s]+'</button>').join('');return}
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

/* Dashboard, búsqueda y resumen local */
const previousRender=render;
let searchTerm='';
render=function(){
 previousRender();
 if(section==='inicio'){
   const entries=[...data.agenda.map(x=>({...x,tipo:'📅 Cita'})),...data.vacunas.map(x=>({...x,tipo:'💉 Vacuna'})),...data.medicamentos.map(x=>({...x,tipo:'💊 Medicamento'})),...data.recordatorios.map(x=>({...x,tipo:'🔔 Recordatorio'}))]
   .filter(x=>x.fecha&&x.fecha>=today()).sort((a,b)=>a.fecha.localeCompare(b.fecha)).slice(0,5);
   const target=document.getElementById('content');
   target.insertAdjacentHTML('beforeend','<section class="upcoming"><h2>📆 Próximas actividades</h2>'+(entries.length?'<div class="cards">'+entries.map(x=>'<div class="card"><strong>'+esc(x.tipo)+'</strong><h3>'+esc(x.nombre)+'</h3><p>'+esc(x.fecha)+' '+esc(x.hora||'')+'</p><p class="muted">'+esc(data.mascotas.find(p=>p.id===x.pet)?.nombre||'')+'</p></div>').join('')+'</div>':'<div class="empty">¡Todo al día! Aquí aparecerán las próximas actividades. 🐾</div>')+'</section>');
 }
 if(section==='mascotas'&&data.mascotas.length){
   const target=document.getElementById('content');
   const cards=target.querySelector('.cards');
   if(cards){
     cards.insertAdjacentHTML('beforebegin','<label for="petSearch">🔎 Buscar mascota</label><input id="petSearch" type="search" placeholder="Escribe el nombre..." value="'+esc(searchTerm)+'">');
     const input=document.getElementById('petSearch');
     const filter=()=>{const q=input.value.trim().toLocaleLowerCase('es');Array.from(cards.children).forEach(card=>{const title=card.querySelector('h3');card.hidden=!!q&&!title?.textContent.toLocaleLowerCase('es').includes(q)})};
     input.oninput=()=>{searchTerm=input.value;filter()};filter();
   }
 }
};

/* More pet-care modules, stored locally until Supabase is configured */
const newModules={salud:'🩺',desparasitacion:'🪱',alimentacion:'🥣'};
Object.assign(names,{salud:'Historial médico',desparasitacion:'Desparasitación',alimentacion:'Alimentación'});
Object.assign(icons,newModules);
for(const k of Object.keys(newModules))if(!Array.isArray(data[k]))data[k]=[];
const dashboardRender=render;
render=function(){
 if(Object.prototype.hasOwnProperty.call(newModules,section)){
   document.getElementById('heading').textContent=names[section];
   document.getElementById('nav').innerHTML=Object.keys(names).map(s=>'<button class="'+(s===section?'active':'')+'" data-section="'+s+'">'+icons[s]+' '+names[s]+'</button>').join('');
   document.getElementById('bottom').innerHTML=['inicio','mascotas','agenda','salud','configuracion'].map(s=>'<button data-section="'+s+'">'+icons[s]+'<br>'+names[s]+'</button>').join('');
   document.querySelectorAll('[data-section]').forEach(b=>b.onclick=()=>change(b.dataset.section));
   const items=data[section];
   document.getElementById('content').innerHTML='<p><button id="addModule">+ Agregar registro</button></p>'+(items.length?'<div class="cards">'+items.map(x=>'<div class="card"><h3>'+esc(x.nombre)+'</h3><p>'+esc(data.mascotas.find(p=>p.id===x.pet)?.nombre||'')+' · '+esc(x.fecha||'')+'</p><p>'+esc(x.notas||'')+'</p><button class="secondary" data-delete="'+esc(x.id)+'">Eliminar</button></div>').join('')+'</div>':'<div class="empty">🐾 Aún no hay registros.</div>');
   document.getElementById('addModule').onclick=()=>moduleForm(section);
   document.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>{if(confirm('¿Eliminar registro?')){data[section]=data[section].filter(x=>x.id!==b.dataset.delete);persist()}});
   return;
 }
 dashboardRender();
};
function moduleForm(s){
 if(!data.mascotas.length){alert('Primero agrega una mascota.');change('mascotas');return}
 document.getElementById('modal').innerHTML='<div class="modal"><div class="dialog"><h2>'+names[s]+'</h2><form id="moduleForm"><label>Mascota</label><select name="pet">'+data.mascotas.map(p=>'<option value="'+esc(p.id)+'">'+esc(p.nombre)+'</option>').join('')+'</select><label>'+ (s==='salud'?'Consulta o diagnóstico':s==='desparasitacion'?'Producto o tratamiento':'Alimento o dieta')+'</label><input name="nombre" required maxlength="150"><label>Fecha</label><input type="date" name="fecha" required value="'+today()+'"><label>Notas</label><textarea name="notas" maxlength="3000"></textarea><div class="actions"><button type="button" class="secondary" id="cancelModule">Cancelar</button><button>Guardar</button></div></form></div></div>';
 document.getElementById('cancelModule').onclick=closeForm;
 document.getElementById('moduleForm').onsubmit=e=>{e.preventDefault();data[s].push({id:crypto.randomUUID(),...Object.fromEntries(new FormData(e.target))});closeForm();persist()};
}

/* Printable medical summary and weight visualization */
window.printPetReport=function(){
 if(!data.mascotas.length)return alert('Primero registra una mascota.');
 const id=prompt('Escribe el nombre exacto de la mascota para generar el informe:\n'+data.mascotas.map(p=>p.nombre).join(', '));
 if(id===null)return;
 const pet=data.mascotas.find(p=>p.nombre.toLocaleLowerCase()===id.trim().toLocaleLowerCase());
 if(!pet)return alert('No se encontró esa mascota.');
 const sections=[['Consultas',data.salud||[]],['Vacunas',data.vacunas],['Medicamentos',data.medicamentos],['Desparasitación',data.desparasitacion||[]],['Peso',data.peso||[]],['Citas',data.agenda]];
 const body=sections.map(([name,items])=>'<h2>'+esc(name)+'</h2>'+(items.filter(x=>x.pet===pet.id).length?'<ul>'+items.filter(x=>x.pet===pet.id).map(x=>'<li>'+esc(x.fecha||'')+' — '+esc(x.nombre||x.peso+' kg')+' '+esc(x.notas||'')+'</li>').join('')+'</ul>':'<p>Sin registros.</p>')).join('');
 const html='<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Informe de '+esc(pet.nombre)+'</title><style>body{font:16px system-ui;margin:40px;line-height:1.5;color:#26251f}h1{color:#c46e67}h2{border-bottom:1px solid #ccc;margin-top:28px}li{margin:7px 0}@media print{button{display:none}}</style></head><body><h1>🐾 Huellitas · Informe de '+esc(pet.nombre)+'</h1><p>Especie: '+esc(pet.especie)+' · Raza: '+esc(pet.raza||'')+' · Nacimiento: '+esc(pet.nacimiento||'')+'</p><p>Generado: '+new Date().toLocaleDateString('es-CR')+'</p>'+body+'<p><small>Este resumen es un registro personal y no sustituye un expediente veterinario oficial.</small></p><button onclick="window.print()">Imprimir / Guardar como PDF</button></body></html>';
 const blob=URL.createObjectURL(new Blob([html],{type:'text/html'}));const a=document.createElement('a');a.href=blob;a.target='_blank';a.rel='noopener';a.click();setTimeout(()=>URL.revokeObjectURL(blob),60000);
};
const originalSettings=render;
render=function(){
 originalSettings();
 if(section==='configuracion'){
   const el=document.getElementById('content');
   el.insertAdjacentHTML('beforeend','<div class="card"><h3>📄 Informe médico en PDF</h3><p>Genera un resumen imprimible de vacunas, consultas, tratamientos y peso. En el navegador selecciona «Guardar como PDF».</p><button id="printReport">Preparar informe</button></div>');
   document.getElementById('printReport').onclick=printPetReport;
 }
 if(section==='peso'){
   const list=(data.peso||[]).filter(x=>Number(x.peso)>0).sort((a,b)=>String(a.fecha).localeCompare(String(b.fecha)));
   if(list.length>1){
     const byPet=data.mascotas.map(p=>({pet:p,values:list.filter(x=>x.pet===p.id)})).filter(x=>x.values.length>1);
     const content=byPet.map(({pet,values})=>{
       const nums=values.map(x=>Number(x.peso)),lo=Math.min(...nums),hi=Math.max(...nums),span=hi-lo||1;
       const points=nums.map((n,i)=>(10+i*280/(nums.length-1)).toFixed(1)+','+(100-(n-lo)/span*80).toFixed(1)).join(' ');
       return '<div class="card"><h3>📈 '+esc(pet.nombre)+'</h3><svg viewBox="0 0 300 115" role="img" aria-label="Evolución del peso" style="width:100%;max-height:220px"><polyline points="'+points+'" fill="none" stroke="#d77963" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg><p>De '+esc(values[0].fecha)+' a '+esc(values[values.length-1].fecha)+' · '+nums[0]+' kg → '+nums[nums.length-1]+' kg</p></div>';
     }).join('');
     document.getElementById('content').insertAdjacentHTML('beforeend','<section class="upcoming"><h2>Evolución del peso</h2><div class="cards">'+content+'</div></section>');
   }
 }
};
render();
})();
