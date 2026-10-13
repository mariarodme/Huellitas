/* Huellitas mobile navigation and cloud status. No changes to records. */
(function(){'use strict';
const fmt=v=>{const d=new Date(v);return Number.isNaN(d.getTime())?'Sin registrar':d.toLocaleString('es-CR',{dateStyle:'medium',timeStyle:'short'})};
function setup(){
if(document.getElementById('huellitas-app-dock'))return;
const dock=document.createElement('nav');dock.id='huellitas-app-dock';dock.setAttribute('aria-label','Navegación rápida');
dock.innerHTML='<button type="button" data-page="inicio">⌂<span>Inicio</span></button><button type="button" data-page="mascotas">🐾<span>Mascotas</span></button><button type="button" data-page="calendario">▦<span>Calendario</span></button><button type="button" data-page="configuracion">⚙<span>Más</span></button>';
document.body.appendChild(dock);
const sync=document.createElement('div');sync.id='huellitas-sync-bar';sync.innerHTML='<span id="huellitas-cloud-indicator" data-state="pending" role="status" aria-live="polite">↻ Comprobando guardado</span><span id="huellitas-cloud-time"></span>';
document.querySelector('main')?.prepend(sync);
dock.addEventListener('click',e=>{const b=e.target.closest('[data-page]');if(!b)return;const dest=document.querySelector('#nav [data-page="'+b.dataset.page+'"],#hs-drawer-links [data-page="'+b.dataset.page+'"]');if(dest)dest.click()});
const refresh=()=>{const p=document.body.dataset.currentPage||'inicio';dock.querySelectorAll('button').forEach(b=>{const on=b.dataset.page===p;b.classList.toggle('active',on);if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')})};
new MutationObserver(refresh).observe(document.body,{attributes:true,attributeFilter:['data-current-page']});refresh();
const mountRecovery=()=>{
 if(document.body.dataset.currentPage!=='configuracion')return;
 const content=document.getElementById('content');
 if(!content||content.querySelector('#huellitas-recovery-panel'))return;
 const panel=document.createElement('section');panel.id='huellitas-recovery-panel';panel.className='card huellitas-recovery-panel';
 panel.innerHTML='<h3>🛡️ Copias de recuperación</h3><p>Huellitas conserva copias de seguridad locales antes de combinar información entre dispositivos. Podés descargarlas sin modificar tus registros actuales.</p><div id="huellitas-recovery-list"></div>';
 content.append(panel);
 const list=panel.querySelector('#huellitas-recovery-list');let user='';try{user=localStorage.getItem('huellitas-account-uid')||''}catch{}
 const items=[];
 try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(!k||!k.startsWith('huellitas-recovery-'+user+'-')||k.endsWith('-last'))continue;try{const value=JSON.parse(localStorage.getItem(k));if(value&&value.payload&&Array.isArray(JSON.parse(value.payload).mascotas))items.push({key:k,...value})}catch{}}}catch{}
 items.sort((a,b)=>String(b.at).localeCompare(String(a.at)));
 if(!items.length){list.textContent='Todavía no hay copias de recuperación disponibles en este dispositivo.';return}
 items.slice(0,8).forEach((item,i)=>{const row=document.createElement('div');row.className='recovery-item';const label=document.createElement('span');label.textContent=new Date(item.at).toLocaleString('es-CR')+' · '+item.reason;const btn=document.createElement('button');btn.type='button';btn.className='secondary';btn.textContent='Descargar copia';btn.onclick=()=>{const blob=new Blob([item.payload],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='huellitas-recuperacion-'+item.at.slice(0,10)+'-'+i+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),3000)};row.append(label,btn);list.append(row)});
};
const recoveryNode=document.getElementById('content');if(recoveryNode){new MutationObserver(mountRecovery).observe(recoveryNode,{childList:true});mountRecovery()}
const mountNotifications=()=>{
 const page=document.body.dataset.currentPage;
 if(page!=='recordatorios'&&page!=='configuracion')return;
 const content=document.getElementById('content');
 if(!content||content.querySelector('#huellitas-notification-panel'))return;
 const panel=document.createElement('section');panel.id='huellitas-notification-panel';panel.className='card huellitas-notification-panel';
 panel.innerHTML='<h3>🔔 Centro de avisos</h3><p>Consultá tus próximos cuidados y activá los avisos del navegador mientras usás Huellitas.</p><p id="huellitas-notification-permission" role="status"></p><div class="actions"><button type="button" id="huellitas-notification-enable">Activar avisos</button><button type="button" id="huellitas-notification-test" class="secondary">Probar aviso</button></div><p class="muted">Los avisos automáticos programados funcionan mientras la aplicación está abierta. En iPhone, los permisos dependen de la versión de iOS y de instalar la web en Inicio.</p>';
 content.prepend(panel);
 const status=panel.querySelector('#huellitas-notification-permission');
 const update=()=>{status.textContent=!('Notification'in window)?'Este navegador no admite notificaciones.':'Permiso del navegador: '+(Notification.permission==='granted'?'activado':Notification.permission==='denied'?'bloqueado':'sin activar')};
 panel.querySelector('#huellitas-notification-enable').onclick=async()=>{if(!('Notification'in window))return alert('Tu navegador no admite avisos.');try{await Notification.requestPermission()}catch(e){alert('No se pudo solicitar el permiso.')}update()};
 panel.querySelector('#huellitas-notification-test').onclick=async()=>{if(!('Notification'in window)||Notification.permission!=='granted')return alert('Primero activá los avisos.');try{const reg='serviceWorker'in navigator?await navigator.serviceWorker.ready:null;if(reg&&reg.showNotification)await reg.showNotification('🐾 Huellitas',{body:'Tus avisos están activados.',icon:'./icon.svg'});else new Notification('🐾 Huellitas',{body:'Tus avisos están activados.'})}catch(e){alert('No se pudo mostrar el aviso: '+e.message)}};
 update();
};
const contentNode=document.getElementById('content');
if(contentNode){new MutationObserver(mountNotifications).observe(contentNode,{childList:true});mountNotifications()}
const updateTime=()=>{const el=document.getElementById('huellitas-cloud-time');if(!el)return;let v;try{v=localStorage.getItem('huellitas-last-cloud-confirmed')}catch{}el.textContent=v?'Última confirmación: '+fmt(v):'Esperando confirmación de Firebase'};updateTime();setInterval(updateTime,12000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();