// ══════════════════════════════════════════════════════════════════════
//  COMMERCES
// ══════════════════════════════════════════════════════════════════════
async function loadCommerces(){
  try{const rows=await sbGet('mk_transactions','?order=date.desc');renderCommerces(rows);}catch(e){console.error(e);}
}
function renderCommerces(rows){
  commercesRows=rows;
  const tbody=document.getElementById('com-tbody');const canEdit=canEditSection('commerces');
  document.getElementById('com-total').textContent=rows.length;
  document.getElementById('com-act-head').style.display=canEdit?'':'none';
  tbody.innerHTML=rows.map(r=>{
    return`<tr data-search="${esc((r.type+' '+(r.partie_externe||'')+' '+(r.objet||'')+' '+(r.enregistre_par||'')).toLowerCase())}" data-type="${esc(r.type||'')}" data-date="${esc(r.date||'')}">
      <td class="cell-meta">${r.date?new Date(r.date+'T00:00:00').toLocaleDateString('fr-FR'):'—'}</td>
      <td class="cell-meta">${r.type?`<span class="badge badge-tag">${esc(r.type)}</span>`:'—'}</td>
      <td class="cell-meta">${esc(r.objet||'—')}</td>
      <td class="cell-meta">${esc(r.valeur||'—')}</td>
      <td class="cell-meta">${esc(r.partie_externe||'—')}</td>
      <td class="cell-meta">${esc(r.enregistre_par||'—')}</td>
      ${canEdit?`<td class="act"><button class="btn-del" onclick="editCommerce('${r.id}')">Modifier</button> <button class="btn-del" onclick="openNoteModal('commerce','${r.id}')">${r.notes?'Note ●':'Note'}</button> <button class="btn-del" onclick="delCommerce('${r.id}')">Suppr.</button></td>`:''}
    </tr>`;
  }).join('');
}
function editCommerce(id){
  const row=commercesRows.find(r=>r.id===id);if(!row)return;
  editState={type:'commerce',id};
  document.getElementById('com-date').value=row.date||'';
  document.getElementById('com-type').value=row.type||'';
  document.getElementById('com-objet').value=row.objet||'';
  document.getElementById('com-valeur').value=row.valeur||'';
  document.getElementById('com-partie-externe').value=row.partie_externe||'';
  document.getElementById('com-enregistre-par').value=row.enregistre_par||'';
  document.getElementById('com-submit-btn').textContent='Mettre à jour';
  openFormById('com-form');
}
async function addCommerce(){
  const date=document.getElementById('com-date').value;
  const type=document.getElementById('com-type').value;
  const objet=document.getElementById('com-objet').value.trim();
  const valeur=document.getElementById('com-valeur').value.trim();
  const partie_externe=document.getElementById('com-partie-externe').value.trim();
  const enregistre_par=document.getElementById('com-enregistre-par').value.trim();
  if(!date||!type){toast('Date et type requis.');return;}
  try{
    const isEdit=editState&&editState.type==='commerce';
    if(isEdit)await sbPatch('mk_transactions',`?id=eq.${editState.id}`,{date,type,objet,valeur,partie_externe,enregistre_par});
    else await sbPost('mk_transactions',{date,type,objet,valeur,partie_externe,enregistre_par});
    ['com-objet','com-valeur','com-partie-externe','com-enregistre-par'].forEach(id=>document.getElementById(id).value='');
    document.getElementById('com-date').value='';document.getElementById('com-type').value='';
    clearEditState('com-form');
    toggleForm('com-form');await loadCommerces();toast(isEdit?'Mis à jour.':'Enregistré.');
  }catch(e){toast('Erreur.');}
}
async function delCommerce(id){if(!confirm('Supprimer cet enregistrement ?'))return;try{await sbDelete('mk_transactions',`?id=eq.${id}`);await loadCommerces();toast('Supprimé.');}catch(e){toast('Erreur.');}}
