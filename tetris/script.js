/* Constants */
const rows = 20, cols = 10;
const pieces = [
  {
    color: [180, 100, 50],
    positions: [[0, 0], [0, 1], [0, 2], [0, 3]],
    center: [0.5, 1.5]
  }, {
    color: [240, 100, 50],
    positions: [[0, 0], [1, 0], [1, 1], [1, 2]],
    center: [1, 1]
  }, {
    color: [39, 100, 50],
    positions: [[1, 0], [1, 1], [1, 2], [0, 2]],
    center: [1, 1]
  }, {
    color: [60, 100, 50],
    positions: [[0, 0], [1, 0], [1, 1], [0, 1]],
    center: [0.5, 0.5]
  }, {
    color: [120, 100, 50],
    positions: [[1, 0], [1, 1], [0, 1], [0, 2]],
    center: [1, 1]
  }, {
    color: [300, 100, 50],
    positions: [[1, 0], [1, 1], [0, 1], [1, 2]],
    center: [1, 1]
  }, {
    color: [0, 100, 50],
    positions: [[0, 0], [0, 1], [1, 1], [1, 2]],
    center: [1, 1]
  }
];

/* State */
var currentPiece;
var grid;
var loopId;
var score;

function hsl(color, brightness) {
  if (brightness === undefined)
    brightness = 1.0;
  return `hsl(${color[0]}, ${color[1]}%, ${color[2] * brightness}%)`;
}

function getData() {
  const data = [];
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      row.push({
        present: grid[i][j] !== null,
        color: (grid[i][j] ? grid[i][j] : [222, 80, 90])
      });
    }
    data.push(row);
  }
  if (currentPiece) {
    for (const [x, y] of currentPiece.positions) {
      if (x >= 0) {
        data[x][y] = {
          present: true,
          color: currentPiece.color
        };
      }
    }
  }
  return data;
}

function update() {
  const data = getData();

  const grid = d3.select('#grid');
  let row = grid.selectAll('tr').data(data);
  row.exit().remove();
  row = row.enter().append('tr').classed('row', true)
    .merge(row);

  const cell = row.selectAll('td').data(d => d);
  cell.exit().remove();
  cell.enter().append('td').classed('cell', true)
    .merge(cell)
    .style('background', d => hsl(d.color))
    .classed('present', d => d.present)
    .style('border-color', d => {
      if (!d.present)
        return hsl(d.color, 1.05);
      return [
        hsl(d.color, 1.6),
        hsl(d.color, 0.8),
        hsl(d.color, 0.6),
        hsl(d.color, 1.3)].join(' ');
    });

  d3.select('#score').text(score);
}

function free(x, y) {
  return x < 0 || (x < rows && y >= 0 && y < cols && grid[x][y] === null);
}

function shift(dx, dy) {
  for (const [x, y] of currentPiece.positions) {
    if (!free(x + dx, y + dy))
      return false;
  }
  for (const pos of currentPiece.positions) {
    pos[0] += dx;
    pos[1] += dy;
  }
  currentPiece.center[0] += dx;
  currentPiece.center[1] += dy;
  return true;
}

function rotate(ccw) {
  const [cx, cy] = currentPiece.center;
  for (const [x, y] of currentPiece.positions) {
    const x0 = x - cx, y0 = y - cy;
    if (!free(cx - y0, cy + x0))
      return false;
  }
  for (const pos of currentPiece.positions) {
    const x0 = pos[0] - cx, y0 = pos[1] - cy;
    pos[0] = cx + (ccw ? -1 : +1) * y0;
    pos[1] = cy + (ccw ? +1 : -1) * x0;
  }
  return true;
}

function clearRows() {
  for (let i = 0; i < rows; i++) {
    const row = grid[i];
    if (_.every(row)) {
      grid.splice(i, 1);
      grid.splice(0, 0, _.fill(new Array(cols), null));
      ++score;
    }
  }
}

function step() {
  if (currentPiece) {
    if (!shift(+1, 0)) {
      for (const [x, y] of currentPiece.positions) {
        if (x < 0) {
          alert(`Oops! You lost. Final score: ${score}`);
          start();
          return;
        }
        grid[x][y] = currentPiece.color;
      }
      currentPiece = null;
    }
  }
  if (currentPiece === null) {
    currentPiece = _.cloneDeep(_.sample(pieces));
    const offset = Math.floor(
      (cols - 1) / 2 - currentPiece.center[1]);
    if (!shift(0, offset)) {
      alert(`Oops! You lost. Final score: ${score}`);
      start();
      return;
    }
  }
  clearRows();
  update();
}

function restartLoop() {
  clearInterval(loopId);
  loopId = setInterval(step, 600);
  step();
}

function start() {
  currentPiece = null;
  grid = _.times(rows, () => _.fill(new Array(cols), null));
  score = 0;
  restartLoop();
}

document.addEventListener('keydown', function(evt) {
  const code = evt.keyCode;
  if (code === 37)
    shift(0, -1);
  else if (code === 39)
    shift(0, +1);
  else if (code === 40)
    shift(+1, 0);
  else if (code === 88)
    rotate();
  else if (code === 90)
    rotate(true);
  else if (code === 32) {
    while (shift(+1, 0));
    restartLoop();
  }
  update();
});

start();
