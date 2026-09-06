import sys
import os

# Insert backend path to sys.path so app and main modules can be imported
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Import the FastAPI instance
from main import app
