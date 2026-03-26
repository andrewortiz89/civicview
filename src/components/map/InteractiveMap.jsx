// src/components/map/InteractiveMap.jsx — Nebula FINAL v2
// Leaflet puro · Panel lateral · Ciclorutas como polilíneas · Hooks reales

import { useState, useEffect, useRef, useCallback } from 'react'
import L from 'leaflet'
import useEvents     from '../../hooks/useEvents'
import useAirQuality from '../../hooks/useAirQuality'

// ── Fix íconos Leaflet + Vite ─────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// ── Tokens ────────────────────────────────────────────────────
const T = {
  purpleL:"#38b6ff", cyanL:"#38dcc8", greenL:"#50dc64",
  redL:"#ff6680",    amberL:"#f0b830", pinkL:"#d880ff",
  text:"#e8f4ff", text2:"rgba(220,235,248,0.72)", text3:"#8aaabb",
  border:"rgba(56,182,255,0.1)", border2:"rgba(56,182,255,0.18)",
  mono:"'DM Mono','JetBrains Mono',monospace",
  display:"'Syne',sans-serif",
  body:"'Inter','Plus Jakarta Sans','DM Sans',sans-serif",
}

// ── POI Data ──────────────────────────────────────────────────
const POI_DATA = {
  biblioteca:[
    {id:'b1',name:'Biblioteca El Tintal',       lat:4.6289,lng:-74.1546,desc:'Símbolo de renovación urbana.',        zona:'Kennedy',   dist:'0.8 km',hours:'Lun–Vie 8am–7pm',website:'https://bibliotecabogota.gov.co',status:'abierta'},
    {id:'b2',name:'Biblioteca Virgilio Barco',  lat:4.6579,lng:-74.1003,desc:'Diseñada por Rogelio Salmona.',        zona:'Salitre',   dist:'1.2 km',hours:'Lun–Vie 8am–7pm',status:'abierta'},
    {id:'b3',name:'Biblioteca El Tunal',        lat:4.5786,lng:-74.1234,desc:'Principal biblioteca del sur.',        zona:'Tunjuelito',dist:'2.5 km',hours:'Lun–Vie 8am–7pm',status:'abierta'},
    {id:'b4',name:'Biblioteca Pública Piloto',  lat:4.6097,lng:-74.0817,desc:'Primera biblioteca pública (1952).',   zona:'La Candelaria',dist:'3.4 km',hours:'Lun–Vie 8am–7pm',status:'concurrida'},
    {id:'b5',name:'Biblioteca Luis Ángel Arango',lat:4.5986,lng:-74.0742,desc:'La más visitada de Latinoamérica.',  zona:'Chapinero',  dist:'2.8 km',hours:'Lun–Sáb 8am–8pm',website:'https://www.banrepcultural.org',status:'abierta'},
  ],
  cultura:[
    {id:'cu1',name:'Teatro Colón',                         lat:4.597, lng:-74.0757,desc:'Teatro nacional (1892).',    zona:'Centro',    dist:'4.2 km',status:'abierta'},
    {id:'cu2',name:'Museo Nacional de Colombia',           lat:4.6151,lng:-74.0651,desc:'El museo más antiguo.',      zona:'Teusaquillo',dist:'3.1 km',status:'abierta'},
    {id:'cu3',name:'Museo del Oro',                        lat:4.6014,lng:-74.0727,desc:'8.983 piezas precolombinas.',zona:'Centro',    dist:'3.8 km',status:'concurrida'},
    {id:'cu4',name:'Museo Botero',                         lat:4.5978,lng:-74.074, desc:'Entrada gratuita.',          zona:'La Candelaria',dist:'4.0 km',status:'abierta'},
    {id:'cu5',name:'Planetario de Bogotá',                 lat:4.6151,lng:-74.0767,desc:'Shows astronómicos.',        zona:'Teusaquillo',dist:'3.2 km',status:'abierta'},
    {id:'cu6',name:'Teatro Mayor Julio Mario S.D.',        lat:4.6734,lng:-74.0547,desc:'Mejor teatro de Latam.',     zona:'Usaquén',   dist:'5.1 km',status:'abierta'},
  ],
  parque:[
    {id:'p1',name:'Parque Simón Bolívar',  lat:4.6579,lng:-74.0946,desc:'361 ha — el más grande.',   zona:'Teusaquillo',dist:'2.0 km'},
    {id:'p2',name:'Parque El Virrey',      lat:4.6681,lng:-74.0536,desc:'Parque lineal norte.',       zona:'Chapinero',  dist:'3.5 km'},
    {id:'p3',name:'Parque Nacional',       lat:4.6189,lng:-74.0634,desc:'Parque histórico.',          zona:'Teusaquillo',dist:'2.8 km'},
    {id:'p4',name:'Humedal La Conejera',   lat:4.7434,lng:-74.1089,desc:'Ecosistema protegido.',      zona:'Suba',       dist:'8.2 km'},
    {id:'p5',name:'Parque Timiza',         lat:4.5786,lng:-74.1489,desc:'Piscinas olímpicas.',        zona:'Kennedy',    dist:'6.1 km'},
    {id:'p6',name:'Parque Tercer Milenio', lat:4.5989,lng:-74.0789,desc:'16 ha en el centro.',        zona:'Los Mártires',dist:'3.9 km'},
  ],
  ciclovia:[
    {id:'c1',name:'Ciclovía Av. Caracas',  lat:4.6351,lng:-74.0636,desc:'Ruta norte-sur, 21 km.',    schedule:'Dom y festivos 7am–2pm'},
    {id:'c2',name:'Ciclovía Av. El Dorado',lat:4.6486,lng:-74.1052,desc:'Aeropuerto–centro, 12 km.', schedule:'Dom y festivos 7am–2pm'},
    {id:'c3',name:'Ciclovía Calle 26',     lat:4.6468,lng:-74.0774,desc:'Eje oriente–occidente.',    schedule:'Dom y festivos 7am–2pm'},
    {id:'c4',name:'Ciclovía Av. Boyacá',   lat:4.6589,lng:-74.1189,desc:'Ruta occidente, 15 km.',    schedule:'Dom y festivos 7am–2pm'},
    {id:'c5',name:'Ciclovía Usaquén',      lat:4.6979,lng:-74.0316,desc:'Norte, 8 km.',              schedule:'Dom y festivos 7am–2pm'},
    {id:'c6',name:'Ciclovía Chapinero',    lat:4.6432,lng:-74.0634,desc:'Zona Rosa, 6 km.',          schedule:'Dom y festivos 7am–2pm'},
  ],
}

// ── Polilíneas de ciclorutas (trazados aproximados) ───────────
const CICLORUTAS_LINES = [
  { name:'Av. Séptima',      color:'#38dcc8', km:22, dir:'Norte-Sur',
    pts:[[4.7200,-74.0390],[4.7000,-74.0370],[4.6800,-74.0350],[4.6600,-74.0330],[4.6400,-74.0310],[4.6200,-74.0290],[4.6000,-74.0270]] },
  { name:'Calle 26',         color:'#38dcc8', km:12, dir:'Este-Oeste',
    pts:[[4.6500,-74.1200],[4.6490,-74.1000],[4.6480,-74.0800],[4.6470,-74.0600],[4.6460,-74.0400]] },
  { name:'NQS (Carrera 30)', color:'#38dcc8', km:18, dir:'Troncal',
    pts:[[4.7100,-74.0930],[4.6900,-74.0900],[4.6700,-74.0870],[4.6500,-74.0840],[4.6300,-74.0810],[4.6100,-74.0780]] },
  { name:'Av. 68',           color:'#38dcc8', km:14, dir:'Engativá-Bosa',
    pts:[[4.6800,-74.1100],[4.6600,-74.1070],[4.6400,-74.1040],[4.6200,-74.1010],[4.6000,-74.0980]] },
]

// ── Config visual por categoría ───────────────────────────────
const CATS = {
  ciclovia:   {label:'Ciclorutas',   emoji:'🚴',color:'#38dcc8',border:'rgba(34,211,238,0.5)', bg:'rgba(6,182,212,0.13)'},
  parque:     {label:'Parques',      emoji:'🌳',color:'#50dc64',border:'rgba(74,222,128,0.5)', bg:'rgba(16,185,129,0.13)'},
  biblioteca: {label:'Bibliotecas',  emoji:'📚',color:'#38b6ff',border:'rgba(167,139,250,0.5)',bg:'rgba(124,58,237,0.13)'},
  cultura:    {label:'Cultura',      emoji:'🎭',color:'#d880ff',border:'rgba(244,114,182,0.5)',bg:'rgba(236,72,153,0.13)'},
}

// ── Popup HTML ────────────────────────────────────────────────
function buildPopupHTML(poi, cat) {
  const {emoji,color,label} = CATS[cat]
  let html = `<div style="min-width:215px;font-family:'Plus Jakarta Sans',system-ui,sans-serif;padding:4px;">
    <div style="display:flex;align-items:center;gap:9px;margin-bottom:11px;padding-bottom:11px;border-bottom:1px solid rgba(56,182,255,0.1);">
      <div style="width:34px;height:34px;border-radius:10px;background:${color}22;border:1px solid ${color}45;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">${emoji}</div>
      <div>
        <div style="font-family:'DM Mono',monospace;font-size:9px;font-weight:500;text-transform:uppercase;letter-spacing:.1em;color:${color};margin-bottom:3px;">${label}</div>
        <div style="font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:#fff;line-height:1.25;">${poi.name}</div>
      </div>
    </div>`
  if(poi.desc)     html+=`<p style="font-size:12px;color:rgba(255,255,255,0.5);margin:0 0 8px;line-height:1.5;">${poi.desc}</p>`
  if(poi.zona)     html+=`<div style="font-size:11px;color:#8aaabb;margin-bottom:4px;">📍 ${poi.zona} · ${poi.dist}</div>`
  if(poi.hours)    html+=`<div style="font-size:11px;color:#8aaabb;margin-bottom:4px;">🕐 ${poi.hours}</div>`
  if(poi.schedule) html+=`<div style="font-size:11px;color:#8aaabb;margin-bottom:4px;">🕐 ${poi.schedule}</div>`
  if(poi.website)  html+=`<a href="${poi.website}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:5px;margin-top:8px;color:${color};font-size:11px;font-weight:600;padding:5px 11px;background:${color}16;border-radius:8px;border:1px solid ${color}32;text-decoration:none;">🔗 Ver sitio</a>`
  html+=`</div>`
  return html
}

function createPin(cat) {
  const {emoji,color} = CATS[cat]
  return L.divIcon({
    className:'',
    html:`<div style="background:#0d1520;border:2px solid ${color};border-radius:50% 50% 50% 0;width:34px;height:34px;display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 4px 12px rgba(0,0,0,0.5),0 0 10px ${color}55;transform:rotate(-45deg);"><span style="transform:rotate(45deg);display:block;line-height:1;">${emoji}</span></div>`,
    iconSize:[34,34],iconAnchor:[17,34],popupAnchor:[0,-38],
  })
}

// ── Componentes del panel lateral ─────────────────────────────
function NbLabel({children,style={}}) {
  return <p style={{fontFamily:T.mono,fontSize:9,textTransform:'uppercase',
    letterSpacing:'0.1em',color:T.text3,marginBottom:8,...style}}>{children}</p>
}

function StatusBadge({status}) {
  const map = {
    abierta:  {c:T.greenL, label:'Abierta'},
    concurrida:{c:T.amberL,label:'Concurrida'},
    cerrada:  {c:T.redL,   label:'Cerrada'},
    activa:   {c:T.cyanL,  label:'Activa'},
    gratis:   {c:T.greenL, label:'Gratis'},
  }
  const s = map[status] || map.abierta
  return (
    <span style={{fontSize:'0.5625rem',fontWeight:700,padding:'2px 7px',borderRadius:999,
      background:`${s.c}15`,border:`1px solid ${s.c}30`,color:s.c,
      fontFamily:T.mono,letterSpacing:'0.05em'}}>{s.label}</span>
  )
}

function PanelItem({emoji,color,title,sub,badge,onClick,active}) {
  const [hover,setHover] = useState(false)
  return (
    <div onClick={onClick}
      onMouseEnter={()=>setHover(true)}
      onMouseLeave={()=>setHover(false)}
      style={{display:'flex',alignItems:'flex-start',gap:10,padding:'9px 14px',
        cursor:'pointer',transition:'background 0.15s',
        background: active ? `${color}10` : hover ? 'rgba(56,182,255,0.05)' : 'transparent',
        borderLeft: active ? `2px solid ${color}` : '2px solid transparent',
      }}>
      <div style={{width:8,height:8,borderRadius:'50%',background:color,
        flexShrink:0,marginTop:4,boxShadow:`0 0 5px ${color}`}}/>
      <div style={{flex:1,minWidth:0}}>
        <p style={{fontSize:'0.8125rem',color:T.text,fontWeight:600,
          lineHeight:1.3,overflow:'hidden',textOverflow:'ellipsis',
          whiteSpace:'nowrap'}}>{title}</p>
        {sub && <p style={{fontSize:'0.6875rem',color:T.text3,
          fontFamily:T.mono,marginTop:2}}>{sub}</p>}
        {badge && <div style={{marginTop:5}}><StatusBadge status={badge}/></div>}
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────
function InteractiveMap({ isWidget=false, onExpandClick }) {
  const mapRef      = useRef(null)
  const leafletRef  = useRef(null)
  const layersRef   = useRef({})
  const linesRef    = useRef([])

  const { data: eventsData }     = useEvents()
  const { data: airQualityData } = useAirQuality()

  const [filters, setFilters] = useState({
    ciclovia:true, parque:true, biblioteca:true, cultura:true,
  })
  const [activeItem,  setActiveItem]  = useState(null)
  const [panelOpen,   setPanelOpen]   = useState(!isWidget)
  const [searchVal,   setSearchVal]   = useState('')

  const todayEvents = eventsData?.today?.slice(0,4) || []
  const aqi         = airQualityData?.aqi
  const aqiColor    = airQualityData?.color || T.amberL
  const aqiCat      = airQualityData?.category || '—'

  // Stats footer
  const totalVisible = Object.entries(filters)
    .filter(([,on])=>on)
    .reduce((s,[cat])=>s+(POI_DATA[cat]?.length||0),0)

  // ── Init mapa ─────────────────────────────────────────────
  useEffect(()=>{
    if(!mapRef.current||leafletRef.current) return
    const map = L.map(mapRef.current,{
      center:[4.6097,-74.0817],
      zoom: isWidget ? 11 : 12,
      zoomControl:false,
      scrollWheelZoom:!isWidget,
    })

    // Tiles oscuros
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{
      attribution:'&copy; OSM &copy; CARTO',
      subdomains:'abcd',maxZoom:19,
    }).addTo(map)

    // Controles zoom
    L.control.zoom({position:'topleft'}).addTo(map)

    // Ciclorutas como polilíneas
    CICLORUTAS_LINES.forEach(route=>{
      const line = L.polyline(route.pts,{
        color:route.color,weight:3,opacity:0.75,
        dashArray:'8 4',
      })
      line.bindPopup(`<div style="font-family:'Plus Jakarta Sans',sans-serif;padding:4px;">
        <div style="font-family:'DM Mono',monospace;font-size:9px;color:#38dcc8;letter-spacing:.1em;margin-bottom:4px;">CICLORRUTA</div>
        <div style="font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:#fff;margin-bottom:6px;">${route.name}</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.45);">🚴 ${route.km} km · ${route.dir}</div>
        <div style="font-size:11px;color:#8aaabb;margin-top:3px;">Estado: <span style="color:#38dcc8;font-weight:600;">Activa</span></div>
      </div>`)
      linesRef.current.push(line)
      line.addTo(map)
    })

    // Capas POI
    Object.entries(POI_DATA).forEach(([cat,pois])=>{
      const layer = L.layerGroup()
      pois.forEach(poi=>{
        L.marker([poi.lat,poi.lng],{icon:createPin(cat)})
          .bindPopup(buildPopupHTML(poi,cat),{maxWidth:265,minWidth:215})
          .addTo(layer)
      })
      layer.addTo(map)
      layersRef.current[cat] = layer
    })

    leafletRef.current = map
    return ()=>{ map.remove(); leafletRef.current=null; layersRef.current={}; linesRef.current=[] }
  },[]) // eslint-disable-line

  // ── Sincronizar filtros ───────────────────────────────────
  useEffect(()=>{
    const map = leafletRef.current
    if(!map) return
    Object.entries(filters).forEach(([cat,active])=>{
      const layer = layersRef.current[cat]
      if(!layer) return
      active ? map.addLayer(layer) : map.removeLayer(layer)
    })
    // Ciclorutas líneas
    linesRef.current.forEach(line=>{
      filters.ciclovia ? map.addLayer(line) : map.removeLayer(line)
    })
  },[filters])

  const toggleFilter = useCallback(cat=>{
    setFilters(prev=>({...prev,[cat]:!prev[cat]}))
  },[])

  // Fly to POI cuando se hace clic en panel
  const flyTo = useCallback((lat,lng)=>{
    leafletRef.current?.flyTo([lat,lng],15,{duration:0.8})
  },[])

  // Stats footer data
  const statsFooter = [
    { val:'392 km', label:'CICLORUTAS ACTIVAS', color:T.cyanL },
    { val:`${POI_DATA.biblioteca.length}/5`,  label:'BIBLIOTECAS', color:T.purpleL },
    { val:String(todayEvents.length||'—'),    label:'EVENTOS HOY', color:T.amberL },
    { val:aqi?`ICA ${aqi}`:'—',               label:'CALIDAD DEL AIRE', color:aqiColor },
  ]

  // ── Widget mode (compacto para modal) ─────────────────────
  if(isWidget) {
    return (
      <div style={{background:T.card||'rgba(56,182,255,0.06)',
        borderRadius:18,overflow:'hidden',
        display:'flex',flexDirection:'column',position:'relative'}}>
        {/* Orb cian */}
        <div style={{position:'absolute',width:260,height:260,borderRadius:'50%',
          background:'radial-gradient(circle,rgba(34,211,238,0.09) 0%,transparent 65%)',
          top:-70,right:-50,pointerEvents:'none',zIndex:0}}/>

        {/* Header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
          padding:'14px 16px 12px',borderBottom:`1px solid ${T.border}`,
          position:'relative',zIndex:1}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:34,height:34,borderRadius:10,flexShrink:0,
              background:'linear-gradient(135deg,rgba(34,211,238,0.22),rgba(124,58,237,0.2))',
              border:'1px solid rgba(34,211,238,0.32)',
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>
              🗺️
            </div>
            <div>
              <p style={{fontFamily:T.display,fontWeight:800,fontSize:'0.9375rem',
                color:T.text,lineHeight:1.2}}>Mapa Interactivo</p>
              <p style={{fontSize:'0.6875rem',color:T.text3,fontFamily:T.mono}}>
                {totalVisible} puntos · Bogotá D.C.
              </p>
            </div>
          </div>
          {onExpandClick && (
            <button onClick={onExpandClick}
              style={{display:'flex',alignItems:'center',gap:5,
                padding:'7px 13px',borderRadius:10,cursor:'pointer',
                background:'rgba(56,182,255,0.06)',border:`1px solid ${T.border}`,
                color:T.text2,fontSize:'0.8125rem',transition:'all 0.2s'}}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(56,182,255,0.12)';e.currentTarget.style.color=T.text;}}
              onMouseLeave={e=>{e.currentTarget.style.background='rgba(56,182,255,0.06)';e.currentTarget.style.color=T.text2;}}>
              Ver completo →
            </button>
          )}
        </div>

        {/* Filtros */}
        <div style={{display:'flex',flexWrap:'wrap',gap:6,padding:'10px 16px',
          borderBottom:`1px solid ${T.border}`,background:'rgba(0,0,0,0.12)',
          position:'relative',zIndex:1}}>
          {Object.entries(CATS).map(([key,cat])=>(
            <button key={key} onClick={()=>toggleFilter(key)} style={{
              display:'flex',alignItems:'center',gap:5,
              padding:'5px 11px',borderRadius:999,fontSize:'0.75rem',
              fontWeight:600,cursor:'pointer',transition:'all 0.2s',
              border:`1.5px solid ${filters[key]?cat.border:'rgba(56,182,255,0.1)'}`,
              background:filters[key]?cat.bg:'rgba(56,182,255,0.05)',
              color:filters[key]?cat.color:T.text3}}>
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
              <span style={{fontSize:'0.625rem',fontWeight:700,padding:'1px 5px',
                borderRadius:999,
                background:filters[key]?`${cat.color}25`:'rgba(56,182,255,0.1)',
                color:filters[key]?cat.color:T.text3}}>
                {POI_DATA[key].length}
              </span>
            </button>
          ))}
        </div>

        {/* Mapa */}
        <div ref={mapRef} style={{height:320,minHeight:320,zIndex:0}}/>
      </div>
    )
  }

  // ── Full page mode ────────────────────────────────────────
  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',
      background:'#0d1520',overflow:'hidden'}}>

      {/* ── Barra superior con filtros toggle ─────────────── */}
      <div style={{display:'flex',alignItems:'center',gap:16,
        padding:'10px 16px',borderBottom:`1px solid ${T.border}`,
        background:'rgba(5,10,24,0.95)',flexShrink:0,flexWrap:'wrap'}}>

        {/* Filtros toggle */}
        {Object.entries(CATS).map(([key,cat])=>(
          <button key={key} onClick={()=>toggleFilter(key)} style={{
            display:'flex',alignItems:'center',gap:7,
            padding:'6px 14px',borderRadius:999,fontSize:'0.8125rem',
            fontWeight:600,cursor:'pointer',transition:'all 0.2s',
            border:`1.5px solid ${filters[key]?cat.border:'rgba(56,182,255,0.1)'}`,
            background:filters[key]?cat.bg:'rgba(56,182,255,0.05)',
            color:filters[key]?cat.color:T.text3}}>
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
            {/* Toggle switch visual */}
            <div style={{width:28,height:14,borderRadius:999,
              background:filters[key]?cat.color:'rgba(255,255,255,0.12)',
              position:'relative',transition:'background 0.2s',flexShrink:0}}>
              <div style={{width:10,height:10,borderRadius:'50%',background:'#fff',
                position:'absolute',top:2,
                left:filters[key]?16:2,
                transition:'left 0.2s'}}/>
            </div>
            <span style={{fontSize:'0.625rem',fontFamily:T.mono,
              color:filters[key]?cat.color:T.text3}}>
              {POI_DATA[key].length}
            </span>
          </button>
        ))}

        <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:8}}>
          {/* Buscador */}
          <div style={{position:'relative'}}>
            <span style={{position:'absolute',left:10,top:'50%',
              transform:'translateY(-50%)',fontSize:13,color:T.text3}}>🔍</span>
            <input type="text" placeholder="Buscar lugar..."
              value={searchVal} onChange={e=>setSearchVal(e.target.value)}
              style={{background:'rgba(56,182,255,0.07)',
                border:`1px solid ${T.border}`,borderRadius:999,
                color:T.text,fontFamily:T.body,fontSize:'0.8125rem',
                padding:'7px 14px 7px 32px',outline:'none',width:160}}/>
          </div>

          {/* Toggle panel */}
          <button onClick={()=>setPanelOpen(p=>!p)}
            style={{display:'flex',alignItems:'center',gap:6,
              padding:'7px 13px',borderRadius:999,cursor:'pointer',
              background: panelOpen?'rgba(124,58,237,0.18)':'rgba(56,182,255,0.06)',
              border:`1px solid ${panelOpen?'rgba(124,58,237,0.4)':T.border}`,
              color:panelOpen?T.purpleL:T.text2,fontSize:'0.8125rem',
              transition:'all 0.2s'}}>
            ☰ {panelOpen?'Ocultar':'Lista'}
          </button>

          {/* Live badge */}
          <div style={{display:'flex',alignItems:'center',gap:6,
            padding:'5px 10px',borderRadius:999,
            background:'rgba(74,222,128,0.08)',
            border:'1px solid rgba(74,222,128,0.22)'}}>
            <span style={{width:6,height:6,borderRadius:'50%',
              background:T.greenL,boxShadow:`0 0 6px ${T.greenL}`,
              display:'inline-block',animation:'livePing 2s ease-in-out infinite'}}/>
            <span style={{fontSize:'0.6875rem',color:T.greenL,
              fontFamily:T.mono,letterSpacing:'0.06em',fontWeight:500}}>EN VIVO</span>
          </div>
        </div>
      </div>

      {/* ── Contenido: mapa + panel ───────────────────────── */}
      <div style={{flex:1,display:'flex',minHeight:0,position:'relative'}}>

        {/* Mapa */}
        <div ref={mapRef} style={{flex:1,minWidth:0,zIndex:0}}/>

        {/* Panel lateral */}
        {panelOpen && (
          <div style={{width:300,flexShrink:0,
            background:'rgba(5,10,24,0.97)',
            borderLeft:`1px solid ${T.border}`,
            overflowY:'auto',display:'flex',flexDirection:'column',
            zIndex:10}}>

            {/* Panel header */}
            <div style={{padding:'14px 14px 10px',
              borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
              <p style={{fontFamily:T.display,fontWeight:800,
                fontSize:'0.9375rem',color:T.text,marginBottom:2}}>
                Todos los puntos
              </p>
              <p style={{fontSize:'0.6875rem',color:T.text3,
                fontFamily:T.mono,letterSpacing:'0.06em'}}>
                {totalVisible} ELEMENTOS · BOGOTÁ
              </p>
            </div>

            {/* Bibliotecas */}
            {filters.biblioteca && (
              <div>
                <div style={{padding:'10px 14px 4px'}}>
                  <NbLabel>Bibliotecas</NbLabel>
                </div>
                {POI_DATA.biblioteca
                  .filter(b=>!searchVal||b.name.toLowerCase().includes(searchVal.toLowerCase()))
                  .map(b=>(
                    <PanelItem key={b.id}
                      color={T.purpleL} title={b.name}
                      sub={`${b.zona} · ${b.dist}`}
                      badge={b.status}
                      active={activeItem===b.id}
                      onClick={()=>{setActiveItem(b.id);flyTo(b.lat,b.lng)}}/>
                  ))}
              </div>
            )}

            {/* Ciclorutas */}
            {filters.ciclovia && (
              <div style={{borderTop:`1px solid ${T.border}`}}>
                <div style={{padding:'10px 14px 4px'}}>
                  <NbLabel>Ciclorutas</NbLabel>
                </div>
                {CICLORUTAS_LINES
                  .filter(r=>!searchVal||r.name.toLowerCase().includes(searchVal.toLowerCase()))
                  .map((r,i)=>(
                    <PanelItem key={i} color={T.cyanL}
                      title={r.name}
                      sub={`${r.km} km · ${r.dir}`}
                      badge="activa"
                      active={false}
                      onClick={()=>leafletRef.current?.flyTo(r.pts[Math.floor(r.pts.length/2)],13,{duration:0.8})}/>
                  ))}
              </div>
            )}

            {/* Cultura */}
            {filters.cultura && (
              <div style={{borderTop:`1px solid ${T.border}`}}>
                <div style={{padding:'10px 14px 4px'}}>
                  <NbLabel>Cultura</NbLabel>
                </div>
                {POI_DATA.cultura
                  .filter(c=>!searchVal||c.name.toLowerCase().includes(searchVal.toLowerCase()))
                  .map(c=>(
                    <PanelItem key={c.id} color={T.pinkL}
                      title={c.name} sub={`${c.zona} · ${c.dist}`}
                      badge={c.status}
                      active={activeItem===c.id}
                      onClick={()=>{setActiveItem(c.id);flyTo(c.lat,c.lng)}}/>
                  ))}
              </div>
            )}

            {/* Parques */}
            {filters.parque && (
              <div style={{borderTop:`1px solid ${T.border}`}}>
                <div style={{padding:'10px 14px 4px'}}>
                  <NbLabel>Parques</NbLabel>
                </div>
                {POI_DATA.parque
                  .filter(p=>!searchVal||p.name.toLowerCase().includes(searchVal.toLowerCase()))
                  .map(p=>(
                    <PanelItem key={p.id} color={T.greenL}
                      title={p.name} sub={`${p.zona} · ${p.dist}`}
                      active={activeItem===p.id}
                      onClick={()=>{setActiveItem(p.id);flyTo(p.lat,p.lng)}}/>
                  ))}
              </div>
            )}

            {/* Eventos hoy */}
            {todayEvents.length>0 && (
              <div style={{borderTop:`1px solid ${T.border}`}}>
                <div style={{padding:'10px 14px 4px'}}>
                  <NbLabel>Eventos hoy</NbLabel>
                </div>
                {todayEvents.map(ev=>(
                  <PanelItem key={ev.id} color={T.amberL}
                    title={ev.title}
                    sub={`${ev.location||ev.source||'Bogotá'}${ev.time?` · ${ev.time}`:''}`}
                    badge={ev.isFree?'gratis':undefined}/>
                ))}
              </div>
            )}

            {/* Calidad del aire */}
            {aqi && (
              <div style={{borderTop:`1px solid ${T.border}`}}>
                <div style={{padding:'10px 14px 4px'}}>
                  <NbLabel>Calidad del aire</NbLabel>
                </div>
                {[
                  {name:'Global · Bogotá', sub:`ICA ${aqi} · PM2.5: ${Math.round(airQualityData?.pollutants?.pm25||0)}`, status:aqiCat.toLowerCase().includes('bueno')?'abierta':'concurrida'},
                ].map((s,i)=>(
                  <PanelItem key={i} color={aqiColor}
                    title={s.name} sub={s.sub} badge={s.status}/>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Footer stats ──────────────────────────────────── */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',
        borderTop:`1px solid ${T.border}`,flexShrink:0,
        background:'rgba(0,0,0,0.25)'}}>
        {statsFooter.map((s,i)=>(
          <div key={i} style={{padding:'10px 16px',
            borderRight:i<3?`1px solid ${T.border}`:'none'}}>
            <p style={{fontFamily:T.display,fontWeight:800,
              fontSize:'1.125rem',color:s.color,lineHeight:1,marginBottom:4}}>
              {s.val}
            </p>
            <p style={{fontSize:'0.5625rem',color:T.text3,
              fontFamily:T.mono,letterSpacing:'0.07em'}}>{s.label}</p>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes livePing{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.85)}}
      `}</style>
    </div>
  )
}

export default InteractiveMap