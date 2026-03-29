# TextLens — Анализ на текст

Уеб-базирана платформа за интелигентен анализ на текст с Claude AI.

## Функции

- 📋 **Copy-paste** или качване на файл (.txt, .pdf, .docx)
- 🎯 **Тема** — основната идея на текста
- 🔑 **Ключови думи** — най-важните термини
- 📝 **Резюме** — кратко обобщение
- 💡 **Емоционална натовареност** — sentiment + нюанси

## Локално стартиране

1. Клонирайте репото
2. Инсталирайте зависимостите:
   ```bash
   npm install
   ```
3. Копирайте `.env.local.example` в `.env.local` и добавете вашия API ключ:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```
4. Стартирайте dev сървъра:
   ```bash
   npm run dev
   ```
5. Отворете [http://localhost:3000](http://localhost:3000)

## Деплой в Vercel

1. Качете кода в GitHub репо
2. Влезте в [vercel.com](https://vercel.com) и импортирайте репото
3. Добавете environment variable:
   - Name: `ANTHROPIC_API_KEY`
   - Value: вашият Anthropic API ключ
4. Кликнете **Deploy** — готово!

## Технологии

- **Next.js 14** (App Router)
- **TypeScript**
- **Anthropic Claude API** (claude-sonnet-4)
- **pdfjs-dist** за PDF обработка
- **mammoth** за .docx обработка
