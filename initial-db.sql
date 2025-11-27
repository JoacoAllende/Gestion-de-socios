-- ========================================
-- BASE DE DATOS SOCIOS / PAGOS / ACTIVIDADES
-- ========================================

-- Crear la base de datos
DROP DATABASE IF EXISTS gestion_socios;
CREATE DATABASE IF NOT EXISTS gestion_socios;
USE gestion_socios;

CREATE TABLE usuario (
    id INT NOT NULL AUTO_INCREMENT,
    nombre varchar(50) NOT NULL,
    contraseña varchar(255) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY nombre(nombre)
);

-- ======================
-- Tabla Categoría
-- ======================
CREATE TABLE categoria_futbol (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

INSERT INTO categoria_futbol (nombre) VALUES ('Primera Masc'), ('Reserva'), ('Quinta'), ('Sexta'), ('Septima'), ('Ocatava'), ('Novena'), ('Decima'), ('Pre Decima'), ('Escuelita Masc'), ('Primera fem'), ('Sub 16'), ('Sub 14'), ('Sub 12'), ('Sub 10'), ('Sub 08'), ('Escuelita fem');

CREATE TABLE categoria_basquet (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

INSERT INTO categoria_basquet (nombre) VALUES ('Masculino'), ('Femenino'), ('Femenino adultos');

CREATE TABLE categoria_paleta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

INSERT INTO categoria_paleta (nombre) VALUES ('Masculino'), ('Femenino');

CREATE TABLE ficha_socio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

INSERT INTO ficha_socio (nombre) VALUES ('Alejandra'), ('Débito'), ('Secretaria');

-- ======================
-- Tabla Socio
-- ======================
CREATE TABLE socio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nro_socio INT UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    dni VARCHAR(20) UNIQUE NULL,
    direccion VARCHAR(50) NULL,
    contacto VARCHAR(20) NULL,
    fecha_nacimiento DATE NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    cuota_activa BOOLEAN NOT NULL DEFAULT TRUE,
    cuota_pasiva BOOLEAN NOT NULL DEFAULT FALSE,
    descuento_familiar BOOLEAN NOT NULL DEFAULT FALSE,
    becado BOOLEAN NOT NULL DEFAULT FALSE,
    secretaria BOOLEAN NOT NULL DEFAULT FALSE,
    categoria_futbol_id INT NULL,
    categoria_basquet_id INT NULL,
    categoria_paleta_id INT NULL,
    ficha_socio_id INT NOT NULL,
    CONSTRAINT chk_cuotas_exclusivas CHECK (NOT (cuota_activa AND cuota_pasiva)),
    FOREIGN KEY (categoria_futbol_id) REFERENCES categoria_futbol(id),
    FOREIGN KEY (categoria_basquet_id) REFERENCES categoria_basquet(id),
    FOREIGN KEY (categoria_paleta_id) REFERENCES categoria_paleta(id),
    FOREIGN KEY (ficha_socio_id) REFERENCES ficha_socio(id)
);


-- ======================
-- Tabla Actividad
-- ======================
CREATE TABLE actividad (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL
);

INSERT INTO actividad (nombre) VALUES ('Futbol'), ('Paleta'), ('Basquet');

CREATE TABLE valor_actividad (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cantidad_actividades TINYINT NOT NULL,  -- 1, 2 o 3
    valor DECIMAL(10,2) NOT NULL
);

-- Insertar los valores
INSERT INTO valor_actividad (cantidad_actividades, valor) VALUES
(1, 18500.00),
(2, 28000.00),
(3, 32500.00);

CREATE TABLE configuracion_descuentos (
    tipo ENUM('FAMILIAR','PASIVA') PRIMARY KEY,
    valor DECIMAL(10,2) NOT NULL
);

-- Ejemplo de carga
INSERT INTO configuracion_descuentos (tipo, valor) VALUES
('FAMILIAR', 9000.00),
('PASIVA', 4000.00);


-- ======================
-- Tabla Socio_Actividad (relación muchos a muchos)
-- ======================
CREATE TABLE socio_actividad (
    socio_id INT NOT NULL,
    actividad_id INT NOT NULL,
    PRIMARY KEY(socio_id, actividad_id),
    FOREIGN KEY (socio_id) REFERENCES socio(nro_socio),
    FOREIGN KEY (actividad_id) REFERENCES actividad(id)
);

-- ======================
-- Tabla Pago
-- ======================
CREATE TABLE pago (
    id INT AUTO_INCREMENT PRIMARY KEY,
    socio_id INT NOT NULL,
    anio INT NOT NULL,
    mes TINYINT NOT NULL,  -- 1 a 12
    monto DECIMAL(10,2) DEFAULT 0,
    pagado BOOLEAN DEFAULT FALSE,
    efectivo BOOLEAN DEFAULT FALSE,
    fecha_pago TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (socio_id) REFERENCES socio(nro_socio),
    UNIQUE KEY unico_pago (socio_id, anio, mes)
);


INSERT INTO pago (socio_id, anio, mes, monto, pagado, efectivo)
SELECT s.nro_socio, 2025, m.mes, 0, FALSE, FALSE
FROM socio s
CROSS JOIN (
    SELECT 9 AS mes UNION ALL
    SELECT 10 UNION ALL
    SELECT 11 UNION ALL
    SELECT 12
) m
WHERE s.activo = TRUE
ON DUPLICATE KEY UPDATE monto = VALUES(monto); -- opcional, evita errores si ya existe


SET @mes_inicio = 9; 
SET @anio = 2025;

UPDATE pago p
JOIN socio s ON s.nro_socio = p.socio_id

-- Cantidad de actividades
LEFT JOIN (
    SELECT sa.socio_id, COUNT(*) AS cantidad_actividades
    FROM socio_actividad sa
    GROUP BY sa.socio_id
) act ON act.socio_id = s.nro_socio

-- Valor por cantidad de actividades
LEFT JOIN valor_actividad va 
  ON va.cantidad_actividades = IFNULL(act.cantidad_actividades, 0)

-- Descuento familiar
LEFT JOIN configuracion_descuentos df ON df.tipo = 'FAMILIAR'
-- Descuento por cuota pasiva
LEFT JOIN configuracion_descuentos dp ON dp.tipo = 'PASIVA'

SET 
  p.monto = CASE 
              WHEN s.becado = TRUE THEN -1
              ELSE GREATEST(
                      (CASE WHEN s.cuota_activa = TRUE OR s.cuota_pasiva = TRUE THEN 8500 ELSE 0 END)
                    + IFNULL(va.valor, 0)
                    - (CASE WHEN s.descuento_familiar THEN IFNULL(df.valor,0) ELSE 0 END)
                    - (CASE WHEN s.cuota_pasiva THEN IFNULL(dp.valor,0) ELSE 0 END)
                , 0)
            END,
  p.pagado = CASE 
               WHEN s.becado = TRUE THEN TRUE 
               ELSE p.pagado 
             END
WHERE s.activo = TRUE
  AND p.anio = @anio
  AND p.mes >= @mes_inicio
  AND p.pagado = FALSE;



--   UPDATE pago SET pagado = true WHERE mes = 9;

-- AND p.pagado = FALSE

UPDATE pago
SET pagado = TRUE
WHERE socio_id IN (
    421, 13, 1046, 37, 79, 702, 1501, 109, 555, 
    159, 296, 178, 205, 1115, 655, 246, 254, 404, 253
);

-- Desactivar temporalmente las verificaciones de claves foráneas
-- SET FOREIGN_KEY_CHECKS = 0;

-- -- Actualizar el número de socio en la tabla principal
-- UPDATE socio 
-- SET nro_socio = 1515 
-- WHERE nro_socio = 1567;

-- -- Actualizar las referencias en socio_actividad
-- UPDATE socio_actividad 
-- SET socio_id = 1515 
-- WHERE socio_id = 1567;

-- -- Actualizar las referencias en pago
-- UPDATE pago 
-- SET socio_id = 1515 
-- WHERE socio_id = 1567;

-- -- Reactivar las verificaciones de claves foráneas
-- SET FOREIGN_KEY_CHECKS = 1;


-- SELECT 
--   s.nro_socio,
--   s.nombre,
--   s.dni,
--   s.activo,
--   'Al día' AS estado_pago
-- FROM socio s
-- WHERE s.activo = TRUE
--   AND EXISTS (
--     SELECT 1 FROM pago p
--     WHERE p.socio_id = s.nro_socio
--       AND p.pagado = TRUE
--       AND (
--         (p.anio = YEAR(CURDATE()) AND p.mes = MONTH(CURDATE()))
--         OR (p.anio = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) AND p.mes = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)))
--         OR (p.anio = YEAR(DATE_SUB(CURDATE(), INTERVAL 2 MONTH)) AND p.mes = MONTH(DATE_SUB(CURDATE(), INTERVAL 2 MONTH)))
--       )
--   )
-- ORDER BY s.nombre ASC;

-- SHOw TABLE; SHOW CREATE TABLE ...;