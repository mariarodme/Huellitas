/* Huellitas navigation shell only — does not touch records or Firebase. */
(function(){
'use strict';
const groups=[
 {label:'Salud',items:[['salud','Historial médico'],['vacunas','Vacunas'],['medicamentos','Medicamentos'],['desparasitacion','Desparasitación'],['dosis','Dosis'],['peso','Peso']]},
 {label:'Organización',items:[['calendario','Calendario'],['recordatorios','Recordatorios'],['gastos','Gastos'],['alimentacion','Alimentación']]},
 {label:'Mis archivos',items:[['documentos','Documentos'],['identificacion','Carné digital'],['galeria','Galería']]},
 {label:'Más',items:[['contactos','Contactos'],['familia','Familia'],['diagnostico','Diagnóstico']]}
];
const all=[['inicio','Inicio'],['mascotas','Mascotas'],['agenda','Agenda'],...groups.flatMap(g=>g.items)];
const icons={inicio:'⌂',mascotas:'🐾',agenda:'▦',salud:'♡',buscar:'⌕',recordatorios:'♧',configuracion:'⚙'};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;',"'":'&#39;'}[c]));
const link=(id,label,page)=>'<button type="button" data-page="'+id+'" class="hs-link'+(page===id?' is-active':'')+'" '+(page===id?'aria-current="page"':'')+'>'+esc(label)+'</button>';
const group=(g,page)=>'<details class="hs-dropdown" '+(g.items.some(([id])=>id===page)?'data-has-active="true"':'')+'><summary>'+esc(g.label)+' <span aria-hidden="true">⌄</span></summary><div class="hs-dropdown-panel">'+g.items.map(([id,label])=>link(id,label,page)).join('')+(g.label==='Más'?'<button type="button" class="hs-link" data-action="hsBackup">↓ Descargar respaldo</button>':'')+'</div></details>';
document.addEventListener('click',async e=>{const b=e.target.closest('[data-action="hsShareApp"]');if(!b)return;e.preventDefault();const url='https://mariarodme.github.io/Huellitas/';try{if(navigator.share){await navigator.share({title:'Huellitas',text:'Abrí Huellitas para organizar el cuidado de tus mascotas',url});return}if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(url);b.textContent='✓ Enlace copiado';return}}catch(err){if(err&&err.name==='AbortError')return}window.prompt('Copiá este enlace para compartir Huellitas:',url)});
window.huellitasRenderNav=function(page){
 const desktop=document.getElementById('hs-desktop-links'),drawer=document.getElementById('hs-drawer-links');
 if(desktop)desktop.innerHTML=[['inicio','⌂','Inicio'],['mascotas','🐾','Mascotas'],['agenda','▦','Agenda'],['calendario','▦','Calendario'],['salud','♡','Salud']].map(([id,ico,label])=>'<button type="button" data-page="'+id+'" class="hs-link hs-main-link'+(page===id?' is-active':'')+'" '+(page===id?'aria-current="page"':'')+'><span class="hs-nav-icon" aria-hidden="true">'+ico+'</span>'+label+'</button>').join('')+'<details class="hs-dropdown hs-all-dropdown" id="hs-all-dropdown"><summary aria-label="Abrir todas las herramientas"><span class="hs-nav-icon" aria-hidden="true">▦</span> Herramientas <span class="hs-chevron" aria-hidden="true">⌄</span></summary><div class="hs-mega"><div class="hs-mega-head"><strong>Todas tus herramientas</strong><span>Accesos organizados para encontrar todo más rápido</span></div><div class="hs-mega-grid">'+groups.map(g=>'<div class="hs-mega-group"><h3>'+esc(g.label)+'</h3>'+g.items.map(([id,label])=>link(id,label,page)).join('')+(g.label==='Más'?'<button type="button" class="hs-link" data-action="hsBackup">↓ Descargar respaldo</button>':'')+'</div>').join('')+'</div></div></details>'+'<button type="button" data-page="configuracion" class="hs-link hs-settings-link'+(page==='configuracion'?' is-active':'')+'" '+(page==='configuracion'?'aria-current="page"':'')+'><span class="hs-nav-icon" aria-hidden="true">⚙</span> Configuración</button>';
 if(drawer){
  const primary=[['inicio','⌂','Inicio'],['mascotas','🐾','Mascotas'],['agenda','▦','Agenda'],['calendario','▦','Calendario'],['salud','♡','Salud'],['configuracion','⚙','Configuración']];
  const tiles=primary.map(([id,ico,label])=>'<button type="button" data-page="'+id+'" class="hs-mobile-tile'+(page===id?' is-active':'')+'"><span class="hs-mobile-tile-icon" aria-hidden="true">'+ico+'</span><span>'+label+'</span></button>').join('');
  const moreIcons={vacunas:'💉',medicamentos:'💊',desparasitacion:'🪱',dosis:'💧',peso:'⚖',recordatorios:'🔔',gastos:'₡',alimentacion:'🥣',documentos:'📄',identificacion:'🪪',galeria:'🖼',contactos:'☎',familia:'👥',diagnostico:'🩺'};
  const sections=groups.map(g=>'<section class="hs-mobile-section"><h3>'+esc(g.label)+'</h3><div class="hs-mobile-section-links">'+g.items.filter(([id])=>id!=='salud'&&id!=='calendario').map(([id,label])=>'<button type="button" data-page="'+id+'" class="hs-mobile-tile'+(page===id?' is-active':'')+'"><span class="hs-mobile-tile-icon" aria-hidden="true">'+(moreIcons[id]||'🐾')+'</span><span>'+esc(label)+'</span></button>').join('')+'</div></section>').join('');
  drawer.innerHTML='<div class="hs-mobile-primary"><h3>Accesos rápidos</h3><div class="hs-mobile-tiles">'+tiles+'</div></div><div class="hs-mobile-sections">'+sections+'</div><div class="hs-mobile-footer"><button type="button" class="hs-mobile-share" data-action="hsShareApp">↗ Compartir Huellitas</button><button type="button" class="hs-mobile-search" data-page="buscar">⌕ Buscar en Huellitas</button><button type="button" class="hs-mobile-backup" data-action="hsBackup">↓ Descargar respaldo</button><p>Compartir el enlace permite abrir la aplicación, pero no da acceso a tus registros privados.</p></div>';
 }
 const current=document.getElementById('hs-current');
 if(current){const entry=all.find(x=>x[0]===page);current.textContent=entry?entry[1]:'Huellitas'}
 const bottom=document.getElementById('bottom');
 if(bottom){const currentKey=['inicio','mascotas','agenda','salud'].includes(page)?page:'more';bottom.innerHTML=[['inicio','⌂','Inicio'],['mascotas','🐾','Mascotas'],['agenda','▦','Agenda'],['salud','♡','Salud'],['more','☰','Más']].map(([id,ico,label])=>'<button type="button" '+(id==='more'?'data-action="hsOpenDrawer"':'data-page="'+id+'"')+' class="'+(currentKey===id?'active':'')+'" '+(currentKey===id?'aria-current="page"':'')+' aria-label="'+label+'"><span class="bottom-icon" aria-hidden="true">'+ico+'</span><span class="bottom-label">'+label+'</span></button>').join('')}
};
function drawer(open){const d=document.getElementById('hs-drawer');if(!d)return;d.hidden=!open;document.body.classList.toggle('hs-drawer-open',open);document.getElementById('hs-menu-toggle')?.setAttribute('aria-expanded',String(open));if(open)d.querySelector('[data-page]')?.focus();else document.getElementById('hs-menu-toggle')?.focus()}
document.addEventListener('click',e=>{
 const backup=e.target.closest('[data-action="hsBackup"]');if(backup){e.preventDefault();if(typeof window.backup==='function')window.backup();drawer(false);return}
 const toggle=e.target.closest('[data-action="hsOpenDrawer"]');
 if(toggle){e.preventDefault();drawer(true);return}
 if(e.target.closest('[data-action="hsCloseDrawer"]')||e.target.id==='hs-drawer'){e.preventDefault();drawer(false);return}
 if(e.target.closest('#hs-drawer [data-page]')){drawer(false);return}
 if(e.target.closest('.hs-dropdown-panel [data-page]')){e.target.closest('details')?.removeAttribute('open');return}
 if(!e.target.closest('.hs-dropdown'))document.querySelectorAll('.hs-dropdown[open]').forEach(x=>x.open=false);
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!document.getElementById('hs-drawer')?.hidden){drawer(false);return}document.querySelectorAll('.hs-dropdown[open]').forEach(x=>x.open=false)}});
document.addEventListener('click',e=>{const d=e.target.closest('.hs-dropdown summary');if(d)document.querySelectorAll('.hs-dropdown[open]').forEach(x=>{if(x!==d.parentElement)x.open=false})});
})();
