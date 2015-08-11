
let $ = require('jquery');
let THREE = require('three');
let Physijs = require('./lib/physi.js');

import {ThreeBoiler} from './three-boiler.es6';
import {MainScene} from './main-scene.es6';

let FlyControls = require('./controls/fly-controls');

class Sheen extends ThreeBoiler {
  constructor() {
    super({
      antialias: true,
      alpha: true
    });

    this.renderer.shadowMapEnabled = true;
    this.renderer.shadowMapCullFace = THREE.CullFaceBack;

    this.renderer.gammaInput = true;
	  this.renderer.gammaOutput = true;

    this.controls = new FlyControls(this.camera);
    this.scene.add(this.controls.getObject());

    $(document).click(() => {
      if (this.controls.requestPointerlock) {
        this.controls.requestPointerlock();
      }
      this.controls.enabled = true;
    });

    this.mainScene = new MainScene(this.renderer, this.camera, this.scene, {});
  }

  createScene() {
    var scene = new Physijs.Scene();

    scene.setGravity(new THREE.Vector3(0, -100, 0));

    scene.addEventListener('update', function() {
      // here wanna apply new forces to objects and things based on state
      scene.simulate(undefined, 1);
    });

    return scene;
  }

  activate() {
    super.activate();

    this.scene.simulate();

    this.mainScene.startScene();
  }

  render() {
    super.render();

    this.controls.update();
  }
}

$(function() {
  var sheen = new Sheen();
  sheen.activate();
});
