import pandas as pd
import mysql.connector
import math

# Leer Excel
file_path = r"C:\Users\joaco\Downloads\Socios 2025.xlsx"

# Conectar a MySQL
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="allende247855",
    database="gestion_socios"
)
cursor = conn.cursor()

# --- Diccionarios de mapeo ---
map_futbol = {
    "Fútbol 01ra. División": 1,
    "Fútbol (Reserva)": 2,
    "Fútbol 05ta. (2008/2009)": 3,
    "Fútbol 06ta. (2010)": 4,
    "Fútbol 07ma. (2011)": 5,
    "Fútbol 08va. (2012)": 6,
    "Fútbol 09na. (2013)": 7,
    "Fútbol 10ma. (2014)": 8,
    "Fútbol 11ma. (2015)": 9,
    "Fútbol Escuelita": 10,
    "Femenino 1° División": 11,
    "Femenino Sub 16 (2008/2009)": 12,
    "Femenino Sub 14 (2010/2011)": 13,
    "Femenino Sub 12 (2012/2013)": 14,
    "Femenino Sub 10 (2014/2015)": 15,
    "Femenino Sub 08 (2016)": 16,
    "Femenino escuelita": 17,
}

map_basquet = {
    "Básquetbol masculino": 1,
    "Básquetbol femenino": 2,
    "Básquetbol femenino adultos": 3,
}

map_paleta = {
    "Paleta (masculino)": 1,
    "Paleta (femenina)": 2,
}

# --- Insert Socios totales ---
df = pd.read_excel(file_path, sheet_name="Socios totales")

for idx, row in df.iterrows():
    nro_socio_raw = row[0]
    nombre = str(row[1]).strip()
    cuota_activa = True if str(row[2]).strip().upper() == "X" else False

    # Ignorar filas inválidas
    if nro_socio_raw == "-" or nro_socio_raw is None or (isinstance(nro_socio_raw, float) and math.isnan(nro_socio_raw)):
        print(f"⚠️ Fila {idx+1} ignorada: nro_socio inválido -> {nro_socio_raw}")
        continue

    nro_socio = int(nro_socio_raw)

    # Columna 10 -> índice 9
    ficha_val = str(row[9]).strip() if not pd.isna(row[9]) else ""
    if ficha_val == "Alejandra":
        ficha_socio_id = 1
    elif ficha_val == "Débito":
        ficha_socio_id = 2
    elif ficha_val == "Secretaría":
        ficha_socio_id = 3
    else:
        ficha_socio_id = None

    # Columna 8 -> índice 7
    col8_val = str(row[7]).strip().upper() if not pd.isna(row[7]) else ""

    # Inicializamos los flags
    descuento_familiar = False
    becado = False
    cuota_pasiva = False
    cuota_activa_flag = cuota_activa  # lo que venía del "X" en la columna 3

    # Revisamos los posibles valores
    if col8_val == "DTO. FAMILIAR":
        descuento_familiar = True
    elif col8_val == "BECA":
        becado = True
        cuota_activa_flag = False
    elif col8_val == "SOCIO PASIVO":
        cuota_pasiva = True
        cuota_activa_flag = False


    # Insert en socio
    sql_socio = """
    INSERT IGNORE INTO socio (nro_socio, nombre, cuota_activa, cuota_pasiva, becado, ficha_socio_id, descuento_familiar)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """
    cursor.execute(sql_socio, (
        nro_socio,
        nombre,
        cuota_activa_flag,
        cuota_pasiva,
        becado,
        ficha_socio_id,
        descuento_familiar
    ))

    print(f"✅ Insert socio: nro_socio={nro_socio}, nombre='{nombre}', cuota_activa={cuota_activa}, ficha_socio_id={ficha_socio_id}, descuento_familiar={descuento_familiar}")

    # Insert en socio_actividad según columnas 4, 5, 6
    if str(row[3]).strip().upper() == "X":
        cursor.execute("INSERT IGNORE INTO socio_actividad (socio_id, actividad_id) VALUES (%s, %s)", (nro_socio, 1))
    if str(row[4]).strip().upper() == "X":
        cursor.execute("INSERT IGNORE INTO socio_actividad (socio_id, actividad_id) VALUES (%s, %s)", (nro_socio, 3))
    if str(row[5]).strip().upper() == "X":
        cursor.execute("INSERT IGNORE INTO socio_actividad (socio_id, actividad_id) VALUES (%s, %s)", (nro_socio, 2))

# --- Update desde varios tabs ---
tabs = ["Socios", "Fútbol masculino", "Fútbol femenino", "Básquet", "Paleta"]

for tab in tabs:
    print(f"\n📄 Procesando hoja: {tab}")
    df_update = pd.read_excel(file_path, sheet_name=tab)

    for idx, row in df_update.iterrows():
        nro_socio_raw = row.iloc[0]
        direccion = str(row.iloc[2]).strip() if not pd.isna(row.iloc[2]) else None
        fecha_raw = str(row.iloc[3]).strip() if not pd.isna(row.iloc[3]) else None
        dni_raw = str(row.iloc[4]).strip() if not pd.isna(row.iloc[4]) else None
        categoria_val = str(row.iloc[5]).strip() if not pd.isna(row.iloc[5]) else None  # columna 6

        if nro_socio_raw == "-" or nro_socio_raw is None or (isinstance(nro_socio_raw, float) and math.isnan(nro_socio_raw)):
            continue
        try:
            nro_socio = int(nro_socio_raw)
        except ValueError:
            continue

        fecha_nacimiento = None
        if fecha_raw and "/" in fecha_raw:
            fecha_nacimiento = pd.to_datetime(fecha_raw, dayfirst=True).date()

        dni = None
        if dni_raw:
            dni_clean = dni_raw.replace(".", "").replace(",", "").strip()
            if dni_clean.isdigit():
                dni = dni_clean

        if dni:
            cursor.execute("SELECT nro_socio FROM socio WHERE dni = %s AND nro_socio != %s", (dni, nro_socio))
            existing = cursor.fetchone()
            if existing:
                dni = None

        # Determinar IDs de categoría según el tab
        categoria_futbol_id = None
        categoria_basquet_id = None
        categoria_paleta_id = None

        if tab in ["Fútbol masculino", "Fútbol femenino"]:
            categoria_futbol_id = map_futbol.get(categoria_val)
        elif tab == "Básquet":
            categoria_basquet_id = map_basquet.get(categoria_val)
        elif tab == "Paleta":
            categoria_paleta_id = map_paleta.get(categoria_val)

        sql_update = """
            UPDATE socio
            SET direccion = %s,
                fecha_nacimiento = %s,
                dni = COALESCE(%s, dni),
                categoria_futbol_id = %s,
                categoria_basquet_id = %s,
                categoria_paleta_id = %s
            WHERE nro_socio = %s
        """
        cursor.execute(sql_update, (
            direccion,
            fecha_nacimiento,
            dni,
            categoria_futbol_id,
            categoria_basquet_id,
            categoria_paleta_id,
            nro_socio
        ))

# --- Insert desde tab BAJAS ---
print("\n📄 Procesando hoja: BAJAS")
df_bajas = pd.read_excel(file_path, sheet_name="BAJAS")

for idx, row in df_bajas.iterrows():
    nro_socio_raw = row.iloc[0]
    nombre = str(row.iloc[1]).strip()
    direccion = str(row.iloc[2]).strip() if not pd.isna(row.iloc[2]) else None
    fecha_raw = str(row.iloc[3]).strip() if not pd.isna(row.iloc[3]) else None
    dni_raw = str(row.iloc[4]).strip() if not pd.isna(row.iloc[4]) else None
    ficha_val = str(row.iloc[7]).strip() if not pd.isna(row.iloc[7]) else ""

    if nro_socio_raw == "-" or nro_socio_raw is None or (isinstance(nro_socio_raw, float) and math.isnan(nro_socio_raw)):
        continue
    try:
        nro_socio = int(nro_socio_raw)
    except ValueError:
        continue

    if ficha_val == "Alejandra":
        ficha_socio_id = 1
    elif ficha_val == "Secretaría":
        ficha_socio_id = 3
    else:
        ficha_socio_id = None

    fecha_nacimiento = None
    if fecha_raw and "/" in fecha_raw:
        fecha_nacimiento = pd.to_datetime(fecha_raw, dayfirst=True).date()

    dni = None
    if dni_raw:
        dni_clean = dni_raw.replace(".", "").replace(",", "").strip()
        if dni_clean.isdigit():
            dni = dni_clean

    sql_bajas = """
        INSERT IGNORE INTO socio (nro_socio, nombre, direccion, fecha_nacimiento, dni, ficha_socio_id, activo)
        VALUES (%s, %s, %s, %s, %s, %s, false)
    """
    cursor.execute(sql_bajas, (nro_socio, nombre, direccion, fecha_nacimiento, dni, ficha_socio_id))
    print(f"✅ Insert baja: nro_socio={nro_socio}, nombre={nombre}, ficha_socio_id={ficha_socio_id}")

conn.commit()
cursor.close()
conn.close()

print("\n🎉 Todo finalizado con éxito")
