
let THREE = require('three');
let Physijs = require('./lib/physi.js');
let $ = require('jquery');
let buzz = require('./lib/buzz.js');
let kt = require('kutility');

import {SheenScene} from './sheen-scene.es6';
let SheenMesh = require('./sheen-mesh');

let GoldBarXLimit = 25;
let GoldBarMinZ = 30; let GoldBarZRange = 30;

let FenceBuffer = 5;
let FenceWidth = (GoldBarXLimit + FenceBuffer) * 2;
let FenceDepth = GoldBarZRange + FenceBuffer * 2;
let FenceCenterZ = (-GoldBarMinZ + FenceBuffer) - FenceDepth/2;

let WallHeight = 40;

let ClearColor = 0xffffff;

let sounds = [];
let soundFilenames = ['/media/fork', /*'/media/pin',*/ '/media/ting', '/media/thing', '/media/wrench'];
soundFilenames.forEach((filename) => {
  let sound = new buzz.sound(filename, {
    formats: [ "ogg", "mp3"],
    webAudioApi: true,
    volume: 30
  });
  sounds.push(sound);
});

export class MainScene extends SheenScene {

  /// Init

  constructor(renderer, camera, scene, options) {
    super(renderer, camera, scene, options);

    this.name = "[love]-[poem]";

    this.text = "It's so nice<br>" +
                "to wake up in the morning<br>" +
                " all alone<br>" +
                "and not have to tell somebody<br>" +
                " you love them<br>" +
                "when you don't love them<br>" +
                " any more.";

    this.textLines = this.text.split('<br>');

    this.goldBars = [];
  }

  /// Overrides

  enter() {
    super.enter();

    this.renderer.setClearColor(ClearColor, 1);

    this.camera.position.set(0, 25, 20);
    this.camera.rotation.x = -Math.PI / 15;

    this.poemDiv = $('<div class="plaintext-poem"></div>');
    this.poemDiv.html(this.text);
    this.domContainer.append(this.poemDiv);

    this.textMeshes = [];
    this.textLines.forEach((line, index) => {
      let textMesh = createText(line, index + 1);
      textMesh.addTo(this.scene);
      this.textMeshes.push(textMesh);
    });

    this.ground = createGround();
    this.ground.addTo(this.scene);

    this.leftWall = createWall('left');
    this.rightWall = createWall('right');
    this.frontWall = createWall('front');
    this.backWall = createWall('back');
    this.walls = [this.leftWall, this.rightWall, this.frontWall, this.backWall];
    this.walls.forEach((wall) => {
      wall.addTo(this.scene);
    });

    this.makeLights();

    this.goldFrequency = 3000;
  }

  doTimedWork() {
    super.doTimedWork();

    setTimeout(() => {
      this.addGoldBar();
    }, 3000);
  }

  addGoldBar() {
    let goldbarCount = this.goldBars.length;
    let minScale = 0.6;
    let maxScale = Math.max(1.0, Math.min(1.65, (goldbarCount + 22) / 22));
    let scale = minScale + Math.random() * (maxScale - minScale);

    let goldbar = createGoldBar(scale);
    goldbar.addTo(this.scene);
    this.goldBars.push(goldbar);

    setTimeout(() => {
      if (this.goldFrequency > 200) {
        this.goldFrequency *= 0.972;
      }

      this.addGoldBar();
    }, this.goldFrequency);
  }

  exit() {
    super.exit();

    this.renderer.setClearColor(0xffffff, 1);

    this.poemDiv.remove();

    this.textMeshes.forEach((textMesh) => {
      textMesh.removeFrom(this.scene);
    });

    this.goldBars.forEach((goldbar) => {
      goldbar.removeFrom(this.scene);
    });
    this.goldBars = [];

    this.ground.removeFrom(this.scene);

    this.walls.forEach((wall) => {
      wall.removeFrom(this.scene);
    });

    this.scene.remove(this.hemiLight);
    this.scene.remove(this.frontLight);
    this.scene.remove(this.backLight);
  }

  update() {
    super.update();
  }

  // Creation

  makeLights() {
    let scene = this.scene;
    let ground = this.ground;

    this.frontLight = makeDirectionalLight();
    this.frontLight.position.set(-40, 125, 200);
    setupShadow(this.frontLight);

    this.backLight = makeDirectionalLight();
    this.backLight.position.set(40, 125, -200);

    this.leftLight = makeDirectionalLight();
    this.leftLight.position.set(-200, 75, -45);

    this.rightLight = makeDirectionalLight();
    this.rightLight.position.set(200, 75, -45);
    setupShadow(this.rightLight);
    this.rightLight.shadowDarkness = 0.05;

    function makeDirectionalLight() {
      var light = new THREE.DirectionalLight( 0xffffff, 0.9);
      light.color.setHSL( 0.1, 1, 0.95 );
      light.target = ground.mesh;

      scene.add(light);
      return light;
    }

    function setupShadow(light) {
      light.castShadow = true;
      light.shadowCameraFar = 500;
      light.shadowDarkness = 0.6;
      light.shadowMapWidth = light.shadowMapHeight = 4096;
    }
  }

}

function playGoldSound() {
  let sound = kt.choice(sounds);

  if (sound.isPaused() || sound.getTime() > 0.2) {
    sound.setTime(0);
    sound.play();
  }
}

function createText(text, lineNumber) {
  return new SheenMesh({
    meshCreator: (callback) => {
      let geometry = new THREE.TextGeometry(text, {
        size: 2.0,
        height: 0.5,
        font: 'helvetiker',

        bevelThickness: 0.35,
        bevelSize: 0.05,
        bevelSegments: 5,
        bevelEnabled: true,
      });

      geometry.computeBoundingBox();
      geometry.computeFaceNormals();
      geometry.computeVertexNormals();

      let material = new THREE.MeshPhongMaterial({
        map: createGoldTexture(true),

        specular: 0xf9d913,
        shininess: 100,

        side: THREE.DoubleSide
      });

      let mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.rotation.y = -Math.PI / 12;
      mesh.__dirtyRotation = true;

      callback(geometry, material, mesh);
    },

    position: positionForLineNumber(lineNumber)
  });

  function positionForLineNumber(lineNumber) {
    if (!lineNumber) lineNumber = 1;

    let firstLineY = WallHeight;
    let thisLineY = firstLineY - lineNumber * 4;

    let firstLineZ = -GoldBarMinZ - 7;

    return new THREE.Vector3(2, thisLineY, firstLineZ);
  }
}

function createGoldBar(scale) {
  return new SheenMesh({
    meshCreator: (callback) => {
      let geometry = new THREE.BoxGeometry(7, 3.625, 1.75);

      let rawMaterial = new THREE.MeshPhongMaterial({
        map: createGoldTexture(false),

        specular: 0xffd700,
        shininess: 100,

        side: THREE.DoubleSide
      });

      // give decent average values for friction and restitution
      let material = Physijs.createMaterial(rawMaterial, 0.4, 0.6);

      let mesh = new Physijs.BoxMesh(geometry, material, 5);
      mesh.castShadow = true;

      callback(geometry, material, mesh);
    },

    position: randomGoldPosition(),

    scale: scale,

    collisionHandler: () => {
      playGoldSound();
    }
  });

  function randomGoldPosition() {
    var x = -GoldBarXLimit + Math.random() * (GoldBarXLimit * 2);
    var y = 40 + Math.random() * 60;
    var z = -GoldBarMinZ - Math.random() * GoldBarZRange;
    return new THREE.Vector3(x, y, z);
  }
}

function createGoldTexture(useOld) {
  let name = useOld ? '/media/gold.jpg' : '/media/gold1.jpg';
  let texture = THREE.ImageUtils.loadTexture(name);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  return texture;
}

function createGround() {
  return new SheenMesh({
    meshCreator: (callback) => {
      let geometry = new THREE.PlaneGeometry(FenceWidth * 5, FenceDepth * 5);
      computeGeometryThings(geometry);

      let rawMaterial = new THREE.MeshBasicMaterial({
        color: ClearColor,
        side: THREE.DoubleSide
      });

      // lets go high friction, low restitution
      let material = Physijs.createMaterial(rawMaterial, 0.8, 0.4);

      let mesh = new Physijs.BoxMesh(geometry, material, 0);
      mesh.rotation.x = -Math.PI / 2;
      mesh.__dirtyRotation = true;

      mesh.receiveShadow = true;

      callback(geometry, material, mesh);
    },

    position: new THREE.Vector3(0, 0, (-GoldBarMinZ + FenceBuffer) - FenceDepth * 5 / 2),

    collisionHandler: () => {

    }
  });
}

function createWall(direction) {
  var position = new THREE.Vector3();
  switch (direction) {
    case 'left':
      position.set(-GoldBarXLimit - FenceBuffer, WallHeight/2 , FenceCenterZ);
      break;

    case 'right':
      position.set(GoldBarXLimit + FenceBuffer, WallHeight/2 , FenceCenterZ);
      break;

    case 'back':
      position.set(0, WallHeight/2, -GoldBarMinZ - GoldBarZRange - FenceBuffer);
      break;

    case 'front':
      position.set(0, WallHeight/2, -GoldBarMinZ + FenceBuffer);
      break;
  }

  return new SheenMesh({
    meshCreator: (callback) => {
      var geometry;
      switch (direction) {
        case 'left':
        case 'right':
          geometry = new THREE.BoxGeometry(1, WallHeight, FenceDepth);
          break;

        case 'back':
        case 'front':
          geometry = new THREE.BoxGeometry(FenceWidth, WallHeight, 1);
          break;
      }

      if (!geometry) {
        callback(null, null, null);
        return;
      }

      computeGeometryThings(geometry);

      let rawMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.0
      });

      // lets go high friction, low restitution
      let material = Physijs.createMaterial(rawMaterial, 0.8, 0.4);

      let mesh = new Physijs.BoxMesh(geometry, material, 0);

      callback(geometry, material, mesh);
    },

    position: position,

    collisionHandler: () => {
      //console.log('wall collision!');
    }
  });
}

function computeGeometryThings(geometry) {
  geometry.computeFaceNormals();
  geometry.computeVertexNormals();
}
