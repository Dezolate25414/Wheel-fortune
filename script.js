import { gsap } from "https://esm.sh/gsap";
import { CustomEase } from "https://esm.sh/gsap/CustomEase";
import WheelFortune from "https://esm.sh/wheel-fortune";

gsap.registerPlugin(CustomEase);

const botToken = 'ВАШ_БОТ_ТОКЕН';
const adminChatId = 'ВАШ_CHAT_ID';

let currentSegment = null;
let isSpinning = false; // Флаг состояния вращения

document.addEventListener('DOMContentLoaded', () => {
  const spinStates = [
    {
      stopSegment: 0,
      callback: () => {
        currentSegment = 0;
        console.log('Сегмент 0: завершение');
        isSpinning = false; // Завершаем вращение
      }
    },
    {
      stopSegment: 1,
      callback: () => {
        currentSegment = 1;
        console.log('Сегмент 1: завершение');
        isSpinning = false; // Завершаем вращение
      }
    },
    {
      stopSegment: 2,
      callback: () => {
        currentSegment = 2;
        console.log('Сегмент 2: крутим ещё раз автоматически!');
        if (!isSpinning) {
          isSpinning = true; // Устанавливаем флаг вращения
          wheel.spin(); // Повторный спин
        }
      }
    },
    {
      stopSegment: 3,
      callback: () => {
        currentSegment = 3;
        console.log('Сегмент 3: завершение');
        isSpinning = false; // Завершаем вращение
      }
    },
    {
      stopSegment: 4,
      callback: () => {
        currentSegment = 4;
        console.log('Сегмент 4: завершение');
        isSpinning = false; // Завершаем вращение
      }
    },
    {
      stopSegment: 5,
      callback: () => {
        currentSegment = 5;
        console.log('Сегмент 5: крутим ещё раз автоматически!');
        if (!isSpinning) {
          isSpinning = true; // Устанавливаем флаг вращения
          wheel.spin(); // Повторный спин
        }
      }
    },
    {
      stopSegment: 6,
      callback: () => {
        currentSegment = 6;
        console.log('Сегмент 6: завершение');
        isSpinning = false; // Завершаем вращение
      }
    },
    {
      stopSegment: 7,
      callback: () => {
        currentSegment = 7;
        console.log('Сегмент 7: завершение');
        isSpinning = false; // Завершаем вращение
      }
    },
  ];

  const wheel = new WheelFortune({
    spinStates,
    rotationCount: 4,
    segmentCount: 8,
    wheelLibration: true,
  });

  wheel.init();

  document.getElementById('claimPrize').addEventListener('click', async () => {
    const telegramTag = document.getElementById('telegramTag').value.trim();
    if (!telegramTag) {
      alert('Пожалуйста, введите ваш Telegram-тег.');
      return;
    }

    const message = encodeURIComponent(
      `Новый победитель!\n` +
      `Telegram-тег: ${telegramTag}\n` +
      `Выпавший сегмент: ${currentSegment}`
    );

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${adminChatId}&text=${message}`,
        { method: 'GET' }
      );

      const data = await response.json();
      if (data.ok) {
        alert('Ваш Telegram-тег и результат отправлены администратору!');
      } else {
        alert('Ошибка при отправке в Телеграм. Попробуйте еще раз.');
      }
    } catch (error) {
      alert('Ошибка сети. Проверьте подключение к интернету.');
    }
  });
});
