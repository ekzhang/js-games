var width, height, mines;
var data;
var alive;
var firstMove;
var timerIntervalId, time;

function makeBoard() {
  var hasMine = [];
  for (let i = 0; i < width; i++) {
    hasMine.push([]);
    for (let j = 0; j < height; j++) {
      hasMine[i].push(0);
    }
  }

  var numMines = 0;
  while (numMines < mines) {
    let x = Math.floor(Math.random() * width);
    let y = Math.floor(Math.random() * height);
    if (!hasMine[x][y]) {
      hasMine[x][y] = true;
      numMines++;
    }
  }

  var data = [];
  for (let i = 0; i < width; i++) {
    data.push([]);
    for (let j = 0; j < height; j++) {
      var ct = 0;
      for (let x = i - 1; x <= i + 1; x++) {
        for (let y = j - 1; y <= j + 1; y++) {
          if (x >= 0 && x < width && y >= 0 && y < height) {
            ct += hasMine[x][y];
          }
        }
      }

      data[i].push({
        x: i,
        y: j,
        f: false,
        c: true,
        m: hasMine[i][j],
        n: ct
      });
    }
  }
  
  return data;
}

function pad(x, d) {
  if (x < 0) {
    return '-' + pad(-x, d - 1);
  }
  s = x.toString();
  while (s.length < d) {
    s = '0' + s;
  }
  s = s.substr(s.length - d);
  return s;
}

function updateClock() {
  d3.select('.timer').text(pad(time, 3));
}

function startClock() {
  if (timerIntervalId === undefined) {
    timerIntervalId = setInterval(() => { time++; updateClock(); }, 1000);
  }
}

function stopClock() {
  if (timerIntervalId !== undefined) {
    clearInterval(timerIntervalId);
    timerIntervalId = undefined;
  }
}

function reveal(x, y) {
  if (x < 0 || y < 0 || x >= width || y >= height)
    return;

  if (!data[x][y].c || data[x][y].f)
    return;

  if (firstMove) {
    firstMove = false;
    while (data[x][y].n) {
      data = makeBoard();
    }
    startClock();
  }
  
  data[x][y].c = false;
  if (data[x][y].m) {
    alive = false;
  }
  if (data[x][y].n == 0) {
    reveal(x - 1, y - 1);
    reveal(x - 1, y);
    reveal(x - 1, y + 1);
    reveal(x, y - 1);
    reveal(x, y + 1);
    reveal(x + 1, y - 1);
    reveal(x + 1, y);
    reveal(x + 1, y + 1);
  }
}

function hasWon() {
  for (let row of data) {
    for (let cell of row) {
      if (!cell.m && cell.c)
        return false;
    }
  }
  return true;
}

function update() {
  var grid = d3.select('#grid');
  
  var row = grid.selectAll('tr').data(data);
  row.exit().remove();
  row = row.enter().append('tr')
    .classed('row', true)
    .merge(row);
  
  var cell = row.selectAll('td')
    .data(function(d) { return d; });
  
  cell.exit().remove();
  
  cell.enter().append('td')
    .classed('cell', true)
    .merge(cell)
      .classed('covered', function(d) { return d.c; })
      .classed('mine', function(d) { return !alive && d.m; })
      .classed('flag', function(d) { return d.f; })
      .text(function(d) {
        if (!alive && d.m) return '\uf1e2';
        if (d.f) return '\uf024';
        return d.c || d.m || !d.n ? '' : d.n;
      })
      .style('color', function(d) {
        if (d.c || d.m) return null;
        if (d.n === 1) return 'blue';
        if (d.n === 2) return 'green';
        if (d.n === 3) return 'red';
        if (d.n === 4) return 'purple';
        if (d.n === 5) return 'maroon';
        if (d.n === 6) return 'turquoise';
        if (d.n === 7) return 'black';
        if (d.n === 8) return 'grey';
        return null;
      })
      .on('click', function(d) {
        if (alive) {
          reveal(d.x, d.y);
          update();
        }
      })
      .on('contextmenu', function(d) {
        d3.event.preventDefault();
        if (alive && !firstMove && d.c) {
          d.f = !d.f;
          update();
        }
      });
  
  var numFlags = d3.selectAll('.cell.flag').size();
  d3.select('.mines').text(pad(mines - numFlags, 3));
  
  var resetButton = d3.select('.reset-button');
  resetButton.text(alive ? '\uf118' : '\uf119');
  if (hasWon()) {
    resetButton.text('\uf005');
    alive = false;
  }
  
  if (!alive) stopClock();
  updateClock();
}

function play(w, h, m) {
  width = w;
  height = h;
  mines = m;
  data = makeBoard();
  alive = true;
  firstMove = true;
  stopClock();
  time = 0;
  update();
}

play(16, 16, 40);
