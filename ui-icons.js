/* Presentation only: consistent outline icons; no record or storage access. */
(function(){'use strict';
const paths={
 paw:'<ellipse cx="12" cy="16" rx="5" ry="4"/><circle cx="5" cy="10" r="2"/><circle cx="10" cy="5" r="2"/><circle cx="16" cy="6" r="2"/><circle cx="20" cy="11" r="2"/>',
 home:'<path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-7h6v7"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 11h18m-13 5h2m4 0h2"/>',
 health:'<path d="M12 20S3 15 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 7-9 12-9 12Z"/><path d="M8 11h8m-4-4v8"/>',
 medicine:'<path d="m9 5-4 4a6 6 0 0 0 8 8l4-4a6 6 0 0 0-8-8Zm-2 2 10 10"/>',
 vaccine:'<path d="m14 3 7 7m-3-4-3 3m-4-3 7 7m-7-5-7 7 5 5 7-7M4 20l-2 2m5-10 5 5"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
 file:'<path d="M14 3H5v18h14V8Zm0 0v5h5M8 12h8m-8 4h8"/>',
 search:'<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
 bell:'<path d="M5 17h14l-2-3V9a5 5 0 0 0-10 0v5Zm5 3h4"/>',
 edit:'<path d="m15 4 5 5M4 20l5-1L21 7l-5-5L4 14Z"/>',
 chart:'<path d="M4 3v17h17M8 16v-4m5 4V8m5 8V5"/>',
 wallet:'<rect x="3" y="5" width="18" height="15" rx="3"/><path d="M3 9h18m-5 5h2"/>',
 users:'<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3m1-17a3 3 0 0 1 0 6m3 11v-3a6 6 0 0 0-2-4"/>',
 settings:'<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3"/><circle cx="15" cy="17" r="3"/>',
 check:'<circle cx="12" cy="12" r="9"/><path d="m7 12 3 3 7-7"/>',
 trash:'<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M9 10v7m6-7v7"/>',
 image:'<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="2"/><path d="m3 17 6-5 4 4 4-7 4 7"/>',
 cloud:'<path d="M6 18a5 5 0 0 1-1-10 7 7 0 0 1 13-1 5.5 5.5 0 0 1 0 11Z"/>',
 bowl:'<path d="M3 12h18a9 9 0 0 1-18 0Zm5-8v4m4-5v5m4-4v4"/>',
 phone:'<path d="m4 3 4 1 1 5-3 2a17 17 0 0 0 7 7l2-3 5 1 1 4C11 25-2 12 4 3Z"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
 shield:'<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z"/><path d="m8 12 3 3 5-6"/>'
};
const symbols={'🐾':'paw','🏡':'home','⌂':'home','📅':'calendar','🗓':'calendar','▦':'calendar','🩺':'health','♡':'health','🚑':'health','💊':'medicine','💉':'vaccine','🪱':'shield','🕘':'clock','📋':'file','📁':'file','📄':'file','📎':'file','🪪':'file','🔎':'search','⌕':'search','🔔':'bell','♧':'bell','✎':'edit','📈':'chart','⚖':'chart','💰':'wallet','👪':'users','👥':'users','⚙':'settings','✅':'check','🗑':'trash','📷':'image','📸':'image','🖼':'image','☁':'cloud','🥣':'bowl','☎':'phone','＋':'plus','☰':'menu','☷':'menu','🛡':'shield'};
function icon(kind){const t=document.createElement('template');t.innerHTML='<svg class="hu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'+paths[kind]+'</svg>';return t.content.firstElementChild;}
const selectors='button,summary,#heading,.home-activity-head h2,.home-tasks h2,.home-quick h2,.health-summary h3,.medicine-panel h3,.emergency-card h3,.weight-toolbar h3,.deworm-history h4,.home-insights summary,.home-birthdays summary,.hs-nav-icon,.hs-mobile-tile-icon,.hs-mobile-link-icon,.home-quick-action-icon,.pet-profile-fact-icon,.pet-profile-kicker';
function polish(){
 observer.disconnect();
 document.querySelectorAll(selectors).forEach(el=>{
  if(el.closest('.auth-pending #huellitas-cloud'))return;
  // Only leading decoration in UI labels is replaced; descendants and listeners remain intact.
  for(const node of [...el.childNodes]){if(node.nodeType!==3)continue;const raw=node.nodeValue.trimStart();const symbol=Object.keys(symbols).find(s=>raw.startsWith(s));if(!symbol)continue;
   const rest=raw.slice(symbol.length).replace(/^\uFE0F/,'');node.before(icon(symbols[symbol]));node.nodeValue=rest;el.classList.add('hu-icon-label');break;
  }
 });
 observer.observe(document.body,{childList:true,subtree:true});
}
let scheduled=false;const observer=new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;polish()})});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',polish);else polish();
})();
