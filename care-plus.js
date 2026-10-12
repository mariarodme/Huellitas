/* Huellitas — fichas ampliadas, calendario y exportación .ics.
   Funciones locales: no requieren Supabase. */
(function(){
'use strict';
const htmlEscape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const details=['microchip','alergias','esterilizacion','veterinario','telefonoEmergencia','color','sexo'];
const monthNames=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
let calendarMonth=new Date().getMonth(),calendarYear=new Date().getFullYear();
names.calendario='Calendario';icons.calendario='🗓️';
function petDetailsForm(id){
 const p=data.mascotas.find(x=>x.id===id);if(!p)return;
 const textField=(label,key)=>'<label>'+label+'</label><input name="'+key+'" value="'+htmlEscape(p[key]||'')+'" maxlength="180">';
 document.getElementById('modal').innerHTML='<div class="modal"><div class="dialog"><h2>🐾 Ficha de '+htmlEscape(p.nombre)+'</h2><form id="petDetails">'+textField('Microchip','microchip')+textField('Alergias','alergias')+'<label>Esterilización</label><select name="esterilizacion"><option value="">Sin indicar</option><option value="Sí">Sí</option><option value="No">No</option></select>'+textField('Veterinario habitual','veterinario')+textField('Teléfono de emergencia','telefonoEmergencia')+textField('Color o señas','color')+'<label>Sexo</label><select name="sexo"><option value="">Sin indicar</option><option>Hembra</option><option>Macho</option></select><div class="actions"><button type="button" class="secondary" id="cancelDetails">Cancelar</button><button>Guardar ficha</button></div></form></div></div>';
 const f=document.getElementById('petDetails');f.elements.esterilizacion.value=p.esterilizacion||'';f.elements.sexo.value=p.sexo||'';
 document.getElementById('cancelDetails').onclick=closeForm;
 f.onsubmit=e=>{e.preventDefault();Object.assign(p,Object.fromEntries(new FormData(f)));closeForm();persist()};
}
window.petDetailsForm=petDetailsForm;
function records(){return [['agenda','📅'],['vacunas','💉'],['medicamentos','💊'],['recordatorios','🔔'],['desparasitacion','🩺']].flatMap(([k,icon])=>(data[k]||[]).filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x.fecha||'')).map(x=>({...x,kind:k,icon})))}
function drawCalendar(){
 const first=new Date(calendarYear,calendarMonth,1).getDay(),days=new Date(calendarYear,calendarMonth+1,0).getDate(),offset=(first+6)%7;
 const all=records(),daysHtml=Array.from({length:offset},()=>'<div class="calendar-day empty-day"></div>').join('')+Array.from({length:days},(_,i)=>{
 const d=String(i+1).padStart(2,'0'),date=calendarYear+'-'+String(calendarMonth+1).padStart(2,'0')+'-'+d;
 const events=all.filter(x=>x.fecha===date);
 return '<div class="calendar-day"><strong>'+ (i+1)+'</strong>'+events.slice(0,3).map(x=>'<div class="calendar-event" title="'+htmlEscape(x.nombre)+'">'+x.icon+' '+htmlEscape(x.nombre)+'</div>').join('')+(events.length>3?'<small>+'+(events.length-3)+' más</small>':'')+'</div>';
 }).join('');
 document.getElementById('heading').textContent='Calendario';
 document.getElementById('content').innerHTML='<div class="calendar-toolbar"><button id="prevMonth" class="secondary">←</button><h3>'+monthNames[calendarMonth]+' '+calendarYear+'</h3><button id="nextMonth" class="secondary">→</button></div><div class="calendar-grid">'+['L','M','X','J','V','S','D'].map(d=>'<div class="calendar-weekday">'+d+'</div>').join('')+daysHtml+'</div><p class="muted">Muestra las fechas guardadas. Las repeticiones automáticas todavía no se expanden en el calendario.</p><button id="exportCalendar">↓ Exportar eventos al calendario (.ics)</button>';
 document.getElementById('prevMonth').onclick=()=>{calendarMonth--;if(calendarMonth<0){calendarMonth=11;calendarYear--}drawCalendar()};
 document.getElementById('nextMonth').onclick=()=>{calendarMonth++;if(calendarMonth>11){calendarMonth=0;calendarYear++}drawCalendar()};
 document.getElementById('exportCalendar').onclick=exportCalendar;
}
function exportCalendar(){
 const clean=s=>String(s??'').replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
 const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Huellitas//Calendario//ES','CALSCALE:GREGORIAN'];
 for(const x of records()){const pet=data.mascotas.find(p=>p.id===x.pet)?.nombre||'';lines.push('BEGIN:VEVENT','UID:'+x.id+'@huellitas.local','DTSTAMP:'+stamp,'DTSTART;VALUE=DATE:'+x.fecha.replace(/-/g,''),'SUMMARY:'+clean(x.nombre||'Actividad')+(pet?' - '+clean(pet):''),'DESCRIPTION:'+clean(x.notas||x.details||''),'END:VEVENT')}
 lines.push('END:VCALENDAR');
 const blob=new Blob([lines.join('\r\n')+'\r\n'],{type:'text/calendar;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='huellitas-calendario.ics';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);
}
const previousRender=render;
render=function(){
 previousRender();
 if(section==='calendario'){
   const nav=document.getElementById('nav');nav.innerHTML=Object.keys(names).map(s=>'<button data-nav="'+s+'" class="'+(s===section?'active':'')+'">'+icons[s]+' '+names[s]+'</button>').join('');
   nav.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>change(b.dataset.nav));
   drawCalendar();
 }
 if(section==='mascotas'){
   const cards=document.querySelectorAll('#content .cards .card');
   cards.forEach((card,i)=>{const p=data.mascotas[i];if(!p)return;const age=p.nacimiento?Math.max(0,new Date().getFullYear()-Number(p.nacimiento.slice(0,4))-(new Date().toISOString().slice(5,10)<p.nacimiento.slice(5,10)?1:0)):null;
   const info=[age!==null?age+' años':'',p.microchip?'Microchip: '+p.microchip:'',p.alergias?'Alergias: '+p.alergias:''].filter(Boolean);
   const summary=document.createElement('p');summary.className='muted';summary.textContent=info.join(' · ');card.appendChild(summary);
   const btn=document.createElement('button');btn.className='secondary';btn.textContent='📋 Ficha completa';btn.onclick=()=>petDetailsForm(p.id);card.appendChild(btn);
   });
 }
};
render();
})();