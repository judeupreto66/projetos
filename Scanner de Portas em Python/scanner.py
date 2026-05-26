import socket
from concurrent.futures import ThreadPoolExecutor

target = input("Digite o IP ou site: ")

print(f"\nEscaneando {target}...\n")

open_ports = []

def scan_port(port):
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)

        result = sock.connect_ex((target, port))

        if result == 0:
            print(f"[+] Porta {port} ABERTA")
            open_ports.append(port)

        sock.close()

    except:
        pass


with ThreadPoolExecutor(max_workers=100) as executor:
    executor.map(scan_port, range(1, 1025))


print("\nEscaneamento finalizado.")

if open_ports:
    print("\nPortas abertas:")
    for port in open_ports:
        print(f"- {port}")
else:
    print("Nenhuma porta aberta encontrada.")