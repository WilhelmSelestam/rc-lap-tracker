import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from the .env file
load_dotenv()

supa_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
supa_key = os.environ.get("SCRIPT_SECRET_KEY")

# Ensure credentials are provided
if not supa_url or not supa_key:
    raise ValueError("Supabase URL and Key must be set in the environment variables.")

# Initialize the Supabase client
try:
    supabase: Client = create_client(supa_url, supa_key)
    print("Successfully connected to Supabase!")
except Exception as e:
    print(f"Error connecting to Supabase: {e}")
    exit()

# --- Data Insertion ---

# Replace 'profiles' with the name of your table
table_name = "laptimes"

# Define the data to insert. The keys must match your table's column names.
lap_data = {
    "car_id": "1",
    "lap_time_ms": "2000",
}

# To insert multiple rows at once, use a list of dictionaries
# user_data = [
#     {"username": "ada_lovelace", "email": "ada@example.com"},
#     {"username": "alan_turing", "email": "alan@example.com"},
# ]

try:
    # The insert() method takes the data and the execute() method sends it.
    data, count = supabase.table(table_name).insert(lap_data).execute()
    
    # The response is a tuple (data, count)
    print(f"Successfully inserted data.")
    print(f"-> Response Data: {data}")

except Exception as e:
    print(f"An error occurred during insertion: {e}")