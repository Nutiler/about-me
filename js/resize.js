// Enter Fullscreen
var c = document.body;
document.getElementById('fullscreenBtn').addEventListener('click', function(e) {
	c.onwebkitfullscreenchange = function(e) {
		c.onwebkitfullscreenchange = function() {};
	};
	c.onmozfullscreenchange = function(e) {
		c.onmozfullscreenchange = function() {};
	};
	if (c.webkitRequestFullScreen) c.webkitRequestFullScreen();
	if (c.mozRequestFullScreen) c.mozRequestFullScreen();
	e.preventDefault();
}, false);

window.addEventListener('load', function() {
	var blocker = document.getElementById('blocker');
	var instructions = document.getElementById('instructions');

	// http://www.html5rocks.com/en/tutorials/pointerlock/intro/

	var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

	if (havePointerLock) {

		var element = document.body;

		var pointerlockchange = function(event) {

			if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {

				controlsEnabled = true;
				controls.enabled = true;

				blocker.style.display = 'none';

			}
			else {

				controls.enabled = false;

				blocker.style.display = '-webkit-box';
				blocker.style.display = '-moz-box';
				blocker.style.display = 'box';

				instructions.style.display = '';

			}

		};

		var pointerlockerror = function(event) {

			instructions.style.display = '';

		};

		// Hook pointer lock state change events
		document.addEventListener('pointerlockchange', pointerlockchange, false);
		document.addEventListener('mozpointerlockchange', pointerlockchange, false);
		document.addEventListener('webkitpointerlockchange', pointerlockchange, false);

		document.addEventListener('pointerlockerror', pointerlockerror, false);
		document.addEventListener('mozpointerlockerror', pointerlockerror, false);
		document.addEventListener('webkitpointerlockerror', pointerlockerror, false);

		instructions.addEventListener('click', function(event) {

			instructions.style.display = 'none';

			// Ask the browser to lock the pointer
			element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
			element.requestPointerLock();

		}, false);

	}
	else {

		instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

	}



	initialized();
	animate();


});


// function onMouseWheel(event) {
// 		// WebKit
// 	if (event.wheelDeltaY) {
// 		fov -= event.wheelDeltaY * 0.05;

// 		// Opera / Explorer 9
// 	}
// 	else if (event.wheelDelta) {
// 		fov -= event.wheelDelta * 0.05;

// 		// Firefox
// 	}
// 	else if (event.detail) {
// 		fov += event.detail * 1.0;
// 	}

// 	camera.updateProjectionMatrix();

// }

// var mouseX = 0,
// 	mouseY = 0;

// function onDocumentMouseMove(e) {
// 	mouseX = 10 * (.5 * window.innerWidth - e.pageX);
// 	mouseY = 10 * (.5 * window.innerHeight - e.pageY);
// }


function onWindowResize() {
	var s = 1,
		w = window.innerWidth,
		h = window.innerHeight;
	renderer.setSize(s * w, s * h);
	camera.aspect = window.innerWidth / window.innerHeight;

	camera.updateProjectionMatrix();
	resizePass();
	console.log("THREE.Window resized.")

}