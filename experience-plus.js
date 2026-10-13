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
const updateTime=()=>{const el=document.getElementById('huellitas-cloud-time');if(!el)return;let v;try{v=localStorage.getItem('huellitas-last-cloud-confirmed')}catch{}el.textContent=v?'Última confirmación: '+fmt(v):'Esperando confirmación de Firebase'};updateTime();setInterval(updateTime,12000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();