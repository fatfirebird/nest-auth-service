Простой сервис аутентификации по jwt, позволяющий иметь только 1 активную сессию.

## Документация

Для документации используется swagger openapi 3.0 `/api/v1`

## Зависимости

1. nodejs v18.16.0
2. redis
3. postgresql

## Начало работы

1. Скопировать .env.example в .env
2. docker-compose pull
3. docker-compose up -d --build
