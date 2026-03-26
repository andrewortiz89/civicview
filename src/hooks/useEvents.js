/// src/hooks/useEvents.js
import { useState, useEffect, useCallback } from "react";
import EventsService from "../services/eventsService";

// ── Helpers de fecha ─────────────────────────────────────────────────────────
function getDateString(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0];
}

function getWeekEnd() {
  const d = new Date();
  const dayOfWeek = d.getDay(); // 0 = domingo
  const daysUntilSunday = 7 - dayOfWeek; // días hasta el próximo domingo
  d.setDate(d.getDate() + daysUntilSunday);
  return d.toISOString().split("T")[0];
}

// ── Procesar array de eventos en la estructura que usa Events.jsx ─────────────
function processEvents(eventsArray) {
  if (!Array.isArray(eventsArray)) return null;

  const today = getDateString(0);
  const tomorrow = getDateString(1);
  const weekEnd = getWeekEnd();

  const all = eventsArray;

  const todayEvents = all.filter((e) => e.date === today);
  const tomorrowEvents = all.filter((e) => e.date === tomorrow);
  const thisWeekEvents = all.filter(
    (e) => e.date >= today && e.date <= weekEnd,
  );

  return {
    all,
    today: todayEvents,
    tomorrow: tomorrowEvents,
    thisWeek: thisWeekEvents,
    total: all.length,
    usingMockData: all.some((e) => e.id?.startsWith("fb-")), // fallback events tienen id 'fb-X'
    isStale: false,
    timestamp: new Date().toISOString(),
  };
}

// ── Hook principal ────────────────────────────────────────────────────────────
const useEvents = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadEventsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const eventsArray = await EventsService.getEvents();
      setData(processEvents(eventsArray));
    } catch (err) {
      setError(err.message || "Error al cargar eventos");
      console.error("Error in useEvents:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEventsData();
  }, [loadEventsData]);

  const refresh = useCallback(() => {
    EventsService.clearCache();
    loadEventsData();
  }, [loadEventsData]);

  return { data, loading, error, refresh };
};

export default useEvents;
