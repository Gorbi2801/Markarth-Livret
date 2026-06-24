// ══════════════════════════════════════════════════════════════════════
//  MISSIVES
// ══════════════════════════════════════════════════════════════════════
const missiveState={
  loaded:false,
  tab:'inbox',
  missives:[],
  recipients:[],
  selectedId:null,
};

function missiveEsc(value){
  return String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function missiveDate(value){
  if(!value)return '—';
  const d=new Date(value);
  return Number.isNaN(d.getTime())?'—':d.toLocaleString('fr-FR',{dateStyle:'short',timeStyle:'short'});
}

function missiveRecipient(userId){
  if(session?.user?.id===userId){
    return {
      user_id:userId,
      username:session.username,
      display_name:session.displayName,
      prenom:session.garde?.prenom,
      nom:session.garde?.nom,
      grade:session.garde?.grade,
    };
  }
  return missiveState.recipients.find(row=>row.user_id===userId)||null;
}

function missiveName(userId){
  const row=missiveRecipient(userId);
  if(!row)return 'Compte inconnu';
  const rp=[row.prenom,row.nom].filter(Boolean).join(' ');
  return rp||row.display_name||row.username||'Compte';
}

function missiveMeta(userId){
  const row=missiveRecipient(userId);
  if(!row)return '';
  return row.grade||row.username||'';
}

function selectedMissive(){
  return missiveState.missives.find(row=>row.id===missiveState.selectedId)||null;
}

async function loadMissiveRecipients(){
  const { data, error } = await window.GrimoireSupabase
    .from('mk_missive_recipients')
    .select('user_id,username,display_name,prenom,nom,grade')
    .order('display_name',{ascending:true});

  if(error){
    console.error('Impossible de charger les destinataires.', error);
    throw error;
  }

  missiveState.recipients=data||[];
}

async function loadMissives(){
  if(!session)return;
  const msg=document.getElementById('missiveMsg');
  if(msg)msg.textContent='Chargement des missives...';
  try{
    await loadMissiveRecipients();
    const { data, error } = await window.GrimoireSupabase
      .from('mk_missives')
      .select('id,sender_id,recipient_id,subject,body,read_at,created_at')
      .order('created_at',{ascending:false});
    if(error)throw error;
    missiveState.missives=data||[];
    missiveState.loaded=true;
    if(missiveState.selectedId&&!selectedMissive())missiveState.selectedId=null;
    renderMissives();
    if(msg)msg.textContent='';
  }catch(error){
    console.error(error);
    if(msg)msg.textContent='Impossible de charger les missives.';
    toast('Erreur de chargement des missives.');
  }
}

function setMissiveTab(tab){
  if(tab==='all'&&!session?.isSuperadmin)tab='inbox';
  missiveState.tab=tab;
  missiveState.selectedId=null;
  renderMissives();
}

function missiveRowsForCurrentTab(){
  if(!session)return [];
  if(missiveState.tab==='sent')return missiveState.missives.filter(row=>row.sender_id===session.user.id);
  if(missiveState.tab==='all'&&session.isSuperadmin)return missiveState.missives.slice();
  return missiveState.missives.filter(row=>row.recipient_id===session.user.id);
}

function renderMissives(){
  renderMissiveStats();
  renderMissiveTabs();
  renderMissiveList();
  renderMissiveDetail();
  renderMissiveComposer();
}

function renderMissiveStats(){
  const inbox=missiveState.missives.filter(row=>row.recipient_id===session.user.id).length;
  const sent=missiveState.missives.filter(row=>row.sender_id===session.user.id).length;
  const unread=missiveState.missives.filter(row=>row.recipient_id===session.user.id&&!row.read_at).length;
  const inboxEl=document.getElementById('missiveInboxCount');
  const sentEl=document.getElementById('missiveSentCount');
  const unreadEl=document.getElementById('missiveUnreadCount');
  if(inboxEl)inboxEl.textContent=`Réception : ${inbox}`;
  if(sentEl)sentEl.textContent=`Envoyées : ${sent}`;
  if(unreadEl)unreadEl.textContent=`Non lues : ${unread}`;
}

function renderMissiveTabs(){
  document.querySelectorAll('[data-missive-tab]').forEach(btn=>{
    const tab=btn.getAttribute('data-missive-tab');
    btn.classList.toggle('active',tab===missiveState.tab);
    if(tab==='all')btn.style.display=session?.isSuperadmin?'':'none';
  });
}

function filterMissives(){
  renderMissiveList();
}

function renderMissiveList(){
  const list=document.getElementById('missiveList');
  if(!list)return;
  const q=(document.getElementById('missiveSearch')?.value||'').trim().toLowerCase();
  const rows=missiveRowsForCurrentTab().filter(row=>{
    const haystack=[
      row.subject,
      row.body,
      missiveName(row.sender_id),
      missiveName(row.recipient_id),
    ].join(' ').toLowerCase();
    return !q||haystack.includes(q);
  });

  list.innerHTML=rows.map(row=>{
    const isInbox=row.recipient_id===session.user.id;
    const unread=isInbox&&!row.read_at;
    const selected=row.id===missiveState.selectedId?' active':'';
    const peer=missiveState.tab==='sent'?row.recipient_id:row.sender_id;
    const direction=missiveState.tab==='sent'?'À':'De';
    return `<button class="missive-item${selected}${unread?' unread':''}" onclick="selectMissive('${missiveEsc(row.id)}')">
      <span class="missive-item-head">
        <strong>${missiveEsc(row.subject||'Sans objet')}</strong>
        <small>${missiveEsc(missiveDate(row.created_at))}</small>
      </span>
      <span class="missive-item-meta">${direction} ${missiveEsc(missiveName(peer))}</span>
    </button>`;
  }).join('');

  if(!rows.length)list.innerHTML='<p class="sa-empty">Aucune missive.</p>';
}

async function selectMissive(id){
  const row=missiveState.missives.find(item=>item.id===id);
  if(!row)return;
  missiveState.selectedId=id;

  if(row.recipient_id===session.user.id&&!row.read_at){
    const readAt=new Date().toISOString();
    try{
      const { error } = await window.GrimoireSupabase
        .from('mk_missives')
        .update({read_at:readAt})
        .eq('id',row.id);
      if(error)throw error;
      row.read_at=readAt;
    }catch(error){
      console.error(error);
    }
  }

  renderMissives();
}

function renderMissiveDetail(){
  const detail=document.getElementById('missiveDetail');
  if(!detail)return;
  const row=selectedMissive();
  if(!row){
    detail.innerHTML='<div class="profile-title">Missive sélectionnée</div><p class="sa-muted">Sélectionne une missive dans la liste.</p>';
    return;
  }

  detail.innerHTML=`
    <div class="profile-title">${missiveEsc(row.subject||'Sans objet')}</div>
    <dl class="profile-details missive-details">
      <dt>De</dt><dd>${missiveEsc(missiveName(row.sender_id))}${missiveMeta(row.sender_id)?` <span>${missiveEsc(missiveMeta(row.sender_id))}</span>`:''}</dd>
      <dt>À</dt><dd>${missiveEsc(missiveName(row.recipient_id))}${missiveMeta(row.recipient_id)?` <span>${missiveEsc(missiveMeta(row.recipient_id))}</span>`:''}</dd>
      <dt>Date</dt><dd>${missiveEsc(missiveDate(row.created_at))}</dd>
      <dt>Lecture</dt><dd>${row.read_at?missiveEsc(missiveDate(row.read_at)):'Non lue'}</dd>
    </dl>
    <div class="missive-body">${missiveEsc(row.body||'').replace(/\n/g,'<br>')}</div>`;
}

function renderMissiveComposer(){
  const select=document.getElementById('missiveRecipient');
  if(!select)return;
  const current=select.value;
  const options=missiveState.recipients
    .filter(row=>row.user_id!==session.user.id)
    .map(row=>`<option value="${missiveEsc(row.user_id)}">${missiveEsc(missiveName(row.user_id))}${row.grade?` — ${missiveEsc(row.grade)}`:''}</option>`)
    .join('');
  select.innerHTML=options||'<option value="">Aucun destinataire disponible</option>';
  if(current&&missiveState.recipients.some(row=>row.user_id===current))select.value=current;
}

async function sendMissive(){
  if(!session)return;
  const recipientId=document.getElementById('missiveRecipient')?.value||'';
  const subject=(document.getElementById('missiveSubject')?.value||'').trim();
  const body=(document.getElementById('missiveBody')?.value||'').trim();
  if(!recipientId){toast('Destinataire requis.');return;}
  if(!subject){toast('Objet requis.');return;}
  if(!body){toast('Message requis.');return;}

  try{
    const { error } = await window.GrimoireSupabase
      .from('mk_missives')
      .insert({
        sender_id:session.user.id,
        recipient_id:recipientId,
        subject,
        body,
      });
    if(error)throw error;
    document.getElementById('missiveSubject').value='';
    document.getElementById('missiveBody').value='';
    missiveState.tab='sent';
    await loadMissives();
    toast('Missive envoyée.');
  }catch(error){
    console.error(error);
    toast('Erreur lors de l\'envoi.');
  }
}
