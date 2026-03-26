// src/components/dashboard/Weather.jsx — Nebula FINAL expandido
import { useState, useEffect, useRef } from "react";
import { RefreshCw, AlertTriangle, Wind, Droplets, Eye, Gauge, Sun, Moon } from "lucide-react";
import useWeather from "../../hooks/useWeather";
import { formatTemperature, formatPercentage } from "../../utils/format";
import { getRelativeTime } from "../../utils/dateHelpers";

// ── Tokens ────────────────────────────────────────────────────
const T = {
  card:"rgba(56,182,255,0.06)", border:"rgba(56,182,255,0.1)",
  purpleL:"#38b6ff", cyanL:"#38dcc8", greenL:"#50dc64",
  redL:"#ff6680", amberL:"#f0b830", pinkL:"#d880ff", orangeL:"#ff7840",
  text:"#e8f4ff", text2:"rgba(220,235,248,0.72)", text3:"#8aaabb",
  mono:"'DM Mono','JetBrains Mono',monospace",
  display:"'Syne',sans-serif",
  // Números display grandes: peso 900 + kerning negativo = aspecto condensado y pesado
  num: {fontFamily:"'Barlow Condensed','Syne',sans-serif",fontWeight:700,letterSpacing:"-0.01em",lineHeight:1},
};

// ── Helpers ───────────────────────────────────────────────────
const getWeatherIcon = (code="") => {
  const n = new Date().getHours(); const night = n<6||n>20;
  if(code.includes("01")) return night ? "🌙" : "☀️";
  if(code.includes("02")) return night ? "☁️" : "⛅";
  if(code.includes("03")||code.includes("04")) return "☁️";
  if(code.includes("09")||code.includes("10")) return "🌧️";
  if(code.includes("11")) return "⛈️";
  if(code.includes("13")) return "🌨️";
  if(code.includes("50")) return "🌫️";
  return "🌤️";
};

const getAccent = (code="") => {
  if(code.includes("01")||code.includes("02")) return {color:"#f0b830",glow:"rgba(251,191,36,0.2)"};
  if(code.includes("09")||code.includes("10")||code.includes("11")) return {color:"#38dcc8",glow:"rgba(34,211,238,0.2)"};
  if(code.includes("13")) return {color:"#93c5fd",glow:"rgba(147,197,253,0.15)"};
  return {color:"#38b6ff",glow:"rgba(167,139,250,0.18)"};
};

// Genera pronóstico por hora simulado a partir de los datos actuales
const generateHourly = (current) => {
  if(!current) return [];
  const now = new Date();
  const hours = [];
  const base = current.temperature;
  for(let i=-2; i<=6; i++) {
    const h = new Date(now.getTime() + i*3600000);
    const hNum = h.getHours();
    // Variación térmica típica Bogotá: más frío en madrugada, más cálido al mediodía
    const variation = Math.sin((hNum - 6) * Math.PI / 12) * 3;
    const temp = Math.round(base + variation + (Math.random()-0.5));
    const pop = Math.max(0, Math.min(100, Math.round(
      current.humidity * 0.6 + (Math.random()-0.5)*20
    )));
    const code = hNum >= 6 && hNum <= 18 ? current.conditionCode : "01n";
    hours.push({
      hour: i===0 ? "AHORA" : `${String(hNum).padStart(2,"0")}:00`,
      temp, pop, code, isNow: i===0,
    });
  }
  return hours;
};

// Genera datos de gráfica para los 7 días del pronóstico
const generateChartData = (forecast) => {
  if(!forecast||!forecast.length) return [];
  return forecast.slice(0,7).map((day,i) => {
    const date = new Date(day.date);
    const label = i===0 ? "Hoy" :
      date.toLocaleDateString("es-CO",{weekday:"short"})
        .replace(".","").substring(0,3);
    return { label, max:Math.round(day.tempMax), min:Math.round(day.tempMin), pop:day.pop };
  });
};

// Calcula fase lunar aproximada
const getMoonPhase = () => {
  const now = new Date();
  const knownNew = new Date("2024-01-11");
  const lunation = 29.530588853;
  const diff = (now - knownNew) / (1000*60*60*24);
  const phase = ((diff % lunation) + lunation) % lunation;
  if(phase < 1.85) return {icon:"🌑",name:"Luna nueva",ilum:Math.round(phase/1.85*5)};
  if(phase < 7.38) return {icon:"🌒",name:"Creciente cóncava",ilum:Math.round(25+phase*3)};
  if(phase < 9.22) return {icon:"🌓",name:"Cuarto creciente",ilum:50};
  if(phase < 14.77) return {icon:"🌔",name:"Gibosa creciente",ilum:Math.round(55+phase*2)};
  if(phase < 16.61) return {icon:"🌕",name:"Luna llena",ilum:100};
  if(phase < 22.15) return {icon:"🌖",name:"Gibosa menguante",ilum:Math.round(75-(phase-16)*4)};
  if(phase < 23.99) return {icon:"🌗",name:"Cuarto menguante",ilum:50};
  if(phase < 29.53) return {icon:"🌘",name:"Creciente menguante",ilum:Math.round(25-(phase-24)*4)};
  return {icon:"🌑",name:"Luna nueva",ilum:2};
};

// Calcula amanecer/atardecer aproximado para Bogotá
const getSunTimes = () => {
  const now = new Date();
  const doy = Math.floor((now - new Date(now.getFullYear(),0,0)) / 86400000);
  const B = (360/365) * (doy - 81) * (Math.PI/180);
  const eqTime = 9.87*Math.sin(2*B) - 7.53*Math.cos(B) - 1.5*Math.sin(B);
  const lat = 4.71;
  const decl = 23.45 * Math.sin(B) * (Math.PI/180);
  const ha = Math.acos(-Math.tan(lat*Math.PI/180)*Math.tan(decl)) * (180/Math.PI);
  const noon = 12 - eqTime/60 - (-74.07/15);
  const rise = noon - ha/15;
  const set  = noon + ha/15;
  const fmt = (h) => {
    const hh = Math.floor(h), mm = Math.round((h-hh)*60);
    return `${String(hh).padStart(2,"0")}:${String(mm).padStart(2,"0")}`;
  };
  return {rise:fmt(rise), set:fmt(set)};
};

// UV índice estimado según condición y hora
const getUVIndex = (code, humidity) => {
  const h = new Date().getHours();
  if(h<7||h>18) return {val:0, label:"Sin UV"};
  const base = (h>=10&&h<=14) ? 6 : (h>=8&&h<=16) ? 4 : 2;
  const rain = code&&(code.includes("09")||code.includes("10")||code.includes("11"));
  const val = rain ? Math.max(1, base-3) : Math.round(base * (1 - (humidity||0)*0.003));
  const label = val<=2?"Bajo":val<=5?"Moderado":val<=7?"Alto":val<=10?"Muy alto":"Extremo";
  const color = val<=2?T.greenL:val<=5?T.amberL:val<=7?T.orangeL:T.redL;
  return {val, label, color};
};

// ── Sub-componentes ───────────────────────────────────────────
function NbLabel({children,style={}}) {
  return <span style={{fontFamily:T.mono,fontSize:10,textTransform:"uppercase",
    letterSpacing:"0.1em",color:T.text3,display:"block",...style}}>{children}</span>;
}
function LiveDot({color}) {
  return <span style={{display:"inline-block",width:6,height:6,borderRadius:"50%",
    flexShrink:0,background:color,boxShadow:`0 0 6px ${color}`,
    animation:"livePing 2s ease-in-out infinite"}}/>;
}
function Divider() {
  return <div style={{height:1,background:"rgba(56,182,255,0.07)",margin:"2px 0"}}/>;
}
function Sk({w="100%",h=12,r=6}) {
  return <div style={{width:w,height:h,borderRadius:r,
    background:"rgba(56,182,255,0.08)",animation:"livePing 1.6s ease-in-out infinite"}}/>;
}

// Gráfica de temperatura SVG simple
function TempChart({data}) {
  if(!data||!data.length) return null;
  const W=460, H=80, PAD=20;
  const maxT = Math.max(...data.map(d=>d.max)) + 2;
  const minT = Math.min(...data.map(d=>d.min)) - 2;
  const range = maxT - minT;
  const x = (i) => PAD + (i/(data.length-1))*(W-PAD*2);
  const yMax = (t) => H - PAD - ((t-minT)/range)*(H-PAD*2);
  const yMin = (t) => H - PAD - ((t-minT)/range)*(H-PAD*2);

  const maxPath = data.map((d,i)=>`${i===0?"M":"L"}${x(i)},${yMax(d.max)}`).join(" ");
  const minPath = data.map((d,i)=>`${i===0?"M":"L"}${x(i)},${yMin(d.min)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H,overflow:"visible"}}>
      {/* Grid lines */}
      {[0,1,2,3].map(i=>(
        <line key={i} x1={PAD} y1={PAD+i*(H-PAD*2)/3}
          x2={W-PAD} y2={PAD+i*(H-PAD*2)/3}
          stroke="rgba(56,182,255,0.07)" strokeWidth={1}/>
      ))}
      {/* Área entre max y min */}
      <path d={`${maxPath} ${data.map((d,i)=>`${i===data.length-1?"L":""}${x(data.length-1-i)},${yMin(data[data.length-1-i].min)}`).join(" ")} Z`}
        fill="rgba(167,139,250,0.08)"/>
      {/* Línea máxima */}
      <path d={maxPath} fill="none" stroke={T.pinkL} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      {/* Línea mínima */}
      <path d={minPath} fill="none" stroke={T.cyanL} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      {/* Puntos y labels */}
      {data.map((d,i)=>(
        <g key={i}>
          <circle cx={x(i)} cy={yMax(d.max)} r={3} fill={T.pinkL}/>
          <circle cx={x(i)} cy={yMin(d.min)} r={3} fill={T.cyanL}/>
          <text x={x(i)} y={H-4} textAnchor="middle" fill="rgba(255,255,255,0.3)"
            fontSize={9} fontFamily="'DM Mono',monospace">{d.label}</text>
          <text x={x(i)} y={yMax(d.max)-6} textAnchor="middle" fill={T.pinkL}
            fontSize={9} fontFamily="'DM Mono',monospace">{d.max}°</text>
          <text x={x(i)} y={yMin(d.min)+14} textAnchor="middle" fill={T.cyanL}
            fontSize={9} fontFamily="'DM Mono',monospace">{d.min}°</text>
        </g>
      ))}
    </svg>
  );
}

// Gráfica de barras de lluvia
function RainChart({data}) {
  if(!data||!data.length) return null;
  const W=460, H=80, PAD=20;
  const maxPop = 100;
  const x = (i) => PAD + i*(W-PAD*2)/data.length;
  const bw = (W-PAD*2)/data.length*0.6;

  const getBarColor = (pop) => {
    if(pop>80) return T.redL;
    if(pop>50) return T.cyanL;
    if(pop>20) return T.purpleL;
    return "rgba(255,255,255,0.2)";
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H}}>
      {data.map((d,i)=>{
        const bh = ((d.pop||0)/maxPop)*(H-PAD*2);
        const by = H-PAD-bh;
        const c = getBarColor(d.pop||0);
        return (
          <g key={i}>
            <rect x={x(i)+bw*0.2} y={by} width={bw} height={bh}
              fill={c} opacity={0.75} rx={3}/>
            <text x={x(i)+bw*0.7} y={H-4} textAnchor="middle"
              fill="rgba(255,255,255,0.3)" fontSize={9}
              fontFamily="'DM Mono',monospace">{d.label}</text>
            {(d.pop||0)>10&&<text x={x(i)+bw*0.7} y={by-4}
              textAnchor="middle" fill={c} fontSize={9}
              fontFamily="'DM Mono',monospace">{d.pop}%</text>}
          </g>
        );
      })}
    </svg>
  );
}

// Brújula de viento SVG
function WindCompass({speed, direction="NE"}) {
  const dirs = {N:270,NE:315,E:0,SE:45,S:90,SO:135,O:180,NO:225};
  const angle = dirs[direction] ?? 315;
  return (
    <div style={{position:"relative",width:80,height:80,margin:"0 auto"}}>
      <svg viewBox="0 0 80 80" style={{width:80,height:80}}>
        {/* Círculo */}
        <circle cx={40} cy={40} r={36} fill="none"
          stroke="rgba(56,182,255,0.12)" strokeWidth={1.5}/>
        <circle cx={40} cy={40} r={28} fill="none"
          stroke="rgba(56,182,255,0.06)" strokeWidth={1}/>
        {/* Puntos cardinales */}
        {[["N",40,8],["S",40,72],["E",72,43],["O",8,43]].map(([l,x,y])=>(
          <text key={l} x={x} y={y} textAnchor="middle"
            fill="rgba(255,255,255,0.3)" fontSize={9}
            fontFamily="'DM Mono',monospace">{l}</text>
        ))}
        {/* Aguja */}
        <g transform={`rotate(${angle}, 40, 40)`}>
          <polygon points="40,14 43,40 40,44 37,40"
            fill={T.cyanL} opacity={0.9}/>
          <polygon points="40,44 43,40 40,66 37,40"
            fill="rgba(255,255,255,0.2)"/>
        </g>
        <circle cx={40} cy={40} r={3} fill={T.cyanL}/>
      </svg>
    </div>
  );
}

// Skeleton
function WeatherSkeleton() {
  return (
    <div style={{padding:20,display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"grid",gridTemplateColumns:"1.5fr 1fr 1fr 1fr",gap:12}}>
        {[1,2,3,4].map(i=><Sk key={i} h={160} r={14}/>)}
      </div>
      <Sk h={90} r={12}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Sk h={120} r={12}/><Sk h={120} r={12}/>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────
const Weather = () => {
  const {data,loading,error,refresh} = useWeather();
  const hourlyRef = useRef(null);

  if(loading) return <WeatherSkeleton/>;
  if(error) return (
    <div style={{padding:24,minHeight:200,display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",gap:16,textAlign:"center"}}>
      <span style={{fontSize:32}}>🌐</span>
      <p style={{fontFamily:T.display,fontWeight:700,fontSize:"0.9375rem",color:T.text}}>
        Sin conexión al clima</p>
      <p style={{fontSize:"0.8125rem",color:T.text2}}>{error}</p>
      <button onClick={refresh} style={{display:"flex",alignItems:"center",gap:6,
        padding:"8px 16px",borderRadius:10,cursor:"pointer",
        background:"rgba(56,182,255,0.06)",border:"1px solid rgba(56,182,255,0.12)",
        color:T.text2,fontSize:"0.8125rem"}}>
        <RefreshCw size={13}/> Reintentar
      </button>
    </div>
  );

  const {current,forecast,city,timestamp,isStale} = data;
  const accent = getAccent(current.conditionCode);
  const hourly  = generateHourly(current);
  const chart   = generateChartData(forecast);
  const moon    = getMoonPhase();
  const sun     = getSunTimes();
  const uv      = getUVIndex(current.conditionCode, current.humidity);
  const windDir = current.windDirection || "NE";

  // pop puede venir como decimal 0-1 o porcentaje 0-100 según el backend
  const popRaw = forecast?.[0]?.pop ?? 0;
  const popToday = popRaw > 1 ? popRaw / 100 : popRaw;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:0}}>

      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{display:"flex",alignItems:"center",
        justifyContent:"space-between",padding:"16px 18px 14px",
        borderBottom:"1px solid rgba(56,182,255,0.07)"}}>
        <div>
          <p style={{fontFamily:T.display,fontWeight:800,fontSize:"1rem",
            color:T.text,lineHeight:1.2}}>Clima · {city}</p>
          <p style={{fontSize:"0.6875rem",color:T.text3,
            fontFamily:T.mono,marginTop:2}}>BOGOTÁ · 2600 MSNM · ZONA SABANA</p>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {isStale&&<span style={{fontSize:10,fontWeight:600,padding:"3px 9px",
            borderRadius:999,color:T.amberL,background:"rgba(245,158,11,0.15)",
            border:"1px solid rgba(245,158,11,0.3)",fontFamily:T.mono,
            display:"flex",alignItems:"center",gap:5}}>
            <AlertTriangle size={10}/> Desactualizado
          </span>}
          <button onClick={refresh} style={{display:"flex",alignItems:"center",gap:5,
            padding:"5px 10px",borderRadius:8,cursor:"pointer",
            background:"rgba(56,182,255,0.06)",border:`1px solid ${T.border}`,
            color:T.text3,fontSize:"0.6875rem"}}>
            <RefreshCw size={10}/> Actualizar
          </button>
        </div>
      </div>

      {/* ── Sección 1: Grid 2x2 cards ─────────────────────── */}
      <div style={{padding:"16px 18px",
        display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>

        {/* ── Card 1: Condición actual ── */}
        <div style={{borderRadius:16,padding:"18px",
          background:`${accent.color}10`,
          border:`1px solid ${accent.color}35`,
          position:"relative",overflow:"hidden",minHeight:220}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:2,
            background:`linear-gradient(90deg,transparent,${accent.color},transparent)`}}/>
          <div style={{position:"absolute",width:140,height:140,borderRadius:"50%",
            background:`radial-gradient(circle,${accent.glow} 0%,transparent 65%)`,
            top:-30,right:-30,pointerEvents:"none"}}/>

          <NbLabel style={{marginBottom:10}}>Condición actual · {city}</NbLabel>

          {/* Temperatura GRANDE + ícono en misma línea */}
          <div style={{display:"flex",alignItems:"center",
            justifyContent:"space-between",marginBottom:6}}>
            <div style={{...T.num,fontSize:"4rem",color:T.text}}>
              {Math.round(current.temperature)}°
              <span style={{...T.num,fontSize:"1.75rem",color:T.text}}> C</span>
            </div>
            <div style={{fontSize:44,lineHeight:1,
              filter:`drop-shadow(0 0 16px ${accent.glow})`,
              animation:"float 6s ease-in-out infinite",marginRight:4}}>
              {getWeatherIcon(current.conditionCode)}
            </div>
          </div>

          {/* Condición en bold grande */}
          <p style={{fontFamily:T.display,fontWeight:700,fontSize:"1.0625rem",
            color:T.text,marginBottom:3,textTransform:"capitalize",lineHeight:1.2}}>
            {current.condition}
          </p>
          <p style={{fontSize:"0.875rem",color:T.text2,marginBottom:14}}>
            Sensación térmica: {Math.round(current.feelsLike)}°C
          </p>

          {/* Máx / Mín */}
          {forecast?.[0]&&(
            <div style={{display:"flex",gap:16,marginBottom:10}}>
              <div>
                <NbLabel style={{marginBottom:3}}>MÁX HOY</NbLabel>
                <p style={{...T.num,fontSize:"1.125rem",color:T.pinkL}}>{Math.round(forecast[0].tempMax)}°C</p>
              </div>
              <div>
                <NbLabel style={{marginBottom:3}}>MÍN HOY</NbLabel>
                <p style={{...T.num,fontSize:"1.125rem",color:T.cyanL}}>{Math.round(forecast[0].tempMin)}°C</p>
              </div>
            </div>
          )}

          {/* Amanecer / Atardecer */}
          <div style={{display:"flex",gap:16,marginBottom:12}}>
            <div>
              <NbLabel style={{marginBottom:3}}>AMANECER</NbLabel>
              <p style={{fontSize:"0.875rem",fontWeight:700,color:T.amberL,
                fontFamily:T.mono}}>{sun.rise} am</p>
            </div>
            <div>
              <NbLabel style={{marginBottom:3}}>ATARDECER</NbLabel>
              <p style={{fontSize:"0.875rem",fontWeight:700,color:T.orangeL,
                fontFamily:T.mono}}>{sun.set} pm</p>
            </div>
          </div>

          <span style={{display:"inline-flex",alignItems:"center",
            fontSize:"0.6875rem",fontWeight:700,padding:"4px 12px",borderRadius:999,
            background:`${accent.color}22`,border:`1px solid ${accent.color}40`,
            color:accent.color,fontFamily:T.mono,letterSpacing:"0.04em"}}>
            Típico Bogotá
          </span>
        </div>

        {/* ── Card 2: Viento ── */}
        <div style={{borderRadius:16,padding:"18px",
          background:"rgba(56,182,255,0.05)",
          border:"1px solid rgba(56,182,255,0.1)",minHeight:220}}>
          <NbLabel style={{marginBottom:14}}>Viento</NbLabel>

          {/* Brújula más grande */}
          <div style={{display:"flex",justifyContent:"center",marginBottom:4}}>
            <WindCompass speed={current.windSpeed} direction={windDir}/>
          </div>

          {/* Velocidad en display GRANDE */}
          <div style={{textAlign:"center",marginBottom:14}}>
            <p style={{...T.num,fontSize:"2.5rem",color:T.cyanL}}>
              {current.windSpeed}
            </p>
            <p style={{fontSize:"0.6875rem",color:T.text3,
              fontFamily:T.mono,marginTop:3,letterSpacing:"0.06em"}}>
              km/h · {windDir}
            </p>
          </div>

          {/* Ráfagas y dirección */}
          <div style={{display:"flex",justifyContent:"space-between",
            padding:"10px 12px",borderRadius:10,
            background:"rgba(56,182,255,0.05)",
            border:"1px solid rgba(56,182,255,0.12)"}}>
            <div>
              <NbLabel style={{marginBottom:3}}>RÁFAGAS</NbLabel>
              <p style={{fontSize:"0.875rem",fontWeight:700,color:T.text2,
                fontFamily:T.mono}}>{Math.round(current.windSpeed*1.6)} km/h</p>
            </div>
            <div style={{textAlign:"right"}}>
              <NbLabel style={{marginBottom:3}}>DIRECCIÓN</NbLabel>
              <p style={{fontSize:"0.875rem",fontWeight:700,color:T.text2}}>
                {windDir==="NE"?"Noreste":windDir==="N"?"Norte":
                  windDir==="S"?"Sur":windDir==="E"?"Este":
                  windDir==="NO"?"Noroeste":windDir==="SO"?"Suroeste":
                  windDir==="SE"?"Sureste":"Noreste"}
              </p>
            </div>
          </div>
        </div>

        {/* ── Card 3: Precipitación ── */}
        <div style={{borderRadius:16,padding:"18px",
          background:"rgba(56,182,255,0.05)",
          border:"1px solid rgba(56,182,255,0.1)"}}>
          <NbLabel style={{marginBottom:12}}>Precipitación</NbLabel>

          {/* % en tipografía display GIGANTE */}
          <div style={{...T.num,fontSize:"3.25rem",color:T.cyanL,marginBottom:5}}>
            {Math.round(popToday*100)}%
          </div>
          <p style={{fontSize:"0.9375rem",color:T.text2,marginBottom:14,fontWeight:500}}>
            Probabilidad de lluvia
          </p>

          {/* Barra de progreso */}
          <div style={{height:5,background:"rgba(56,182,255,0.08)",
            borderRadius:3,overflow:"hidden",marginBottom:14}}>
            <div style={{width:`${Math.round(popToday*100)}%`,height:"100%",
              background:`linear-gradient(90deg,${T.purpleL},${T.cyanL})`,
              borderRadius:3,boxShadow:`0 0 10px ${T.cyanL}60`,
              transition:"width 1.2s cubic-bezier(0.16,1,0.3,1)"}}/>
          </div>

          {/* Datos de precipitación */}
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {[
              {label:"Acumulado",   val:`${(popToday*5).toFixed(1)} mm`},
              {label:"Humedad",     val:`${current.humidity}%`},
              {label:"Punto rocío", val:`${Math.round(current.temperature-((100-current.humidity)/5))}°C`},
            ].map(r=>(
              <div key={r.label} style={{display:"flex",
                justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:"0.8125rem",color:T.text3}}>{r.label}</span>
                <span style={{fontSize:"0.8125rem",color:T.text,
                  fontFamily:T.mono,fontWeight:600}}>{r.val}</span>
              </div>
            ))}
          </div>

          <span style={{display:"inline-flex",marginTop:14,
            fontSize:"0.75rem",fontWeight:700,padding:"4px 12px",borderRadius:999,
            background:popToday>0.5?"rgba(34,211,238,0.15)":"rgba(74,222,128,0.12)",
            border:popToday>0.5?"1px solid rgba(34,211,238,0.35)":"1px solid rgba(74,222,128,0.3)",
            color:popToday>0.5?T.cyanL:T.greenL,fontFamily:T.mono,letterSpacing:"0.04em"}}>
            {popToday>0.8?"Lluvia fuerte":popToday>0.5?"Lluvia moderada":popToday>0.2?"Lluvia ligera":"Sin lluvia"}
          </span>
        </div>

        {/* ── Card 4: UV · Presión · Visibilidad ── */}
        <div style={{borderRadius:16,padding:"18px",
          background:"rgba(56,182,255,0.05)",
          border:"1px solid rgba(56,182,255,0.1)"}}>
          <NbLabel style={{marginBottom:14}}>UV · Presión · Visibilidad</NbLabel>

          {/* UV gauge semicircular más grande y limpio */}
          <div style={{position:"relative",width:100,height:56,margin:"0 auto 6px"}}>
            <svg viewBox="0 0 120 65" style={{width:100,height:56}}>
              <path d="M10,60 A50,50 0 0,1 110,60" fill="none"
                stroke="rgba(56,182,255,0.1)" strokeWidth={10} strokeLinecap="round"/>
              <path d="M10,60 A50,50 0 0,1 110,60" fill="none"
                stroke={uv.color} strokeWidth={10}
                strokeLinecap="round" strokeDasharray="157"
                strokeDashoffset={157 - (uv.val/11)*157}
                style={{transition:"stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)"}}/>
            </svg>
            <div style={{position:"absolute",bottom:2,left:"50%",
              transform:"translateX(-50%)",textAlign:"center"}}>
              <p style={{...T.num,fontSize:"2rem",color:uv.color}}>{uv.val}</p>
            </div>
          </div>
          <p style={{textAlign:"center",fontSize:"0.75rem",color:uv.color,
            fontFamily:T.mono,fontWeight:700,marginBottom:14,
            letterSpacing:"0.06em"}}>
            UV · {uv.label}
          </p>

          {/* Stats con iconos */}
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {[
              {label:"Presión",    val:`${current.pressure} hPa`, icon:<Gauge size={13} style={{color:T.greenL}}/>, vc:T.greenL},
              {label:"Visibilidad",val:`${current.visibility} km`, icon:<Eye   size={13} style={{color:T.purpleL}}/>, vc:T.purpleL},
              {label:"Humedad",    val:`${current.humidity}%`,     icon:<Droplets size={13} style={{color:T.cyanL}}/>, vc:T.cyanL},
              {label:"Nubosidad",  val:`${Math.round(current.humidity*0.7)}%`, icon:<span style={{fontSize:13}}>☁️</span>, vc:T.text2},
            ].map(r=>(
              <div key={r.label} style={{display:"flex",alignItems:"center",
                justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  {r.icon}
                  <span style={{fontSize:"0.8125rem",color:T.text3}}>{r.label}</span>
                </div>
                <span style={{fontSize:"0.8125rem",color:r.vc,
                  fontFamily:T.mono,fontWeight:700}}>{r.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Divider/>

      {/* ── Sección 2: Pronóstico por hora ───────────────── */}
      <div style={{padding:"14px 18px"}}>
        <NbLabel style={{marginBottom:12}}>Pronóstico por hora · Hoy</NbLabel>
        <div ref={hourlyRef} style={{display:"flex",gap:12,overflowX:"auto",
          paddingBottom:4,scrollbarWidth:"thin",
          scrollbarColor:"rgba(167,139,250,0.2) transparent"}}>
          {hourly.map((h,i)=>(
            <div key={i} style={{flexShrink:0,width:68,
              borderRadius:12,padding:"11px 8px",textAlign:"center",
              background: h.isNow ? `${accent.color}14` : "rgba(56,182,255,0.05)",
              border:`1px solid ${h.isNow ? `${accent.color}40` : "rgba(56,182,255,0.08)"}`,
              position:"relative",overflow:"hidden"}}>
              {h.isNow&&<div style={{position:"absolute",top:0,left:0,right:0,height:2,
                background:`linear-gradient(90deg,transparent,${accent.color}80,transparent)`}}/>}
              <p style={{fontSize:"0.5625rem",fontFamily:T.mono,
                color: h.isNow ? accent.color : T.text3,
                fontWeight: h.isNow ? 700 : 400,
                letterSpacing:"0.04em",marginBottom:7}}>{h.hour}</p>
              <div style={{fontSize:20,lineHeight:1,marginBottom:7}}>
                {getWeatherIcon(h.code)}
              </div>
              <p style={{...T.num,fontSize:"1.0625rem",
                color: h.isNow ? accent.color : T.text,
                marginBottom:4}}>{h.temp}°</p>
              {h.pop>10&&<p style={{fontSize:"0.5rem",color:T.cyanL,
                fontFamily:T.mono}}>{h.pop}%</p>}
            </div>
          ))}
        </div>
      </div>

      <Divider/>

      {/* ── Sección 3: Gráficas ───────────────────────────── */}
      <div style={{padding:"14px 18px",
        display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <div style={{borderRadius:12,padding:"16px",
          background:"rgba(255,255,255,0.03)",
          border:"1px solid rgba(56,182,255,0.12)"}}>
          <p style={{fontFamily:T.display,fontWeight:700,fontSize:"0.9375rem",
            color:T.text,marginBottom:3}}>Temperatura · últimos 7 días</p>
          <p style={{fontSize:"0.6875rem",color:T.text3,
            marginBottom:10}}>Máxima y mínima diaria · °C</p>
          <div style={{display:"flex",gap:16,marginBottom:10}}>
            {[{c:T.pinkL,l:"Máxima"},{c:T.cyanL,l:"Mínima"},{c:"rgba(167,139,250,0.2)",l:"Rango"}].map(l=>(
              <div key={l.l} style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:14,height:3,borderRadius:1,background:l.c}}/>
                <span style={{fontSize:"0.625rem",color:T.text3}}>{l.l}</span>
              </div>
            ))}
          </div>
          <TempChart data={chart}/>
        </div>
        <div style={{borderRadius:12,padding:"16px",
          background:"rgba(255,255,255,0.03)",
          border:"1px solid rgba(56,182,255,0.12)"}}>
          <p style={{fontFamily:T.display,fontWeight:700,fontSize:"0.875rem",
            color:T.text,marginBottom:3}}>Lluvia · 7 días</p>
          <p style={{fontSize:"0.6875rem",color:T.text3,
            marginBottom:10}}>Probabilidad de precipitación · %</p>
          <RainChart data={chart}/>
        </div>
      </div>

      <Divider/>

      {/* ── Sección 4: Pronóstico 7 días ─────────────────── */}
      <div style={{padding:"14px 18px"}}>
        <NbLabel style={{marginBottom:12}}>Pronóstico 7 días · Bogotá</NbLabel>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:6,overflowX:"auto"}}>
          {forecast?.slice(0,7).map((day,i)=>{
            const date = new Date(day.date);
            const label = i===0?"Hoy":i===1?"Mañ":
              date.toLocaleDateString("es-CO",{weekday:"short"}).replace(".","").substring(0,3);
            const isToday = i===0;
            const popRawDay = day.pop || 0;
            const pop = Math.round(popRawDay > 1 ? popRawDay : popRawDay * 100);
            return (
              <div key={i} style={{borderRadius:12,padding:"12px 8px",
                textAlign:"center",
                background: isToday ? `${accent.color}10` : "rgba(56,182,255,0.05)",
                border:`1px solid ${isToday ? `${accent.color}35` : "rgba(56,182,255,0.08)"}`,
                position:"relative"}}>
                {isToday&&<div style={{position:"absolute",top:0,left:0,right:0,height:2,
                  background:`linear-gradient(90deg,transparent,${accent.color}80,transparent)`}}/>}
                <p style={{fontSize:"0.5625rem",fontFamily:T.mono,
                  color: isToday ? accent.color : T.text3,
                  fontWeight: isToday ? 700 : 400,
                  letterSpacing:"0.04em",marginBottom:8}}>{label}</p>
                <div style={{fontSize:22,lineHeight:1,marginBottom:8}}>
                  {getWeatherIcon(day.conditionCode)}
                </div>
                <p style={{...T.num,fontSize:"1.125rem",color:T.text,marginBottom:2}}>
                  {Math.round(day.tempMax)}°
                </p>
                <p style={{...T.num,fontSize:"0.75rem",color:T.text3,marginBottom:6}}>
                  {Math.round(day.tempMin)}°
                </p>
                {/* Barra de lluvia */}
                <div style={{height:3,background:"rgba(56,182,255,0.08)",
                  borderRadius:2,overflow:"hidden",marginBottom:4}}>
                  <div style={{width:`${pop}%`,height:"100%",
                    background:pop>60?T.cyanL:pop>30?T.purpleL:"rgba(255,255,255,0.2)",
                    borderRadius:2}}/>
                </div>
                <p style={{fontSize:"0.5rem",
                  color:pop>60?T.cyanL:pop>30?T.purpleL:T.text3,
                  fontFamily:T.mono}}>{pop}%</p>
              </div>
            );
          })}
        </div>
      </div>

      <Divider/>

      {/* ── Sección 5: Alerta + UV + Fase lunar ──────────── */}
      <div style={{padding:"14px 18px",
        display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>

        {/* Alerta climática */}
        <div style={{borderRadius:12,padding:"16px",
          background: popToday>0.7 ? "rgba(251,146,60,0.1)" : "rgba(56,182,255,0.05)",
          border:`1px solid ${popToday>0.7 ? "rgba(251,146,60,0.3)" : "rgba(56,182,255,0.1)"}` }}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
            <AlertTriangle size={14} style={{color:popToday>0.7?T.orangeL:T.text3}}/>
            <p style={{fontFamily:T.display,fontWeight:700,fontSize:"0.875rem",
              color:popToday>0.7?T.orangeL:T.text2}}>
              {popToday>0.7?"Alerta amarilla · IDEAM":"Sin alertas activas"}
            </p>
          </div>
          <p style={{fontSize:"0.8125rem",color:T.text2,lineHeight:1.55}}>
            {popToday>0.7
              ? `Posibilidad de fuertes lluvias con acumulados de hasta ${Math.round(popToday*30)}mm. Reducción de visibilidad en vías. Actualizado hace 1h.`
              : "Las condiciones actuales no requieren alertas especiales para Bogotá. Mantente informado con IDEAM."}
          </p>
        </div>

        {/* Índice UV */}
        <div style={{borderRadius:12,padding:"16px",
          background:"rgba(56,182,255,0.05)",
          border:"1px solid rgba(56,182,255,0.1)"}}>
          <NbLabel style={{marginBottom:10}}>Índice UV · Hoy</NbLabel>
          {/* Barra UV */}
          <div style={{height:8,borderRadius:999,overflow:"hidden",marginBottom:6,
            background:"linear-gradient(90deg,#50dc64,#f0b830,#ff7840,#ff6680,#38b6ff)"}}>
            <div style={{width:2,height:"100%",background:"#fff",
              marginLeft:`${(uv.val/11)*100}%`,boxShadow:"0 0 6px rgba(255,255,255,0.8)"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",
            marginBottom:10}}>
            {["Bajo","Moderado","Alto","M.alto","Extremo"].map(l=>(
              <span key={l} style={{fontSize:"0.5rem",color:T.text3,
                fontFamily:T.mono}}>{l}</span>
            ))}
          </div>
          <div style={{...T.num,fontSize:"2.25rem",color:uv.color,marginBottom:4}}>{uv.val}</div>
          <p style={{fontSize:"0.8125rem",color:T.text2,lineHeight:1.5}}>
            UV {uv.val} {uv.label}. {uv.val>=3
              ? "Protector solar SPF 30+ recomendado entre 10am y 2pm."
              : "Sin necesidad de protector solar adicional."}
          </p>
        </div>

        {/* Fase lunar */}
        <div style={{borderRadius:12,padding:"16px",
          background:"rgba(56,182,255,0.05)",
          border:"1px solid rgba(56,182,255,0.1)",textAlign:"center"}}>
          <NbLabel style={{marginBottom:10}}>Fase lunar · Astronomía</NbLabel>
          <div style={{fontSize:48,lineHeight:1,marginBottom:8,
            filter:"drop-shadow(0 0 10px rgba(167,139,250,0.4))",
            animation:"float 4s ease-in-out infinite"}}>{moon.icon}</div>
          <p style={{fontFamily:T.display,fontWeight:700,fontSize:"0.9375rem",
            color:T.text,marginBottom:4}}>{moon.name}</p>
          <p style={{fontSize:"0.75rem",color:T.text3,marginBottom:12}}>
            {moon.ilum}% iluminación
          </p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <div style={{borderRadius:8,padding:"7px",
              background:"rgba(56,182,255,0.05)",
              border:"1px solid rgba(56,182,255,0.12)"}}>
              <NbLabel style={{marginBottom:3}}>Sale</NbLabel>
              <p style={{fontSize:"0.75rem",color:T.amberL,
                fontFamily:T.mono}}>{sun.rise}am</p>
            </div>
            <div style={{borderRadius:8,padding:"7px",
              background:"rgba(56,182,255,0.05)",
              border:"1px solid rgba(56,182,255,0.12)"}}>
              <NbLabel style={{marginBottom:3}}>Ocaso</NbLabel>
              <p style={{fontSize:"0.75rem",color:T.orangeL,
                fontFamily:T.mono}}>{sun.set}pm</p>
            </div>
          </div>
        </div>
      </div>

      <Divider/>

      {/* ── Footer stats ──────────────────────────────────── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",
        background:"rgba(0,0,0,0.2)"}}>
        {[
          {val:`${Math.round(forecast?.[0]?.tempMax||current.temperature)}°C`, label:"MÁX HOY", color:T.pinkL},
          {val:`${Math.round(forecast?.[0]?.tempMin||current.temperature)}°C`, label:"MÍN HOY", color:T.cyanL},
          {val:`${Math.round(popToday*100)}%`,  label:"PROB. LLUVIA", color:T.purpleL},
          {val:`${current.humidity}%`,          label:"HUMEDAD",      color:T.cyanL},
          {val:`UV ${uv.val}`,                  label:"ÍNDICE UV",    color:uv.color},
        ].map((s,i)=>(
          <div key={i} style={{padding:"11px 14px",
            borderRight:i<4?`1px solid ${T.border}`:"none"}}>
            <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3}}>
              <span style={{width:6,height:6,borderRadius:"50%",
                background:s.color,boxShadow:`0 0 5px ${s.color}`,
                display:"inline-block",flexShrink:0}}/>
            </div>
            <p style={{...T.num,fontSize:"1.125rem",color:s.color,marginBottom:3}}>{s.val}</p>
            <p style={{fontSize:"0.5rem",color:T.text3,
              fontFamily:T.mono,letterSpacing:"0.07em"}}>{s.label}</p>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes livePing { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.85)} }
      `}</style>
    </div>
  );
};

export default Weather;