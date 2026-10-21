import sys
import os

# Add backend_api and dyslexia root to sys.path
backend_api_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
root_dir = os.path.dirname(backend_api_dir)

if backend_api_dir not in sys.path:
    sys.path.insert(0, backend_api_dir)
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)
