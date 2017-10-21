// Post Processing.
// josh@stormheart.net

'use strict';

var display, renderer, scene, camera, fov = 75;
var light, controls;
var startTime = Date.now();

var objects = [];
var controlsEnabled = false;
var moveForward, moveBackward, moveLeft, moveRight, canJump;
moveForward = moveBackward = moveLeft = moveRight = canJump = false;

var prevTime = performance.now();
var velocity = new THREE.Vector3();

function initialized() {

	display = document.getElementById('display');

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x585858);
	scene.fog = new THREE.Fog(0x585858, 0, 750);

	camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 1, 10000);
	controls = new THREE.PointerLockControls(camera);
	scene.add(controls.getObject());

	// Grid Helper.
	var size = 2000;
	var divisions = 50;
	var colorCenterLine = 0xbbbbbb;
	var colorGrid = 0x747474;
	var gridHelper = new THREE.GridHelper(size, divisions, colorCenterLine, colorGrid);
	scene.add(gridHelper);

	renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setClearColor(0x6b6b6b, 1);

	display.appendChild(renderer.domElement);
	window.addEventListener('resize', onWindowResize, false);

	var SHADOW_MAP_WIDTH = 2048,
		SHADOW_MAP_HEIGHT = 1024;


	// lighting
	var ambient = new THREE.AmbientLight(0x404040);
	scene.add(ambient);

	light = new THREE.SpotLight(0xaaaaaa, 1, 0, Math.PI / 2, 1);
	light.position.set(0, 1500, 1000);
	light.target.position.set(0, 0, 0);

	light.castShadow = true;
	light.shadow.camera.near = 1200;
	light.shadow.camera.far = 2500;
	light.shadow.camera.fov = 90;

	light.shadow.bias = 0.0001;
	light.shadow.darkness = 0.5;
	light.shadow.mapSize.width = SHADOW_MAP_WIDTH;
	light.shadow.mapSize.height = SHADOW_MAP_HEIGHT;
	scene.add(light);


	var spotLightHelper = new THREE.SpotLightHelper(light);
	scene.add(spotLightHelper);

	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFShadowMap;

	// start it
	createCubes();

	postProcessing();
	onWindowResize();
	render();
}

function render() {
	requestAnimationFrame(render);
	var t = .001 * Date.now();
	light.position.set(0, 3000 * Math.cos(t), 2000 * Math.sin(t));
	renderPass();
	startTime = t;
}

function animate() {

	requestAnimationFrame(animate);

	if (controlsEnabled) {
		var time = performance.now();
		var delta = (time - prevTime) / 1000;

		velocity.x -= velocity.x * 10.0 * delta;
		velocity.z -= velocity.z * 10.0 * delta;

		velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

		if (moveForward) velocity.z -= 400.0 * delta;
		if (moveBackward) velocity.z += 400.0 * delta;

		if (moveLeft) velocity.x -= 400.0 * delta;
		if (moveRight) velocity.x += 400.0 * delta;

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

/*global onWindowResize,postProcessing,createCubes,THREE,performance,renderPass*/