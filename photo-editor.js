/* Local preview; only the existing form's Save action persists a photo. */
(function(){'use strict';
function cropRect(width,height,zoom,x,y){const side=Math.min(width,height)/zoom;return {sx:(width-side)*x/100,sy:(height-side)*y/100,side};}
window.HuellitasPhotoEditor={cropRect,mount(form,existing){
 const input=form.elements.fotoArchivo;if(!input)return null;
 const panel=document.createElement('section');panel.className='photo-editor';panel.hidden=true;
 panel.innerHTML='<h3>Encuadre de la foto</h3><canvas width="300" height="300" role="img" aria-label="Vista previa del encuadre"></canvas><p>Acercá la imagen y ajustá su posición. Se aplica al guardar el perfil.</p><label for="photo-zoom">Acercamiento</label><input id="photo-zoom" type="range" min="1" max="3" step="0.05" value="1"><label for="photo-x">Posición horizontal</label><input id="photo-x" type="range" min="0" max="100" value="50"><label for="photo-y">Posición vertical</label><input id="photo-y" type="range" min="0" max="100" value="50"><button type="button" class="secondary photo-reset">Centrar foto</button><p class="photo-status" role="status" aria-live="polite"></p>';
 input.after(panel);const canvas=panel.querySelector('canvas'),ctx=canvas.getContext('2d'),zoom=panel.querySelector('#photo-zoom'),x=panel.querySelector('#photo-x'),y=panel.querySelector('#photo-y'),status=panel.querySelector('.photo-status');
 let img=null,dirty=false,isNew=false,error=null,serial=0,pending=Promise.resolve();
 function draw(){if(!img)return;const r=cropRect(img.naturalWidth,img.naturalHeight,Number(zoom.value),Number(x.value),Number(y.value));ctx.fillStyle='#fff';ctx.fillRect(0,0,300,300);ctx.drawImage(img,r.sx,r.sy,r.side,r.side,0,0,300,300);}
 function load(src,newPhoto){const ticket=++serial;panel.hidden=false;status.textContent='Cargando vista previa…';error=null;pending=(async()=>{try{const next=new Image();next.src=src;await next.decode();if(ticket!==serial)return;img=next;isNew=newPhoto;dirty=newPhoto;zoom.value='1';x.value=y.value='50';draw();status.textContent='Vista previa lista.';}catch(e){if(ticket!==serial)return;error=new Error('No se pudo abrir esta imagen. Elegí otra foto.');status.textContent=error.message;}finally{if(src.startsWith('blob:'))URL.revokeObjectURL(src)}})();}
 input.addEventListener('change',()=>{const file=input.files[0];if(!file){dirty=false;error=null;if(existing)load(existing,false);else{++serial;img=null;panel.hidden=true}return}if(!file.type.startsWith('image/')||file.size>8000000){++serial;error=new Error('Elegí una imagen de hasta 8 MB.');dirty=true;panel.hidden=false;status.textContent=error.message;return}dirty=true;load(URL.createObjectURL(file),true)});
 [zoom,x,y].forEach(control=>control.addEventListener('input',()=>{dirty=true;draw()}));
 panel.querySelector('.photo-reset').onclick=()=>{zoom.value='1';x.value=y.value='50';dirty=isNew;draw();status.textContent='Foto centrada.'};
 if(existing)load(existing,false);
 return {async getPhoto(){let wait;do{wait=pending;await wait}while(wait!==pending);if(!dirty)return undefined;if(error)throw error;if(!img)throw Error('Esperá a que cargue la foto.');draw();return canvas.toDataURL('image/jpeg',0.7)}};
}};
})();
