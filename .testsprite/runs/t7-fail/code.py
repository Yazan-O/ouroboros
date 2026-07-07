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
        await page.goto("https://ouroboros-phi.vercel.app/")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'Seek to iteration 2' button to open the story card for iteration 2.
        # Seek to iteration 2 button
        elem = page.get_by_test_id('replay-marker-2')
        await elem.click(timeout=10000)
        
        # -> Scroll down to reveal the detail card below the ring and search the page for the text 'run id' to look for the evidence/run identifier line.
        await page.mouse.wheel(0, 300)
        
        # -> Scroll down and check the detail card for an evidence block that shows a 'run id' line, the root-cause sentence about ring arcs not being interactive, and a 'fix target' line.
        await page.mouse.wheel(0, 300)
        
        # -> Scroll the page to reveal more of the iteration 2 detail card and search the page for 'run id', 'cloud run', 'fix target', and 'run' to check for an evidence block.
        await page.mouse.wheel(0, 300)
        
        # -> Click the iteration 2 log entry (the bordered L1 box below the Learning Curve) to reveal the evidence block and check for a run id, root-cause, and fix-target lines.
        # # 1
        elem = page.get_by_text('# 1', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'L1' log entry below the Learning Curve to open the evidence block for iteration 2 and verify the run id, root-cause, and fix-target lines.
        # # 2
        elem = page.get_by_text('# 2', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Seek to iteration 4' button to open iteration 4's story card and verify it shows PASS and contains no evidence section.
        # Seek to iteration 4 button
        elem = page.get_by_test_id('replay-marker-4')
        await elem.click(timeout=10000)
        
        # -> Click the 'Seek to iteration 2' button to open iteration 2's story card and inspect the detail card for an evidence block.
        # Seek to iteration 2 button
        elem = page.get_by_test_id('replay-marker-2')
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Verify the detail card below the ring contains an evidence section separated by a top border, showing a run id line, a root-cause sentence mentioning the arc segments not being exposed as interactive, and a 'fix target' line
        # Assert: Expected the detail card below the ring to contain a run id line.
        await expect(page.locator("xpath=/html/body/main/div/section").nth(0)).to_contain_text("run id", timeout=15000), "Expected the detail card below the ring to contain a run id line."
        # Assert: Expected the detail card below the ring to include a root-cause sentence mentioning the arc segments not being exposed as interactive.
        await expect(page.locator("xpath=/html/body/main/div/section").nth(0)).to_contain_text("arc segments not being exposed as interactive", timeout=15000), "Expected the detail card below the ring to include a root-cause sentence mentioning the arc segments not being exposed as interactive."
        # Assert: Expected the detail card below the ring to contain a 'fix target' line.
        await expect(page.locator("xpath=/html/body/main/div/section").nth(0)).to_contain_text("fix target", timeout=15000), "Expected the detail card below the ring to contain a 'fix target' line."
        # Assert: Verify the detail card for iteration 4 shows PASS and contains no evidence section
        assert False, "Expected: Verify the detail card for iteration 4 shows PASS and contains no evidence section (could not be verified on the page)"
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    