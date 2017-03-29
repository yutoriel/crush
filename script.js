phina.globalize();

const Screen = {
  width: 640,
  height: 960,
};

const Assets = {
  'sound': {
    'se': 'https://yutoriel-crush.herokuapp.com/dissappear.mp3',
  },
};

var DebugLabelCount = 2;
phina.define('DebugLabel', {
  superClass: 'Label',
  init: function (text, removable) {
    this.removable = (removable === true);
    this.superInit(text);
    this.fill = '#fff';
    this.cleartimer = 1000;
    this.time = 0;
    this.x = Screen.width * 0.0625 * 13;
    this.y = Screen.height * 0.0625 * DebugLabelCount++;
    if (DebugLabelCount > 15) DebugLabelCount = 2;
  },
  update: function (app) {
    this.time += app.deltaTime;
    if (this.removable && this.cleartimer < this.time) {
      DebugLabelCount--;
      if (DebugLabelCount < 2) {
        DebugLabelCount = 2;
      }
      this.remove();
    }
  }
});

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
    this.scaleX = this.scaleY *= 0.96;
    this.position.add(this.v);
    this.v.mul(0.96);
    if (this.scaleX < 0.1) {
      this.remove();
    }
  },
});

phina.define('Crusher', {
  superClass: 'CircleShape',
  init: function (option) {
    this.superInit(option);
    this.fill = 'hsla(200, 75%, 50%, 0.75)';
    
    this.startPoint = Vector2(0, 0);
    this.endPoint = Vector2(0, 0);
    this.speed = Vector2(0, 0);
  },
  onpointstart: function (point) {
    this.startPoint = point.position.clone();
  },
  onpointing: function (point) {
    //DebugLabel('dposX:{0}'.format(point.deltaPosition.x)).addChildTo(this.parent);
    //DebugLabel('dposY:{0}'.format(point.deltaPosition.y)).addChildTo(this.parent);
  },
  onpointend: function (point) {
    this.endPoint = point.position.clone();
    var direction = Vector2.sub(this.startPoint, this.endPoint);
    var accell = point.deltaPosition.length();
    var speed = direction.mul(accell).div(point.time).negate();
    if (Math.abs(speed.x) >= 50)  speed.x = speed.x > 0 ? 50 : -50;
    if (Math.abs(speed.y) >= 50)  speed.y = speed.y > 0 ? 50 : -50;
    if (speed.length() > 10) {
      this.speed = speed;
    }
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
    if (dv > 3) {
      const maxnum = 1;
      const num = dv > maxnum ? maxnum : dv;
      const color = 'hsla(200, 75%, 50%, 1)';
      (num).times(function () {
        var particle = Particle(color).addChildTo(this.parent);
        particle.radius = this.radius;
        particle.x = this.x + this.radius * (Math.random()*0.5 + -Math.random()*0.5);
        particle.y = this.y + this.radius * (Math.random()*0.5 + -Math.random()*0.5);
        particle.v = this.speed.clone().negate();
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
    this.position.add(this.speed);
    //this.changeColor();
    this.createParticles();
    this.collideWall();
    this.speed.mul(0.995);
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
    const num = 8;
    (num).times(function () {
      var p = Particle(this.fill).addChildTo(this.parent);
      p.x = this.x;
      p.y = this.y;
      p.v = Vector2(Math.randint(-16,16), Math.randint(-16, 16));
      p.scaleX = p.scaleY = 3;
    }, this);
    SoundManager.play('se');
    this.remove();
  },
});

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
    this.point = point;

    (32).times(function () {
      this.createBlock();
    }, this);
    
    this.crusher = crusher;

    // デバッグ用オブジェクト数ラベル
    // this.objectsNum = DebugLabel(
    //   'objNum:{0}'.format(this.children.length), false)
    //   .addChildTo(this);
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
    this.timer -= dt * 0.001;
    if (this.timer < 0) {
      this.timer = 0;
    }
    if (this.timer & 1 !== 0) {
      this.timelabel.text = String(this.timer);
    } else {
      this.timelabel.text = String(this.timer) + '.';
    }
    if (this.timelabel.text.length > 5) {
      this.timelabel.text = this.timelabel.text.substr(0, 5);
    } else {
      this.timelabel.text = this.timelabel.text.paddingRight(5, '0');
    }
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
    //this.objectsNum.text = 'objNum:{0}'.format(this.children.length);

    if (this.timer <= 0) {
      this.exit({score:this.score});
    }
  },
});

phina.main(function() {
  var app = GameApp({
    title: 'crush',
    startLabel: 'splash',
    width: Screen.width,
    height: Screen.height,
    backgroundColor: '#222',
    assets: Assets,
  });
  
  app.fps = 60;
  app.run();
});
