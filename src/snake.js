__event__.snake = new Phaser.Signal();

function Snake(game, conf) {
    var t = this;
    
    // 初始化蛇信息
    t.section = new Array();
    t.childPath = [{
        x: conf.ix,
        y: conf.iy
    }];
    t.setConfig(conf);

    // 头部
    Phaser.Sprite.call(this, game, conf.ix, conf.iy, 'atlas', conf.color);
    t.anchor.setTo(0.5);
    t.scale.setTo(0.2);
    var eye = t.addChild(game.make.sprite(0, 0, 'atlas', 'yanjing'));
    eye.anchor.setTo(0.5);
    game.physics.arcade.enable(t);

    // game.physics.arcade.enable([t.head,t.eye]);
    //  Init snakeSection array
    for (var i = 1; i <= conf.len; i++) {
        t.section[i] = game.add.sprite(t.x, t.y, 'atlas', conf.color);
        t.section[i].anchor.setTo(0.5, 0.5);
        t.section[i].scale.setTo(0.2);
    }

    for (var i = 0; i <= conf.len * t.space; i++) {
        t.childPath[i] = new Phaser.Point(t.x, t.y);
    }

    game.add.existing(t);

    t.move({
        rotation: conf.rotation
    });

    // 注册signal，用于在别的页面设置蛇的属性
    __event__.snake.add(t.ansy,t);
}
Snake.prototype = Object.create(Phaser.Sprite.prototype);
Snake.prototype.constructor = Snake;

Snake.prototype.addBody = function() {

}

Snake.prototype.ansy = function(func, args) {
    if(this[func]){
        this[func](args);
    }
}

Snake.prototype.setConfig = function(conf) {
    var t = this;
    t.name = conf.name;
    t.len = conf.len;
    t.score = conf.score;
    t.speed = conf.speed;
    t.color = conf.color;
    t.space = 6;
    t.rotation = conf.rotation;
}

Snake.prototype.getSectionPos = function(pos, i, rotation) {
    var t = this;
    var r = t.width * 2 / 4;
    t.childPath[i] = {
        x: pos.x - r * Math.cos(rotation),
        y: pos.y - r * Math.sin(rotation)
    };
    // console.log(t.childPath[i])
}

Snake.prototype.move = function(stick) {
    var t = this;
    var game = t.game;
    console.log(t.rotation)
    game.physics.arcade.velocityFromRotation(t.rotation, t.speed, t.body.velocity);
    // t.rotation = stick.rotation - Math.PI / 2;
    t.rotation = stick.rotation - Math.PI / 2;
}

// Snake.prototype.jiasu = function() {
//     var t = this;
//     var game = t.game;
//     t.speed = 200;
//     game.physics.arcade.velocityFromRotation(t.rotation+Math.PI / 2, t.speed, t.body.velocity);
// }

Snake.prototype.update = function() {
    var t = this;
    var part = t.childPath.pop();
    part.setTo(t.x, t.y);
    t.childPath.unshift(part);
    for (var i = 1; i <= t.len; i++) {
        // t.getSectionPos(t.childPath[i - 1], i, t.rotation);
        t.section[i].x = t.childPath[i * t.space].x;
        t.section[i].y = t.childPath[i * t.space].y;
    }
}

module.exports = Snake;
