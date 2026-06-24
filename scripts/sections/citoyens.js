// ══════════════════════════════════════════════════════════════════════
//  CITOYENS
// ══════════════════════════════════════════════════════════════════════
async function loadCitoyens(){
  try{const rows=await sbGet('mk_citoyens','?order=nom.asc');renderCitoyens(rows);}catch(e){console.error(e);}
}
function renderCitoyens(rows){
  citoyensRows=rows;
  const tbody=document.getElementById('cit-tbody');
  const canEdit=canEditSection('citoyens');
  document.getElementById('cit-total').textContent=rows.length;
  document.getElementById('cit-act-head').style.display=canEdit?'':'none';
  // Stats par statut
  const proteges=rows.filter(r=>(r.statut_citoyennete||'Protégé')==='Protégé').length;
  const bannis=rows.filter(r=>r.statut_citoyennete==='Banni').length;
  const el_ok=document.getElementById('cit-taxe-ok');
  const el_ko=document.getElementById('cit-taxe-ko');
  if(el_ok)el_ok.textContent=proteges;
  if(el_ko)el_ko.textContent=bannis;
  tbody.innerHTML=rows.map(r=>{
    const statut=r.statut_citoyennete||'Protégé';
    const statutBadge=statut==='Protégé'
      ?`<span style="color:var(--green-dark);font-size:1rem;">✅ Protégé</span>`
      :statut==='Surveillance'
      ?`<span style="color:#8B6030;font-size:1rem;">⏸ Surveillance</span>`
      :`<span style="color:#8B3030;font-size:1rem;">❌ Banni</span>`;
    const voie=r.voie_citoyennete||'—';
    const voieIcon=voie==='Service'?'🛡':voie==='Recommandation'?'📜':voie==='Refuge'?'🏠':'—';
    const dateObt=r.date_obtention?new Date(r.date_obtention).toLocaleDateString('fr-FR'):'—';
    const statutBtn=canEdit
      ?`<button onclick="cycleStatut('${r.id}','${statut}')" style="font-size:1rem;padding:.12rem .45rem;margin-left:.3rem;font-family:'Eagle Lake',serif;cursor:pointer;background:transparent;border:1px solid var(--border-g);color:var(--ink-mid);" title="Changer le statut">↻</button>`
      :'';
    const conStatut=r.concession_statut||'';
    const conBadge=conStatut?`<span class="badge badge-${conStatut.replace(' ','-')}">${conStatut.charAt(0).toUpperCase()+conStatut.slice(1)}</span>`:'<span style="color:var(--ink-faint);font-size:1rem;">—</span>';
    const conDetail=r.concession_type?`<span class="badge badge-tag">${esc(r.concession_type)}</span><div style="font-size:1rem;font-style:italic;color:var(--ink-faint);margin-top:.2rem;max-width:220px;">${esc(r.concession_ressource||'')}${r.concession_contrepartie?' — '+esc(r.concession_contrepartie):''}</div>`:'<span style="color:var(--ink-faint);font-size:1rem;">—</span>';
    return `<tr data-search="${esc((r.prenom+' '+r.nom+' '+r.race+' '+(r.metier||'')).toLowerCase())}" data-race="${esc(r.race||'')}" data-statut="${esc(statut)}" data-con-statut="${esc(conStatut)}">
      <td class="cell-name">${esc(r.prenom)}${r.nom?" "+esc(r.nom):""}</td>
      <td class="cell-meta">${r.race?`<span class="badge badge-tag">${esc(r.race)}</span>`:'—'}</td>
      <td class="cell-meta">${esc(r.metier||'—')}</td>
      <td class="cell-meta" style="white-space:nowrap;">${voieIcon} ${esc(voie)}</td>
      <td class="cell-meta" style="white-space:nowrap;">${statutBadge}${statutBtn}</td>
      <td class="cell-meta">${dateObt}</td>
      <td class="cell-meta">${conDetail}</td>
      <td class="cell-meta">${conBadge}</td>
      <td class="cell-meta"><button class="btn-del" onclick="openNoteModal('citoyens','${r.id}')">${r.notes?'Note ●':'Note'}</button></td>
      ${canEdit?`<td class="act"><button class="btn-del" onclick="editCitoyen('${r.id}')">Modifier</button> <button class="btn-del" onclick="delCitoyen('${r.id}')">Radier</button></td>`:''}
    </tr>`;
  }).join('');
}
async function cycleStatut(id,current){
  const next={'Protégé':'Surveillance','Surveillance':'Banni','Banni':'Protégé'}[current]||'Protégé';
  try{await sbPatch('mk_citoyens',`?id=eq.${id}`,{statut_citoyennete:next});await loadCitoyens();toast(`Statut → ${next}.`);}
  catch(e){toast('Erreur.');}
}
function editCitoyen(id){
  const row=citoyensRows.find(r=>r.id===id);if(!row)return;
  editState={type:'citoyens',id};
  document.getElementById('cit-prenom').value=row.prenom||'';
  document.getElementById('cit-nom').value=row.nom||'';
  document.getElementById('cit-race').value=row.race||'';
  document.getElementById('cit-metier').value=row.metier||'';
  document.getElementById('cit-voie').value=row.voie_citoyennete||'';
  document.getElementById('cit-statut').value=row.statut_citoyennete||'Protégé';
  document.getElementById('cit-date-obtention').value=row.date_obtention||'';
  document.getElementById('cit-con-type').value=row.concession_type||'';
  document.getElementById('cit-con-ressource').value=row.concession_ressource||'';
  document.getElementById('cit-con-contrepartie').value=row.concession_contrepartie||'';
  document.getElementById('cit-con-date').value=row.concession_date||'';
  document.getElementById('cit-con-statut').value=row.concession_statut||'';
  document.getElementById('cit-submit-btn').textContent='Mettre à jour';
  openFormById('cit-form');
}
async function addCitoyen(){
  const prenom=document.getElementById('cit-prenom').value.trim();
  const nom=document.getElementById('cit-nom').value.trim();
  const race=document.getElementById('cit-race').value;
  const metier=document.getElementById('cit-metier').value;
  const voie_citoyennete=document.getElementById('cit-voie').value;
  const statut_citoyennete=document.getElementById('cit-statut').value||'Protégé';
  const date_obtention=document.getElementById('cit-date-obtention').value||null;
  const concession_type=document.getElementById('cit-con-type').value;
  const concession_ressource=document.getElementById('cit-con-ressource').value.trim();
  const concession_contrepartie=document.getElementById('cit-con-contrepartie').value.trim();
  const concession_date=document.getElementById('cit-con-date').value||null;
  const concession_statut=document.getElementById('cit-con-statut').value;
  if(!prenom){toast('Prénom requis.');return;}
  const payload={prenom,nom,race,metier,voie_citoyennete,statut_citoyennete,date_obtention,concession_type,concession_ressource,concession_contrepartie,concession_date,concession_statut};
  try{
    const isEdit=editState&&editState.type==='citoyens';
    if(isEdit)await sbPatch('mk_citoyens',`?id=eq.${editState.id}`,payload);
    else await sbPost('mk_citoyens',payload);
    ['cit-prenom','cit-nom'].forEach(id=>document.getElementById(id).value='');
    ['cit-race','cit-metier','cit-voie','cit-statut'].forEach(id=>document.getElementById(id).value='');
    document.getElementById('cit-date-obtention').value='';
    ['cit-con-ressource','cit-con-contrepartie'].forEach(id=>document.getElementById(id).value='');
    document.getElementById('cit-con-type').value='';document.getElementById('cit-con-date').value='';document.getElementById('cit-con-statut').value='';
    clearEditState('cit-form');
    toggleForm('cit-form');await loadCitoyens();toast(`${prenom}${nom?' '+nom:''} ${isEdit?'mis à jour':'inscrit'}.`);
  }catch(e){console.error(e);toast('Erreur.');}
}
async function delCitoyen(id){
  if(!confirm('Radier ce civil ou allié ?'))return;
  try{await sbDelete('mk_citoyens',`?id=eq.${id}`);await loadCitoyens();toast('Entrée radiée.');}
  catch(e){toast('Erreur.');}
}
