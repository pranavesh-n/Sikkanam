import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process"
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        # Wider default timeout to match the agent's DOM-stability budget;
        # auto-waiting Playwright APIs (expect, locator.wait_for) inherit this.
        context.set_default_timeout(15000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> navigate
        await page.goto("http://localhost:3000")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Close the 'What's New' modal and click the 'Explore' link to open the Explore page.
        # Close modal button
        elem = page.get_by_role("button", name="Close modal")
        await elem.click(timeout=10000)
        
        # -> Close the 'What's New' modal and click the 'Explore' link to open the Explore page.
        # Explore link
        elem = page.get_by_role("main").get_by_role("link", name="Explore")
        await elem.click(timeout=10000)
        
        # -> Click the 'X' close button on the modal labeled 'Already a Sikkanam User or New User?' to dismiss the overlay.
        # Close modal button
        elem = page.get_by_role("button", name="Close modal")
        await elem.click(timeout=10000)
        
        # -> Close the 'Install Sikkanam App' modal by clicking its close button to reveal the Explore content.
        # Close modal button
        elem = page.get_by_role("button", name="Close modal")
        await elem.click(timeout=10000)
        
        # -> Type 'Ooty' into the 'Search destinations...' field and confirm the Ooty card appears in results.
        # Search destinations... text field
        elem = page.get_by_role("textbox", name="Search destinations...")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Ooty")
        
        # -> Type 'Ooty' into the 'Search destinations...' field and confirm the Ooty card appears in results.
        # Search destinations... text field
        elem = page.get_by_role("textbox", name="Search destinations...")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("")
        
        # -> Type 'Ooty' into the 'Search destinations...' field and confirm the Ooty card appears in results.
        # 🏔️ Hills button
        elem = page.get_by_role("button", name="🏔️ Hills")
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> The Ooty destination card is visible in the Explore results.
        await page.get_by_role("link", name="🍵 Ooty Nilgiris 10 spots →").nth(0).scroll_into_view_if_needed()
        # Assert-outcome: passed
        # Assert: Ooty destination card is visible on the page.
        await expect(page.get_by_role("link", name="🍵 Ooty Nilgiris 10 spots →").nth(0)).to_be_visible(timeout=15000), "Ooty destination card is visible on the page."
        
        # --> The Hills filter is applied and the results list includes hill destinations (Ooty and Yercaud).
        # Assert-outcome: passed
        # Assert: The URL shows the Hills category parameter.
        await expect(page).to_have_url(re.compile("cat=hill"), timeout=15000), "The URL shows the Hills category parameter."
        await page.get_by_role("link", name="☕ Yercaud Salem 10 spots →").nth(0).scroll_into_view_if_needed()
        # Assert-outcome: passed
        # Assert: Yercaud destination card is visible on the page.
        await expect(page.get_by_role("link", name="☕ Yercaud Salem 10 spots →").nth(0)).to_be_visible(timeout=15000), "Yercaud destination card is visible on the page."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    