const { isValidDate, isValidFullName, isValidPhone, isValidNights } = require('../validation.js');

// Тесты для основных функций валидации (дата, ПІБ, телефон, ночи)

describe('Валидация даты', () => {
  test('корректная дата', () => {
    expect(isValidDate('01:12:2024')).toBe(true);
  });
  test('некорректная дата (31.02.2024)', () => {
    expect(isValidDate('31:02:2024')).toBe(false);
  });
  test('некорректный формат', () => {
    expect(isValidDate('2024-12-01')).toBe(false);
  });
  test('дата в прошлом', () => {
    expect(isValidDate('01:01:2000')).toBe(false);
  });
  test('дата после 31.12.2025', () => {
    expect(isValidDate('01:01:2026')).toBe(false);
  });
});

describe('Валидация ПІБ', () => {
  test('корректный ПІБ', () => {
    expect(isValidFullName('Комаров Василь Дмитрович')).toBe(true);
  });
  test('только два слова', () => {
    expect(isValidFullName('Комаров Василь')).toBe(false);
  });
  test('маленькая буква', () => {
    expect(isValidFullName('комаров Василь Дмитрович')).toBe(false);
  });
  test('слишком коротко', () => {
    expect(isValidFullName('А Б В')).toBe(false);
  });
});

describe('Валидация телефона', () => {
  test('корректный номер', () => {
    expect(isValidPhone('+380937465892')).toBe(true);
  });
  test('без плюса', () => {
    expect(isValidPhone('380937465892')).toBe(false);
  });
  test('слишком короткий', () => {
    expect(isValidPhone('+38093746')).toBe(false);
  });
  test('буквы в номере', () => {
    expect(isValidPhone('+38093abc892')).toBe(false);
  });
});

describe('Валидация количества ночей', () => {
  test('корректное число', () => {
    expect(isValidNights('5')).toBe(true);
  });
  test('меньше 1', () => {
    expect(isValidNights('0')).toBe(false);
  });
  test('больше 30', () => {
    expect(isValidNights('31')).toBe(false);
  });
  test('не число', () => {
    expect(isValidNights('abc')).toBe(false);
  });
}); 