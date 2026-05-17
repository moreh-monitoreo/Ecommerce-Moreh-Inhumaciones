import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import os
import re
import time

BASE_URL = "https://www.capillasmoreh.com"
OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))
VISITED = set()
ASSETS = set()

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    "Accept-Language": "es-MX,es;q=0.9",
}

session = requests.Session()
session.headers.update(HEADERS)


def safe_filename(url):
    parsed = urlparse(url)
    path = parsed.path.strip("/") or "index"
    path = re.sub(r'[<>:"|?*]', '_', path)
    if not os.path.splitext(path)[1]:
        path += ".html"
    return path


def save_file(url, content, binary=False):
    filename = safe_filename(url)
    filepath = os.path.join(OUTPUT_DIR, filename)
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    mode = "wb" if binary else "w"
    encoding = None if binary else "utf-8"
    try:
        with open(filepath, mode, encoding=encoding) as f:
            f.write(content)
        return filepath
    except Exception as e:
        print(f"  Error guardando {filepath}: {e}")
        return None


def download_asset(url):
    if url in ASSETS:
        return
    ASSETS.add(url)
    try:
        resp = session.get(url, timeout=20)
        if resp.status_code == 200:
            filename = safe_filename(url)
            filepath = os.path.join(OUTPUT_DIR, "assets", filename)
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            with open(filepath, "wb") as f:
                f.write(resp.content)
            size = len(resp.content) // 1024
            print(f"  Asset: {filename} ({size}KB)")
    except Exception as e:
        print(f"  Error asset {url}: {e}")


def crawl_page(url):
    if url in VISITED:
        return
    VISITED.add(url)

    try:
        resp = session.get(url, timeout=20)
        if resp.status_code != 200:
            print(f"  Saltando {url} -> {resp.status_code}")
            return
        print(f"\nPagina: {url}")
    except Exception as e:
        print(f"  Error accediendo {url}: {e}")
        return

    soup = BeautifulSoup(resp.text, "lxml")

    # Descargar imagenes
    for img in soup.find_all("img"):
        src = img.get("src") or img.get("data-src") or img.get("data-lazy-src")
        if src:
            full_url = urljoin(url, src)
            if BASE_URL in full_url or "capillasmoreh" in full_url:
                download_asset(full_url)

    # Descargar CSS
    for link in soup.find_all("link", rel="stylesheet"):
        href = link.get("href")
        if href:
            download_asset(urljoin(url, href))

    # Descargar JS
    for script in soup.find_all("script", src=True):
        src = script.get("src")
        if src and ("capillasmoreh" in src or src.startswith("/")):
            download_asset(urljoin(url, src))

    # Guardar HTML
    filename = safe_filename(url)
    filepath = os.path.join(OUTPUT_DIR, "paginas", filename)
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(resp.text)
    print(f"  Guardado: paginas/{filename}")

    # Encontrar links internos
    for a in soup.find_all("a", href=True):
        href = a["href"]
        full_url = urljoin(url, href)
        parsed = urlparse(full_url)
        if parsed.netloc in ("www.capillasmoreh.com", "capillasmoreh.com"):
            if full_url not in VISITED and "#" not in full_url:
                time.sleep(0.5)
                crawl_page(full_url)


print("=" * 50)
print("Descargando sitio: www.capillasmoreh.com")
print(f"Destino: {OUTPUT_DIR}")
print("=" * 50)

crawl_page(BASE_URL)

print("\n" + "=" * 50)
print(f"Completado!")
print(f"  Paginas descargadas: {len(VISITED)}")
print(f"  Assets (imgs/css/js): {len(ASSETS)}")
print(f"  Directorio: {OUTPUT_DIR}")
print("=" * 50)
