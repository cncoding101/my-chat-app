import json
import sys
from pathlib import Path

# Add the parent directory to sys.path so we can import 'main'
sys.path.append(str(Path(__file__).resolve().parent.parent))

from main import app


def export_openapi():
    openapi_schema = app.openapi()

    # Ensure the directory exists
    output_dir = Path(__file__).resolve().parent.parent.parent / "app" / "generated"
    output_dir.mkdir(parents=True, exist_ok=True)

    output_path = output_dir / "worker-openapi.json"

    with output_path.open("w") as f:
        json.dump(openapi_schema, f, indent=2)

    print(f"Exported OpenAPI schema to {output_path}")

if __name__ == "__main__":
    export_openapi()

