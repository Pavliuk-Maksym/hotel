// Тесты для основных функций валидации (дата, ПІБ, телефон, ночи)

describe('Валидация даты', () => {
  const regex = /^\d{2}:\d{2}:\d{4}$/;
  function isValidDate(str) {
    if (!regex.test(str)) return false;
    const [d, m, y] = str.split(':').map(Number);
    const date = new Date(y, m - 1, d);
    return date.getDate() === d && date.getMonth() === m - 1 && date.getFullYear() === y;
  }
  test('корректная дата', () => {
    expect(isValidDate('01:12:2024')).toBe(true);
  });
  test('некорректная дата (31.02.2024)', () => {
    expect(isValidDate('31:02:2024')).toBe(false);
  });
  test('некорректный формат', () => {
    expect(isValidDate('2024-12-01')).toBe(false);
  });
});

describe('Валидация ПІБ', () => {
  const regex = /^([А-ЯІЇЄЁ][а-яіїєё]{1,}\s){2}[А-ЯІЇЄЁ][а-яіїєё]{1,}$/u;
  function isValidFullName(str) {
    return regex.test(str);
  }
  test('корректный ПІБ', () => {
    expect(isValidFullName('Комаров Василь Дмитрович')).toBe(true);
  });
  test('только два слова', () => {
    expect(isValidFullName('Комаров Василь')).toBe(false);
  });
  test('маленькая буква', () => {
    expect(isValidFullName('комаров Василь Дмитрович')).toBe(false);
  });
});

describe('Валидация телефона', () => {
  const regex = /^\+380\d{9}$/;
  function isValidPhone(str) {
    return regex.test(str);
  }
  test('корректный номер', () => {
    expect(isValidPhone('+380937465892')).toBe(true);
  });
  test('без плюса', () => {
    expect(isValidPhone('380937465892')).toBe(false);
  });
  test('слишком короткий', () => {
    expect(isValidPhone('+38093746')).toBe(false);
  });
});

describe('Валидация количества ночей', () => {
  function isValidNights(str) {
    const n = parseInt(str);
    return !isNaN(n) && n >= 1 && n <= 30;
  }
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