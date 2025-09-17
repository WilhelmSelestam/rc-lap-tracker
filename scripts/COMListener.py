import serial
import time

# --- INSTÄLLNINGAR ---
# Dessa måste matcha inställningarna för enheten du ansluter till!
PORT_NAME = 'COM4'
BAUD_RATE = 9600  # Ändra till din enhets hastighet (t.ex. 115200)
# ---------------------

ser = None  # Definiera variabeln utanför try-blocket

try:
    # Konfigurera och öppna anslutningen till COM-porten
    # timeout=1 gör att ser.readline() väntar i max 1 sekund på data.
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
        # Kontrollera om det finns data i in-bufferten
        if ser.in_waiting > 0:
            # Läs en hel rad (avslutas med ett nyradstecken \n)
            line = ser.readline()

            # Data tas emot som bytes, så vi måste avkoda den till en sträng.
            # 'errors="ignore"' förhindrar krasch om en ogiltig byte tas emot.
            decoded_line = line.decode('utf-8', errors='ignore').strip()

            print(f"{decoded_line}")
            
            with open("output.txt", "a") as f:
                f.write(f"{decoded_line}\n")

        # Pausa en kort stund för att inte överbelasta CPU:n
        time.sleep(0.01)

except serial.SerialException as e:
    print(f"[FEL] Kunde inte öppna porten {PORT_NAME}. Kontrollera att porten existerar och inte används av ett annat program.")
    print(f"Felmeddelande: {e}")
except KeyboardInterrupt:
    print("\n[*] Programmet avslutades av användaren.")
finally:
    # Detta är mycket viktigt! Stäng alltid porten när du är klar.
    if ser and ser.is_open:
        ser.close()
        print(f"[*] Porten {PORT_NAME} har stängts.")