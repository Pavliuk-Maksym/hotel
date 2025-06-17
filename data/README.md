# Данные для импорта в MongoDB

Этот каталог содержит JSON файлы с данными для основных таблиц системы бронирования отеля.

## Структура файлов

- `rooms.json` - данные о номерах отеля (цены, количество, изображения, описания)
- `clients.json` - данные о клиентах (пользователи системы)
- `booking.json` - данные о бронированиях
- `administrations.json` - данные администраторов системы
- `cancelRequest.json` - данные о запросах на отмену бронирований
- `confirmBooking.json` - данные о подтвержденных бронированиях

## Импорт данных

### Способ 1: Использование скрипта importData.js

1. Убедитесь, что MongoDB запущена на localhost:27017
2. Установите зависимости: `npm install`
3. Запустите скрипт импорта:
   ```bash
   node importData.js
   ```

### Способ 2: Ручной импорт через MongoDB Compass

1. Откройте MongoDB Compass
2. Подключитесь к базе данных `hotel`
3. Для каждой коллекции:
   - Выберите коллекцию (rooms, users, booking, administrations, cancelRequest, confirmBooking)
   - Нажмите "Add Data" → "Insert Document"
   - Скопируйте содержимое соответствующего JSON файла
   - Вставьте и сохраните

### Способ 3: Использование mongoimport

```bash
# Импорт номеров
mongoimport --db hotel --collection rooms --file data/rooms.json --jsonArray

# Импорт клиентов
mongoimport --db hotel --collection users --file data/clients.json --jsonArray

# Импорт бронирований
mongoimport --db hotel --collection booking --file data/booking.json --jsonArray

# Импорт администраторов
mongoimport --db hotel --collection administrations --file data/administrations.json --jsonArray

# Импорт запросов на отмену
mongoimport --db hotel --collection cancelRequest --file data/cancelRequest.json --jsonArray

# Импорт подтвержденных бронирований
mongoimport --db hotel --collection confirmBooking --file data/confirmBooking.json --jsonArray
```

## Описание данных

### rooms.json
Содержит информацию о номерах отеля:
- `hotelCity` - город отеля
- `classRoom` - класс номера (econom, standart, napivLuxury, luxury)
- `price` - цена за ночь
- `quantity` - количество доступных номеров
- `image` - массив путей к изображениям
- `description` - описание номера

### clients.json
Содержит данные клиентов:
- `userName` - имя пользователя
- `fullName` - полное имя
- `phoneNumber` - номер телефона
- `hotelCity` - город отеля
- `classRoom` - предпочитаемый класс номера

### booking.json
Содержит данные бронирований:
- `userName` - имя пользователя
- `userId` - ID пользователя
- `date` - дата заезда
- `time` - время заезда
- `beforeDate` - дата выезда
- `hotelCity` - город отеля
- `classRoom` - класс номера
- `night` - количество ночей
- `price` - общая стоимость
- `phoneNumber` - номер телефона
- `fullName` - полное имя

### administrations.json
Содержит данные администраторов:
- `username` - имя пользователя
- `password` - пароль

### cancelRequest.json
Содержит данные запросов на отмену:
- `bookingId` - ID бронирования
- `userId` - ID пользователя
- `userName` - имя пользователя
- `fullName` - полное имя
- `phoneNumber` - номер телефона
- `hotelCity` - город отеля
- `classRoom` - класс номера
- `date` - дата заезда
- `price` - стоимость бронирования
- `status` - статус запроса (pending, confirmed, declined)
- `refundAmount` - сумма возврата
- `refundPercentage` - процент возврата
- `adminComment` - комментарий администратора
- `createdAt` - дата создания запроса

### confirmBooking.json
Содержит данные подтвержденных бронирований (структура аналогична booking.json)

## Примечания

- Все данные являются примерами и могут быть изменены под ваши нужды
- Убедитесь, что MongoDB запущена перед импортом
- При использовании скрипта importData.js существующие данные будут удалены
- Измените строку подключения в importData.js, если используете другую конфигурацию MongoDB 