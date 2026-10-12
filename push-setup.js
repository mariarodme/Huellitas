/* Optional background push registration. Requires Firebase Functions and a public VAPID key. */
(async()=>{
 const key=window.HUELLITAS_VAPID_PUBLIC_KEY||'';
 if(!key)return;
 const [{getApps,getApp,initializeApp},{getAuth,onAuthStateChanged},{getFunctions,httpsCallable}]=await Promise.all([
  import('https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js'),
  import('https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js'),
  import('https://www.gstatic.com/firebasejs/11.10.0/firebase-functions.js')
 ]);
 const app=getApps()[0]||initializeApp({apiKey:'AIzaSyCt95w0i-LTPqLnd-kUwgj9TGb59TD3ZLo',authDomain:'huellitas-aadf9.firebaseapp.com',projectId:'huellitas-aadf9',appId:'1:374415395001:web:948888a5281f6b3b057368'});const auth=getAuth(app),fn=getFunctions(app,'us-central1');
 const register=httpsCallable(fn,'registerPush'),unregister=httpsCallable(fn,'unregisterPush');
 function toBytes(base64){const s=atob(base64.replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from(s,c=>c.charCodeAt(0))}
 onAuthStateChanged(auth,user=>{
  document.getElementById('push-family-settings')?.remove();
  if(!user)return;
  const host=document.createElement('section');host.id='push-family-settings';host.className='card';
  host.innerHTML='<h3>🔔 Avisos con la aplicación cerrada</h3><p>Activa notificaciones push en este dispositivo. Puedes desactivarlas cuando quieras.</p><p id="push-state" role="status"></p><button id="push-enable">Activar avisos</button> <button id="push-disable" class="secondary">Desactivar</button>';
  document.querySelector('main')?.append(host);
  const status=host.querySelector('#push-state');
  const supported='serviceWorker'in navigator&&'PushManager'in window&&'Notification'in window;
  status.textContent=supported?'Configuración disponible en este dispositivo.':'Este navegador no admite notificaciones push.';
  host.querySelector('#push-enable').onclick=async()=>{
   if(!supported)return;
   try{
    if(await Notification.requestPermission()!=='granted')throw Error('No se concedió el permiso.');
    const reg=await navigator.serviceWorker.ready;
    let sub=await reg.pushManager.getSubscription();
    if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:toBytes(key)});
    const owner=localStorage.getItem('huellitas-family-owner')||user.uid;
    await register({owner,subscription:sub.toJSON()});
    status.textContent='✅ Avisos push activados en este dispositivo.';
   }catch(e){status.textContent='No se pudo activar: '+(e.message||'Error de configuración.')}
  };
  host.querySelector('#push-disable').onclick=async()=>{
   try{const reg=await navigator.serviceWorker.ready,sub=await reg.pushManager.getSubscription();if(sub){const owner=localStorage.getItem('huellitas-family-owner')||user.uid;await unregister({owner,endpoint:sub.endpoint});await sub.unsubscribe()}status.textContent='Avisos desactivados en este dispositivo.'}catch(e){status.textContent='No se pudo desactivar: '+e.message}
  };
 });
})();
