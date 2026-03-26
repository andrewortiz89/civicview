-- ============================================================
-- CivicView — Schema SQL completo
-- MySQL 8+ | utf8mb4 | Motor InnoDB
-- ============================================================

CREATE DATABASE IF NOT EXISTS civicview_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE civicview_db;

-- ── Ciudades ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cities (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL UNIQUE,
  country    VARCHAR(100) NOT NULL DEFAULT 'Colombia',
  latitude   DECIMAL(10,8) NOT NULL,
  longitude  DECIMAL(11,8) NOT NULL,
  timezone   VARCHAR(50)  NOT NULL DEFAULT 'America/Bogota',
  is_active  BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_active (is_active),
  INDEX idx_coordinates (latitude, longitude)
) ENGINE=InnoDB;

-- ── Categorías de POIs ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS poi_categories (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  icon        VARCHAR(10)  DEFAULT '📍',
  color       VARCHAR(7)   DEFAULT '#6B7280',
  description TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_active (is_active)
) ENGINE=InnoDB;

-- ── Proveedores de APIs ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS api_providers (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  name                 VARCHAR(100) NOT NULL UNIQUE,
  service_type         ENUM('weather','air_quality','events','maps') NOT NULL,
  base_url             VARCHAR(255) NOT NULL,
  api_key_encrypted    VARCHAR(255) COMMENT 'Clave encriptada (no guardar en texto plano)',
  rate_limit_day       INT DEFAULT 1000,
  rate_limit_hour      INT DEFAULT 60,
  current_usage_day    INT DEFAULT 0,
  current_usage_hour   INT DEFAULT 0,
  is_active            BOOLEAN DEFAULT TRUE,
  priority             INT DEFAULT 1 COMMENT '1=Principal, 2=Alternativa',
  cost_per_call        DECIMAL(10,4) DEFAULT 0.00,
  last_reset           DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at           DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_active_priority (is_active, priority),
  INDEX idx_service_type (service_type)
) ENGINE=InnoDB;

-- ── Caché general del backend (clave-valor) ──────────────────
-- Usada por cacheService.js como capa 2 (persistente)
CREATE TABLE IF NOT EXISTS api_cache (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  cache_key  VARCHAR(200) NOT NULL UNIQUE,
  data       MEDIUMTEXT   NOT NULL,
  expires_at DATETIME     NOT NULL,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_expires  (expires_at),
  INDEX idx_cache_key(cache_key)
) ENGINE=InnoDB;

-- ── Caché de Clima ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS weather_cache (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  city_id           INT NOT NULL,
  temperature       DECIMAL(5,2) NOT NULL,
  feels_like        DECIMAL(5,2),
  condition         VARCHAR(50) NOT NULL,
  condition_code    VARCHAR(10),
  humidity          INT,
  wind_speed        DECIMAL(5,2),
  precipitation_prob INT,
  forecast          JSON COMMENT 'Array pronóstico 7 días',
  timestamp         DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_city_timestamp (city_id, timestamp),
  INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB;

-- ── Caché de Calidad del Aire ────────────────────────────────
CREATE TABLE IF NOT EXISTS air_quality_cache (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  city_id      INT NOT NULL,
  aqi_value    INT NOT NULL,
  aqi_category VARCHAR(50) NOT NULL,
  pm25         DECIMAL(6,2),
  pm10         DECIMAL(6,2),
  o3           DECIMAL(6,2),
  no2          DECIMAL(6,2),
  so2          DECIMAL(6,2),
  co           DECIMAL(6,2),
  timestamp    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_city_timestamp (city_id, timestamp),
  INDEX idx_aqi_value (aqi_value)
) ENGINE=InnoDB;

-- ── Puntos de Interés ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS map_poi (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  city_id       INT NOT NULL,
  category_id   INT NOT NULL,
  name          VARCHAR(255) NOT NULL,
  latitude      DECIMAL(10,8) NOT NULL,
  longitude     DECIMAL(11,8) NOT NULL,
  description   TEXT,
  address       VARCHAR(255),
  phone         VARCHAR(20),
  website       VARCHAR(255),
  opening_hours JSON,
  is_active     BOOLEAN DEFAULT TRUE,
  last_update   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (city_id)     REFERENCES cities(id)         ON DELETE CASCADE  ON UPDATE CASCADE,
  FOREIGN KEY (category_id) REFERENCES poi_categories(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_city_category (city_id, category_id),
  INDEX idx_coordinates   (latitude, longitude),
  INDEX idx_active        (is_active),
  FULLTEXT idx_search     (name, description)
) ENGINE=InnoDB;

-- ── Caché de Eventos ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events_cache (
  id                    INT AUTO_INCREMENT PRIMARY KEY,
  city_id               INT NOT NULL,
  category_id           INT NOT NULL,
  poi_id                INT NULL,
  title                 VARCHAR(255) NOT NULL,
  description           TEXT,
  event_date            DATE NOT NULL,
  event_time            TIME,
  end_date              DATE,
  end_time              TIME,
  location              VARCHAR(255),
  latitude              DECIMAL(10,8),
  longitude             DECIMAL(11,8),
  source_url            TEXT,
  image_url             TEXT,
  is_free               BOOLEAN DEFAULT TRUE,
  price_range           VARCHAR(50),
  organizer             VARCHAR(255),
  registration_required BOOLEAN DEFAULT FALSE,
  timestamp             DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (city_id)     REFERENCES cities(id)         ON DELETE CASCADE  ON UPDATE CASCADE,
  FOREIGN KEY (category_id) REFERENCES poi_categories(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (poi_id)      REFERENCES map_poi(id)        ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_city_date  (city_id, event_date),
  INDEX idx_category   (category_id),
  INDEX idx_date_range (event_date, end_date),
  INDEX idx_free_events(is_free),
  FULLTEXT idx_search  (title, description)
) ENGINE=InnoDB;

-- ── Reglas de Pico y Placa ───────────────────────────────────
CREATE TABLE IF NOT EXISTS pico_placa_rules (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  city_id           INT NOT NULL,
  day_of_week       INT NOT NULL COMMENT '0=Domingo,1=Lunes,...,6=Sábado',
  restricted_digits VARCHAR(20) COMMENT 'Ej: 5-6 | NULL si no aplica',
  morning_start     TIME DEFAULT '06:00:00',
  morning_end       TIME DEFAULT '08:30:00',
  evening_start     TIME DEFAULT '16:00:00',
  evening_end       TIME DEFAULT '19:30:00',
  is_active         BOOLEAN DEFAULT TRUE,
  effective_date    DATE,
  expiry_date       DATE,
  last_update       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY unique_city_day (city_id, day_of_week),
  INDEX idx_active (is_active)
) ENGINE=InnoDB;

-- ── Logs de llamadas a APIs ──────────────────────────────────
CREATE TABLE IF NOT EXISTS api_logs (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  api_provider_id  INT NOT NULL,
  city_id          INT NULL,
  endpoint         VARCHAR(255) NOT NULL,
  method           VARCHAR(10)  DEFAULT 'GET',
  status_code      INT,
  response_time    INT          COMMENT 'Milisegundos',
  cache_hit        BOOLEAN      DEFAULT FALSE,
  error_message    TEXT,
  request_params   JSON,
  response_size    INT          COMMENT 'Bytes',
  timestamp        DATETIME     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (api_provider_id) REFERENCES api_providers(id) ON DELETE CASCADE  ON UPDATE CASCADE,
  FOREIGN KEY (city_id)         REFERENCES cities(id)        ON DELETE SET NULL  ON UPDATE CASCADE,
  INDEX idx_provider_status    (api_provider_id, status_code),
  INDEX idx_provider_timestamp (api_provider_id, timestamp),
  INDEX idx_timestamp          (timestamp),
  INDEX idx_cache_hit          (cache_hit)
) ENGINE=InnoDB;

-- ============================================================
-- DATOS INICIALES
-- ============================================================

INSERT IGNORE INTO cities (name, country, latitude, longitude, timezone, is_active) VALUES
  ('Bogotá',   'Colombia', 4.7110, -74.0721, 'America/Bogota', TRUE),
  ('Medellín', 'Colombia', 6.2442, -75.5812, 'America/Bogota', FALSE),
  ('Cali',     'Colombia', 3.4516, -76.5320, 'America/Bogota', FALSE);

INSERT IGNORE INTO poi_categories (name, icon, color, description) VALUES
  ('Ciclovía',      '🚴', '#00F5A0', 'Rutas para ciclistas'),
  ('Parque',        '🌳', '#00D9F5', 'Espacios verdes y recreativos'),
  ('Biblioteca',    '📚', '#2C8EFF', 'Bibliotecas públicas'),
  ('Centro Cultural','🎭','#A855F7', 'Centros culturales y teatros'),
  ('Museo',         '🏛️', '#FFB800', 'Museos y galerías'),
  ('Concierto',     '🎵', '#EC4899', 'Eventos musicales'),
  ('Festival',      '🎪', '#F97316', 'Festivales y celebraciones'),
  ('Deporte',       '⚽', '#14B8A6', 'Eventos deportivos'),
  ('Ciencia',       '🔭', '#FFB800', 'Ciencia y tecnología'),
  ('Literatura',    '📖', '#2C8EFF', 'Literatura y lectura'),
  ('Arte',          '🎨', '#F472B6', 'Arte y exposiciones'),
  ('Historia',      '🏺', '#FF8C42', 'Historia y patrimonio'),
  ('Otro',          '📌', '#6B7280', 'Sin categoría específica');

INSERT IGNORE INTO api_providers (name, service_type, base_url, rate_limit_day, rate_limit_hour, priority, is_active) VALUES
  ('OpenWeatherMap', 'weather',     'https://api.openweathermap.org/data/2.5', 1000,   60,    1, TRUE),
  ('WeatherAPI',     'weather',     'https://api.weatherapi.com/v1',           1000000,50000, 2, FALSE),
  ('AQICN',          'air_quality', 'https://api.waqi.info',                   1000,   60,    1, TRUE),
  ('IQAir',          'air_quality', 'https://api.airvisual.com/v2',            10000,  500,   2, FALSE),
  ('Socrata Bogotá', 'events',      'https://datosabiertos.bogota.gov.co/resource', 999999, 999999, 1, TRUE),
  ('OpenStreetMap',  'maps',        'https://tile.openstreetmap.org',          999999, 999999, 1, TRUE),
  ('Mapbox',         'maps',        'https://api.mapbox.com',                  50000,  5000,  2, FALSE);

-- Pico y Placa Bogotá 2025 (day_of_week: 0=Dom, 1=Lun, ..., 6=Sáb)
INSERT IGNORE INTO pico_placa_rules (city_id, day_of_week, restricted_digits, is_active) VALUES
  (1, 1, '5-6', TRUE),
  (1, 2, '7-8', TRUE),
  (1, 3, '9-0', TRUE),
  (1, 4, '1-2', TRUE),
  (1, 5, '3-4', TRUE),
  (1, 6, NULL,  FALSE),
  (1, 0, NULL,  FALSE);

-- ============================================================
-- PROCEDIMIENTO: limpiar caché expirado
-- ============================================================
DROP PROCEDURE IF EXISTS clean_expired_cache;
DELIMITER //
CREATE PROCEDURE clean_expired_cache()
BEGIN
  DELETE FROM api_cache        WHERE expires_at  < NOW();
  DELETE FROM weather_cache    WHERE timestamp   < DATE_SUB(NOW(), INTERVAL 7 DAY);
  DELETE FROM air_quality_cache WHERE timestamp  < DATE_SUB(NOW(), INTERVAL 7 DAY);
  DELETE FROM events_cache     WHERE end_date    < DATE_SUB(NOW(), INTERVAL 30 DAY);
  DELETE FROM api_logs         WHERE timestamp   < DATE_SUB(NOW(), INTERVAL 30 DAY);
  SELECT ROW_COUNT() AS rows_deleted;
END //
DELIMITER ;

-- ============================================================
-- VISTA: estadísticas de APIs últimos 30 días
-- ============================================================
CREATE OR REPLACE VIEW api_statistics AS
SELECT
  p.name            AS provider_name,
  p.service_type,
  COUNT(l.id)       AS total_calls,
  SUM(l.cache_hit)  AS cache_hits,
  SUM(l.status_code BETWEEN 200 AND 299) AS successful_calls,
  SUM(l.status_code >= 400)              AS failed_calls,
  ROUND(AVG(l.response_time), 0)         AS avg_response_ms,
  ROUND(SUM(l.cache_hit) / COUNT(l.id) * 100, 1) AS cache_hit_rate_pct,
  DATE(l.timestamp) AS date
FROM api_providers p
LEFT JOIN api_logs l ON p.id = l.api_provider_id
  AND l.timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY p.id, DATE(l.timestamp)
ORDER BY date DESC, provider_name ASC;

-- ============================================================
-- VISTA: estado actual de rate limits
-- ============================================================
CREATE OR REPLACE VIEW api_rate_limit_status AS
SELECT
  id, name, service_type,
  current_usage_day,  rate_limit_day,
  ROUND(current_usage_day  / rate_limit_day  * 100, 1) AS usage_pct_day,
  current_usage_hour, rate_limit_hour,
  ROUND(current_usage_hour / rate_limit_hour * 100, 1) AS usage_pct_hour,
  is_active, priority, last_reset
FROM api_providers
WHERE is_active = TRUE
ORDER BY service_type, priority;