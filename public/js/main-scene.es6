
let THREE = require('three');
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

    // setup all of the timeout based events
  }

  exit() {
    super.exit();

    this.renderer.setClearColor(0xffffff, 1);

    this.poemDiv.remove();

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
