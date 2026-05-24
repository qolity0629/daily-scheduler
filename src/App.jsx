import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "schedule_events_v3";
const FOCUS_LOG_KEY = "monk_focus_log_v1";
const COLORS = [
  { bg: "#FF6B6B", label: "赤" },
  { bg: "#FF9F43", label: "橙" },
  { bg: "#FECA57", label: "黄" },
  { bg: "#48CAE4", label: "青" },
  { bg: "#A29BFE", label: "紫" },
  { bg: "#55EFC4", label: "緑" },
];
const FOCUS_OPTIONS = [15, 20, 25, 30, 45, 50];
const BREAK_OPTIONS = [5, 10, 15, 20];
const DAYS_JP = ["日", "月", "火", "水", "木", "金", "土"];

const pad = (n) => String(n).padStart(2, "0");
const parseTime = (str) => { const [h, m] = str.split(":").map(Number); return h * 60 + m; };
const dateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const todayKey = () => dateKey(new Date());

function loadLog() {
  try { return JSON.parse(localStorage.getItem(FOCUS_LOG_KEY)) || {}; } catch { return {}; }
}
function addFocusMinutes(mins) {
  const log = loadLog();
  const k = todayKey();
  log[k] = (log[k] || 0) + mins;
  localStorage.setItem(FOCUS_LOG_KEY, JSON.stringify(log));
}
function getLast7Days() {
  const log = loadLog();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const k = dateKey(d);
    return { label: `${d.getMonth()+1}/${d.getDate()}(${DAYS_JP[d.getDay()]})`, mins: log[k] || 0, isToday: i === 6 };
  });
}

function StatsPopup({ onClose }) {
  const data = getLast7Days();
  const maxMins = Math.max(...data.map(d => d.mins), 60);
  const todayMins = data[6].mins;
  const totalMins = data.reduce((s, d) => s + d.mins, 0);
  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000099", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 150, padding: 20 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#12121C", border: "1px solid #2A2A40", borderRadius: 20, padding: "28px 24px", width: "100%", maxWidth: 400, boxShadow: "0 20px 60px #00000099" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 11, color: "#A29BFE", letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 }}>Monk Focus</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>集中記録</div>
          </div>
          <button onClick={onClose} style={{ background: "#1E1E30", border: "1px solid #2A2A40", color: "#6B6B8A", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          <div style={{ flex: 1, background: "#1a1035", border: "1px solid #A29BFE33", borderRadius: 14, padding: "16px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#A29BFE", lineHeight: 1 }}>{Math.floor(todayMins/60)>0?`${Math.floor(todayMins/60)}h`:""}{todayMins%60}m</div>
            <div style={{ fontSize: 11, color: "#6B6B8A", marginTop: 6 }}>今日の集中</div>
          </div>
          <div style={{ flex: 1, background: "#0a1f1a", border: "1px solid #55EFC433", borderRadius: 14, padding: "16px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#55EFC4", lineHeight: 1 }}>{Math.floor(totalMins/60)>0?`${Math.floor(totalMins/60)}h`:""}{totalMins%60}m</div>
            <div style={{ fontSize: 11, color: "#6B6B8A", marginTop: 6 }}>7日間合計</div>
          </div>
        </div>
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 11, color: "#6B6B8A", letterSpacing: 2, marginBottom: 14, textTransform: "uppercase" }}>Past 7 Days</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 100 }}>
            {data.map((d, i) => {
              const h = maxMins > 0 ? (d.mins / maxMins) * 100 : 0;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%" }}>
                  <div style={{ flex: 1, display: "flex", alignItems: "flex-end", width: "100%" }}>
                    <div style={{ width: "100%", height: `${Math.max(h, d.mins>0?4:0)}%`, background: d.isToday ? "linear-gradient(180deg,#A29BFE,#6C5CE7)" : d.mins>0 ? "#A29BFE44" : "#1E1E30", borderRadius: "4px 4px 2px 2px", transition: "height 0.5s ease", position: "relative" }}>
                      {d.mins > 0 && <div style={{ position: "absolute", top: -18, left: "50%", transform: "translateX(-50%)", fontSize: 9, color: d.isToday ? "#A29BFE" : "#6B6B8A", whiteSpace: "nowrap", fontWeight: 600 }}>{d.mins}m</div>}
                    </div>
                  </div>
                  <div style={{ fontSize: 9, color: d.isToday ? "#A29BFE" : "#3A3A5A", fontWeight: d.isToday ? 700 : 400, whiteSpace: "nowrap" }}>{d.label.split("(")[1]?.replace(")", "") || ""}</div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
            {data.map((d, i) => <div key={i} style={{ flex: 1, textAlign: "center", fontSize: 9, color: d.isToday ? "#A29BFE" : "#3A3A5A", fontWeight: d.isToday ? 700 : 400 }}>{d.label.split("(")[0]}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

function MonkOverlay({ event, onClose }) {
  const focusSecs = (event.focusMins || 25) * 60;
  const breakSecs = (event.breakMins || 5) * 60;
  const [phase, setPhase] = useState("focus");
  const [remaining, setRemaining] = useState(focusSecs);
  const [running, setRunning] = useState(true);
  const [round, setRound] = useState(1);
  const sessionFocusRef = useRef(0);
  const intervalRef = useRef(null);

  const total = phase === "focus" ? focusSecs : breakSecs;
  const pct = ((total - remaining) / total) * 100;
  const radius = 90;
  const circ = 2 * Math.PI * radius;
  const stroke = circ - (pct / 100) * circ;

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (phase === "focus") sessionFocusRef.current += 1;
          if (prev <= 1) {
            if (phase === "focus") {
              setPhase("break"); setRemaining(breakSecs);
              if (Notification.permission === "granted") new Notification("🧘 休憩タイム！", { body: `${event.breakMins}分休憩しましょう` });
            } else {
              setPhase("focus"); setRound((r) => r + 1); setRemaining(focusSecs);
              if (Notification.permission === "granted") new Notification("🔥 集中タイム！", { body: `${event.focusMins}分集中しましょう` });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else { clearInterval(intervalRef.current); }
    return () => clearInterval(intervalRef.current);
  }, [running, phase]);

  const handleClose = () => {
    clearInterval(intervalRef.current);
    const focusedMins = Math.floor(sessionFocusRef.current / 60);
    if (focusedMins > 0) addFocusMinutes(focusedMins);
    onClose();
  };

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const isFocus = phase === "focus";

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: isFocus ? "radial-gradient(ellipse at 50% 30%,#1a0a2e,#0A0A0F 70%)" : "radial-gradient(ellipse at 50% 30%,#0a1f1a,#0A0A0F 70%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transition: "background 1s" }}>
      <div style={{ marginBottom: 12, fontSize: 11, letterSpacing: 4, textTransform: "uppercase", color: isFocus ? "#A29BFE" : "#55EFC4", fontWeight: 700 }}>{isFocus ? "🧘 MONK MODE" : "☕ BREAK TIME"} — Round {round}</div>
      <div style={{ fontSize: 15, color: "#6B6B8A", marginBottom: 32, fontWeight: 600 }}>{event.title}</div>
      <div style={{ position: "relative", width: 220, height: 220, marginBottom: 40 }}>
        <svg width="220" height="220" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="110" cy="110" r={radius} fill="none" stroke="#1E1E30" strokeWidth="10" />
          <circle cx="110" cy="110" r={radius} fill="none" stroke={isFocus ? "#A29BFE" : "#55EFC4"} strokeWidth="10" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={stroke} style={{ transition: "stroke-dashoffset 1s linear, stroke 1s" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 52, fontWeight: 800, letterSpacing: -2, color: "#FFFFFF", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{pad(mins)}:{pad(secs)}</div>
          <div style={{ fontSize: 12, color: "#6B6B8A", marginTop: 6 }}>{isFocus ? `集中 ${event.focusMins}分` : `休憩 ${event.breakMins}分`}</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 16 }}>
        <button onClick={() => setRunning((r) => !r)} style={{ width: 60, height: 60, borderRadius: "50%", background: "#1E1E30", border: "1px solid #2A2A40", color: "#E8E8F0", fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{running ? "⏸" : "▶"}</button>
        <button onClick={() => { setPhase("focus"); setRemaining(focusSecs); setRound(1); setRunning(true); }} style={{ width: 60, height: 60, borderRadius: "50%", background: "#1E1E30", border: "1px solid #2A2A40", color: "#E8E8F0", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>↺</button>
        <button onClick={handleClose} style={{ width: 60, height: 60, borderRadius: "50%", background: "#FF6B6B22", border: "1px solid #FF6B6B44", color: "#FF6B6B", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>終了</button>
      </div>
      <div style={{ marginTop: 40, fontSize: 11, color: "#3A3A5A", letterSpacing: 2 }}>集中 {event.focusMins}min + 休憩 {event.breakMins}min</div>
    </div>
  );
}

export default function App() {
  const [events, setEvents] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
  });
  const [showModal, setShowModal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form, setForm] = useState({ title: "", start: "08:00", end: "09:00", colorIdx: 0, monkMode: false, focusMins: 25, breakMins: 5, repeat: false });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifPermission, setNotifPermission] = useState("default");
  const [activeMonk, setActiveMonk] = useState(null);
  const [todayFocus, setTodayFocus] = useState(() => loadLog()[todayKey()] || 0);
  const notifiedRef = useRef(new Set());

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(events)); }, [events]);
  useEffect(() => {
    const t = setInterval(() => { setCurrentTime(new Date()); setTodayFocus(loadLog()[todayKey()] || 0); }, 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => { if ("Notification" in window) setNotifPermission(Notification.permission); }, []);

  useEffect(() => {
    const check = setInterval(() => {
      const now = new Date();
      const nowMins = now.getHours() * 60 + now.getMinutes();
      events.forEach((ev) => {
        const startMins = parseTime(ev.start);
        const diff = startMins - nowMins;
        const notifKey = `notif_${ev.id}_${now.toDateString()}`;
        const monkKey = `monk_${ev.id}_${now.toDateString()}`;
        if (diff === 5 && !notifiedRef.current.has(notifKey)) {
          notifiedRef.current.add(notifKey);
          if (Notification.permission === "granted") new Notification(ev.monkMode ? `🧘 5分後：${ev.title}（モンクモード）` : `⏰ 5分後：${ev.title}`, { body: `${ev.start} から開始します` });
        }
        if (diff === 0 && ev.monkMode && !notifiedRef.current.has(monkKey) && !activeMonk) {
          notifiedRef.current.add(monkKey);
          setActiveMonk(ev);
        }
      });
    }, 30000);
    return () => clearInterval(check);
  }, [events, activeMonk]);

  const currentMins = currentTime.getHours() * 60 + currentTime.getMinutes();
  const sortedEvents = [...events].sort((a, b) => parseTime(a.start) - parseTime(b.start));
  const hours = Array.from({ length: 25 }, (_, i) => i);

  const openAdd = () => { setEditingEvent(null); setForm({ title: "", start: "08:00", end: "09:00", colorIdx: 0, monkMode: false, focusMins: 25, breakMins: 5, repeat: false }); setShowModal(true); };
  const openEdit = (ev) => { setEditingEvent(ev); setForm({ title: ev.title, start: ev.start, end: ev.end, colorIdx: ev.colorIdx, monkMode: ev.monkMode||false, focusMins: ev.focusMins||25, breakMins: ev.breakMins||5, repeat: ev.repeat||false }); setShowModal(true); };
  const saveEvent = () => {
    if (!form.title.trim() || parseTime(form.start) >= parseTime(form.end)) return;
    if (editingEvent) { setEvents((p) => p.map((e) => e.id === editingEvent.id ? { ...e, ...form } : e)); }
    else { setEvents((p) => [...p, { id: Date.now(), ...form }]); }
    setShowModal(false);
  };
  const deleteEvent = (id) => { setEvents((p) => p.filter((e) => e.id !== id)); setShowModal(false); };
  const requestNotif = async () => { if ("Notification" in window) setNotifPermission(await Notification.requestPermission()); };

  const focusH = Math.floor(todayFocus / 60);
  const focusM = todayFocus % 60;
  const focusLabel = focusH > 0 ? `${focusH}h ${focusM}m` : `${focusM}m`;

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F", color: "#E8E8F0", fontFamily: "'Hiragino Sans','Noto Sans JP',sans-serif", display: "flex", flexDirection: "column" }}>
      {activeMonk && <MonkOverlay event={activeMonk} onClose={() => { setActiveMonk(null); setTodayFocus(loadLog()[todayKey()] || 0); }} />}
      {showStats && <StatsPopup onClose={() => setShowStats(false)} />}

      {/* Header */}
      <div style={{ padding: "20px 24px 14px", borderBottom: "1px solid #1E1E2E", background: "linear-gradient(180deg,#12121C,#0A0A0F)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11, color: "#6B6B8A", letterSpacing: 3, textTransform: "uppercase", marginBottom: 4 }}>Daily Scheduler</div>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -1, color: "#fff" }}>
              {pad(currentTime.getHours())}:{pad(currentTime.getMinutes())}
              <span style={{ fontSize: 14, color: "#6B6B8A", marginLeft: 6, fontWeight: 400 }}>:{pad(currentTime.getSeconds())}</span>
            </div>
            <div style={{ fontSize: 12, color: "#6B6B8A", marginTop: 2 }}>{currentTime.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "short" })}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            <div style={{ display: "flex", gap: 8 }}>
              {notifPermission !== "granted" && <button onClick={requestNotif} style={{ background: "#1E1E30", border: "1px solid #FF6B6B44", color: "#FF6B6B", borderRadius: 10, padding: "8px 12px", fontSize: 12, cursor: "pointer" }}>🔔</button>}
              <button onClick={openAdd} style={{ background: "linear-gradient(135deg,#A29BFE,#6C5CE7)", border: "none", color: "#fff", borderRadius: 10, padding: "8px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 20px #6C5CE755" }}>+ 追加</button>
            </div>
            <button onClick={() => setShowStats(true)} style={{ display: "flex", alignItems: "center", gap: 6, background: todayFocus > 0 ? "#1a1035" : "#1a1a2a", border: `1px solid ${todayFocus > 0 ? "#A29BFE44" : "#2A2A40"}`, borderRadius: 10, padding: "6px 12px", cursor: "pointer", transition: "all 0.3s" }}>
              <span style={{ fontSize: 13 }}>🧘</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: todayFocus > 0 ? "#A29BFE" : "#3A3A5A" }}>{todayFocus > 0 ? focusLabel : "0m"}</span>
              <span style={{ fontSize: 9, color: "#3A3A5A", letterSpacing: 1 }}>▶</span>
            </button>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 0 40px" }}>
        <div style={{ position: "relative", paddingLeft: 64, paddingRight: 20, minHeight: 1440 }}>
          {hours.map((h) => (
            <div key={h} style={{ position: "absolute", top: `${(h/24)*100}%`, left: 0, right: 0, display: "flex", alignItems: "flex-start", pointerEvents: "none" }}>
              <span style={{ width: 52, textAlign: "right", paddingRight: 10, fontSize: 11, color: h === currentTime.getHours() ? "#A29BFE" : "#3A3A5A", lineHeight: "14px", userSelect: "none" }}>{h < 24 ? `${pad(h)}:00` : ""}</span>
              <div style={{ flex: 1, height: 1, background: h % 6 === 0 ? "#2A2A40" : "#181828", marginTop: 7 }} />
            </div>
          ))}
          <div style={{ position: "absolute", top: `${(currentMins/1440)*100}%`, left: 52, right: 20, height: 2, background: "linear-gradient(90deg,#FF6B6B,#FF6B6B00)", zIndex: 10, pointerEvents: "none" }}>
            <div style={{ width: 8, height: 8, background: "#FF6B6B", borderRadius: "50%", marginTop: -3, boxShadow: "0 0 10px #FF6B6B" }} />
          </div>
          {sortedEvents.map((ev) => {
            const color = COLORS[ev.colorIdx] || COLORS[0];
            const startMins = parseTime(ev.start);
            const endMins = parseTime(ev.end);
            const topPct = (startMins / 1440) * 100;
            const heightPct = ((endMins - startMins) / 1440) * 100;
            const durationMins = endMins - startMins;
            const isNow = currentMins >= startMins && currentMins < endMins;
            const isMonk = ev.monkMode;
            const isRepeat = ev.repeat;
            return (
              <div key={ev.id} onClick={() => isMonk && isNow ? setActiveMonk(ev) : openEdit(ev)} style={{
                position: "absolute", top: `${topPct}%`, left: 64, right: 20,
                height: `${heightPct}%`, minHeight: 28,
                background: isMonk ? (isNow ? "linear-gradient(135deg,#2d1f5e,#1a1030)" : "#1a103088") : (isNow ? `linear-gradient(135deg,${color.bg}33,${color.bg}22)` : `${color.bg}18`),
                border: `1.5px solid ${isMonk ? (isNow ? "#A29BFE" : "#A29BFE55") : (isNow ? color.bg : color.bg+"55")}`,
                borderLeft: `3px solid ${isMonk ? "#A29BFE" : color.bg}`,
                borderRadius: 8, padding: "6px 10px", cursor: "pointer", boxSizing: "border-box", overflow: "hidden", transition: "all 0.2s",
                boxShadow: isNow ? (isMonk ? "0 0 24px #A29BFE44" : `0 0 20px ${color.bg}33`) : "none", zIndex: 5,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {isMonk && <span style={{ fontSize: 11 }}>🧘</span>}
                  {isRepeat && !isMonk && <span style={{ fontSize: 10 }}>🔁</span>}
                  {isNow && !isMonk && <span style={{ width: 6, height: 6, borderRadius: "50%", background: color.bg, flexShrink: 0, animation: "pulse 1.5s infinite" }} />}
                  <span style={{ fontSize: durationMins < 30 ? 11 : 13, fontWeight: 600, color: "#E8E8F0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ev.title}</span>
                  {isMonk && isNow && <span style={{ marginLeft: "auto", fontSize: 10, color: "#A29BFE", fontWeight: 700, letterSpacing: 1 }}>TAP▶</span>}
                </div>
                {durationMins >= 30 && <div style={{ fontSize: 10, color: "#6B6B8A", marginTop: 2 }}>{ev.start} – {ev.end}{isMonk ? ` · 🔥${ev.focusMins}+💤${ev.breakMins}` : ""}</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* List */}
      {sortedEvents.length > 0 && (
        <div style={{ background: "#0E0E1A", borderTop: "1px solid #1E1E2E", padding: "16px 20px", maxHeight: "28vh", overflowY: "auto" }}>
          <div style={{ fontSize: 11, color: "#6B6B8A", letterSpacing: 2, marginBottom: 12, textTransform: "uppercase" }}>Today's Schedule</div>
          {sortedEvents.map((ev) => {
            const color = COLORS[ev.colorIdx] || COLORS[0];
            const isNow = currentMins >= parseTime(ev.start) && currentMins < parseTime(ev.end);
            const isPast = currentMins >= parseTime(ev.end);
            return (
              <div key={ev.id} onClick={() => ev.monkMode && isNow ? setActiveMonk(ev) : openEdit(ev)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", marginBottom: 6, borderRadius: 10, background: isNow ? "#1A1A2E" : "transparent", cursor: "pointer", opacity: isPast && !ev.repeat ? 0.45 : 1, border: isNow ? `1px solid ${ev.monkMode ? "#A29BFE33" : color.bg+"33"}` : "1px solid transparent" }}>
                <div style={{ width: 3, height: 32, borderRadius: 2, background: ev.monkMode ? "#A29BFE" : color.bg, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: isPast && !ev.repeat ? "#6B6B8A" : "#E8E8F0", display: "flex", alignItems: "center", gap: 6 }}>
                    {ev.monkMode && <span style={{ fontSize: 12 }}>🧘</span>}
                    {ev.repeat && <span style={{ fontSize: 12 }}>🔁</span>}
                    {ev.title}
                  </div>
                  <div style={{ fontSize: 11, color: "#6B6B8A" }}>{ev.start} – {ev.end}{ev.monkMode ? ` · 集中${ev.focusMins}分 休憩${ev.breakMins}分` : ""}{ev.repeat ? " · 毎日" : ""}</div>
                </div>
                {isNow && <span style={{ fontSize: 10, color: ev.monkMode ? "#A29BFE" : color.bg, fontWeight: 700, letterSpacing: 1 }}>{ev.monkMode ? "MONK" : "LIVE"}</span>}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "#00000088", backdropFilter: "blur(8px)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 100 }}
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div style={{ background: "#12121C", border: "1px solid #2A2A40", borderRadius: "20px 20px 0 0", padding: "24px 24px 44px", width: "100%", maxWidth: 480, boxShadow: "0 -20px 60px #00000088", overflowY: "auto", maxHeight: "90vh" }}>
            <div style={{ width: 40, height: 4, background: "#2A2A40", borderRadius: 2, margin: "0 auto 20px" }} />
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>{editingEvent ? "予定を編集" : "予定を追加"}</div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, color: "#6B6B8A", display: "block", marginBottom: 6, letterSpacing: 1 }}>タイトル</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="例：英語の勉強" style={{ width: "100%", background: "#1E1E30", border: "1px solid #2A2A40", borderRadius: 10, padding: "12px 14px", color: "#E8E8F0", fontSize: 15, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: "#6B6B8A", display: "block", marginBottom: 6, letterSpacing: 1 }}>開始</label>
                <input type="time" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} style={{ width: "100%", background: "#1E1E30", border: "1px solid #2A2A40", borderRadius: 10, padding: "12px 14px", color: "#E8E8F0", fontSize: 15, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, color: "#6B6B8A", display: "block", marginBottom: 6, letterSpacing: 1 }}>終了</label>
                <input type="time" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} style={{ width: "100%", background: "#1E1E30", border: "1px solid #2A2A40", borderRadius: 10, padding: "12px 14px", color: "#E8E8F0", fontSize: 15, outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, color: "#6B6B8A", display: "block", marginBottom: 8, letterSpacing: 1 }}>カラー</label>
              <div style={{ display: "flex", gap: 8 }}>
                {COLORS.map((c, i) => <div key={i} onClick={() => setForm({ ...form, colorIdx: i })} style={{ width: 28, height: 28, borderRadius: "50%", background: c.bg, cursor: "pointer", border: form.colorIdx === i ? "3px solid #fff" : "3px solid transparent", boxSizing: "border-box" }} />)}
              </div>
            </div>

            {/* 毎日繰り返しトグル */}
            <div style={{ marginBottom: 16, padding: "14px 16px", borderRadius: 14, border: form.repeat ? "1.5px solid #FF9F4355" : "1.5px solid #2A2A40", background: form.repeat ? "#1f1608" : "#1a1a2a", cursor: "pointer", transition: "all 0.3s" }}
              onClick={() => setForm({ ...form, repeat: !form.repeat })}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: form.repeat ? "#FF9F43" : "#E8E8F0" }}>🔁 毎日繰り返す</div>
                  <div style={{ fontSize: 11, color: "#6B6B8A", marginTop: 3 }}>固定ルーティンとして毎日表示</div>
                </div>
                <div style={{ width: 44, height: 24, borderRadius: 12, background: form.repeat ? "#FF9F43" : "#2A2A40", position: "relative", transition: "background 0.3s", flexShrink: 0 }}>
                  <div style={{ position: "absolute", top: 3, left: form.repeat ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.3s", boxShadow: "0 1px 4px #00000055" }} />
                </div>
              </div>
            </div>

            {/* モンクモードトグル */}
            <div style={{ marginBottom: form.monkMode ? 16 : 20, padding: "14px 16px", borderRadius: 14, border: form.monkMode ? "1.5px solid #A29BFE55" : "1.5px solid #2A2A40", background: form.monkMode ? "#1a1035" : "#1a1a2a", cursor: "pointer", transition: "all 0.3s" }}
              onClick={() => setForm({ ...form, monkMode: !form.monkMode })}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: form.monkMode ? "#A29BFE" : "#E8E8F0" }}>🧘 モンクモード</div>
                  <div style={{ fontSize: 11, color: "#6B6B8A", marginTop: 3 }}>集中タイマーを有効にする</div>
                </div>
                <div style={{ width: 44, height: 24, borderRadius: 12, background: form.monkMode ? "#A29BFE" : "#2A2A40", position: "relative", transition: "background 0.3s", flexShrink: 0 }}>
                  <div style={{ position: "absolute", top: 3, left: form.monkMode ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.3s", boxShadow: "0 1px 4px #00000055" }} />
                </div>
              </div>
            </div>
            {form.monkMode && (
              <div style={{ marginBottom: 20, padding: "16px", borderRadius: 14, background: "#12102A", border: "1px solid #A29BFE22" }}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 11, color: "#A29BFE", display: "block", marginBottom: 10, letterSpacing: 1 }}>🔥 集中時間（分）</label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {FOCUS_OPTIONS.map((m) => <div key={m} onClick={() => setForm({ ...form, focusMins: m })} style={{ padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, background: form.focusMins === m ? "#A29BFE" : "#1E1E30", color: form.focusMins === m ? "#fff" : "#6B6B8A", border: `1px solid ${form.focusMins === m ? "#A29BFE" : "#2A2A40"}`, transition: "all 0.2s" }}>{m}</div>)}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: "#55EFC4", display: "block", marginBottom: 10, letterSpacing: 1 }}>💤 休憩時間（分）</label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {BREAK_OPTIONS.map((m) => <div key={m} onClick={() => setForm({ ...form, breakMins: m })} style={{ padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, background: form.breakMins === m ? "#55EFC4" : "#1E1E30", color: form.breakMins === m ? "#0A0A0F" : "#6B6B8A", border: `1px solid ${form.breakMins === m ? "#55EFC4" : "#2A2A40"}`, transition: "all 0.2s" }}>{m}</div>)}
                  </div>
                </div>
              </div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              {editingEvent && <button onClick={() => deleteEvent(editingEvent.id)} style={{ flex: 1, background: "#FF6B6B22", border: "1px solid #FF6B6B44", color: "#FF6B6B", borderRadius: 12, padding: "14px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>削除</button>}
              <button onClick={saveEvent} style={{ flex: 2, background: "linear-gradient(135deg,#A29BFE,#6C5CE7)", border: "none", color: "#fff", borderRadius: 12, padding: "14px", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 20px #6C5CE755" }}>{editingEvent ? "保存" : "追加する"}</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        input[type="time"]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2A2A40; border-radius: 2px; }
      `}</style>
    </div>
  );
}
