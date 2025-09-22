let offset = 0;
let speed = 0.3;
let baseDash = 30;
let baseGap = 60;
let variation = 0.8;
let scale = 0.5;
let patternCache = {};
let c1, c2, c3;

// coordenadas aproximadas dos vértices
let points = [];
let logos = [];

function setup() {
  createCanvas(600, 600);
  strokeWeight(1);

  // cores do gradiente
  c1 = color(33, 150, 243);
  c2 = color(33, 45, 243);
  c3 = color(126, 33, 243);

  // Definir os pontos do símbolo baseado na imagem
createNexyLogoShape(10, 10);
createNexyLogoShape(110, 172.5);
createNexyLogoShape(230, -2.5);
createNexyLogoShape(330, 160);
}

function createNexyLogoShape(x, y){
  logos.push([
    // Triângulo inferior esquerdo
    createVector(x, y+(200 * scale)),
    createVector(x+(170 * scale), y+(300 * scale)),
    createVector(x, y+(400 * scale)),
    createVector(x, y+(200 * scale)),

    // Triângulo superior direito
    createVector(x+(230 * scale), y+(100 * scale)),
    createVector(x+(400 * scale), y),
    createVector(x+(400 * scale), y+(200 * scale)),
    createVector(x+(230 * scale), y+(100 * scale)),

    // Barra diagonal
    createVector(x, y+(150 * scale)),
    createVector(x, y),
    createVector(x+(400 * scale), y+(250 * scale)),
    createVector(x+(400 * scale), y+(400 * scale)),
    createVector(x, y+(150 * scale)),
  ])
}

function drawShape(){
  logos.forEach((logo)=>{
    logo.forEach((point, i)=>{
      if(i< logo.length - 1 && i !== 3 && i !== 7) dashedLine(logo[i].x, logo[i].y, logo[i+1].x, logo[i+1].y, baseDash, baseGap, variation, c1, c2, c3, offset);
    })
  })
}

function draw() {
  background(240);
  drawShape();
  offset += speed;
}

// Reutilizando a função de linha tracejada com gradiente de 3 cores
function dashedLine(x1, y1, x2, y2, baseDash, baseGap, variation, c1, c2, c3, offset) {
  let distance = dist(x1, y1, x2, y2);
  let angle = atan2(y2 - y1, x2 - x1);

  let key = `${x1},${y1},${x2},${y2},${baseDash},${baseGap},${variation}`;
  if (!patternCache[key]) {
    patternCache[key] = generatePattern(distance, baseDash, baseGap, variation);
  }

  let pattern = patternCache[key].pattern;
  let totalPattern = patternCache[key].total;
  let off = offset % totalPattern;

  let pos = -off;
  let idx = 0;

  while (pos < distance) {
    let seg = pattern[idx];
    let start = max(pos, 0);
    let end = min(pos + seg.length, distance);

    if (seg.type === 'dash' && end > 0) {
      let steps = int((end - start) / 2);
      for (let i = 0; i < steps; i++) {
        let t1 = map(start + (i * 2), 0, distance, 0, 1);
        let t2 = map(start + ((i + 1) * 2), 0, distance, 0, 1);

        let col;
        let t = (t1 + t2) / 2;
        if (t < 0.5) {
          col = lerpColor(c1, c2, t / 0.5);
        } else {
          col = lerpColor(c2, c3, (t - 0.5) / 0.5);
        }
        stroke(col);

        let xStart = x1 + cos(angle) * (start + (i * 2));
        let yStart = y1 + sin(angle) * (start + (i * 2));
        let xEnd = x1 + cos(angle) * (start + ((i + 1) * 2));
        let yEnd = y1 + sin(angle) * (start + ((i + 1) * 2));

        line(xStart, yStart, xEnd, yEnd);
      }
    }

    pos += seg.length;
    idx = (idx + 1) % pattern.length;
  }
}

function generatePattern(distance, baseDash, baseGap, variation) {
  let pattern = [];
  let total = 0;
  let target = max(distance * 1.2, 200);

  let safety = 0;
  while (total < target && safety < 1000) {
    let dash = baseDash * random(1 - variation, 1 + variation);
    pattern.push({ type: 'dash', length: dash });
    total += dash;

    let gap = baseGap * random(1 - variation, 1 + variation);
    pattern.push({ type: 'gap', length: gap });
    total += gap;

    safety++;
  }

  return { pattern: pattern, total: total };
}
