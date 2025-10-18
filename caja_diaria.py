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

# --- Desabilitar chequeo de clave foránea temporalmente ---
cursor.execute("SET FOREIGN_KEY_CHECKS = 0")

# --- Limpiar registros del 1 al 1118 ---
cursor.execute("DELETE FROM caja_diaria WHERE id <= 1118")
conn.commit()
print("✅ Registros 1-1118 eliminados")

# --- Tabs a procesar ---
tabs = ["Ene-25", "Feb-25", "Mar-25", "Abr-25", "May-25", "Jun-25", "Jul -25", "Agos -25", "Sep -25"]

current_id = 1
registros_insertados = 0

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
            # Si es timestamp de Excel, convertir directamente
            if isinstance(row_data.iloc[0], pd.Timestamp):
                fecha = row_data.iloc[0].date()
            else:
                # Intentar diferentes formatos
                fecha = None
                formatos = ['%d/%m/%Y', '%d/%b', '%d/%B']
                
                for fmt in formatos:
                    try:
                        fecha_parsed = pd.to_datetime(fecha_raw, format=fmt, errors="coerce")
                        if fecha_parsed != pd.NaT:
                            # Si no tiene año (formatos %d/%b o %d/%B), agregar 2025
                            if fecha_parsed.year == 1900:
                                fecha_parsed = fecha_parsed.replace(year=2025)
                            fecha = fecha_parsed.date()
                            break
                    except:
                        continue
                
                if fecha is None:
                    raise ValueError(f"No se pudo parsear: {fecha_raw}")
                    
        except Exception as e:
            print(f"⚠️ Error al parsear fecha en hoja {tab}, fila {idx+1}: {fecha_raw} - {str(e)}")
            continue

        # Validar que la fecha sea razonable (debe ser 2025)
        if not fecha or fecha.year != 2025:
            print(f"⚠️ Fecha inválida en hoja {tab}, fila {idx+1}: {fecha_raw} -> {fecha}")
            continue

        if not concepto:
            continue

        # --- Ingreso efectivo ---
        if ingreso_efectivo > 0:
            cursor.execute(
                "INSERT INTO caja_diaria (id, fecha, tipo, concepto, monto, medio_pago, saldo) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                (current_id, fecha, "INGRESO", concepto, ingreso_efectivo, "EFECTIVO", saldo_excel)
            )
            current_id += 1
            registros_insertados += 1

        # --- Transferencia (puede ser ingreso o egreso según el signo) ---
        if transferencia != 0:
            if transferencia > 0:
                cursor.execute(
                    "INSERT INTO caja_diaria (id, fecha, tipo, concepto, monto, medio_pago, saldo) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                    (current_id, fecha, "INGRESO", concepto, transferencia, "TRANSFERENCIA", saldo_excel)
                )
            else:
                cursor.execute(
                    "INSERT INTO caja_diaria (id, fecha, tipo, concepto, monto, medio_pago, saldo) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                    (current_id, fecha, "EGRESO", concepto, abs(transferencia), "TRANSFERENCIA", saldo_excel)
                )
            current_id += 1
            registros_insertados += 1

        # --- Egreso efectivo ---
        if egreso_efectivo > 0:
            cursor.execute(
                "INSERT INTO caja_diaria (id, fecha, tipo, concepto, monto, medio_pago, saldo) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                (current_id, fecha, "EGRESO", concepto, egreso_efectivo, "EFECTIVO", saldo_excel)
            )
            current_id += 1
            registros_insertados += 1

conn.commit()

# --- Actualizar AUTO_INCREMENT al siguiente ID disponible ---
cursor.execute(f"ALTER TABLE caja_diaria AUTO_INCREMENT = {current_id}")
conn.commit()

# --- Reabilitar chequeo de clave foránea ---
cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
conn.commit()

cursor.close()
conn.close()

print(f"\n🎉 Carga finalizada con éxito")
print(f"   ✅ Registros insertados: {registros_insertados}")
print(f"   ✅ Próximo ID disponible: {current_id}")
print(f"   ✅ Registros después del 1118 NO fueron modificados")