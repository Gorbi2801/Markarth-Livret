// ══════════════════════════════════════════════════════════════════════
//  LOIS
// ══════════════════════════════════════════════════════════════════════
const PEINE_COLORS={'Infraction mineure':{bg:'rgba(58,92,42,0.1)',color:'var(--green-dark)',border:'rgba(58,92,42,0.35)'},'Infraction majeure':{bg:'rgba(139,94,0,0.1)',color:'#6B4500',border:'rgba(139,94,0,0.35)'},'Crime':{bg:'rgba(122,16,16,0.1)',color:'#7A1010',border:'rgba(122,16,16,0.3)'},'Crime capital':{bg:'rgba(122,16,16,0.15)',color:'#6A0A0A',border:'rgba(122,16,16,0.4)'},'Haute trahison':{bg:'rgba(80,0,0,0.2)',color:'#500000',border:'rgba(80,0,0,0.5)'}};
const LOIS_SEED=[
  {titre:'Manquement à la discipline',peine:'Infraction mineure',sanction:'Corvées et retrait temporaire de privilèges',description:"Négligence du matériel, retard, tenue non réglementaire."},
  {titre:'Insubordination légère',peine:'Infraction mineure',sanction:'Avertissement, mise à pied courte',description:"Refus ponctuel d'un ordre sans conséquence grave."},
  {titre:'Pillage non autorisé',peine:'Infraction majeure',sanction:'Restitution et sanction disciplinaire',description:"S'approprier le butin d'une mission sans déclaration."},
  {titre:'Abandon de poste',peine:'Infraction majeure',sanction:'Suspension, rétrogradation temporaire',description:"Quitter une garde ou une mission sans autorisation."},
  {titre:'Rapport falsifié',peine:'Infraction majeure',sanction:'Enquête interne, rétrogradation',description:"Mentir sur le déroulement ou l'issue d'une mission."},
  {titre:'Brutalité injustifiée envers un protégé',peine:'Crime',sanction:'Jugement du Commandeur, expulsion possible',description:"Violence gratuite sur un civil ou allié sous protection de l'Ordre."},
  {titre:'Désertion en plein combat',peine:'Crime',sanction:'Dégradation, bannissement',description:"Fuir et laisser des frères d'armes sans soutien."},
  {titre:"Vol des biens de l'Ordre",peine:'Crime',sanction:'Bannissement',description:"Détourner fonds, équipement ou réserves de l'Ordre."},
  {titre:"Collusion avec une cible de l'Ordre",peine:'Crime capital',sanction:'Bannissement définitif, exécution dans les cas avérés',description:"Contact, marché ou complaisance avec un vampire, nécromancien ou cultiste traqué."},
  {titre:"Divulgation des secrets de l'Ordre",peine:'Crime capital',sanction:'Exécution ou bannissement',description:"Révéler méthodes, identités ou emplacements de l'Ordre à un tiers non autorisé."},
  {titre:'Complot contre le Commandement',peine:'Haute trahison',sanction:'Exécution sommaire',description:"Conspiration armée visant un supérieur ou la chaîne de commandement."},
  {titre:'Sabotage ayant coûté des vies',peine:'Haute trahison',sanction:'Exécution',description:"Sabotage délibéré d'une mission ayant entraîné la mort de membres de l'Ordre."},
];
async function loadLois(){
  try{
    const rows=await sbGet('mk_lois','?order=peine.asc');const existing=rows.map(r=>r.titre);
    for(const l of LOIS_SEED){if(!existing.includes(l.titre))await sbPost('mk_lois',l);}
    const all=await sbGet('mk_lois','?order=peine.asc');renderLois(all);
  }catch(e){console.error(e);}
}
function renderLois(rows){
  const tbody=document.getElementById('lois-tbody');const canEdit=canEditSection('lois');
  document.getElementById('lois-total').textContent=rows.length;document.getElementById('lois-act-head').style.display=canEdit?'':'none';
  const colspan=canEdit?5:4;
  let html='';
  const grouped=PEINE_ORDER.map(p=>({peine:p,rows:rows.filter(r=>r.peine===p)}));
  const orphans=rows.filter(r=>!PEINE_ORDER.includes(r.peine));
  if(orphans.length)grouped.push({peine:null,rows:orphans});
  grouped.forEach(g=>{
    if(!g.rows.length)return;
    if(g.peine)html+=`<tr class="lois-cat-row" data-peine="${esc(g.peine)}"><td colspan="${colspan}">${esc(g.peine)}</td></tr>`;
    html+=g.rows.map(r=>{
      const pc=PEINE_COLORS[r.peine]||PEINE_COLORS['Crime'];
      return`<tr data-search="${esc((r.titre+' '+r.peine+' '+r.sanction+' '+(r.description||'')).toLowerCase())}" data-peine="${esc(r.peine||'')}">
        <td class="cell-name">${esc(r.titre)}</td>
        <td><span class="badge" style="background:${pc.bg};color:${pc.color};border:1px solid ${pc.border};">${esc(r.peine)}</span></td>
        <td class="cell-meta">${esc(r.sanction||'—')}</td>
        <td class="cell-meta" style="max-width:200px;font-size:1rem;">${esc(r.description||'—')}</td>
        ${canEdit?`<td class="act"><button class="btn-del" onclick="delLoi('${r.id}')">Abroger</button></td>`:''}</tr>`;
    }).join('');
  });
  tbody.innerHTML=html;
}
async function addLoi(){
  const titre=document.getElementById('lois-titre').value.trim();const peine=document.getElementById('lois-peine').value;const sanction=document.getElementById('lois-sanction').value.trim();const description=document.getElementById('lois-desc').value.trim();
  if(!titre||!peine){toast('Titre et peine requis.');return;}
  try{await sbPost('mk_lois',{titre,peine,sanction,description});['lois-titre','lois-sanction','lois-desc'].forEach(id=>document.getElementById(id).value='');document.getElementById('lois-peine').value='';toggleForm('lois-form');await loadLois();toast(`${titre} promulguée.`);}catch(e){toast('Erreur.');}
}
async function delLoi(id){if(!confirm('Abroger cette loi ?'))return;try{await sbDelete('mk_lois',`?id=eq.${id}`);await loadLois();toast('Loi abrogée.');}catch(e){toast('Erreur.');}}

