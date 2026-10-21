import os
import subprocess
import zipfile

DEST_DIR = r"d:\dyslexia\ai_engine\data\etdd70"
os.makedirs(DEST_DIR, exist_ok=True)

FILES = [
    {"name": "README.md", "is_zip": False},
    {"name": "dyslexia_class_label.csv", "is_zip": False},
    {"name": "rois.zip", "is_zip": True},
    {"name": "stimuli.zip", "is_zip": True},
    {"name": "data.zip", "is_zip": True}
]

BASE_URL = "https://zenodo.org/records/13332134/files"

def download_file(filename, target_path):
    url = f"{BASE_URL}/{filename}?download=1"
    print(f"Downloading {filename} from {url}...")
    cmd = [
        "curl.exe",
        "-4",
        "-L",
        "--connect-timeout", "30",
        "-o", target_path,
        "-C", "-", # continue if partially downloaded
        "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        url
    ]
    res = subprocess.run(cmd)
    if res.returncode != 0:
        raise RuntimeError(f"Failed to download {filename}, exit code: {res.returncode}")
    print(f"Successfully downloaded {filename}.")

def main():
    for f in FILES:
        filename = f["name"]
        target_path = os.path.join(DEST_DIR, filename)
        
        # Check if file already exists and is non-empty
        if not os.path.exists(target_path) or os.path.getsize(target_path) == 0:
            download_file(filename, target_path)
        else:
            print(f"File {filename} already exists ({os.path.getsize(target_path)} bytes). Skipping download.")
        
        if f["is_zip"]:
            extract_folder = os.path.join(DEST_DIR, filename.replace(".zip", ""))
            if not os.path.exists(extract_folder):
                print(f"Extracting {filename} into {extract_folder}...")
                with zipfile.ZipFile(target_path, 'r') as zip_ref:
                    zip_ref.extractall(extract_folder)
                print(f"Extracted {filename} successfully.")
            else:
                print(f"Extraction folder {extract_folder} already exists.")

    print("\nAll files downloaded and extracted successfully!")

if __name__ == "__main__":
    main()
