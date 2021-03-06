// Post Processing.
// josh@stormheart.net

// WAGNER Shaders - https://github.com/spite/Wagner
WAGNER.vertexShadersPath = './assets/shaders/vertex-shaders';
WAGNER.fragmentShadersPath = './assets/shaders/fragment-shaders';
WAGNER.assetsPath = './assets/';

var composer, depthTexture, sL, gui;
var depthMaterial = new THREE.MeshBasicMaterial();
var rgbSplitPass, noisePass, vignette2Pass,
	bloomPass, glowTexture, dofPass, fxaaPass;

//  // Only used for specific object glows.
// var glowMaterial = new THREE.MeshBasicMaterial({
// 	map: tloader.load('./assets/textures/1324-glow.jpg'),
// });
// glowMaterial.map.repeat = new THREE.Vector2(1, 1);
// glowMaterial.map.wrapS = glowMaterial.map.wrapT = THREE.RepeatWrapping;


// rStats.js - http://spite.github.io/rstats/
var rS = new rStats({
	CSSPath: './assets/stats/',
	values: {
		raf: { caption: 'rAF (ms)' },
		fps: { caption: 'Framerate', below: 30 }
	}
});


function postProcessing() {
	
	composer = new WAGNER.Composer(renderer, { useRGBA: false });

	// Color Split
	rgbSplitPass = new WAGNER.RGBSplitPass();
	rgbSplitPass.params.delta.x = 30;
	rgbSplitPass.params.delta.y = 15;

	// Noise Static
	noisePass = new WAGNER.NoisePass();
	noisePass.params.speed = 1000;
	noisePass.params.amount = 0.2;

	// Brightening Vignette
	vignette2Pass = new WAGNER.Vignette2Pass();
	vignette2Pass.params.boost = 2;
	vignette2Pass.params.reduction = 2;

	// Bloom
	bloomPass = new WAGNER.MultiPassBloomPass();
	bloomPass.params.strength = .3;
	bloomPass.params.blurAmount = 0.5;
	bloomPass.params.applyZoomBlur = true;
	bloomPass.params.zoomBlurStrength = .02;
	// bloomPass.params.useTexture = true;

	// Depth of Feild
	dofPass = new WAGNER.GuidedFullBoxBlurPass();
	dofPass.params.from = 0.1;
	dofPass.params.to = 0;
	dofPass.params.amount = 10;

	// FXAA
	fxaaPass = new WAGNER.FXAAPass();


	// GUI - https://github.com/dataarts/dat.gui
	gui = new dat.GUI();

	var f1 = gui.addFolder('rgb');
	f1.add(rgbSplitPass.params.delta, 'x').min(0).max(100);
	f1.add(rgbSplitPass.params.delta, 'y').min(0).max(100);

	var f2 = gui.addFolder('noise');
	f2.add(noisePass.params, 'amount').min(0).max(2);
	f2.add(noisePass.params, 'speed').min(0).max(1000);

	var f3 = gui.addFolder('vignette');
	f3.add(vignette2Pass.params, 'boost').min(0).max(10);
	f3.add(vignette2Pass.params, 'reduction').min(0).max(10);

	var f4 = gui.addFolder('bloom');
	f4.add(bloomPass.params, 'blurAmount').min(0).max(2);
	f4.add(bloomPass.params, 'applyZoomBlur');
	f4.add(bloomPass.params, 'zoomBlurStrength').min(0).max(2);
	// gui.add(bloomPass.params, 'useTexture');

	var f5 = gui.addFolder('depth');
	f5.add(dofPass.params, 'from').min(0).max(1);
	f5.add(dofPass.params, 'to').min(0).max(1);
	f5.add(dofPass.params, 'amount').min(0).max(100);
	f5.add(dofPass.params, 'invertBiasMap');

	gui.close();


	// Load Shaders
	sL = new ShaderLoader();
	sL.add('depth-vs', './assets/shaders/vertex-shaders/packed-depth-vs.glsl');
	sL.add('depth-fs', './assets/shaders/fragment-shaders/packed-depth-fs.glsl');
	sL.load();
	sL.onLoaded(function() {
		depthMaterial = new THREE.ShaderMaterial({
			uniforms: {
				mNear: { type: 'f', value: camera.near },
				mFar: { type: 'f', value: camera.far }
			},
			vertexShader: this.get('depth-vs'),
			fragmentShader: this.get('depth-fs'),
			flatShading: THREE.SmoothShading
		});
	});
}


function resizePass() {
	
	composer.setSize(renderer.domElement.width, renderer.domElement.height);
	bloomPass.params.zoomBlurCenter.set(.5 * composer.width, .5 * composer.height);
	glowTexture = WAGNER.Pass.prototype.getOfflineTexture(composer.width, composer.height, false);
	depthTexture = WAGNER.Pass.prototype.getOfflineTexture(composer.width, composer.height, false);
	
}


function renderPass() {

	rS('FPS').frame();
	rS('rAF').tick();

	composer.reset();

	depthMaterial.side = THREE.DoubleSide;
	scene.overrideMaterial = depthMaterial;

	composer.render(scene, camera, null, depthTexture);
	dofPass.params.tBias = depthTexture;
	scene.overrideMaterial = null;

	if (bloomPass.params.useTexture) {
		
		scene.overrideMaterial = glowMaterial;
		composer.render(scene, camera, null, glowTexture);

		scene.overrideMaterial = null;
		composer.render(scene, camera);

		bloomPass.params.glowTexture = glowTexture;

	}
	else {
		
		composer.render(scene, camera);
		
	}

	composer.pass(fxaaPass);
	composer.pass(dofPass);
	composer.pass(bloomPass);

	composer.pass(vignette2Pass);
	composer.pass(rgbSplitPass);
	composer.pass(noisePass);


	composer.toScreen();
	
	rS().update();

}

/*global scene,THREE,camera,WAGNER,tloader,ShaderLoader,renderer,dat,rStats*/