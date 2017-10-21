
var tloader = new THREE.TextureLoader();

var modelMaterial = new THREE.MeshPhongMaterial( { 
	map: tloader.load( './assets/textures/1324-decal.jpg' ), 
	normalMap: tloader.load( './assets/textures/1324-normal.jpg' ),
	shininess: 10,
	flatShading: THREE.SmoothShading
} );


function createCubes() {
	var s = new THREE.CubeGeometry( 10, 10, 10, 1, 1 ,1 );
	var g = new THREE.Geometry();
	var r = 750;
	for( var j = 0; j < 10 ; j++ ) {
		var m = new THREE.Mesh( s, modelMaterial );
		m.rotation.set( Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI, Math.random() * 2 * Math.PI );
		m.position.set( ( .5 - Math.random() ) * r, ( .5 - Math.random() ) * r, ( .5 - Math.random() ) * r );
		var scale = 5 + Math.random() * 20;
		m.scale.set( scale, scale, scale );
		m.updateMatrix();
		g.merge( m.geometry, m.matrix );
	}
	model = new THREE.Mesh( g, modelMaterial );
	model.castShadow = true;
	model.receiveShadow = true;

	scene.add( model );
			objects.push(model);
}

function createCubeMountain() {
		// floor
	var geometry = new THREE.PlaneGeometry(2000, 2000, 100, 100);
	geometry.rotateX(-Math.PI / 2);
	material = new THREE.MeshBasicMaterial({ vertexColors: THREE.VertexColors });
	mesh = new THREE.Mesh(geometry, material);
	scene.add(mesh);

	// objects
	geometry = new THREE.BoxGeometry(20, 20, 20);
	for (var i = 0; i < 1; i++) {

		material = new THREE.MeshPhongMaterial({ specular: 0xffffff, flatShading: true, vertexColors: THREE.VertexColors });

		var mesh = new THREE.Mesh(geometry, material);
		scene.add(mesh);
		material.color.setHSL(Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75);
		objects.push(mesh);

	}
}

/*global scene,material,THREE,objects,model*/