from datetime import datetime, timedelta, timezone
import json
import serial
import os
import time
import sys
import re
import requests
from supabase import create_client, Client
from dotenv import load_dotenv
import jwt

load_dotenv()

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_API_KEY = os.environ.get("SCRIPT_SECRET_KEY")

headers = {
    "X-Custom-Auth": f"Bearer {SUPABASE_API_KEY}",
    "Content-Type": "application/json"
}

SEND_INTERVAL = 2 # Seconds


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
    lap_data_matches = re.findall(r'\$LAP(.*?)\#', line)

    if not lap_data_matches:
        return

    for match in lap_data_matches:
        try:
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

            print(f" LAPI> Buffering Lap {lap_number} for {racer_name} ({lap_time_str}).")
            data_buffer.append(lap_payload)

        except (ValueError, IndexError) as e:
            print(f"\nWARNING: Could not parse segment: '$LAP{match}#'. Error: {e}")
        except Exception as e:
            print(f"\nERROR: An unexpected error occurred: {e}")


try:
    lap_data_buffer = []
    last_send_time = time.time()

    try:
        decoded_line = "$LAP;1;1;1;RacerOne;R1;1:23.456;+0.000;+0.000#"
        if decoded_line:
            process_lap_data(decoded_line, lap_data_buffer)
    except Exception as e:
        print(f"Error processing line: {e}")

    if lap_data_buffer:
        print(f"\nSending {len(lap_data_buffer)} records...")
        try:
            data_to_send = {"laps": lap_data_buffer}
            response = requests.post(f"{SUPABASE_URL}/functions/v1/insert-laptimesdata", headers=headers, data=json.dumps(data_to_send))

            if response.ok:
                print("Success! Response:", response.text)
            else:
                print("Error:", response.status_code, response.text)

        except requests.exceptions.RequestException as e:
            print(f"HTTP Request failed: {e}")
        except Exception as e:
            print(f"An error occurred during send: {e}")


    time.sleep(0.01)

except KeyboardInterrupt:
    print("\n[*] Programmet avslutades av användaren.")