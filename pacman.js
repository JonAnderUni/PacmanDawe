// >=test1
// Variables globales de utilidad
var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");
var w = canvas.width;
var h = canvas.height;

// >=test1
// GAME FRAMEWORK
var GF = function() {

	// >=test2
	// variables para contar frames/s, usadas por measureFPS
	var frameCount = 0;
	var lastTime;
	var fpsContainer;
	var fps;

	// >=test4
	//  variable global temporalmente para poder testear el ejercicio
	inputStates = {
		left: false,
		right: false,
		up: false,
		down: false,
		space: false
	};

	// >=test10
	const TILE_WIDTH = 24, TILE_HEIGHT = 24;
	var numGhosts = 4;
	var ghostcolor = {};
	ghostcolor[0] = "rgba(255, 0, 0, 255)";
	ghostcolor[1] = "rgba(255, 128, 255, 255)";
	ghostcolor[2] = "rgba(128, 255, 255, 255)";
	ghostcolor[3] = "rgba(255, 128, 0,   255)";
	ghostcolor[4] = "rgba(50, 50, 255,   255)"; // blue, vulnerable ghost
	ghostcolor[5] = "rgba(255, 255, 255, 255)"; // white, flashing ghost

	// >=test10
	// hold ghost objects
	var ghosts = {};

	// >=test10
	var Ghost = function (id, ctx) {

		this.x = 0;
		this.y = 0;
		this.velX = 0;
		this.velY = 0;
		this.speed = 1;

		this.nearestRow = 0;
		this.nearestCol = 0;

		this.ctx = ctx;

		this.id = id;
		this.homeX = 0;
		this.homeY = 0;

		this.draw = function () {
			// test10
			// Tu código aquí
			// Pintar cuerpo de fantasma
			// Pintar ojos

			this.ctx.beginPath();

			this.ctx.moveTo(this.x, this.y + TILE_HEIGHT);
			this.ctx.quadraticCurveTo(this.x + (TILE_WIDTH / 2), this.y / 1.05, this.x + TILE_WIDTH, this.y + TILE_HEIGHT);
			this.ctx.fillStyle = ghostcolor[this.id];
			this.ctx.closePath();
			this.ctx.fill();

			this.ctx.beginPath();
			this.ctx.fillStyle = '#fff';
			this.ctx.arc(this.x + (TILE_WIDTH / 4), this.y + (TILE_WIDTH / 2), 3, 0, 2 * Math.PI, true);
			this.ctx.fill();

			this.ctx.beginPath();
			this.ctx.arc(this.x + (3 * TILE_WIDTH / 4), this.y + (TILE_WIDTH / 2), 3, 0, 2 * Math.PI, true);
			this.ctx.fill();


			// test12
			// Tu código aquí
			// Asegúrate de pintar el fantasma de un color u otro dependiendo del estado del fantasma y de thisGame.ghostTimer
			// siguiendo el enunciado

			// test13
			// Tu código aquí
			// El cuerpo del fantasma sólo debe dibujarse cuando el estado del mismo es distinto a Ghost.SPECTACLES

		}; // draw

		this.move = function () {
			// test10
			// Tu código aquí
			this.nearestRow = parseInt((this.y + thisGame.TILE_HEIGHT / 2) / thisGame.TILE_HEIGHT);
			this.nearestCol = parseInt((this.x + thisGame.TILE_WIDTH / 2) / thisGame.TILE_WIDTH);

			var posiblesMovimientos = [[0, -this.speed], [this.speed, 0], [0, this.speed], [-this.speed, 0]];
			var soluciones = [];

			for (var i = 0; i < posiblesMovimientos.length; i++) {
				if (!thisLevel.checkIfHitWall(this.x + posiblesMovimientos[i][0], this.y + posiblesMovimientos[i][1], this.nearestRow, this.nearestCol))
					soluciones.push(posiblesMovimientos[i]);
			}
			if (thisLevel.checkIfHitWall(this.x + this.velX, this.y + this.velY, this.nearestRow, this.nearestCol) || soluciones.length == 3) {
				var pos = Math.round(Math.random() * (soluciones.length - 1));
				this.velX = soluciones[pos][0];
				this.velY = soluciones[pos][1];
			} else {
				thisLevel.checkIfHitSomething(this, this.x, this.y, this.nearestRow, this.nearestCol);
			}
			this.x += this.velX;
			this.y += this.velY;

			// test13
			// Tu código aquí
			// Si el estado del fantasma es Ghost.SPECTACLES
			// Mover el fantasma lo más recto posible hacia la casilla de salida
		};

	}; // fin clase Ghost

// >=test12
// static variables
	Ghost.NORMAL = 1;
	Ghost.VULNERABLE = 2;
	Ghost.SPECTACLES = 3;

// >=test5
	var Level = function (ctx) {
		this.ctx = ctx;
		this.lvlWidth = 0;
		this.lvlHeight = 0;
		this.puertaDcha;
		this.puertaIzq;
		this.puertaArriba;
		this.puertaAbajo;

		this.map = [];

		this.pellets = 0;
		this.powerPelletBlinkTimer = 0;

		this.setMapTile = function (row, col, newValue) {
			// test5
			// Tu código aquí
			if (newValue == 2 || newValue == 3) {
				this.pellets++;
			}
			this.map[(row * this.lvlWidth) + col] = newValue;
		};

		this.getMapTile = function (row, col) {
			// test5
			// Tu código aquí

			return this.map[(row * this.lvlWidth) + col];
		};

		this.printMap = function () {
			// test5
			// Tu código aquí
			console.log(this.map);
		};

		this.loadLevel = function () {
			// test5
			// Tu código aquí
			// leer res/levels/1.txt y guardarlo en el atributo map
			// haciendo uso de setMapTile
			$.ajaxSetup({async: false});

			$.get("../res/levels/1.txt", (data) => {
				var trozos = data.split("#");

				//cojo el ancho
				var valores = trozos[1].split(" ");
				this.lvlWidth = valores[2];

				//cojo la altura
				valores = trozos[2].split(" ");
				this.lvlHeight = valores[2];

				//cojo los valores
				valores = trozos[3].split("\n");
				//console.log(valores);
				var filas = valores.slice(1, valores.length - 1);
				//console.log(filas);

				$.each(filas, (n, elem1) => {
					var nums = elem1.split(" ");
					$.each(nums, (m, elem2) => {
						this.setMapTile(n, m, elem2);
					});

				});
			});
			// test10
			// Tu código aquí
		};

		// >=test6
		this.drawMap = function () {

			var TILE_WIDTH = thisGame.TILE_WIDTH;
			var TILE_HEIGHT = thisGame.TILE_HEIGHT;

			var tileID = {
				'door-h': 20,
				'door-v': 21,
				'pellet-power': 3
			};

			if (this.powerPelletBlinkTimer < 60) {
				this.powerPelletBlinkTimer++;
			} else {
				this.powerPelletBlinkTimer = 0;
			}

			for (var fila = 0; fila <= thisGame.screenTileSize[0]; fila++) {
				for (var colum = 0; colum < thisGame.screenTileSize[1]; colum++) {
					var elem = this.getMapTile(fila, colum);

					if (elem == 4) {

						player.homeX = colum * TILE_WIDTH;
						player.homeY = fila * TILE_HEIGHT;
						//Pacman
					} else if (elem == 0) {
						//Baldosa vacia
					} else if (elem == 2) {
						//Pildora
						ctx.beginPath();
						ctx.arc(colum * TILE_WIDTH + (TILE_WIDTH / 2), fila * TILE_HEIGHT + (TILE_HEIGHT / 2), 3, 0, 2 * Math.PI, false);
						ctx.fillStyle = "#FFFFFF";
						ctx.fill();
					} else if (elem == 3) {
						//Pildora de poder
						if (this.powerPelletBlinkTimer < 30) {
							ctx.beginPath();
							ctx.arc(colum * TILE_WIDTH + (TILE_WIDTH / 2), fila * TILE_HEIGHT + (TILE_HEIGHT / 2), 6, 0, 2 * Math.PI, false);
							ctx.fillStyle = "#FFffff";
							ctx.fill();
						}
					} else if (elem >= 100 && elem < 200) {
						//Pared
						ctx.fillStyle = '#0000FF';
						ctx.fillRect(colum * TILE_WIDTH, fila * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
					} else if (elem >= 10 && elem < 14) {
						//Fantasmas
						ctx.fillStyle = '#000000';
						ctx.fillRect(colum * TILE_WIDTH, fila * TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
					} else if(elem == 20 || elem == 21){
						if(elem == 20){
							if(colum == 0){
								this.puertaIzq = [fila, colum];
							}else{
								this.puertaDcha = [fila, colum];
							}
						}else{
							if(fila == 0){
								this.puertaArriba = [fila, colum];
							}else{
								this.puertaAbajo = [fila, colum];
							}
						}
					}
				}
			}

			// test6
			// Tu código aquí
		};

		// >=test7
		this.isWall = function (row, col) {
			// test7
			// Tu código aquí
			var pos = thisLevel.getMapTile(row, col);
			return (pos >= 100 && pos <= 199);
		};

		// >=test7
		this.checkIfHitWall = function (possiblePlayerX, possiblePlayerY, row, col) {
			// test7
			// Tu código aquí
			// Determinar si el jugador va a moverse a una fila,columna que tiene pared
			// Hacer uso de isWall


			var numCollisions = 0;

			for (var r = row - 1; r < row + 2; r++) {
				for (var c = col - 1; c < col + 2; c++) {

					if ((Math.abs(possiblePlayerX - (c * thisGame.TILE_WIDTH)) < thisGame.TILE_WIDTH) && (Math.abs(possiblePlayerY - (r * thisGame.TILE_HEIGHT)) < thisGame.TILE_HEIGHT)) {
						if (this.isWall(r, c)) numCollisions++;
					}
				}
			}
			if (numCollisions > 0) return true;
			else return false;
		};

		// >=test11
		this.checkIfHit = function (playerX, playerY, x, y, holgura) {
			// Test11
			// Tu código aquí
		};

		// >=test8
		this.checkIfHitSomething = function (playerX, playerY, row, col) {
			var tileID = {
				'door-h': 20,
				'door-v': 21,
				'pellet-power': 3,
				'pellet': 2
			};

			// test8
			// Tu código aquí
			// Gestiona la recogida de píldoras

			casilla = this.getMapTile(Math.floor((player.y + player.radius)/thisGame.TILE_WIDTH), Math.floor((player.x + player.radius)/thisGame.TILE_HEIGHT))
			if(casilla == '2'){ //pildora normal
				this.setMapTile(Math.floor((player.y + player.radius)/thisGame.TILE_WIDTH), Math.floor((player.x + player.radius)/thisGame.TILE_HEIGHT), 0);
				this.pellets--;
			}else if(casilla == '3'){//pildora gorda
				this.setMapTile(Math.floor((player.y + player.radius)/thisGame.TILE_WIDTH), Math.floor((player.x + player.radius)/thisGame.TILE_HEIGHT), 0);
				this.pellets--;
				//Cambiar a los fantasmas


			}else if(casilla == '20'){ //Puertas horizontales
				console.log("haha")
			}else if(casilla == '21'){ //Puertas verticales
				console.log("hahant")
			}








			// test9
			// Tu código aquí
			// Gestiona las puertas teletransportadoras

				for (var r = row - 1; r < row + 2; r++) {
					for (var c = col - 1; c < col + 2; c++) {
						if ((Math.abs(playerX - (c * thisGame.TILE_WIDTH)) < 4) && (Math.abs(playerY - (r * thisGame.TILE_HEIGHT)) < 4)) {
							pos = thisLevel.getMapTile(r, c);
							if (pos == tileID.pellet) {
								thisLevel.setMapTile(r, c, 0);
								thisLevel.pellets--;
								if (thisLevel.pellets == 0) console.log("Next level!");
							}
						}
					}
				}

			// test12
			// Tu código aquí
			// Gestiona la recogida de píldoras de poder
			// (cambia el estado de los fantasmas)

		};

	}; // end Level

// >=test2
	var Pacman = function () {
		this.radius = 10;
		this.x = 0;
		this.y = 0;
		this.speed = 3;
		this.angle1 = 0.25;
		this.angle2 = 1.75;
		this.homeX = 0;
		this.homeY = 0;
		this.sprites = [
			new Sprite('../res/im/sprites.png', [455, 0], [16, 16], 0.005, [0, 1]),
			new Sprite('../res/im/sprites.png', [455, 16], [16, 16], 0.005, [0, 1]),
			new Sprite('../res/im/sprites.png', [455, 32], [16, 16], 0.005, [0, 1]),
			new Sprite('../res/im/sprites.png', [455, 48], [16, 16], 0.005, [0, 1]),
			new Sprite('../res/im/sprites.png', [488, 0], [16, 16], 0.005, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
		];

	};

// >=test3


	Pacman.prototype.move = function () {

		// test3 / test4 / test7
		// Tu código aquí

		
		this.nearestRow = parseInt((this.y + this.radius) / thisGame.TILE_HEIGHT);
		this.nearestCol = parseInt((this.x + this.radius) / thisGame.TILE_WIDTH);
		// >=test8: introduce esta instrucción
		// dentro del código implementado en el test7:
		// tras actualizar this.x  y  this.y...
		// check for collisions with other tiles (pellets, etc)


		if (!thisLevel.checkIfHitWall(this.x + this.velX, this.y + this.velY, this.nearestRow, this.nearestCol)) {

			thisLevel.checkIfHitSomething(this, this.x, this.y, this.nearestRow, this.nearestCol);
			this.x += this.velX;
			this.y += this.velY;
		} else {
			this.velX = 0;
			this.velY = 0;
		}

		/*
		if (!thisLevel.checkIfHitWall(this.x + this.velX, this.y + this.velY, this.nearestRow, this.nearestCol)) {

			thisLevel.checkIfHitSomething(this, this.x, this.y, this.nearestRow, this.nearestCol);
			this.x += this.velX;
			this.y += this.velY;
		} else {
			this.velX = 0;
			this.velY = 0;
		}

		 */
		// test11
		// Tu código aquí
		// check for collisions with the ghosts

		// test13
		// Tu código aquí
		// Si chocamos contra un fantasma y su estado es Ghost.VULNERABLE
		// cambiar velocidad del fantasma y pasarlo a modo Ghost.SPECTACLES

		// test14
		// Tu código aquí.
		// Si chocamos contra un fantasma cuando éste esta en estado Ghost.NORMAL --> cambiar el modo de juego a HIT_GHOST

	};

// >=test2
// Función para pintar el Pacman
// En el test2 se llama drawPacman(x, y) {
	Pacman.prototype.draw = function (x, y) {

		// Pac Man
		// test2
		// Tu código aquí
		// ojo: en el test2 esta función se llama drawPacman(x,y))


		if (this.velX > 0) {
			this.angle1 = 0.25;
			this.angle2 = 1.75;
		} else if (this.velX < 0) {
			this.angle1 = 1.25;
			this.angle2 = 0.75;
		} else if (this.velY > 0) {
			this.angle1 = 0.75;
			this.angle2 = 0.25;
		} else if (this.velY < 0) {
			this.angle1 = 1.75;
			this.angle2 = 1.25;
		}
		ctx.beginPath();
		ctx.moveTo(this.x + this.radius, this.y + this.radius);
		ctx.arc(this.x + this.radius, this.y + this.radius, this.radius, this.angle1 * Math.PI, this.angle2 * Math.PI, false);
		ctx.fillStyle = 'rgba(255,255,0,255)';
		ctx.strokeStyle = 'black';
		ctx.closePath();
		ctx.fill();
		ctx.stroke();


	};

// >=test5
	var player = new Pacman();

// >=test10
	for (var i = 0; i < numGhosts; i++) {
		ghosts[i] = new Ghost(i, canvas.getContext("2d"));
	}

// >=test5
	var thisGame = {
		getLevelNum: function () {
			return 0;
		},

		// >=test14
		setMode: function (mode) {
			this.mode = mode;
			this.modeTimer = 0;
		},

		// >=test6
		screenTileSize: [24, 21],

		// >=test5
		TILE_WIDTH: 24,
		TILE_HEIGHT: 24,

		// >=test12
		ghostTimer: 0,

		// >=test14
		NORMAL: 1,
		HIT_GHOST: 2,
		GAME_OVER: 3,
		WAIT_TO_START: 4,
		modeTimer: 0
	};

// >=test5
	var thisLevel = new Level(canvas.getContext("2d"));
	thisLevel.loadLevel(thisGame.getLevelNum());
// thisLevel.printMap();

// >=test2
	var measureFPS = function (newTime) {
		// la primera ejecución tiene una condición especial

		if (lastTime === undefined) {
			lastTime = newTime;
			return;
		}

		// calcular el delta entre el frame actual y el anterior
		var diffTime = newTime - lastTime;

		if (diffTime >= 1000) {

			fps = frameCount;
			frameCount = 0;
			lastTime = newTime;
		}

		// mostrar los FPS en una capa del documento
		// que hemos construído en la función start()
		fpsContainer.innerHTML = 'FPS: ' + fps;
		frameCount++;
	};

// >=test3
// clears the canvas content
	var clearCanvas = function () {
		ctx.clearRect(0, 0, w, h);
	};


// >=test4
	var checkInputs = function () {
		// test4
		// Tu código aquí (reestructúralo para el test7)

		// test7
		// Tu código aquí
		// LEE bien el enunciado, especialmente la nota de ATENCION que
		// se muestra tras el test 7

		if (inputStates.left) {
			posibleIzq = player.x-player.radius/10-player.speed;
			if (!thisLevel.checkIfHitWall(player.x  - player.speed, player.y, player.nearestRow , player.nearestCol)) {


				player.velY = 0;
				player.velX = -player.speed;
				inputStates.up = inputStates.down = inputStates.right = false;
			} else {
				player.velX = 0;
				//inputStates.up = inputStates.left = inputStates.right = inputStates.down = false;
			}
		} else if (inputStates.up) {

			if (!thisLevel.checkIfHitWall(player.x, player.y - player.speed, player.nearestRow, player.nearestCol)) {

				player.velY = -player.speed;
				player.velX = 0;
				inputStates.left = inputStates.down = inputStates.right = false;
			} else {
				player.velY = 0;
				//inputStates.up = inputStates.left = inputStates.right = inputStates.down = false;
			}
		} else if (inputStates.down) {

			if (!thisLevel.checkIfHitWall(player.x, player.y + player.speed, player.nearestRow, player.nearestCol)) {
				player.velY = player.speed;
				player.velX = 0;
				//inputStates.up = inputStates.left = inputStates.right = false;
			} else {
				player.velY= 0;
				//inputStates.up = inputStates.left = inputStates.right = inputStates.down = false;
			}
		} else if (inputStates.right) {

			if (!thisLevel.checkIfHitWall(player.x+ player.speed, player.y, player.nearestRow, player.nearestCol)) {
				player.velY = 0;
				player.velX = player.speed;
				inputStates.up = inputStates.down = inputStates.left = false;
			} else {
				player.velX = 0;
				//inputStates.up = inputStates.left = inputStates.right = inputStates.down = false;
			}
		} else {
			player.velX = player.velY = 0;
			inputStates.up = inputStates.left = inputStates.right = inputStates.down = false;
		}


	};

// >=test12
	var updateTimers = function () {
		// test12
		// Tu código aquí
		// Actualizar thisGame.ghostTimer (y el estado de los fantasmas, tal y como se especifica en el enunciado)

		// test14
		// Tu código aquí
		// actualiza modeTimer...
	};

// >=test1
	var mainLoop = function (time) {


		// test1
		// Tu codigo aquí (solo tu código y la instrucción requestAnimationFrame(mainLoop);)
		// A partir del test2 deberás borrar lo implementado en el test1

		// >=test2
		// main function, called each frame
		measureFPS(time);

		// test14
		// Tu código aquí
		// sólo en modo NORMAL

		// >=test4
		checkInputs();

		// test10
		// Tu código aquí
		// Mover fantasmas
		for (var i = 0; i < numGhosts; i++) {
			ghosts[i].move();
		}
		;
		// >=test3
		//ojo: en el test3 esta instrucción es pacman.move()
		player.move();


		// test14
		// Tu código aquí
		// en modo HIT_GHOST
		// seguir el enunciado...

		// test14
		// Tu código aquí
		// en modo WAIT_TO_START
		// seguir el enunciado...


		// >=test2
		// Clear the canvas
		clearCanvas();

		// >=test6
		thisLevel.drawMap();

		// test10
		// Tu código aquí
		// Pintar fantasmas
		for (var i = 0; i < numGhosts; i++) {
			ghosts[i].draw();
		}
		;
		// >=test3
		//ojo: en el test3 esta instrucción es pacman.draw()
		player.draw();

		// >=test12
		updateTimers();


		// call the animation loop every 1/60th of second
		// comentar esta instrucción en el test3
		requestAnimationFrame(mainLoop);
	};

// >=test4
	var addListeners = function () {

		// add the listener to the main, window object, and update the states
		// test4  && thisLevel.checkIfHitWall(player.x - 1, player.y, 0, 0) == false
		// Tu código aquí
		window.onkeydown = function (e) {

			if(e.keyCode == 32){ //space
				console.log("Has pulsado el espacio")
				inputStates.space = true;
				inputStates.right = inputStates.left = inputStates.up = inputStates.down = false;
			}else  if ((e.keyCode == 37 || e.keyCode == 65) && thisLevel.checkIfHitWall(player.x - 1, player.y, 0, 0) == false) { // izq || A
				inputStates.left = true;
				inputStates.right = inputStates.space = inputStates.up = inputStates.down = false;
			}else if ((e.keyCode == 38 || e.keyCode == 87) && thisLevel.checkIfHitWall(player.x, player.y - 1, 0, 0) == false){ // arriba || W
				inputStates.up = true;
				inputStates.right = inputStates.left = inputStates.space = inputStates.down = false;
			}else if ((e.keyCode ==39 || e.keyCode ==68) && thisLevel.checkIfHitWall(player.x + 1, player.y, 0, 0) == false) { // dcha || D
				inputStates.right = true;
				inputStates.space = inputStates.left = inputStates.up = inputStates.down = false;
			} else if ((e.keyCode==40  || e.keyCode == 83) && thisLevel.checkIfHitWall(player.x, player.y + 1, 0, 0) == false) { // abajo || S
				inputStates.down = true;
				inputStates.right = inputStates.left = inputStates.up = inputStates.space = false;
			}


		};
	};


//>=test7
	var reset = function () {

		// test12
		// Tu código aquí
		// probablemente necesites inicializar los atributos de los fantasmas
		// (x,y,velX,velY,state, speed)

		// test7
		// Tu código aquí
		// Inicialmente Pacman debe empezar a moverse en horizontal hacia la derecha, con una velocidad igual a su atributo speed
		// inicializa la posición inicial de Pacman tal y como indica el enunciado
		inputStates.right = true;
		player.velX = player.speed
		player.velY = 0;
		player.x = player.homeX;
		player.y = player.homeY;
		player.nearestCol = parseInt(player.x / thisGame.TILE_WIDTH);
		player.nearestRow = parseInt(player.y / thisGame.TILE_HEIGHT);
		// test10
		// Tu código aquí
		// Inicializa los atributos x,y, velX, velY, speed de la clase Ghost de forma conveniente
		for (var i = 0; i < numGhosts; i++) {
			ghosts[i].x = ghosts[i].homeX;
			ghosts[i].y = ghosts[i].homeY;
			ghosts[i].velY = 0;
			ghosts[i].velX = -ghosts[i].speed;
		}
		;
		// >=test14
		thisGame.setMode(thisGame.NORMAL);
	};

// >=test1
	var start = function () {

		// >=test2
		// adds a div for displaying the fps value
		fpsContainer = document.createElement('div');
		document.body.appendChild(fpsContainer);

		// >=test4
		addListeners();
		thisLevel.drawMap();
		// >=test7
		reset();

		// start the animation
		requestAnimationFrame(mainLoop);
	};

// >=test1
//our GameFramework returns a public API visible from outside its scope
	return {
		start: start,

		// solo para el test 10
		ghost: Ghost,  // exportando Ghost para poder probarla

		// solo para estos test: test12 y test13
		ghosts: ghosts,

		// solo para el test12
		thisLevel: thisLevel,

		// solo para el test 13
		Ghost: Ghost,

		// solo para el test14
		thisGame: thisGame
	};

}
// >=test1
var game = new GF();
game.start();
