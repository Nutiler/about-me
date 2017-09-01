// Enter Fullscreen
var c = document.body;
document.getElementById( 'fullscreenBtn' ).addEventListener( 'click', function( e ) {
	c.onwebkitfullscreenchange = function(e) {
		c.onwebkitfullscreenchange = function() {
		};
	};
	c.onmozfullscreenchange = function(e) {
		c.onmozfullscreenchange = function() {
		};
	};
	if( c.webkitRequestFullScreen ) c.webkitRequestFullScreen();
	if( c.mozRequestFullScreen ) c.mozRequestFullScreen();
	e.preventDefault();
}, false );

window.addEventListener( 'load', function() {
	init();
} );

function onMouseWheel( event ) {

	// WebKit
	if ( event.wheelDeltaY ) {
		fov -= event.wheelDeltaY * 0.05;
		
	// Opera / Explorer 9
	} else if ( event.wheelDelta ) {
		fov -= event.wheelDelta * 0.05;
		
	// Firefox
	} else if ( event.detail ) {
		fov += event.detail * 1.0;
	}

	camera.projectionMatrix.makePerspective( fov, window.innerWidth / window.innerHeight, camera.near, camera.far );
	
}

var mouseX = 0, mouseY = 0;
function onDocumentMouseMove( e ) {
	mouseX = 10 * ( .5 * window.innerWidth - e.pageX );
	mouseY = 10 * ( .5 * window.innerHeight - e.pageY );

}