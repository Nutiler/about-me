'use strict'

var display, renderer, scene, camera, mesh, torus, material, fov = 70;
var model, quad, light, composer, controls;
var startTime = Date.now();


function init() {

	display = document.getElementById( 'display' );
	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera( fov, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.z = 1000;
	scene.add( camera );

	controls = new THREE.OrbitControls( camera );

	renderer = new THREE.WebGLRenderer( { antialias: true, alpha: false } );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setClearColor (0x6b6b6b, 1);

	display.appendChild( renderer.domElement );

	window.addEventListener( 'resize', onWindowResize, false );

	var SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 1024;

	var ambient = new THREE.AmbientLight( 0x444444 );
	scene.add( ambient );

	light = new THREE.SpotLight( 0xaaaaaa, 1, 0, Math.PI / 2, 1 );
	light.position.set( 0, 1500, 1000 );
	light.target.position.set( 0, 0, 0 );

	light.castShadow = true;

	light.shadow.camera.near = 1200;
	light.shadow.camera.far = 2500;
	light.shadow.camera.fov = 90;

	//light.shadowCameraVisible = true;

	light.shadow.bias = 0.0001;
	light.shadow.darkness = 0.5;

	light.shadow.mapSize.width = SHADOW_MAP_WIDTH;
	light.shadow.mapSize.height = SHADOW_MAP_HEIGHT;

	scene.add( light );

	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFShadowMap;

	initPass();

	onWindowResize();

	render();
	
}

function onWindowResize() {
	var s = 1,
		w = window.innerWidth,
		h = window.innerHeight;
		
	renderer.setSize( s * w, s * h );
	camera.projectionMatrix.makePerspective( fov, w / h, camera.near, camera.far );
	resizePass();

}

function render() {
	
	requestAnimationFrame( render );
	var t = .001 * Date.now();
	light.position.set( 0, 3000 * Math.cos( t ), 2000 * Math.sin( t ) );
	renderPass();
	startTime = t;

}