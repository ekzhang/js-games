var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var width = canvas.width;
var height = canvas.height;

const G_ACCEL = 0.2;
const PLAYER_SIZE = 25;
const PIPE_GAP = 160;
const PIPE_WIDTH = 35;
const PIPE_SPACING = 200;
const PIPE_OFFSET = 350;

var player = {};
var pipes = [];

function setup() {
  // Code run on game start: initialize variables, etc.
  player.x = 0;
  player.y = 200;
  player.vx = 2;
  player.vy = 0;

  pipes = [];
  for (var i = 0; i < 1000; i++) {
    var yPos = Math.random() * (height - PIPE_GAP);
    pipes.push({
      x: PIPE_OFFSET + PIPE_SPACING * i,
      y1: yPos,
      y2: yPos + PIPE_GAP,
    });
  }
}

function hasCollided() {
  if (player.y > height)
    return true;
  for (var pipe of pipes) {
    if (player.x > pipe.x - PLAYER_SIZE && player.x < pipe.x + PIPE_WIDTH) {
      if (player.y < pipe.y1 || player.y + PLAYER_SIZE > pipe.y2) {
        return true;
      }
    }
  }
  return false;
}

function draw() {
  // Function that is run every frame
  player.vy += G_ACCEL;
  player.x += player.vx;
  player.y += player.vy;

  if (hasCollided()) {
    setup();
  }

  var shift = player.x - 60;
  ctx.fillStyle = 'orange';
  ctx.fillRect(player.x - shift, player.y, PLAYER_SIZE, PLAYER_SIZE);
  for (var pipe of pipes) {
    ctx.fillStyle = 'forestgreen';
    ctx.fillRect(pipe.x - shift, 0, PIPE_WIDTH, pipe.y1);
    ctx.fillRect(pipe.x - shift, pipe.y2, PIPE_WIDTH, height - pipe.y2);
  }

  var score = Math.ceil((player.x - PIPE_OFFSET) / PIPE_SPACING);
  if (score < 0)
    score = 0;
  ctx.font = "52px Impact";
  ctx.textAlign = "center";
  ctx.fillStyle = "white";
  ctx.lineWidth = 2;
  ctx.fillText(score, width / 2, 60);
  ctx.strokeText(score, width / 2, 60);
}

function mousePressed() {
  // Logic for when the mouse is clicked
  player.vy = -6;
}





/* You don't have to understand any code below this line */

function onClick(e) {
  e.preventDefault();
  mousePressed();
}

canvas.addEventListener("mousedown", onClick);
canvas.addEventListener("touchstart", onClick);

setup();
requestAnimationFrame(function mainLoop() {
  ctx.clearRect(0, 0, width, height);
  draw();
  requestAnimationFrame(mainLoop);
});