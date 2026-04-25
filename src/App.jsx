import { useState, useEffect, useCallback } from "react";

const ORANGE = "#E8740C";
const ORANGE_LIGHT = "#FFF3E8";
const GRAY_BG = "#F5F3F0";
const GRAY_BORDER = "#E0DCD7";
const GRAY_TEXT = "#8A8580";
const DARK = "#1A1714";

/* ─── Persistence ─── */
function loadTasks() {
  try {
    const saved = localStorage.getItem("task-orange-tasks");
    if (saved) return JSON.parse(saved);
  } catch {}
  return [];
}
function saveTasks(tasks) {
  try { localStorage.setItem("task-orange-tasks", JSON.stringify(tasks)); } catch {}
}
function loadSettings() {
  try {
    const saved = localStorage.getItem("task-orange-settings");
    if (saved) return JSON.parse(saved);
  } catch {}
  return { notifications: true, sound: true, antecedencia: 5 };
}
function saveSettings(s) {
  try { localStorage.setItem("task-orange-settings", JSON.stringify(s)); } catch {}
}

/* ─── Notifications ─── */
function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}
function sendNotification(title, body) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body, icon: "/icon-192.png", badge: "/icon-192.png" });
  }
}

/* ─── Global Styles ─── */
function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
      @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
      @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
      @keyframes slideIn { from { opacity:0; transform: translateX(20px) } to { opacity:1; transform: translateX(0) } }
      * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
      input::placeholder { color: #BBB7B2; }
      body { overscroll-behavior: none; }
      ::-webkit-scrollbar { display: none; }
    `}</style>
  );
}

/* ─── Toggle Switch ─── */
function Toggle({ on, onToggle }) {
  return (
    <div onClick={onToggle} style={{
      width: 48, height: 28, borderRadius: 14,
      background: on ? ORANGE : "#D4D0CC",
      position: "relative", cursor: "pointer",
      transition: "background 0.2s", flexShrink: 0,
    }}>
      <div style={{
        width: 24, height: 24, borderRadius: 12, background: "#fff",
        position: "absolute", top: 2, left: on ? 22 : 2,
        transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
      }} />
    </div>
  );
}

/* ─── Icons ─── */
function ClockIcon({ size = 18, color = GRAY_TEXT }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function AlarmIcon({ size = 18, color = ORANGE }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="13" r="8" /><polyline points="12 9 12 13 15 15" />
      <line x1="5" y1="3" x2="2" y2="6" /><line x1="19" y1="3" x2="22" y2="6" />
    </svg>
  );
}

function RepeatIcon({ size = 18, color = GRAY_TEXT }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

function CheckIcon({ size = 14, color = "#6B9B5E" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function TrashIcon({ size = 18, color = "#D85A30" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function BellIcon({ size = 18, color = GRAY_TEXT }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function VolumeIcon({ size = 18, color = GRAY_TEXT }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function ClockSettingIcon({ size = 18, color = GRAY_TEXT }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      <circle cx="19" cy="19" r="4" fill="var(--bg, #fff)" stroke={color} strokeWidth="1.5"/>
      <text x="19" y="20.5" textAnchor="middle" fill={color} fontSize="7" fontWeight="600" fontFamily="sans-serif">5</text>
    </svg>
  );
}

/* ═══════════════════════════════════════════════ */
/*  TELA INICIAL                                  */
/* ═══════════════════════════════════════════════ */
function TelaInicial({ onNavigate, tasks, onAddTask }) {
  const [nome, setNome] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);
  const [hora, setHora] = useState("10");
  const [minuto, setMinuto] = useState("00");
  const [selectedTime, setSelectedTime] = useState("10:00");
  const [repetir, setRepetir] = useState(true);
  const [feedback, setFeedback] = useState(false);

  const tags = ["Recolhimento", "Eventuais", "Reunião", "Painel CEI"];
  const quickTimes = ["09:00", "10:00", "12:30", "14:00", "16:30"];

  const nextTask = tasks.filter(t => !t.done).sort((a, b) => a.time.localeCompare(b.time))[0];

  const getMinutesUntil = (timeStr) => {
    const now = new Date();
    const [h, m] = timeStr.split(":").map(Number);
    const target = new Date();
    target.setHours(h, m, 0);
    const diff = Math.round((target - now) / 60000);
    if (diff < 0) return "amanhã";
    if (diff === 0) return "agora";
    if (diff < 60) return `em ${diff} min`;
    const hrs = Math.floor(diff / 60);
    const mins = diff % 60;
    return mins > 0 ? `em ${hrs}h ${mins}min` : `em ${hrs}h`;
  };

  const handleCriar = () => {
    if (!nome.trim()) return;
    onAddTask({
      id: Date.now(),
      name: nome,
      time: `${hora.padStart(2, "0")}:${minuto.padStart(2, "0")}`,
      tag: selectedTag,
      repeat: repetir,
      done: false,
      notified: false,
    });
    setNome("");
    setSelectedTag(null);
    setFeedback(true);
    setTimeout(() => setFeedback(false), 2000);
  };

  return (
    <div style={{ background: "#fff", minHeight: "100%", display: "flex", flexDirection: "column" }}>
      {/* Feedback toast */}
      {feedback && (
        <div style={{
          position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
          background: DARK, color: "#fff", padding: "10px 24px", borderRadius: 12,
          fontSize: 14, fontWeight: 500, zIndex: 200,
          animation: "fadeIn 0.2s ease", boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        }}>
          ✓ Lembrete criado!
        </div>
      )}

      {/* Próxima Tarefa */}
      <div style={{ margin: "12px 20px 0", background: GRAY_BG, borderRadius: 16, padding: "16px 20px" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: GRAY_TEXT, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>
          Próxima tarefa
        </div>
        {nextTask ? (
          <>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <span style={{ fontSize: 28, fontWeight: 300, color: DARK }}>{nextTask.time}</span>
              <span style={{ fontSize: 16, color: DARK }}>{nextTask.name}</span>
            </div>
            <div style={{ fontSize: 13, color: ORANGE, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
              ⏱ {getMinutesUntil(nextTask.time)}
            </div>
          </>
        ) : (
          <span style={{ fontSize: 15, color: GRAY_TEXT }}>Nenhuma tarefa pendente</span>
        )}
      </div>

      {/* Nova Tarefa */}
      <div style={{ padding: "24px 20px 0" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: ORANGE, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 }}>
          Nova tarefa
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 500, color: DARK, margin: "0 0 16px" }}>
          O que precisa lembrar?
        </h2>

        <input
          value={nome}
          onChange={e => setNome(e.target.value)}
          placeholder="Ex.: Conferência de caixa"
          style={{
            width: "100%", padding: "14px 16px", borderRadius: 12,
            border: `1px solid ${GRAY_BORDER}`, fontSize: 15,
            color: DARK, background: "#fff", outline: "none",
            boxSizing: "border-box", marginBottom: 12,
          }}
          onFocus={e => e.target.style.borderColor = ORANGE}
          onBlur={e => e.target.style.borderColor = GRAY_BORDER}
        />

        {/* Tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
          {tags.map(tag => (
            <button key={tag} onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              style={{
                padding: "8px 16px", borderRadius: 20,
                border: `1px solid ${selectedTag === tag ? ORANGE : GRAY_BORDER}`,
                background: selectedTag === tag ? ORANGE_LIGHT : "#fff",
                color: selectedTag === tag ? ORANGE : DARK,
                fontSize: 13, fontWeight: 500, cursor: "pointer",
                transition: "all 0.15s",
              }}
            >{tag}</button>
          ))}
        </div>

        {/* Horário */}
        <div style={{ fontSize: 11, fontWeight: 600, color: GRAY_TEXT, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 12 }}>
          Horário
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16 }}>
          <AlarmIcon size={22} />
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            <input value={hora}
              onChange={e => { const v = e.target.value.replace(/\D/g, "").slice(0, 2); setHora(v); setSelectedTime(""); }}
              style={{
                width: 48, height: 52, textAlign: "center",
                fontSize: 32, fontWeight: 300, border: "none",
                background: "transparent", color: DARK, outline: "none",
              }}
            />
            <span style={{ fontSize: 32, fontWeight: 300, color: DARK, marginLeft: -4, marginRight: -4 }}>:</span>
            <input value={minuto}
              onChange={e => { const v = e.target.value.replace(/\D/g, "").slice(0, 2); setMinuto(v); setSelectedTime(""); }}
              style={{
                width: 48, height: 52, textAlign: "center",
                fontSize: 32, fontWeight: 300, border: "none",
                background: "transparent", color: DARK, outline: "none",
              }}
            />
          </div>
          <ClockIcon size={22} />
        </div>

        {/* Quick times */}
        <div style={{ display: "flex", gap: 6, marginBottom: 24, justifyContent: "center", flexWrap: "wrap" }}>
          {quickTimes.map(t => (
            <button key={t}
              onClick={() => { setHora(t.split(":")[0]); setMinuto(t.split(":")[1]); setSelectedTime(t); }}
              style={{
                padding: "6px 12px", borderRadius: 16,
                border: `1.5px solid ${selectedTime === t ? ORANGE : GRAY_BORDER}`,
                background: selectedTime === t ? ORANGE : "transparent",
                color: selectedTime === t ? "#fff" : GRAY_TEXT,
                fontSize: 13, fontWeight: 500, cursor: "pointer",
                transition: "all 0.15s",
              }}
            >{t}</button>
          ))}
        </div>

        {/* Toggle repetir */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <RepeatIcon size={18} />
            <div>
              <div style={{ fontSize: 15, color: DARK, fontWeight: 500 }}>Repetir todos os dias</div>
              <div style={{ fontSize: 12, color: GRAY_TEXT }}>Tarefa fixa de rotina</div>
            </div>
          </div>
          <Toggle on={repetir} onToggle={() => setRepetir(!repetir)} />
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {/* Botão criar */}
      <div style={{ padding: "12px 20px 8px" }}>
        <button onClick={handleCriar}
          style={{
            width: "100%", padding: "16px", borderRadius: 14,
            background: nome.trim() ? ORANGE : GRAY_BG,
            color: nome.trim() ? "#fff" : GRAY_TEXT,
            fontSize: 16, fontWeight: 600, border: "none",
            cursor: nome.trim() ? "pointer" : "default",
            transition: "all 0.2s",
          }}
        >Criar lembrete</button>
      </div>

      <BottomNav active="home" onNavigate={onNavigate} />
    </div>
  );
}

/* ═══════════════════════════════════════════════ */
/*  TELA TIMELINE                                 */
/* ═══════════════════════════════════════════════ */
function TelaTimeline({ onNavigate, tasks, onToggleTask, onDeleteTask, onAddTask }) {
  const [showModal, setShowModal] = useState(false);
  const [swipedId, setSwipedId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const sorted = [...tasks].sort((a, b) => a.time.localeCompare(b.time));

  const handleDelete = (id) => {
    setConfirmDelete(id);
  };

  const confirmDeleteTask = (id) => {
    onDeleteTask(id);
    setConfirmDelete(null);
    setSwipedId(null);
  };

  return (
    <div style={{ background: "#fff", minHeight: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
      <div style={{ padding: "16px 20px 12px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: DARK, margin: "0 0 4px" }}>Lembretes</h1>
        <p style={{ fontSize: 13, color: GRAY_TEXT, margin: 0 }}>Timeline do dia</p>
      </div>

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div style={{
          position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 100, animation: "fadeIn 0.15s ease", padding: 20,
        }} onClick={() => setConfirmDelete(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#fff", borderRadius: 16, padding: "24px 20px",
            width: "100%", maxWidth: 320, animation: "slideUp 0.2s ease",
          }}>
            <div style={{ fontSize: 17, fontWeight: 600, color: DARK, marginBottom: 8 }}>Excluir tarefa?</div>
            <div style={{ fontSize: 14, color: GRAY_TEXT, marginBottom: 20 }}>
              Essa ação não pode ser desfeita.
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setConfirmDelete(null)}
                style={{
                  flex: 1, padding: "12px", borderRadius: 12,
                  background: GRAY_BG, color: DARK,
                  fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer",
                }}
              >Cancelar</button>
              <button onClick={() => confirmDeleteTask(confirmDelete)}
                style={{
                  flex: 1, padding: "12px", borderRadius: 12,
                  background: "#D85A30", color: "#fff",
                  fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer",
                }}
              >Excluir</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ flex: 1, padding: "0 20px", overflowY: "auto" }}>
        {sorted.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: GRAY_TEXT, fontSize: 15 }}>
            Nenhum lembrete ainda.<br/>
            <span style={{ fontSize: 13 }}>Crie o primeiro na tela inicial.</span>
          </div>
        )}
        {sorted.map((task, i) => (
          <div key={task.id} style={{ display: "flex", gap: 16, position: "relative", animation: "slideIn 0.3s ease" }}>
            <div style={{ width: 50, textAlign: "right", paddingTop: 14, flexShrink: 0 }}>
              <span style={{ fontSize: 14, color: GRAY_TEXT, fontWeight: 500 }}>{task.time}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20, flexShrink: 0 }}>
              <div style={{
                width: 10, height: 10, borderRadius: 5,
                background: task.done ? "#6B9B5E" : ORANGE,
                marginTop: 16, zIndex: 1,
              }} />
              {i < sorted.length - 1 && (
                <div style={{ width: 2, flex: 1, background: GRAY_BORDER, minHeight: 40 }} />
              )}
            </div>
            <div style={{ flex: 1, marginBottom: 8, display: "flex", gap: 8, alignItems: "stretch" }}>
              {/* Task card */}
              <div onClick={() => onToggleTask(task.id)}
                style={{
                  flex: 1, padding: "14px 16px",
                  background: task.done ? "#FAFAF8" : "#fff",
                  borderRadius: 12,
                  border: `1px solid ${task.done ? GRAY_BORDER : ORANGE + "40"}`,
                  cursor: "pointer", transition: "all 0.2s",
                  opacity: task.done ? 0.7 : 1,
                }}
              >
                <span style={{
                  fontSize: 15, fontWeight: 500, color: DARK,
                  textDecoration: task.done ? "line-through" : "none",
                }}>{task.name}</span>
                {task.done && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                    <CheckIcon size={12} />
                    <span style={{ fontSize: 12, color: "#6B9B5E" }}>Concluída</span>
                  </div>
                )}
                {task.tag && !task.done && (
                  <div style={{ marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: ORANGE, background: ORANGE_LIGHT, padding: "2px 8px", borderRadius: 8 }}>
                      {task.tag}
                    </span>
                  </div>
                )}
              </div>
              {/* Delete button */}
              <button onClick={() => handleDelete(task.id)}
                style={{
                  width: 40, borderRadius: 12,
                  background: "#FEF0EC",
                  border: `1px solid #F5C4B3`,
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, transition: "all 0.15s",
                }}
              >
                <TrashIcon size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* FAB */}
      <button onClick={() => setShowModal(true)}
        style={{
          position: "absolute", bottom: 80, right: 20,
          width: 52, height: 52, borderRadius: 26,
          background: ORANGE, border: "none", color: "#fff",
          fontSize: 28, fontWeight: 300, cursor: "pointer",
          boxShadow: "0 4px 14px rgba(232,116,12,0.35)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >+</button>

      {showModal && (
        <ModalNovaTarefa
          onClose={() => setShowModal(false)}
          onAdd={(t) => { onAddTask(t); setShowModal(false); }}
        />
      )}

      <BottomNav active="timeline" onNavigate={onNavigate} />
    </div>
  );
}

/* ═══════════════════════════════════════════════ */
/*  TELA CONFIG                                   */
/* ═══════════════════════════════════════════════ */
function TelaConfig({ onNavigate, settings, onUpdateSettings, tasks, onClearDone }) {
  const doneCount = tasks.filter(t => t.done).length;
  const totalCount = tasks.length;
  const notifPermission = "Notification" in window ? Notification.permission : "denied";

  const handleRequestNotif = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then(perm => {
        if (perm === "granted") {
          onUpdateSettings({ ...settings, notifications: true });
          sendNotification("Task Orange", "Notificações ativadas!");
        }
      });
    }
  };

  return (
    <div style={{ background: "#fff", minHeight: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "16px 20px 12px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: DARK, margin: "0 0 4px" }}>Configurações</h1>
        <p style={{ fontSize: 13, color: GRAY_TEXT, margin: 0 }}>Personalize seu app</p>
      </div>

      <div style={{ padding: "8px 20px", flex: 1 }}>
        {/* Stats card */}
        <div style={{ background: GRAY_BG, borderRadius: 16, padding: "16px 20px", marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: GRAY_TEXT, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 10 }}>
            Resumo do dia
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 300, color: DARK }}>{totalCount}</div>
              <div style={{ fontSize: 12, color: GRAY_TEXT }}>Total</div>
            </div>
            <div style={{ width: 1, background: GRAY_BORDER }} />
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 300, color: "#6B9B5E" }}>{doneCount}</div>
              <div style={{ fontSize: 12, color: GRAY_TEXT }}>Concluídas</div>
            </div>
            <div style={{ width: 1, background: GRAY_BORDER }} />
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 300, color: ORANGE }}>{totalCount - doneCount}</div>
              <div style={{ fontSize: 12, color: GRAY_TEXT }}>Pendentes</div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div style={{ fontSize: 11, fontWeight: 600, color: GRAY_TEXT, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 12 }}>
          Notificações
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <BellIcon size={18} />
              <div>
                <div style={{ fontSize: 15, color: DARK, fontWeight: 500 }}>Notificações</div>
                <div style={{ fontSize: 12, color: GRAY_TEXT }}>
                  {notifPermission === "granted" ? "Ativadas" : notifPermission === "denied" ? "Bloqueadas no navegador" : "Desativadas"}
                </div>
              </div>
            </div>
            {notifPermission === "granted" ? (
              <Toggle on={settings.notifications} onToggle={() => onUpdateSettings({ ...settings, notifications: !settings.notifications })} />
            ) : (
              <button onClick={handleRequestNotif} style={{
                padding: "6px 14px", borderRadius: 10,
                background: ORANGE, color: "#fff",
                fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer",
              }}>Ativar</button>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <VolumeIcon size={18} />
              <div>
                <div style={{ fontSize: 15, color: DARK, fontWeight: 500 }}>Som de alerta</div>
                <div style={{ fontSize: 12, color: GRAY_TEXT }}>Vibrar ao notificar</div>
              </div>
            </div>
            <Toggle on={settings.sound} onToggle={() => onUpdateSettings({ ...settings, sound: !settings.sound })} />
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <AlarmIcon size={18} color={GRAY_TEXT} />
              <div>
                <div style={{ fontSize: 15, color: DARK, fontWeight: 500 }}>Antecedência</div>
                <div style={{ fontSize: 12, color: GRAY_TEXT }}>Avisar antes do horário</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {[0, 5, 10, 15].map(m => (
                <button key={m} onClick={() => onUpdateSettings({ ...settings, antecedencia: m })}
                  style={{
                    padding: "5px 10px", borderRadius: 10,
                    border: `1.5px solid ${settings.antecedencia === m ? ORANGE : GRAY_BORDER}`,
                    background: settings.antecedencia === m ? ORANGE : "transparent",
                    color: settings.antecedencia === m ? "#fff" : GRAY_TEXT,
                    fontSize: 12, fontWeight: 500, cursor: "pointer",
                  }}
                >{m === 0 ? "Na hora" : `${m}min`}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Ações */}
        <div style={{ fontSize: 11, fontWeight: 600, color: GRAY_TEXT, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 12 }}>
          Ações
        </div>

        {doneCount > 0 && (
          <button onClick={onClearDone} style={{
            width: "100%", padding: "14px 16px", borderRadius: 12,
            background: "#FEF0EC", border: `1px solid #F5C4B3`,
            color: "#D85A30", fontSize: 14, fontWeight: 500,
            cursor: "pointer", textAlign: "left",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <TrashIcon size={16} />
            Limpar {doneCount} tarefa{doneCount > 1 ? "s" : ""} concluída{doneCount > 1 ? "s" : ""}
          </button>
        )}
      </div>

      <BottomNav active="config" onNavigate={onNavigate} />
    </div>
  );
}

/* ═══════════════════════════════════════════════ */
/*  MODAL NOVA TAREFA                             */
/* ═══════════════════════════════════════════════ */
function ModalNovaTarefa({ onClose, onAdd }) {
  const [nome, setNome] = useState("");
  const [hora, setHora] = useState("10");
  const [minuto, setMinuto] = useState("30");
  const [repetir, setRepetir] = useState(false);

  const handleCriar = () => {
    if (!nome.trim()) return;
    onAdd({
      id: Date.now(),
      name: nome,
      time: `${hora.padStart(2, "0")}:${minuto.padStart(2, "0")}`,
      tag: null, repeat: repetir, done: false, notified: false,
    });
  };

  return (
    <div style={{
      position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)",
      display: "flex", alignItems: "flex-end", zIndex: 100,
      animation: "fadeIn 0.2s ease",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        style={{
          width: "100%", background: "#fff",
          borderRadius: "24px 24px 0 0", padding: "24px 20px 32px",
          animation: "slideUp 0.3s ease",
        }}
      >
        <h3 style={{ fontSize: 20, fontWeight: 600, color: DARK, margin: "0 0 20px" }}>Nova tarefa</h3>

        <label style={{ fontSize: 11, fontWeight: 600, color: GRAY_TEXT, letterSpacing: 0.5, textTransform: "uppercase" }}>Nome</label>
        <input value={nome} onChange={e => setNome(e.target.value)}
          placeholder="Ex.: Conferência de caixa"
          style={{
            width: "100%", padding: "14px 16px", borderRadius: 12,
            border: `1px solid ${GRAY_BORDER}`, fontSize: 15,
            color: DARK, background: "#fff", outline: "none",
            boxSizing: "border-box", margin: "8px 0 16px",
          }}
          onFocus={e => e.target.style.borderColor = ORANGE}
          onBlur={e => e.target.style.borderColor = GRAY_BORDER}
          autoFocus
        />

        <label style={{ fontSize: 11, fontWeight: 600, color: GRAY_TEXT, letterSpacing: 0.5, textTransform: "uppercase" }}>Horário</label>
        <div style={{
          display: "flex", alignItems: "center", gap: 4,
          border: `1px solid ${GRAY_BORDER}`, borderRadius: 12,
          padding: "10px 14px", margin: "8px 0 16px",
        }}>
          <input value={hora} onChange={e => setHora(e.target.value.replace(/\D/g, "").slice(0, 2))}
            style={{ width: 32, fontSize: 20, fontWeight: 400, border: "none", outline: "none", textAlign: "center", color: DARK }}
          />
          <span style={{ fontSize: 20, color: DARK }}>:</span>
          <input value={minuto} onChange={e => setMinuto(e.target.value.replace(/\D/g, "").slice(0, 2))}
            style={{ width: 32, fontSize: 20, fontWeight: 400, border: "none", outline: "none", textAlign: "center", color: DARK }}
          />
          <div style={{ marginLeft: "auto" }}><ClockIcon size={18} /></div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <RepeatIcon size={16} />
            <span style={{ fontSize: 15, color: DARK }}>Repetir todos os dias</span>
          </div>
          <Toggle on={repetir} onToggle={() => setRepetir(!repetir)} />
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onClose}
            style={{
              flex: 1, padding: "14px", borderRadius: 14,
              background: "transparent", color: DARK,
              fontSize: 15, fontWeight: 600, border: "none", cursor: "pointer",
            }}
          >Cancelar</button>
          <button onClick={handleCriar}
            style={{
              flex: 1, padding: "14px", borderRadius: 14,
              background: nome.trim() ? ORANGE : GRAY_BG,
              color: nome.trim() ? "#fff" : GRAY_TEXT,
              fontSize: 15, fontWeight: 600, border: "none",
              cursor: nome.trim() ? "pointer" : "default",
              transition: "all 0.2s",
            }}
          >Criar tarefa</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Bottom Navigation ─── */
function BottomNav({ active, onNavigate }) {
  const items = [
    { key: "home", label: "Início", icon: (c) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active==="home"?ORANGE:"none"} stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    )},
    { key: "timeline", label: "Timeline", icon: (c) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round">
        <line x1="12" y1="2" x2="12" y2="22"/>
        <circle cx="12" cy="6" r="2" fill={active==="timeline"?ORANGE:"none"}/>
        <circle cx="12" cy="12" r="2" fill={active==="timeline"?ORANGE:"none"}/>
        <circle cx="12" cy="18" r="2" fill={active==="timeline"?ORANGE:"none"}/>
        <line x1="14" y1="6" x2="20" y2="6"/><line x1="14" y1="12" x2="20" y2="12"/><line x1="14" y1="18" x2="20" y2="18"/>
      </svg>
    )},
    { key: "config", label: "Config", icon: (c) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    )},
  ];

  return (
    <div style={{
      display: "flex", justifyContent: "space-around",
      padding: "10px 0 env(safe-area-inset-bottom, 20px)",
      borderTop: `1px solid ${GRAY_BORDER}`, background: "#fff", flexShrink: 0,
    }}>
      {items.map(item => {
        const color = active === item.key ? ORANGE : GRAY_TEXT;
        return (
          <button key={item.key} onClick={() => onNavigate(item.key)}
            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flex: 1 }}
          >
            {item.icon(color)}
            <span style={{ fontSize: 10, color, fontWeight: 600 }}>{item.label}</span>
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
  const [tasks, setTasks] = useState(loadTasks);
  const [settings, setSettings] = useState(loadSettings);

  useEffect(() => { saveTasks(tasks); }, [tasks]);
  useEffect(() => { saveSettings(settings); }, [settings]);

  // Request notification permission on first load
  useEffect(() => { requestNotificationPermission(); }, []);

  // Notification checker - runs every 30 seconds
  useEffect(() => {
    if (!settings.notifications) return;

    const check = () => {
      const now = new Date();
      const currentH = now.getHours();
      const currentM = now.getMinutes();

      setTasks(prev => prev.map(task => {
        if (task.done || task.notified) return task;
        const [taskH, taskM] = task.time.split(":").map(Number);
        const taskMinutes = taskH * 60 + taskM;
        const currentMinutes = currentH * 60 + currentM;
        const diff = taskMinutes - currentMinutes;

        if (diff === settings.antecedencia || (settings.antecedencia === 0 && diff === 0)) {
          sendNotification(
            "Task Orange",
            settings.antecedencia > 0
              ? `"${task.name}" começa em ${settings.antecedencia} minutos`
              : `"${task.name}" — é agora!`
          );
          if (settings.sound && navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
          }
          return { ...task, notified: true };
        }
        return task;
      }));
    };

    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, [settings.notifications, settings.antecedencia, settings.sound]);

  // Reset notified flag at midnight
  useEffect(() => {
    const checkMidnight = () => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        setTasks(prev => prev.map(t => ({ ...t, notified: false, done: t.repeat ? false : t.done })));
      }
    };
    const interval = setInterval(checkMidnight, 60000);
    return () => clearInterval(interval);
  }, []);

  const addTask = (task) => setTasks(prev => [...prev, task]);
  const toggleTask = (id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const deleteTask = (id) => setTasks(prev => prev.filter(t => t.id !== id));
  const clearDone = () => setTasks(prev => prev.filter(t => !t.done));

  return (
    <div style={{
      maxWidth: 430, margin: "0 auto",
      height: "100dvh",
      background: "#fff",
      fontFamily: "'DM Sans', -apple-system, sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      <GlobalStyles />
      {screen === "home" && (
        <div style={{ height: "100%", overflowY: "auto" }}>
          <TelaInicial onNavigate={setScreen} tasks={tasks} onAddTask={addTask} />
        </div>
      )}
      {screen === "timeline" && (
        <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <TelaTimeline onNavigate={setScreen} tasks={tasks} onToggleTask={toggleTask} onDeleteTask={deleteTask} onAddTask={addTask} />
        </div>
      )}
      {screen === "config" && (
        <div style={{ height: "100%", overflowY: "auto" }}>
          <TelaConfig onNavigate={setScreen} settings={settings} onUpdateSettings={setSettings} tasks={tasks} onClearDone={clearDone} />
        </div>
      )}
    </div>
  );
}
