export default function(layout, container, state, app) {
var rainbow = d3.scaleOrdinal(d3.schemeCategory20)
console.log(state)
var dataURI = state.dataURI || "/3d/get/default"
state.dataURI = dataURI

var data;
var width = 500,
initialWidth = 500,
height = 500,
initialHeight = 500
//container.getElement().remove(".content")
//container.getElement().remove(".content")
container.getElement().append("<div class='content'></div>")
container.getElement().append("<div class='cfg'>CONFIG<br><label>Data URI:</label><input type='text' class='uri'></input></div>")
container.getElement().find(".cfg .uri").val(state.dataURI)
d3.select(container.getElement()[0])
.append("input")
.attr("type","button")
.attr("value","submit")
.on("click", function(){
	 var v = container.getElement().find(".cfg .uri").val()
	 if (v!=state.dataURI) {
		state.dataURI = v;
		dataLoaded = false;
		dataURI = v;
		load(draw); //event load data? //todo
	}
	 container.extendState({
		 "configView":false,
		 "dataURI": v
	 })
	 container.getElement().find(".content").show()
	 container.getElement().find(".cfg").hide()

})
var pdb,
	resolution = '1Mb',
	resolutionMult = 1000000,
	genome = {},
	segments = [],    						// range of bin indexes for each chromosome (ex [0, 193] for chrom 1)
	pairSegments = [],						// range of base pairs for each chromosome (ex [0, 197000000] for chrom 1)
	chromosomes = [],

	scene,   							//three js scene
	camera,  							//three js camera
	renderer,							//three js renderer
	controls,							//three js controls
	model,
	labels = [],
	all = [],       					//container for 3d model
	geometries = [],					//container for geometry of each chromosome
	meshes = [],    					//container for geometry + material of each chromosome
	sphere,
	raycaster = new THREE.Raycaster(),
	mouse = new THREE.Vector2(),
	click = new THREE.Vector2(),
	shifting = false,
	dragging = false,

	launch = true,
	dataLoaded = false,
	regions = [];

var load = function(callback) {
	resolution = '1Mb',
	resolutionMult = 1000000,
	genome = {},
	segments = [],    						// range of bin indexes for each chromosome (ex [0, 193] for chrom 1)
	pairSegments = [],						// range of base pairs for each chromosome (ex [0, 197000000] for chrom 1)
	chromosomes = [],
	labels = [],
	all = [],       					//container for 3d model
	geometries = [],					//container for geometry of each chromosome
	meshes = [],
	raycaster = new THREE.Raycaster(),
	mouse = new THREE.Vector2(),
	click = new THREE.Vector2(),
	shifting = false,
	dragging = false,
	launch = true,
	dataLoaded = false,
	regions = [];

	$.get(dataURI, function(data){
		pdb = data.split('\n');
		var bins = [];
		var chromosome = -1;
		var pairCounter = 0;
		var distance = 0;
		var pairChromStartIndex = 0;
		var offset = 0;
		var chr = null;
		var index = -1;


		//load coordinates
		for (var i = 0; i < pdb.length - 1; i++){
			var row = pdb[i].split('\t');
			var location = row[1].split(' ');	// should look like ["chr1","3000000"]

					if (chr != location[0].substring(3)) { // case: new chromosome
				chromosome++;
				segments.push([index, i - 1]);
				chromosomes.push(location[0].substring(3));
				index = i;
				chr = location[0].substring(3);
				if (i != 0) {
					pairSegments.push([pairChromStartIndex, pairCounter]);
					pairChromStartIndex = pairCounter + 1;

				}
				distance = parseInt(location[1])
				pairCounter += distance; //
					}
					else { // case: same chromosome as previous line
				if (i!=0){
					offset = 1;
				}
				var prevPair = parseInt(pdb[i-1].split('\t')[1].split(' ')[1]);
				distance = parseInt(location[1]) - prevPair;
				pairCounter += distance;
				if (distance != resolutionMult) {
					console.log(prevPair + "," + location[1]); // these are the bins that have >resolutionMult basepairs. due to alignment problems.
				}
					}
					all.push({
				'chromosome': location[0].substring(3),
				'chromosome_idx': chromosome,
				'bin': i,
				'pairCount': [pairCounter - distance + offset, pairCounter],
				'active': false
					})
					bins.push({
				'x': parseFloat(row[2]),
				'y': parseFloat(row[3]),
				'z': parseFloat(row[4]),
					})
		}
		segments.shift();
		segments.push([index, i - 1]);
		pairSegments.push([pairChromStartIndex, pairCounter]);
		genome = {
			'bins': bins,
			'chromosomes': []
		};

		dataLoaded = true;
		callback();
	});
}


var draw = function() {
  console.log("dataLoaded",dataLoaded)
	if (!dataLoaded) {
		return
	}
	getPanelSize()
	var model = "<div class='model'></div>";
	var title = "<div class='title'><div class = titleComponent>3D STRUCTURE<br></div></div>"
	container.getElement().find(".content .genome").remove()
	container.getElement().find(".content").append(
		"<div class = genome>"+ title + model + "</div>"
	)
	if (launch){
		init();
	}
	modelGenome();
	animate();
	if(regions.length > 0) {
		alphaRegions(regions)
	}
}
var getPanelSize = function(){
  width = container.width
	initialWidth = container.width
	height = container.height
	initialHeight = container.height
}

scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(75, 1, 1, 20000);
renderer = new THREE.WebGLRenderer({ alpha: true });

var rerender = function(){
//d3.select(container.getElement()[0]).selectAll("*").remove()
	getPanelSize();
	console.log(width,height)
	draw();
	if(dataLoaded && regions.length > 0) {
		alphaRegions(regions)
	}
	//renderer.setSize(Math.min(height,width) - 25, Math.min(height,width) - 25);

}
function init() {
	//launch = false;

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(75, 1, 1, 20000);
	renderer = new THREE.WebGLRenderer({ alpha: true });

	renderer.setSize(Math.max(300,Math.min(height,width) - 25), Math.max(300,Math.min(height,width) - 25));
	renderer.setClearColor(0x000000, 0);
	container.getElement().find('.content .genome .model').append(renderer.domElement);//TODO FIX

	controls = new THREE.TrackballControls(camera, renderer.domElement);
	sphere = new THREE.Mesh(new THREE.SphereGeometry(11.5, 30, 30), new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.1 }));
    sphere.visible = false;
    scene.add(camera);
    scene.add(sphere);

}

function modelGenome() {
	model = new THREE.Object3D();

	for (var i = 0; i<segments.length; i++){
		var segment = segments[i];
		var curve = new THREE.CatmullRomCurve3(genome.bins.slice(segment[0],segment[1]).map(function(values,bin){
			return new THREE.Vector3(values.x, values.y, values.z);
		}))

		var geometry = new THREE.TubeGeometry(
			curve, // path
			(segments[i % segments.length][1] - segments[i % segments.length][0]) * (resolution == '1Mb' ? 5 : 2), // segments
			resolution == '1Mb' ? 0.05 : 0.1, // radius
			3, // radiusSegments
			false // closed
		)

		geometries[i] = new THREE.BufferGeometry().fromGeometry(geometry);
		var alphas = new Float32Array(geometries[i].attributes.position.count);
		var colors = new Float32Array(geometries[i].attributes.position.count * 3);
		var color = d3.rgb(rainbow(i));
		for (var v = 0; v < geometries[i].attributes.position.count; v++){
			alphas[v] = 0.8;
			colors[(v * 3)] = color.r / 255;
			colors[(v * 3) + 1] = color.g / 255;
			colors[(v * 3) + 2] = color.b / 255;
		}
		geometries[i].attributes.alpha = new THREE.BufferAttribute(alphas, 1);
		geometries[i].attributes.color = new THREE.BufferAttribute(colors, 3);
		var material = new THREE.ShaderMaterial({
			vertexShader: document.getElementById('vertexShader').textContent, //TODO FIX
			fragmentShader: document.getElementById('fragmentShader').textContent, //TODO FIX
			vertexColors: THREE.VertexColors,
			transparent: true
		});
		meshes[i] = new THREE.Mesh(geometries[i], material);
		meshes[i].name = i;
		model.add(meshes[i]);
	}
	scene.add(model);;
	camera.position.set(11, 11, 11)

}

function alphaModel(alpha, visible) {
	for (var i = 0; i < chromosomes.length; i++){
		if (visible != null && visible.indexOf(i) == -1) meshes[i].visible = false;
		else {
			meshes[i].visible = true
			var alphas = new Float32Array(geometries[i].attributes.alpha.count)
			for (var a = 0; a < geometries[i].attributes.alpha.count; a ++){
				alphas[a] = alpha;
			}
			geometries[i].attributes.alpha = new THREE.BufferAttribute(alphas, 1);
		}
	}
}

function alphaSegments(alpha, visible_chrom, visible_bins) {
	for (var z = 0; z<all.length; z++){
		all[z].active = false;
	}
	//$('#contain .title .overbite').remove();
	for (var i = 0; i < visible_chrom.length; i++) {
		var visibleRange = visible_bins[i]
		var pairSegment = pairSegments[visible_chrom[i]];
		var segment = segments[visible_chrom[i]]
		var geometry = geometries[visible_chrom[i]];
		// var alphas = new Float32Array(geometries[visible_chrom[i]].attributes.alpha.count);
		var mesh = meshes[visible_chrom[i]];
		var binGeomSize = parseInt(geometry.attributes.alpha.count / (segment[1] - segment[0]));
		var overbite = 0;
		for (var j = segment[0]; j < segment[1]; j++){
			if (all[j].pairCount[1] < visibleRange[0] || all[j].pairCount[0] >= visibleRange[1]) {
				if(!all[j].active){
					for (var k = (j - segment[0]) * binGeomSize; k < (j + 1 - segment[0]) * binGeomSize; k++) {
						geometry.attributes.alpha.array[k] = 0.2; // non highlighted regions
					}
				}

			}
			else {
				if (all[j].pairCount[0] < visibleRange[0] && all[j].pairCount[1] >= visibleRange[0]) {
					overbite += (visibleRange[0] - all[j].pairCount[0]);
				}
				if (all[j].pairCount[0] < visibleRange[1] && all[j].pairCount[1] >= visibleRange[1]) {
					overbite += (all[j].pairCount[1] - visibleRange[1]);
				}
				all[j].active = true;
				for (var k = (j - segment[0]) * binGeomSize; k < (j + 1 - segment[0]) * binGeomSize; k++) {
					geometry.attributes.alpha.array[k] = 0.9; // highlighted regions
				}
			}

		}
		//$('#contain .title').append("<div class = overbite> RANGE " + i + " OVERBITE : " + overbite + "</div>")
		//geometries[visible_chrom[i]].attributes.alpha = new THREE.BufferAttribute(alphas, 1);
		geometry.attributes.alpha.needsUpdate = true;
	}


}

//revised by @author zhuxp
var chr2idx = function(d) {
	return parseInt(d.replace("chr","").replace("Chr",""))-1 //TODO improve
}
var translate = function(d) {
	console.log(pairSegments,d.chr,chr2idx(d.chr))
	var range = pairSegments[chr2idx(d.chr)]
	var start = Math.min(d.start+range[0],range[1])
	var end = Math.min(d.end+range[0],range[1])
	return [start,end]
}
var alphaRegions = function(regions) {
	var visArrayChroms = [];
	var visArrayBins = [];
	//var overbite = [(chrom1_range[1] - chrom1_range[0]) - (chrom1_endBin - chrom)];
	//visArrayChroms.push(chrom1-1);
	regions.forEach(function(d){
		visArrayChroms.push(chr2idx(d.chr))
		visArrayBins.push(translate(d))
	})
	console.log(visArrayBins);
	alphaModel(0.8, visArrayChroms);
	alphaSegments(0.8, visArrayChroms, visArrayBins);
}

layout.eventHub.on("update",function(d){
	regions = d;
	if(dataLoaded) {
		alphaRegions(d)
	}
})


function isNumberKey(evt) {
	var charCode = (evt.which) ? evt.which : evt.keyCode;
	// Added to allow decimal, period, or delete
	if (charCode == 110 || charCode == 190 || charCode == 46)
		return true;

	if (charCode > 31 && (charCode < 48 || charCode > 57))
		return false;

	return true;
}

function animate() {
	requestAnimationFrame(animate);
	controls.update();
	render();
}

function render() {
	renderer.render(scene, camera);
}

container.on("resize", function(e) {
  rerender()
})

load(draw);
}
