Учебный проект сервиса аутентификации по jwt, позволяющий иметь только 1 активную сессию.

## Стек

1. typescript
2. nestjs
3. typeorm
4. jest
5. redis

## Документация

Для документации используется swagger openapi 3.0

Роут документации
`/api/v1`

## Зависимости

1. nodejs v18.16.0
2. redis
3. postgresql

## Начало работы

1. Скопировать .env.example в .env
2. docker-compose pull
3. docker-compose up -d --build
