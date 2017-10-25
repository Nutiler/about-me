// Post Processing.
// josh@stormheart.net

'use strict';

var display, renderer, scene, camera, fov = 75;
var light, light1, light2, controls;
var geometry, mesh, material;

var controlsEnabled, moveForward, moveBackward, moveLeft, moveRight, canJump;
controlsEnabled, moveForward = moveBackward = moveLeft = moveRight = canJump = false;

var prevTime = performance.now();
var velocity = new THREE.Vector3();

var onProgress,onError,mtlLoader,objLoader, percentComplete;



function getLight(color, intensity) {
	
	light = new THREE.SpotLight(color, intensity);
	light.castShadow = true;

	light.shadow.mapSize.x = 4096;
	light.shadow.mapSize.y = 4096;

	return light;
}



function initialized() {

	display = document.getElementById('display');


	// Scene
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x585858);
	scene.fog = new THREE.Fog(0x000000, 0, 800);
	
	
	// Camera and Controls
	camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 1, 10000);
	controls = new THREE.PointerLockControls(camera);
	camera.position.set(0, 100, 100);
	scene.add(controls.getObject());


	// Renderer
	renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFShadowMap;

	display.appendChild(renderer.domElement);
	window.addEventListener('resize', onWindowResize, false);


	// Lighting
	light1 = getLight('rgb(145, 200, 255)', 1);
	light1.name = 'light1';
	
	light2 = getLight('rgb(255, 220, 180)', 1);
	light2.name = 'light2';

	light1.position.x = -200;
	light1.position.y = 80;
	light1.position.z = -200;

	light2.position.x = 200;
	light2.position.y = 40;
	light2.position.z = 300;
	
	// var spotLightHelper = new THREE.SpotLightHelper(light1);
	// scene.add(spotLightHelper);

	// var spotLightHelper = new THREE.SpotLightHelper(light2);
	// scene.add(spotLightHelper);
	
	scene.add(light1);
	scene.add(light2);


	// Eqruitangle Skybox
	// Photo by Tomasz Szawaklo, Pelton Pond 2017.
	geometry = new THREE.SphereBufferGeometry(700, 60, 40);
	// Invert the geometry on the x-axis so that all of the faces point inward.
	geometry.scale(-1, 1, 1);
	material = new THREE.MeshBasicMaterial({
		map: new THREE.TextureLoader().load('./assets/textures/tomasz-szawaklo-pelton-pond.jpg')
	});
	mesh = new THREE.Mesh(geometry, material);
	scene.add(mesh);


	// MTL & OBJ LOADER
	onProgress = function(xhr) {
		
		if (xhr.lengthComputable) {
			percentComplete = xhr.loaded / xhr.total * 100;
			console.log(Math.round(percentComplete, 2) + '% downloaded');
		}
		
	};
	onError = function(xhr) {};
	
	THREE.Loader.Handlers.add(/\.dds$/i, new THREE.DDSLoader());
	
	mtlLoader = new THREE.MTLLoader();
	mtlLoader.setPath('./assets/models/slenderman/');
	mtlLoader.load('slendy.mtl', function(materials) {
		
		materials.preload();
		
		objLoader = new THREE.OBJLoader();
		objLoader.setMaterials(materials);
		objLoader.setPath('./assets/models/slenderman/');
		objLoader.load('slendy.obj', function(object) {
			
			object.position.y = -80;
			object.position.z = -43;
			scene.add(object);
		
		}, onProgress, onError);
		
	});

	postProcessing();
	onWindowResize();
	render();
	
}



function render() {
	
	requestAnimationFrame(render);
	renderPass();

	light1 = scene.getObjectByName('light1');
	light1.intensity += (Math.random() - 0.5) * 0.15;
	light1.intensity = Math.abs(light1.intensity);

	light2 = scene.getObjectByName('light2');
	light2.intensity += (Math.random() - 0.5) * 0.05;
	light2.intensity = Math.abs(light2.intensity);
	
}



function animate() {

	requestAnimationFrame(animate);

	if (controlsEnabled) {
		var time = performance.now();
		var delta = (time - prevTime) / 1000;

		velocity.x -= velocity.x * 10.0 * delta;
		velocity.z -= velocity.z * 10.0 * delta;

		if (moveForward) velocity.z -= 400.0 * delta;
		if (moveBackward) velocity.z += 400.0 * delta;

		if (moveLeft) velocity.x -= 400.0 * delta;
		if (moveRight) velocity.x += 400.0 * delta;

		controls.getObject().translateX(velocity.x * delta);
		controls.getObject().translateY(velocity.y * delta);
		controls.getObject().translateZ(velocity.z * delta);

		if (controls.getObject().position.y < 10) {

			velocity.y = velocity.y;
			controls.getObject().position.y = 10;

			canJump = true;
		}
		
		prevTime = time;
		
	}
}

/*global onWindowResize,postProcessing,THREE,performance,renderPass*/