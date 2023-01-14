"use strict";

var canvas;
var gl;

var numTimesToSubdivide = 3;

var index = 0;

var pointsArray = [];
var normalsArray = [];
var colorsArray = [];
var numSpheres = 3;
var near = -10;
var far = 10;
var radius = 1.5;
var theta  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;
var yellowpoints = 0;
var bluepoints   = 0;
var hittowall = 0;
var colyellowred = 0;
var colblueyellow = 0;	
var colredblue = 0;	
var point = 0;
var left = -3.0;
var right = 3.0;
var ytop =3.0;
var bottom = -3.0;
var turn = 1;
var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);
var power = 0;
var pressed = {};
var lightPosition = vec4(1.0, 1.0, 1.0, 1.0 );
var lightAmbient = vec4(0.4, 0.4, 0.4, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 0.8, 0.8, 0.8, 1.0 );
var materialDiffuse = vec4( 0.8, 0.8, 0.8, 1.0 );
var materialSpecular = vec4( 0.8, 0.8, 0.8, 1.0 );
var materialShininess = 20.0;

var red = new Uint8Array([255, 0, 0, 255]);
var green = new Uint8Array([0, 255, 0, 255]);
var blue = new Uint8Array([0, 0, 255, 255]);
var cyan = new Uint8Array([0, 255, 255, 255]);
var magenta = new Uint8Array([255, 0, 255, 255]);
var yellow = new Uint8Array([255, 255, 0, 255]);
var white = new Uint8Array([255, 255, 255, 255]);
var black = new Uint8Array([0, 0, 0, 255]);
var cubeMap;
var ableToHit = 1;
var ambientColor, diffuseColor, specularColor;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc,shadowLoc;
var colorMatrixLoc;
var normalMatrix, normalMatrixLoc;
var thetaball = 90.0;
var phiball = 0.0;
var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);
var cBuffer, vBuffer,program;

var vertices = [

    vec4(-1.1, -1.1,  1.1, 1.0 ),
    vec4( -1.1,  1.1,  1.1, 1.0 ),
    vec4( 1.1,  1.1,  1.1, 1.0 ),
    vec4( 1.1, -1.1,  1.1, 1.0 ),
    vec4( -1.1, -1.1, -1.1, 1.0 ),
    vec4( -1.1,  1.1, -1.1, 1.0 ),
    vec4( 1.1,  1.1, -1.1, 1.0 ),
    vec4( 1.1, -1.1, -1.1, 1.0)
];

var vertexColors = [

    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];
function quad(a, b, c, d) {
     pointsArray.push(vertices[a]);
     //colorsArray.push(red);
     pointsArray.push(vertices[b]);
     //colorsArray.push(red);
     pointsArray.push(vertices[c]);
     //colorsArray.push(red);
     pointsArray.push(vertices[d]);
     //colorsArray.push(red);
}


function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}
function configureCubeMap(color) {

    cubeMap = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X ,0,gl.RGBA,
       1,1,0,gl.RGBA,gl.UNSIGNED_BYTE, color);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X ,0,gl.RGBA,
       1,1,0,gl.RGBA,gl.UNSIGNED_BYTE, color);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y ,0,gl.RGBA,
       1,1,0,gl.RGBA,gl.UNSIGNED_BYTE, color);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y ,0,gl.RGBA,
       1,1,0,gl.RGBA,gl.UNSIGNED_BYTE, color);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z ,0,gl.RGBA,
       1,1,0,gl.RGBA,gl.UNSIGNED_BYTE, color);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z ,0,gl.RGBA,
       1,1,0,gl.RGBA,gl.UNSIGNED_BYTE, color);


    gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function triangle(a, b, c,x,y,z,color) {

    a = mult(scalem( 0.2, 0.2, 0.2),a); 
	b = mult(scalem( 0.2, 0.2, 0.2),b); 
	c = mult(scalem( 0.2, 0.2, 0.2),c); 
	a = mult(translate( x, y, z),a);
	b = mult(translate( x, y, z),b);
	c = mult(translate( x, y, z),c);
     pointsArray.push(a);
     pointsArray.push(b);
     pointsArray.push(c);
	 colorsArray.push(color);
     colorsArray.push(color);
	 colorsArray.push(color);
     // normals are vectors

     normalsArray.push(a[0],a[1], a[2]);
     normalsArray.push(b[0],b[1], b[2]);
     normalsArray.push(c[0],c[1], c[2]);

     index += 3;
	 

}


function divideTriangle(a, b, c, count,x,y,z,color) {
    if ( count > 0 ) {

        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);

        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);

        divideTriangle( a, ab, ac, count - 1 ,x,y,z,color);
        divideTriangle( ab, b, bc, count - 1 ,x,y,z,color);
        divideTriangle( bc, c, ac, count - 1 ,x,y,z,color);
        divideTriangle( ab, bc, ac, count - 1 ,x,y,z,color);
    }
    else {
        triangle( a, b, c,x,y,z ,color);
    }
}


function tetrahedron(a, b, c, d, n,x,y,z,color) {
	var minindex = index;
    divideTriangle(a, b, c, n,x,y,z,color);
    divideTriangle(d, c, b, n,x,y,z,color);
    divideTriangle(a, d, b, n,x,y,z,color);
    divideTriangle(a, c, d, n,x,y,z,color);
	sphereSystem.push(sphere(color,[x,y,z,1],[0,0,0],minindex,index));
}

function sphere(col,pos,vel,min,max){

    var p = {};
    p.color = col;
    p.position = pos;
    p.velocity = vel;
	p.minind = min;
	p.maxind = max;
    

    return p;
}
function rulebook(){
	if(document.getElementById("howtoplay") != null)
		document.getElementById("howtoplay").remove();
	if(document.getElementById("rules") != null)
		document.getElementById("rules").remove();
	else{
	var textnode = document.createTextNode("To earn a point, the player needs to collide the ball with the walls at least three times before hitting the other two balls. "+
	                                       "For example if user is yellow ball wall-red-wall-wall-blue is a point. "+
										   "But wall-red-wall-blue is not a point " +
										   "Further examples: " +
										   "wall-wall-wall-wall-red-blue is a one point "+
										   "red-blue-wall-wall-wall is not a point "+
										   "blue-wall-wall-wall-wall-red is one point. "+
										   "Yellow ball starts. "+
										   "The player to reach 3 will win."); 
	var input = document.createElement("textarea");
	input.setAttribute("id", "rules");
	input.setAttribute("rows",5);
	input.setAttribute("cols",100);
	input.appendChild(textnode);
	input.style.zIndex = "1";
 	input.style.position = "absolute";
	input.style.left = 0;
    input.style.top = 0.3;
	input.readOnly = true;
	 
	document.body.appendChild(input); 
	}

	
	
	
}
function howtoplay(){
	if(document.getElementById("rules") != null)
		document.getElementById("rules").remove();
	if(document.getElementById("howtoplay") != null)
		document.getElementById("howtoplay").remove();
	else{
	var textnode = document.createTextNode("To move the cue, use arrows,to move the camera press increase theta, decrease theta, incrase phi, decrease phi buttons. " +
	                                       "To hit the ball press space button. How hard the player hits the ball depends on how long the space button is pressed."); 
	var input = document.createElement("textarea");
	input.setAttribute("id", "howtoplay");
	input.setAttribute("rows",5);
	input.setAttribute("cols",100);
	input.appendChild(textnode);
	input.style.zIndex = "1";
 	input.style.position = "absolute";
	input.style.left = 0;
    input.style.top = 0.3;
	input.readOnly = true;
	
	 
	document.body.appendChild(input); 
	}
	
	
	
}
function hit(sphereSystem,cue,ind,power){
    pointsArray.pop();
	pointsArray.pop();
	colorsArray.pop();
	colorsArray.pop();
    hittowall = 0;
	colyellowred = 0;
    colblueyellow = 0;	
	colredblue = 0;	
	point = 0;

    // set up particles with random locations and velocities
        
    if(power > 5000)
		power = 5000;
	power = power/5000;
	
        
        for ( var j = 0; j < 3; j++ ) {
            
            sphereSystem[ind].velocity[j] = -2 *power* cue.direction[j] ;
			sphereSystem[ind].position[j] += sphereSystem[ind].velocity[j];
			
        }
       
        sphereSystem[ind].position[3] = 1.0;
    power = 0;

        
		for(var i = sphereSystem[ind].minind;i<sphereSystem[ind].maxind;i++){ 
		
		 
	     pointsArray[i][0] += sphereSystem[ind].velocity[0];
		 pointsArray[i][1] += sphereSystem[ind].velocity[1];
		 pointsArray[i][2] += sphereSystem[ind].velocity[2];
		}
      
	
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray),gl.STATIC_DRAW);
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray),gl.STATIC_DRAW);
	var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    simulation(sphereSystem,cue,ind);


}

async function simulation(sphereSystem,cue,ind){
    
    //checkcollision();

    // set up particles with random locations and velocities
	while((dot(sphereSystem[0].velocity,sphereSystem[0].velocity) + dot(sphereSystem[1].velocity,sphereSystem[1].velocity) + dot(sphereSystem[2].velocity,sphereSystem[2].velocity)) >0.0000001){
		
		
		for(var i = 0;i<3;i++){
        for ( var j = 0; j < 3; j++ ) {
            
            sphereSystem[i].velocity[j] *= 0.99;
			sphereSystem[i].position[j] += sphereSystem[i].velocity[j];
			
			
        }
		
		sphereSystem[i].position[3] = 1.0;
        }
        
        for (var ballnum = 0;ballnum <3;ballnum++){
		for(var i = sphereSystem[ballnum].minind;i<sphereSystem[ballnum].maxind;i++){ 
		
		 
	     pointsArray[i][0] += sphereSystem[ballnum].velocity[0];
		 pointsArray[i][1] += sphereSystem[ballnum].velocity[1];
		 pointsArray[i][2] += sphereSystem[ballnum].velocity[2];
		}
		}
		
        
        checkcollision(ind);
		
		
		var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray),gl.STATIC_DRAW);
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray),gl.STATIC_DRAW);
	var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
	await sleep(10);
	
	}
    
	if(ind == 1 && point == 1){
		yellowpoints +=1;
		
	document.getElementById('yellow').innerHTML = yellowpoints;
	}
	if(ind == 2 && point == 1){
		bluepoints +=1;
	document.getElementById('blue').innerHTML = bluepoints;
	}
	ableToHit = 1;
	if(point != 1){
		if(turn == 1){
			turn = 2;
			document.getElementById("status").innerHTML = "Blue player's turn."
			
		}
		else if(turn == 2){
			turn = 1;
			document.getElementById("status").innerHTML = "Yellow player's turn."
			
		}
		
		
	}
	if(yellowpoints >= 3){
		document.getElementById("status").innerHTML = "Yellow player won!!! Congratulations."
		
	}
	if(bluepoints >= 3){
		document.getElementById("status").innerHTML = "Blue player won!!! Congratulations."
		
	}
	pointsArray.push(cuePosChange(makecue(),0.2,thetaball,phiball,sphereSystem[turn]).tip);
	colorsArray.push(vertexColors[0]);
	pointsArray.push(cuePosChange(makecue(),0.2,thetaball,phiball,sphereSystem[turn]).back);
	colorsArray.push(vertexColors[0]);
	var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
for(var i = 0;i<3;i++){
        for ( var j = 0; j < 3; j++ ) {
            
            sphereSystem[i].velocity[j] = 0;
			
			
			
        }
		
		sphereSystem[i].position[3] = 1.0;
        }

}

async function checkcollision(ind){
var minnum = sphereSystem[0].minind;
var maxnum = sphereSystem[2].maxind;
var dvar = new Array(maxnum);

    for (var i = 0; i < maxnum; i++) {
        dvar[i] = new Array(3);
    }
for (var k = 0; k < 3; k++ ){
for (var i = 0; i < 3; i++ ){
	for(var j = sphereSystem[ k ].minind;j<sphereSystem[ k ].maxind;j++){ 
		
		 
	     dvar[j][i] = pointsArray[j][i];
		
		}
	
}
}
	for (var particleId = 0;particleId < 3;particleId++){
	 for (var i = 0; i < 3; i++ ) {
		 
        if ( (sphereSystem[particleId].position[i] +0.1) >= 1.0 ) {
        hittowall += 1;
	
		
		for(var j = sphereSystem[ particleId ].minind;j<sphereSystem[ particleId ].maxind;j++){ 
		
		 
	     pointsArray[j][i] -= ((sphereSystem[particleId].position[i] +0.1)  -1.0 );
		
		}
		

            
        }
        else if ( (sphereSystem[particleId].position[i] -0.1) <= -1.0 ) {
        hittowall += 1; 
		
			for(var j = sphereSystem[ particleId ].minind;j<sphereSystem[ particleId ].maxind;j++){ 
		
		 
	     pointsArray[j][i] -= ((sphereSystem[particleId].position[i] -0.1)  +1.0 );
		 
		}
		

    
            
        }
    }

	
}
var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray),gl.STATIC_DRAW);
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray),gl.STATIC_DRAW);
	var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
	

await sleep(10);


	for (var particleId = 0;particleId < 3;particleId++){
	 for (var i = 0; i < 3; i++ ) {
        if ( (sphereSystem[particleId].position[i] +0.1) >= 1.0 ) {
            sphereSystem[particleId].velocity[i] *= -1.0 ;
			sphereSystem[particleId].position[i] += sphereSystem[particleId].velocity[i];
			
		for(var j = sphereSystem[ particleId ].minind;j<sphereSystem[ particleId ].maxind;j++){ 
		
		 
	     pointsArray[j][i] =dvar[j][i] + sphereSystem[particleId].velocity[i] ;
		
		}
		

            
        }
        if ( (sphereSystem[particleId].position[i] -0.1) <= -1.0 ) {
            sphereSystem[particleId].velocity[i] *= -1.0;
			sphereSystem[particleId].position[i] += sphereSystem[particleId].velocity[i];
			for(var j = sphereSystem[ particleId ].minind;j<sphereSystem[ particleId ].maxind;j++){ 
		
		 
	     pointsArray[j][i] =dvar[j][i] + sphereSystem[particleId].velocity[i] ;
		 
		}
		

    
            
        }
    }

	
}

if(Math.sqrt(Math.pow(sphereSystem[0].position[0]-sphereSystem[1].position[0],2) + Math.pow(sphereSystem[0].position[1]-sphereSystem[1].position[1],2) + Math.pow(sphereSystem[0].position[2]-sphereSystem[1].position[2],2)) <= 0.4){
if(colyellowred == 0){
	colyellowred = 1;

}
if(ind == 1 && point ==0)
{
if(colyellowred == 1 && colblueyellow == 1 && hittowall >= 3)
{
	point = 1;
	
	
}
else if(colyellowred == 1 && colblueyellow == 1 && hittowall < 3){
	point = -1;
	
	}
}
else if(ind == 2 && point ==0)
{
if(colredblue == 1 && colblueyellow == 1 && hittowall >= 3)
{
	point = 1;
	
	
}
else if(colredblue == 1 && colblueyellow == 1 && hittowall < 3){
	point = -1;
	
	}
}
var norm1 = new Array(3);
var vrel1 = new Array(3);	
var absvalue = Math.sqrt(Math.abs(sphereSystem[0].position[0]-sphereSystem[1].position[0])**2 + Math.abs(sphereSystem[0].position[1]-sphereSystem[1].position[1])**2 + Math.abs(sphereSystem[0].position[2]-sphereSystem[1].position[2])**2);
norm1[0] = (sphereSystem[0].position[0] - sphereSystem[1].position[0])/absvalue;
norm1[1] = (sphereSystem[0].position[1] - sphereSystem[1].position[1])/absvalue;
norm1[2] = (sphereSystem[0].position[2] - sphereSystem[1].position[2])/absvalue;

vrel1[0] = (sphereSystem[0].velocity[0] - sphereSystem[1].velocity[0]);
vrel1[1] = (sphereSystem[0].velocity[1] - sphereSystem[1].velocity[1]);
vrel1[2] = (sphereSystem[0].velocity[2] - sphereSystem[1].velocity[2]);
var vnorm1 =scale(dot( vrel1,norm1),norm1);

sphereSystem[0].velocity[0] -= vnorm1[0];
sphereSystem[0].velocity[1] -= vnorm1[1];
sphereSystem[0].velocity[2] -= vnorm1[2];
sphereSystem[1].velocity[0] += vnorm1[0];
sphereSystem[1].velocity[1] += vnorm1[1];
sphereSystem[1].velocity[2] += vnorm1[2];
	     sphereSystem[0].position[0] += sphereSystem[0].velocity[0];
		 sphereSystem[0].position[1] += sphereSystem[0].velocity[1];
		 sphereSystem[0].position[2] += sphereSystem[0].velocity[2];
		 sphereSystem[1].position[0] += sphereSystem[1].velocity[0];
		 sphereSystem[1].position[1] += sphereSystem[1].velocity[1];
		 sphereSystem[1].position[2] += sphereSystem[1].velocity[2];

for(var particleId=0;particleId <2 ; particleId++){
	
for(var j = sphereSystem[ particleId ].minind;j<sphereSystem[ particleId ].maxind;j++){ 
		
		 
	     pointsArray[j][0] += sphereSystem[particleId].velocity[0] ;
		 pointsArray[j][1] += sphereSystem[particleId].velocity[1] ;
		 pointsArray[j][2] += sphereSystem[particleId].velocity[2] ;
		}

}
/* for(var j = sphereSystem[ 0].minind;j<sphereSystem[0].maxind;j++){ 
		
		 for (var i = 0; i < 3; i++ ) {
	     pointsArray[j][i] -=sphereSystem[0].velocity[i] ;
		 }
		}

for(var j = sphereSystem[ 1].minind;j<sphereSystem[1].maxind;j++){ 
		
		 for (var i = 0; i < 3; i++ ) {
	     pointsArray[j][i] +=sphereSystem[1].velocity[i] ;
		 }
		 
		}
} */
}

if(Math.sqrt(Math.pow(sphereSystem[0].position[0]-sphereSystem[2].position[0],2) + Math.pow(sphereSystem[0].position[1]-sphereSystem[2].position[1],2) + Math.pow(sphereSystem[0].position[2]-sphereSystem[2].position[2],2)) <= 0.4){
if(colredblue == 0){
	
	colredblue = 1;
}
if(ind == 1 && point ==0)
{
if(colyellowred == 1 && colblueyellow == 1 && hittowall >= 3)
{
	point = 1;
	
	
}
else if(colyellowred == 1 && colblueyellow == 1 && hittowall < 3){
	point = -1;
	
	}
}
else if(ind == 2 && point ==0)
{
if(colredblue == 1 && colblueyellow == 1 && hittowall >= 3)
{
	point = 1;
	
	
}
else if(colredblue == 1 && colblueyellow == 1 && hittowall < 3){
	point = -1;
	
	}
}
var norm1 = new Array(3);
var vrel1 = new Array(3);	
var absvalue = Math.sqrt(Math.abs(sphereSystem[0].position[0]-sphereSystem[2].position[0])**2 + Math.abs(sphereSystem[0].position[1]-sphereSystem[2].position[1])**2 + Math.abs(sphereSystem[0].position[2]-sphereSystem[2].position[2])**2);
norm1[0] = (sphereSystem[0].position[0] - sphereSystem[2].position[0])/absvalue;
norm1[1] = (sphereSystem[0].position[1] - sphereSystem[2].position[1])/absvalue;
norm1[2] = (sphereSystem[0].position[2] - sphereSystem[2].position[2])/absvalue;

vrel1[0] = (sphereSystem[0].velocity[0] - sphereSystem[2].velocity[0]);
vrel1[1] = (sphereSystem[0].velocity[1] - sphereSystem[2].velocity[1]);
vrel1[2] = (sphereSystem[0].velocity[2] - sphereSystem[2].velocity[2]);
var vnorm1 =scale(dot( vrel1,norm1),norm1);

sphereSystem[0].velocity[0] -= vnorm1[0];
sphereSystem[0].velocity[1] -= vnorm1[1];
sphereSystem[0].velocity[2] -= vnorm1[2];
sphereSystem[2].velocity[0] += vnorm1[0];
sphereSystem[2].velocity[1] += vnorm1[1];
sphereSystem[2].velocity[2] += vnorm1[2];
	     sphereSystem[0].position[0] += sphereSystem[0].velocity[0];
		 sphereSystem[0].position[1] += sphereSystem[0].velocity[1];
		 sphereSystem[0].position[2] += sphereSystem[0].velocity[2];
		 sphereSystem[2].position[0] += sphereSystem[2].velocity[0];
		 sphereSystem[2].position[1] += sphereSystem[2].velocity[1];
		 sphereSystem[2].position[2] += sphereSystem[2].velocity[2];

for(var particleId=0;particleId <3 ; particleId++){
if(particleId != 1){
for(var j = sphereSystem[ particleId ].minind;j<sphereSystem[ particleId ].maxind;j++){ 
		 
		 
	     pointsArray[j][0] += sphereSystem[particleId].velocity[0] ;
		 pointsArray[j][1] += sphereSystem[particleId].velocity[1] ;
		 pointsArray[j][2] += sphereSystem[particleId].velocity[2] ;
		
		}

}
}
/* for(var j = sphereSystem[ 0].minind;j<sphereSystem[0].maxind;j++){ 
		
		 for (var i = 0; i < 3; i++ ) {
	     pointsArray[j][i] -=sphereSystem[0].velocity[i] ;
		 }
		}

for(var j = sphereSystem[ 1].minind;j<sphereSystem[1].maxind;j++){ 
		
		 for (var i = 0; i < 3; i++ ) {
	     pointsArray[j][i] +=sphereSystem[1].velocity[i] ;
		 }
		 
		}
} */
}
if(Math.sqrt(Math.pow(sphereSystem[1].position[0]-sphereSystem[2].position[0],2) + Math.pow(sphereSystem[1].position[1]-sphereSystem[2].position[1],2) + Math.pow(sphereSystem[1].position[2]-sphereSystem[2].position[2],2)) <= 0.4){
if(colblueyellow == 0)
	colblueyellow = 1;
if(ind == 1 && point ==0)
{
if(colyellowred == 1 && colblueyellow == 1 && hittowall >= 3)
{
	point = 1;
	
	
}
else if(colyellowred == 1 && colblueyellow == 1 && hittowall < 3){
	point = -1;
	
	}
}

else if(ind == 2 && point ==0)
{
if(colredblue == 1 && colblueyellow == 1 && hittowall >= 3)
{
	point = 1;
	
	
}
else if(colredblue == 1 && colblueyellow == 1 && hittowall < 3){
	point = -1;
	
	}
}

var norm1 = new Array(3);
var vrel1 = new Array(3);	
var absvalue = Math.sqrt(Math.abs(sphereSystem[1].position[0]-sphereSystem[2].position[0])**2 + Math.abs(sphereSystem[1].position[1]-sphereSystem[2].position[1])**2 + Math.abs(sphereSystem[1].position[2]-sphereSystem[2].position[2])**2);
norm1[0] = (sphereSystem[1].position[0] - sphereSystem[2].position[0])/absvalue;
norm1[1] = (sphereSystem[1].position[1] - sphereSystem[2].position[1])/absvalue;
norm1[2] = (sphereSystem[1].position[2] - sphereSystem[2].position[2])/absvalue;

vrel1[0] = (sphereSystem[1].velocity[0] - sphereSystem[2].velocity[0]);
vrel1[1] = (sphereSystem[1].velocity[1] - sphereSystem[2].velocity[1]);
vrel1[2] = (sphereSystem[1].velocity[2] - sphereSystem[2].velocity[2]);
var vnorm1 =scale(dot( vrel1,norm1),norm1);

sphereSystem[1].velocity[0] -= vnorm1[0];
sphereSystem[1].velocity[1] -= vnorm1[1];
sphereSystem[1].velocity[2] -= vnorm1[2];
sphereSystem[2].velocity[0] += vnorm1[0];
sphereSystem[2].velocity[1] += vnorm1[1];
sphereSystem[2].velocity[2] += vnorm1[2];

	     sphereSystem[1].position[0] += sphereSystem[1].velocity[0];
		 sphereSystem[1].position[1] += sphereSystem[1].velocity[1];
		 sphereSystem[1].position[2] += sphereSystem[1].velocity[2];
		 sphereSystem[2].position[0] += sphereSystem[2].velocity[0];
		 sphereSystem[2].position[1] += sphereSystem[2].velocity[1];
		 sphereSystem[2].position[2] += sphereSystem[2].velocity[2];

for(var particleId=1;particleId <3 ; particleId++){
	
for(var j = sphereSystem[ particleId ].minind;j<sphereSystem[ particleId ].maxind;j++){ 
		
		 
	     pointsArray[j][0] += sphereSystem[particleId].velocity[0] ;
		 pointsArray[j][1] += sphereSystem[particleId].velocity[1] ;
		 pointsArray[j][2] += sphereSystem[particleId].velocity[2] ;
		
		}

}

/* for(var j = sphereSystem[ 0].minind;j<sphereSystem[0].maxind;j++){ 
		
		 for (var i = 0; i < 3; i++ ) {
	     pointsArray[j][i] -=sphereSystem[0].velocity[i] ;
		 }
		}

for(var j = sphereSystem[ 1].minind;j<sphereSystem[1].maxind;j++){ 
		
		 for (var i = 0; i < 3; i++ ) {
	     pointsArray[j][i] +=sphereSystem[1].velocity[i] ;
		 }
		 
		}
} */
}


}

function makecue(){
	var cue={};
cue.length = 0.6;
cue.direction = [0,0,1,0];
cue.tip = [0,0,0,1];
cue.back = add(cue.tip,scale(cue.length,cue.direction));
cue.back[3] = 1; 
	
	return cue;
	
}

function cuePosChange(c,r,theta,phi,sphere){
	
	c.tip[0] = sphere.position[0]+(r*Math.sin(theta)*Math.cos(phi));
	c.direction[0] = (r*Math.sin(theta)*Math.cos(phi));
	
	
	c.tip[1] = sphere.position[1]+(r*Math.sin(theta)*Math.sin(phi));
	c.direction[1] = (r*Math.sin(theta)*Math.sin(phi));
	c.tip[2] = sphere.position[2]+(r*Math.cos(theta));
	c.direction[2] = (r*Math.cos(theta));
	c.back = scale(c.length,mult(translate(c.direction[0]/r,c.direction[1]/r,c.direction[2]/r),c.tip));
    c.back[3] = 1; 

	return c;
}
var sphereSystem = [];
window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );




    var x = 0.5;
	var y = 0.0;
	var z = 0.0;
    tetrahedron(va, vb, vc, vd, numTimesToSubdivide,x,y,z,vertexColors[1]);
	
	
	var x = -0.5;
	var y = 0.0;
	var z = 0.0;
	tetrahedron(va, vb, vc, vd, numTimesToSubdivide,x,y,z,vertexColors[2]);
	
	
	var x = 0.0;
	var y = 0.5;
	var z = 0.0;
	tetrahedron(va, vb, vc, vd, numTimesToSubdivide,x,y,z,vertexColors[4]);
	configureCubeMap(white);
	
    colorCube();
	var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);
	document.getElementById("status").innerHTML = "Yellow player's turn.";
	pointsArray.push(cuePosChange(makecue(),0.2,0,0,sphereSystem[1]).tip);
	colorsArray.push(vertexColors[0]);
	pointsArray.push(cuePosChange(makecue(),0.2,0,0,sphereSystem[1]).back);
	colorsArray.push(vertexColors[0]);
    
    
    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
	var cBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);
	var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );
    
    //configureCubeMap();
    gl.activeTexture( gl.TEXTURE0 );
    gl.uniform1i(gl.getUniformLocation(program, "texMap"),0);

/*     document.getElementById("Button0").onclick = function(){radius *= 1.1;};
    document.getElementById("Button1").onclick = function(){radius *= 1/1.1;}; */
    document.getElementById("Button2").onclick = function(){theta += dr;};
    document.getElementById("Button3").onclick = function(){theta -= dr;};
    document.getElementById("Button4").onclick = function(){phi += dr;};
    document.getElementById("Button5").onclick = function(){phi -= dr;};
     document.getElementById("Button6").onclick = rulebook;
	  document.getElementById("Button7").onclick = howtoplay;
/*     document.getElementById("Button6").onclick = function(){
        numTimesToSubdivide++;
        index = 0;
        pointsArray = [];
        normalsArray = [];
        init();
    }; */
/*     document.getElementById("Button7").onclick = function(){
        if(numTimesToSubdivide) numTimesToSubdivide--;
        index = 0;
        pointsArray = [];
        normalsArray = [];
        init();
    }; */
	
document.addEventListener('keyup', function(event)
{
	
	if(event.keyCode == 32&&ableToHit == 1 && yellowpoints <3 && bluepoints < 3 ) {
	
     ableToHit = 0;
	//if ( !pressed[e.which] ) return;
    power = ( event.timeStamp - pressed[event.which] ) ;
    // Key "e.which" was pressed for "duration" seconds
    pressed[event.which] = 0;
	hit(sphereSystem,cuePosChange(makecue(),0.2,thetaball,phiball,sphereSystem[turn]),turn,power);


	var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
	
    
	
	
	
}
	
});


document.addEventListener('keydown', function(event)
{

if(event.keyCode == 32 && ableToHit == 1&& yellowpoints <3 && bluepoints < 3 ) {
	
   
	
    if ( pressed[event.which] ) return;
    pressed[event.which] = event.timeStamp;
    
	
    
	
	
	
}
else if(event.keyCode == 38 && ableToHit == 1&& yellowpoints <3 && bluepoints < 3 ) {
	pointsArray.pop();
	pointsArray.pop();
	colorsArray.pop();
	colorsArray.pop();
	phiball += 0.1;
	
	pointsArray.push(cuePosChange(makecue(),0.2,thetaball,phiball,sphereSystem[turn]).tip);
	colorsArray.push(vertexColors[0]);
	pointsArray.push(cuePosChange(makecue(),0.2,thetaball,phiball,sphereSystem[turn]).back);
	colorsArray.push(vertexColors[0]);
	var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
	
}

else if(event.keyCode == 39 && ableToHit == 1&& yellowpoints <3 && bluepoints < 3 ) {
	pointsArray.pop();
	pointsArray.pop();
	colorsArray.pop();
	colorsArray.pop();
	thetaball += 0.1;
	
	pointsArray.push(cuePosChange(makecue(),0.2,thetaball,phiball,sphereSystem[turn]).tip);
	colorsArray.push(vertexColors[0]);
	pointsArray.push(cuePosChange(makecue(),0.2,thetaball,phiball,sphereSystem[turn]).back);
	colorsArray.push(vertexColors[0]);
	var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
	
}
else if(event.keyCode == 37 && ableToHit == 1&& yellowpoints <3 && bluepoints < 3 ) {
	pointsArray.pop();
	pointsArray.pop();
	colorsArray.pop();
	colorsArray.pop();
	thetaball -= 0.1;
	
	pointsArray.push(cuePosChange(makecue(),0.2,thetaball,phiball,sphereSystem[turn]).tip);
	colorsArray.push(vertexColors[0]);
	pointsArray.push(cuePosChange(makecue(),0.2,thetaball,phiball,sphereSystem[turn]).back);
	colorsArray.push(vertexColors[0]);
	var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
	
}
else if(event.keyCode == 40 && ableToHit == 1&& yellowpoints <3 && bluepoints < 3 ) {
	pointsArray.pop();
	pointsArray.pop();
	colorsArray.pop();
	colorsArray.pop();
	phiball -= 0.1;
	
	pointsArray.push(cuePosChange(makecue(),0.2,thetaball,phiball,sphereSystem[turn]).tip);
	colorsArray.push(vertexColors[0]);
	pointsArray.push(cuePosChange(makecue(),0.2,thetaball,phiball,sphereSystem[turn]).back);
	colorsArray.push(vertexColors[0]);
	var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
		
}
else if(event.keyCode == 40 && ableToHit == 1&& yellowpoints <3 && bluepoints < 3 ) {
	pointsArray.pop();
	pointsArray.pop();
	colorsArray.pop();
	colorsArray.pop();
	phiball -= 0.1;
	
	pointsArray.push(cuePosChange(makecue(),0.1,thetaball,phiball,sphereSystem[1]).tip);
	colorsArray.push(vertexColors[0]);
	pointsArray.push(cuePosChange(makecue(),0.1,thetaball,phiball,sphereSystem[1]).back);
	colorsArray.push(vertexColors[0]);
	var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
	
}



});	
	

    gl.uniform4fv( gl.getUniformLocation(program,
       "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
       "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
       "specularProduct"),flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
       "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program,
       "shininess"),materialShininess );

    render();
}


function render() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(radius*Math.sin(theta)*Math.cos(phi),
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));

    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);

    // normal matrix only really need if there is nonuniform scaling
    // it's here for generality but since there is
    // no scaling in this example we could just use modelView matrix in shaders

    normalMatrix = [
        vec3(modelViewMatrix[0][0], modelViewMatrix[0][1], modelViewMatrix[0][2]),
        vec3(modelViewMatrix[1][0], modelViewMatrix[1][1], modelViewMatrix[1][2]),
        vec3(modelViewMatrix[2][0], modelViewMatrix[2][1], modelViewMatrix[2][2])
    ];

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix) );
    
    for( var i=0; i<index; i+=3)
        gl.drawArrays( gl.TRIANGLES, i, 3 );
	
		for ( var i = 0; i < 6; i++ ) gl.drawArrays( gl.LINE_LOOP, index + i * 4, 4 );
        if(pointsArray.length > index +24){
			gl.drawArrays( gl.LINES, index+24,2 );
			
		}
		
    window.requestAnimFrame(render);
}
