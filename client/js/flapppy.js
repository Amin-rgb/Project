var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
var bird = { x: 100, y: 190, w: 40, h:40 }
var gravity = 8;
var initialForce = 30;
var force = initialForce;
var gameOver = false;
var tubesTop = [{ x: 150, y: 0, w: 30, h: 100 }]
var tubesBottom = [{ x: 150, y: 220, w: 30, h: 200 }]
var bg1 = { x: 0 }
var bg2 = { x: 0 }
var bg3 = { x: 0 }

background1 = new Image();
background1.src = '1.png'

background2 = new Image();
background2.src = '2.png'

background3 = new Image();
background3.src = '3.png'


var tube = new Image();
tube.src = 'Pipe.png';

var flappy = new Image()
flappy.src = 'flappy.png'

var bottomTube = new Image()
bottomTube.src = "bottomPipe.png"

initializeTubes();

function draw() {
	ctx.fillStyle = "#00ffff"
	ctx.fillRect(0, 0, 800, 420)

	ctx.drawImage(background1, bg1.x, 0, 1600, 480)


	if (bg1.x < -800) {
		ctx.drawImage(background1, bg1.x + 1600, 0, 1600, 480)

	}
	if (bg1.x < -1600) {
		bg1.x = 3
	}

	ctx.drawImage(background2, bg2.x, 0, 1600, 480)
	if (bg2.x < -800) {
		ctx.drawImage(background2, bg2.x + 1600, 0, 1600, 480)

	}
	if (bg2.x < -1600) {
		bg2.x = 3
	}

	ctx.drawImage(background3, bg3.x, 0, 1600, 480)
	if (bg3.x < -800) {
		ctx.drawImage(background3, bg3.x + 1600, 0, 1600, 480)

	}
	if (bg3.x < -1600) {
		bg3.x = 3
	}

	ctx.fillStyle = "#00ffff"
	ctx.fillRect(bird.x,bird.y, bird.w,bird.h)
 
	ctx.save();

	if (force > 0) {
		ctx.translate(bird.x-30, bird.y+15 );
		ctx.rotate(320 * Math.PI / 180);

	}

	else {
		ctx.translate(bird.x+15, bird.y-30 );
		ctx.rotate(40 * Math.PI / 180);
	}
  
	ctx.drawImage(flappy, 0, 0, bird.w+30 , bird.h+30 )

	ctx.restore()

	if (gameOver == true) {
		ctx.fillText('Game over', 150, 200)

	}
	var i;
	for (i = 0; i < tubesTop.length; i++) {
		ctx.drawImage(tube, tubesTop[i].x, tubesTop[i].y, tubesTop[i].w, tubesTop[i].h)
	}

	var i;
	for (i = 0; i < tubesBottom.length; i++) {
		ctx.drawImage(bottomTube, tubesBottom[i].x, tubesBottom[i].y, tubesBottom[i].w, tubesBottom[i].h)
	}
}

function initializeTubes() {
	push()
	push()
	push()
	push()
	push()
	push()
	push()
	push()
	push()
	push()
	push()
	push()
	push()
	push()
}

function push() {

	// randomNumber + 80 = $  420-$
	var randomNumber = Math.round(Math.random() * 170 + 70)
	tubesTop.push({ x: tubesTop[tubesTop.length - 1].x + 150, y: 0, w: 30, h: randomNumber })

	var math = Math.random()
	//randomNumber = 238	math = 0.311
	var randomNumberBottom = Math.round(math * (420 - (200 + 120)) + 40)

	tubesBottom.push({ x: tubesBottom[tubesBottom.length - 1].x + 150, y: 420 - randomNumberBottom, w: 30, h: randomNumberBottom })

}


function update() {
	var i;
	for (i = 0; i < tubesTop.length; i++) {
		tubesTop[i].x = tubesTop[i].x - 8
	}

	var i
	for (i = 0; i < tubesBottom.length; i++) {
		tubesBottom[i].x = tubesBottom[i].x - 8

	}



	bg1.x = bg1.x - 1
	bg2.x = bg2.x - 5
	bg3.x = bg3.x - 6

	bird.y = bird.y - force
	force = force - gravity

	if (force < -20) { force = -20 }

	if (bird.y > 400) {
		gameOver = true;
	}


	var i;
	for (i = 0; i < tubesTop.length; i++) {
		if (bird.x + bird.h > tubesTop[i].x && bird.y < tubesTop[i].y + tubesTop[i].h && tubesTop[i].w + tubesTop[i].x > bird.x) {
			gameOver = true
		}
	}
// {x: 134, y: 220, w: 30, h: 200}
// {x: 134, y: 220,40,40}
	var i;
	for (i = 0; i < tubesBottom.length; i++) {
		if (bird.x + bird.w > tubesBottom[i].x && bird.y + bird.h > tubesBottom[i].y && tubesBottom[i].x+tubesBottom[i].h>bird.x) 
		{
			gameOver = true;
		}
	}
//{x: 126, y: 220, w: 30, h: 200}

//x: 100 y: 124 w: 40 h: 40//
	

	var i;
	for (i = 0; i < tubesTop.length; i++) {
		if (tubesTop[i].w + tubesTop[i].x <= 0) {
			tubesTop.splice(0, 1);
			push()
		}
	}


	var i;
	for (i = 0; i < tubesBottom.length; i++) {
		if (tubesBottom[i].w + tubesBottom[i].x <= 0) {
			tubesBottom.splice(0, 1);
			push()
		}
	}


}

document.addEventListener("keydown", function (e) {

	if (e.key == ' ') {
		force = initialForce
	}
});


var timer = setInterval(function () {
	if (gameOver == false) {
		update()
		draw()
	}
}, 80);