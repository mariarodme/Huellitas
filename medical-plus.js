/* Huellitas - medical care enhancements. Data stays in local browser. */
(function(){
'use strict';
const esc2=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const modules={dosis:'💊',documentos:'📁',identificacion:'🪪'};
Object.assign(names,{dosis:'Control de dosis',documentos:'Documentos',identificacion:'Carné digital'});
Object.assign(icons,modules);
for(const key of ['dosis','documentos'])if(!Array.isArray(data[key]))data[key]=[];
const previousRender=render;
render=function(){
 previousRender();
 if(section==='dosis')renderDoses();
 if(section==='documentos')renderDocs();
 if(section==='identificacion')renderId();
};
function petSelect(){return '<label>Mascota</label><select name="pet" required>'+data.mascotas.map(p=>'<option value="'+esc2(p.id)+'">'+esc2(p.nombre)+'</option>').join('')+'</select>'}
function nav(){const n=document.getElementById('nav');n.innerHTML=Object.keys(names).map(s=>'<button data-nav="'+s+'" class="'+(s===section?'active':'')+'">'+icons[s]+' '+names[s]+'</button>').join('');n.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>change(b.dataset.nav));document.getElementById('bottom').innerHTML=['inicio','mascotas','agenda','identificacion','configuracion'].map(s=>'<button data-bottom="'+s+'">'+icons[s]+'<br>'+names[s]+'</button>').join('');document.querySelectorAll('[data-bottom]').forEach(b=>b.onclick=()=>change(b.dataset.bottom))}
function renderDoses(){
 nav();document.getElementById('heading').textContent='Control de dosis';
 const rows=data.dosis.slice().sort((a,b)=>String(b.fecha).localeCompare(String(a.fecha)));
 document.getElementById('content').innerHTML='<div class="card"><p>Registra cada dosis administrada. Este registro no envía alarmas ni sustituye las indicaciones del veterinario.</p><button id="newDose">+ Registrar dosis</button></div><div class="cards">'+rows.map(x=>'<div class="card"><h3>'+esc2(x.nombre)+'</h3><p>'+esc2(data.mascotas.find(p=>p.id===x.pet)?.nombre||'')+' · '+esc2(x.fecha)+' '+esc2(x.hora||'')+'</p><p>Dosis: '+esc2(x.cantidad||'No indicada')+'</p><button class="secondary" data-remove-dose="'+esc2(x.id)+'">Eliminar</button></div>').join('')+'</div>';
 document.getElementById('newDose').onclick=()=>showForm('dosis');document.querySelectorAll('[data-remove-dose]').forEach(b=>b.onclick=()=>{if(confirm('¿Eliminar dosis?')){data.dosis=data.dosis.filter(x=>x.id!==b.dataset.removeDose);persist()}});
}
function renderDocs(){
 nav();document.getElementById('heading').textContent='Documentos veterinarios';
 document.getElementById('content').innerHTML='<div class="card"><p>Guarda referencias y notas de documentos. Los archivos adjuntos privados se habilitarán con almacenamiento seguro en una etapa posterior.</p><button id="newDoc">+ Agregar referencia</button></div><div class="cards">'+data.documentos.map(x=>'<div class="card"><h3>'+esc2(x.nombre)+'</h3><p>'+esc2(data.mascotas.find(p=>p.id===x.pet)?.nombre||'')+' · '+esc2(x.fecha||'')+'</p><p>'+esc2(x.notas||'')+'</p><button class="secondary" data-remove-doc="'+esc2(x.id)+'">Eliminar</button></div>').join('')+'</div>';
 document.getElementById('newDoc').onclick=()=>showForm('documentos');document.querySelectorAll('[data-remove-doc]').forEach(b=>b.onclick=()=>{if(confirm('¿Eliminar referencia?')){data.documentos=data.documentos.filter(x=>x.id!==b.dataset.removeDoc);persist()}});
}
function showForm(kind){
 if(!data.mascotas.length){alert('Primero agrega una mascota.');change('mascotas');return}
 const fields=kind==='dosis'?'<label>Medicamento</label><input name="nombre" required maxlength="120"><label>Cantidad administrada (con unidad)</label><input name="cantidad" maxlength="80" placeholder="Ej.: 1 tableta"><label>Fecha</label><input name="fecha" type="date" required value="'+new Date().toLocaleDateString('en-CA')+'"><label>Hora</label><input name="hora" type="time">':'<label>Nombre del documento</label><input name="nombre" required maxlength="120"><label>Fecha</label><input name="fecha" type="date"><label>Descripción o ubicación del archivo</label><textarea name="notas" maxlength="1000"></textarea>';
 document.getElementById('modal').innerHTML='<div class="modal"><div class="dialog"><h2>'+names[kind]+'</h2><form id="careForm">'+petSelect()+fields+'<div class="actions"><button type="button" class="secondary" id="cancelCare">Cancelar</button><button>Guardar</button></div></form></div></div>';
 document.getElementById('cancelCare').onclick=closeForm;
 document.getElementById('careForm').onsubmit=e=>{e.preventDefault();data[kind].push({id:crypto.randomUUID(),...Object.fromEntries(new FormData(e.target))});closeForm();persist()};
}
function renderId(){
 nav();document.getElementById('heading').textContent='Carné digital';
 document.getElementById('content').innerHTML='<p class="muted">Ficha de identificación para mostrar en tu propio teléfono. No publica datos personales ni crea enlaces públicos.</p><div class="cards">'+data.mascotas.map(p=>'<div class="card pet-id"><div style="font-size:55px">🐾</div><h3>'+esc2(p.nombre)+'</h3><p>'+esc2(p.especie)+' · '+esc2(p.raza||'')+'</p><p><strong>Microchip:</strong> '+esc2(p.microchip||'Sin registrar')+'</p><p><strong>Señas:</strong> '+esc2(p.color||'Sin registrar')+'</p><p><strong>Veterinario:</strong> '+esc2(p.veterinario||'Sin registrar')+'</p><button class="secondary" data-print-id="'+esc2(p.id)+'">Imprimir carné</button></div>').join('')+'</div>';
 document.querySelectorAll('[data-print-id]').forEach(b=>b.onclick=()=>{const p=data.mascotas.find(x=>x.id===b.dataset.printId);if(!p)return;const w=window.open('','_blank');if(!w)return alert('Permite ventanas emergentes para imprimir.');w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>Carné Huellitas</title><style>body{font:18px system-ui;padding:30px;background:#fff9ef}article{border:3px solid #26251f;border-radius:24px;padding:28px;max-width:420px;background:#ffd6de}h1{font-size:38px}</style></head><body><article><h1>🐾 Huellitas</h1><h2>'+esc2(p.nombre)+'</h2><p>'+esc2(p.especie)+' · '+esc2(p.raza||'')+'</p><p>Microchip: '+esc2(p.microchip||'Sin registrar')+'</p><p>Señas: '+esc2(p.color||'Sin registrar')+'</p></article><p>Información personal. No constituye identificación oficial.</p><button onclick="print()">Imprimir / Guardar PDF</button></body></html>');w.document.close()});
}
render();
})();