const canvasSize = 512;
const elementWith = 16;
const defaultColor = 'rgb(255,255,255)';
let drawingAllowed = false;
let drawingPoints = [];

if (!localStorage.currentTool) localStorage.currentTool = 'pencil';
if (!localStorage.color) localStorage.color = defaultColor;

const canvas = document.querySelector('#draw-canvas');
const prevcolor = document.querySelector('#prevcolor');
const currentcolor = document.querySelector('#currentcolor');
const customcolor = document.querySelector('#customcolor');
const tools = document.querySelector('#tools');
const pencil = document.querySelector('#pencil');
const fill = document.querySelector('#fill');
const choose = document.querySelector('#choose');
const clean = document.querySelector('#clean');
const defred = document.querySelector('#defred');
const defblue = document.querySelector('#defblue');
const ctx = canvas.getContext('2d');
const downloadButton = document.querySelector('#download');
const accessKey = '92cc2d3a05679a6430d41064c9193c32cb35af4f36073bb267bff6b74d9812ed';
const invertColors = document.querySelector('#bw');

ctx.clearRect(0, 0, canvasSize, canvasSize);

function getColor() {
  return localStorage.color;
}

function drawBrezenhem(x0, y0, x1, y1) {
  let swither = true;
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = (x0 < x1) ? 1 : -1;
  const sy = (y0 < y1) ? 1 : -1;
  let err = dx - dy;
  let tempX = x0;
  let tempY = y0;
  while (swither === true) {
    ctx.fillStyle = getColor();
    ctx.fillRect(tempX, tempY, elementWith, elementWith);
    if ((tempX === x1) && (tempY === y1)) swither = false;

    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      tempX += sx;
    }
    if (e2 < dx) {
      err += dx;
      tempY += sy;
    }
  }
}

function canvasDraw(event) {
  if ((!drawingAllowed) || (localStorage.currentTool !== 'pencil')) return;

  const drawX = (Math.floor(event.offsetX / elementWith)) * elementWith;
  const drawY = (Math.floor(event.offsetY / elementWith)) * elementWith;

  if (drawingPoints.length > 0) {
    const lastPoint = drawingPoints.pop();
    drawBrezenhem(lastPoint[0], lastPoint[1], drawX, drawY);
  }
  drawingPoints.push([drawX, drawY]);
}

function saveCanvas() {
  localStorage.setItem('canvasImg', canvas.toDataURL());
}

function drawingDisabled() {
  drawingAllowed = false;
  drawingPoints = [];
  saveCanvas();
}

function drawingEnabled() {
  drawingAllowed = true;
}

function fullFill() {
  if (localStorage.currentTool !== 'fill') return;
  ctx.fillStyle = getColor();
  ctx.fillRect(0, 0, canvasSize, canvasSize);
}


function setColor(color) {
  localStorage.prevColor = localStorage.color;
  prevcolor.querySelector('.marker').style.backgroundColor = `${localStorage.prevColor}`;
  localStorage.color = color;
  currentcolor.querySelector('.marker').style.backgroundColor = `${localStorage.color}`;
}

function setColorAfterReload() {
  if (localStorage.color) { currentcolor.querySelector('.marker').style.backgroundColor = `${localStorage.color}`; }
  if (localStorage.prevColor) { prevcolor.querySelector('.marker').style.backgroundColor = `${localStorage.prevColor}`; }
  if (localStorage.customColor) { customcolor.value = localStorage.customColor; }
}

function setActive() {
  const disableActive = tools.querySelectorAll('.menu-tools__item');
  disableActive.forEach((element) => {
    element.classList.remove('active');
  });
  tools.querySelector(`#${localStorage.currentTool}`).classList.add('active');
}
function pencilTool() {
  localStorage.currentTool = 'pencil';
  setActive();
}

function fillTool() {
  localStorage.currentTool = 'fill';
  setActive();
}

function chooseTool() {
  localStorage.currentTool = 'choose';
  setActive();
}

function pickColor(event) {
  if (localStorage.currentTool !== 'choose') return;
  const pickedColor = getComputedStyle(event.target);
  setColor(pickedColor.backgroundColor || pickedColor.color);
}

function setCanvasAfterReload() {
  if (localStorage.canvasImg) {
    const img = new Image();
    img.src = localStorage.canvasImg;
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
    };
  }
}

function setDefault() {
  setActive();
  setColorAfterReload();
  setCanvasAfterReload();
}

function choosePrevColor() {
  if (localStorage.prevColor) { setColor(localStorage.prevColor); }
}

function chooseDefaultRed() {
  setColor('rgb(255,000,000)');
}

function chooseDefaultBlue() {
  setColor('rgb(000,000,255)');
}

function setCustomColor() {
  localStorage.customColor = customcolor.value;
  setColor(customcolor.value);
}

function hotKeys(event) {
  const eventCode = event.code;
  if (eventCode === 'KeyB') { localStorage.currentTool = 'fill'; }
  if (eventCode === 'KeyC') { localStorage.currentTool = 'choose'; }
  if (eventCode === 'KeyP') { localStorage.currentTool = 'pencil'; }
  setActive();
}

function cleanCanvas() {
  delete localStorage.canvasImg;
  ctx.clearRect(0, 0, canvasSize, canvasSize);
}

function getCity() {
  return document.querySelector('#city').value;
}

async function getImageLink() {
  const searchCity = getCity();
  const url = `https://api.unsplash.com/photos/random?query=town,${searchCity}&client_id=${accessKey}`;
  const response = await fetch(url);
  const imgData = await response.json();
  const imgLink = await imgData.urls.small;
  return imgLink;
}

function drawImageFromLink() {
  let imgHeight = 0;
  let imgWidth = 0;
  let offsetX = 0;
  let offsetY = 0;
  let sizeX = 0;
  let sizeY = 0;
  const imgSourceLink = getImageLink();
  imgSourceLink.then((resData) => {
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = resData;
    img.onload = function () {
      imgWidth = this.width;
      sizeX = imgWidth;
      imgHeight = this.height;
      sizeY = imgHeight;
      if (imgWidth > imgHeight) {
        sizeX = canvasSize;
        sizeY = imgHeight * (1 + ((((canvasSize - imgWidth) * 100) / canvasSize) / 100));
        offsetY = Math.floor((canvasSize - sizeY) / 2);
      } else {
        sizeY = canvasSize;
        sizeX = imgWidth * (1 + ((((canvasSize - imgWidth) * 100) / canvasSize) / 100));
        offsetX = Math.floor((canvasSize - sizeX) / 2);
      }
      ctx.drawImage(img, offsetX, offsetY, sizeX, sizeY);
    };
  });
}

function greyScale() {
  const imgData = ctx.getImageData(0, 0, canvasSize, canvasSize);
  if (imgData.data) {
    for (let i = 0; i < imgData.data.length; i += 4) {
      const avg = (imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) / 3;
      imgData.data[i] = avg;
      imgData.data[i + 1] = avg;
      imgData.data[i + 2] = avg;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}
canvas.addEventListener('mousemove', canvasDraw);
canvas.addEventListener('mousedown', drawingEnabled);
canvas.addEventListener('mouseup', drawingDisabled);
canvas.addEventListener('mouseout', drawingDisabled);
canvas.addEventListener('click', fullFill);
pencil.addEventListener('click', pencilTool);
fill.addEventListener('click', fillTool);
choose.addEventListener('click', chooseTool);
clean.addEventListener('click', cleanCanvas);
canvas.addEventListener('click', pickColor);
document.addEventListener('DOMContentLoaded', setDefault, true);
prevcolor.addEventListener('click', choosePrevColor);
defred.addEventListener('click', chooseDefaultRed);
defblue.addEventListener('click', chooseDefaultBlue);
customcolor.addEventListener('input', setCustomColor);
document.addEventListener('keydown', hotKeys);
currentcolor.addEventListener('click',
  () => document.querySelector('#customcolor').click());
downloadButton.addEventListener('click', drawImageFromLink);
invertColors.addEventListener('click', greyScale);
