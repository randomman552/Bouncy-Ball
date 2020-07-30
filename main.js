const bounds = {
	bottom: 10,
	left: 10,
	top: 10,
	right: 10
};

var zoomScalar = 20;

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
	radius: 1,
	/** The velocity multiplier applied when the ball bounces */
	bounceMult: 0.5,
	drawStyle: {
		/** The fillstyle applied to the ball when it is drawn. */
		fillStyle: 'red',
		/** Whether to draw an outline on the ball. */
		strokeStyle: 'black'
	},

	//#region Convenience methods
	/**
	 * Apply a given acceleration to the ball over the given time period.
	 * @param {Number} x The acceleration to apply on the X axis (m/s/s).
	 * @param {Number} y The acceleration to apply on the Y axis (m/s/s).
	 * @param {Number} timePeriod The time (in milliseconds) to apply this acceleration over (if 0 will be applied all at once). Defaults to 0.
	 * @param {Number} numSamples The number of samples to take accross the time period (defaults to 100).
	 */
	applyAccel: function(x, y, timePeriod = 0, numSamples = 100) {
		if (timePeriod == 0) {
			this.velocity.x += x;
			this.velocity.y += y;
		} else {
			const xPer = x / numSamples;
			const yPer = y / numSamples;
			var i = 0;
			const intervalID = setInterval(() => {
				this.velocity.x += xPer;
				this.velocity.y += yPer;
				i++;
				if (i == numSamples) {
					clearInterval(intervalID);
				}
			}, timePeriod / numSamples);
		}
	},

	/**
	 * Draw the ball on the given canvas context.
	 * @param {Number} xOffset Number of pixels to offset the X axis by
	 * @param {Number} yOffset Number of pixels to offset the Y axis by
	 * @param {CanvasRenderingContext2D} ctx The drawing context to use.
	 * @param {Number} zoom The zoom multiplier.
	 */
	draw: function(xOffset, yOffset, ctx, zoom = 1) {
		let x = this.pos.x * zoom + xOffset;
		let y = this.pos.y * zoom + yOffset;
		ctx.moveTo(x, y + this.radius * zoom);
		ctx.beginPath();
		ctx.arc(x, y, this.radius * zoom, 0, Math.PI * 2);
		ctx.fillStyle = this.drawStyle.fillStyle;
		ctx.fill();
		ctx.strokeStyle = this.drawStyle.strokeStyle;
		ctx.stroke();
	},

	/**
	 * Update the position of the ball depending on it's current velocity.
	 * @param {Number} timePassed The amount of time to simulate (time passed since last update call), defaults to 1000.
	 */
	updatePos: function(timePassed = 1000) {
		let xVel = this.velocity.x * (timePassed / 1000);
		let yVel = this.velocity.y * (timePassed / 1000);
		if (this.pos.y + this.radius + yVel >= bounds.bottom) {
			//Bottom collision
			this.velocity.y = this.velocity.y * -this.bounceMult;
			yVel = this.velocity.y * (timePassed / 1000);
		} else if (this.pos.y - this.radius + yVel <= -bounds.top) {
			this.velocity.y = this.velocity.y * -this.bounceMult;
			yVel = this.velocity.y * (timePassed / 1000);
		} else if (this.pos.x + this.radius + xVel >= bounds.right) {
			this.velocity.x = this.velocity.x * -this.bounceMult;
			xVel = this.velocity.x * (timePassed / 1000);
		} else if (this.pos.x - this.radius + xVel <= -bounds.left) {
			this.velocity.x = this.velocity.x * -this.bounceMult;
			xVel = this.velocity.x * (timePassed / 1000);
		}
		this.pos.x += xVel;
		this.pos.y += yVel;
	}

	//#endregion
};

const fps = 60;

//#region Canvas setup

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

var drawOffset = [ canvas.width / 2, canvas.height / 2 ];

function onResize() {
	canvas.width = document.documentElement.clientWidth;
	canvas.height = document.documentElement.clientHeight;

	//Recalculate draw offset
	drawOffset = [ canvas.width / 2, canvas.height / 2 ];

	//Recalculate collision bounds
	bounds.bottom = canvas.height / 2 / zoomScalar;
	bounds.top = canvas.height / 2 / zoomScalar;
	bounds.left = canvas.width / 2 / zoomScalar;
	bounds.right = canvas.width / 2 / zoomScalar;

	//Reset ball position and velocity
	ball.pos = {
		x: 0,
		y: 0
	};
	ball.velocity = {
		x: 0,
		y: 0
	};

	//Redraw the current frame
	drawFrame();
}
window.addEventListener('resize', onResize);
window.dispatchEvent(new Event('resize'));

//#endregion

//#region Frame drawing
function drawFrame() {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	//Update and draw the ball
	ball.updatePos(1000 / fps);
	ball.draw(drawOffset[0], drawOffset[1], ctx, zoomScalar);

	//Draw the bound rectangle
	ctx.beginPath();
	ctx.strokeStyle = 'cyan';
	ctx.rect(
		drawOffset[0] - bounds.left * zoomScalar,
		drawOffset[1] - bounds.top * zoomScalar,
		(bounds.left + bounds.right) * zoomScalar,
		(bounds.top + bounds.bottom) * zoomScalar
	);
	ctx.stroke();
}

setInterval(drawFrame, 1000 / fps);
//#endregion

//#region Ball gravity
function applyGravity() {
	ball.applyAccel(0, 9.81, 1000, fps);
}
setInterval(applyGravity, 1000);
applyGravity();
//#endregion
