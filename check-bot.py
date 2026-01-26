#!/usr/bin/env python3
import requests
import json

# Замени на свой токен бота
BOT_TOKEN = "YOUR_BOT_TOKEN"

def get_menu_button():
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/getChatMenuButton"
    response = requests.get(url)
    return response.json()

def set_menu_button(web_app_url):
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/setChatMenuButton"
    data = {
        "menu_button": {
            "type": "web_app",
            "text": "Планы",
            "web_app": {
                "url": web_app_url
            }
        }
    }
    response = requests.post(url, json=data)
    return response.json()

if __name__ == "__main__":
    print("Текущие настройки меню бота:")
    current = get_menu_button()
    print(json.dumps(current, indent=2, ensure_ascii=False))
    
    # Обновляем URL на основной index.html
    new_url = "https://daniildyatlov-boop.github.io/planner-app/"
    print(f"\nОбновляем URL на: {new_url}")
    result = set_menu_button(new_url)
    print(json.dumps(result, indent=2, ensure_ascii=False))