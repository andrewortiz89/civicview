// src/components/dashboard/AirQuality.jsx — Nebula FINAL expandido
import { Wind, Info, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react";
import useAirQuality from "../../hooks/useAirQuality";
import { getRelativeTime } from "../../utils/dateHelpers";
import AirQualityService from "../../services/airQualityService";

// ── Tokens ────────────────────────────────────────────────────
const T = {
  card:"rgba(56,182,255,0.06)", border:"rgba(56,182,255,0.1)",
  purpleL:"#38b6ff", cyanL:"#38dcc8", greenL:"#50dc64",
  redL:"#ff6680", amberL:"#f0b830", orangeL:"#ff7840",
  text:"#e8f4ff", text2:"rgba(220,235,248,0.72)", text3:"#8aaabb",
  mono:"'DM Mono','JetBrains Mono',monospace",
  display:"'Syne',sans-serif",
  num:{fontFamily:"'Barlow Condensed','Syne',sans-serif",fontWeight:700,letterSpacing:"-0.01em",lineHeight:1},
};

// ── Límites OMS para cada contaminante (µg/m³) ───────────────
const OMS = { pm25:15, pm10:45, o3:100, no2:40 };
const MAVDT = { pm25:25, pm10:50, o3:80, no2:200 };

// ── Escala AQI completa ───────────────────────────────────────
const AQI_SCALE = [
  { range:"0–50",   label:"Bueno",           c:"#50dc64", bg:"rgba(74,222,128,0.12)"  },
  { range:"51–100", label:"Moderado",         c:"#f0b830", bg:"rgba(251,191,36,0.12)"  },
  { range:"101–150",label:"Grupos sensibles", c:"#ff7840", bg:"rgba(251,146,60,0.12)"  },
  { range:"151–200",label:"Dañino",           c:"#ff6680", bg:"rgba(248,113,113,0.12)" },
  { range:"201–300",label:"Muy dañino",       c:"#38b6ff", bg:"rgba(167,139,250,0.12)" },
  { range:"301+",   label:"Peligroso",        c:"#f43f5e", bg:"rgba(244,63,94,0.12)"   },
];

// Recomendaciones según categoría
const RECOMENDACIONES = {
  "Bueno": [
    { icon:"🚴", title:"Ciclistas",         texto:"Condiciones ideales. Disfruta la ciclovía sin restricciones." },
    { icon:"🏃", title:"Deporte al aire",   texto:"Excelente para actividad física intensa en exteriores." },
    { icon:"🪟", title:"En casa",           texto:"Ventila tu hogar. La calidad del aire es óptima hoy." },
  ],
  "Moderado": [
    { icon:"🚴", title:"Ciclistas",         texto:"Usa tapabocas si pedaleas más de 30 min. Prefiere horas de bajo tráfico." },
    { icon:"🏃", title:"Deporte al aire",   texto:"Personas sensibles deben reducir actividad intensa prolongada." },
    { icon:"🪟", title:"En casa",           texto:"Ventila en horas de baja contaminación (antes de 7am o después de 8pm)." },
  ],
  "Dañino para grupos sensibles": [
    { icon:"😷", title:"Mascarilla",        texto:"Usa tapabocas N95 en exteriores, especialmente en zonas de tráfico." },
    { icon:"🏃", title:"Deporte al aire",   texto:"Personas con asma o enfermedades respiratorias deben evitar exteriores." },
    { icon:"🏠", title:"Permanece adentro", texto:"Mantén ventanas cerradas. Usa purificador si tienes uno." },
  ],
  "default": [
    { icon:"😷", title:"Mascarilla",        texto:"Usa protección respiratoria al salir. Minimiza el tiempo exterior." },
    { icon:"🏠", title:"Permanece adentro", texto:"Evita actividad física al aire libre. Mantén el hogar ventilado solo por momentos." },
    { icon:"⚠️", title:"Grupos de riesgo",  texto:"Niños, adultos mayores y personas con condiciones respiratorias: quédense en casa." },
  ],
};

// ── Helpers visuales ──────────────────────────────────────────
function LiveDot({ color }) {
  return <span style={{ display:"inline-block", width:6, height:6, borderRadius:"50%",
    flexShrink:0, background:color, boxShadow:`0 0 6px ${color}`,
    animation:"livePing 2s ease-in-out infinite" }}/>;
}

function NbLabel({ children, style={} }) {
  return <span style={{ fontFamily:T.mono, fontSize:10, textTransform:"uppercase",
    letterSpacing:"0.1em", color:T.text3, display:"block", ...style }}>{children}</span>;
}

function Sk({ w="100%", h=12, r=6 }) {
  return <div style={{ width:w, height:h, borderRadius:r,
    background:"rgba(56,182,255,0.08)", animation:"livePing 1.6s ease-in-out infinite" }}/>;
}

function Divider() {
  return <div style={{ height:1, background:"rgba(56,182,255,0.07)", margin:"4px 0" }}/>;
}

// ── Tarjeta de contaminante individual (estilo dashboard) ─────
function ContaminanteCard({ label, badge, value, unit, color, omsLimit, mavdtLimit, isDominant }) {
  if (!value && value !== 0) return null;
  const val = Math.round(value);
  const omsPct = Math.min((val / (omsLimit * 2)) * 100, 100);
  const overOms = val > omsLimit;
  const overMavdt = mavdtLimit && val > mavdtLimit;

  // Color de la barra según nivel
  const barColor = overMavdt ? T.redL : overOms ? T.orangeL : T.greenL;

  return (
    <div style={{
      borderRadius:14, padding:"16px 16px 14px",
      background: isDominant ? `${color}10` : "rgba(56,182,255,0.05)",
      border:`1px solid ${isDominant ? `${color}40` : "rgba(56,182,255,0.1)"}`,
      position:"relative", overflow:"hidden",
    }}>
      {isDominant && (
        <div style={{ position:"absolute", top:0, left:0, right:0, height:2,
          background:`linear-gradient(90deg,transparent,${color}90,transparent)` }}/>
      )}

      {/* Badge del contaminante */}
      <div style={{ display:"flex", alignItems:"center",
        justifyContent:"space-between", marginBottom:10 }}>
        <div style={{ width:32, height:32, borderRadius:9,
          background:`${color}20`, border:`1px solid ${color}35`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontFamily:T.mono, fontSize:"0.6875rem", fontWeight:700, color }}>
          {badge}
        </div>
        {isDominant && (
          <span style={{ fontSize:"0.5625rem", fontWeight:700, padding:"2px 7px",
            borderRadius:999, background:`${color}25`, color,
            fontFamily:T.mono, letterSpacing:"0.07em" }}>DOM</span>
        )}
      </div>

      {/* Valor grande */}
      <div style={{ ...T.num, fontSize:"1.875rem", color, marginBottom:4 }}>
        {val}
      </div>
      <div style={{ fontSize:"0.6875rem", color:T.text3,
        fontFamily:T.mono, marginBottom:10 }}>
        µg/m³ — {label}
      </div>

      {/* Barra de progreso */}
      <div style={{ height:4, background:"rgba(56,182,255,0.08)",
        borderRadius:2, overflow:"hidden", marginBottom:6 }}>
        <div style={{ width:`${omsPct}%`, height:"100%", background:barColor,
          borderRadius:2, boxShadow:`0 0 8px ${barColor}60`,
          transition:"width 1s cubic-bezier(0.16,1,0.3,1)" }}/>
      </div>

      {/* Límites OMS / MAVDT */}
      <div style={{ display:"flex", justifyContent:"space-between" }}>
        <span style={{ fontSize:"0.5625rem", color: overOms ? T.orangeL : T.text3,
          fontFamily:T.mono }}>
          OMS: {omsLimit}
          {overOms && ` · ${Math.round((val/omsLimit)*100-100)}% sobre límite`}
        </span>
        {mavdtLimit && (
          <span style={{ fontSize:"0.5625rem", color: overMavdt ? T.redL : T.text3,
            fontFamily:T.mono }}>
            MAVDT: {mavdtLimit}
          </span>
        )}
      </div>

      {/* Estado */}
      <div style={{ marginTop:8 }}>
        <span style={{
          fontSize:"0.6875rem", fontWeight:700, padding:"2px 8px", borderRadius:999,
          background: overMavdt ? "rgba(248,113,113,0.15)" : overOms ? "rgba(251,146,60,0.15)" : "rgba(74,222,128,0.12)",
          color: overMavdt ? T.redL : overOms ? T.orangeL : T.greenL,
          border:`1px solid ${overMavdt ? "rgba(248,113,113,0.3)" : overOms ? "rgba(251,146,60,0.3)" : "rgba(74,222,128,0.25)"}`,
          fontFamily:T.mono,
        }}>
          {overMavdt ? "No saludable" : overOms ? "Atención" : "Bueno"}
        </span>
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────
function AQISkeleton() {
  return (
    <div style={{ padding:20, display:"flex", flexDirection:"column", gap:16 }}>
      <Sk w="40%" h={13}/> <Sk h={90} r={12}/> <Sk h={12} r={6}/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        <Sk h={110} r={14}/><Sk h={110} r={14}/><Sk h={110} r={14}/><Sk h={110} r={14}/>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────
const AirQuality = () => {
  const { data, loading, error, refresh } = useAirQuality();

  if (loading) return <AQISkeleton/>;

  if (error) return (
    <div style={{ padding:24, minHeight:200, display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", gap:16, textAlign:"center" }}>
      <span style={{ fontSize:32 }}>💨</span>
      <p style={{ fontFamily:T.display, fontWeight:700, fontSize:"0.9375rem", color:T.text }}>
        Sin datos de calidad del aire</p>
      <p style={{ fontSize:"0.8125rem", color:T.text2 }}>{error}</p>
      <button onClick={refresh} style={{ display:"flex", alignItems:"center", gap:6,
        padding:"8px 16px", borderRadius:10, cursor:"pointer",
        background:"rgba(56,182,255,0.06)", border:"1px solid rgba(56,182,255,0.12)",
        color:T.text2, fontSize:"0.8125rem" }}>
        <RefreshCw size={13}/> Reintentar
      </button>
    </div>
  );

  const { aqi, category, color, icon, recommendation,
    pollutants, dominantPollutant, station, time, isStale } = data;

  const pct = Math.min((aqi / 300) * 100, 100);
  const recs = RECOMENDACIONES[category] || RECOMENDACIONES["default"];

  // Segmentos barra AQI
  const segments = [
    { w:"16.7%", c:"#50dc64", active: aqi<=50 },
    { w:"16.7%", c:"#f0b830", active: aqi>50&&aqi<=100 },
    { w:"16.7%", c:"#ff7840", active: aqi>100&&aqi<=150 },
    { w:"16.7%", c:"#ff6680", active: aqi>150&&aqi<=200 },
    { w:"16.7%", c:"#38b6ff", active: aqi>200&&aqi<=250 },
    { w:"16.5%", c:"#f43f5e", active: aqi>250 },
  ];

  const contaminantes = [
    { key:"pm25", label:"PM2.5",  badge:"2.5",  value:pollutants?.pm25, color:"#f0b830", oms:OMS.pm25,  mavdt:MAVDT.pm25 },
    { key:"pm10", label:"PM10",   badge:"10",   value:pollutants?.pm10, color:T.purpleL, oms:OMS.pm10,  mavdt:MAVDT.pm10 },
    { key:"no2",  label:"NO₂",    badge:"NO₂",  value:pollutants?.no2,  color:T.greenL,  oms:OMS.no2,   mavdt:MAVDT.no2  },
    { key:"o3",   label:"Ozono",  badge:"O₃",   value:pollutants?.o3,   color:T.orangeL, oms:OMS.o3,    mavdt:MAVDT.o3   },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:0 }}>

      {/* ── Sección 1: Header + ICA global ──────────────────── */}
      <div style={{ padding:"18px 18px 16px", position:"relative" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center",
          justifyContent:"space-between", marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:9 }}>
            <div style={{ width:34, height:34, borderRadius:10,
              background:`${color}22`, border:`1px solid ${color}45`,
              display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Wind size={16} style={{ color }}/>
            </div>
            <div>
              <p style={{ ...T.num, fontSize:"1rem", color:T.text, lineHeight:1.2 }}>
                Calidad del Aire
              </p>
              <p style={{ fontSize:"0.6875rem", color:T.text3,
                fontFamily:T.mono, marginTop:1 }}>{station}</p>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {isStale && (
              <span style={{ display:"inline-flex", alignItems:"center", gap:5,
                fontSize:10, fontWeight:600, padding:"3px 9px", borderRadius:999,
                color:T.amberL, background:"rgba(245,158,11,0.15)",
                border:"1px solid rgba(245,158,11,0.3)", fontFamily:T.mono }}>
                <AlertTriangle size={10}/> Desactualizado
              </span>
            )}
            <button onClick={refresh} style={{ display:"flex", alignItems:"center",
              gap:5, padding:"5px 10px", borderRadius:8, cursor:"pointer",
              background:"rgba(56,182,255,0.06)", border:"1px solid rgba(56,182,255,0.1)",
              color:T.text3, fontSize:"0.6875rem" }}>
              <RefreshCw size={10}/> Actualizar
            </button>
          </div>
        </div>

        {/* Grid superior: ICA + contaminantes clave */}
        <div style={{ display:"grid", gridTemplateColumns:"1.2fr 1fr 1fr 1fr", gap:12 }}>

          {/* ICA Global */}
          <div style={{ borderRadius:14, padding:"16px",
            background:`${color}0E`, border:`1px solid ${color}35`,
            position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:2,
              background:`linear-gradient(90deg,transparent,${color}90,transparent)` }}/>
            <div style={{ position:"absolute", width:120, height:120, borderRadius:"50%",
              background:`radial-gradient(circle,${color}18 0%,transparent 65%)`,
              top:-30, right:-30, pointerEvents:"none" }}/>

            <NbLabel style={{ marginBottom:6 }}>ICA Global · Bogotá</NbLabel>
            <div style={{ ...T.num, fontSize:"3rem", color, marginBottom:6 }}>{aqi}</div>
            <p style={{ fontSize:"0.875rem", color:T.text,
              fontWeight:600, marginBottom:2 }}>{category}</p>
            <p style={{ fontSize:"0.6875rem", color:T.text3,
              fontFamily:T.mono, marginBottom:10 }}>{station}</p>

            {/* Mini barra AQI */}
            <div style={{ display:"flex", gap:1.5, height:4, borderRadius:999, overflow:"hidden" }}>
              {segments.map((seg,i)=>(
                <div key={i} style={{ width:seg.w, background:seg.c,
                  opacity:seg.active?1:0.18, transition:"opacity 0.4s" }}/>
              ))}
            </div>
            <div style={{ position:"relative", height:14, marginTop:3 }}>
              <div style={{ position:"absolute", left:`${pct}%`,
                transform:"translateX(-50%)",
                transition:"left 0.6s cubic-bezier(0.16,1,0.3,1)" }}>
                <div style={{ width:2, height:7, background:color,
                  borderRadius:1, margin:"0 auto" }}/>
                <div style={{ fontSize:"0.5rem", color, fontFamily:T.mono,
                  fontWeight:700, whiteSpace:"nowrap",
                  transform: pct>80?"translateX(-70%)":pct<20?"translateX(0)":"translateX(-50%)" }}>
                  {aqi}
                </div>
              </div>
            </div>

            <span style={{ display:"inline-flex", alignItems:"center",
              fontSize:"0.6875rem", fontWeight:700, padding:"3px 10px",
              borderRadius:999, marginTop:4,
              background:`${color}20`, border:`1px solid ${color}35`, color,
              fontFamily:T.mono }}>{category}</span>
          </div>

          {/* PM2.5 */}
          {pollutants?.pm25 != null && (
            <div style={{ borderRadius:14, padding:"16px",
              background: pollutants.pm25>OMS.pm25 ? "rgba(251,191,36,0.08)" : "rgba(56,182,255,0.05)",
              border:`1px solid ${pollutants.pm25>OMS.pm25 ? "rgba(251,191,36,0.3)" : "rgba(56,182,255,0.1)"}` }}>
              <NbLabel style={{ marginBottom:8 }}>PM2.5</NbLabel>
              <div style={{...T.num, fontSize:"2rem", color:"#f0b830", marginBottom:3}}>
                {Math.round(pollutants.pm25)}
              </div>
              <p style={{ fontSize:"0.6875rem", color:T.text3,
                fontFamily:T.mono, marginBottom:8 }}>
                µg/m³ · Límite OMS: {OMS.pm25}
              </p>
              <div style={{ height:3, background:"rgba(56,182,255,0.08)", borderRadius:2, overflow:"hidden", marginBottom:5 }}>
                <div style={{ width:`${Math.min((pollutants.pm25/(OMS.pm25*2))*100,100)}%`,
                  height:"100%", background:"#f0b830", borderRadius:2 }}/>
              </div>
              <p style={{ fontSize:"0.5625rem", color: pollutants.pm25>OMS.pm25 ? T.orangeL : T.greenL,
                fontFamily:T.mono }}>
                {pollutants.pm25>OMS.pm25
                  ? `${Math.round((pollutants.pm25/OMS.pm25)*100-100)}% sobre límite OMS`
                  : "Dentro del límite OMS"}
              </p>
            </div>
          )}

          {/* PM10 */}
          {pollutants?.pm10 != null && (
            <div style={{ borderRadius:14, padding:"16px",
              background: pollutants.pm10>OMS.pm10 ? "rgba(167,139,250,0.08)" : "rgba(56,182,255,0.05)",
              border:`1px solid ${pollutants.pm10>OMS.pm10 ? "rgba(167,139,250,0.3)" : "rgba(56,182,255,0.1)"}` }}>
              <NbLabel style={{ marginBottom:8 }}>PM10</NbLabel>
              <div style={{...T.num, fontSize:"2rem", color:T.purpleL, marginBottom:3}}>
                {Math.round(pollutants.pm10)}
              </div>
              <p style={{ fontSize:"0.6875rem", color:T.text3,
                fontFamily:T.mono, marginBottom:8 }}>
                µg/m³ · Límite OMS: {OMS.pm10}
              </p>
              <div style={{ height:3, background:"rgba(56,182,255,0.08)", borderRadius:2, overflow:"hidden", marginBottom:5 }}>
                <div style={{ width:`${Math.min((pollutants.pm10/(OMS.pm10*2))*100,100)}%`,
                  height:"100%", background:T.purpleL, borderRadius:2 }}/>
              </div>
              <p style={{ fontSize:"0.5625rem", color: pollutants.pm10>OMS.pm10 ? T.orangeL : T.greenL,
                fontFamily:T.mono }}>
                {pollutants.pm10>OMS.pm10
                  ? `${Math.round((pollutants.pm10/OMS.pm10)*100-100)}% sobre límite OMS`
                  : "Dentro del límite OMS"}
              </p>
            </div>
          )}

          {/* NO2 + O3 apilados */}
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {pollutants?.no2 != null && (
              <div style={{ borderRadius:12, padding:"14px 16px", flex:1,
                background:"rgba(56,182,255,0.05)", border:"1px solid rgba(56,182,255,0.1)" }}>
                <NbLabel style={{ marginBottom:5 }}>NO₂</NbLabel>
                <div style={{ ...T.num, fontSize:"1.5rem", color:T.greenL, lineHeight:1 }}>
                  {Math.round(pollutants.no2)}
                </div>
                <p style={{ fontSize:"0.5625rem", color:T.text3, fontFamily:T.mono, marginTop:2 }}>
                  µg/m³ — Dióxido Nitrógeno
                </p>
              </div>
            )}
            {pollutants?.o3 != null && (
              <div style={{ borderRadius:12, padding:"14px 16px", flex:1,
                background:"rgba(56,182,255,0.05)", border:"1px solid rgba(56,182,255,0.1)" }}>
                <NbLabel style={{ marginBottom:5 }}>O₃</NbLabel>
                <div style={{ ...T.num, fontSize:"1.5rem", color:T.orangeL, lineHeight:1 }}>
                  {Math.round(pollutants.o3)}
                </div>
                <p style={{ fontSize:"0.5625rem", color:T.text3, fontFamily:T.mono, marginTop:2 }}>
                  µg/m³ — Ozono
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Divider/>

      {/* ── Sección 2: Contaminantes en detalle ─────────────── */}
      <div style={{ padding:"16px 18px" }}>
        <NbLabel style={{ marginBottom:12 }}>Contaminantes · Análisis detallado</NbLabel>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:10 }}>
          {contaminantes.map(c=>(
            c.value != null && (
              <ContaminanteCard
                key={c.key}
                label={c.label} badge={c.badge} value={c.value}
                color={c.color} omsLimit={c.oms} mavdtLimit={c.mavdt}
                isDominant={dominantPollutant===c.key}
              />
            )
          ))}
        </div>
        <p style={{ fontSize:"0.6875rem", color:T.text3, marginTop:10, fontFamily:T.mono }}>
          DOM = Contaminante dominante:{" "}
          <span style={{ color:T.text2 }}>
            {AirQualityService.getPollutantName(dominantPollutant)}
          </span>
          {" · "}OMS = Organización Mundial de la Salud
          {" · "}MAVDT = Ministerio Ambiente Colombia
        </p>
      </div>

      <Divider/>

      {/* ── Sección 3: Recomendación + escala ───────────────── */}
      <div style={{ padding:"16px 18px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>

          {/* Recomendación principal */}
          <div>
            <NbLabel style={{ marginBottom:12 }}>Recomendación · {category}</NbLabel>
            <div style={{ display:"flex", alignItems:"flex-start", gap:10,
              padding:"14px 16px", borderRadius:12,
              background:`${color}0D`, border:`1px solid ${color}28`,
              marginBottom:10 }}>
              <Info size={15} style={{ color, flexShrink:0, marginTop:1 }}/>
              <p style={{ fontSize:"0.875rem", color:T.text2, lineHeight:1.6 }}>
                {recommendation}
              </p>
            </div>
          </div>

          {/* Escala de referencia */}
          <div>
            <NbLabel style={{ marginBottom:12 }}>Escala ICA · Referencia</NbLabel>
            <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
              {AQI_SCALE.map(s=>{
                const isActive = s.range.includes("+")
                  ? aqi >= parseInt(s.range)
                  : (() => {
                      const [min,max] = s.range.split("–").map(Number);
                      return aqi >= min && aqi <= max;
                    })();
                return (
                  <div key={s.range} style={{
                    display:"flex", alignItems:"center", gap:10,
                    padding:"7px 10px", borderRadius:8,
                    background: isActive ? s.bg : "transparent",
                    border:`1px solid ${isActive ? s.c+"40" : "transparent"}`,
                    transition:"all 0.2s",
                  }}>
                    <div style={{ width:8, height:8, borderRadius:"50%",
                      background:s.c, flexShrink:0,
                      boxShadow: isActive ? `0 0 8px ${s.c}` : "none" }}/>
                    <span style={{ fontSize:"0.6875rem", fontFamily:T.mono,
                      color: isActive ? T.text : T.text3, fontWeight: isActive ? 600 : 400,
                      flex:1 }}>
                      <span style={{ color: isActive ? s.c : T.text2,
                        fontWeight:700 }}>{s.range}</span> · {s.label}
                    </span>
                    {isActive && (
                      <CheckCircle size={12} style={{ color:s.c, flexShrink:0 }}/>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <Divider/>

      {/* ── Sección 4: Recomendaciones por tipo de usuario ──── */}
      <div style={{ padding:"16px 18px" }}>
        <NbLabel style={{ marginBottom:12 }}>
          Recomendaciones · ICA {aqi} {category}
        </NbLabel>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
          {recs.map((r,i)=>(
            <div key={i} style={{ borderRadius:12, padding:"14px 14px 12px",
              background:"rgba(56,182,255,0.05)",
              border:"1px solid rgba(56,182,255,0.1)" }}>
              <div style={{ fontSize:24, lineHeight:1, marginBottom:8 }}>{r.icon}</div>
              <p style={{ fontFamily:T.display, fontWeight:700,
                fontSize:"0.875rem", color:T.text, marginBottom:6,
                lineHeight:1.2 }}>{r.title}</p>
              <p style={{ fontSize:"0.8125rem", color:T.text2,
                lineHeight:1.55 }}>{r.texto}</p>
            </div>
          ))}
        </div>
      </div>

      <Divider/>

      {/* ── Footer ───────────────────────────────────────────── */}
      <div style={{ padding:"10px 18px", display:"flex",
        alignItems:"center", justifyContent:"space-between",
        background:"rgba(0,0,0,0.18)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
          <LiveDot color={T.greenL}/>
          <span style={{ fontSize:"0.6875rem", color:T.text3,
            fontFamily:T.mono, letterSpacing:"0.06em" }}>
            ACTUALIZADO {getRelativeTime(new Date(time))}
          </span>
        </div>
        <span style={{ fontSize:"0.6875rem", color:T.text3,
          fontFamily:T.mono }}>
          Fuente: AQICN · RMCAB
        </span>
      </div>
    </div>
  );
};

export default AirQuality;