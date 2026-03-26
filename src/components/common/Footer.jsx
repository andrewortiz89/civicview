// src/components/common/Footer.jsx — Neo-Táctil 2026
import { MapPin, Github, ExternalLink } from 'lucide-react';

const T = {
  text3:   "#8aaabb",
  border:  "rgba(56,182,255,0.1)",
  blue:    "#38b6ff",
  cyan:    "#38dcc8",
  green:   "#50dc64",
  mono:    "'DM Mono','JetBrains Mono',monospace",
  display: "'Syne',sans-serif",
};

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{
      maxWidth:"80rem", margin:"0 auto",
      padding:"28px 1.5rem", marginTop:32,
      borderTop:`1px solid ${T.border}`,
    }}>
      <div style={{display:"flex", flexDirection:"column", gap:0}}>

        {/* ── Fila principal ──────────────────────────────────── */}
        <div style={{
          display:"flex", alignItems:"center",
          justifyContent:"space-between", flexWrap:"wrap", gap:16,
          marginBottom:18,
        }}>

          {/* Logo + crédito */}
          <div style={{display:"flex", alignItems:"center", gap:10}}>
            <div style={{
              width:30, height:30, borderRadius:9, flexShrink:0,
              background:"linear-gradient(135deg,rgba(56,182,255,0.28),rgba(56,220,200,0.18))",
              border:"1px solid rgba(56,182,255,0.3)",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:14,
            }}>
              🏙️
            </div>
            <div>
              <p style={{
                fontFamily:T.display, fontWeight:800, fontSize:"0.875rem", lineHeight:1.2,
                background:`linear-gradient(135deg, ${T.blue}, ${T.cyan})`,
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
              }}>
                CivicView
              </p>
              <p style={{fontSize:"0.6875rem", color:T.text3, marginTop:2}}>
                Jeyson Andrés Ortiz Mendoza · SENA · © {year}
              </p>
            </div>
          </div>

          {/* Ciudad */}
          <div style={{display:"flex", alignItems:"center", gap:6}}>
            <div style={{width:7, height:7, borderRadius:"50%",
              background:T.blue, opacity:0.5}}/>
            <span style={{
              fontSize:"0.6875rem", color:T.text3,
              fontFamily:T.mono, letterSpacing:"0.07em",
            }}>
              BOGOTÁ D.C., COLOMBIA
            </span>
          </div>

          {/* Live badge + links */}
          <div style={{display:"flex", alignItems:"center", gap:12}}>

            {/* Badge EN VIVO */}
            <div style={{
              display:"flex", alignItems:"center", gap:6,
              padding:"4px 10px", borderRadius:999,
              background:"rgba(80,220,100,0.08)",
              border:"1px solid rgba(80,220,100,0.2)",
            }}>
              <span style={{
                width:6, height:6, borderRadius:"50%",
                background:T.green, boxShadow:`0 0 5px ${T.green}`,
                display:"inline-block",
                animation:"ftPulse 2s ease-in-out infinite",
              }}/>
              <span style={{fontSize:"0.6875rem", color:T.green, fontWeight:500}}>
                Datos en tiempo real
              </span>
            </div>

            {/* Iconos de enlace */}
            <div style={{display:"flex", gap:6}}>
              {[
                { label:"GitHub",   icon:Github,       href:"https://github.com/andrewortiz89" },
                { label:"SENA",     icon:ExternalLink,  href:"https://www.sena.edu.co" },
              ].map(({ label, icon:Icon, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" title={label}
                  style={{
                    display:"flex", alignItems:"center", justifyContent:"center",
                    width:28, height:28, borderRadius:8, textDecoration:"none",
                    background:"rgba(56,182,255,0.06)",
                    border:"1px solid rgba(56,182,255,0.12)",
                    color:T.text3, transition:"all 0.18s",
                  }}
                  onMouseEnter={e=>{
                    e.currentTarget.style.background="rgba(56,182,255,0.14)";
                    e.currentTarget.style.borderColor="rgba(56,182,255,0.35)";
                    e.currentTarget.style.color="#e8f4ff";
                  }}
                  onMouseLeave={e=>{
                    e.currentTarget.style.background="rgba(56,182,255,0.06)";
                    e.currentTarget.style.borderColor="rgba(56,182,255,0.12)";
                    e.currentTarget.style.color=T.text3;
                  }}
                >
                  <Icon size={12}/>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── Fila de fuentes / APIs ──────────────────────────── */}
        <div style={{
          display:"flex", flexWrap:"wrap",
          alignItems:"center", justifyContent:"center",
          gap:"5px 12px",
          paddingTop:14,
          borderTop:"1px solid rgba(56,182,255,0.06)",
        }}>
          <span style={{
            fontSize:"0.5625rem", color:"rgba(138,170,187,0.5)",
            fontFamily:T.mono, letterSpacing:"0.1em",
          }}>
            FUENTES
          </span>

          {/* Separador puntual entre label y links */}
          <span style={{width:2, height:2, borderRadius:"50%",
            background:"rgba(56,182,255,0.2)", display:"inline-block"}}/>

          {[
            { label:"OpenWeatherMap",        href:"https://openweathermap.org" },
            { label:"AQICN",                 href:"https://aqicn.org" },
            { label:"Datos Abiertos Bogotá", href:"https://datosabiertos.bogota.gov.co" },
            { label:"OpenStreetMap",         href:"https://www.openstreetmap.org" },
            { label:"SDM Movilidad",         href:"https://www.movilidadbogota.gov.co" },
          ].map(({ label, href }, i, arr) => (
            <span key={label} style={{display:"flex", alignItems:"center", gap:12}}>
              <a href={href} target="_blank" rel="noopener noreferrer"
                style={{
                  fontSize:"0.5625rem", color:"rgba(138,170,187,0.45)",
                  textDecoration:"none", fontFamily:T.mono, letterSpacing:"0.04em",
                  transition:"all 0.15s",
                }}
                onMouseEnter={e=>{e.currentTarget.style.color=T.blue; e.currentTarget.style.opacity="1";}}
                onMouseLeave={e=>{e.currentTarget.style.color="rgba(138,170,187,0.45)";}}
              >
                {label}
              </a>
              {i < arr.length - 1 && (
                <span style={{width:2, height:2, borderRadius:"50%",
                  background:"rgba(56,182,255,0.18)", display:"inline-block"}}/>
              )}
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes ftPulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.45; transform:scale(0.82); }
        }
      `}</style>
    </footer>
  );
}

export default Footer;