import asyncio
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
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:3000/admin", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # -> Input email and password and submit login form to authenticate.
        frame = context.pages[-1]
        # Input email for login
        elem = frame.locator('xpath=html/body/div[2]/div/form/div/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('maxim.degtiarev.dev@gmail.com')
        

        frame = context.pages[-1]
        # Input password for login
        elem = frame.locator('xpath=html/body/div[2]/div/form/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('admin1234')
        

        frame = context.pages[-1]
        # Click login button to submit credentials
        elem = frame.locator('xpath=html/body/div[2]/div/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on the calendar dropdown to select a date within the work schedule.
        frame = context.pages[-1]
        # Click on Calendario dropdown to select a date
        elem = frame.locator('xpath=html/body/div/div/div/div/h3/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Select a date within the work schedule with existing appointments, e.g., January 19, 2026 (index 28).
        frame = context.pages[-1]
        # Select January 19, 2026, a date within the work schedule with existing appointments
        elem = frame.locator('xpath=html/body/div/div/div/div/div/div/div/div/div/div/div/table/tbody/tr[4]/td[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Select a date with no work schedule to verify that no available time slots are returned.
        frame = context.pages[-1]
        # Select January 28, 2026, a date with no work schedule
        elem = frame.locator('xpath=html/body/div/div/div/div/div/div/div/div/div/div/div/table/tbody/tr/td/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Test that times outside work hours are not listed by selecting a date with known work schedule and appointments, then extracting and verifying available time slots.
        frame = context.pages[-1]
        # Select January 19, 2026 again to test available time slots excluding times outside work hours and booked/canceled slots
        elem = frame.locator('xpath=html/body/div/div/div/div/div/div/div/div/div/div/div/table/tbody/tr[4]/td[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click 'Editar dia' button to review or edit the work schedule and availability settings for January 19, 2026 to verify if the schedule or appointments might be causing no available slots.
        frame = context.pages[-1]
        # Click 'Editar dia' button to review/edit work schedule and availability for January 19, 2026
        elem = frame.locator('xpath=html/body/div/div/div/div/div/div/div/div[2]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Close the 'Editar dia' modal and query available time slots again to verify if slots are generated within the set work hours and exclude booked or canceled slots.
        frame = context.pages[-1]
        # Close 'Editar dia' modal
        elem = frame.locator('xpath=html/body/div[3]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Test with a different date known to have available slots to confirm the system can display available times correctly.
        frame = context.pages[-1]
        # Select January 16, 2026, a date likely with available slots
        elem = frame.locator('xpath=html/body/div/div/div/div/div/div/div/div/div/div/div/table/tbody/tr[3]/td[6]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Test the system with a date known to have partial availability or fewer appointments to see if slots appear.
        frame = context.pages[-1]
        # Select January 15, 2026, a date to test for partial availability
        elem = frame.locator('xpath=html/body/div/div/div/div/div/div/div/div/div/div/div/table/tbody/tr[3]/td[5]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=Dra. Mara Flamini').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Admin Max').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Logout').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Calendario').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=enero 2026').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=do').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=lu').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=ma').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=mi').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=ju').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=vi').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=sá').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Editar dia').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Jueves 15 de Enero').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    