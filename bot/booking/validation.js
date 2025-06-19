// Валидация даты в формате ДД:ММ:ГГГГ
function isValidDate(str) {
  const regex = /^\d{2}:\d{2}:\d{4}$/;
  if (!regex.test(str)) return false;
  const [d, m, y] = str.split(':').map(Number);
  const date = new Date(y, m - 1, d);
  if (date.getDate() !== d || date.getMonth() !== m - 1 || date.getFullYear() !== y) return false;
  // Дополнительно: дата не раньше сегодня и не позже 31.12.2025
  const today = new Date();
  const maxDate = new Date(2025, 11, 31);
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const inputDateObj = date;
  if (inputDateObj < todayDateOnly || inputDateObj > maxDate) return false;
  return true;
}

// Валидация ФИО (три слова, каждое с большой буквы, не короче 2 букв)
function isValidFullName(str) {
  if (!str || str.length < 5) return false;
  const regex = /^([А-ЯІЇЄЁ][а-яіїєё']{1,}\s){2}[А-ЯІЇЄЁ][а-яіїєё']{1,}$/u;
  return regex.test(str);
}

// Валидация телефона (украинский формат +380XXXXXXXXX)
function isValidPhone(str) {
  const regex = /^\+380\d{9}$/;
  return regex.test(str);
}

// Валидация количества ночей (целое число от 1 до 30)
function isValidNights(str) {
  const n = parseInt(str);
  return !isNaN(n) && n >= 1 && n <= 30;
}

module.exports = { isValidDate, isValidFullName, isValidPhone, isValidNights }; 