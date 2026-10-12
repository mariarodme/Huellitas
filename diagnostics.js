/* Huellitas: panel de compatibilidad, diagnóstico y estado de instalación. */
(function(){
'use strict';
names.diagnostico='Diagnóstico';icons.diagnostico='🧪';
const prevRender=render;
render=function(){
 prevRender();
 if(section!=='diagnostico')return;
 const nav=document.getElementById('nav');
 nav.innerHTML=Object.keys(names).map(s=>'<button data-dnav="'+s+'" class="'+(s===section?'active':'')+'">'+icons[s]+' '+names[s]+'</button>').join('');
 nav.querySelectorAll('[data-dnav]').forEach(b=>b.onclick=()=>change(b.dataset.dnav));
 document.getElementById('heading').textContent='Diagnóstico de Huellitas';
 const el=document.getElementById('content');
 el.innerHTML='<div class="card"><h3>🧪 Compatibilidad del dispositivo</h3><p>Estas pruebas comprueban capacidades de este navegador. No reemplazan las pruebas manuales en Android y iPhone.</p><div id="checks" aria-live="polite"></div><button id="runChecks">Volver a comprobar</button></div><div class="card"><h3>📱 Instalación</h3><p>En Android, abre el menú de Chrome y busca «Instalar aplicación» o «Añadir a pantalla principal». En iPhone, abre Safari, pulsa Compartir y selecciona «Añadir a pantalla de inicio».</p><p>Los avisos con la app cerrada aún no están habilitados.</p></div><div class="card"><h3>🔒 Protección de datos</h3><p>El QR comparte solo nombre y especie. Los documentos adjuntos se guardan en el dispositivo y no están cifrados. Descarga respaldos antes de borrar datos del navegador.</p></div>';
 document.getElementById('runChecks').onclick=runChecks;
 runChecks();
};
async function runChecks(){
 const result=document.getElementById('checks');if(!result)return;
 const tests=[];
 function check(name,pass,detail){tests.push({name,pass,detail})}
 check('Conexión segura',location.protocol==='https:'||location.hostname==='localhost','Necesaria para instalar la app y usar notificaciones');
 check('Almacenamiento de registros',(()=>{try{const k='huellitas-test';localStorage.setItem(k,'1');const ok=localStorage.getItem(k)==='1';localStorage.removeItem(k);return ok}catch{return false}})(),'Los datos de mascotas se guardan en este navegador');
 check('Documentos locales','indexedDB'in window,'Los archivos PDF e imágenes usan IndexedDB');
 check('Generador QR',typeof QRCode!=='undefined','Necesita que la biblioteca QR se haya cargado');
 check('Notificaciones','Notification'in window,'Los avisos actuales solo funcionan con la página abierta');
 check('Caché sin conexión','serviceWorker'in navigator,'La primera visita requiere conexión');
 if('serviceWorker'in navigator){try{const r=await navigator.serviceWorker.getRegistration('./');check('Servicio sin conexión instalado',!!r,'Si acabas de abrir Huellitas, recarga e inténtalo de nuevo')}catch{check('Servicio sin conexión instalado',false,'No se pudo consultar')}}
 check('Mascotas registradas',Array.isArray(data.mascotas),'Se detectó la estructura principal de datos');
 const list=document.createElement('div');
 for(const t of tests){const p=document.createElement('p');p.textContent=(t.pass?'✅ ':'⚠️ ')+t.name+' — '+t.detail;list.appendChild(p)}
 result.replaceChildren(list);
}
render();
})();