/* Huellitas: dashboard de gastos y filtros locales. */
(function(){
'use strict';
const money=n=>new Intl.NumberFormat('es-CR',{style:'currency',currency:'CRC',maximumFractionDigits:0}).format(n);
const categories=['Veterinario','Alimentación','Medicamentos','Higiene','Accesorios','Otros'];
const previousForm=form;
form=function(s,id){
 previousForm(s,id);
 if(s!=='gastos')return;
 const f=document.getElementById('entry');if(!f)return;
 const input=f.elements.monto;
 const label=document.createElement('label');label.textContent='Categoría';label.htmlFor='expenseCategory';
 const select=document.createElement('select');select.name='categoria';select.id='expenseCategory';
 categories.forEach(cat=>{const o=document.createElement('option');o.value=cat;o.textContent=cat;select.appendChild(o)});
 input.parentNode.insertBefore(select,input.nextSibling);
 input.parentNode.insertBefore(label,select);
};
const prevRender=render;
render=function(){
 prevRender();
 if(section!=='gastos')return;
 const items=(data.gastos||[]).filter(x=>Number.isFinite(Number(x.monto))&&Number(x.monto)>=0);
 const total=items.reduce((s,x)=>s+Number(x.monto),0);
 const byCategory=categories.map(c=>({label:c,total:items.filter(x=>(x.categoria||'Otros')===c).reduce((s,x)=>s+Number(x.monto),0)})).filter(x=>x.total>0);
 const monthly={};
 items.forEach(x=>{if(/^\d{4}-\d{2}/.test(x.fecha||'')){const m=x.fecha.slice(0,7);monthly[m]=(monthly[m]||0)+Number(x.monto)}});
 const lastMonths=Object.keys(monthly).sort().slice(-6);
 const max=Math.max(1,...byCategory.map(x=>x.total),...lastMonths.map(m=>monthly[m]));
 const bars=byCategory.map(x=>'<div class="expense-line"><span>'+x.label+'</span><div class="expense-track"><div style="width:'+Math.round(x.total/max*100)+'%"></div></div><strong>'+money(x.total)+'</strong></div>').join('');
 const months=lastMonths.map(m=>'<div class="expense-line"><span>'+m+'</span><div class="expense-track"><div style="width:'+Math.round(monthly[m]/max*100)+'%"></div></div><strong>'+money(monthly[m])+'</strong></div>').join('');
 const el=document.getElementById('content');
 el.insertAdjacentHTML('afterbegin','<div class="cards"><div class="card"><h3>💰 Total registrado</h3><h2>'+money(total)+'</h2><p class="muted">'+items.length+' gasto(s) en este navegador</p></div><div class="card"><h3>📊 Por categoría</h3>'+(bars||'<p>Aún no hay gastos.</p>')+'</div><div class="card"><h3>📅 Últimos meses con gastos</h3>'+(months||'<p>Aún no hay gastos fechados.</p>')+'</div></div>');
};
render();
})();