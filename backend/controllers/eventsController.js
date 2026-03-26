// backend/controllers/eventsController.js
import { fetchWithRetry, logApiCall } from '../services/apiService.js'
import { cacheGet, cacheSet, cacheDel } from '../services/cacheService.js'
import 'dotenv/config'

const CACHE_KEY    = 'events:bogota'
const PROVIDER_ID  = 5
const TM_KEY       = process.env.TICKETMASTER_API_KEY
const TM_BASE      = 'https://app.ticketmaster.com/discovery/v2'
const SOCRATA_BASE = 'https://datosabiertos.bogota.gov.co/resource'

// ── Datasets Socrata ──────────────────────────────────────────────────────────
const SOCRATA_DATASETS = [
  {
    id: 'w4gs-biht', name: 'Agéndate con Bogotá',
    fields: { title:'nombre_evento', date:'fecha_inicio', endDate:'fecha_fin',
      time:'hora_inicio', location:'lugar', address:'direccion',
      category:'tipo_evento', locality:'localidad', url:'enlace' },
  },
  {
    id: 'cqgb-2vbk', name: 'IDARTES Agenda',
    fields: { title:'nombre_evento', date:'fecha_inicio', time:'hora_inicio',
      location:'lugar', address:'direccion', category:'tipo_evento',
      locality:'localidad', url:'url_evento' },
  },
  {
    id: 'gt2j-8ykr', name: 'Secretaría de Cultura',
    fields: { title:'nombre', date:'fecha', location:'equipamiento',
      address:'direccion', locality:'localidad', category:'categoria' },
  },
]

// ── Helpers de fecha ──────────────────────────────────────────────────────────
function getDate(offsetDays = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().split('T')[0]
}

function getNextWeekday(targetDay) {
  // targetDay: 0=Dom, 1=Lun, ..., 6=Sáb
  const d = new Date()
  const current = d.getDay()
  let diff = targetDay - current
  if (diff <= 0) diff += 7
  d.setDate(d.getDate() + diff)
  return d.toISOString().split('T')[0]
}

// ── Fallback eventos distribuidos en múltiples días ───────────────────────────
function buildFallbackEvents() {
  return [
    // HOY
    { id:'fb-1', title:'Visita gratuita — Museo del Oro',
      date:getDate(0), time:'09:00',
      location:'Museo del Oro', address:'Cra. 6 #15-88, La Candelaria',
      category:'Cultura', description:'Colección de más de 55.000 piezas de oro precolombino de Colombia.',
      isFree:true, locality:'La Candelaria', source:'Banco de la República',
      url:'https://www.banrepcultural.org/museo-del-oro' },

    { id:'fb-2', title:'Lectura en voz alta — Biblioteca El Tintal',
      date:getDate(0), time:'10:00',
      location:'Biblioteca El Tintal', address:'Tv. 93 #63c-45 sur',
      category:'Literatura', description:'Actividad de fomento a la lectura para todas las edades.',
      isFree:true, locality:'Kennedy', source:'BibloRed',
      url:'https://bibliotecanacional.gov.co' },

    { id:'fb-3', title:'Show astronómico — Planetario de Bogotá',
      date:getDate(0), time:'15:00',
      location:'Planetario de Bogotá', address:'Cra. 6 #26B-52',
      category:'Ciencia', description:'Proyección del cielo nocturno y exploración del universo.',
      isFree:false, priceRange:'$6.000 – $12.000 COP', locality:'Santa Fe', source:'Planetario',
      url:'https://planetariodebogota.gov.co' },

    // MAÑANA
    { id:'fb-4', title:'Visita guiada — Museo Nacional',
      date:getDate(1), time:'11:00',
      location:'Museo Nacional de Colombia', address:'Cra. 7 #28-66',
      category:'Historia', description:'Recorrido por las colecciones del museo más antiguo del país (1823).',
      isFree:true, locality:'Santa Fe', source:'Museo Nacional',
      url:'https://museonacional.gov.co' },

    { id:'fb-5', title:'Talleres creativos — Biblioteca Virgilio Barco',
      date:getDate(1), time:'14:00',
      location:'Biblioteca Virgilio Barco', address:'Av. Calle 63 #66-06',
      category:'Arte', description:'Talleres de expresión artística para niños, jóvenes y adultos.',
      isFree:true, locality:'Teusaquillo', source:'BibloRed',
      url:'https://bibliotecanacional.gov.co' },

    // PASADO MAÑANA
    { id:'fb-6', title:'Exposición permanente — Museo Botero',
      date:getDate(2), time:'09:00',
      location:'Museo Botero', address:'Cra. 4 #16-20, La Candelaria',
      category:'Arte', description:'Obras de Fernando Botero donadas al pueblo colombiano. Entrada gratuita.',
      isFree:true, locality:'La Candelaria', source:'Banco de la República',
      url:'https://www.banrepcultural.org/museo-botero' },

    { id:'fb-7', title:'Concierto en la Luis Ángel Arango',
      date:getDate(2), time:'19:00',
      location:'Biblioteca Luis Ángel Arango', address:'Cra. 6 #11-27',
      category:'Música', description:'Concierto de música clásica y contemporánea en el principal escenario musical de Bogotá.',
      isFree:false, priceRange:'$15.000 – $45.000 COP', locality:'La Candelaria', source:'Banco de la República',
      url:'https://www.banrepcultural.org' },

    // EN 3 DÍAS
    { id:'fb-8', title:'Feria del Libro Usaquén',
      date:getDate(3), time:'10:00',
      location:'Parque de Usaquén', address:'Cra. 6A #119B-52',
      category:'Literatura', description:'Feria con más de 50 editoriales, fanzines y libros de segunda mano.',
      isFree:true, locality:'Usaquén', source:'Alcaldía Local',
      url:'https://www.bogota.gov.co' },

    // EN 4 DÍAS
    { id:'fb-9', title:'Clase abierta de yoga — Parque El Virrey',
      date:getDate(4), time:'07:30',
      location:'Parque El Virrey', address:'Cra. 15 con Calle 88',
      category:'Deporte', description:'Clase gratuita de yoga al aire libre para todos los niveles.',
      isFree:true, locality:'Chapinero', source:'IDRD',
      url:'https://www.idrd.gov.co' },

    { id:'fb-10', title:'Noche de Astronomía — Universidad Nacional',
      date:getDate(4), time:'19:30',
      location:'Universidad Nacional de Colombia', address:'Cra. 45 #26-85',
      category:'Ciencia', description:'Observación del cielo nocturno con telescopios. Abierto al público.',
      isFree:true, locality:'Teusaquillo', source:'UNAL',
      url:'https://unal.edu.co' },

    // EN 5 DÍAS
    { id:'fb-11', title:'Festival de Gastronomía — Usaquén',
      date:getDate(5), time:'11:00',
      location:'Parque de Usaquén', address:'Cra. 6A #119B-52',
      category:'Cultura', description:'Lo mejor de la gastronomía bogotana y regional en un solo lugar.',
      isFree:true, locality:'Usaquén', source:'IDT',
      url:'https://www.bogota.gov.co' },

    // PRÓXIMO DOMINGO (Ciclovía)
    { id:'fb-12', title:'Ciclovía Dominical',
      date:getNextWeekday(0), time:'07:00',
      location:'Av. Caracas y rutas alternas', address:'Bogotá',
      category:'Deporte', description:'Más de 120 km de vías para ciclistas, patinadores y peatones todos los domingos y festivos.',
      isFree:true, locality:'Toda la ciudad', source:'IDU/Movilidad',
      url:'https://www.idrd.gov.co' },

    // EN 7 DÍAS
    { id:'fb-13', title:'Obra de teatro — Teatro Colón',
      date:getDate(7), time:'20:00',
      location:'Teatro Colón', address:'Cra. 5 #10-47, La Candelaria',
      category:'Teatro', description:'Teatro nacional (1892). Temporada de teatro contemporáneo colombiano.',
      isFree:false, priceRange:'$20.000 – $80.000 COP', locality:'La Candelaria', source:'Teatro Colón',
      url:'https://teatrocolon.gov.co' },

    // EN 10 DÍAS
    { id:'fb-14', title:'Exposición de Arte Urbano — La Candelaria',
      date:getDate(10), time:'10:00',
      location:'La Candelaria', address:'Calles históricas de La Candelaria',
      category:'Arte', description:'Recorrido por los murales y arte urbano del barrio más histórico de Bogotá.',
      isFree:true, locality:'La Candelaria', source:'IDARTES',
      url:'https://www.idartes.gov.co' },

    // EN 14 DÍAS
    { id:'fb-15', title:'Feria Artesanal — Parque Nacional',
      date:getDate(14), time:'09:00',
      location:'Parque Nacional', address:'Cra. 7 con Calle 36',
      category:'Cultura', description:'Artesanos de todo Colombia con tejidos, cerámica, joyería y más.',
      isFree:true, locality:'Santa Fe', source:'Artesanías de Colombia',
      url:'https://www.artesaniasdecolombia.com.co' },
  ]
}

// ── Normalizar evento de Socrata ──────────────────────────────────────────────
function normalizeSocrata(raw, dataset, idx) {
  const f = dataset.fields
  const date = (raw[f.date] || '').split('T')[0] || getDate(0)
  const isFreeRaw = raw[f.isFree]
  const isFree = isFreeRaw !== undefined
    ? ['si','sí','true','gratuito'].includes(String(isFreeRaw).toLowerCase()) || isFreeRaw === true
    : true
  return {
    id: `socrata-${dataset.id}-${idx}`,
    title: String(raw[f.title] || 'Evento cultural').trim(),
    date,
    time: raw[f.time] || '',
    location: String(raw[f.location] || 'Bogotá').trim(),
    address: String(raw[f.address] || '').trim(),
    category: String(raw[f.category] || 'Cultura').trim(),
    description: String(raw.descripcion || raw.description || '').trim(),
    isFree,
    locality: String(raw[f.locality] || '').trim(),
    source: dataset.name,
    url: String(raw[f.url] || '').trim(),
    imageUrl: raw.imagen || raw.foto || '',
  }
}

// ── Normalizar evento de Ticketmaster ─────────────────────────────────────────
function normalizeTicketmaster(raw, idx) {
  const venue    = raw._embedded?.venues?.[0]
  const image    = raw.images?.find(i => i.ratio === '16_9' && i.width > 500)
  const dateInfo = raw.dates?.start
  const price    = raw.priceRanges?.[0]
  return {
    id: `tm-${raw.id || idx}`,
    title: raw.name || 'Evento',
    date: dateInfo?.localDate || getDate(0),
    time: dateInfo?.localTime?.substring(0, 5) || '',
    location: venue?.name || 'Bogotá',
    address: [venue?.address?.line1, venue?.city?.name].filter(Boolean).join(', '),
    category: raw.classifications?.[0]?.segment?.name || 'Entretenimiento',
    description: raw.info || raw.pleaseNote || '',
    isFree: !price,
    priceRange: price ? `$${Math.round(price.min).toLocaleString('es-CO')} – $${Math.round(price.max).toLocaleString('es-CO')} COP` : null,
    locality: venue?.city?.name || 'Bogotá',
    source: 'Ticketmaster',
    url: raw.url || '',
    imageUrl: image?.url || '',
  }
}

// ── Verificar si una fecha es próxima (hoy + 30 días) ────────────────────────
function isUpcoming(dateStr) {
  if (!dateStr) return false
  const d   = new Date(dateStr)
  const now = new Date(); now.setHours(0,0,0,0)
  const max = new Date(); max.setDate(max.getDate() + 30)
  return d >= now && d <= max
}

// ── Ticketmaster ──────────────────────────────────────────────────────────────
async function fetchTicketmaster() {
  if (!TM_KEY) { console.log('[Events] Ticketmaster sin key — omitiendo'); return [] }
  const data = await fetchWithRetry(`${TM_BASE}/events.json`, {
    apikey:        TM_KEY,
    city:          'Bogota',
    countryCode:   'CO',
    startDateTime: `${getDate(0)}T00:00:00Z`,
    endDateTime:   `${getDate(30)}T23:59:59Z`,
    size:          50,
    sort:          'date,asc',
  })
  const events = data?._embedded?.events || []
  console.log(`[Events] Ticketmaster: ${events.length} eventos`)
  return events.map((e, i) => normalizeTicketmaster(e, i)).filter(e => isUpcoming(e.date))
}

// ── Socrata ───────────────────────────────────────────────────────────────────
async function fetchSocrata(dataset) {
  const data = await fetchWithRetry(`${SOCRATA_BASE}/${dataset.id}.json`, {
    $limit: 50, $order: `${dataset.fields.date} ASC`,
    $where: `${dataset.fields.date} >= '${getDate(0)}'`,
  }, 1)
  return data.map((raw, i) => normalizeSocrata(raw, dataset, i)).filter(e => isUpcoming(e.date))
}

// ── Deduplicar ────────────────────────────────────────────────────────────────
function deduplicateEvents(events) {
  const seen = new Set()
  return events.filter(e => {
    const key = e.title.toLowerCase().replace(/\s+/g, '').substring(0, 30)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

// ── GET /api/events ───────────────────────────────────────────────────────────
export async function getEvents(req, res, next) {
  const t0 = Date.now()
  try {
    // 1. Caché
    const cached = await cacheGet(CACHE_KEY)
    if (cached) {
      await logApiCall({ providerId: PROVIDER_ID, endpoint: '/events', statusCode: 200, responseTime: Date.now() - t0, cacheHit: true })
      return res.json({ events: cached, fromCache: true, total: cached.length })
    }

    let allEvents = []

    // 2. Ticketmaster
    try {
      const tmEvents = await fetchTicketmaster()
      allEvents.push(...tmEvents)
    } catch (err) {
      console.warn('[Events] Ticketmaster falló:', err.message)
    }

    // 3. Socrata
    let socrataOk = false
    for (const dataset of SOCRATA_DATASETS) {
      try {
        const events = await fetchSocrata(dataset)
        if (events.length > 0) {
          allEvents.push(...events)
          console.log(`✅ Socrata ${dataset.name}: ${events.length} eventos`)
          socrataOk = true
          break
        }
      } catch (err) {
        console.warn(`⚠️ Socrata ${dataset.name} falló:`, err.message)
      }
    }

    // 4. Fallback si no hay datos reales — ahora distribuido en múltiples días
    if (!socrataOk) {
      const fallback = buildFallbackEvents()
      if (allEvents.length === 0) {
        console.log('[Events] Usando fallback completo (15 eventos en 14 días)')
        allEvents = fallback
      } else {
        // Combinar TM con fallback para tener más cobertura
        allEvents.push(...fallback.slice(0, 5))
      }
    }

    // 5. Deduplicar y ordenar
    const events = deduplicateEvents(allEvents).sort((a, b) => {
      const da = new Date(`${a.date}T${a.time || '00:00'}`)
      const db = new Date(`${b.date}T${b.time || '00:00'}`)
      return da - db
    })

    await cacheSet(CACHE_KEY, events, 'events')
    await logApiCall({ providerId: PROVIDER_ID, endpoint: '/events', statusCode: 200, responseTime: Date.now() - t0 })

    return res.json({
      events,
      fromCache: false,
      total: events.length,
      sources: {
        ticketmaster: allEvents.filter(e => e.id?.startsWith('tm-')).length,
        socrata:      allEvents.filter(e => e.id?.startsWith('socrata-')).length,
        fallback:     allEvents.filter(e => e.id?.startsWith('fb-')).length,
      },
    })

  } catch (err) {
    const stale = await cacheGet(`${CACHE_KEY}:stale`)
    if (stale) return res.json({ events: stale, fromCache: true, isStale: true, total: stale.length })
    next(err)
  }
}

// ── DELETE /api/events/cache ──────────────────────────────────────────────────
export async function clearEventsCache(req, res) {
  await cacheDel(CACHE_KEY)
  res.json({ message: 'Caché de eventos eliminado' })
}