"""Check the installed Firebase app's login UI without credentials or DB writes."""
import argparse
import pathlib
import subprocess
import time
import xml.etree.ElementTree as ET

PACKAGE = "com.anonymous.comercialesmelymovil"


def adb(*args):
    return subprocess.run(
        ["adb", *args], check=True, capture_output=True, timeout=40
    ).stdout


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="output/evidence/ci-android-login.png")
    args = parser.parse_args()
    output = pathlib.Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    adb("shell", "am", "force-stop", PACKAGE)
    adb("shell", "am", "start", "-W", "-n", f"{PACKAGE}/.MainActivity")
    deadline = time.monotonic() + 120
    while time.monotonic() < deadline:
        try:
            adb("shell", "uiautomator", "dump", "--compressed", "/sdcard/mely-ci.xml")
            tree = ET.fromstring(adb("shell", "cat", "/sdcard/mely-ci.xml"))
            labels = " ".join(
                (node.get("text", "") + " " + node.get("content-desc", ""))
                for node in tree.iter("node")
            )
            if "Comerciales Mely" in labels and (
                "Usuario" in labels or "Contraseña" in labels
            ):
                output.write_bytes(adb("exec-out", "screencap", "-p"))
                print("PASS: installed APK shows Firebase login without Metro.")
                return
        except (subprocess.CalledProcessError, subprocess.TimeoutExpired, ET.ParseError):
            pass
        time.sleep(2)
    output.write_bytes(adb("exec-out", "screencap", "-p"))
    raise SystemExit("FAIL: Firebase login was not visible within 120 seconds.")


if __name__ == "__main__":
    main()
