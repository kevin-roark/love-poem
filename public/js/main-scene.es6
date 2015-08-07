
let THREE = require('three');
let $ = require('jquery');

import {SheenScene} from './sheen-scene.es6';
let SheenMesh = require('./sheen-mesh');

export class MainScene extends SheenScene {

  /// Init

  constructor(renderer, camera, scene, options) {
    super(renderer, camera, scene, options);

    this.name = "SHEEN";
  }

  /// Overrides

  enter() {
    super.enter();

    this.renderer.setClearColor(0x000000, 1);

    // add shit to your scene
  }

  doTimedWork() {
    super.doTimedWork();

    // setup all of the timeout based events
  }

  exit() {
    super.exit();

    this.renderer.setClearColor(0xffffff, 1);

    // remove all your scene-specific stuff
  }

  resize() {
    if (this.active) {
      // custom dom layout etc
    }
  }

  update() {
    super.update();

    // custom update werk
  }

}
