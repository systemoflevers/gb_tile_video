class AnimationController {
  constructor(fps, callback) {
    this.frameLength = 1000 / fps;
    this.callback = callback;
    this.requestId = null;
    this.startTime = null;
    this.frameCount = 0;
    this.boundFrame = this.frame.bind(this);
  }

  stop() {
    if (!this.requestId) return;
    cancelAnimationFrame(this.requestId);
    this.requestId = null;
    this.frameCount = 0;
    this.startTime = null;
  }

  start() {
    this.stop();
    this.requestId = requestAnimationFrame(this.boundFrame);
  }

  frame(timestamp) {
    this.requestId = requestAnimationFrame(this.boundFrame);
    if (!this.startTime) {
      this.startTime = timestamp;
      this.frameCount++;
      this.callback();
      return;
    }
    const tSinceStart = timestamp - this.startTime;
    const framesSinceStart = Math.floor(tSinceStart / this.frameLength);
    if (framesSinceStart <= this.frameCount) return;

    this.frameCount = framesSinceStart;
    this.callback();
  }
}

class PresetAnimation {
  constructor(fps, frameCallbacks) {
    this.animationController =
      new AnimationController(fps, this.frame.bind(this));
    this.frameCount = 0;
    this.frameCallbacks = frameCallbacks;
  }

  start() {
    if (this.frameCount >= this.frameCallbacks.length) return;
    this.animationController.start();
  }

  stop() {
    this.animationController.stop();
  }

  reset() {
    this.frameCount = 0;
  }

  restart() {
    this.reset();
    this.start();
  }

  frame() {
    if (this.frameCount >= this.frameCallbacks.length) {
      this.stop();
      return;
    }
    this.frameCallbacks[this.frameCount]();
    ++this.frameCount;
  }
}

export {
  AnimationController,
  PresetAnimation,
}