// Post Processing.
// josh@stormheart.net

'use strict'

var display, renderer, scene, camera, mesh, torus, material, fov = 75;
var model, quad, light, composer, controls, raycaster;
var startTime = Date.now();

var controls;
var objects = [];
var raycaster;


var controlsEnabled = false;

var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var canJump = false;
var canCrouch = true;


var prevTime = performance.now();
var velocity = new THREE.Vector3();

function initialized() {


	display = document.getElementById('display');

	scene = new THREE.Scene();
	// scene.background = new THREE.Color( 0xffffff );
	// scene.fog = new THREE.Fog( 0xffffff, 0, 750 );


	camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 1, 10000);
	// camera.position.y = 3;
	// scene.add( camera );


	controls = new THREE.PointerLockControls(camera);
	scene.add(controls.getObject());

	var grid = new THREE.GridHelper(2500, 75);
	scene.add(grid);


	var onKeyDown = function(event) {

		switch (event.keyCode) {

			case 38: // up
			case 87: // w
				moveForward = true;
				break;

			case 37: // left
			case 65: // a
				moveLeft = true;
				break;

			case 40: // down
			case 83: // s
				moveBackward = true;
				break;

			case 39: // right
			case 68: // d
				moveRight = true;
				break;

			case 32: // space
				if (canJump === true) velocity.y += 300;
				canJump = false;
				break;

		}

	};

	var onKeyUp = function(event) {

		switch (event.keyCode) {

			case 38: // up
			case 87: // w
				moveForward = false;
				break;

			case 37: // left
			case 65: // a
				moveLeft = false;
				break;

			case 40: // down
			case 83: // s
				moveBackward = false;
				break;

			case 39: // right
			case 68: // d
				moveRight = false;
				break;

		}

	};

	document.addEventListener('keydown', onKeyDown, false);
	document.addEventListener('keyup', onKeyUp, false);

	raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 10);

	renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setClearColor(0x6b6b6b, 1);

	display.appendChild(renderer.domElement);
	window.addEventListener('resize', onWindowResize, false);

	var SHADOW_MAP_WIDTH = 2048,
		SHADOW_MAP_HEIGHT = 1024;




	// lighting
	var ambient = new THREE.AmbientLight(0x444444);
	scene.add(ambient);

	light = new THREE.SpotLight(0xaaaaaa, 1, 0, Math.PI / 2, 1);
	light.position.set(0, 1500, 1000);
	light.target.position.set(0, 0, 0);

	light.castShadow = true;

	light.shadow.camera.near = 1200;
	light.shadow.camera.far = 2500;
	light.shadow.camera.fov = 90;

	light.shadowCameraVisible = true;

	light.shadow.bias = 0.0001;
	light.shadow.darkness = 0.5;

	light.shadow.mapSize.width = SHADOW_MAP_WIDTH;
	light.shadow.mapSize.height = SHADOW_MAP_HEIGHT;

	scene.add(light);

	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFShadowMap;


	// start it
	// createCubes();
	// createCubeMountain();
	postProcessing();
	onWindowResize();
	render();
}

function render() {
	requestAnimationFrame(render);
	// var t = .001 * Date.now();
	// light.position.set(0, 3000 * Math.cos(t), 2000 * Math.sin(t));
	renderPass();
	// startTime = t;
}



function animate() {

	requestAnimationFrame(animate);

	if (controlsEnabled) {
		raycaster.ray.origin.copy(controls.getObject().position);
		raycaster.ray.origin.y -= 10;

		var intersections = raycaster.intersectObjects(objects);

		var isOnObject = intersections.length > 0;

		var time = performance.now();
		var delta = (time - prevTime) / 1000;

		velocity.x -= velocity.x * 10.0 * delta;
		velocity.z -= velocity.z * 10.0 * delta;

		velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

		// if touching an object don't go into it
		// 		if (moveForward) {
		// 	if (isOnObject === true) {
		// 		velocity.z = 0;

		// 	}
		// 	else {
		// 		velocity.z -= 400.0 * delta;

		// 	}

		// }


		if (moveForward) velocity.z -= 400.0 * delta;
		if (moveBackward) velocity.z += 400.0 * delta;

		if (moveLeft) velocity.x -= 400.0 * delta;
		if (moveRight) velocity.x += 400.0 * delta;

		if (isOnObject === true) {
			velocity.y = Math.max(0, velocity.y);

			canJump = true;
		}

		controls.getObject().translateX(velocity.x * delta);
		controls.getObject().translateY(velocity.y * delta);
		controls.getObject().translateZ(velocity.z * delta);

		if (controls.getObject().position.y < 10) {

			velocity.y = 0;
			controls.getObject().position.y = 10;

			canJump = true;
		}
		prevTime = time;
	}
}