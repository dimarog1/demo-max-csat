# demo-max-csat

Простой CSAT мини-апп для мессенджера MAX. Пользователь выбирает оценку (5 эмодзи-смайликов), после чего ты можешь отправить её в своего бота через колбэк.

## Стек

- Vanilla HTML / CSS / JS (без сборки)
- MAX Bridge SDK с CDN
- Деплой: GitHub Pages

## Как работает

1. Пользователь открывает мини-апп из чата с ботом.
2. MAX инжектит `window.WebApp` с данными пользователя и сессии.
3. Пользователь выбирает смайлик (1–5).
4. Вызывается `sendRating(value, initData)` — **твоя точка для интеграции** (см. ниже).
5. Показывается экран «Спасибо!», мини-апп закрывается.

## Запуск локально

```bash
# Любой статический сервер
npx serve .
# или
python3 -m http.server 8080
```

Открой `http://localhost:8080`. `window.WebApp` будет недоступен, но UI работает корректно — заглушка `sendRating` просто логирует в консоль.

## Привязка к боту в MAX

1. Задеплой на GitHub Pages (URL будет `https://<username>.github.io/demo-max-csat/`).
2. Зайди на [business.max.ru/self](https://business.max.ru/self) → профиль организации → Чат-боты.
3. Выбери нужного бота → Чат-бот и мини-приложение → Настроить.
4. Вставь URL мини-аппа → Сохранить.

## Интеграция с ботом — реализуй сам

Найди функцию `sendRating` в [app.js](app.js) и замени заглушку реальным вызовом:

```js
async function sendRating(rating, initData) {
  await fetch('https://your-backend.example/csat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating, initData }),
  });
}
```

Твой backend должен:

1. Принять `initData` и провалидировать его (см. [документацию](https://dev.max.ru/docs/webapps/validation)).
2. Извлечь `user.id`, `chat.id`, `start_param` из `initDataUnsafe`.
3. Отправить ответ боту через MAX Bot API (событие `message_callback` / `POST /answers`).

## Кастомизация

В начале [app.js](app.js) находятся константы:

- `QUESTION_TEXT` — текст вопроса.
- `RATINGS` — массив оценок (value, emoji, label). Можно заменить эмодзи или поменять число вариантов.

Цвета и шрифты настраиваются через CSS-переменные в начале [styles.css](styles.css).
