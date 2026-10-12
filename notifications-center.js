/* Notification center: permission, test, diagnostics, and push readiness.
   Real scheduled push delivery requires a server and VAPID subscription. */
(function(){
'use strict';
const prevRender=render;
render=function(){
 prevRender();
 if(section!=='configuracion'&&section!=='recordatorios')return;
 const host=document.getElementById('content');
 const panel=document.createElement('section');panel.className='card';panel.innerHTML='<h3>🔔 Centro de notificaciones</h3><p>Activa y prueba los avisos en este dispositivo. Los recordatorios por hora funcionan mientras Huellitas está abierta. Para recibirlos con la aplicación cerrada se necesitará un servicio de envío seguro, aún no configurado.</p><p id="notificationState" role="status"></p><div class="actions" style="flex-wrap:wrap;justify-content:flex-start"><button id="notificationEnable">Activar permisos</button><button id="notificationTest" class="secondary">Enviar aviso de prueba</button></div><p class="muted">En iPhone, las notificaciones web requieren una versión compatible de iOS y normalmente añadir la web a la pantalla de inicio. El permiso siempre depende del navegador.</p>';
 host.prepend(panel);
 const state=panel.querySelector('#notificationState');
 async function status(){
  const supported='Notification'in window,worker='serviceWorker'in navigator;
  let reg=null;if(worker){try{reg=await navigator.serviceWorker.getRegistration('./')}catch{}}
  state.textContent=!supported?'⚠️ Este navegador no admite la API de notificaciones.':'Permiso: '+(Notification.permission==='granted'?'concedido':Notification.permission==='denied'?'bloqueado':'pendiente')+' · Service Worker: '+(reg?'activo':'no disponible')+' · Push remoto: pendiente de servidor';
 }
 panel.querySelector('#notificationEnable').onclick=async()=>{
  if(!('Notification'in window)){alert('Tu navegador no admite notificaciones.');return}
  try{await Notification.requestPermission()}catch{alert('No fue posible solicitar permiso.')}
  status();
 };
 panel.querySelector('#notificationTest').onclick=async()=>{
  if(!('Notification'in window)||Notification.permission!=='granted'){alert('Primero concede permiso para recibir avisos.');return}
  try{
   const reg='serviceWorker'in navigator?await navigator.serviceWorker.ready:null;
   if(reg&&reg.showNotification)await reg.showNotification('🐾 Huellitas: aviso de prueba',{body:'Las notificaciones están habilitadas en este dispositivo.',icon:'./icon.svg',tag:'huellitas-test'});
   else new Notification('🐾 Huellitas: aviso de prueba',{body:'Las notificaciones están habilitadas en este dispositivo.'});
  }catch(e){alert('No se pudo mostrar el aviso. Comprueba los ajustes del navegador.')}
 };
 status();
};
render();
})();