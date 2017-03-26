phina.globalize();

const Screen = {
  width: 640,
  height: 960,
};

phina.define('Particle', {
  superClass: 'StarShape',
  init: function (color) {
    color = color || "hsla({0}, 75%, 50%, 1)".format(Math.randint(0, 360));
    this.superInit({
      fill: color,
      stroke: null,
      radius: 4,
    });
    this.v = Vector2(0, 0);
    this.blendMode = 'lighter';
    this.time = 0;
    this.scaleX = this.scaleY = 1;
  },
  update: function (app) {
    var dv = this.v.length();
    var dt = app.deltaTime;
    this.scaleX = this.scaleY = this.scaleX * 0.96;
    this.position.add(this.v);
    this.v.mul(0.96);
    if (dv < 0.1) {
      this.remove();
    }
  },
});

phina.define('Crusher', {
  superClass: 'CircleShape',
  init: function (option) {
    this.superInit(option);
    this.fill = 'hsla(200, 75%, 50%, 0.75)';
    
    this.start = false;
    this.startPoint = Vector2(0, 0);
    this.endPoint = Vector2(0, 0);
    this.speed = Vector2(0, 0);
    this.particleCount = 0;
  },
  onpointstart: function (point) {
    this.startPoint = Vector2(point.position.x, point.position.y);
  },
  onpointing: function (point) {

  },
  onpointend: function (point) {
    this.endPoint = Vector2(point.position.x, point.position.y);
    var direction = Vector2.sub(this.startPoint, this.endPoint);
    var accell = point.deltaPosition.length();
    var speed = direction.mul(accell).div(point.time).negate();
    //console.info(this.startPoint);
    //console.info(this.endPoint);
    //console.info(direction);
    this.speed = this.speed.add(speed);
    this.start = true;
  },
  collideWall: function () {
    var collided = false;
    if (this.x < 0) {
      collided = true;
      this.x = 0;
      this.speed.x = -this.speed.x;
    }
    if (this.x > Screen.width) {
      collided = true;
      this.x = Screen.width;
      this.speed.x = -this.speed.x;
    }

    if (this.y < 0) {
      collided = true;
      this.y = 0;
      this.speed.y = -this.speed.y;
    }
    if (this.y > Screen.height) {
      collided = true;
      this.y = Screen.height;
      this.speed.y = -this.speed.y;
    }

    if (collided === true) {
      this.speed.mul(0.9);
    }
  },
  bounds: function () {
    this.collideWall();
  },
  createParticles: function () {
    var dv = this.speed.length();
    if (dv > 1) {
      const maxnum = 3;
      var num = dv > maxnum ? maxnum : dv;
      (num).times(function () {
        var color = 'hsla(200, 75%, 50%, 1';
        var particle = Particle(color).addChildTo(this.parent);
        particle.radius = this.radius;
        particle.x = this.x + this.radius * (Math.random()*0.5 + -Math.random()*0.5);
        particle.y = this.y + this.radius * (Math.random()*0.5 + -Math.random()*0.5);
        particle.v = this.speed.clone().negate().mul(0.7);
        particle.v.x *= Math.random();
        particle.v.y *= Math.random();
      }, this);
    }
  },
  changeColor: function () {
    var dv = this.speed.length();
    var brightness = 50;
    brightness = 50 + dv * 0.1;
    this.fill = 'hsla(200, 75%, {0}%, 1)'.format(brightness);
  },
  update: function (app) {
    this.app = app;
    this.changeColor();
    this.position.add(this.speed);
    this.speed.mul(0.995);
    this.createParticles();
    this.bounds();
  },
});

phina.define('Block', {
  superClass: 'RectangleShape',
  init: function (color) {
    this.superInit({
      fill: color || 'hsla({0}, 75%, 50%, 1)'.format(Math.randint(0, 360)),
      stroke: null,
      cornerRadius: 8,
    });
  },
  collide: function (collider) {
    var num = 32;
    (16).times(function () {
      var p = Particle(this.fill).addChildTo(this.parent);
      p.x = this.x;
      p.y = this.y;
      p.v = Vector2(Math.randint(-16,16), Math.randint(-16, 16));
      p.scaleX = p.scaleY = 3;
    }, this);
    this.remove();
  },
  update: function (app) {

  },
})

phina.define('MainScene', {
  superClass: 'DisplayScene',
  init: function() {
    this.superInit();
    this.backgroundColor = '#222';
    
    this.score = 0;
    var label = Label('score:{0}'.format(this.score)).addChildTo(this);
    label.x = this.gridX.center();
    label.y = this.gridY.span(1);
    label.fontSize = 64;
    label.fill = '#fff';
    this.label = label;
    
    this.timer = 30;
    var timelabel = Label(this.timer).addChildTo(this);
    timelabel.x = this.gridX.center();
    timelabel.y = this.gridY.span(2);
    timelabel.fontSize = 48;
    timelabel.fill = '#fff';
    timelabel.text = timelabel.text + '.';
    timelabel.text = timelabel.text.paddingRight(5, '0');
    this.timelabel = timelabel;

    var crusher = Crusher({
      radius: 10,
      stroke: null,
    }).addChildTo(this);
    crusher.x = this.gridX.center();
    crusher.y = this.gridY.span(15);

    var point = Point().addChildTo(this);
    point.onpointstart.push(crusher);
    point.onpointing.push(crusher);
    point.onpointend.push(crusher);

    (15).times(function () {
      this.createBlock();
    }, this);
    
    this.crusher = crusher;

    var debug = Label('debug:');
    debug.x = this.gridX.center();
    debug.y = this.gridY.center();
    this.debug = debug;
  },
  createBlock: function (option) {
    option = option || {
      x: this.gridX.span(Math.randint(1, 15)),
      y: this.gridY.span(Math.randint(3, 15)),
      width: 50,
      height: 50,
      score: 100,
    };
    var block = Block().addChildTo(this);
    block.x = option.x;
    block.y = option.y;
    block.width = option.width;
    block.height = option.height;
    block.score = option.score;
  },
  addScore: function (score) {
    this.score += score;
    this.label.text = 'Score:{0}'.format(this.score);
  },
  countDown: function (dt) {
    this.timer -= dt / 1000;
    this.timer = Math.round(this.timer * 100) / 100;
    if (this.timer < 0) {
      this.timer = 0;
    }
    if (this.timer % 1 !== 0) {
      this.timelabel.text = String(this.timer);
    } else {
      this.timelabel.text = String(this.timer) + '.';
    }
    this.timelabel.text = this.timelabel.text.paddingRight(5, '0');
  },
  hitTest: function () {
    for (var ele of this.children) {
      if (ele.className === 'Block') {
        if (this.crusher.hitTestElement(ele)) {
          this.addScore(ele.score);
          ele.collide();
          this.createBlock();
        }
      }
    }
  },
  update: function (app) {
    this.countDown(app.deltaTime);
    this.hitTest();
    if (this.timer <= 0) {
      this.exit({score:this.score});
    }
  },
});

phina.main(function() {
  var app = GameApp({
    title: 'こわせ！',
    startLabel: 'title',
    width: Screen.width,
    height: Screen.height,
    backgroundColor: '#222',
  });
  
  app.fps = 120;
  app.run();
});
