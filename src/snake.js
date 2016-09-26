// __event__.snake = new Phaser.Signal();

function Snake(game, userKey) {
    var t = this;

    // 当前玩家数据
    var player = _GameInfo[userKey];

    // 初始化蛇信息
    t.section = new Array();
    t.childPath = [{
        x: player.ix + halfW,
        y: player.iy + halfH
    }];
    t.setConfig(player);

    // 头部
    // Phaser.Sprite.call(this, game, conf.ix, conf.iy, 'atlas', conf.color);
    Phaser.Sprite.call(this, game, player.ix + halfW, player.iy +halfH);
    t.anchor.setTo(0.5);
    // t.scale.setTo(0.2);
    game.physics.arcade.enable(t);
    // 设置蛇头探路者的半径
    t.body.setCircle(40);
    t.body.offset = {x:-25,y:-25}

    // game.physics.arcade.enable([t.head,t.eye]);
    //  Init snakeSection array
    for (var i = 1; i <= player.len; i++) {
        t.section[i] = game.add.sprite(t.x, t.y, 'atlas', player.color);
        if(i === 1) {
            t.eye = t.section[i].addChild(game.make.sprite(0, 0, 'atlas', 'yanjing'));
            t.eye.anchor.setTo(0.5);
            snakeHeadLayer.add(t.section[i]);

            // 玩家名字
            var snakeNicheng = game.add.text(-5, -16, player.nicheng, { font: "12px Arial", fill: '#D62828' });
            snakeNicheng.anchor.setTo(0.5);
            t.section[i].addChild(snakeNicheng)

        } else{
            snakeBodyLayer.add(t.section[i]);
        }
        t.section[i].name = t.name;
        t.section[i].anchor.setTo(0.5, 0.5);
        t.section[i].body.setCircle(10);
    }

    // 生成小蛇路径
    for (var i = 0; i <= player.len * t.space; i++) {
        t.childPath[i] = new Phaser.Point(t.x, t.y);
    }

    game.add.existing(t);

    t.move();

    // 注册signal，用于在别的页面设置蛇的属性
    // __event__.snake.add(t.ansy,t);
}
Snake.prototype = Object.create(Phaser.Sprite.prototype);
Snake.prototype.constructor = Snake;

Snake.prototype.dead = function() {
    var t = this;
    t.kill();
    for(var i in t.section) {
        if(t.section[i]) {
            t.section[i].kill();
        }
    }
}

Snake.prototype.ansy = function(func, args) {
    if(this[func]){
        this[func](args);
    }
}

Snake.prototype.setConfig = function(conf) {
    var t = this;
    // 把每个蛇独有的userKey赋给name属性
    t.name = conf.userKey;
    t.nicheng = conf.nicheng;
    t.len = conf.len;
    t.score = conf.score;
    t.speed = conf.speed;
    t.color = conf.color;
    t.rota = conf.rota;
    // 每个蛇身体间隔6个帧数的距离
    t.space = conf.space;

    // 是否正在安放炸弹中
    t.isPuttingBoom = false;
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

Snake.prototype.move = function() {
    var t = this;

    var game = t.game;
    // 玩家动
    // if(t.name === playerdata[0].name) {
        game.physics.arcade.velocityFromRotation(_GameInfo[t.name].rota, _GameInfo[t.name].speed, t.body.velocity);
        // t.rotation = stick.rotation - Math.PI / 2;
        // t.rotation = t.rota - Math.PI / 2;
        t.eye.rotation = _GameInfo[t.name].rota - Math.PI / 2;
    // } else {
    //     // 其他玩家动
    //     game.physics.arcade.velocityFromRotation(t.rota, t.speed, t.body.velocity);
    //     t.eye.rotation = t.rota - Math.PI / 2;
    //     // var t1 = game.time.events.loop(Phaser.Timer.SECOND , function(){
    //     //     t.rota = Math.PI-(2*Math.random()*Math.PI);
    //     //     // t.rotation = t.rota - Math.PI / 2;
    //     //     t.eye.rotation = t.rota - Math.PI / 2;
    //     //     game.physics.arcade.velocityFromRotation(t.rota, t.speed, t.body.velocity);
    //     // }, this);
        
    // }
}

// 蛇头探路者碰到物体时自动转向
Snake.prototype.zhuanxiang = function() {
    var t = this;
    t.body.angularVelocity = 600;
    t.rota = t.rotation;
    t.move();
}

Snake.prototype.putBoom = function() {
    if(this.isPuttingBoom === false) {
        this.isPuttingBoom = true;
        putBoomEvent[this.name] = this.game.time.events.loop(Phaser.Timer.SECOND *0.3, this.isPutting, this);
    }
}

Snake.prototype.isPutting = function(){
    // 如果是玩家自己要检查是否还有炸弹，如果是其他小蛇，那么不检查剩余炸弹数
    if((_GameInfo[this.name].score >= 4 && this.name === userKey) || this.name !== userKey ) {
        var pos = this.section[_GameInfo[this.name].len].position;
        var boom = zhadanLayer.create(pos.x, pos.y, 'boom', _GameInfo[this.name].color);
        boom.owner = this.name;
        boom.anchor.setTo(0.5,0.5);
        boom.scale.setTo(0.65);
        boom.body.setCircle(10);
        boom.alpha=0.6;
        _GameInfo[this.name].score -=4;
    }
}

Snake.prototype.stopPutBoom = function(){
    if(this.isPuttingBoom === true) {
        this.isPuttingBoom = false;
        this.game.time.events.remove(putBoomEvent[this.name]);
    }
}

Snake.prototype.update = function() {
    var t = this;

    // 根据朝向更新小蛇移动,并且把位置信息同步给服务器
    if(this.name === userKey) {
        this.move();
        // console.log(t.x)
        // console.log(t.y)
        // 向服务器同步信息
        socket.emit('sync info ' + roomUuid, {
                    user:userKey,
                    action:'position',
                    data:{
                        ix:t.x - halfW,
                        iy:t.y - halfH
                    }
                });

        // socket.emit('sync info ' + roomUuid,  {
        //     data:userKey + '/' + 'position' + '/' + (t.x-halfW) + '/' + (t.y-halfH)
        // });
    }else {
        // console.log(+(+(_GameInfo[this.name].ix) + halfW))
        this.game.physics.arcade.moveToXY(t, +(+(_GameInfo[this.name].ix) + halfW), +(+(_GameInfo[this.name].iy) + halfH), 120);
        // t.x = _GameInfo[this.name].ix + halfW;
        // t.y = _GameInfo[this.name].iy + halfH;
    }


    // 更新小蛇的身体位置
    var part = t.childPath.pop();
    part.setTo(t.x, t.y);
    t.childPath.unshift(part);
    for (var i = 1; i <= t.len; i++) {
        // t.getSectionPos(t.childPath[i - 1], i, t.rotation);
        t.section[i].x = t.childPath[i * t.space].x;
        t.section[i].y = t.childPath[i * t.space].y;
    }

    //监听是否放炸弹 
    if(_GameInfo[this.name].putboom === 'true') {
        this.putBoom();
        // console.log('dddd')
    } else {
        this.stopPutBoom();
        // console.log('ssss')
    }

    if(_GameInfo[this.name].isDead === true) {
        this.dead();
    }
}

module.exports = Snake;
