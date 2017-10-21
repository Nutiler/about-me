// Load initial scene, add title pause screen.
window.addEventListener('load', function() {
	var pause = document.getElementById('pause');
	var instructions = document.getElementById('instructions');

	var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
	if (havePointerLock) {

		var element = document.body;
		var pointerlockchange = function(event) {
			
			if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {

				controlsEnabled = true;
				controls.enabled = true;

				pause.style.display = 'none';
			}
			
			else {
				controls.enabled = false;

				pause.style.display = '-webkit-box';
				pause.style.display = '-moz-box';
				pause.style.display = 'box';

				instructions.style.display = '';
			}
			
		};

		var pointerlockerror = function(event) {
			instructions.style.display = '';
		};

		// Hook pointer lock state change events.
		document.addEventListener('pointerlockchange', pointerlockchange, false);
		document.addEventListener('mozpointerlockchange', pointerlockchange, false);
		document.addEventListener('webkitpointerlockchange', pointerlockchange, false);

		document.addEventListener('pointerlockerror', pointerlockerror, false);
		document.addEventListener('mozpointerlockerror', pointerlockerror, false);
		document.addEventListener('webkitpointerlockerror', pointerlockerror, false);

		instructions.addEventListener('click', function(event) {
			
			instructions.style.display = 'none';
			// Ask the browser to lock the pointer.
			element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
			element.requestPointerLock();

		}, false);

	}
	else {

		instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API.';

	}
	
	initialized();
	// animate();
	
});


// Update scene when resizing the window.
function onWindowResize() {
	
	var s = 1,
		w = window.innerWidth,
		h = window.innerHeight;
		
	renderer.setSize(s * w, s * h);
	camera.aspect = window.innerWidth / window.innerHeight;

	camera.updateProjectionMatrix();
	resizePass();
	console.log("THREE.Window resized.");
	
}

/*global camera,renderer,resizePass,animate,initialized,controls,controlsEnabled*/