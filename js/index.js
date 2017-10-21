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

function getLight(color, intensity) {
	var light = new THREE.SpotLight(color, intensity);
	light.castShadow = true;

	light.shadow.mapSize.x = 4096;
	light.shadow.mapSize.y = 4096;

	return light;
}

/// FIX SKY
var sky, sunSphere;

function initSky() {

	// Add Sky
	sky = new THREE.Sky();
	sky.scale.setScalar(450000);
	scene.add(sky);

	// Add Sun Helper
	sunSphere = new THREE.Mesh(
		new THREE.SphereBufferGeometry(20000, 16, 8),
		new THREE.MeshBasicMaterial({ color: 0xffffff })
	);
	sunSphere.position.y = -700000;
	sunSphere.visible = false;
	scene.add(sunSphere);

	/// GUI

	var effectController = {
		turbidity: 10,
		rayleigh: 4,
		mieCoefficient: 0.014,
		mieDirectionalG: 0.616,
		luminance: 0.6,
		inclination: 0.15, // elevation / inclination
		azimuth: 0.5, // Facing front,
		sun: !false
	};

	var distance = 400;

	function guiChanged() {

		var uniforms = sky.material.uniforms;
		uniforms.turbidity.value = effectController.turbidity;
		uniforms.rayleigh.value = effectController.rayleigh;
		uniforms.luminance.value = effectController.luminance;
		uniforms.mieCoefficient.value = effectController.mieCoefficient;
		uniforms.mieDirectionalG.value = effectController.mieDirectionalG;

		var theta = Math.PI * (effectController.inclination - 0.5);
		var phi = 2 * Math.PI * (effectController.azimuth - 0.5);

		sunSphere.position.x = distance * Math.cos(phi);
		sunSphere.position.y = distance * Math.sin(phi) * Math.sin(theta);
		sunSphere.position.z = distance * Math.sin(phi) * Math.cos(theta);

		sunSphere.visible = effectController.sun;

		uniforms.sunPosition.value.copy(sunSphere.position);

		renderer.render(scene, camera);

	}

	var gui = new dat.GUI();

	gui.add(effectController, "turbidity", 1.0, 20.0, 0.1).onChange(guiChanged);
	gui.add(effectController, "rayleigh", 0.0, 4, 0.001).onChange(guiChanged);
	gui.add(effectController, "mieCoefficient", 0.0, 0.1, 0.001).onChange(guiChanged);
	gui.add(effectController, "mieDirectionalG", 0.0, 1, 0.001).onChange(guiChanged);
	gui.add(effectController, "luminance", 0.0, 2).onChange(guiChanged);
	gui.add(effectController, "inclination", 0, 1, 0.0001).onChange(guiChanged);
	gui.add(effectController, "azimuth", 0, 1, 0.0001).onChange(guiChanged);
	gui.add(effectController, "sun").onChange(guiChanged);

	guiChanged();

}


function initialized() {

	display = document.getElementById('display');

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x585858);
	scene.fog = new THREE.Fog(0x000000, 0, 800);

	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);


	controls = new THREE.PointerLockControls(camera);

	camera.position.set(0, 100, 100);

	scene.add(controls.getObject());


	// // Grid Helper.
	// var size = 200;
	// var divisions = 15;
	// var colorCenterLine = 0xbbbbbb;
	// var colorGrid = 0x747474;
	// var gridHelper = new THREE.GridHelper(size, divisions, colorCenterLine, colorGrid);
	// scene.add(gridHelper);

	renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
	// renderer.setClearColor(0x6b6b6b, 1);

	display.appendChild(renderer.domElement);
	window.addEventListener('resize', onWindowResize, false);

	var SHADOW_MAP_WIDTH = 2048,
		SHADOW_MAP_HEIGHT = 1024;

	// initSky();



	var light1 = getLight('rgb(145, 200, 255)', 1);
	light1.name = 'light1';
	var light2 = getLight('rgb(255, 220, 180)', 1);
	light2.name = 'light2';

	scene.add(light1);
	scene.add(light2);

	light1.position.x = -200;
	light1.position.y = 80;
	light1.position.z = -200;

	light2.position.x = 200;
	light2.position.y = 40;
	light2.position.z = 300;


	// lighting
	// var ambient = new THREE.AmbientLight(0x404040);
	// scene.add(ambient);

	// light = new THREE.SpotLight(0xaaaaaa, 1, 0, Math.PI / 2, 1);
	// light.position.set(0, 1500, 1000);
	// light.target.position.set(0, 0, 0);

	// light.castShadow = true;
	// light.shadow.camera.near = 1200;
	// light.shadow.camera.far = 2500;
	// light.shadow.camera.fov = 90;

	// light.shadow.bias = 0.0001;
	// light.shadow.darkness = 0.5;
	// light.shadow.mapSize.width = SHADOW_MAP_WIDTH;
	// light.shadow.mapSize.height = SHADOW_MAP_HEIGHT;
	// scene.add(light);


	var geometry = new THREE.SphereBufferGeometry(700, 60, 40);
	// invert the geometry on the x-axis so that all of the faces point inward
	geometry.scale(-1, 1, 1);

	var material = new THREE.MeshBasicMaterial({
		map: new THREE.TextureLoader().load('./assets/37527342740_d4cd70ddf9_k.jpg')
	});

	var mesh = new THREE.Mesh(geometry, material);

	scene.add(mesh);



	// var spotLightHelper = new THREE.SpotLightHelper(light1);
	// scene.add(spotLightHelper);

	// var spotLightHelper = new THREE.SpotLightHelper(light2);
	// scene.add(spotLightHelper);

	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFShadowMap;

	// MTL & OBJ LOADER
	var onProgress = function(xhr) {
		if (xhr.lengthComputable) {
			var percentComplete = xhr.loaded / xhr.total * 100;
			console.log(Math.round(percentComplete, 2) + '% downloaded');
		}
	};
	var onError = function(xhr) {};
	THREE.Loader.Handlers.add(/\.dds$/i, new THREE.DDSLoader());
	var mtlLoader = new THREE.MTLLoader();
	mtlLoader.setPath('./assets/models/slenderman/');
	mtlLoader.load('slendy.mtl', function(materials) {
		materials.preload();
		var objLoader = new THREE.OBJLoader();
		objLoader.setMaterials(materials);
		objLoader.setPath('./assets/models/slenderman/');
		objLoader.load('slendy.obj', function(object) {
			object.position.y = -80;
			object.position.z = -43
			object.set
			scene.add(object);
		}, onProgress, onError);
	});




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

	var light1 = scene.getObjectByName('light1');
	light1.intensity += (Math.random() - 0.5) * 0.15;
	light1.intensity = Math.abs(light1.intensity);

	var light2 = scene.getObjectByName('light2');
	light2.intensity += (Math.random() - 0.5) * 0.05;
	light2.intensity = Math.abs(light2.intensity);
}

// function animate() {

// 	requestAnimationFrame(animate);

// 	if (controlsEnabled) {
// 		var time = performance.now();
// 		var delta = (time - prevTime) / 1000;

// 		velocity.x -= velocity.x * 10.0 * delta;
// 		velocity.z -= velocity.z * 10.0 * delta;

// 		// velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

// 		if (moveForward) velocity.z -= 400.0 * delta;
// 		if (moveBackward) velocity.z += 400.0 * delta;

// 		if (moveLeft) velocity.x -= 400.0 * delta;
// 		if (moveRight) velocity.x += 400.0 * delta;

// 		controls.getObject().translateX(velocity.x * delta);
// 		controls.getObject().translateY(velocity.y * delta);
// 		controls.getObject().translateZ(velocity.z * delta);

// 		if (controls.getObject().position.y < 10) {

// 			velocity.y = velocity.y;
// 			controls.getObject().position.y = 10;

// 			// canJump = true;
// 		}
// 		prevTime = time;
// 	}
// }

/*global onWindowResize,postProcessing,createCubes,THREE,performance,renderPass*/