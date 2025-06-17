import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// Импорт моделей
import Room from './modules/rooms.js';
import Client from './modules/clients.js';
import Booking from './modules/booking.js';
import Admin from './modules/administrations.js';
import CancelRequest from './modules/cancelRequest.js';
import Confirm from './modules/confirmBooking.js';

// Подключение к MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/hotel', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB подключена успешно');
  } catch (error) {
    console.error('Ошибка подключения к MongoDB:', error);
    process.exit(1);
  }
};

// Функция для импорта данных
const importData = async () => {
  try {
    // Очистка существующих данных
    await Room.deleteMany({});
    await Client.deleteMany({});
    await Booking.deleteMany({});
    await Admin.deleteMany({});
    await CancelRequest.deleteMany({});
    await Confirm.deleteMany({});
    
    console.log('Существующие данные очищены');

    // Импорт номеров
    const roomsData = JSON.parse(fs.readFileSync('./data/rooms.json', 'utf8'));
    await Room.insertMany(roomsData);
    console.log('Данные номеров импортированы');

    // Импорт клиентов
    const clientsData = JSON.parse(fs.readFileSync('./data/clients.json', 'utf8'));
    await Client.insertMany(clientsData);
    console.log('Данные клиентов импортированы');

    // Импорт бронирований
    const bookingData = JSON.parse(fs.readFileSync('./data/booking.json', 'utf8'));
    await Booking.insertMany(bookingData);
    console.log('Данные бронирований импортированы');

    // Импорт администраторов
    const adminData = JSON.parse(fs.readFileSync('./data/administrations.json', 'utf8'));
    await Admin.insertMany(adminData);
    console.log('Данные администраторов импортированы');

    // Импорт запросов на отмену
    const cancelData = JSON.parse(fs.readFileSync('./data/cancelRequest.json', 'utf8'));
    await CancelRequest.insertMany(cancelData);
    console.log('Данные запросов на отмену импортированы');

    // Импорт подтвержденных бронирований
    const confirmData = JSON.parse(fs.readFileSync('./data/confirmBooking.json', 'utf8'));
    await Confirm.insertMany(confirmData);
    console.log('Данные подтвержденных бронирований импортированы');

    console.log('Все данные успешно импортированы!');
    
  } catch (error) {
    console.error('Ошибка при импорте данных:', error);
  } finally {
    mongoose.connection.close();
    console.log('Соединение с MongoDB закрыто');
  }
};

// Запуск импорта
connectDB().then(() => {
  importData();
}); 