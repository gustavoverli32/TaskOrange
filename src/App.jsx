import { useState, useEffect, useRef } from "react";

const ORANGE = "#E8740C";
const ORANGE_LIGHT = "#FFF3E8";
const GRAY_BG = "#F5F3F0";
const GRAY_BORDER = "#E0DCD7";
const GRAY_TEXT = "#8A8580";
const DARK = "#1A1714";
const RED = "#D85A30";
const GREEN = "#6B9B5E";

/* ─── Persistence ─── */
function load(key, fallback) {
  try { const s = localStorage.getItem(key); if (s) return JSON.parse(s); } catch {} return fallback;
}
function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

const DEFAULT_TAGS = ["Eventuais", "Reunião", "Painel CEI", "Outros"];

/* ─── Notifications ─── */
function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") Notification.requestPermission();
}
function sendNotification(title, body) {
  if ("Notification" in window && Notification.permission === "granted")
    new Notification(title, { body, icon: "/icon-192.png" });
}

/* ─── Styles ─── */
function GlobalStyles() {
  return (<style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
    @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
    @keyframes slideUp { from { transform:translateY(100%) } to { transform:translateY(0) } }
    @keyframes slideIn { from { opacity:0;transform:translateX(20px) } to { opacity:1;transform:translateX(0) } }
    * { box-sizing:border-box; -webkit-tap-highlight-color:transparent; font-family:'DM Sans',-apple-system,sans-serif; }
    input,select,textarea { font-size:16px!important; }
    input::placeholder,textarea::placeholder { color:#BBB7B2; }
    body { overscroll-behavior:none; margin:0; }
    ::-webkit-scrollbar { display:none; }
  `}</style>);
}

/* ─── Components ─── */
function Toggle({ on, onToggle }) {
  return (
    <div onClick={onToggle} style={{
      width:48,height:28,borderRadius:14,background:on?ORANGE:"#D4D0CC",
      position:"relative",cursor:"pointer",transition:"background 0.2s",flexShrink:0
    }}>
      <div style={{
        width:24,height:24,borderRadius:12,background:"#fff",
        position:"absolute",top:2,left:on?22:2,
        transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.18)"
      }}/>
    </div>
  );
}

/* ─── Icons ─── */
function ClockIcon({size=18,color=GRAY_TEXT}) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>);
}
function AlarmIcon({size=18,color=ORANGE}) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="13" r="8"/><polyline points="12 9 12 13 15 15"/><line x1="5" y1="3" x2="2" y2="6"/><line x1="19" y1="3" x2="22" y2="6"/></svg>);
}
function RepeatIcon({size=18,color=GRAY_TEXT}) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>);
}
function CheckIcon({size=14,color=GREEN}) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>);
}
function TrashIcon({size=18,color=RED}) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>);
}
function BellIcon({size=18,color=GRAY_TEXT}) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>);
}
function VolumeIcon({size=18,color=GRAY_TEXT}) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>);
}
function FileIcon({size=18,color=GRAY_TEXT}) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>);
}
function CameraIcon({size=18,color=GRAY_TEXT}) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>);
}
function MicIcon({size=18,color=GRAY_TEXT}) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>);
}
function XIcon({size=16,color=GRAY_TEXT}) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);
}
function EditIcon({size=16,color=ORANGE}) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>);
}
function ChevronIcon({size=16,color=GRAY_TEXT,dir="down"}) {
  const r = dir==="up"?180:0;
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{transform:`rotate(${r}deg)`,transition:"transform 0.2s"}}><polyline points="6 9 12 15 18 9"/></svg>);
}
function EvidenceIcon({size=22,color=GRAY_TEXT}) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>);
}

/* ─── TimePicker (iOS-safe, step=1 min) ─── */
function TimePicker({ hora, minuto, setHora, setMinuto, step=1 }) {
  const incH = () => { const h=(parseInt(hora||"0")+1)%24; setHora(String(h).padStart(2,"0")); };
  const decH = () => { const h=(parseInt(hora||"0")-1+24)%24; setHora(String(h).padStart(2,"0")); };
  const incM = () => { const m=(parseInt(minuto||"0")+step)%60; setMinuto(String(m).padStart(2,"0")); };
  const decM = () => { const m=(parseInt(minuto||"0")-step+60)%60; setMinuto(String(m).padStart(2,"0")); };
  const btn = {
    width:36,height:28,borderRadius:8,border:`1px solid ${GRAY_BORDER}`,
    background:GRAY_BG,color:GRAY_TEXT,fontSize:18,fontWeight:400,cursor:"pointer",
    display:"flex",alignItems:"center",justifyContent:"center",
    WebkitUserSelect:"none",userSelect:"none",
  };
  return (
    <div style={{display:"flex",alignItems:"center",gap:4}}>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
        <button onClick={incH} style={btn}>▲</button>
        <span style={{fontSize:32,fontWeight:300,color:DARK,width:48,textAlign:"center",lineHeight:1}}>{String(hora).padStart(2,"0")}</span>
        <button onClick={decH} style={btn}>▼</button>
      </div>
      <span style={{fontSize:32,fontWeight:300,color:DARK,marginBottom:2}}>:</span>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
        <button onClick={incM} style={btn}>▲</button>
        <span style={{fontSize:32,fontWeight:300,color:DARK,width:48,textAlign:"center",lineHeight:1}}>{String(minuto).padStart(2,"0")}</span>
        <button onClick={decM} style={btn}>▼</button>
      </div>
    </div>
  );
}

/* ─── Confirm Modal ─── */
function ConfirmModal({ title, message, onConfirm, onCancel, confirmText="Excluir", confirmColor=RED }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.35)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,animation:"fadeIn 0.15s ease",padding:20}} onClick={onCancel}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:16,padding:"24px 20px",width:"100%",maxWidth:320}}>
        <div style={{fontSize:17,fontWeight:600,color:DARK,marginBottom:8}}>{title}</div>
        <div style={{fontSize:14,color:GRAY_TEXT,marginBottom:20}}>{message}</div>
        <div style={{display:"flex",gap:12}}>
          <button onClick={onCancel} style={{flex:1,padding:"12px",borderRadius:12,background:GRAY_BG,color:DARK,fontSize:14,fontWeight:600,border:"none",cursor:"pointer"}}>Cancelar</button>
          <button onClick={onConfirm} style={{flex:1,padding:"12px",borderRadius:12,background:confirmColor,color:"#fff",fontSize:14,fontWeight:600,border:"none",cursor:"pointer"}}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════ */
/*  TELA INICIAL                                  */
/* ═══════════════════════════════════════════════ */
function TelaInicial({ onNavigate, tasks, onAddTask, tags }) {
  const [nome, setNome] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);
  const [hora, setHora] = useState("10");
  const [minuto, setMinuto] = useState("00");
  const [selectedTime, setSelectedTime] = useState("10:00");
  const [repetir, setRepetir] = useState(true);
  const [feedback, setFeedback] = useState(false);

  const quickTimes = ["09:00","10:00","12:30","14:00","16:30"];
  const nextTask = tasks.filter(t=>!t.done).sort((a,b)=>a.time.localeCompare(b.time))[0];

  const getMinutesUntil = (timeStr) => {
    const now=new Date(); const [h,m]=timeStr.split(":").map(Number);
    const target=new Date(); target.setHours(h,m,0);
    const diff=Math.round((target-now)/60000);
    if(diff<0) return "amanhã"; if(diff===0) return "agora";
    if(diff<60) return `em ${diff} min`;
    const hrs=Math.floor(diff/60); const mins=diff%60;
    return mins>0?`em ${hrs}h ${mins}min`:`em ${hrs}h`;
  };

  const handleCriar = () => {
    if(!nome.trim()) return;
    onAddTask({ id:Date.now(), name:nome, time:`${hora.padStart(2,"0")}:${minuto.padStart(2,"0")}`, tag:selectedTag, repeat:repetir, done:false, notified:false });
    setNome(""); setSelectedTag(null); setFeedback(true);
    setTimeout(()=>setFeedback(false),2000);
  };

  return (
    <div style={{background:"#fff",minHeight:"100%",display:"flex",flexDirection:"column"}}>
      {feedback && (
        <div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",background:DARK,color:"#fff",padding:"10px 24px",borderRadius:12,fontSize:14,fontWeight:500,zIndex:200,animation:"fadeIn 0.2s ease",boxShadow:"0 4px 20px rgba(0,0,0,0.2)"}}>✓ Lembrete criado!</div>
      )}

      <div style={{margin:"16px 20px 0",background:GRAY_BG,borderRadius:16,padding:"16px 20px"}}>
        <div style={{fontSize:11,fontWeight:600,color:GRAY_TEXT,letterSpacing:0.5,textTransform:"uppercase",marginBottom:4}}>Próxima tarefa</div>
        {nextTask ? (<>
          <div style={{display:"flex",alignItems:"baseline",gap:12}}>
            <span style={{fontSize:28,fontWeight:300,color:DARK}}>{nextTask.time}</span>
            <span style={{fontSize:16,color:DARK}}>{nextTask.name}</span>
          </div>
          <div style={{fontSize:13,color:ORANGE,marginTop:4}}>⏱ {getMinutesUntil(nextTask.time)}</div>
        </>) : (<span style={{fontSize:15,color:GRAY_TEXT}}>Nenhuma tarefa pendente</span>)}
      </div>

      <div style={{padding:"24px 20px 0"}}>
        <div style={{fontSize:13,fontWeight:600,color:ORANGE,letterSpacing:0.5,textTransform:"uppercase",marginBottom:8}}>Nova tarefa</div>
        <h2 style={{fontSize:24,fontWeight:500,color:DARK,margin:"0 0 16px"}}>O que precisa lembrar?</h2>

        <input value={nome} onChange={e=>setNome(e.target.value)} placeholder="Ex.: Conferência de caixa"
          style={{width:"100%",padding:"14px 16px",borderRadius:12,border:`1px solid ${GRAY_BORDER}`,color:DARK,background:"#fff",outline:"none",boxSizing:"border-box",marginBottom:12}}
          onFocus={e=>e.target.style.borderColor=ORANGE} onBlur={e=>e.target.style.borderColor=GRAY_BORDER}
        />

        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:24}}>
          {tags.map(tag=>(
            <button key={tag} onClick={()=>setSelectedTag(selectedTag===tag?null:tag)}
              style={{padding:"8px 16px",borderRadius:20,border:`1px solid ${selectedTag===tag?ORANGE:GRAY_BORDER}`,background:selectedTag===tag?ORANGE_LIGHT:"#fff",color:selectedTag===tag?ORANGE:DARK,fontSize:13,fontWeight:500,cursor:"pointer",transition:"all 0.15s"}}
            >{tag}</button>
          ))}
        </div>

        <div style={{fontSize:11,fontWeight:600,color:GRAY_TEXT,letterSpacing:0.5,textTransform:"uppercase",marginBottom:12}}>Horário</div>

        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginBottom:16}}>
          <AlarmIcon size={22}/>
          <TimePicker hora={hora} minuto={minuto} setHora={v=>{setHora(v);setSelectedTime("");}} setMinuto={v=>{setMinuto(v);setSelectedTime("");}} step={1}/>
          <ClockIcon size={22}/>
        </div>

        <div style={{display:"flex",gap:6,marginBottom:24,justifyContent:"center",flexWrap:"wrap"}}>
          {quickTimes.map(t=>(
            <button key={t} onClick={()=>{setHora(t.split(":")[0]);setMinuto(t.split(":")[1]);setSelectedTime(t);}}
              style={{padding:"6px 12px",borderRadius:16,border:`1.5px solid ${selectedTime===t?ORANGE:GRAY_BORDER}`,background:selectedTime===t?ORANGE:"transparent",color:selectedTime===t?"#fff":GRAY_TEXT,fontSize:13,fontWeight:500,cursor:"pointer",transition:"all 0.15s"}}
            >{t}</button>
          ))}
        </div>

        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <RepeatIcon size={18}/>
            <div>
              <div style={{fontSize:15,color:DARK,fontWeight:500}}>Repetir todos os dias</div>
              <div style={{fontSize:12,color:GRAY_TEXT}}>Tarefa fixa de rotina</div>
            </div>
          </div>
          <Toggle on={repetir} onToggle={()=>setRepetir(!repetir)}/>
        </div>
      </div>

      <div style={{flex:1}}/>
      <div style={{padding:"12px 20px 8px"}}>
        <button onClick={handleCriar} style={{width:"100%",padding:"16px",borderRadius:14,background:nome.trim()?ORANGE:GRAY_BG,color:nome.trim()?"#fff":GRAY_TEXT,fontSize:16,fontWeight:600,border:"none",cursor:nome.trim()?"pointer":"default",transition:"all 0.2s"}}>Criar lembrete</button>
      </div>
      <BottomNav active="home" onNavigate={onNavigate}/>
    </div>
  );
}

/* ═══════════════════════════════════════════════ */
/*  TELA TIMELINE                                 */
/* ═══════════════════════════════════════════════ */
function TelaTimeline({ onNavigate, tasks, onToggleTask, onDeleteTask, onAddTask, tags }) {
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const sorted = [...tasks].sort((a,b)=>a.time.localeCompare(b.time));

  return (
    <div style={{background:"#fff",minHeight:"100%",display:"flex",flexDirection:"column",position:"relative"}}>
      <div style={{padding:"16px 20px 12px"}}>
        <h1 style={{fontSize:22,fontWeight:600,color:DARK,margin:"0 0 4px"}}>Lembretes</h1>
        <p style={{fontSize:13,color:GRAY_TEXT,margin:0}}>Timeline do dia</p>
      </div>

      {confirmDelete && (
        <ConfirmModal title="Excluir tarefa?" message="Essa ação não pode ser desfeita." onConfirm={()=>{onDeleteTask(confirmDelete);setConfirmDelete(null);}} onCancel={()=>setConfirmDelete(null)}/>
      )}

      <div style={{flex:1,padding:"0 20px",overflowY:"auto"}}>
        {sorted.length===0 && (<div style={{textAlign:"center",padding:"40px 0",color:GRAY_TEXT,fontSize:15}}>Nenhum lembrete ainda.<br/><span style={{fontSize:13}}>Crie o primeiro na tela inicial.</span></div>)}
        {sorted.map((task,i)=>(
          <div key={task.id} style={{display:"flex",gap:16,position:"relative",animation:"slideIn 0.3s ease"}}>
            <div style={{width:50,textAlign:"right",paddingTop:14,flexShrink:0}}>
              <span style={{fontSize:14,color:GRAY_TEXT,fontWeight:500}}>{task.time}</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:20,flexShrink:0}}>
              <div style={{width:10,height:10,borderRadius:5,background:task.done?GREEN:ORANGE,marginTop:16,zIndex:1}}/>
              {i<sorted.length-1 && <div style={{width:2,flex:1,background:GRAY_BORDER,minHeight:40}}/>}
            </div>
            <div style={{flex:1,marginBottom:8,display:"flex",gap:8,alignItems:"stretch"}}>
              <div onClick={()=>onToggleTask(task.id)} style={{flex:1,padding:"14px 16px",background:task.done?"#FAFAF8":"#fff",borderRadius:12,border:`1px solid ${task.done?GRAY_BORDER:ORANGE+"40"}`,cursor:"pointer",transition:"all 0.2s",opacity:task.done?0.7:1}}>
                <span style={{fontSize:15,fontWeight:500,color:DARK,textDecoration:task.done?"line-through":"none"}}>{task.name}</span>
                {task.done && (<div style={{display:"flex",alignItems:"center",gap:4,marginTop:4}}><CheckIcon size={12}/><span style={{fontSize:12,color:GREEN}}>Concluída</span></div>)}
                {task.tag&&!task.done && (<div style={{marginTop:4}}><span style={{fontSize:11,color:ORANGE,background:ORANGE_LIGHT,padding:"2px 8px",borderRadius:8}}>{task.tag}</span></div>)}
              </div>
              <button onClick={()=>setConfirmDelete(task.id)} style={{width:40,borderRadius:12,background:"#FEF0EC",border:"1px solid #F5C4B3",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <TrashIcon size={16}/>
              </button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={()=>setShowModal(true)} style={{position:"absolute",bottom:80,right:20,width:52,height:52,borderRadius:26,background:ORANGE,border:"none",color:"#fff",fontSize:28,fontWeight:300,cursor:"pointer",boxShadow:"0 4px 14px rgba(232,116,12,0.35)",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>

      {showModal && <ModalNovaTarefa tags={tags} onClose={()=>setShowModal(false)} onAdd={t=>{onAddTask(t);setShowModal(false);}}/>}
      <BottomNav active="timeline" onNavigate={onNavigate}/>
    </div>
  );
}

/* ═══════════════════════════════════════════════ */
/*  TELA EVIDÊNCIAS                               */
/* ═══════════════════════════════════════════════ */
function TelaEvidencias({ onNavigate, evidencias, onAddEvidencia, onDeleteEvidencia, onUpdateEvidencia }) {
  const [showForm, setShowForm] = useState(false);
  const [editingEv, setEditingEv] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [viewingMedia, setViewingMedia] = useState(null);

  const handleEdit = (ev) => {
    setEditingEv({...ev, anexos:[...ev.anexos]});
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingEv(null);
  };

  const handleSave = (ev) => {
    if (editingEv) {
      onUpdateEvidencia(ev);
    } else {
      onAddEvidencia(ev);
    }
    handleCloseForm();
  };

  return (
    <div style={{background:"#fff",minHeight:"100%",display:"flex",flexDirection:"column",position:"relative"}}>
      <div style={{padding:"16px 20px 12px"}}>
        <h1 style={{fontSize:22,fontWeight:600,color:DARK,margin:"0 0 4px"}}>Evidências</h1>
        <p style={{fontSize:13,color:GRAY_TEXT,margin:0}}>Ocorrências e registros</p>
      </div>

      {confirmDelete && (
        <ConfirmModal title="Excluir evidência?" message="Todos os arquivos anexados serão perdidos." onConfirm={()=>{onDeleteEvidencia(confirmDelete);setConfirmDelete(null);setExpandedId(null);}} onCancel={()=>setConfirmDelete(null)}/>
      )}

      {/* Media Viewer - fullscreen */}
      {viewingMedia && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",zIndex:300,display:"flex",flexDirection:"column",animation:"fadeIn 0.2s ease"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 20px",flexShrink:0}}>
            <span style={{color:"#fff",fontSize:14,fontWeight:500,maxWidth:"70%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{viewingMedia.name}</span>
            <button onClick={()=>setViewingMedia(null)} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:20,width:36,height:36,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <XIcon size={18} color="#fff"/>
            </button>
          </div>
          <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 16px 40px",overflow:"auto"}}>
            {viewingMedia.type.startsWith("image") && (
              <img src={viewingMedia.url} alt={viewingMedia.name} style={{maxWidth:"100%",maxHeight:"100%",borderRadius:8,objectFit:"contain"}}/>
            )}
            {viewingMedia.type.startsWith("video") && (
              <video controls autoPlay playsInline src={viewingMedia.url} style={{maxWidth:"100%",maxHeight:"100%",borderRadius:8}}/>
            )}
            {viewingMedia.type.startsWith("audio") && (
              <div style={{background:"rgba(255,255,255,0.1)",borderRadius:16,padding:"32px 24px",display:"flex",flexDirection:"column",alignItems:"center",gap:16,width:"100%",maxWidth:320}}>
                <span style={{fontSize:48}}>🎵</span>
                <span style={{color:"#fff",fontSize:15,fontWeight:500,textAlign:"center"}}>{viewingMedia.name}</span>
                <audio controls autoPlay src={viewingMedia.url} style={{width:"100%"}}/>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{flex:1,padding:"0 20px",overflowY:"auto"}}>
        {evidencias.length===0 && (<div style={{textAlign:"center",padding:"40px 0",color:GRAY_TEXT,fontSize:15}}>Nenhuma evidência registrada.<br/><span style={{fontSize:13}}>Toque no + para criar.</span></div>)}

        {evidencias.map(ev=>(
          <div key={ev.id} style={{marginBottom:12,border:`1px solid ${ev.ocorrenciaAberta?ORANGE+"40":GRAY_BORDER}`,borderRadius:14,overflow:"hidden",animation:"slideIn 0.3s ease"}}>
            <div onClick={()=>setExpandedId(expandedId===ev.id?null:ev.id)} style={{padding:"14px 16px",background:ev.ocorrenciaAberta?ORANGE_LIGHT:"#FAFAF8",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div style={{flex:1}}>
                <div style={{fontSize:15,fontWeight:600,color:DARK,marginBottom:4}}>{ev.problema}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:8,fontSize:12}}>
                  <span style={{color:GRAY_TEXT}}>{ev.data}</span>
                  {ev.ocorrenciaAberta && (
                    <span style={{background:ORANGE,color:"#fff",padding:"1px 8px",borderRadius:8,fontSize:11,fontWeight:500}}>Ocorrência #{ev.numeroOcorrencia}</span>
                  )}
                </div>
                {ev.anexos.length>0 && (<div style={{fontSize:11,color:GRAY_TEXT,marginTop:4}}>📎 {ev.anexos.length} anexo{ev.anexos.length>1?"s":""}</div>)}
              </div>
              <ChevronIcon size={16} color={GRAY_TEXT} dir={expandedId===ev.id?"up":"down"}/>
            </div>

            {expandedId===ev.id && (
              <div style={{padding:"0 16px 16px",background:"#fff"}}>
                {ev.descricao && (<div style={{padding:"12px 0",fontSize:14,color:DARK,lineHeight:1.6,borderBottom:`1px solid ${GRAY_BORDER}`}}>{ev.descricao}</div>)}
                {ev.anexos.length>0 && (
                  <div style={{padding:"12px 0"}}>
                    <div style={{fontSize:11,fontWeight:600,color:GRAY_TEXT,textTransform:"uppercase",letterSpacing:0.5,marginBottom:8}}>Anexos — toque para abrir</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                      {ev.anexos.map((anexo,i)=>(
                        <div key={i} onClick={()=>setViewingMedia(anexo)} style={{borderRadius:10,overflow:"hidden",border:`1px solid ${GRAY_BORDER}`,cursor:"pointer",position:"relative"}}>
                          {anexo.type.startsWith("image") ? (
                            <div style={{position:"relative"}}>
                              <img src={anexo.url} alt={anexo.name} style={{width:80,height:80,objectFit:"cover",display:"block"}}/>
                              <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.08)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                                <div style={{width:24,height:24,borderRadius:12,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                                </div>
                              </div>
                            </div>
                          ) : anexo.type.startsWith("video") ? (
                            <div style={{width:80,height:80,background:GRAY_BG,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:2}}>
                              <div style={{width:28,height:28,borderRadius:14,background:ORANGE,display:"flex",alignItems:"center",justifyContent:"center"}}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                              </div>
                              <span style={{fontSize:9,color:GRAY_TEXT,maxWidth:70,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{anexo.name}</span>
                            </div>
                          ) : anexo.type.startsWith("audio") ? (
                            <div style={{padding:"8px 12px",background:GRAY_BG,display:"flex",alignItems:"center",gap:8,minWidth:140}}>
                              <div style={{width:28,height:28,borderRadius:14,background:ORANGE,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                              </div>
                              <div>
                                <div style={{fontSize:11,color:DARK,fontWeight:500,maxWidth:90,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{anexo.name}</div>
                                <div style={{fontSize:10,color:GRAY_TEXT}}>Toque para ouvir</div>
                              </div>
                            </div>
                          ) : (
                            <div style={{padding:"8px 12px",background:GRAY_BG,display:"flex",alignItems:"center",gap:6}}>
                              <FileIcon size={14}/><span style={{fontSize:11,color:DARK,maxWidth:80,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{anexo.name}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{display:"flex",gap:8,marginTop:8}}>
                  <button onClick={()=>handleEdit(ev)} style={{flex:1,padding:"10px",borderRadius:10,background:ORANGE_LIGHT,border:`1px solid ${ORANGE}40`,color:ORANGE,fontSize:13,fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                    <EditIcon size={14}/> Editar
                  </button>
                  <button onClick={()=>setConfirmDelete(ev.id)} style={{flex:1,padding:"10px",borderRadius:10,background:"#FEF0EC",border:"1px solid #F5C4B3",color:RED,fontSize:13,fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                    <TrashIcon size={14}/> Excluir
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button onClick={()=>{setEditingEv(null);setShowForm(true);}} style={{position:"absolute",bottom:80,right:20,width:52,height:52,borderRadius:26,background:ORANGE,border:"none",color:"#fff",fontSize:28,fontWeight:300,cursor:"pointer",boxShadow:"0 4px 14px rgba(232,116,12,0.35)",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>

      {showForm && <ModalEvidencia existing={editingEv} onClose={handleCloseForm} onSave={handleSave}/>}
      <BottomNav active="evidencias" onNavigate={onNavigate}/>
    </div>
  );
}

/* ─── Modal Evidência (criar + editar) ─── */
function ModalEvidencia({ existing, onClose, onSave }) {
  const isEdit = !!existing;
  const [problema, setProblema] = useState(existing?.problema || "");
  const [descricao, setDescricao] = useState(existing?.descricao || "");
  const [ocorrenciaAberta, setOcorrenciaAberta] = useState(existing?.ocorrenciaAberta || false);
  const [numeroOcorrencia, setNumeroOcorrencia] = useState(existing?.numeroOcorrencia || "");
  const [data, setData] = useState(existing ? existing.data.split("/").reverse().join("-") : new Date().toISOString().split("T")[0]);
  const [anexos, setAnexos] = useState(existing?.anexos || []);
  const fileRef = useRef(null);

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => { setAnexos(prev => [...prev, { name:file.name, type:file.type, url:ev.target.result }]); };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeAnexo = (i) => setAnexos(prev => prev.filter((_,idx) => idx !== i));

  const handleSave = () => {
    if (!problema.trim()) return;
    onSave({
      id: existing?.id || Date.now(),
      problema,
      descricao,
      ocorrenciaAberta,
      numeroOcorrencia: ocorrenciaAberta ? numeroOcorrencia : "",
      data: data.split("-").reverse().join("/"),
      anexos,
    });
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.35)",display:"flex",alignItems:"flex-end",zIndex:100,animation:"fadeIn 0.2s ease"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxHeight:"92vh",background:"#fff",borderRadius:"24px 24px 0 0",padding:"24px 20px 32px",animation:"slideUp 0.3s ease",overflowY:"auto"}}>
        <h3 style={{fontSize:20,fontWeight:600,color:DARK,margin:"0 0 20px"}}>{isEdit ? "Editar evidência" : "Nova evidência"}</h3>

        <label style={{fontSize:11,fontWeight:600,color:GRAY_TEXT,letterSpacing:0.5,textTransform:"uppercase"}}>Problema *</label>
        <input value={problema} onChange={e=>setProblema(e.target.value)} placeholder="Descreva o problema"
          style={{width:"100%",padding:"14px 16px",borderRadius:12,border:`1px solid ${GRAY_BORDER}`,color:DARK,background:"#fff",outline:"none",boxSizing:"border-box",margin:"8px 0 16px"}}
          onFocus={e=>e.target.style.borderColor=ORANGE} onBlur={e=>e.target.style.borderColor=GRAY_BORDER}
        />

        <label style={{fontSize:11,fontWeight:600,color:GRAY_TEXT,letterSpacing:0.5,textTransform:"uppercase"}}>Descrição</label>
        <textarea value={descricao} onChange={e=>setDescricao(e.target.value)} placeholder="Detalhes da ocorrência, contexto, observações..." rows={3}
          style={{width:"100%",padding:"14px 16px",borderRadius:12,border:`1px solid ${GRAY_BORDER}`,color:DARK,background:"#fff",outline:"none",boxSizing:"border-box",margin:"8px 0 16px",resize:"vertical",lineHeight:1.5}}
          onFocus={e=>e.target.style.borderColor=ORANGE} onBlur={e=>e.target.style.borderColor=GRAY_BORDER}
        />

        <label style={{fontSize:11,fontWeight:600,color:GRAY_TEXT,letterSpacing:0.5,textTransform:"uppercase"}}>Data</label>
        <input type="date" value={data} onChange={e=>setData(e.target.value)}
          style={{width:"100%",padding:"14px 16px",borderRadius:12,border:`1px solid ${GRAY_BORDER}`,color:DARK,background:"#fff",outline:"none",boxSizing:"border-box",margin:"8px 0 16px"}}
        />

        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:ocorrenciaAberta?12:16}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <EvidenceIcon size={18} color={GRAY_TEXT}/>
            <span style={{fontSize:15,color:DARK}}>Ocorrência aberta?</span>
          </div>
          <Toggle on={ocorrenciaAberta} onToggle={()=>setOcorrenciaAberta(!ocorrenciaAberta)}/>
        </div>

        {ocorrenciaAberta && (
          <div style={{marginBottom:16}}>
            <label style={{fontSize:11,fontWeight:600,color:GRAY_TEXT,letterSpacing:0.5,textTransform:"uppercase"}}>Número da ocorrência</label>
            <input value={numeroOcorrencia} onChange={e=>setNumeroOcorrencia(e.target.value)} placeholder="Ex.: 12345"
              style={{width:"100%",padding:"14px 16px",borderRadius:12,border:`1px solid ${GRAY_BORDER}`,color:DARK,background:"#fff",outline:"none",boxSizing:"border-box",marginTop:8}}
              onFocus={e=>e.target.style.borderColor=ORANGE} onBlur={e=>e.target.style.borderColor=GRAY_BORDER}
            />
          </div>
        )}

        <label style={{fontSize:11,fontWeight:600,color:GRAY_TEXT,letterSpacing:0.5,textTransform:"uppercase"}}>Anexos</label>
        <div style={{display:"flex",gap:8,margin:"8px 0",flexWrap:"wrap"}}>
          <button onClick={()=>{fileRef.current.accept="image/*";fileRef.current.capture="environment";fileRef.current.click();}}
            style={{padding:"10px 14px",borderRadius:10,border:`1px solid ${GRAY_BORDER}`,background:GRAY_BG,cursor:"pointer",display:"flex",alignItems:"center",gap:6,fontSize:13,color:DARK}}>
            <CameraIcon size={16}/> Foto
          </button>
          <button onClick={()=>{fileRef.current.accept="video/*";fileRef.current.removeAttribute("capture");fileRef.current.click();}}
            style={{padding:"10px 14px",borderRadius:10,border:`1px solid ${GRAY_BORDER}`,background:GRAY_BG,cursor:"pointer",display:"flex",alignItems:"center",gap:6,fontSize:13,color:DARK}}>
            <span style={{fontSize:14}}>🎬</span> Vídeo
          </button>
          <button onClick={()=>{fileRef.current.accept="audio/*";fileRef.current.removeAttribute("capture");fileRef.current.click();}}
            style={{padding:"10px 14px",borderRadius:10,border:`1px solid ${GRAY_BORDER}`,background:GRAY_BG,cursor:"pointer",display:"flex",alignItems:"center",gap:6,fontSize:13,color:DARK}}>
            <MicIcon size={16}/> Áudio
          </button>
          <button onClick={()=>{fileRef.current.accept="*/*";fileRef.current.removeAttribute("capture");fileRef.current.click();}}
            style={{padding:"10px 14px",borderRadius:10,border:`1px solid ${GRAY_BORDER}`,background:GRAY_BG,cursor:"pointer",display:"flex",alignItems:"center",gap:6,fontSize:13,color:DARK}}>
            <FileIcon size={16}/> Arquivo
          </button>
        </div>
        <input ref={fileRef} type="file" multiple onChange={handleFiles} style={{display:"none"}}/>

        {anexos.length>0 && (
          <div style={{display:"flex",flexWrap:"wrap",gap:8,margin:"8px 0 16px"}}>
            {anexos.map((a,i)=>(
              <div key={i} style={{position:"relative",borderRadius:8,overflow:"hidden",border:`1px solid ${GRAY_BORDER}`}}>
                {a.type.startsWith("image") ? (
                  <img src={a.url} alt="" style={{width:64,height:64,objectFit:"cover",display:"block"}}/>
                ) : (
                  <div style={{width:64,height:64,background:GRAY_BG,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:GRAY_TEXT,textAlign:"center",padding:4,flexDirection:"column"}}>
                    <span>{a.type.startsWith("audio")?"🎵":a.type.startsWith("video")?"🎬":"📄"}</span>
                    <span style={{maxWidth:56,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.name.slice(0,10)}</span>
                  </div>
                )}
                <button onClick={()=>removeAnexo(i)} style={{position:"absolute",top:2,right:2,width:18,height:18,borderRadius:9,background:"rgba(0,0,0,0.6)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0}}>
                  <XIcon size={10} color="#fff"/>
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{display:"flex",gap:12,marginTop:8}}>
          <button onClick={onClose} style={{flex:1,padding:"14px",borderRadius:14,background:"transparent",color:DARK,fontSize:15,fontWeight:600,border:"none",cursor:"pointer"}}>Cancelar</button>
          <button onClick={handleSave} style={{flex:1,padding:"14px",borderRadius:14,background:problema.trim()?ORANGE:GRAY_BG,color:problema.trim()?"#fff":GRAY_TEXT,fontSize:15,fontWeight:600,border:"none",cursor:problema.trim()?"pointer":"default",transition:"all 0.2s"}}>{isEdit ? "Salvar" : "Criar evidência"}</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════ */
/*  TELA CONFIG                                   */
/* ═══════════════════════════════════════════════ */
function TelaConfig({ onNavigate, settings, onUpdateSettings, tasks, onClearDone, tags, onUpdateTags }) {
  const [newTag, setNewTag] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const doneCount = tasks.filter(t=>t.done).length;
  const totalCount = tasks.length;
  const notifPermission = "Notification" in window ? Notification.permission : "denied";

  const handleRequestNotif = () => {
    if("Notification" in window) Notification.requestPermission().then(p=>{
      if(p==="granted"){ onUpdateSettings({...settings,notifications:true}); sendNotification("Task Orange","Notificações ativadas!"); }
    });
  };

  const addTag = () => { const t=newTag.trim(); if(t&&!tags.includes(t)){onUpdateTags([...tags,t]);setNewTag("");} };
  const removeTag = (tag) => onUpdateTags(tags.filter(t=>t!==tag));

  return (
    <div style={{background:"#fff",minHeight:"100%",display:"flex",flexDirection:"column"}}>
      <div style={{padding:"16px 20px 12px"}}>
        <h1 style={{fontSize:22,fontWeight:600,color:DARK,margin:"0 0 4px"}}>Configurações</h1>
        <p style={{fontSize:13,color:GRAY_TEXT,margin:0}}>Personalize seu app</p>
      </div>

      <div style={{padding:"8px 20px",flex:1,overflowY:"auto"}}>
        <div style={{background:GRAY_BG,borderRadius:16,padding:"16px 20px",marginBottom:24}}>
          <div style={{fontSize:11,fontWeight:600,color:GRAY_TEXT,letterSpacing:0.5,textTransform:"uppercase",marginBottom:10}}>Resumo do dia</div>
          <div style={{display:"flex",gap:16}}>
            <div style={{flex:1,textAlign:"center"}}><div style={{fontSize:28,fontWeight:300,color:DARK}}>{totalCount}</div><div style={{fontSize:12,color:GRAY_TEXT}}>Total</div></div>
            <div style={{width:1,background:GRAY_BORDER}}/>
            <div style={{flex:1,textAlign:"center"}}><div style={{fontSize:28,fontWeight:300,color:GREEN}}>{doneCount}</div><div style={{fontSize:12,color:GRAY_TEXT}}>Concluídas</div></div>
            <div style={{width:1,background:GRAY_BORDER}}/>
            <div style={{flex:1,textAlign:"center"}}><div style={{fontSize:28,fontWeight:300,color:ORANGE}}>{totalCount-doneCount}</div><div style={{fontSize:12,color:GRAY_TEXT}}>Pendentes</div></div>
          </div>
        </div>

        <div style={{fontSize:11,fontWeight:600,color:GRAY_TEXT,letterSpacing:0.5,textTransform:"uppercase",marginBottom:12}}>Categorias / Tags</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:12}}>
          {tags.map(tag=>(
            <div key={tag} style={{display:"flex",alignItems:"center",gap:4,padding:"6px 10px 6px 14px",borderRadius:20,background:ORANGE_LIGHT,border:`1px solid ${ORANGE}40`}}>
              <span style={{fontSize:13,color:ORANGE,fontWeight:500}}>{tag}</span>
              <button onClick={()=>removeTag(tag)} style={{background:"none",border:"none",cursor:"pointer",padding:2,display:"flex"}}><XIcon size={12} color={ORANGE}/></button>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:8,marginBottom:24}}>
          <input value={newTag} onChange={e=>setNewTag(e.target.value)} placeholder="Nova categoria..."
            onKeyDown={e=>{if(e.key==="Enter") addTag();}}
            style={{flex:1,padding:"10px 14px",borderRadius:10,border:`1px solid ${GRAY_BORDER}`,color:DARK,background:"#fff",outline:"none",boxSizing:"border-box"}}
            onFocus={e=>e.target.style.borderColor=ORANGE} onBlur={e=>e.target.style.borderColor=GRAY_BORDER}
          />
          <button onClick={addTag} style={{padding:"10px 16px",borderRadius:10,background:ORANGE,color:"#fff",border:"none",cursor:"pointer",fontWeight:600,fontSize:13}}>Adicionar</button>
        </div>

        <div style={{fontSize:11,fontWeight:600,color:GRAY_TEXT,letterSpacing:0.5,textTransform:"uppercase",marginBottom:12}}>Notificações</div>
        <div style={{display:"flex",flexDirection:"column",gap:16,marginBottom:24}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <BellIcon size={18}/>
              <div><div style={{fontSize:15,color:DARK,fontWeight:500}}>Notificações</div><div style={{fontSize:12,color:GRAY_TEXT}}>{notifPermission==="granted"?"Ativadas":notifPermission==="denied"?"Bloqueadas":"Desativadas"}</div></div>
            </div>
            {notifPermission==="granted" ? (<Toggle on={settings.notifications} onToggle={()=>onUpdateSettings({...settings,notifications:!settings.notifications})}/>) : (
              <button onClick={handleRequestNotif} style={{padding:"6px 14px",borderRadius:10,background:ORANGE,color:"#fff",fontSize:12,fontWeight:600,border:"none",cursor:"pointer"}}>Ativar</button>
            )}
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <VolumeIcon size={18}/>
              <div><div style={{fontSize:15,color:DARK,fontWeight:500}}>Vibrar ao notificar</div><div style={{fontSize:12,color:GRAY_TEXT}}>Vibração no celular</div></div>
            </div>
            <Toggle on={settings.sound} onToggle={()=>onUpdateSettings({...settings,sound:!settings.sound})}/>
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <AlarmIcon size={18} color={GRAY_TEXT}/>
              <div><div style={{fontSize:15,color:DARK,fontWeight:500}}>Antecedência</div><div style={{fontSize:12,color:GRAY_TEXT}}>Avisar antes</div></div>
            </div>
            <div style={{display:"flex",gap:4}}>
              {[0,5,10,15].map(m=>(
                <button key={m} onClick={()=>onUpdateSettings({...settings,antecedencia:m})}
                  style={{padding:"5px 10px",borderRadius:10,border:`1.5px solid ${settings.antecedencia===m?ORANGE:GRAY_BORDER}`,background:settings.antecedencia===m?ORANGE:"transparent",color:settings.antecedencia===m?"#fff":GRAY_TEXT,fontSize:12,fontWeight:500,cursor:"pointer"}}
                >{m===0?"Na hora":`${m}min`}</button>
              ))}
            </div>
          </div>
        </div>

        <div style={{fontSize:11,fontWeight:600,color:GRAY_TEXT,letterSpacing:0.5,textTransform:"uppercase",marginBottom:12}}>Ações</div>
        {doneCount>0 && (
          <button onClick={()=>setConfirmClear(true)} style={{width:"100%",padding:"14px 16px",borderRadius:12,background:"#FEF0EC",border:"1px solid #F5C4B3",color:RED,fontSize:14,fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
            <TrashIcon size={16}/> Limpar {doneCount} tarefa{doneCount>1?"s":""} concluída{doneCount>1?"s":""}
          </button>
        )}
        {confirmClear && <ConfirmModal title="Limpar concluídas?" message={`${doneCount} tarefa${doneCount>1?"s":""} será${doneCount>1?"ão":""} removida${doneCount>1?"s":""}.`} onConfirm={()=>{onClearDone();setConfirmClear(false);}} onCancel={()=>setConfirmClear(false)}/>}
      </div>
      <BottomNav active="config" onNavigate={onNavigate}/>
    </div>
  );
}

/* ═══════════════════════════════════════════════ */
/*  MODAL NOVA TAREFA                             */
/* ═══════════════════════════════════════════════ */
function ModalNovaTarefa({ onClose, onAdd, tags }) {
  const [nome, setNome] = useState("");
  const [hora, setHora] = useState("10");
  const [minuto, setMinuto] = useState("30");
  const [repetir, setRepetir] = useState(false);

  const handleCriar = () => {
    if(!nome.trim()) return;
    onAdd({ id:Date.now(), name:nome, time:`${hora.padStart(2,"0")}:${minuto.padStart(2,"0")}`, tag:null, repeat:repetir, done:false, notified:false });
  };

  return (
    <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.35)",display:"flex",alignItems:"flex-end",zIndex:100,animation:"fadeIn 0.2s ease"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{width:"100%",background:"#fff",borderRadius:"24px 24px 0 0",padding:"24px 20px 32px",animation:"slideUp 0.3s ease"}}>
        <h3 style={{fontSize:20,fontWeight:600,color:DARK,margin:"0 0 20px"}}>Nova tarefa</h3>

        <label style={{fontSize:11,fontWeight:600,color:GRAY_TEXT,letterSpacing:0.5,textTransform:"uppercase"}}>Nome</label>
        <input value={nome} onChange={e=>setNome(e.target.value)} placeholder="Ex.: Conferência de caixa"
          style={{width:"100%",padding:"14px 16px",borderRadius:12,border:`1px solid ${GRAY_BORDER}`,color:DARK,background:"#fff",outline:"none",boxSizing:"border-box",margin:"8px 0 16px"}}
          onFocus={e=>e.target.style.borderColor=ORANGE} onBlur={e=>e.target.style.borderColor=GRAY_BORDER} autoFocus
        />

        <label style={{fontSize:11,fontWeight:600,color:GRAY_TEXT,letterSpacing:0.5,textTransform:"uppercase"}}>Horário</label>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",margin:"8px 0 16px",padding:"8px 0"}}>
          <TimePicker hora={hora} minuto={minuto} setHora={setHora} setMinuto={setMinuto} step={1}/>
        </div>

        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <RepeatIcon size={16}/>
            <span style={{fontSize:15,color:DARK}}>Repetir todos os dias</span>
          </div>
          <Toggle on={repetir} onToggle={()=>setRepetir(!repetir)}/>
        </div>

        <div style={{display:"flex",gap:12}}>
          <button onClick={onClose} style={{flex:1,padding:"14px",borderRadius:14,background:"transparent",color:DARK,fontSize:15,fontWeight:600,border:"none",cursor:"pointer"}}>Cancelar</button>
          <button onClick={handleCriar} style={{flex:1,padding:"14px",borderRadius:14,background:nome.trim()?ORANGE:GRAY_BG,color:nome.trim()?"#fff":GRAY_TEXT,fontSize:15,fontWeight:600,border:"none",cursor:nome.trim()?"pointer":"default",transition:"all 0.2s"}}>Criar tarefa</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Bottom Navigation ─── */
function BottomNav({ active, onNavigate }) {
  const items = [
    { key:"home", label:"Início", icon:(c,a)=>(
      <svg width="22" height="22" viewBox="0 0 24 24" fill={a?ORANGE:"none"} stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
    )},
    { key:"timeline", label:"Timeline", icon:(c,a)=>(
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><line x1="12" y1="2" x2="12" y2="22"/><circle cx="12" cy="6" r="2" fill={a?ORANGE:"none"}/><circle cx="12" cy="12" r="2" fill={a?ORANGE:"none"}/><circle cx="12" cy="18" r="2" fill={a?ORANGE:"none"}/><line x1="14" y1="6" x2="20" y2="6"/><line x1="14" y1="12" x2="20" y2="12"/><line x1="14" y1="18" x2="20" y2="18"/></svg>
    )},
    { key:"evidencias", label:"Evidências", icon:(c)=>(<EvidenceIcon size={22} color={c}/>)},
    { key:"config", label:"Config", icon:(c)=>(
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
    )},
  ];

  return (
    <div style={{display:"flex",justifyContent:"space-around",padding:"10px 0 env(safe-area-inset-bottom, 20px)",borderTop:`1px solid ${GRAY_BORDER}`,background:"#fff",flexShrink:0}}>
      {items.map(item=>{
        const isActive = active===item.key;
        const color = isActive?ORANGE:GRAY_TEXT;
        return (
          <button key={item.key} onClick={()=>onNavigate(item.key)}
            style={{background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,flex:1,padding:"4px 0"}}>
            {item.icon(color,isActive)}
            <span style={{fontSize:9,color,fontWeight:600}}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════ */
/*  APP PRINCIPAL                                 */
/* ═══════════════════════════════════════════════ */
export default function TaskOrange() {
  const [screen, setScreen] = useState("home");
  const [tasks, setTasks] = useState(()=>load("task-orange-tasks",[]));
  const [settings, setSettings] = useState(()=>load("task-orange-settings",{notifications:true,sound:true,antecedencia:5}));
  const [tags, setTags] = useState(()=>load("task-orange-tags",DEFAULT_TAGS));
  const [evidencias, setEvidencias] = useState(()=>load("task-orange-evidencias",[]));

  useEffect(()=>{ save("task-orange-tasks",tasks); },[tasks]);
  useEffect(()=>{ save("task-orange-settings",settings); },[settings]);
  useEffect(()=>{ save("task-orange-tags",tags); },[tags]);
  useEffect(()=>{ save("task-orange-evidencias",evidencias); },[evidencias]);
  useEffect(()=>{ requestNotificationPermission(); },[]);

  useEffect(()=>{
    if(!settings.notifications) return;
    const check = () => {
      const now=new Date(); const cH=now.getHours(); const cM=now.getMinutes();
      setTasks(prev=>prev.map(task=>{
        if(task.done||task.notified) return task;
        const [tH,tM]=task.time.split(":").map(Number);
        const diff=(tH*60+tM)-(cH*60+cM);
        if(diff===settings.antecedencia||(settings.antecedencia===0&&diff===0)){
          sendNotification("Task Orange",settings.antecedencia>0?`"${task.name}" começa em ${settings.antecedencia} min`:`"${task.name}" — é agora!`);
          if(settings.sound&&navigator.vibrate) navigator.vibrate([200,100,200]);
          return {...task,notified:true};
        }
        return task;
      }));
    };
    check(); const i=setInterval(check,30000); return ()=>clearInterval(i);
  },[settings.notifications,settings.antecedencia,settings.sound]);

  useEffect(()=>{
    const i=setInterval(()=>{
      const now=new Date();
      if(now.getHours()===0&&now.getMinutes()===0)
        setTasks(prev=>prev.map(t=>({...t,notified:false,done:t.repeat?false:t.done})));
    },60000);
    return ()=>clearInterval(i);
  },[]);

  const addTask = t=>setTasks(p=>[...p,t]);
  const toggleTask = id=>setTasks(p=>p.map(t=>t.id===id?{...t,done:!t.done}:t));
  const deleteTask = id=>setTasks(p=>p.filter(t=>t.id!==id));
  const clearDone = ()=>setTasks(p=>p.filter(t=>!t.done));
  const addEvidencia = ev=>setEvidencias(p=>[ev,...p]);
  const deleteEvidencia = id=>setEvidencias(p=>p.filter(e=>e.id!==id));
  const updateEvidencia = ev=>setEvidencias(p=>p.map(e=>e.id===ev.id?ev:e));

  return (
    <div style={{maxWidth:430,margin:"0 auto",height:"100dvh",background:"#fff",position:"relative",overflow:"hidden"}}>
      <GlobalStyles/>
      {screen==="home" && <div style={{height:"100%",overflowY:"auto"}}><TelaInicial onNavigate={setScreen} tasks={tasks} onAddTask={addTask} tags={tags}/></div>}
      {screen==="timeline" && <div style={{height:"100%",display:"flex",flexDirection:"column"}}><TelaTimeline onNavigate={setScreen} tasks={tasks} onToggleTask={toggleTask} onDeleteTask={deleteTask} onAddTask={addTask} tags={tags}/></div>}
      {screen==="evidencias" && <div style={{height:"100%",display:"flex",flexDirection:"column"}}><TelaEvidencias onNavigate={setScreen} evidencias={evidencias} onAddEvidencia={addEvidencia} onDeleteEvidencia={deleteEvidencia} onUpdateEvidencia={updateEvidencia}/></div>}
      {screen==="config" && <div style={{height:"100%",overflowY:"auto"}}><TelaConfig onNavigate={setScreen} settings={settings} onUpdateSettings={setSettings} tasks={tasks} onClearDone={clearDone} tags={tags} onUpdateTags={setTags}/></div>}
    </div>
  );
}
