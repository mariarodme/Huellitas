/* QR opcional: solo datos elegidos, generado localmente en el dispositivo. */
(function(){
'use strict';
const previous=render;
render=function(){
 previous();
 if(section!=='identificacion')return;
 const container=document.getElementById('content');
 const info=document.createElement('div');info.className='card';info.innerHTML='<h3>🔐 QR de identificación</h3><p>Por seguridad, el QR contiene únicamente el nombre y la especie de la mascota. No incluye teléfono, microchip, ubicación, historial médico ni enlaces a datos privados. No permite localizar al dueño automáticamente.</p><label for="qrPet">Mascota</label><select id="qrPet"></select><button id="makeQr">Generar QR seguro</button><div id="qrOutput" style="margin-top:18px"></div>';
 container.prepend(info);
 const select=info.querySelector('#qrPet');
 for(const pet of data.mascotas){const option=document.createElement('option');option.value=pet.id;option.textContent=pet.nombre;select.append(option)}
 info.querySelector('#makeQr').onclick=()=>{
  const pet=data.mascotas.find(x=>x.id===select.value);if(!pet)return;
  const output=info.querySelector('#qrOutput');output.replaceChildren();
  if(typeof QRCode==='undefined'){output.textContent='No se pudo cargar el generador QR. Conéctate a internet y vuelve a intentarlo.';return}
  const title=document.createElement('p');title.textContent='QR de '+pet.nombre+' (solo nombre y especie)';output.append(title);
  const target=document.createElement('div');target.style.cssText='display:inline-block;background:white;padding:12px;border-radius:12px';output.append(target);
  new QRCode(target,{text:'Huellitas | Mascota: '+pet.nombre+' | Especie: '+(pet.especie||'No indicada'),width:192,height:192,correctLevel:QRCode.CorrectLevel.M});
 };
};
render();
})();