/* Keep forms within the visible viewport, including the software keyboard. */
(function(){'use strict';
let scheduled=false;
function layout(){scheduled=false;const viewport=window.visualViewport;document.documentElement.style.setProperty('--hu-view-height',(viewport?viewport.height:window.innerHeight)+'px');document.documentElement.style.setProperty('--hu-view-top',(viewport?viewport.offsetTop:0)+'px');const dock=document.getElementById('huellitas-app-dock');document.documentElement.style.setProperty('--hu-dock-height',(dock?dock.getBoundingClientRect().height:68)+'px');const active=document.activeElement;if(active?.closest('.form-fields'))active.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});}
function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(layout)}}
window.addEventListener('resize',schedule);window.visualViewport?.addEventListener('resize',schedule);window.visualViewport?.addEventListener('scroll',schedule);
function setup(){const dock=document.getElementById('huellitas-app-dock');if(dock&&'ResizeObserver'in window)new ResizeObserver(schedule).observe(dock);layout()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();
