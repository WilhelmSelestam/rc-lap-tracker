import serial
import os
import time
import sys
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY')
PORT_NAME = 'COM4'
BAUD_RATE = 9600


try:
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    print("Supabase client initialized.")
        
except Exception as e:
    print(f"ERROR: Could not initialize Supabase client: {e}")
    sys.exit(1)



ser = None
try:
    ser = serial.Serial(
        port=PORT_NAME,
        baudrate=BAUD_RATE,
        parity=serial.PARITY_NONE,
        stopbits=serial.STOPBITS_ONE,
        bytesize=serial.EIGHTBITS,
        timeout=1
    )
    print(f"[*] Lyssnar på port {PORT_NAME} med hastighet {BAUD_RATE}...")

    while True:
        if ser.in_waiting > 0:
            line = ser.readline()

            decoded_line = line.decode('utf-8', errors='ignore').strip().split(';')

            print(decoded_line)
            
            # with open("output.txt", "a") as f:
            #     f.write(f"{decoded_line}\n")
            if len(decoded_line) < 6:
                continue

            # for item in decoded_line:
            #     print(f"Item: {item}")

            # racer_name = decoded_line[1]
            # lap_number = int(decoded_line[2])
            # lap_time_str = decoded_line[3]
            # best_lap_time_str = decoded_line[5]

            # lap_time_ms = lap_time_str.split(',')
            # lap_time_ms = int(lap_time_ms[0]) * 1000 + int(lap_time_ms[1])

            # print(f"lap time ms: {lap_time_ms} ")

            # lap_payload = {
            #     'racer_name': racer_name,
            #     'lap_number': lap_number,
            #     'lap_time_ms': lap_time_ms,
            # }

            # print(f" LAPI> Sending Lap {lap_number} for {racer_name} ({lap_time_str})... ", end="")
            
            # response = supabase.table('laps').insert(lap_payload).execute()

            # if response.data:
            #     print("Sent!")
            # else:
            #     print(f"FAILED! Error: {response.error}")

        time.sleep(0.01)

except serial.SerialException as e:
    print(f"[FEL] Kunde inte öppna porten {PORT_NAME}. Kontrollera att porten existerar och inte används av ett annat program.")
    print(f"Felmeddelande: {e}")
except KeyboardInterrupt:
    print("\n[*] Programmet avslutades av användaren.")
finally:
    if ser and ser.is_open:
        ser.close()
        print(f"[*] Porten {PORT_NAME} har stängts.")