// ══════════════════════════════════════════════════════════════════════
//  COUR DU JARL
// ══════════════════════════════════════════════════════════════════════
async function loadCour(){try{const rows=await sbGet('mk_cour','?order=titre.asc');renderCour(rows);}catch(e){console.error(e);}}
const TITRE_DESC={
  "Intendant de Fort-Aube":"Intendance générale du fort : vivres, réserves, personnel non-combattant.",
  "Émissaire de l'Aube":"Relations extérieures, négociations avec les autres châtelleries et factions.",
  "Trésorier de l'Ordre":"Gestion des fonds, financement des opérations et des primes versées aux Traqueurs.",
  "Maître des Secrets":"Renseignement, informateurs, surveillance des cibles avant intervention.",
  "Maître des Forges":"Gestion de la forge et de l'armurerie de Fort-Aube : production, entretien et distribution des armes et équipements.",
};
function renderCour(rows){
  courRows=rows;
  const tbody=document.getElementById('cour-tbody');const canEdit=canEditSection('cour');
  document.getElementById('cour-total').textContent=rows.length;document.getElementById('cour-act-head').style.display=canEdit?'':'none';
  tbody.innerHTML=rows.map(r=>`<tr data-search="${esc((r.prenom+' '+r.nom+' '+r.titre).toLowerCase())}" data-titre="${esc(r.titre||'')}">
    <td class="cell-name">${esc(r.prenom)}${r.nom?" "+esc(r.nom):""}</td>
    <td class="cell-meta">${r.titre?`<span class="badge badge-tag">${esc(r.titre)}</span>${TITRE_DESC[r.titre]?`<div style="font-size:1rem;font-style:italic;color:var(--ink-faint);margin-top:.25rem;max-width:280px;">${esc(TITRE_DESC[r.titre])}</div>`:''}`:'—'}</td>
    ${canEdit?`<td class="act"><button class="btn-del" onclick="editCour('${r.id}')">Modifier</button> <button class="btn-del" onclick="delCour('${r.id}')">Révoquer</button></td>`:''}</tr>`).join('');
}
function editCour(id){
  const row=courRows.find(r=>r.id===id);if(!row)return;
  editState={type:'cour',id};
  document.getElementById('cour-prenom').value=row.prenom||'';
  document.getElementById('cour-nom').value=row.nom||'';
  document.getElementById('cour-titre').value=row.titre||'';
  document.getElementById('cour-submit-btn').textContent='Mettre à jour';
  openFormById('cour-form');
}
async function addCour(){
  const prenom=document.getElementById('cour-prenom').value.trim();const nom=document.getElementById('cour-nom').value.trim();const titre=document.getElementById('cour-titre').value;
  if(!prenom||!titre){toast('Prénom et titre requis.');return;}
  try{
    const isEdit=editState&&editState.type==='cour';
    if(isEdit)await sbPatch('mk_cour',`?id=eq.${editState.id}`,{prenom,nom,titre});
    else await sbPost('mk_cour',{prenom,nom,titre});
    document.getElementById('cour-prenom').value='';document.getElementById('cour-nom').value='';document.getElementById('cour-titre').value='';
    clearEditState('cour-form');
    toggleForm('cour-form');await loadCour();toast(`${prenom}${nom?' '+nom:''} ${isEdit?'mis à jour':'nommé '+titre}.`);
  }catch(e){toast('Erreur.');}
}
async function delCour(id){if(!confirm('Révoquer ce membre ?'))return;try{await sbDelete('mk_cour',`?id=eq.${id}`);await loadCour();toast('Révoqué.');}catch(e){toast('Erreur.');}}
