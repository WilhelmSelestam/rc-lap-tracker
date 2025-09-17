import socket

# Värdnamn/IP-adress att lyssna på.
# '127.0.0.1' (eller 'localhost') betyder att programmet bara kan nås från din egen dator.
# Använd '0.0.0.0' för att lyssna på alla nätverksgränssnitt (t.ex. Wi-Fi, Ethernet).
HOST = '0.0.0.0'

# Portnumret som ditt andra program skickar data till.
PORT = 5000

print(f"[*] Startar server och lyssnar på {HOST}:{PORT}...")

# Skapa ett 'with'-block för att säkerställa att anslutningen alltid stängs korrekt.
# AF_INET specificerar att vi använder IPv4.
# SOCK_STREAM specificerar att det är en TCP-anslutning.
with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    # Binda socketen till den angivna adressen och porten.
    s.bind((HOST, PORT))

    # Sätt socketen i lyssningsläge, redo att acceptera en anslutning.
    s.listen()

    # Vänta på att en klient ansluter. programmet pausas här tills något händer.
    # 'conn' är det nya socket-objektet för kommunikation med klienten.
    # 'addr' är adressinformationen för klienten som anslöt.
    conn, addr = s.accept()

    with conn:
        print(f"[*] En anslutning har upprättats från {addr}")
        # Skapa en oändlig loop för att kontinuerligt ta emot data.
        while True:
            # Ta emot data från klienten. 1024 är buffertstorleken (hur mycket data som läses åt gången).
            data = conn.recv(1024)

            # Om recv() returnerar en tom byte-sträng betyder det att klienten har stängt anslutningen.
            if not data:
                break

            # Data tas emot som "bytes". Vi måste avkoda det till en läsbar sträng.
            # 'utf-8' är den vanligaste teckenkodningen.
            # Skriv ut den mottagna datan i terminalen.
            print(f"Mottagen data: {data.decode('utf-8')}")

print("[*] Klienten stängde anslutningen. Servern avslutas.")