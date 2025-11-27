
USE gestion_socios;

CREATE TABLE caja_diaria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    tipo ENUM('INGRESO', 'EGRESO') NOT NULL,
    concepto VARCHAR(255) NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    medio_pago ENUM('EFECTIVO', 'TRANSFERENCIA') NOT NULL DEFAULT 'EFECTIVO',
    saldo DECIMAL(10,2) NOT NULL
);

-- Tabla empleado
CREATE TABLE empleado (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    monto_base DECIMAL(10,2) NOT NULL,          -- Sueldo base
    detalles VARCHAR(255) NULL,            -- Observaciones o notas
    activo BOOLEAN NOT NULL DEFAULT TRUE,  -- Por si un día querés desactivar empleados
);

-- Tabla sueldo
CREATE TABLE sueldo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empleado_id INT NOT NULL,
    anio INT NOT NULL,
    mes TINYINT NOT NULL,                  -- 1 a 12
    pagado BOOLEAN DEFAULT FALSE,
    fecha_pago TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (empleado_id) REFERENCES empleado(id),
    UNIQUE KEY unico_sueldo (empleado_id, anio, mes) -- Un sueldo por mes/año por empleado
);

