USE gestion_socios;

-- =========================================================
-- Sueldos: quitar fecha_pago (no se usa) y evitar meses duplicados
-- Solo se aplica lo que falte. Si falla por duplicados, revisarlos con:
--   SELECT empleado_id, anio, mes, COUNT(*) FROM sueldo
--   GROUP BY empleado_id, anio, mes HAVING COUNT(*) > 1;
-- =========================================================
SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sueldo' AND COLUMN_NAME = 'fecha_pago') > 0,
  'ALTER TABLE sueldo DROP COLUMN fecha_pago',
  'DO 0'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql = IF(
  (SELECT COUNT(*) FROM information_schema.STATISTICS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sueldo' AND INDEX_NAME = 'unico_sueldo') = 0,
  'ALTER TABLE sueldo ADD UNIQUE KEY unico_sueldo (empleado_id, anio, mes)',
  'DO 0'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- =========================================================
-- Publicidades
-- =========================================================
CREATE TABLE anunciante (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  tipo ENUM('CAMISETA','COLECTIVO') NOT NULL,
  monto_base DECIMAL(10,2) NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  detalles VARCHAR(255) NULL
);

CREATE TABLE publicidad (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  anunciante_id INT NOT NULL,
  anio INT NOT NULL,
  mes TINYINT NOT NULL,
  monto_mes DECIMAL(10,2) NOT NULL DEFAULT 0,
  cobrado BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE KEY unica_publicidad (anunciante_id, anio, mes),
  CONSTRAINT publicidad_anunciante_fk FOREIGN KEY (anunciante_id) REFERENCES anunciante (id)
);

-- =========================================================
-- Carga inicial 2026 (planilla PUBLICIDADES 2026 VARIAS)
-- mes_alta: primer mes con publicidad
-- ultimo_cobrado: hasta qué mes está cobrado (0 = nada cobrado)
-- =========================================================
CREATE TEMPORARY TABLE carga_publicidad (
  nombre VARCHAR(100),
  tipo ENUM('CAMISETA','COLECTIVO'),
  monto DECIMAL(10,2),
  detalles VARCHAR(255),
  mes_alta TINYINT,
  ultimo_cobrado TINYINT
);

INSERT INTO carga_publicidad (nombre, tipo, monto, detalles, mes_alta, ultimo_cobrado) VALUES
  ('QUIMTEX',               'CAMISETA',  110000, NULL,                                        1, 9),
  ('EZEQUIEL ALTUBE',       'CAMISETA',  150000, NULL,                                        3, 9),
  ('DON PANCHO',            'CAMISETA',  110000, NULL,                                        3, 10),
  ('BURBUJAS',              'CAMISETA',   80000, NULL,                                        3, 9),
  ('CHINO VESCE',           'CAMISETA',   60000, 'AGO: $45.000 descontados de viáticos',      4, 9),
  ('MASCALZONE',            'CAMISETA',   40000, NULL,                                        4, 9),
  ('SAN VALIENTE BULLRICH', 'CAMISETA',   40000, 'Tel: 11 3375-3296',                         4, 10),
  ('Kiosco Gaston',         'COLECTIVO',  70000, 'Tel: 2494-567100',                          5, 9),
  ('Cabaña La Maria',       'COLECTIVO',  70000, 'Tel: 2494-538100',                          5, 9),
  ('Comisiones LyG',        'COLECTIVO',  70000, 'Tel: 2494-007454',                          5, 9),
  ('Estudio Guisande Dick', 'COLECTIVO', 100000, 'MAY: Efectivo sobre caja fuerte',           5, 8),
  ('Dariblanc',             'COLECTIVO',  70000, 'Tel: 2494-275941',                          5, 0),
  ('Farmacia De Hoyos',     'COLECTIVO',  70000, 'Tel: 2494-556705',                          5, 7),
  ('Gulliver',              'COLECTIVO',  70000, 'Tel: 2494-214287',                          5, 10),
  ('Luciano De Arrieta',    'COLECTIVO',  70000, 'Tel: 2494-068430',                          5, 7),
  ('Gomeria Sarmiento',     'COLECTIVO',  70000, 'Tel: 2494 58-9783',                         5, 9),
  ('Gonzalo David',         'COLECTIVO',  70000, 'Tel: 2494-320100',                          5, 10),
  ('Todo Filtro',           'COLECTIVO',  70000, 'Tel: 2494-577120 - JUL y AGO: Descontado de la factura adeudada', 5, 10),
  ('Fullcomp',              'COLECTIVO',  70000, 'Tel: 2494-563469',                          5, 9),
  ('Cemoa',                 'COLECTIVO',  70000, 'Tel: 2494-516053',                          4, 9),
  ('Inflables Matute',      'COLECTIVO',  70000, 'Tel: 2494-537736',                          5, 9);

INSERT INTO anunciante (nombre, tipo, monto_base, activo, detalles)
SELECT nombre, tipo, monto, TRUE, detalles FROM carga_publicidad;

INSERT INTO publicidad (anunciante_id, anio, mes, monto_mes, cobrado)
SELECT a.id, 2026, m.mes, c.monto, m.mes <= c.ultimo_cobrado
FROM carga_publicidad c
JOIN anunciante a ON a.nombre = c.nombre AND a.tipo = c.tipo
JOIN (
  SELECT 1 AS mes UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
  UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8
  UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12
) m ON m.mes >= c.mes_alta;

-- Quimtex pagó 100.000 en enero y febrero (después pasó a 110.000)
UPDATE publicidad p
JOIN anunciante a ON a.id = p.anunciante_id
SET p.monto_mes = 100000
WHERE a.nombre = 'QUIMTEX' AND p.anio = 2026 AND p.mes IN (1, 2);

DROP TEMPORARY TABLE carga_publicidad;
