# Руководство по развертыванию

Инструкции по развертыванию Планера на различных платформах.

## 🚀 GitHub Pages (Рекомендуется)

### Автоматическое развертывание
1. **Форк репозитория** на GitHub
2. **Включите GitHub Pages**:
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: main / root
3. **Получите URL**: `https://username.github.io/planner`

### Настройка Telegram Bot
```
/newapp в @BotFather
Название: Планер
Описание: Персональный планер
URL: https://username.github.io/planner
```

## ⚡ Vercel

### Быстрое развертывание
1. **Подключите GitHub**: vercel.com → Import Project
2. **Автоматический деплой**: при каждом push
3. **Кастомный домен**: настройте в панели Vercel

### Конфигурация (vercel.json)
```json
{
  "rewrites": [
    { "source": "/", "destination": "/index.html" },
    { "source": "/app", "destination": "/app.html" },
    { "source": "/fast", "destination": "/fast-planner.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "ALLOWALL"
        }
      ]
    }
  ]
}
```

## 🌐 Netlify

### Развертывание
1. **Drag & Drop**: перетащите папку на netlify.com
2. **GitHub интеграция**: автоматические обновления
3. **Кастомные домены**: бесплатно с SSL

### Конфигурация (_redirects)
```
/app /app.html 200
/fast /fast-planner.html 200
/* /index.html 200
```

## 🔧 Собственный сервер

### Nginx конфигурация
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    root /var/www/planner;
    index index.html;
    
    # Заголовки для Telegram Mini App
    add_header X-Frame-Options "ALLOWALL";
    add_header Content-Security-Policy "frame-ancestors *";
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Кэширование статических файлов
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Apache конфигурация (.htaccess)
```apache
RewriteEngine On

# Разрешить фреймы для Telegram
Header always unset X-Frame-Options
Header always set X-Frame-Options "ALLOWALL"

# Перенаправления
RewriteRule ^app$ app.html [L]
RewriteRule ^fast$ fast-planner.html [L]

# Кэширование
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>
```

## 🐳 Docker

### Dockerfile
```dockerfile
FROM nginx:alpine

# Копируем файлы приложения
COPY . /usr/share/nginx/html/

# Копируем конфигурацию nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf для Docker
```nginx
server {
    listen 80;
    server_name localhost;
    
    root /usr/share/nginx/html;
    index index.html;
    
    add_header X-Frame-Options "ALLOWALL";
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Запуск
```bash
# Сборка образа
docker build -t planner .

# Запуск контейнера
docker run -p 8080:80 planner
```

## ☁️ Cloudflare Pages

### Развертывание
1. **Подключите GitHub** в Cloudflare Pages
2. **Настройки сборки**:
   - Build command: (пусто)
   - Build output directory: /
3. **Кастомный домен**: бесплатно с SSL

### Конфигурация (_headers)
```
/*
  X-Frame-Options: ALLOWALL
  Content-Security-Policy: frame-ancestors *
```

## 📱 Настройка Telegram Bot

### Создание бота
```
/newbot в @BotFather
Имя: Планер Bot
Username: your_planner_bot
```

### Настройка Mini App
```
/newapp
Выберите бота
Название: Планер
Описание: Персональный планер с сохранением по дням
URL: https://your-domain.com
```

### Menu Button
```
/setmenubutton
Выберите бота
Текст: Планер
URL: https://your-domain.com
```

### Дополнительные команды
```
/setcommands
start - Запустить планер
help - Помощь
settings - Настройки
```

## 🔒 Безопасность

### HTTPS обязательно
Telegram Mini Apps работают только по HTTPS

### Заголовки безопасности
```
X-Frame-Options: ALLOWALL
Content-Security-Policy: frame-ancestors *
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

### Проверка домена
Telegram проверяет SSL сертификат и доступность домена

## 🧪 Тестирование

### Локальное тестирование
```bash
# Python
python3 -m http.server 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000
```

### Тестирование с ngrok
```bash
# Установка
npm install -g ngrok

# Запуск туннеля
ngrok http 8000

# Используйте HTTPS URL в BotFather
```

### Проверка в Telegram
1. Откройте бота в Telegram
2. Нажмите кнопку Menu или отправьте /start
3. Проверьте все функции приложения

## 📊 Мониторинг

### Логи доступа
Настройте логирование для отслеживания использования

### Аналитика
- Google Analytics
- Yandex.Metrica
- Собственная аналитика

### Ошибки
- Sentry для отслеживания ошибок JavaScript
- Логи сервера для HTTP ошибок

## 🔄 Обновления

### Автоматические обновления
- GitHub Pages: автоматически при push
- Vercel/Netlify: автоматически при push
- Собственный сервер: настройте CI/CD

### Ручные обновления
1. Загрузите новые файлы на сервер
2. Очистите кэш CDN (если используется)
3. Проверьте работоспособность

## 🆘 Решение проблем

### Приложение не загружается
- Проверьте HTTPS
- Проверьте заголовки X-Frame-Options
- Проверьте консоль браузера

### Данные не сохраняются
- Проверьте localStorage в DevTools
- Проверьте ошибки JavaScript
- Проверьте версию файлов

### Проблемы с Telegram
- Проверьте URL в настройках бота
- Проверьте доступность домена
- Обратитесь в поддержку Telegram

---

**Успешного развертывания!** 🚀