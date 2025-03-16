const spin = document.querySelector("#spin");
const canvas = document.querySelector("#wheel");
const ctx = canvas.getContext("2d");

// TODO: get them from the .env
// const botToken = 'XXX';
// const adminChatId = 'XXX';

// Sectors with color, label, optional image, and winning probability (in percent).
const sectors = [
  { color: "#a7a7a7", label: "Lose", img: "./assets/lose.png", prob: 15 },
  { color: "#58d68d", label: "Game", img: "./assets/game.png", prob: 0.25 },
  { color: "#a7a7a7", label: "Lose", img: "./assets/lose.png", prob: 15 },
  { color: "#C70039", label: "Moderka", img: "./assets/moderator.png", prob: 5 },
  { color: "#a7a7a7", label: "Lose", img: "./assets/lose.png", prob: 15 },
  { color: "#5dade2", label: "Premium", img: "./assets/premium.png", prob: 3 },
  { color: "#a7a7a7", label: "Lose", img: "./assets/lose.png", prob: 15 },
  { color: "#252525", label: "Deluxe", textColor: "#fcc004", prob: 0.25 },
  { color: "#a7a7a7", label: "Lose", img: "./assets/lose.png", prob: 15 },
  { color: "#f7c705", label: "Extra", textColor: "#2b2a2a", prob: 0.5 },
  { color: "#a7a7a7", label: "Lose", img: "./assets/lose.png", prob: 15 },
  { color: "#fefefe", label: "Esential", textColor: "#2b2a2a", prob: 1 },
];

const PI = Math.PI;
const TAU = 2 * PI;
const dia = canvas.width;
const rad = dia / 2;

// Divide the wheel equally (visual segments have equal sizes)
const tot = sectors.length;
const arc = TAU / tot;
sectors.forEach((sector, i) => {
  sector.startAngle = i * arc;
  sector.arc = arc;
});

// Draw all sectors.
function drawAll() {
  // Draw the background for each sector.
  sectors.forEach(sector => {
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = sector.color;
    ctx.moveTo(rad, rad);
    ctx.arc(rad, rad, rad, sector.startAngle, sector.startAngle + sector.arc);
    ctx.lineTo(rad, rad);
    ctx.fill();
    ctx.restore();
  });

  // Now draw the content (image or text) for each sector.
  sectors.forEach(sector => {
    const centerAngle = sector.startAngle + sector.arc / 2;
    if (sector.img) {
      const img = new Image();
      img.onload = () => {
        ctx.save();
        // Move to the center of the canvas and rotate to the sector's center.
        ctx.translate(rad, rad);
        ctx.rotate(centerAngle);
        // Draw the image centered: adjust these numbers (half width/height) as needed.
        ctx.drawImage(img, 175, -30, 64, 64);
        ctx.restore();
      };
      img.src = sector.img; // Start loading the image.
    } else {
      ctx.save();
      ctx.translate(rad, rad);
      ctx.rotate(centerAngle);
      ctx.textAlign = "right";
      ctx.fillStyle = sector.textColor ? sector.textColor : "#fff";
      ctx.font = "bold 30px sans-serif";
      ctx.fillText(sector.label, rad - 10, 10);
      ctx.restore();
    }
  });
}

drawAll();

// Weighted random selection based on probabilities.
function weightedRandom() {
  let totalProb = sectors.reduce((sum, s) => sum + s.prob, 0);
  let rnd = Math.random() * totalProb;
  for (let i = 0; i < sectors.length; i++) {
    rnd -= sectors[i].prob;
    if (rnd <= 0) return i;
  }
  return sectors.length - 1;
}

let isSpinning = false;
let hasAlreadySpinned = false;
let ang = 0; // current rotation angle in radians

// Rotate the canvas with a CSS transform.
// The transform offset (-π/2) ensures that when no additional rotation is applied,
// the 0° drawn (to the right) appears at the top.
function rotate() {
  canvas.style.transform = `rotate(${ang - PI / 2}rad)`;
}

spin.addEventListener("click", async () => {
  if (hasAlreadySpinned) {
    // TODO: Add text.
    return;
  }
  if (isSpinning) return;
  hasAlreadySpinned = true;
  isSpinning = true;
  spin.textContent = '';

  // Select the winning sector using weighted probabilities.
  const winningIndex = weightedRandom();
  const winningSector = sectors[winningIndex];

  // TODO: Uncomment this code. It sends the results to Oleg's bot.
  // await sendTelegramMessage(winningSector.label);

  // Calculate the center angle of the winning sector.
  const sectorCenter = winningSector.startAngle + winningSector.arc / 2;

  // For the winning sector to appear at the top (arrow position),
  // we require that after rotation the winning sector's center becomes -π/2.
  // Since the effective angle = sectorCenter + (ang - π/2),
  // we set: sectorCenter + (finalAng - π/2) = -π/2  ==> finalAng = -sectorCenter.
  let current = ang % TAU;
  let target = -sectorCenter;
  // Ensure the target is ahead of the current angle by adding full rotations.
  while (target < current) {
    target += TAU;
  }
  // Add extra spins for dramatic effect.
  target += 5 * TAU;

  // Animate the spin.
  const duration = 5000; // milliseconds
  let startTime = null;

  function animateSpin(timestamp) {
    if (!startTime) startTime = timestamp;
    let elapsed = timestamp - startTime;
    let t = Math.min(elapsed / duration, 1); // Normalize to [0,1]
    // Ease-out cubic easing.
    let eased = 1 - Math.pow(1 - t, 3);
    ang = current + (target - current) * eased;
    rotate();
    if (t < 1) {
      requestAnimationFrame(animateSpin);
    } else {
      isSpinning = false;
      spin.style.background = winningSector.color;
      const resultElem = document.getElementById("result");
      if (winningSector.label === 'Lose') {
        resultElem.textContent = "Mai încearcă altă dată"
      } else {
        switch (winningSector.label) {
          case "Game":
            resultElem.textContent = "Вы выиграли: Игру до 500 UAH";
            break;
          case "Moderka":
            resultElem.textContent = "Вы выиграли: VIP статус";
            break;
          case "Premium":
            resultElem.textContent = "Вы выиграли: Premium на месяц";
            break;
          case "Deluxe":
          case "Esential":
          case "Extra":
            resultElem.textContent = "Вы выиграли: " + winningSector.label + " на месяц";
            break;
        }
      }
      resultElem.style.display = "block";
    }
  }
  requestAnimationFrame(animateSpin);
});

// const sendTelegramMessage = async (winningItem) => {
//   try {
//     const message = encodeURIComponent(
//       `Новый победитель!\n` +
//       `Telegram-тег: test\n` +
//       `Выпавший сегмент: ${winningItem}`
//     );

//     const response = await fetch(
//       `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${adminChatId}&text=${message}`,
//       { method: 'GET' }
//     );

//     const data = await response.json();
//     if (data.ok) {
//       alert('Ваш Telegram-тег и результат отправлены администратору!');
//     } else {
//       alert('Ошибка при отправке в Телеграм. Попробуйте еще раз.');
//     }
//   } catch (error) {
//     console.log(error);
//     alert('Ошибка сети. Проверьте подключение к интернету.');
//   }
// }
