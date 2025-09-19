import json
import serial
import os
import time
import sys
import re
import requests
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
# SUPABASE_SERVICE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY')

FUNCTION_URL = f"{SUPABASE_URL}/functions/v1/insert-laptimesdata"
SECRET_KEY = os.environ.get("SCRIPT_SECRET_KEY")

headers = {
    "Authorization": f"Bearer {SECRET_KEY}",
    "Content-Type": "application/json"
}

PORT_NAME = 'COM4'
BAUD_RATE = 9600


try:
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    print("Supabase client initialized.")
        
except Exception as e:
    print(f"ERROR: Could not initialize Supabase client: {e}")
    sys.exit(1)

def parse_time_to_ms(time_str: str) -> int:
    if not time_str:
        return 0
    
    time_str_corrected = time_str.replace(',', '.')
    
    try:
        parts = time_str_corrected.split(':')
        if len(parts) == 2:  # Format is M:SS.mmm
            minutes = int(parts[0])
            seconds_part = float(parts[1])
            total_seconds = (minutes * 60) + seconds_part
        elif len(parts) == 1: # Format is SS.mmm
            total_seconds = float(parts[0])
        else:
            return 0
        return int(total_seconds * 1000)
    except (ValueError, IndexError):
        print(f"WARNING: Could not parse time string: '{time_str}'")
        return 0

def process_lap_data(line: str, supabase: Client):
    # Use regex to find all lap data strings in the line.
    # The pattern '$LAP(.*?)\#' finds everything between '$LAP' and the next '#'.
    lap_data_matches = re.findall(r'\$LAP(.*?)\#', line)

    if not lap_data_matches:
        # No lap data found in this line, so we can ignore it.
        return

    for match in lap_data_matches:
        try:
            # The format seems to be ';'-separated data after $LAP
            # e.g., $LAP;1;1;01;Wilhelm;;09,862;;#
            # Splitting ';data1;data2' will result in ['', 'data1', 'data2']
            parts = match.split(';')

            if len(parts) < 9:
                print(f"\nWARNING: Malformed lap data ignored: '$LAP{match}#'")
                continue
            
            driver_number = parts[1]
            position = parts[2]
            lap_number = int(parts[3])
            racer_name = parts[4]
            racer_nick = parts[5]
            lap_time_str = parts[6]
            gap = parts[7]
            interval = parts[8]

            if not racer_name or not lap_time_str:
                # If essential data is missing, skip this record.
                continue

            lap_time_ms = parse_time_to_ms(lap_time_str)

            lap_payload = {
                'driver_number': driver_number,
                'position': position,
                'racer_name': racer_name,
                #'racer_nick': racer_nick,
                'lap_number': lap_number,
                'lap_time_ms': lap_time_ms,
                'gap': gap,
                'interval': interval,
            }

            print(f" LAPI> Sending Lap {lap_number} for {racer_name} ({lap_time_str})... ", end="")
            
            # response = supabase.table('laptimes').insert(lap_payload).execute()

            # if response.data:
            #     print("Sent!")
            # else:
            #     print(f"FAILED! Error: {response.error}")

            data_to_insert = {
                "record": { "column1": "data from my remote script", "column2": 999 }
            }

            if delta_time > 2000:
                print(f"Sending data to: {FUNCTION_URL}")
                response = requests.post(FUNCTION_URL, headers=headers, data=json.dumps(data_to_insert))
                delta_time = 0
            else:
                data_to_insert["record"] = lap_payload
                continue

            if response.ok:
                print("Success! Response:", response.json())
            else:
                print("Error:", response.status_code, response.text)

        except (ValueError, IndexError) as e:
            print(f"\nWARNING: Could not parse segment: '$LAP{match}#'. Error: {e}")
        except Exception as e:
            print(f"\nERROR: An unexpected error occurred: {e}")



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

            process_lap_data(line, supabase)

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