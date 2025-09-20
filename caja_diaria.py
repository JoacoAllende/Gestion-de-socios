import pandas as pd
import mysql.connector
from datetime import datetime

# --- Configuración ---
file_path = r"C:\Users\joaco\Downloads\Caja 2025.xlsx"

conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="allende247855",
    database="gestion_socios"
)
cursor = conn.cursor()

# --- Reiniciar tabla ---
cursor.execute("DROP TABLE IF EXISTS caja_diaria")
cursor.execute("""
CREATE TABLE caja_diaria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha DATE NOT NULL,
    tipo ENUM('INGRESO', 'EGRESO') NOT NULL,
    concepto VARCHAR(255) NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    medio_pago ENUM('EFECTIVO', 'TRANSFERENCIA') NOT NULL DEFAULT 'EFECTIVO',
    saldo DECIMAL(10,2) NOT NULL
)
""")
print("✅ Tabla caja_diaria recreada")

# --- Tabs a procesar ---
tabs = ["Ene-25", "Feb-25", "Mar-25", "Abr-25", "May-25", "Jun-25", "Jul -25", "Agos -25", "Sep -25"]

# --- Procesar cada hoja ---
for tab in tabs:
    print(f"\n📄 Procesando hoja: {tab}")
    df = pd.read_excel(file_path, sheet_name=tab, engine="openpyxl")

    for idx, row_data in df.iterrows():
        if idx < 2:  # saltar filas 0 y 1 (títulos y saldo anterior)
            continue

        fecha_raw = str(row_data.iloc[0]).strip() if not pd.isna(row_data.iloc[0]) else None

        if not fecha_raw:
            print(f"⏹️ Fin de datos en hoja {tab}, fila {idx+1}")
            break

        concepto = str(row_data.iloc[1]).strip() if not pd.isna(row_data.iloc[1]) else None
        ingreso_efectivo = float(row_data.iloc[3]) if not pd.isna(row_data.iloc[3]) else 0.0
        transferencia = float(row_data.iloc[4]) if not pd.isna(row_data.iloc[4]) else 0.0
        egreso_efectivo = float(row_data.iloc[5]) if not pd.isna(row_data.iloc[5]) else 0.0
        saldo_excel = float(row_data.iloc[6]) if not pd.isna(row_data.iloc[6]) else 0.0

        try:
            fecha = pd.to_datetime(fecha_raw, dayfirst=True, errors="coerce").date()
        except Exception:
            print(f"⚠️ Fecha inválida en hoja {tab}, fila {idx+1}: {fecha_raw}")
            continue

        if not concepto:
            continue

        # --- Ingreso efectivo ---
        if ingreso_efectivo > 0:
            cursor.execute(
                "INSERT INTO caja_diaria (fecha, tipo, concepto, monto, medio_pago, saldo) VALUES (%s, %s, %s, %s, %s, %s)",
                (fecha, "INGRESO", concepto, ingreso_efectivo, "EFECTIVO", saldo_excel)
            )

        # --- Transferencia (puede ser ingreso o egreso según el signo) ---
        if transferencia != 0:
            if transferencia > 0:
                cursor.execute(
                    "INSERT INTO caja_diaria (fecha, tipo, concepto, monto, medio_pago, saldo) VALUES (%s, %s, %s, %s, %s, %s)",
                    (fecha, "INGRESO", concepto, transferencia, "TRANSFERENCIA", saldo_excel)
                )
            else:
                cursor.execute(
                    "INSERT INTO caja_diaria (fecha, tipo, concepto, monto, medio_pago, saldo) VALUES (%s, %s, %s, %s, %s, %s)",
                    (fecha, "EGRESO", concepto, abs(transferencia), "TRANSFERENCIA", saldo_excel)
                )

        # --- Egreso efectivo ---
        if egreso_efectivo > 0:
            cursor.execute(
                "INSERT INTO caja_diaria (fecha, tipo, concepto, monto, medio_pago, saldo) VALUES (%s, %s, %s, %s, %s, %s)",
                (fecha, "EGRESO", concepto, egreso_efectivo, "EFECTIVO", saldo_excel)
            )

conn.commit()
cursor.close()
conn.close()

print("\n🎉 Carga de caja finalizada con éxito")
