import subprocess
import time
import urllib.request
import os
import sys

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

print("--- Testing Static Web Server and Asset Delivery ---")
# Start HTTP server
proc = subprocess.Popen(['python', '-m', 'http.server', '8085'], cwd='H:/Project/meta-studio')
time.sleep(1.5)

success = True
try:
    with urllib.request.urlopen('http://localhost:8085/index.html') as resp:
        print(f"[PASS] index.html: Status {resp.status}, Content-Type: {resp.headers.get('Content-Type')}")
        content = resp.read().decode('utf-8')
        assert '<title>MetaStudio' in content
        assert 'id="ogCanvas"' in content
        assert 'id="codeOutput"' in content
except Exception as e:
    print(f"[FAIL] index.html failed: {e}")
    success = False

# Test JS files
for js in ['js/app.js', 'js/presets.js', 'js/templates-code.js', 'js/canvas-designer.js', 'css/custom.css']:
    try:
        with urllib.request.urlopen(f'http://localhost:8085/{js}') as resp:
            data = resp.read()
            print(f"[PASS] {js}: Status {resp.status}, Length {len(data)} bytes")
    except Exception as e:
        print(f"[FAIL] {js} failed: {e}")
        success = False

# Now test headless Edge rendering to ensure no crashes
edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
screenshot_path = os.path.abspath('test/screenshot.png')
if os.path.exists(edge_path):
    print("Testing headless Edge rendering...")
    edge_proc = subprocess.run([
        edge_path,
        '--headless=new',
        '--disable-gpu',
        f'--screenshot={screenshot_path}',
        '--window-size=1280,800',
        'http://localhost:8085/index.html'
    ], capture_output=True, timeout=10)
    
    if os.path.exists(screenshot_path) and os.path.getsize(screenshot_path) > 1000:
        print(f"[PASS] Screenshot successfully captured: {screenshot_path} ({os.path.getsize(screenshot_path)} bytes)")
    else:
        print("[WARN] Screenshot was not created or empty, Edge return code:", edge_proc.returncode)

proc.terminate()

if success:
    print("\nALL ASSET AND SERVER TESTS PASSED!")
else:
    print("\nSOME TESTS FAILED!")
