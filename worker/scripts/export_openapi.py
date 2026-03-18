import json
import sys
from pathlib import Path

# Add the parent directory to sys.path so we can import 'main'
sys.path.append(str(Path(__file__).resolve().parent.parent))

from main import app


def export_openapi():
    openapi_schema = app.openapi()

    # Fix UploadFile binary format for Orval compatibility
    schemas = openapi_schema.get('components', {}).get('schemas', {})
    for schema in schemas.values():
        for prop in schema.get('properties', {}).values():
            if prop.get('contentMediaType'):
                prop.pop('contentMediaType')
                prop['format'] = 'binary'

    # Ensure the directory exists
    output_dir = Path(__file__).resolve().parent.parent.parent / 'server' / 'generated'
    output_dir.mkdir(parents=True, exist_ok=True)

    output_path = output_dir / 'worker-openapi.json'

    with output_path.open('w') as f:
        json.dump(openapi_schema, f, indent=2)

    print(f'Exported OpenAPI schema to {output_path}')


if __name__ == '__main__':
    export_openapi()
