console.log('WebSocket connecting to:', location.host);
const ws = new WebSocket(`ws://${location.host}`);

let clientName = null;
const users = {}; // userId -> { name, boxElement }

const sentBox = document.getElementById('sentBox');
const receivedContainer = document.getElementById('receivedContainer');

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playBeep(duration = 100, freq = 600) {
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.frequency.value = freq;
  oscillator.type = 'sine'; // or 'square' for a more Morse-code-like tone
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();

  setTimeout(() => {
    oscillator.stop();
  }, duration);
}


function registerName() {
  const nameInput = document.getElementById('nameInput');
  const name = nameInput.value.trim();
  if (name) {
    clientName = name;
    alert(`Name set to ${clientName}`);
  }
}

function sendSymbol(symbol) {
  if (!clientName) {
    alert('Please enter your name first.');
    return;
  }

  ws.send(JSON.stringify({
    name: clientName,
    symbol: symbol
  }));
  

  sentBox.textContent += symbol;

  if (symbol === '.') playBeep(100, 600);
  if (symbol === '-') playBeep(300, 600);
}

function sendDit() { sendSymbol('.'); }
function sendDah() { sendSymbol('-'); }
function sendSpace() { sendSymbol(' '); }

function clearMessages() {
  sentBox.textContent = '';
  receivedContainer.innerHTML = '';
  Object.keys(users).forEach(id => delete users[id]);
}

function createUserBox(userId, name) {
  const label = document.createElement('div');
  label.className = 'label';
  label.textContent = `👤 ${name}`;

  const box = document.createElement('div');
  box.className = 'box';
  box.id = `box-${userId}`;

  receivedContainer.appendChild(label);
  receivedContainer.appendChild(box);

  users[userId] = { name, box };
}

ws.onmessage = async (event) => {
  const msg = JSON.parse(typeof event.data === "string"
    ? event.data
    : await event.data.text());

    const { name, symbol } = msg;

  if (name === clientName) return;

  if (!users[name]) {
    createUserBox(name, name || 'Unknown');
    }
    
    users[name].box.textContent += symbol;

  if (symbol === '.') playBeep(100, 600);
  if (symbol === '-') playBeep(300, 600);
};
