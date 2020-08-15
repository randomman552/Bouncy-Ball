const bounds = {
	bottom: 10,
	left: 10,
	top: 10,
	right: 10
};

const zoomScalar = 20;

const forceLine = {
	enabled: false,

	initial: {
		x: null,
		y: null
	},
	final: {
		x: null,
		y: null
	},

	/**
	 * Draw the force element on the canvas.
	 * @param {CanvasRenderingContext2D} ctx The canvas context to draw on.
	 * @param {Number} zoom The amount to multiply the size of the force line by.
	 * Offsets are used as the origin for this drawing operation.
	 * @param {Number} xOffset The offset along the X axis.
	 * @param {Number} yOffset The offset along the Y axis.
	 */
	draw: function(ctx, zoom = 1, xOffset = 0, yOffset = 0) {
		if (this.enabled && this.final.x && this.final.y) {
			const x = ball.pos.x * zoom + xOffset;
			const y = ball.pos.y * zoom + yOffset;
			const x2 = x + (this.initial.x - this.final.x);
			const y2 = y + (this.initial.y - this.final.y);
			ctx.beginPath();
			ctx.moveTo(x, y);
			ctx.lineTo(x2, y2);
			ctx.stroke();
			ctx.closePath();
		}
	},

	/**
	 * Reset the force line to it's initial state
	 */
	reset: function() {
		this.initial.x = null;
		this.initial.y = null;
		this.final.x = null;
		this.final.y = null;
	}
};

const ball = {
	pos: {
		x: 0,
		y: 0
	},
	velocity: {
		x: 0,
		y: 0
	},
	mass: 5,
	radius: 1,
	/** The velocity multiplier applied when the ball bounces */
	bounceMult: 0.5,
	drawStyle: {
		/** The fill style applied to the ball when it is drawn. */
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
	 * @param {Number} numSamples The number of samples to take across the time period (defaults to 100).
	 */
	applyAccel: function(x, y, timePeriod = 0, numSamples = 100) {
		if (timePeriod == 0) {
			this.velocity.x += x;
			this.velocity.y += y;
		} else {
			const xPer = x / numSamples;
			const yPer = y / numSamples;
			let i = 0;
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
	 * Draw the ball on the canvas.
	 * @param {CanvasRenderingContext2D} ctx The canvas context to draw on.
	 * @param {Number} zoom The amount to multiply the size of the force line by.
	 * Offsets are used as the origin for this drawing operation.
	 * @param {Number} xOffset The offset along the X axis.
	 * @param {Number} yOffset The offset along the Y axis.
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

		//Y collisions
		if (this.pos.y + this.radius + yVel >= bounds.bottom) {
			//Bottom collision
			//Scale the vel down by the distance to the wall, so that we can realistically bounce off it, instead of bouncing off the air near it.
			//We only do this when the yVel is higher than 0.1, as this prevents the ball from jittering on the surface.
			if (Math.abs(yVel) >= 0.1) {
				let wallDis = this.pos.y + this.radius - bounds.bottom;
				yVel *= wallDis / yVel;
				ball.pos.y = bounds.bottom - this.radius;
			}

			this.velocity.y *= -this.bounceMult;
			yVel *= timePassed / 1000 * -this.bounceMult;
		} else if (this.pos.y - this.radius + yVel <= -bounds.top) {
			//Top collision
			if (Math.abs(yVel) >= 0.1) {
				let wallDis = this.pos.y - this.radius + bounds.top;
				yVel *= wallDis / yVel;
				ball.pos.y = -bounds.top + this.radius;
			}

			this.velocity.y *= -this.bounceMult;
			yVel *= timePassed / 1000 * -this.bounceMult;
		}

		//X collisions
		if (this.pos.x + this.radius + xVel >= bounds.right) {
			//Right collision
			if (Math.abs(xVel) >= 0.1) {
				let wallDis = this.pos.x + this.radius - bounds.right;
				xVel *= wallDis / xVel;
				ball.pos.x = bounds.right - this.radius;
			}

			this.velocity.x *= -this.bounceMult;
			xVel *= timePassed / 1000 * -this.bounceMult;
		} else if (this.pos.x - this.radius + xVel <= -bounds.left) {
			//Left collision
			if (Math.abs(xVel) >= 0.1) {
				let wallDis = this.pos.x - this.radius + bounds.left;
				xVel *= wallDis / xVel;
				ball.pos.x = -bounds.left + this.radius;
			}

			this.velocity.x *= -this.bounceMult;
			xVel *= timePassed / 1000 * -this.bounceMult;
		}
		this.pos.x += xVel;
		this.pos.y += yVel;
	}

	//#endregion
};

const fps = 144;

//#region Canvas setup

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let drawOffset = [canvas.width / 2, canvas.height / 2];

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

	//If ball is out of bounds, move it back in bounds
	//#region Bound corrections

	//Right bound
	if (ball.pos.x + ball.radius >= bounds.right) {
		ball.pos.x = bounds.right - ball.radius;
	}
	//Left bound
	if (ball.pos.x - ball.radius <= -bounds.left) {
		ball.pos.x = -bounds.left + ball.radius;
	}
	//Bottom bound
	if (ball.pos.y + ball.radius >= bounds.bottom) {
		ball.pos.y = bounds.bottom - ball.radius;
	}
	//Top bound
	if (ball.pos.y - ball.radius <= -bounds.top) {
		ball.pos.y = -bounds.top + ball.radius;
	}

	//#endregion

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

	//Draw force indicator line
	forceLine.draw(ctx, zoomScalar, drawOffset[0], drawOffset[1]);

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

let gravity = 9.81;

function applyGravity() {
	ball.applyAccel(0, gravity, 1000, fps);
}
setInterval(applyGravity, 1000);
applyGravity();

//#endregion

//#region Ball control

/**
 * Start the ball force application.
 * @param {Number} x The x coordinate we are starting from.
 * @param {Number} y The y coordinate we are starting from.
 */
function handleStart(x, y) {
	forceLine.initial.x = x;
	forceLine.initial.y = y;
	forceLine.final.x = x;
	forceLine.final.y = y;
	forceLine.enabled = true;
}

/**
 * Update the final x and y positions for the force application.
 * @param {Number} x The new X coordinate of the cursor.
 * @param {Number} y The new Y coordinate of the cursor.
 */
function handleMove(x, y) {
	forceLine.final.x = x;
	forceLine.final.y = y;
}

/**
 * Apply the final force vector.
 */
function handleEnd() {
	//Apply the required force to the ball
	let xForce = (forceLine.initial.x - forceLine.final.x) / ball.mass;
	let yForce = (forceLine.initial.y - forceLine.final.y) / ball.mass;
	ball.applyAccel(xForce, yForce);

	forceLine.enabled = false;
	forceLine.reset();
}

//Event handler for normal pointers
canvas.addEventListener('pointerdown', (e) => {
	e.preventDefault();
	handleStart(e.x, e.y);

	function pointerMove(e) {
		e.preventDefault();
		handleMove(e.x, e.y);
	}

	function pointerEnd(e) {
		e.preventDefault();
		handleEnd();

		//Remove event listeners
		canvas.removeEventListener('pointermove', pointerMove);
		canvas.removeEventListener('pointerup', pointerEnd);
		canvas.removeEventListener('pointerout', pointerEnd);
		canvas.removeEventListener('pointercancel', pointerEnd);
	}

	canvas.addEventListener('pointermove', pointerMove);

	canvas.addEventListener('pointerup', pointerEnd);

	canvas.addEventListener('pointerout', pointerEnd);

	canvas.addEventListener('pointercancel', pointerEnd);
});

//Event handler for touch devices
canvas.addEventListener('touchstart', (e) => {
	e.preventDefault();

	//Get the touch object
	e = e.changedTouches[0];
	handleStart(e.clientX, e.clientY);

	function touchMove(e) {
		e.preventDefault();

		//Get the touch object
		e = e.changedTouches[0];

		handleMove(e.clientX, e.clientY);
	}

	function touchEnd(e) {
		e.preventDefault();
		handleEnd();

		canvas.removeEventListener('touchmove', touchMove);
		canvas.removeEventListener('touchend', touchEnd);
		canvas.removeEventListener('touchcancel', touchEnd);
	}

	canvas.addEventListener('touchmove', touchMove);
	canvas.addEventListener('touchend', touchEnd);
	canvas.addEventListener('touchcancel', touchEnd);
});

//#endregion

//#region Ball edit events

/** Input used to set the mass of the ball */
const massEdit = document.getElementById('ball-mass');

/** Input used to set the acceleration due to gravity */
const gravEdit = document.getElementById('ball-gravity');

/** Input used to set the balls bounce multiplier */
const bounceEdit = document.getElementById('ball-bounce%');

/** Reset button is used to reset the position and velocity of the ball */
const resetPos = document.getElementById('ball-reset-pos');

//Apply default values
massEdit.value = ball.mass;
gravEdit.value = gravity / 9.81;
bounceEdit.value = ball.bounceMult * 100;

massEdit.addEventListener('input', () => {
	ball.mass = Number(massEdit.value);
});

gravEdit.addEventListener('input', () => {
	gravity = Number(gravEdit.value) * 9.81;
});

bounceEdit.addEventListener('input', () => {
	ball.bounceMult = Number(bounceEdit.value) / 100;
});

resetPos.addEventListener('click', () => {
	ball.pos = {
		x: 0,
		y: 0
	};
	ball.velocity = {
		x: 0,
		y: 0
	};
});

//#endregion
