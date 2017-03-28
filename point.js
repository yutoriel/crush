phina.globalize();
phina.define('Point', {
  superClass: 'Element',
  position: Vector2(0, 0),
  deltaPosition: Vector2(0, 0),
  start: false,
  now: false,
  end: false,
  time: 0,
  init: function () {
    this.superInit();
    this.time = 0;
    this.updateCount = 0;
  },
  onpointstart: [],
  onpointing: [],
  onpointend: [],
  calcPointPosition: function (app) {
    var px = app.pointer.x;
    var py = app.pointer.y;
    var dx = Math.abs(this.position.x - px);
    var dy = Math.abs(this.position.y - py);
    this.deltaPosition = Vector2(dx, dy);
    this.position = Vector2(px, py);
  },
  pointing: function (app) {
    this.calcPointPosition(app);
    if (!this.start && !this.now) {
      this.start = true;
      this.time = 0;
      for (var func of this.onpointstart) {
        if (func && func.onpointstart) {
          func.onpointstart(this);
        }
      }
    } else if (this.start && !this.now) {
      this.start = false;
      this.now = true;
    } else {
      for (var func of this.onpointing) {
        if (func && func.onpointing) {
          func.onpointing(this);
        }
      }
    }

    if (this.now) {
      this.time += app.deltaTime;
    }
  },
  pointend: function (app) {
    if (this.now === true) {
      this.start = false;
      this.now = false;
      this.end = true;
      for (var func of this.onpointend) {
        if (func && func.onpointend) {
          func.onpointend(this);
        }
      }
    }
  },
  update: function (app) {
    var p = app.pointer;
    if (p.getPointing()) {
      this.pointing(app);
    } else {
      this.pointend(app);
    }
  },
});