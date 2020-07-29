const ball = {
	pos: {
		x: 0,
		y: 0
	},
	velocity: {
		x: 0,
		y: 0
	},
	mass: 0.05,
	radius: 15,
	bounceMult: 0.5
};

const fps = 60;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

var drawOffset = [ canvas.width / 2, canvas.height / 2 ];

function onResize() {
	canvas.width = document.documentElement.clientWidth;
	canvas.height = document.documentElement.clientHeight;

	drawOffset = [ canvas.width / 2, canvas.height / 2 ];
	drawFrame();
}
window.addEventListener('resize', onResize);
window.dispatchEvent(new Event('resize'));

function fixedUpdate() {}

function drawFrame() {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	let x = ball.pos.x + drawOffset[0];
	let y = ball.pos.y + drawOffset[1];
	ctx.moveTo(x, y + ball.radius);
	ctx.beginPath();
	ctx.arc(x, y, ball.radius, 0, Math.PI * 2);
	ctx.fillStyle = 'red';
	ctx.fill();
}

setInterval(drawFrame, 1000 / fps);
