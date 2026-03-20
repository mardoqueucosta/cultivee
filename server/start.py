#!/usr/bin/env python3
import sys
import subprocess
# Install flask to system site-packages if missing
try:
    import flask
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "--user", "flask", "python-dotenv"])

sys.path.insert(0, r"C:\Users\user\AppData\Roaming\Python\Python314\site-packages")

import importlib
import runpy
runpy.run_path("app.py", run_name="__main__")
