import sys
sys.path.insert(0, r"C:\Users\user\AppData\Roaming\Python\Python314\site-packages")
import os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
import runpy
runpy.run_path("server-dev.py", run_name="__main__")
