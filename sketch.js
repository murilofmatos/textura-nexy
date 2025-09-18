let offset = 0;
let speed = 2;
let patternCache = {};
let c1, c2, c3;

// coordenadas aproximadas dos vértices
let points = [];

function setup() {
  createCanvas(600, 600);
  strokeWeight(4);

  // cores do gradiente
  c1 = color(255, 0, 0);
  c2 = color(0, 255, 0);
  c3 = color(0, 0, 255);

  // Definir os pontos do símbolo baseado na imagem
  points = [
    // Triângulo inferior esquerdo
    createVector(100, 400),
    createVector(250, 400),
    createVector(100, 550),
    createVector(100, 400),

    // Triângulo superior direito
    createVector(350, 150),
    createVector(500, 150),
    createVector(500, 300),
    createVector(350, 150),

    // Barra diagonal
    createVector(120, 420),
    createVector(480, 180)
  ];
}

function draw() {
  background(240);

  // Triângulo inferior esquerdo
  dashedLine(points[0].x, points[0].y, points[1].x, points[1].y, 12, 6, 0.4, c1, c2, c3, offset);
  dashedLine(points[1].x, points[1].y, points[2].x, points[2].y, 12, 6, 0.4, c1, c2, c3, offset);
  dashedLine(points[2].x, points[2].y, points[3].x, points[3].y, 12, 6, 0.4, c1, c2, c3, offset);

  // Triângulo superior direito
  dashedLine(points[4].x, points[4].y, points[5].x, points[5].y, 12, 6, 0.4, c1, c2, c3, offset);
  dashedLine(points[5].x, points[5].y, points[6].x, points[6].y, 12, 6, 0.4, c1, c2, c3, offset);
  dashedLine(points[6].x, points[6].y, points[7].x, points[7].y, 12, 6, 0.4, c1, c2, c3, offset);

  // Barra diagonal
  dashedLine(points[8].x, points[8].y, points[9].x, points[9].y, 12, 6, 0.4, c1, c2, c3, offset);

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
