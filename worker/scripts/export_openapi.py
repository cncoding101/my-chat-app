import json
import os
import sys

# Add the parent directory to sys.path so we can import 'main'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app

def export_openapi():
    openapi_schema = app.openapi()
    
    # Ensure the directory exists
    output_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "app", "generated")
    os.makedirs(output_dir, exist_ok=True)
    
    output_path = os.path.join(output_dir, "worker-openapi.json")
    
    with open(output_path, "w") as f:
        json.dump(openapi_schema, f, indent=2)
    
    print(f"Exported OpenAPI schema to {output_path}")

if __name__ == "__main__":
    export_openapi()

