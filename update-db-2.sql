-- Eliminar tablas en orden inverso (por las foreign keys)
DROP TABLE IF EXISTS `movimiento_detalle`;
DROP TABLE IF EXISTS `evento_movimiento`;
DROP TABLE IF EXISTS `evento`;

-- Tabla de eventos
CREATE TABLE `evento` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `descripcion` VARCHAR(255) NOT NULL,
  `fecha` DATE NOT NULL,
  `finalizado` TINYINT(1) NOT NULL DEFAULT 0,
  `observaciones` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla de movimientos del evento (CON monto manual)
CREATE TABLE `evento_movimiento` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `evento_id` INT NOT NULL,
  `concepto` VARCHAR(255) NOT NULL,
  `monto` DECIMAL(10,2) NOT NULL,
  `fecha` DATE NOT NULL,
  `observaciones` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `evento_id` (`evento_id`),
  CONSTRAINT `evento_movimiento_ibfk_1` FOREIGN KEY (`evento_id`) REFERENCES `evento` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabla de detalles (ingresos/egresos asociados) - SIN campo fecha
CREATE TABLE `movimiento_detalle` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `movimiento_id` INT NOT NULL,
  `tipo` ENUM('INGRESO','EGRESO') NOT NULL,
  `concepto` VARCHAR(255) NOT NULL,
  `monto` DECIMAL(10,2) NOT NULL,
  `medio_pago` ENUM('EFECTIVO','TRANSFERENCIA','CHEQUE') NOT NULL DEFAULT 'EFECTIVO',
  `pagado` TINYINT(1) NOT NULL DEFAULT 0,
  `fecha_pago` DATE DEFAULT NULL,
  `observaciones` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `movimiento_id` (`movimiento_id`),
  CONSTRAINT `movimiento_detalle_ibfk_1` FOREIGN KEY (`movimiento_id`) REFERENCES `evento_movimiento` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE valor_socio_base (
    id INT PRIMARY KEY DEFAULT 1,
    valor DECIMAL(10,2) NOT NULL,
    CHECK (id = 1)  -- Asegura que solo haya un registro
);

-- Insertar el valor inicial
INSERT INTO valor_socio_base (id, valor) VALUES (1, 8500.00);
