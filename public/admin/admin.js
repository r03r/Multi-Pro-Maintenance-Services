const STORE_KEY='multipro-admin-v1';
const labels={dashboard:'Resumen',customers:'Clientes',estimates:'Presupuestos',invoices:'Facturas'};
const actions={dashboard:'+ Nuevo cliente',customers:'+ Nuevo cliente',estimates:'+ Nuevo presupuesto',invoices:'+ Nueva factura'};
let state=JSON.parse(localStorage.getItem(STORE_KEY)||'{"customers":[],"estimates":[],"invoices":[]}');
const $=id=>document.getElementById(id);
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(n)||0);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=(prefix,list)=>`${prefix}-${new Date().getFullYear()}-${String(list.length+1).padStart(4,'0')}`;
function save(){localStorage.setItem(STORE_KEY,JSON.stringify(state));render()}
function setView(name){document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===`${name}-view`));document.querySelectorAll('.nav-item').forEach(v=>v.classList.toggle('active',v.dataset.view===name));$('view-title').textContent=labels[name];$('primary-action').textContent=actions[name];$('primary-action').dataset.view=name}
document.querySelectorAll('.nav-item').forEach(b=>b.onclick=()=>setView(b.dataset.view));
$('primary-action').onclick=()=>openForm($('primary-action').dataset.view||'customers');
function openForm(view){const type=view==='customers'?'customer':view==='estimates'?'estimate':'invoice';$('record-type').value=type;$('dialog-title').textContent=type==='customer'?'Nuevo cliente':type==='estimate'?'Nuevo presupuesto':'Nueva factura';$('customer-fields').classList.toggle('hidden',type!=='customer');$('document-fields').classList.toggle('hidden',type==='customer');if(type!=='customer'){$('document-customer').innerHTML=state.customers.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('');if(!state.customers.length){alert('Primero agrega un cliente.');setView('customers');return}}$('record-form').reset();$('record-type').value=type;$('document-quantity').value=1;$('record-dialog').showModal()}
$('record-form').addEventListener('submit',e=>{if(e.submitter?.value==='cancel')return; e.preventDefault();const type=$('record-type').value;if(type==='customer'){const name=$('customer-name').value.trim();if(!name)return alert('Escribe el nombre del cliente.');state.customers.unshift({id:crypto.randomUUID(),name,company:$('customer-company').value.trim(),phone:$('customer-phone').value.trim(),email:$('customer-email').value.trim(),address:$('customer-address').value.trim(),createdAt:Date.now()})}else{const list=type==='estimate'?state.estimates:state.invoices;const q=Number($('document-quantity').value)||1,p=Number($('document-price').value)||0,t=Number($('document-tax').value)||0,subtotal=q*p;list.unshift({id:crypto.randomUUID(),number:number(type==='estimate'?'EST':'INV',list),customerId:$('document-customer').value,description:$('document-description').value.trim(),quantity:q,price:p,tax:t,total:subtotal+(subtotal*t/100),status:$('document-status').value,notes:$('document-notes').value.trim(),createdAt:Date.now()})}save();$('record-dialog').close()});
function customerName(id){return state.customers.find(c=>c.id===id)?.name||'Cliente eliminado'}
function docRows(items,type){if(!items.length)return '<div class="empty">Todavía no hay registros.</div>';return items.map(d=>`<div class="data-row"><div><strong>${esc(d.number)}</strong><div class="muted">${esc(customerName(d.customerId))}</div></div><span>${money(d.total)}</span><span class="badge ${esc(d.status)}">${esc(d.status)}</span><div class="row-actions"><button onclick="printDoc('${type}','${d.id}')">Imprimir</button>${type==='estimate'?`<button onclick="convertEstimate('${d.id}')">Facturar</button>`:''}<button onclick="deleteRecord('${type}','${d.id}')">Eliminar</button></div></div>`).join('')}
function render(){ $('stat-customers').textContent=state.customers.length;$('stat-estimates').textContent=state.estimates.length;$('stat-invoiced').textContent=money(state.invoices.reduce((s,x)=>s+x.total,0));$('stat-pending').textContent=money(state.invoices.filter(x=>x.status!=='paid').reduce((s,x)=>s+x.total,0));$('customers-list').innerHTML=state.customers.length?state.customers.map(c=>`<div class="data-row"><div><strong>${esc(c.name)}</strong><div class="muted">${esc(c.company||c.address||'Sin empresa')}</div></div><span>${esc(c.phone||'Sin teléfono')}</span><span>${esc(c.email||'Sin correo')}</span><div class="row-actions"><button onclick="deleteRecord('customer','${c.id}')">Eliminar</button></div></div>`).join(''):'<div class="empty">Agrega tu primer cliente.</div>';$('estimates-list').innerHTML=docRows(state.estimates,'estimate');$('invoices-list').innerHTML=docRows(state.invoices,'invoice');const recent=[...state.estimates.map(x=>({...x,type:'Presupuesto'})),...state.invoices.map(x=>({...x,type:'Factura'}))].sort((a,b)=>b.createdAt-a.createdAt).slice(0,5);$('recent-list').innerHTML=recent.length?recent.map(x=>`<div class="data-row"><div><strong>${esc(x.number)}</strong><div class="muted">${esc(x.type)} · ${esc(customerName(x.customerId))}</div></div><span>${money(x.total)}</span><span class="badge ${esc(x.status)}">${esc(x.status)}</span><span></span></div>`).join(''):'Todavía no hay documentos.'}
window.deleteRecord=(type,id)=>{if(!confirm('¿Eliminar este registro?'))return;const key=type==='customer'?'customers':type==='estimate'?'estimates':'invoices';state[key]=state[key].filter(x=>x.id!==id);save()};
window.convertEstimate=id=>{const e=state.estimates.find(x=>x.id===id);if(!e)return;state.invoices.unshift({...e,id:crypto.randomUUID(),number:number('INV',state.invoices),status:'draft',createdAt:Date.now()});save();setView('invoices')};
window.printDoc = (type, id) => {
  const d = state[type === 'estimate' ? 'estimates' : 'invoices'].find(x => x.id === id);
  if (!d) return;
  const c = state.customers.find(x => x.id === d.customerId) || {};
  const w = window.open('', '_blank');
  if (!w) {
    alert('Permite las ventanas emergentes para abrir el documento.');
    return;
  }
  const logoUrl = new URL('/email-signature/logo-main.jpg', window.location.origin);
  w.document.write(`<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(d.number)}</title>
  <style>
    body{font:16px Arial;color:#17324f;max-width:760px;margin:50px auto;padding:20px}
    header{display:flex;justify-content:space-between;gap:20px;border-bottom:4px solid #f58220;padding-bottom:20px}
    .brand-logo{display:block;width:180px;height:120px;object-fit:contain;margin-bottom:12px}
    h1{margin:0}.meta{text-align:right}.box{margin:30px 0;padding:20px;background:#f4f7fb}
    table{width:100%;border-collapse:collapse}th,td{padding:12px;border-bottom:1px solid #ddd;text-align:left}
    .total{text-align:right;font-size:22px;font-weight:bold;margin-top:24px}
    @media print{.print-controls{display:none}header{break-inside:avoid}}
  </style>
</head>
<body>
  <header>
    <div><img id="document-logo" class="brand-logo" width="180" height="120" alt="MULTI-PRO Maintenance Services"><h1>MULTI-PRO</h1><div>Maintenance Services</div></div>
    <div class="meta"><strong>${type === 'estimate' ? 'ESTIMATE' : 'INVOICE'}</strong><br>${esc(d.number)}<br>${new Date(d.createdAt).toLocaleDateString()}</div>
  </header>
  <div class="box"><strong>Cliente:</strong> ${esc(c.name)}<br>${esc(c.company || '')}<br>${esc(c.address || '')}<br>${esc(c.phone || '')} ${esc(c.email || '')}</div>
  <table><thead><tr><th>Descripción</th><th>Cant.</th><th>Precio</th><th>Total</th></tr></thead><tbody><tr><td>${esc(d.description)}</td><td>${d.quantity}</td><td>${money(d.price)}</td><td>${money(d.quantity * d.price)}</td></tr></tbody></table>
  <div class="total">Total: ${money(d.total)}</div><p>${esc(d.notes || '')}</p>
  <div class="print-controls">
    <p id="logo-status" role="status">Cargando el logo…</p>
    <button id="print-document" disabled>Imprimir / Guardar como PDF</button>
    <button id="retry-logo" hidden>Reintentar cargar el logo</button>
  </div>
</body>
</html>`);
  w.document.close();
  const logo = w.document.getElementById('document-logo');
  const printButton = w.document.getElementById('print-document');
  const retryButton = w.document.getElementById('retry-logo');
  const status = w.document.getElementById('logo-status');
  const failLogo = () => {
    if (w.closed) return;
    printButton.disabled = true;
    status.textContent = 'No se pudo cargar el logo. Comprueba la conexión y vuelve a intentarlo.';
    retryButton.hidden = false;
  };
  const loadLogo = (retry = false) => {
    printButton.disabled = true;
    retryButton.hidden = true;
    status.textContent = 'Cargando el logo…';
    logo.onload = async () => {
      try {
        await logo.decode();
        if (w.closed) return;
        status.textContent = 'Documento listo para imprimir o guardar como PDF.';
        printButton.disabled = false;
      } catch {
        failLogo();
      }
    };
    logo.onerror = failLogo;
    const url = new URL(logoUrl);
    if (retry) url.searchParams.set('retry', String(Date.now()));
    logo.src = url.href;
  };
  printButton.onclick = () => { if (!printButton.disabled) w.print(); };
  retryButton.onclick = () => loadLogo(true);
  loadLogo();
};
render();
