var tloader = new THREE.TextureLoader();

var modelMaterial = new THREE.MeshPhongMaterial( { 
	map: tloader.load( './assets/textures/1324-decal.jpg' ), 
	normalMap: tloader.load( './assets/textures/1324-normal.jpg' ),
	shininess: 10,
	shading: THREE.SmoothShading
} );

function createCubes() {
	var s = new THREE.CubeGeometry( 10, 10, 10, 1, 1 ,1 );
	// var s = new THREE.IcosahedronGeometry( 10, 3 );
	var g = new THREE.Geometry();
	var r = 2000;
	for( var j = 0; j < 20 ; j++ ) {
		var m = new THREE.Mesh( s, modelMaterial );
		m.rotation.set( Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI );
		m.position.set( ( .5 - Math.random() ) * r, ( .5 - Math.random() ) * r, ( .5 - Math.random() ) * r );
		var scale = 10 + Math.random() * 20;
		m.scale.set( scale, scale, scale );
		m.updateMatrix();
		g.merge( m.geometry, m.matrix );
	}
	model = new THREE.Mesh( g, modelMaterial );
	model.castShadow = true;
	model.receiveShadow = true;

	scene.add( model );

}