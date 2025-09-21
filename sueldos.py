import pandas as pd
import mysql.connector

# --- Configuración ---
file_path = r"C:\Users\joaco\Downloads\SUELDOS 2025.xlsx"

conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="allende247855",
    database="gestion_socios"
)
cursor = conn.cursor()

# --- Reiniciar tablas ---
cursor.execute("DROP TABLE IF EXISTS sueldo")
cursor.execute("DROP TABLE IF EXISTS empleado")

cursor.execute("""
CREATE TABLE empleado (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    monto_base DECIMAL(10,2) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    detalles VARCHAR(255) DEFAULT NULL
)
""")

cursor.execute("""
CREATE TABLE sueldo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empleado_id INT NOT NULL,
    anio INT NOT NULL,
    mes TINYINT NOT NULL,
    monto_mes DECIMAL(10,2) NOT NULL DEFAULT 0,
    pagado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_pago DATE DEFAULT NULL,
    FOREIGN KEY (empleado_id) REFERENCES empleado(id)
)
""")

print("✅ Tablas empleado y sueldo creadas")

# --- Filas a saltar ---
skip_rows = [0]

# --- Nombres con manejo especial ---
special_names = {
    "AMODEO JUAN JOSÉ",
    "ERREGUERENA NICOLÁS",
    "MONTANARI EDUARDO",
    "PORTELA JUAN"
}

def parse_monto(value):
    if pd.isna(value):
        return None
    if isinstance(value, (int, float)):
        return float(value)
    val_str = str(value).strip()
    if '=' in val_str:
        try:
            return float(val_str.split('=')[-1])
        except:
            return None
    try:
        return float(val_str)
    except:
        return None

df = pd.read_excel(file_path, sheet_name="2025", engine="openpyxl")
anio = 2025

for idx, row in df.iterrows():
    if idx in skip_rows:
        continue

    nombre = str(row.iloc[0]).strip() if not pd.isna(row.iloc[0]) else None
    if not nombre:
        continue

    monto_base = parse_monto(row.iloc[1]) or 0.0
    detalles = str(row.iloc[2]).strip() if not pd.isna(row.iloc[2]) else None

    # --- Insertar empleado ---
    if nombre in special_names:
        activo = False
    else:
        activo = True

    cursor.execute(
        "INSERT INTO empleado (nombre, monto_base, detalles, activo) VALUES (%s, %s, %s, %s)",
        (nombre, monto_base, detalles, activo)
    )
    empleado_id = cursor.lastrowid

    if nombre in special_names:
        # Para los especiales: solo si hay valor en la celda
        col_to_mes = {2:1, 3:2, 4:3, 5:4, 6:5, 7:6, 9:7, 11:8, 13:9, 14:10, 15:11, 16:12}
        for col, mes in col_to_mes.items():
            monto_mes = parse_monto(row.iloc[col])
            if monto_mes is not None:
                pagado = True if mes <= 8 else False
                cursor.execute(
                    "INSERT INTO sueldo (empleado_id, anio, mes, monto_mes, pagado) VALUES (%s, %s, %s, %s, %s)",
                    (empleado_id, anio, mes, monto_mes, pagado)
                )
    else:
        # --- Meses 1 a 7: solo insertar si hay valor
        col_to_mes = {2:1, 3:2, 4:3, 5:4, 6:5, 7:6, 9:7}
        for col, mes in col_to_mes.items():
            monto_mes = parse_monto(row.iloc[col])
            if monto_mes is not None:
                cursor.execute(
                    "INSERT INTO sueldo (empleado_id, anio, mes, monto_mes, pagado) VALUES (%s, %s, %s, %s, %s)",
                    (empleado_id, anio, mes, monto_mes, True)
                )

        # --- Mes 8 ---
        col = 11
        mes = 8
        monto_mes = parse_monto(row.iloc[col])
        if monto_mes is not None:
            pagado = True
        else:
            monto_mes = monto_base
            pagado = False
        cursor.execute(
            "INSERT INTO sueldo (empleado_id, anio, mes, monto_mes, pagado) VALUES (%s, %s, %s, %s, %s)",
            (empleado_id, anio, mes, monto_mes, pagado)
        )

        # --- Meses 9 a 12 ---
        for col in range(13, 17):
            mes = col - 4
            monto_mes = parse_monto(row.iloc[col])
            if monto_mes is None:
                monto_mes = monto_base
            cursor.execute(
                "INSERT INTO sueldo (empleado_id, anio, mes, monto_mes, pagado) VALUES (%s, %s, %s, %s, %s)",
                (empleado_id, anio, mes, monto_mes, False)
            )

conn.commit()
cursor.close()
conn.close()

print("\n🎉 Carga de sueldos finalizada con éxito")
