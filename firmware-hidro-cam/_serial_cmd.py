import sys
sys.path.insert(0, r"C:\Users\user\AppData\Roaming\Python\Python314\site-packages")
import serial
import time

cmd = sys.argv[1]
port = sys.argv[2]
baud = int(sys.argv[3])

s = serial.Serial()
s.port = port
s.baudrate = baud
s.timeout = 2
s.dtr = False
s.rts = False
s.open()
time.sleep(0.3)
s.write((cmd + "\n").encode())
time.sleep(0.3)
r = s.readline().decode().strip()
print(r)
s.close()
