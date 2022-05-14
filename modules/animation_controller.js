class AnimationController {
  constructor(fps, callback) {
    this.frameLength = 1000 / fps;
    this.callback = callback;
    this.requestId = null;
    this.startTime = null;
    this.lastFrameTime = null;
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
      this.lastFrameTime = timestamp;
      this.frameCount++;
      this.callback();
      return;
    }
    if (timestamp - this.lastFrameTime < this.frameLength) return;
    //console.log(timestamp - this.lastFrameTime);
    this.lastFrameTime = timestamp;
    this.callback();
    return;
    // this logic should average out to the desired fps but it doesn't look
    // good for short animations.
    // const tSinceStart = timestamp - this.startTime;
    // const framesSinceStart = Math.floor(tSinceStart / this.frameLength);
    // if (framesSinceStart <= this.frameCount) return;
    //
    // this.frameCount = framesSinceStart;
    // this.callback();
  }
}

class PresetAnimation {
  constructor(fps, frameCallbacks) {
    this.animationController =
      new AnimationController(fps, this.frame.bind(this));
    this.frameCount = 0;
    this.frameCallbacks = frameCallbacks;
    this.promiseResolver = null;
  }

  start() {
    if (this.frameCount >= this.frameCallbacks.length) return;
    if (this.promiseResolver) this.stop();
    this.animationController.start();
    return new Promise((resolve, reject) => this.promiseResolver = resolve);
  }

  stop() {
    this.animationController.stop();
    if (this.promiseResolver) this.promiseResolver();
    this.promiseResolver = null;
  }

  reset() {
    this.frameCount = 0;
  }

  restart() {
    this.reset();
    return this.start();
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