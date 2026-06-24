// ══════════════════════════════════════════════════════════════════════
//  FACTIONS & CONFIG
// ══════════════════════════════════════════════════════════════════════
const CHATELERIES=[
  {key:'blancherive',label:'Châtellerie de Blancherive',sub:'Blancherive, Rivebois',cat:'chatellerie',
    summary:"Carrefour commercial et militaire de Bordeciel. L'Ordre n'y maintient aucune présence officielle, mais croise régulièrement la route de ses marchands et de la Légion."},
  {key:'haafingar',label:'Châtellerie de Haafingar',sub:'Solitude, Pendragon',cat:'chatellerie',
    summary:"Siège du pouvoir impérial en Bordeciel. L'Ordre y opère avec une discrétion redoublée, Solitude abritant aussi bien la Légion que l'ambassade Thalmor."},
  {key:'estemarche',label:"Châtellerie d'Estemarche",sub:'Vendeaume',cat:'chatellerie',
    summary:"Foyer du conservatisme nordique et du culte clandestin de Talos. L'Ordre y agit prudemment, sans jamais s'associer publiquement à l'un des partis locaux."},
  {key:'breche',label:'Châtellerie de la Brèche',sub:'Faillaise, Fort-Hivar, Pierre de Shor',cat:'chatellerie',
    summary:"Terre d'origine de l'Ordre, fondé puis banni en ces lieux par un ancien Jarl. Fort-Aube se dresse toujours à l'est de Faillaise, dans une tolérance tendue avec le pouvoir actuel."},
  {key:'crevasse',label:'Châtellerie de la Crevasse',sub:'Markarth, Folpertuis',cat:'chatellerie',
    summary:"Châtellenie marquée par les troubles avec les Parjures et la corruption de ses mines. L'Ordre y intervient rarement, faute de relais fiables sur place."},
  {key:'legion',label:'Légion Impériale',cat:'faction',
    summary:"L'Ordre ne sert aucune couronne, mais la Légion tolère ses méthodes tant qu'elles servent, en silence, une stabilité qu'elle peine à garantir seule."},
  {key:'thalmor',label:'Thalmor',cat:'faction',
    summary:"Aucune hostilité déclarée, mais une méfiance mutuelle et structurelle. Le Thalmor surveille de près toute organisation armée échappant à son contrôle."},
  {key:'culte_talos',label:'Culte clandestin de Talos',cat:'faction',
    summary:"Point de friction latent : l'Ordre n'a aucune raison doctrinale de s'y opposer, mais refuse tout autant de leur servir de bouclier face au Thalmor."},
  {key:'guilde_voleurs',label:'Guilde des Voleurs',cat:'faction',
    summary:"Aucun contact établi à ce jour. Leurs intérêts ne se croisent qu'occasionnellement, et l'Ordre n'a pas vocation à se mêler de leurs affaires."},
  {key:'confrerie_noire',label:'Confrérie Noire',cat:'faction',
    summary:"Une convergence de moyens, jamais de doctrine. L'Ordre tolère leur existence tant qu'elle ne s'attaque jamais à l'un des siens."},
  {key:'academie',label:"Académie de Fort-d'Hiver",cat:'faction',
    summary:"Alliés ponctuels pour la recherche arcanique, en particulier sur les artefacts daedriques. L'Ordre se méfie cependant d'une dépendance excessive à la sorcellerie."},
  {key:'bardes',label:'Académie des Bardes',cat:'faction',
    summary:"Aucune relation directe. L'Ordre se tient à distance respectueuse d'une institution qui vit de récits — l'exact inverse de sa propre doctrine du silence."},
  {key:'compagnons',label:'Les Compagnons',cat:'faction',
    summary:"Guilde de mercenaires respectée à Blancherive. L'Ordre n'a aucune raison de s'y intéresser tant qu'aucune menace concrète n'en émane."},
  {key:'vigiles',label:'Vigiles de Stendarr',cat:'faction',
    summary:"Organisation sœur, née de la même lignée qu'Isran lui-même. Un respect distant subsiste, malgré un désaccord persistant sur les méthodes à employer."},
  {key:'main_argent',label:"Main d'Argent",cat:'faction',
    summary:"Nos rapports les décrivent comme d'anciens chasseurs de loups-garous, aujourd'hui dégénérés en bande de tortionnaires. L'Ordre les traite comme une menace à part entière, au même titre que celles qu'ils prétendent combattre."},
  {key:'clans_orques',label:'Clans orques',cat:'faction',
    summary:"Peu de contacts directs, mais aucune hostilité de principe. L'Ordre accueille en son sein quiconque, orque ou non, prêt à en payer le prix."},
  {key:'parjure',label:'Parjure',cat:'faction',
    summary:"Rébellion enracinée dans la Crevasse. L'Ordre n'a pas vocation politique à s'en mêler, sauf si leurs rites venaient à croiser ceux d'un culte daedrique."},
  {key:'necromanciens',label:'Nécromanciens',cat:'faction',
    summary:"Une des cibles directes du mandat de l'Ordre. Aucune négociation possible, aucune tolérance envisagée."},
  {key:'falmer',label:'Falmer',cat:'faction',
    summary:"Vestiges corrompus d'un peuple oublié, reclus sous terre. Une menace ancienne, rarement croisée mais jamais sous-estimée."},
  {key:'cultistes_daedriques',label:'Cultistes daédriques',cat:'faction',
    summary:"Cœur du mandat de l'Ordre, au même titre que les vampires. Chaque culte recensé fait l'objet d'une surveillance, sinon d'une intervention."},
];
const MAP_PINS=[
  {key:'breche',left:87.1,top:79.9},
  {key:'blancherive',left:53.9,top:55.1},
  {key:'crevasse',left:11.1,top:53.2},
  {key:'haafingar',left:34.8,top:28.2},
  {key:'estemarche',left:77.4,top:45.6},
  {key:'academie',left:72.3,top:27.5},
  {key:'thalmor',left:30.0,top:24.2},
];
function renderDiploPins(rows){
  const wrap=document.getElementById('diplo-map-wrap');if(!wrap)return;
  wrap.querySelectorAll('.diplo-pin').forEach(p=>p.remove());
  let tt=document.getElementById('diplo-tooltip');
  if(!tt){tt=document.createElement('div');tt.id='diplo-tooltip';wrap.appendChild(tt);}
  MAP_PINS.forEach(p=>{
    const c=CHATELERIES.find(x=>x.key===p.key);if(!c)return;
    const row=rows.find(r=>r.chatellerie===p.key)||{relation:'neutre'};const rel=row.relation||'neutre';
    const pin=document.createElement('div');
    pin.className=`diplo-pin ${rel}`;
    pin.style.left=p.left+'%';pin.style.top=p.top+'%';
    pin.addEventListener('mouseenter',()=>{
      tt.textContent=`${c.label} — ${rel.charAt(0).toUpperCase()+rel.slice(1)}`;
      tt.style.left=p.left+'%';tt.style.top=p.top+'%';tt.style.display='block';
    });
    pin.addEventListener('mouseleave',()=>{tt.style.display='none';});
    pin.addEventListener('click',()=>{
      const card=document.querySelector(`.relation-card[data-key="${p.key}"]`);
      if(card){card.scrollIntoView({behavior:'smooth',block:'center'});card.classList.add('flash');setTimeout(()=>card.classList.remove('flash'),1000);}
    });
    wrap.appendChild(pin);
  });
}
// ══════════════════════════════════════════════════════════════════════
//  DIPLOMATIE
// ══════════════════════════════════════════════════════════════════════
async function loadDiplomatie(){
  try{
    const rows=await sbGet('mk_diplomatie','');const existing=rows.map(r=>r.chatellerie);
    for(const c of CHATELERIES){if(!existing.includes(c.key))await sbPost('mk_diplomatie',{chatellerie:c.key,relation:'neutre',notes:''});}
    const all=await sbGet('mk_diplomatie','');renderDiplomatie(all);
  }catch(e){console.error(e);}
}
function renderDiplomatie(rows){
  const canEdit=canEditSection('diplomatie');const grid=document.getElementById('relation-grid');
  const card=c=>{
    const row=rows.find(r=>r.chatellerie===c.key)||{relation:'neutre'};const rel=row.relation||'neutre';
    return`<div class="relation-card ${rel}" data-key="${c.key}" data-rel="${rel}">
      <div class="relation-card-top">
        <div><div class="rel-name">❖ ${c.label}</div>${c.sub?`<div style="font-size:1rem;font-style:italic;color:var(--ink-faint);margin-top:0.1rem;">${c.sub}</div>`:''}<span class="badge badge-${rel}" style="margin-top:0.2rem;">${rel.charAt(0).toUpperCase()+rel.slice(1)}</span></div>
        ${canEdit?`<select class="rel-sel" onchange="saveRelation('${c.key}',this.value)">${['alliance','amical','neutre','hostile','guerre'].map(o=>`<option value="${o}"${o===rel?' selected':''}>${o.charAt(0).toUpperCase()+o.slice(1)}</option>`).join('')}</select>`:''}
      </div>
      ${c.summary?`<p class="rel-summary">${c.summary}</p>`:''}
    </div>`;
  };
  const chatelleries=CHATELERIES.filter(c=>c.cat==='chatellerie');
  const factions=CHATELERIES.filter(c=>c.cat==='faction');
  grid.innerHTML=
    `<p style="font-family:'Eagle Lake',serif;font-size:1rem;letter-spacing:0.08em;color:var(--green-dark);margin:0.5rem 0 0.5rem;">🏰 CHÂTELLERIES</p>`+
    `<div class="relation-grid">${chatelleries.map(card).join('')}</div>`+
    `<p style="font-family:'Eagle Lake',serif;font-size:1rem;letter-spacing:0.08em;color:var(--green-dark);margin:1.25rem 0 0.5rem;">⚔ AUTRES FACTIONS</p>`+
    `<div class="relation-grid">${factions.map(card).join('')}</div>`;
  renderDiploPins(rows);
}
async function saveRelation(chatellerie,relation){
  try{await sbPatch('mk_diplomatie',`?chatellerie=eq.${chatellerie}`,{relation,updated_at:new Date().toISOString()});const all=await sbGet('mk_diplomatie','');renderDiplomatie(all);toast(`${CHATELERIES.find(c=>c.key===chatellerie)?.label} : ${relation}`);}catch(e){toast('Erreur.');}
}
