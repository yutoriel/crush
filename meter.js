phina.define('Meter', {
  superClass: 'RectangleShape',
  init: function (option) {
    option = option || {};
    this.superInit();
    this.fill = '#222';
    this.stroke = this.fill;
    this.turn = false;
    this.width = option.width || 10;
    this.height = option.height || 50;
    this.value = 0;

    this.barometer = RectangleShape().addChildTo(this);
    this.barometer.width = this.width;
    this.barometer.height = this.value;
    this.barometer.stroke = this.barometer.backgroundColor;
    this.barometer.strokeWidth = 0;

    this.pointendObject = [];
    this.end = false;
  },
  update: function (app) {
    var p = app.pointer;
    if (p.getPointing() && this.end === false) {
      this.pointing = true;
      this.pointed();
    } else {
      if (this.pointing === true) {
        this.pointing = false;
        this.pointend();
      }
    }
  },
  pointed: function () {
    let accell = 4;
    if (this.turn === false && this.value <= 100) {
      this.value += accell;
      this.barometer.y -= accell / 2;
      if (this.value >= 100) {
        this.value = 100;
        this.turn = true;
        console.info('value is 100');
      }
    }
    if (this.turn === true && this.value >= 0) {
      this.value -= accell;
      this.barometer.y += accell / 2;
      if (this.value <= 0) {
        this.value = 0;
        this.turn = false;
        console.info('value is 0');
      }
    }
    this.barometer.height = this.value;
  },
  pointend: function () {
    this.end = true;
    for (var obj of this.pointendObject) {
      obj.pointendProc(this.value);
    }
  },
  setColor: function (color) {
    this.barometer.backgroundColor = color;
    this.barometer.stroke = color;
  },
});
