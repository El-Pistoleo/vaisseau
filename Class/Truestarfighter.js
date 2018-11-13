// This program was developped by Daniel Audet and uses the file "basic-objects-IFS.js"
// from http://math.hws.edu/eck/cs424/notes2013/19_GLSL.html
//
//  It has been adapted to be compatible with the "MV.js" library developped
//  for the book "Interactive Computer Graphics" by Edward Angel and Dave Shreiner.
//

"use strict";

var gl;   // The webgl context.

var CoordsLoc;       // Location of the coords attribute variable in the standard texture mappping shader program.
var NormalLoc;
var TexCoordLoc;

var ProjectionLoc;     // Location of the uniform variables in the standard texture mappping shader program.
var ModelviewLoc;
var NormalMatrixLoc;


var instanceMatrix = mat4();

var projection;   //--- projection matrix
var modelview;    // modelview matrix
var flattenedmodelview;    //--- flattened modelview matrix

var normalMatrix = mat3();  //--- create a 3X3 matrix that will affect normals

var rotator;   // A SimpleRotator object to enable rotation by mouse dragging.
var stack = [];
var figure = [];  // array containing the structure
var theta = [];

var sphere, reactor, triangleRectangle, triangleCenter, cube, blaster, tetra;

var prog;  // shader program identifier

var angle = -45;
var testAngle = true;

var lightPosition = vec4(20.0, 20.0, 100.0, 1.0);

var lightAmbient = vec4(1.0, 1.0, 1.0, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(0.1, 0.1, 0.1, 1.0);
var materialDiffuse = vec4(0.48, 0.55, 0.69, 1.0);
var materialSpecular = vec4(0.48, 0.48, 0.48, 1.0);
var materialShininess = 100.0;

var ambientProduct, diffuseProduct, specularProduct;

var numNodes = 18;

var baseId = 0;
var left_reactorID = 1;
var right_reactorID = 2;
var f_Left_WingIDFront = 3;
var f_Right_WingIDFront = 4;
var f_Left_WingIDBack = 5;
var f_Right_WingIDBack = 6;
var r_blaster = 7;
var l_blaster = 8;
var n_wingLeftId = 9;
var n_wingRightId = 10;
var n_wingLeftRotationUp = 11;
var n_wingRightRotationUp = 12;
var n_wingLeftRotationDown = 13;
var n_wingRightRotationDown = 14;
var b_reacId = 15;
var protectLeftId = 16;
var protectRightId = 17;

var cockpitLength = 25;
var cockpitHeight = 7.5;
var cockpitWidth = 7.5;

var scaleVaisseau = 2;

var projection;   //--- projection matrix
var modelview;    // modelview matrix
var localmodelview;   // local modelview matrix used by the render methods
var flattenedmodelview;    //--- flattened modelview matrix

function render() {

      projection = perspective(60.0, 1.0, 1.0, 2000.0);

      //--- Get the rotation matrix obtained by the displacement of the mouse
      //---  (note: the matrix obtained is already "flattened" by the function getViewMatrix)
      flattenedmodelview = rotator.getViewMatrix();
      modelview = unflatten(flattenedmodelview);

    gl.clearColor(0.8, 0.8, 0.8, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var pos = [0,0,0];
    traverse(baseId);

}



function initNodes(Id) {
// view-source:http://www.uqac.ca/daudet/Cours/Infographie/demos/Classes-2017-projets/da-costa-lucas/vaisseau.html
  var m = mat4();

  switch(Id) {

    //Dessin du cockpit
    case baseId:
    // create a node
    figure[baseId] = createNode( m, drawCockpit, f_Left_WingIDFront, protectLeftId );
    break;

    //Dessin du Réacteur gauche
    case left_reactorID:
    // positions the object in the scene
    m = mult(m, rotate(90, 0, 1, 0));
    m = mult(m, translate(1, 0, 4, 0));
    // create a node
    figure[left_reactorID] = createNode( m, reactor, null, right_reactorID);
    break;

    //Dessin du Réacteur droit (Il se place par rapport au réacteur gauche)
    case right_reactorID:
    // positions the object in the scene
    m = mult(m, translate(-2, 0 ,0));
    // create a node
    figure[right_reactorID] = createNode( m, reactor, null, null );
    break;

    //Dessin de l'aile avant gauche (Juste les 2 triangles)
    case f_Left_WingIDFront:
    // create a node
    m = mult(m, rotate(105, 1, 0, 0));
    m = mult(m, translate(-0.75*cockpitLength, cockpitWidth+1, -cockpitHeight/2));
    figure[f_Left_WingIDFront] = createNode( m, f_wingFront, f_Left_WingIDBack, null);
    break;

    //Dessin de l'aile avant droite (Juste les 2 triangles)
    case f_Right_WingIDFront :
    // create a node
    m = mult(m, scale(1, 1, -1));
    m = mult(m, rotate(105, 1, 0, 0));
    m = mult(m, translate(-0.75*cockpitLength, cockpitWidth+1, -cockpitHeight/2));
    figure[f_Right_WingIDFront] = createNode( m, f_wingFront , f_Right_WingIDBack, r_blaster );
    break;

    //Dessin de l'aile arriere gauche (Toute la partie arrière avec le cylindre qui maintient les ailrons)
    case f_Left_WingIDBack:
    // create a node
    m = mult(m, rotate(105, 1, 0, 0));
    m = mult(m, translate(-0.75*cockpitLength, cockpitWidth+1.5, -cockpitHeight/2));
    m = mult(m, rotate(-66, 0, 0, 1));
    figure[f_Left_WingIDBack] = createNode( m, f_wingNear, f_Right_WingIDFront , l_blaster);
    break;

    //Dessin de l'aile arriere droite (Toute la partie arrière avec le cylindre qui maintient les ailrons)
    case f_Right_WingIDBack:
    // create a node
    m = mult(m, scale4(1, 1, -1));
    m = mult(m, rotate(105, 1, 0, 0));
    m = mult(m, translate(-0.75*cockpitLength, cockpitWidth+1.5, -cockpitHeight/2));
    m = mult(m, rotate(-66, 0, 0, 1));
    figure[f_Right_WingIDBack] = createNode( m, f_wingNear , b_reacId, n_wingRightId );
    break;

    //Dessin du blaster situé à droite
    case r_blaster:
    // create a node
    m = mult(m, rotate(90, 0, 1, 0  ));
    m = mult(m, rotate(90, 0, 0, 1  ));
    m = mult(m, translate(-5.5, 6.5, 0));
    figure[r_blaster] = createNode( m, blaster , null, null );
    break;

    //Dessin du blaster situé à gauche
    case l_blaster:
    // create a node
    m = mult(m, rotate(90, -1, 0, 0  ));
    m = mult(m, rotate(23, 0, 1, 0  ));
    m = mult(m, translate(6, -6.5, 0));
    figure[l_blaster] = createNode( m, blaster , n_wingLeftId,  null);
    break;


    case n_wingLeftId:
    // create a node
    m = mult(m, translate(6, 15, 6.5));
    m = mult(m, rotate(-22, 0, 0, 1  ));
    figure[n_wingLeftId] = createNode( m, partLeft , null,  n_wingLeftRotationUp);
    break;

    case n_wingRightId:
    // create a node
    m = mult(m, translate(6, 15, 6.5));
    m = mult(m, rotate(-22, 0, 0, 1  ));
    figure[n_wingRightId] = createNode( m, partLeft , null,  n_wingRightRotationUp);
    break;

    //Dessin des ailerons
    case n_wingLeftRotationUp:
    // create a node
    m = mult(m, translate(-8, 0, -1.2));
    figure[n_wingLeftRotationUp] = createNode( m, wingRotate , n_wingLeftRotationDown,  null);
    break;

    //Dessin des ailerons
    case n_wingRightRotationUp:
    // create a node.
    m = mult(m, translate(-8, 0, -1.2));
    figure[n_wingRightRotationUp] = createNode( m, wingRotate , n_wingRightRotationDown,  null);
    break;

    //Dessin des ailerons
    case n_wingLeftRotationDown:
    // create a node
    m = mult(m, scale(1, 1, -1));

    m = mult(m, translate(-8, 0, -1.2));
    figure[n_wingLeftRotationDown] = createNode( m, wingRotate , null,  null);
    break;

    //Dessin des ailerons
    case n_wingRightRotationDown:
    // create a node.
    m = mult(m, scale(1, 1, -1));
    m = mult(m, translate(-8, 0, -1.2));
    figure[n_wingRightRotationDown] = createNode( m, wingRotate , null,  null);
    break;

    //Dessin du dessous du vaisseau
    case b_reacId:
    // create a node.
    m = mult(m, translate(4, -6 , 0));
    figure[b_reacId] = createNode( m, b_reac , null,  left_reactorID);
    break;

    //Dessin des protections situées à côté du cockpit
    case protectLeftId:
    // create a node.
    m = mult(m, translate(-10, -3 , 5));
    figure[protectLeftId] = createNode( m, protectionCote , null,  protectRightId);
    break;

    //Dessin des protections situées à côté du cockpit
    case protectRightId:
    // create a node.
    m = mult(m, translate(0, 0 , -10));
    m = mult(m, scale(1, 1 , -1));

    figure[protectRightId] = createNode( m, protectionCote , null,  null);
    break;


  }
}


function traverse(Id) {

  if(Id == null) return;
  stack.push(modelview);
  modelview = mult(modelview, figure[Id].transform);

  if(Id >= n_wingLeftRotationUp && Id <= n_wingRightRotationDown){
    modelview = mult(modelview, rotate(angle, 0, 1, 0));
    console.log(angle);
    if(!testAngle){
      if(angle < -45){
        angle++;
      }
    }else{
      if(angle > -90){
        angle--;
      }
    }
  }

  figure[Id].render();
  if(figure[Id].child != null) traverse(figure[Id].child);
  modelview = stack.pop();
  if(figure[Id].sibling != null) traverse(figure[Id].sibling);
}



function createNode(transform, render, sibling, child){
  var node = {
    transform: transform,
    render: render,
    sibling: sibling,
    child: child,
  }
  return node;
}


//Les protections sur le côté du cockpit
function protectionCote(){
  var baseModelView = modelview;

  modelview = mult(modelview, translate(0.1, 0, -1));
  modelview = mult(modelview, rotate(-10, 0, 1, 0));
  normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
  modelview = mult(modelview, scale4(0.15, 0.08, 0.12));
  triangleRectangle.render();

  modelview = baseModelView;
  modelview = mult(modelview, translate(5.1, 0.9, -2));
  normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
  modelview = mult(modelview, scale4(-0.08, 0.04, 0.18));
  triangleRectangle.render();

  modelview = baseModelView;
  modelview = mult(modelview, translate(7, -1, 2.5));
  normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
  modelview = mult(modelview, scale4(1.2, 0.3, 0.06));
  cube.render();

  modelview = baseModelView;
  modelview = mult(modelview, translate(11, -0.6, 1.6));
  modelview = mult(modelview, rotate(-110, 0, 1, 0));
  normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
  modelview = mult(modelview, scale4(0.35, 0.25, 0.1));
  cube.render();

  modelview = baseModelView;

}

//Le cockpit
function drawCockpit(){
  var baseModelView = modelview;

  modelview = mult(modelview, rotate(-90, 0, 1, 0));

  normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
  modelview = mult(modelview, scale4(0.3, 0.28, 0.5));
  sphere.render();

  modelview = baseModelView;
  modelview = mult(modelview, translate(-11, 0, 0));
  modelview = mult(modelview, rotate(90, 0, 1, 0));
  normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
  modelview = mult(modelview, scale4(1.6, 1.6, 0.1));
  reactor.render();

  modelview = baseModelView;
}

//Le dessous du cockpit
function b_reac(){
  var baseModelView = modelview;

  modelview = mult(modelview, rotate(90, 1, 0, 0));
  normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
  modelview = mult(modelview, scale4(0.3, 0.33, 0.1));
  pave2.render();

  modelview = baseModelView;
  modelview = mult(modelview, translate(0, -2, 0));
  modelview = mult(modelview, rotate(90, 1, 0, 0));
  normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
  modelview = mult(modelview, scale4(0.1, 0.05, 0.05));
  pave2.render();

  modelview = baseModelView;

}

//Les ailerons
function wingRotate(){
  var baseModelView = modelview;

  normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
  modelview = mult(modelview, scale4(0.02, 0.35, 0.1, 0));
  pave2.render();

  modelview = baseModelView;
  modelview = mult(modelview, rotate(180, 1, 0, 0));
  modelview = mult(modelview, translate(0, 0, 3.7));
  normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
  modelview = mult(modelview, scale4(0.02, 0.35, 0.2, 0));
  pave2.render();

  modelview = baseModelView;
}

//La partie arrière des ailes
function partLeft(){
  var baseModelView = modelview;

  normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
  modelview = mult(modelview, scale4(1.27 , 2, 0.08));
  cube.render();

  modelview = baseModelView;
  modelview = mult(modelview, rotate(90 , 0, -1, 0));
  modelview = mult(modelview, translate(0, 0, 6));
  normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
  modelview = mult(modelview, scale4(0.02 , 0.52, 0.2));
  pave2.render();

  modelview = baseModelView;
  modelview = mult(modelview, translate(0, 7.8, -6.5));
  normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
  modelview = mult(modelview, scale4(0.17, 0.07, 0.25));
  triangleRectangle.render();

  modelview = baseModelView;
  modelview = mult(modelview, rotate(90, 1, 0, 0));
  modelview = mult(modelview, translate(-8.5, 0, 0));
  normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
  modelview = mult(modelview, scale4(0.4, 0.4, 0.6));
  reactor.render();

  modelview = baseModelView;
}

//Les réacteurs
function reactor(){
  var baseModelView = modelview;

  normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
  modelview = mult(modelview, scale4(0.3, 0.3, 0.8));
   // modelview = mult(modelview, scale4(5, 5, 0.8));
  reactor.render();
  modelview = baseModelView;

}


//Le devant des ailes
function f_wingFront(){
  var baseModelView = modelview;

  normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
  modelview = mult(modelview, scale4(0.4 , 0.2, 0.25));
  triangleRectangle.render();

  modelview = baseModelView;
  modelview = mult(modelview, translate(0 , -2, 6));
  modelview = mult(modelview, rotate(90 , 0, 1, 0));
  normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
  modelview = mult(modelview, scale4(0.4 , 0.4, 0.4));
  tetra.render();

  modelview = baseModelView;
}

//Inutilisée mais permet le placement des autres objets (Il s'agit d'une erreur de ma part)
function f_wingNear(){}

//Les blaster situé au milieu
function blaster(){
    var baseModelView = modelview;
    var inc, scaling;

    modelview = mult(modelview, translate(0, 0, 3));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale4(0.07, 0.07, 1));
    blaster.render();

    modelview = baseModelView;
    modelview = mult(modelview, translate(0, 0, 1));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale4(0.14, 0.14, 0.8));
    blaster.render();

    modelview = baseModelView;
    modelview = mult(modelview, translate(0, 0, 5));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale4(0.4, 0.14, 0.28));
    blaster.render();

    modelview = baseModelView;
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, translate(0, 0, -4+3));
    modelview = mult(modelview, scale4(0.07, 0.07, 0.8));
    blaster.render();

    modelview = baseModelView;
    modelview = mult(modelview, translate(0, 0, -8+3));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale4(0.16, 0.16, 0.8));
    blaster.render();

    modelview = baseModelView;
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, translate(0, 0, -7));
    modelview = mult(modelview, scale4(0.07, 0.07, 0.7));
    blaster.render();

    modelview = baseModelView;
    modelview = mult(modelview, translate(0, 0, -9));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale4(0.16, 0.16, 0.3));
    blaster.render();

    modelview = baseModelView;
    modelview = mult(modelview, translate(0, 0, -9.8));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale4(0.14, 0.14, 0.2));
    blaster.render();

    modelview = baseModelView;
    modelview = mult(modelview, translate(0, 0, -10));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale4(0.08, 0.08, 0.2));
    blaster.render();

    modelview = baseModelView;
    modelview = mult(modelview, translate(0, 0, -10.4));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale4(0.06, 0.06, 0.2));
    blaster.render();

    modelview = baseModelView;
    modelview = mult(modelview, translate(0, 0, -10.6));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale4(0.04, 0.04, 0.26));
    blaster.render();

    modelview =  baseModelView;

}

function scale4(a, b, c) {
   var result = mat4();
   result[0][0] = a;
   result[1][1] = b;
   result[2][2] = c;
   return result;
}



function getRandomArbitrary(min, max) {
  return Math.floor((Math.random() * max) + min);
}


function unflatten(matrix) {
  var result = mat4();
  result[0][0] = matrix[0]; result[1][0] = matrix[1]; result[2][0] = matrix[2]; result[3][0] = matrix[3];
  result[0][1] = matrix[4]; result[1][1] = matrix[5]; result[2][1] = matrix[6]; result[3][1] = matrix[7];
  result[0][2] = matrix[8]; result[1][2] = matrix[9]; result[2][2] = matrix[10]; result[3][2] = matrix[11];
  result[0][3] = matrix[12]; result[1][3] = matrix[13]; result[2][3] = matrix[14]; result[3][3] = matrix[15];

  return result;
}

function extractNormalMatrix(matrix) { // This function computes the transpose of the inverse of
  // the upperleft part (3X3) of the modelview matrix (see http://www.lighthouse3d.com/tutorials/glsl-tutorial/the-normal-matrix/ )

  var result = mat3();
  var upperleft = mat3();
  var tmp = mat3();

  upperleft[0][0] = matrix[0][0];  // if no scaling is performed, one can simply use the upper left
  upperleft[1][0] = matrix[1][0];  // part (3X3) of the modelview matrix
  upperleft[2][0] = matrix[2][0];

  upperleft[0][1] = matrix[0][1];
  upperleft[1][1] = matrix[1][1];
  upperleft[2][1] = matrix[2][1];

  upperleft[0][2] = matrix[0][2];
  upperleft[1][2] = matrix[1][2];
  upperleft[2][2] = matrix[2][2];

  tmp = matrixinvert(upperleft);
  result = transpose(tmp);

  return result;
}

function matrixinvert(matrix) {

  var result = mat3();

  var det = matrix[0][0] * (matrix[1][1] * matrix[2][2] - matrix[2][1] * matrix[1][2]) -
  matrix[0][1] * (matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]) +
  matrix[0][2] * (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0]);

  var invdet = 1 / det;

  // inverse of matrix m
  result[0][0] = (matrix[1][1] * matrix[2][2] - matrix[2][1] * matrix[1][2]) * invdet;
  result[0][1] = (matrix[0][2] * matrix[2][1] - matrix[0][1] * matrix[2][2]) * invdet;
  result[0][2] = (matrix[0][1] * matrix[1][2] - matrix[0][2] * matrix[1][1]) * invdet;
  result[1][0] = (matrix[1][2] * matrix[2][0] - matrix[1][0] * matrix[2][2]) * invdet;
  result[1][1] = (matrix[0][0] * matrix[2][2] - matrix[0][2] * matrix[2][0]) * invdet;
  result[1][2] = (matrix[1][0] * matrix[0][2] - matrix[0][0] * matrix[1][2]) * invdet;
  result[2][0] = (matrix[1][0] * matrix[2][1] - matrix[2][0] * matrix[1][1]) * invdet;
  result[2][1] = (matrix[2][0] * matrix[0][1] - matrix[0][0] * matrix[2][1]) * invdet;
  result[2][2] = (matrix[0][0] * matrix[1][1] - matrix[1][0] * matrix[0][1]) * invdet;

  return result;
}

// The following function is used to create an "object" (called "model") containing all the informations needed
// to draw a particular element (sphere, cylinder, cube,...).
// Note that the function "model.render" is defined inside "createModel" but it is NOT executed.
// That function is only executed when we call it explicitly in render().

function createModel(modelData) {

  // the next line defines an "object" in Javascript
  // (note that there are several ways to define an "object" in Javascript)
  var model = {};

  // the following lines defines "members" of the "object"
  model.coordsBuffer = gl.createBuffer();
  model.normalBuffer = gl.createBuffer();
  model.textureBuffer = gl.createBuffer();
  model.indexBuffer = gl.createBuffer();
  model.count = modelData.indices.length;

  // the "members" are then used to load data from "modelData" in the graphic card
  gl.bindBuffer(gl.ARRAY_BUFFER, model.coordsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexPositions, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexNormals, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, model.textureBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexTextureCoords, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, modelData.indices, gl.STATIC_DRAW);

  // The following function is NOT executed here. It is only DEFINED to be used later when we
  // call the ".render()" method.
  model.render = function () {
    gl.bindBuffer(gl.ARRAY_BUFFER, this.coordsBuffer);
    gl.vertexAttribPointer(CoordsLoc, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
    gl.vertexAttribPointer(NormalLoc, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
    gl.vertexAttribPointer(TexCoordLoc, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

    gl.uniformMatrix4fv(ModelviewLoc, false, flatten(modelview));    //--- load flattened modelview matrix
    gl.uniformMatrix3fv(NormalMatrixLoc, false, flatten(normalMatrix));  //--- load flattened normal matrix

    gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
    //  console.log(this.count);
  }

  // we now return the "object".
  return model;
}



function createProgram(gl, vertexShaderSource, fragmentShaderSource) {
  var vsh = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vsh, vertexShaderSource);
  gl.compileShader(vsh);
  if (!gl.getShaderParameter(vsh, gl.COMPILE_STATUS)) {
    throw "Error in vertex shader:  " + gl.getShaderInfoLog(vsh);
  }
  var fsh = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fsh, fragmentShaderSource);
  gl.compileShader(fsh);
  if (!gl.getShaderParameter(fsh, gl.COMPILE_STATUS)) {
    throw "Error in fragment shader:  " + gl.getShaderInfoLog(fsh);
  }
  var prog = gl.createProgram();
  gl.attachShader(prog, vsh);
  gl.attachShader(prog, fsh);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    throw "Link error in program:  " + gl.getProgramInfoLog(prog);
  }
  return prog;
}


function getTextContent(elementID) {
  var element = document.getElementById(elementID);
  var fsource = "";
  var node = element.firstChild;
  var str = "";
  while (node) {
    if (node.nodeType == 3) // this is a text node
    str += node.textContent;
    node = node.nextSibling;
  }
  return str;
}


window.onload = function init() {
  try {
    var canvas = document.getElementById("glcanvas");
    gl = canvas.getContext("webgl");
    if (!gl) {
      gl = canvas.getContext("experimental-webgl");
    }
    if (!gl) {
      throw "Could not create WebGL context.";
    }



    var openWings = document.getElementById("openWings");
    var closeWings = document.getElementById("closeWings");

    closeWings.onclick = function(){
      testAngle = true;
    }
    openWings.onclick = function(){
      testAngle = false;
    }

    // LOAD SHADER (standard texture mapping)
    var vertexShaderSource = getTextContent("vshader");
    var fragmentShaderSource = getTextContent("fshader");
    prog = createProgram(gl, vertexShaderSource, fragmentShaderSource);

    gl.useProgram(prog);

    // locate variables for further use
    CoordsLoc = gl.getAttribLocation(prog, "vcoords");
    NormalLoc = gl.getAttribLocation(prog, "vnormal");
    TexCoordLoc = gl.getAttribLocation(prog, "vtexcoord");

    ModelviewLoc = gl.getUniformLocation(prog, "modelview");
    ProjectionLoc = gl.getUniformLocation(prog, "projection");
    NormalMatrixLoc = gl.getUniformLocation(prog, "normalMatrix");

    gl.enableVertexAttribArray(CoordsLoc);
    gl.enableVertexAttribArray(NormalLoc);
    gl.disableVertexAttribArray(TexCoordLoc);  // we do not need texture coordinates

    gl.enable(gl.DEPTH_TEST);

    //  create a "rotator" monitoring mouse mouvement

    rotator = new SimpleRotator(canvas, null);
    //  set initial camera position at z=40, with an "up" vector aligned with y axis
    //   (this defines the initial value of the modelview matrix )
    rotator.setView([0, 0, 1], [0, 1, 0], 40);

    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(gl.getUniformLocation(prog, "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(prog, "diffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(prog, "specularProduct"), flatten(specularProduct));
    gl.uniform1f(gl.getUniformLocation(prog, "shininess"), materialShininess);

    gl.uniform4fv(gl.getUniformLocation(prog, "lightPosition"), flatten(lightPosition));

    projection = perspective(120.0, 1.0, 1.0, 200.0);
    gl.uniformMatrix4fv(ProjectionLoc, false, flatten(projection));  // send projection matrix to the shader program




    // In the following lines, we create different "elements" (sphere, cylinder, box, disk,...).
    // These elements are "objects" returned by the "createModel()" function.
    // The "createModel()" function requires one parameter which contains all the information needed
    // to create the "object". The functions "uvSphere()", "uvCylinder()", "cube()",... are described
    // in the file "basic-objects-IFS.js". They return an "object" containing vertices, normals,
    // texture coordinates and indices.
    //

    for( var i=0; i<numNodes; i++) figure[i] = createNode(null, null, null, null);

        for( var i=0; i<numNodes; i++){
          theta[i] = 0.0;
          initNodes(i);
        }

    sphere = createModel(uvSphereCoupe(25, 25.0, 50));
    triangleRectangle = createModel(largeTriangle(25, 0,2));
    triangleCenter = createModel(largeTriangle(25, 90, 2));

    reactor = createModel(uvCylinder(2, 5, 25, true, false));
    blaster = createModel(uvCylinder(2, 5, 25, false, false));

    pave2 = createModel(pave2(25, 12.5));
    pave = createModel(pave(25, 12.5));

    cube = createModel(cube(6.25));

    tetra = createModel(tetra(6.25));

  }
  catch (e) {
    document.getElementById("message").innerHTML =
    "Could not initialize WebGL: " + e;
    return;
  }

  resize(canvas);  // size the canvas to the current window width and height
  setInterval(render, 50);

}

function resize(canvas) {  // ref. https://webglfundamentals.org/webgl/lessons/webgl-resizing-the-canvas.html
  var realToCSSPixels = window.devicePixelRatio;

  var actualPanelWidth = Math.floor(0.85 * window.innerWidth * realToCSSPixels); // because, in the HTML file, we have set the right panel to be 85% of the window width
  var actualPanelHeight = Math.floor(0.96 * window.innerHeight * realToCSSPixels);

  var minDimension = Math.min(actualPanelWidth, actualPanelHeight);

  // Ajust the canvas to this dimension (square)
  canvas.width  = minDimension;
  canvas.height = minDimension;

  gl.viewport(0, 0, canvas.width, canvas.height);

}
