
let THREE = require('three');
let Physijs = require('./lib/physi.js');
let $ = require('jquery');

import {SheenScene} from './sheen-scene.es6';
let SheenMesh = require('./sheen-mesh');

let GoldBarXLimit = 25;
let GoldBarMinZ = 30; let GoldBarZRange = 30;

let FenceBuffer = 5;
let FenceWidth = (GoldBarXLimit + FenceBuffer) * 2;
let FenceDepth = GoldBarZRange + FenceBuffer * 2;
let FenceCenterZ = (-GoldBarMinZ + FenceBuffer) - FenceDepth/2;

let WallHeight = 40;

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

    this.goldBars = [];
  }

  /// Overrides

  enter() {
    super.enter();

    this.renderer.setClearColor(0x000000, 1);

    this.camera.position.set(0, 25, 20);
    this.camera.rotation.x = -Math.PI / 15;

    this.poemDiv = $('<div class="plaintext-poem"></div>');
    this.poemDiv.html(this.text);
    this.domContainer.append(this.poemDiv);

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
  }

  doTimedWork() {
    super.doTimedWork();

    setInterval(() => {
      var goldbar = createGoldBar();
      goldbar.addTo(this.scene);
      this.goldBars.push(goldbar);
    }, 1000);
  }

  exit() {
    super.exit();

    this.renderer.setClearColor(0xffffff, 1);

    this.poemDiv.remove();

    this.goldBars.forEach((goldbar) => {
      goldbar.removeFrom(this.scene);
    });
    this.goldBars = [];

    this.ground.removeFrom(this.scene);

    this.walls.forEach((wall) => {
      wall.removeFrom(this.scene);
    });
  }

  resize() {
    if (this.active) {
      // custom dom layout etc
    }
  }

  update() {
    super.update();

    this.goldBars.forEach((goldbar) => {
      goldbar.update();
    });
  }

}

function createGoldBar() {
  return new SheenMesh({
    meshCreator: (callback) => {
      let geometry = new THREE.BoxGeometry(7, 3.625, 1.75);

      let rawMaterial = new THREE.MeshBasicMaterial({
        color: 0xf9d902,
        side: THREE.DoubleSide
      });

      // give decent average values for friction and restitution
      let material = Physijs.createMaterial(rawMaterial, 0.4, 0.6);

      let mesh = new Physijs.BoxMesh(geometry, material, 5);

      callback(geometry, material, mesh);
    },

    position: randomGoldPosition(),

    collisionHandler: () => {
      console.log('gold collision!');
    }
  });

  function randomGoldPosition() {
    var x = -GoldBarXLimit + Math.random() * (GoldBarXLimit * 2);
    var y = Math.random() * (WallHeight - 5);
    var z = -GoldBarMinZ - Math.random() * GoldBarZRange;
    return new THREE.Vector3(x, y, z);
  }
}

function createGround() {
  return new SheenMesh({
    meshCreator: (callback) => {
      let geometry = new THREE.PlaneGeometry(FenceWidth, FenceDepth);
      computeGeometryThings(geometry);

      let rawMaterial = new THREE.MeshBasicMaterial({
        color: 0x0000ff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.0
      });

      // lets go high friction, low restitution
      let material = Physijs.createMaterial(rawMaterial, 0.8, 0.4);

      let mesh = new Physijs.BoxMesh(geometry, material, 0);
      mesh.rotation.x = -Math.PI / 2;
      mesh.__dirtyRotation = true;

      callback(geometry, material, mesh);
    },

    position: new THREE.Vector3(0, 0, FenceCenterZ),

    collisionHandler: () => {
      console.log('ground collision!');
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
      console.log('wall collision!');
    }
  });
}

function computeGeometryThings(geometry) {
  geometry.computeFaceNormals();
  geometry.computeVertexNormals();
}
