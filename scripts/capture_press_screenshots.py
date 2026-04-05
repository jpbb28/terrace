from playwright.sync_api import sync_playwright
import time

URL = "https://terrasseseason.com"
OUT = "C:/Users/jpbb/terrace/press/screenshots"

def wait_for_map_and_cards(page):
    # Wait for terrace cards to appear in the sidebar
    page.wait_for_selector(".terrace-card, [class*='terrace'], article, [data-testid]", timeout=15000)
    # Extra settle time for map tiles and images
    time.sleep(3)

def capture_desktop(page, path, width=1440, height=900):
    page.set_viewport_size({"width": width, "height": height})
    page.goto(URL, wait_until="networkidle", timeout=30000)
    time.sleep(4)
    page.screenshot(path=path, full_page=False)
    print(f"Saved: {path}")

def capture_mobile(page, path, width=390, height=844):
    page.set_viewport_size({"width": width, "height": height})
    page.goto(URL, wait_until="networkidle", timeout=30000)
    time.sleep(4)
    page.screenshot(path=path, full_page=False)
    print(f"Saved: {path}")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)

    # ── 1. Desktop homepage ──────────────────────────────────────────────────
    page = browser.new_page()
    page.set_viewport_size({"width": 1440, "height": 900})
    page.goto(URL, wait_until="networkidle", timeout=30000)
    time.sleep(4)
    page.screenshot(path=f"{OUT}/desktop.png", full_page=False)
    print(f"Saved: {OUT}/desktop.png")

    # ── 4. Desktop detail panel ──────────────────────────────────────────────
    # Click the first terrace card visible in the sidebar
    # Try common selectors for the card list
    first_card = None
    for selector in [
        "aside li:first-child",
        "aside article:first-child",
        "[class*='sidebar'] li:first-child",
        "[class*='sidebar'] article:first-child",
        "[class*='card']:first-child",
        "li[class*='terrace']:first-child",
        "div[class*='TerraceCard']:first-child",
        "ul li:first-child",
    ]:
        try:
            el = page.locator(selector).first
            if el.is_visible(timeout=2000):
                first_card = el
                print(f"Found first card with selector: {selector}")
                break
        except Exception:
            continue

    if first_card is None:
        # Fallback: click anything that looks like a card
        first_card = page.locator("aside").locator("li, article, div[role='button'], div[tabindex]").first
        print("Using fallback card selector")

    first_card.click()
    time.sleep(3)
    page.screenshot(path=f"{OUT}/desktop-detail.png", full_page=False)
    print(f"Saved: {OUT}/desktop-detail.png")
    page.close()

    # ── 2. Mobile list view ──────────────────────────────────────────────────
    page = browser.new_page()
    page.set_viewport_size({"width": 390, "height": 844})
    page.goto(URL, wait_until="networkidle", timeout=30000)
    time.sleep(4)

    # On mobile the default view should be the list tab; ensure it's selected
    # Try clicking a "List" tab if present
    for selector in [
        "button:has-text('List')",
        "button:has-text('Terraces')",
        "[role='tab']:has-text('List')",
        "[role='tab']:first-child",
    ]:
        try:
            btn = page.locator(selector).first
            if btn.is_visible(timeout=2000):
                btn.click()
                time.sleep(2)
                print(f"Clicked list tab: {selector}")
                break
        except Exception:
            continue

    page.screenshot(path=f"{OUT}/mobile-list.png", full_page=False)
    print(f"Saved: {OUT}/mobile-list.png")

    # ── 3. Mobile map view ───────────────────────────────────────────────────
    # Click the "Map" tab
    map_clicked = False
    for selector in [
        "button:has-text('Map')",
        "[role='tab']:has-text('Map')",
        "[role='tab']:last-child",
        "button:has-text('Carte')",
    ]:
        try:
            btn = page.locator(selector).first
            if btn.is_visible(timeout=2000):
                btn.click()
                time.sleep(3)
                map_clicked = True
                print(f"Clicked map tab: {selector}")
                break
        except Exception:
            continue

    if not map_clicked:
        print("Warning: could not find Map tab button")

    page.screenshot(path=f"{OUT}/mobile-map.png", full_page=False)
    print(f"Saved: {OUT}/mobile-map.png")
    page.close()

    browser.close()
    print("\nAll screenshots captured successfully.")
