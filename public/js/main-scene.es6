
let THREE = require('three');
let Physijs = require('./lib/physi.js');
let $ = require('jquery');

import {SheenScene} from './sheen-scene.es6';
let SheenMesh = require('./sheen-mesh');

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

    this.poemDiv = $('<div class="plaintext-poem"></div>');
    this.poemDiv.html(this.text);
    this.domContainer.append(this.poemDiv);

    // add shit to your scene
  }

  doTimedWork() {
    super.doTimedWork();

    setInterval(() => {
      var goldbar = new GoldBar({
        position: randomGoldPosition(),

        collisionHandler: () => {
          console.log('collision!');
        }
      });

      goldbar.addTo(this.scene);

      this.goldBars.push(goldbar);
    }, 2000);
  }

  exit() {
    super.exit();

    this.renderer.setClearColor(0xffffff, 1);

    this.poemDiv.remove();

    this.goldBars.forEach((goldbar) => {
      goldbar.removeFrom(this.scene);
    });
    this.goldBars = [];

    // remove all your scene-specific stuff
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

class GoldBar extends SheenMesh {
  constructor(options) {
    options.meshCreator = (callback) => {
      var geometry = new THREE.BoxGeometry(2, 2, 2);

      var rawMaterial = new THREE.MeshBasicMaterial({
        color: 0xf9d902,
        side: THREE.DoubleSide
      });

      // give decent average values for friction and restitution
      var material = Physijs.createMaterial(rawMaterial, 0.4, 0.6);

      var mesh = new Physijs.BoxMesh(geometry, material, 5);

      callback(geometry, material, mesh);
    };

    super(options);
  }
}

function randomGoldPosition() {
  var x = -20 + Math.random() * 40;
  var y = Math.random() * 30;
  var z = -30 + Math.random() * -40;
  return new THREE.Vector3(x, y, z);
}
