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

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_API_KEY = os.environ.get("SCRIPT_SECRET_KEY")

PORT_NAME = 'COM4'
BAUD_RATE = 9600
SEND_INTERVAL = 0.1


try:
    supabase = create_client(SUPABASE_URL, SUPABASE_API_KEY)
    print("Supabase client initialization skipped.")
        
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

def process_lap_data(line: str, data_buffer: list):
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
                'car_id': driver_number,
                # 'position': position,
                # 'racer_name': racer_name,
                #'racer_nick': racer_nick,
                # 'lap_number': lap_number,
                'lap_time_ms': lap_time_ms,
                # 'gap': gap,
                # 'interval': interval,
            }

            print(f" LAPI> Buffering Lap {lap_number} for {racer_name} ({lap_time_str}).")
            data_buffer.append(lap_payload)

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

    lap_data_buffer = []
    last_send_time = time.time()
    
    table_name = "laptimes"
    

    while True:
        current_time = time.time()
        if ser.in_waiting > 0:
            line = ser.readline()
            try:
                decoded_line = line.decode('utf-8', errors='ignore').strip()
                if decoded_line:
                    # print(f"Read line: {decoded_line}")
                    process_lap_data(decoded_line, lap_data_buffer)
            except Exception as e:
                print(f"Error processing line: {e}")

        # Check if it's time to send the buffered data
        if current_time - last_send_time >= SEND_INTERVAL and lap_data_buffer:
            print(f"\nSending {len(lap_data_buffer)} records...")
            try:
                # Assuming your function expects a payload like: { "records": [...] }
                # data_to_send = {"laps": lap_data_buffer}
                # response = requests.post(FUNCTION_URL, headers=headers, data=json.dumps(data_to_send))
                
                data, count = supabase.table(table_name).insert(lap_data_buffer).execute()

                # if response.ok:
                #     print("Success! Response:", response.text)
                # else:
                #     print("Error:", response.status_code, response.text)
                
                lap_data_buffer.clear() # Clear buffer after sending
                last_send_time = current_time # Reset timer

            except requests.exceptions.RequestException as e:
                print(f"HTTP Request failed: {e}")
            except Exception as e:
                print(f"An error occurred during send: {e}")


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