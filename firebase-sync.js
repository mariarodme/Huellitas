/* Huellitas Firebase: sincronización manual segura por usuario. */
(async()=>{
 const cfg={apiKey:"AIzaSyCt95w0i-LTPqLnd-kUwgj9TGb59TD3ZLo",authDomain:"huellitas-aadf9.firebaseapp.com",projectId:"huellitas-aadf9",storageBucket:"huellitas-aadf9.firebasestorage.app",messagingSenderId:"374415395001",appId:"1:374415395001:web:948888a5281f6b3b057368"};
 const host=document.createElement('section');host.id='huellitas-cloud';host.style.cssText='max-width:950px;margin:24px auto;padding:20px;border-radius:20px;background:#fff;border:1px solid #e7ded4;box-shadow:0 3px 14px #0000000a';host.innerHTML='<h2>☁️ Sincronización Firebase</h2><p id="cloud-status">Preparando conexión…</p><div id="cloud-controls"></div>';document.querySelector('main')?.append(host);
 const status=document.getElementById('cloud-status'),ui=document.getElementById('cloud-controls');
 const say=t=>{status.textContent=t};
 try{
 const [{initializeApp},{getAuth,onAuthStateChanged,createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut,GoogleAuthProvider,signInWithPopup},{getFirestore,doc,getDoc,setDoc}]=await Promise.all([
 import('https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js'),
 import('https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js'),
 import('https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js')]);
 const app=initializeApp(cfg),auth=getAuth(app),db=getFirestore(app);
 const key='huellitas-v1';
 const error=e=>{console.error(e);say('Error: '+(e.code||e.message||'No se pudo completar.'))};
 const authForm=()=>{ui.innerHTML='<p>Inicia sesión con la misma cuenta en todos tus dispositivos.</p><div style="display:flex;flex-wrap:wrap;gap:8px"><input id="cloud-email" type="email" autocomplete="email" placeholder="Correo electrónico" style="padding:12px;min-width:180px;flex:1"><input id="cloud-pass" type="password" autocomplete="current-password" placeholder="Contraseña" style="padding:12px;min-width:180px;flex:1"></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button id="cloud-login">Entrar</button><button id="cloud-signup">Crear cuenta</button><button id="cloud-google">Entrar con Google</button></div><p style="font-size:13px">Tu contraseña no se guarda en Huellitas; se procesa mediante Firebase Authentication.</p>';
 const credentials=()=>[document.getElementById('cloud-email').value.trim(),document.getElementById('cloud-pass').value];
 document.getElementById('cloud-login').onclick=async()=>{try{const [email,pw]=credentials();await signInWithEmailAndPassword(auth,email,pw)}catch(e){error(e)}};
 document.getElementById('cloud-signup').onclick=async()=>{try{const [email,pw]=credentials();await createUserWithEmailAndPassword(auth,email,pw)}catch(e){error(e)}};
 document.getElementById('cloud-google').onclick=async()=>{try{await signInWithPopup(auth,new GoogleAuthProvider())}catch(e){error(e)}};
 };
 onAuthStateChanged(auth,user=>{
 if(!user){say('Sin sesión. Tus datos locales siguen disponibles.');authForm();return}
 say('Conectado como '+(user.email||'usuario')+'. La sincronización es manual para evitar pérdida de información.');
 ui.innerHTML='<p><strong>1.</strong> En el dispositivo con los expedientes originales, pulsa «Subir respaldo a Firebase». <strong>2.</strong> En el otro dispositivo, inicia sesión con esta misma cuenta y pulsa «Descargar datos de Firebase».</p><div style="display:flex;gap:8px;flex-wrap:wrap"><button id="cloud-upload">⬆ Subir respaldo a Firebase</button><button id="cloud-download">⬇ Descargar datos de Firebase</button><button id="cloud-logout" class="secondary">Cerrar sesión</button></div><p style="font-size:13px">Los documentos adjuntos guardados en este dispositivo no se sincronizan todavía. Descarga también un respaldo JSON desde Huellitas.</p>';
 const ref=doc(db,'users',user.uid,'data','huellitas');
 document.getElementById('cloud-upload').onclick=async()=>{
 try{const raw=localStorage.getItem(key);if(!raw)throw Error('No hay datos locales para subir.');const data=JSON.parse(raw);if(!Array.isArray(data.mascotas))throw Error('No hay expedientes válidos en este dispositivo.');const existing=await getDoc(ref);if(existing.exists()&&!confirm('Ya hay un respaldo en Firebase. ¿Quieres REEMPLAZARLO con los datos de ESTE dispositivo?'))return;if(!confirm('Vas a subir '+data.mascotas.length+' mascota(s) desde este dispositivo. ¿Continuar?'))return;await setDoc(ref,{payload:raw,updatedAt:new Date().toISOString()});say('Respaldo subido correctamente: '+data.mascotas.length+' mascota(s). Ya puedes recuperarlo en otro dispositivo.')}catch(e){error(e)}
 };
 document.getElementById('cloud-download').onclick=async()=>{
 try{const snap=await getDoc(ref);if(!snap.exists()){say('Aún no hay un respaldo en Firebase. Súbelo primero desde el dispositivo que tiene los datos.');return}const raw=snap.data().payload;const data=JSON.parse(raw);if(!Array.isArray(data.mascotas))throw Error('Respaldo inválido');const current=localStorage.getItem(key);if(current&&!confirm('Esta acción reemplazará los registros locales de ESTE dispositivo con '+data.mascotas.length+' mascota(s) del respaldo. ¿Continuar?'))return;
 if(current){const blob=new Blob([current],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='huellitas-respaldo-antes-de-sincronizar.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),5000)}
 localStorage.setItem(key,raw);alert('Datos descargados. Huellitas se actualizará ahora.');location.reload()}catch(e){error(e)}
 };
 document.getElementById('cloud-logout').onclick=()=>signOut(auth).catch(error);
 },error);
 }catch(e){console.error(e);say('No se pudo cargar Firebase. Revisa tu conexión a internet.')}
})();