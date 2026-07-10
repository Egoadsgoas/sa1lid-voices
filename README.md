# SA1LID VOICES

Премиальный зашифрованный мессенджер для Web, PWA и Windows (Electron).

## Запуск

```powershell
npm install
npm run dev
```

Web-интерфейс: `http://localhost:5173`, API: `http://localhost:3000/api/health`.

```powershell
npm run build
npm start
```

После production-сборки сервер публикует Web/PWA на `http://localhost:3000`.

## Supabase и Render

1. Создайте Supabase-проект и выполните `supabase/migrations/001_initial.sql` в SQL Editor.
2. Создайте Storage buckets: `avatars`, `attachments`, `themes` и `sounds`; buckets должны быть приватными, доступ — через signed URLs.
3. Укажите `SUPABASE_URL` и `SUPABASE_SERVICE_ROLE_KEY` в Render, не добавляя ключи в репозиторий.
4. Для надёжного WebRTC укажите `TURN_URL`, `TURN_USERNAME`, `TURN_CREDENTIAL`.
5. Создайте Web Service из `render.yaml`; health check расположен по `/api/health`.

Без переменных Supabase приложение работает в локальном демонстрационном режиме и сохраняет серверные данные в `data/sa1lid.json`.

## Безопасность

- Electron: sandbox, context isolation, отключённый Node.js в renderer.
- Пароли локального fallback хешируются Argon2id.
- Содержимое E2EE должно шифроваться на клиенте до отправки; серверная схема хранит `ciphertext` и `iv`.
- Manifest темы не поддерживает JavaScript или произвольный CSS.

## Проверки

```powershell
npm test
npm run build
npm run electron
```
