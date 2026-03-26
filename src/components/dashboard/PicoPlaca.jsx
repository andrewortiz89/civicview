// src/components/dashboard/PicoPlaca.jsx — v4 corregido
// Compatible con picoPlacaService.js y constants.js (norma vigente 2026)
import { useState, useEffect } from "react";
import { Car, Clock, CheckCircle2, XCircle, AlertTriangle,
  Trash2, ExternalLink, Info } from "lucide-react";
import usePicoPlaca from "../../hooks/usePicoPlaca";
import {
  PICO_PLACA_SCHEDULE,   // { particulares:{start,end}, taxis:{...}, carga:{...} }
  PICO_PLACA_EXEMPTIONS, // array de strings
} from "../../utils/constants";
import PicoPlacaService from "../../services/picoPlacaService";

// ── Tokens Neo-Táctil ─────────────────────────────────────────
const T = {
  bg:"#0d1520", surface:"#111c2d",
  blue:"#38b6ff", cyan:"#38dcc8", green:"#50dc64",
  red:"#ff6680", amber:"#f0b830", purple:"#d880ff",
  text:"#e8f4ff", text2:"rgba(220,235,248,0.72)", text3:"#8aaabb",
  border:"rgba(56,182,255,0.12)",
  mono:"'DM Mono','JetBrains Mono',monospace",
  display:"'Syne',sans-serif",
  num:{fontFamily:"'Barlow Condensed','Syne',sans-serif",
    fontWeight:700, letterSpacing:"-0.01em", lineHeight:1},
};

// ── Helpers ───────────────────────────────────────────────────
function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function pad(n) { return String(Math.max(0, n)).padStart(2, "0"); }

// restrictedDigits viene como string "6-7-8-9-0" del servicio
function parseDigits(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === "string") return raw.split("-").map(s => s.trim());
  return [];
}

function isDigitRestricted(userDigit, restrictedDigitsRaw) {
  if (!userDigit || !restrictedDigitsRaw) return false;
  return parseDigits(restrictedDigitsRaw).includes(String(userDigit));
}

// Countdown a fin o inicio de franja única (particulares: 06:00–21:00)
function getCountdown() {
  const schedule = PICO_PLACA_SCHEDULE.particulares;
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const sec = now.getSeconds();
  const start = timeToMinutes(schedule.start); // 360
  const end   = timeToMinutes(schedule.end);   // 1260

  if (cur >= start && cur < end) {
    const diff = (end - cur) * 60 - sec;
    return {
      h:Math.floor(diff/3600), m:Math.floor((diff%3600)/60), s:diff%60,
      label:"La restricción de hoy termina en", isActive:true, done:false,
    };
  } else if (cur < start) {
    const diff = (start - cur) * 60 - sec;
    return {
      h:Math.floor(diff/3600), m:Math.floor((diff%3600)/60), s:diff%60,
      label:"La restricción comienza en", isActive:false, done:false,
    };
  }
  return { done:true, label:"Restricciones del día terminadas", isActive:false };
}

// ── Componentes base ──────────────────────────────────────────
function Divider() {
  return <div style={{height:1, background:"rgba(56,182,255,0.08)", margin:"2px 0"}}/>;
}
function NbLabel({children, style={}}) {
  return <span style={{fontFamily:T.mono, fontSize:9, textTransform:"uppercase",
    letterSpacing:"0.1em", color:T.text3, display:"block", ...style}}>{children}</span>;
}
function Sk({w="100%",h=12,r=6}) {
  return <div style={{width:w, height:h, borderRadius:r,
    background:"rgba(56,182,255,0.07)", animation:"pulse 1.6s ease-in-out infinite"}}/>;
}

// ── Chip de dígito ────────────────────────────────────────────
function DigitChip({ digit, isRestricted, isUser=false, size="md" }) {
  const dim = size==="lg" ? 46 : size==="md" ? 40 : 30;
  const fs  = size==="lg" ? "1.5rem" : size==="md" ? "1.25rem" : "0.875rem";
  const color = isRestricted ? T.red : T.green;
  return (
    <div style={{
      width:dim, height:dim, flexShrink:0,
      display:"flex", alignItems:"center", justifyContent:"center",
      background: isRestricted ? "rgba(255,102,128,0.13)" : "rgba(80,220,100,0.1)",
      border:`2px solid ${isRestricted ? "rgba(255,102,128,0.4)" : "rgba(80,220,100,0.3)"}`,
      borderRadius:10, fontFamily:T.mono, fontWeight:700, fontSize:fs, color,
      boxShadow: isUser ? `0 0 14px ${color}60, 0 0 0 3px ${color}25` : "none",
      position:"relative",
    }}>
      {digit}
      {isUser && (
        <div style={{position:"absolute", top:-6, right:-6,
          width:13, height:13, borderRadius:"50%",
          background:color, border:`2px solid ${T.bg}`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:7, color:"#fff", fontWeight:700}}>★</div>
      )}
    </div>
  );
}

// ── 1. RESPUESTA PRINCIPAL ────────────────────────────────────
function MainAnswer({ today, isActiveNow, userDigit }) {
  if (!today) return null;
  const digits = parseDigits(today.restrictedDigits);
  const userRestricted = isDigitRestricted(userDigit, today.restrictedDigits);

  let msg, detail, color, Icon;

  if (!today.isRestricted) {
    msg    = "Hoy no hay restricción";
    detail = "Los sábados, domingos y festivos no aplica pico y placa para vehículos particulares en Bogotá.";
    color  = T.green; Icon = CheckCircle2;
  } else if (!userDigit) {
    const parity = today.dayOfMonth % 2 !== 0 ? "impar" : "par";
    msg    = `Hoy es día ${today.dayOfMonth} (${parity}) → placas ${today.dayOfMonth % 2 !== 0 ? "6, 7, 8, 9 y 0" : "1, 2, 3, 4 y 5"} con restricción`;
    detail = `Restricción de 6:00 AM a 9:00 PM. Ingresa el último dígito de tu placa abajo para saber si te aplica.`;
    color  = isActiveNow ? T.red : T.amber; Icon = isActiveNow ? XCircle : AlertTriangle;
  } else if (userRestricted) {
    msg    = `Tu placa termina en ${userDigit} — Hoy tienes restricción`;
    detail = `Tu dígito está en el grupo restringido hoy (${digits.join(", ")}). No puedes circular de 6:00 AM a 9:00 PM. Considera transporte público o el Pico y Placa Solidario.`;
    color  = T.red; Icon = XCircle;
  } else {
    msg    = `Tu placa termina en ${userDigit} — Hoy puedes circular`;
    detail = `Tu dígito no está en el grupo restringido hoy (restringidos: ${digits.join(", ")}). Puedes circular con normalidad.`;
    color  = T.green; Icon = CheckCircle2;
  }

  return (
    <div style={{margin:"14px 18px", borderRadius:14, padding:"16px 18px",
      background:`${color}0D`, border:`1px solid ${color}32`,
      display:"flex", alignItems:"flex-start", gap:14,
      position:"relative", overflow:"hidden"}}>
      <div style={{position:"absolute", top:0, left:0, right:0, height:2,
        background:`linear-gradient(90deg,transparent,${color}90,transparent)`}}/>
      <Icon size={30} style={{color, flexShrink:0, marginTop:2}}/>
      <div style={{flex:1}}>
        <p style={{...T.num, fontSize:"1.125rem", color, marginBottom:6, lineHeight:1.2}}>{msg}</p>
        <p style={{fontSize:"0.875rem", color:T.text2, lineHeight:1.6}}>{detail}</p>
      </div>
    </div>
  );
}

// ── 2. GUARDAR DÍGITO ─────────────────────────────────────────
function GuardarDigito({ userDigit, saveDigit, clearDigit, today }) {
  const [show, setShow] = useState(false);
  const [val,  setVal]  = useState("");
  const restricted = isDigitRestricted(userDigit, today?.restrictedDigits);
  const color = restricted ? T.red : T.green;

  if (userDigit) return (
    <div style={{margin:"0 18px 14px", display:"flex", alignItems:"center",
      justifyContent:"space-between", padding:"11px 16px", borderRadius:12,
      background:`${color}09`, border:`1px solid ${color}28`}}>
      <div style={{display:"flex", alignItems:"center", gap:12}}>
        <DigitChip digit={userDigit} isRestricted={restricted} isUser size="md"/>
        <div>
          <NbLabel style={{marginBottom:2}}>Dígito guardado de tu placa</NbLabel>
          <p style={{fontSize:"0.875rem", color:T.text, fontWeight:500}}>
            Placa termina en{" "}
            <span style={{color, fontFamily:T.mono, fontWeight:700}}>{userDigit}</span>
            {" — "}
            <span style={{color, fontWeight:600}}>
              {today?.isRestricted
                ? (restricted ? "Restricción hoy" : "Libre hoy")
                : "Sin restricción hoy"}
            </span>
          </p>
        </div>
      </div>
      <button onClick={clearDigit} style={{display:"flex", alignItems:"center", gap:5,
        padding:"6px 12px", borderRadius:8, cursor:"pointer",
        background:"rgba(255,102,128,0.1)", border:"1px solid rgba(255,102,128,0.25)",
        color:T.red, fontSize:"0.75rem"}}>
        <Trash2 size={11}/> Borrar
      </button>
    </div>
  );

  if (show) return (
    <div style={{margin:"0 18px 14px", padding:"14px 16px", borderRadius:12,
      background:"rgba(56,182,255,0.06)", border:"1px solid rgba(56,182,255,0.2)"}}>
      <p style={{fontSize:"0.875rem", color:T.text2, marginBottom:6}}>
        ¿Cuál es el <strong style={{color:T.text}}>último dígito</strong> de tu placa?
      </p>
      <p style={{fontSize:"0.75rem", color:T.text3, marginBottom:10, lineHeight:1.5}}>
        Ej: placa ABC-<strong style={{color:T.blue}}>4</strong>25 → ingresa <strong style={{color:T.blue}}>4</strong>
      </p>
      <div style={{display:"flex", gap:8}}>
        <input type="text" maxLength={1} value={val}
          onChange={e=>{ if(e.target.value===""||/^\d$/.test(e.target.value)) setVal(e.target.value); }}
          onKeyDown={e=>{ if(e.key==="Enter"&&val){ saveDigit(val); setShow(false); setVal(""); }}}
          autoFocus placeholder="0–9"
          style={{width:60, background:"rgba(56,182,255,0.08)",
            border:"1px solid rgba(56,182,255,0.3)", borderRadius:10,
            color:T.text, fontFamily:T.mono, fontWeight:700,
            fontSize:"1.75rem", textAlign:"center", padding:"0.4rem", outline:"none"}}/>
        <button onClick={()=>{ if(val){ saveDigit(val); setShow(false); setVal(""); }}}
          style={{padding:"0.4rem 1.25rem", borderRadius:10, cursor:"pointer",
            background:"rgba(56,182,255,0.18)", border:"1px solid rgba(56,182,255,0.4)",
            color:T.blue, fontWeight:600, fontSize:"0.875rem"}}>
          Guardar
        </button>
        <button onClick={()=>{setShow(false); setVal("");}}
          style={{padding:"0.4rem 0.875rem", borderRadius:10, cursor:"pointer",
            background:"rgba(56,182,255,0.05)", border:"1px solid rgba(56,182,255,0.15)",
            color:T.text3, fontSize:"0.875rem"}}>
          Cancelar
        </button>
      </div>
    </div>
  );

  return (
    <div style={{margin:"0 18px 14px"}}>
      <button onClick={()=>setShow(true)} style={{
        width:"100%", display:"flex", alignItems:"center", justifyContent:"center",
        gap:8, padding:"11px 14px", borderRadius:11, cursor:"pointer",
        background:"rgba(56,182,255,0.06)", border:"1px solid rgba(56,182,255,0.14)",
        color:T.text2, fontSize:"0.875rem", transition:"all 0.18s"}}
        onMouseEnter={e=>{e.currentTarget.style.background="rgba(56,182,255,0.12)";e.currentTarget.style.color=T.text;}}
        onMouseLeave={e=>{e.currentTarget.style.background="rgba(56,182,255,0.06)";e.currentTarget.style.color=T.text2;}}>
        <Car size={15}/> Ingresar el último dígito de mi placa
      </button>
    </div>
  );
}

// ── 3. COUNTDOWN ─────────────────────────────────────────────
function CountdownSection({ today, userDigit }) {
  const [cd, setCd] = useState(getCountdown);
  useEffect(()=>{
    const id = setInterval(()=>setCd(getCountdown()), 1000);
    return ()=>clearInterval(id);
  }, []);

  if (!today?.isRestricted || cd.done) return null;

  const userRestricted = isDigitRestricted(userDigit, today?.restrictedDigits);
  const cdColor = !userDigit ? T.amber : userRestricted ? T.red : T.text3;

  return (
    <div style={{padding:"14px 18px"}}>
      <NbLabel style={{marginBottom:10}}>{cd.label}</NbLabel>
      <div style={{display:"flex", alignItems:"flex-end", gap:4, marginBottom:12}}>
        {[{v:pad(cd.h),l:"H"},{sep:true},{v:pad(cd.m),l:"M"},{sep:true},{v:pad(cd.s),l:"S"}]
          .map((item,i)=> item.sep
            ? <div key={i} style={{...T.num, fontSize:"2.5rem", color:cdColor, paddingBottom:14, opacity:0.4}}>:</div>
            : <div key={i} style={{textAlign:"center"}}>
                <div style={{...T.num, fontSize:"2.5rem", color:cdColor}}>{item.v}</div>
                <div style={{fontSize:"0.5rem", color:T.text3, fontFamily:T.mono, letterSpacing:"0.1em"}}>{item.l}</div>
              </div>
          )}
        <div style={{marginLeft:12, marginBottom:16}}>
          {!userDigit
            ? <p style={{fontSize:"0.8125rem", color:T.text3}}>Ingresa tu dígito para ver si te aplica</p>
            : userRestricted
              ? <p style={{fontSize:"0.8125rem", color:T.red, fontWeight:600}}>Tu placa tiene restricción</p>
              : <p style={{fontSize:"0.8125rem", color:T.green, fontWeight:600}}>Tu placa puede circular ✓</p>
          }
        </div>
      </div>
      {/* Horario único claro */}
      <div style={{display:"flex", alignItems:"center", gap:8, padding:"10px 14px",
        borderRadius:10,
        background: cd.isActive ? "rgba(255,102,128,0.08)" : "rgba(56,182,255,0.06)",
        border:`1px solid ${cd.isActive ? "rgba(255,102,128,0.25)" : "rgba(56,182,255,0.12)"}`}}>
        <Clock size={14} style={{color: cd.isActive ? T.red : T.text3, flexShrink:0}}/>
        <div>
          <span style={{fontSize:"0.8125rem", color:T.text, fontWeight:600}}>
            Horario de restricción:{" "}
          </span>
          <span style={{fontSize:"0.8125rem", color: cd.isActive ? T.red : T.text2,
            fontFamily:T.mono, fontWeight:700}}>
            6:00 AM – 9:00 PM
          </span>
          <span style={{fontSize:"0.75rem", color:T.text3}}> · Lunes a viernes</span>
        </div>
        {cd.isActive && (
          <span style={{marginLeft:"auto", fontSize:"0.5625rem", color:T.red,
            fontFamily:T.mono, fontWeight:700, padding:"2px 7px",
            background:"rgba(255,102,128,0.15)", borderRadius:999,
            border:"1px solid rgba(255,102,128,0.3)"}}>ACTIVA AHORA</span>
        )}
      </div>
    </div>
  );
}

// ── 4. DÍGITOS DE HOY ─────────────────────────────────────────
function DigitosHoy({ today, userDigit }) {
  if (!today?.isRestricted) return null;
  const digits = parseDigits(today.restrictedDigits);
  const allDigits = ["0","1","2","3","4","5","6","7","8","9"];
  const freeDigits = allDigits.filter(d => !digits.includes(d));
  const parity = today.dayOfMonth % 2 !== 0 ? "impar" : "par";

  return (
    <div style={{padding:"14px 18px"}}>
      {/* Explicación de la norma */}
      <div style={{display:"flex", alignItems:"flex-start", gap:10, padding:"10px 14px",
        borderRadius:10, background:"rgba(56,182,255,0.06)",
        border:"1px solid rgba(56,182,255,0.12)", marginBottom:14}}>
        <Info size={14} style={{color:T.blue, flexShrink:0, marginTop:1}}/>
        <p style={{fontSize:"0.8125rem", color:T.text2, lineHeight:1.5}}>
  Hoy es día <strong style={{color:T.text}}>{today.dayOfMonth}</strong> —{" "}
  <strong style={{color:T.blue}}>{today.parityLabel}</strong>.{" "}
  La norma 2026 establece que restringen las placas terminadas en{" "}
  <strong style={{color:T.red}}>{today.restrictedDigits.join(", ")}</strong>.
</p>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16}}>
        <div>
          <NbLabel style={{marginBottom:10, color:"rgba(255,102,128,0.85)"}}>
            🚫 No pueden circular hoy
          </NbLabel>
          <div style={{display:"flex", gap:7, flexWrap:"wrap"}}>
            {digits.map(d=>(
              <DigitChip key={d} digit={d} isRestricted
                isUser={String(userDigit)===d}/>
            ))}
          </div>
          {userDigit && digits.includes(String(userDigit)) && (
            <p style={{fontSize:"0.75rem", color:T.red, marginTop:8, fontFamily:T.mono}}>
              ← Tu placa ({userDigit}) tiene restricción hoy
            </p>
          )}
        </div>
        <div>
          <NbLabel style={{marginBottom:10, color:"rgba(80,220,100,0.85)"}}>
            ✅ Pueden circular hoy
          </NbLabel>
          <div style={{display:"flex", gap:6, flexWrap:"wrap"}}>
            {freeDigits.map(d=>(
              <DigitChip key={d} digit={d} isRestricted={false}
                isUser={String(userDigit)===d} size="sm"/>
            ))}
          </div>
          {userDigit && freeDigits.includes(String(userDigit)) && (
            <p style={{fontSize:"0.75rem", color:T.green, marginTop:8, fontFamily:T.mono}}>
              ← Tu placa ({userDigit}) puede circular ✓
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 5. CALENDARIO SEMANAL (generado desde el servicio) ────────
function CalendarioSemanal({ userDigit }) {
  const weekCalendar = PicoPlacaService.getWeekCalendar();
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div style={{padding:"14px 18px"}}>
      <NbLabel style={{marginBottom:6}}>Calendario semanal · Particulares</NbLabel>
      <p style={{fontSize:"0.75rem", color:T.text3, marginBottom:12, lineHeight:1.5}}>
        La restricción alterna cada día según si la fecha del mes es par o impar.
      </p>
      <div style={{display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8}}>
        {weekCalendar.map(day=>{
          const isToday = day.date === todayStr;
          const digits = parseDigits(day.restrictedDigits);
          const userHere = userDigit && digits.includes(String(userDigit));
          const parity = day.dayOfMonth % 2 !== 0 ? "impar" : "par";

          return (
            <div key={day.date} style={{
              borderRadius:12, padding:"11px 10px 10px",
              background: isToday ? "rgba(56,182,255,0.1)"
                : userHere ? "rgba(255,102,128,0.06)"
                : "rgba(56,182,255,0.04)",
              border:`1px solid ${isToday ? "rgba(56,182,255,0.3)"
                : userHere ? "rgba(255,102,128,0.2)"
                : "rgba(56,182,255,0.1)"}`,
              position:"relative",
            }}>
              {isToday && <div style={{position:"absolute",top:0,left:0,right:0,height:2,
                background:"linear-gradient(90deg,transparent,#38b6ff,transparent)"}}/>}

              <div style={{display:"flex",alignItems:"center",
                justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:"0.5625rem",fontFamily:T.mono,
                  color:isToday?T.blue:T.text3,fontWeight:isToday?700:400,
                  letterSpacing:"0.08em"}}>
                  {day.dayName.substring(0,3).toUpperCase()}
                </span>
                {isToday && <span style={{fontSize:"0.5rem",color:T.blue,
                  fontFamily:T.mono,fontWeight:700}}>HOY</span>}
              </div>

              {/* Número del día + paridad */}
              <div style={{marginBottom:7}}>
                <span style={{...T.num, fontSize:"1.375rem",
                  color:isToday?T.blue:T.text}}>{day.dayOfMonth}</span>
                <span style={{fontSize:"0.5rem", color:T.text3,
                  fontFamily:T.mono, marginLeft:4}}>{parity}</span>
              </div>

              {/* Dígitos restringidos */}
              {day.isRestricted ? (
                <>
                  <div style={{fontSize:"0.5rem",color:"rgba(255,102,128,0.65)",
                    fontFamily:T.mono,marginBottom:3}}>RESTRINGIDOS</div>
                  <div style={{fontSize:"0.6875rem",fontFamily:T.mono,fontWeight:700,
                    color:T.red,letterSpacing:"0.02em"}}>{digits.join("·")}</div>
                  {userDigit && (
                    <div style={{fontSize:"0.5625rem",fontFamily:T.mono,
                      color:userHere?T.red:T.green,fontWeight:600,marginTop:4}}>
                      {userHere ? "⚠ Tu placa" : "✓ Libre"}
                    </div>
                  )}
                </>
              ) : (
                <div style={{display:"flex",alignItems:"center",gap:4,marginTop:4}}>
                  <CheckCircle2 size={11} style={{color:T.green}}/>
                  <span style={{fontSize:"0.625rem",color:T.green,fontFamily:T.mono}}>
                    Libre
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p style={{fontSize:"0.625rem",color:T.text3,marginTop:10}}>
        Sábados y domingos sin restricción · Festivos: pico y placa regional
      </p>
    </div>
  );
}

// ── 6. EXCEPCIONES ────────────────────────────────────────────
const EXCEPCIONES = [
  {icon:"🏍️",title:"Motocicletas",        texto:"Completamente exentas del pico y placa (Decreto 003 de 2023)."},
  {icon:"⚡",title:"Eléctricos/Híbridos",  texto:"Vehículos 100% eléctricos, híbridos y cero emisiones están exentos."},
  {icon:"🚑",title:"Emergencias",           texto:"Ambulancias, bomberos, policía y seguridad del Estado."},
  {icon:"♿",title:"Discapacidad",          texto:"Vehículos que transporten personas en condición de discapacidad."},
  {icon:"🏫",title:"Transporte escolar",   texto:"Debidamente identificado y contratado con instituciones."},
  {icon:"💳",title:"P&P Solidario",        texto:"Pago en movilidadbogota.gov.co para circular días restringidos."},
];

// ── Skeleton ──────────────────────────────────────────────────
function PicoPlacaSkeleton() {
  return (
    <div style={{padding:"20px 18px",display:"flex",flexDirection:"column",gap:16}}>
      <Sk w="60%" h={72} r={14}/>
      <Sk h={80} r={12}/>
      <Sk h={60} r={12}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
        {[1,2,3,4,5].map(i=><Sk key={i} h={90} r={12}/>)}
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────
const PicoPlaca = () => {
  const { data, loading, error, userDigit, saveDigit, clearDigit } = usePicoPlaca();

  if (loading) return <PicoPlacaSkeleton/>;
  if (error) return (
    <div style={{padding:24, display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", gap:12, textAlign:"center", minHeight:200}}>
      <XCircle size={32} style={{color:T.red}}/>
      <p style={{fontFamily:T.display, fontWeight:700, fontSize:"0.9375rem", color:T.text}}>
        Error al cargar restricciones</p>
      <p style={{fontSize:"0.8125rem", color:T.text2}}>{error}</p>
    </div>
  );

  // Desestructura lo que devuelve el servicio actualizado
  const { today, isActiveNow, normaVigente, horario } = data;
  const restricted = today?.isRestricted;
  const digits = parseDigits(today?.restrictedDigits);
  const freeCount = 10 - digits.length;

  return (
    <div style={{display:"flex", flexDirection:"column", gap:0}}>

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"16px 18px 14px", borderBottom:"1px solid rgba(56,182,255,0.08)"}}>
        <div style={{display:"flex", alignItems:"center", gap:9}}>
          <div style={{width:34, height:34, borderRadius:10,
            background:"rgba(56,182,255,0.15)", border:"1px solid rgba(56,182,255,0.35)",
            display:"flex", alignItems:"center", justifyContent:"center"}}>
            <Car size={16} style={{color:T.blue}}/>
          </div>
          <div>
            <p style={{fontFamily:T.display, fontWeight:800, fontSize:"1rem",
              color:T.text, lineHeight:1.2}}>Pico y Placa</p>
            <p style={{fontSize:"0.6875rem", color:T.text3, fontFamily:T.mono, marginTop:1}}>
              Bogotá · {today?.dayName} {today?.dayOfMonth} · {today?.parityLabel || ""}
            </p>
          </div>
        </div>

        {/* Badge estado del día */}
        {!restricted ? (
          <div style={{display:"flex", alignItems:"center", gap:6, padding:"5px 11px",
            borderRadius:999, background:"rgba(80,220,100,0.1)",
            border:"1px solid rgba(80,220,100,0.25)"}}>
            <span style={{width:6, height:6, borderRadius:"50%", background:T.green}}/>
            <span style={{fontSize:"0.6875rem", fontFamily:T.mono, fontWeight:600,
              color:T.green, letterSpacing:"0.05em"}}>SIN RESTRICCIÓN HOY</span>
          </div>
        ) : (
          <div style={{display:"flex", alignItems:"center", gap:6, padding:"5px 11px",
            borderRadius:999,
            background: isActiveNow ? "rgba(255,102,128,0.15)" : "rgba(240,184,48,0.12)",
            border:`1px solid ${isActiveNow ? "rgba(255,102,128,0.35)" : "rgba(240,184,48,0.3)"}`}}>
            <span style={{width:6, height:6, borderRadius:"50%", flexShrink:0,
              background:isActiveNow?T.red:T.amber,
              boxShadow:`0 0 5px ${isActiveNow?T.red:T.amber}`,
              animation:"pulse 2s ease-in-out infinite"}}/>
            <span style={{fontSize:"0.6875rem", fontFamily:T.mono, fontWeight:600,
              color:isActiveNow?T.red:T.amber, letterSpacing:"0.05em"}}>
              {isActiveNow ? `ACTIVA · DÍG. ${digits.join("·")}` : `HOY · DÍG. ${digits.join("·")}`}
            </span>
          </div>
        )}
      </div>

      {/* 1. RESPUESTA PRINCIPAL */}
      <MainAnswer today={today} isActiveNow={isActiveNow} userDigit={userDigit}/>

      {/* 2. GUARDAR DÍGITO */}
      <GuardarDigito userDigit={userDigit} saveDigit={saveDigit}
        clearDigit={clearDigit} today={today}/>

      <Divider/>

      {/* 3. COUNTDOWN */}
      <CountdownSection today={today} userDigit={userDigit}/>

      <Divider/>

      {/* 4. DÍGITOS DE HOY */}
      <DigitosHoy today={today} userDigit={userDigit}/>

      <Divider/>

      {/* 5. CALENDARIO SEMANAL */}
      <CalendarioSemanal userDigit={userDigit}/>

      <Divider/>

      {/* 6. EXCEPCIONES */}
      <div style={{padding:"14px 18px"}}>
        <NbLabel style={{marginBottom:12}}>Excepciones al pico y placa · Decreto 003 de 2023</NbLabel>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10}}>
          {EXCEPCIONES.map((e,i)=>(
            <div key={i} style={{borderRadius:12, padding:"12px 13px 11px",
              background:"rgba(56,182,255,0.04)", border:"1px solid rgba(56,182,255,0.1)"}}>
              <div style={{fontSize:20, lineHeight:1, marginBottom:7}}>{e.icon}</div>
              <p style={{fontFamily:T.display, fontWeight:700, fontSize:"0.8125rem",
                color:T.text, marginBottom:5, lineHeight:1.2}}>{e.title}</p>
              <p style={{fontSize:"0.75rem", color:T.text2, lineHeight:1.5}}>{e.texto}</p>
            </div>
          ))}
        </div>
        <a href="https://www.movilidadbogota.gov.co" target="_blank" rel="noopener noreferrer"
          style={{display:"flex", alignItems:"center", gap:6, marginTop:12,
            padding:"9px 14px", borderRadius:10,
            background:"rgba(56,182,255,0.08)", border:"1px solid rgba(56,182,255,0.2)",
            color:T.blue, fontSize:"0.8125rem", fontWeight:600, textDecoration:"none"}}>
          <ExternalLink size={13}/>
          Solicitar Pico y Placa Solidario · movilidadbogota.gov.co
        </a>
      </div>

      <Divider/>

      {/* FOOTER STATS */}
      <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)",
        background:"rgba(0,0,0,0.25)"}}>
        {[
          {val:restricted?digits.join("·"):"—", label:"RESTRINGIDOS HOY", color:restricted?T.red:T.green},
          {val:"1",                              label:"FRANJA HORARIA",   color:T.amber},
          {val:String(freeCount),                label:"DÍGITOS LIBRES",   color:T.green},
          {val:"$633.200",                       label:"MULTA C-14 2026",  color:T.text3},
        ].map((s,i)=>(
          <div key={i} style={{padding:"10px 14px",
            borderRight:i<3?"1px solid rgba(56,182,255,0.08)":"none"}}>
            <p style={{...T.num, fontSize:"1.05rem", color:s.color, marginBottom:3}}>{s.val}</p>
            <p style={{fontSize:"0.5rem", color:T.text3,
              fontFamily:T.mono, letterSpacing:"0.07em"}}>{s.label}</p>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(0.85)}}
      `}</style>
    </div>
  );
};

export default PicoPlaca;