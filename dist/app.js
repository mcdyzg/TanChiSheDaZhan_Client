/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	(function(win, $) {
	    window.__event__ = {};
	    //获取所有蛇的数据
	    window.playerdata = __webpack_require__(1);
	    // 屏幕尺寸
	    var winW = $(window).width();
	    var winH = $(window).height();
	    var halfW = winW / 2;
	    var halfH = winH / 2;
	    // 蛇的颜色
	    var COLORS = ['anhuang', 'cheng', 'hei', 'hong', 'huang', 'hui', 'kafei', 'lan', 'qing', 'zi'];
	    // 糖豆的颜色
	    var douColor = ['anhuang','danlu','fen','huang','lan','lu','zaohong','zi'];
	    // 游戏边界
	    var bounds;
	    // 系统按钮监听pad
	    var pad, stick;
	    //加速按钮
	    var buttonJiaSu;
	    //游戏设置
	    var config = {
	        dou: 60
	    };
	    // 安放炸弹事件
	    var putBoomEvent;
	    // 初始化蛇对象
	    var Snake = __webpack_require__(2);
	    //糖豆组
	    var tangdouLayer;
	    //炸弹组
	    var zhadanLayer;
	    // 小蛇头部的组
	    var snakeLayer;
	    // 小蛇身体的组
	    window.snakeBodyLayer ;
	    // 小蛇头部的组
	    window.snakeHeadLayer;
	    // 小蛇实例
	    var snake;
	    // 玩家数据信息
	    var player = playerdata[0]; 
	    // 敌人数组
	    var enemy = new Array();
	    // 显示分数
	    var scoreBoard;
	    // 墙的组
	    var wallGroup;
	    var leftWall;
	    var rightWall;
	    var topWall;
	    var bottomWall;
	    // 结果面板
	    var result;
	    // 结果文字
	    var chonglai;

	    // 游戏初始化
	    // 全屏创建
	    var game = new Phaser.Game(winW, winH, Phaser.WEBGL, '', {
	        preload: preload,
	        create: create,
	        update: update,
	        render: render
	    }); 

	    function preload() {   
	        game.load.image('grid', 'assets/bg.png');
	        game.load.atlas('atlas', 'assets/sucai.png', 'assets/sucai.json');
	        game.load.atlas('dou', 'assets/dou.png', 'assets/dou.json');
	        game.load.atlas('boom', 'assets/boom.png', 'assets/boom.json');
	        game.load.image('wall', 'assets/wall.png');
	        game.load.image('resultBg', 'assets/resultBg.png');
	    }

	    function update() {
	        // 注册碰撞事件
	        // game.physics.arcade.collide(snake, tangdouLayer, _chiTangDou, null, this);
	        // 头和糖豆碰撞
	        game.physics.arcade.overlap(snakeHeadLayer, tangdouLayer, _chiTangDou, null, this);
	        // 头和炸弹碰撞
	        game.physics.arcade.overlap(snakeHeadLayer, zhadanLayer, _over, null, this);
	        // 头和身子碰撞
	        game.physics.arcade.overlap(snakeHeadLayer, snakeBodyLayer, _over2, null, this);
	        // 头和墙碰撞
	        game.physics.arcade.overlap(snakeHeadLayer, wallGroup, _over2, null, this);

	        // 蛇头探路者和墙碰撞
	        game.physics.arcade.overlap(snakeLayer, wallGroup, _over3, null, this);
	        // 蛇头探路者和蛇碰撞
	        game.physics.arcade.overlap(snakeLayer, snakeBodyLayer, _over3, null, this);
	        // 蛇头探路者和炸弹碰撞
	        game.physics.arcade.overlap(snakeLayer, zhadanLayer, _over3, null, this);

	        // 实时的显示炸弹数
	        scoreBoard.text = Math.floor(playerdata[0].score/4);
	        // player.body.setZeroVelocity();
	        // player.body.velocity.x = 90;
	        // player.body.velocity.y = 90;
	        

	        // 糖豆少时添加糖豆
	        if(tangdouLayer.children.length < config.dou-20) {
	            _jiaDouDou();
	        }       

	    }

	    function create() {
	        game.renderer.renderSession.roundPixels = true;
	        game.physics.startSystem(Phaser.Physics.ARCADE);

	        // 添加背景
	        bg = game.add.tileSprite(halfW, halfH, 1000, 1000, 'grid');

	        // 改变背景颜色
	        game.stage.backgroundColor = '#761C1B';

	        // 设定背景范围
	        game.world.setBounds(0, 0, 1000 + winW, 1000 + winH);
	        // game.world.setBounds(halfW, halfH, 1000, 1000);

	        // 添加小蛇身体的组
	        snakeBodyLayer = game.add.group();
	        snakeBodyLayer.enableBody = true;
	        snakeBodyLayer.physicsBodyType = Phaser.Physics.ARCADE;

	        // 添加小蛇头部的组
	        snakeHeadLayer = game.add.group();
	        snakeHeadLayer.enableBody = true;
	        snakeHeadLayer.physicsBodyType = Phaser.Physics.ARCADE;

	        // 添加小蛇头部的组
	        snakeLayer = game.add.group();
	        snakeLayer.enableBody = true;
	        snakeLayer.physicsBodyType = Phaser.Physics.ARCADE;

	        // 添加糖豆组
	        tangdouLayer = game.add.group();
	        tangdouLayer.enableBody = true;
	        tangdouLayer.physicsBodyType = Phaser.Physics.ARCADE;

	        // 添加炸弹组
	        zhadanLayer = game.add.group();
	        zhadanLayer.enableBody = true;
	        zhadanLayer.physicsBodyType = Phaser.Physics.ARCADE;

	        // 生成糖豆的边界
	        bounds = new Phaser.Rectangle(halfW+50, halfH+50, 900, 900);

	        // 生成玩家
	        player.ix = game.world.centerX;
	        player.iy = game.world.centerY;
	        //此处的snake包含头部，section数组，childPath数组
	        snake = new Snake(game, player);
	        // snake.body.setCircle(30);
	        // snake.body.offset = {x:-15,y:-15}
	        snakeLayer.add(snake);

	        // 允许碰撞到边界
	        // snake.body.collideWorldBounds = true;

	        // 碰撞到边界反弹
	        // snake.body.bounce.set(1);

	        // 生成随机小蛇
	        for (var i = 1; i < playerdata.length; i++) {
	            // playerdata[i].rotation = i;
	            playerdata[i].ix = bounds.randomX;
	            playerdata[i].iy = bounds.randomY;
	            playerdata[i].color = COLORS[Math.floor(Math.random() * 10)];
	            enemy[i] = new Snake(game, playerdata[i]);
	            // enemy[i].body.setCircle(30);
	            // enemy[i].body.offset = {x:-15,y:-15}
	            snakeLayer.add(enemy[i]);
	            // console.log(i + '--' + player.rotation);
	        }

	        // cursors = game.input.keyboard.createCursorKeys();

	        game.camera.follow(snake);

	        // 创建摇杆
	        _createStick();

	        // 撒豆
	        _saDouDou();

	        // 墙
	        wallGroup = game.add.group();
	        wallGroup.enableBody = true;
	        wallGroup.physicsBodyType = Phaser.Physics.ARCADE;

	        // 左边墙
	        // leftWall = game.add.tileSprite(0, 0, halfW, 1000 + winH, 'wall');
	        // wallGroup.add(leftWall);
	        leftWall = wallGroup.create(0,0,'wall',1);
	        leftWall.width =halfW;
	        leftWall.height =1000 + winH;
	        leftWall.name = 'wall';

	        // 右边墙
	        // rightWall = game.add.tileSprite(1000 + halfW, 0, halfW, 1000 + winH, 'wall');
	        // wallGroup.add(rightWall);
	        rightWall = wallGroup.create(1000 + halfW, 0,'wall',1);
	        rightWall.width =halfW;
	        rightWall.height =1000 + winH;
	        rightWall.name = 'wall';

	        // 上边墙
	        // topWall = game.add.tileSprite(halfW, 0, 1000, halfH, 'wall');
	        // wallGroup.add(topWall);
	        topWall = wallGroup.create(halfW, 0,'wall',1);
	        topWall.width =1000;
	        topWall.height =halfH;
	        topWall.name = 'wall';

	        // 下边墙
	        // bottomWall = game.add.tileSprite(halfW, 1000 + halfH, 1000, halfH, 'wall');
	        // wallGroup.add(bottomWall);
	        bottomWall = wallGroup.create(halfW, 1000 + halfH,'wall',1);
	        bottomWall.width =1000;
	        bottomWall.height =halfH;
	        bottomWall.name = 'wall';

	        // var aaa = game.add.sprite(game.world.centerX,game.world.centerY,'boom');
	        // game.physics.enable(aaa, Phaser.Physics.ARCADE);
	        // game.physics.arcade.velocityFromRotation(2, 140, aaa.body.velocity);
	        
	        // 显示剩余炸弹数
	        scoreBoard = game.add.text(0, 0, Math.floor(player.score/4), { font: "32px Arial", fill: "#333", align: "center" });
	        scoreBoard.fixedToCamera = true;
	        scoreBoard.cameraOffset.setTo(game.camera.width - 86, game.camera.height - 150);

	        // 结果面板
	        result = game.add.tileSprite(0, 0, 300,200,'resultBg');
	        result.fixedToCamera = true;
	        result.cameraOffset.setTo(game.camera.width/2 -150, game.camera.height/2 -100);
	        result.visible = false;

	        // 重新来
	        chonglai = result.addChild(game.make.sprite(0, 0, 'atlas', 'chonglai'));
	        chonglai.scale.setTo(0.65);
	        chonglai.position = {x:result.centerX - chonglai.width/2,y:result.centerY -chonglai.height/2}
	    }

	    function _createStick() {
	        // 虚拟的摇杆系统
	        pad = game.plugins.add(Phaser.VirtualJoystick);
	        // 初始化控制方向的摇杆
	        stick = pad.addStick(0, 0, 75, 'atlas');
	        stick.scale = 0.618;
	        stick.alignBottomLeft(30);
	        //  Only called when the stick MOVES
	        stick.onMove.add(_moveSnake);

	        // 初始化加速按钮
	        buttonJiaSu = pad.addButton(0, 0, 'atlas', 'jiasu', 'jiasu');
	        buttonJiaSu.scale = 0.618;
	        buttonJiaSu.alignBottomRight(30);
	        // 注册按钮点击事件
	        buttonJiaSu.onDown.add(_pressButtonJiaSu);
	        // 注册按钮松开事件
	        buttonJiaSu.onUp.add(_releaseButtonJiaSu);
	    }

	    function _moveSnake() {
	        if (stick.isDown) {
	            playerdata[0].rota = stick.rotation; 
	            snake.setConfig(playerdata[0]);
	            // snake.move(stick);
	            snake.move();
	        }
	    }

	    function _pressButtonJiaSu() {
	        if(buttonJiaSu.isDown) {
	            // playerdata[0].speed = 200;
	            // playerdata[0].space = 3;
	            // snake.setConfig(playerdata[0]);
	            // snake.move();
	            // console.log(snake.section[6].position)
	            
	            //点击右侧按钮时放炸弹
	            putBoomEvent = game.time.events.loop(Phaser.Timer.SECOND *0.3, putBoom, this);
	        }
	    }

	    function putBoom(){
	        if(player.score>=4) {
	            var pos = snake.section[6].position;
	            var boom = zhadanLayer.create(pos.x, pos.y, 'boom',playerdata[0].color);
	            boom.owner = player.name;
	            boom.anchor.setTo(0.5,0.5);
	            boom.scale.setTo(0.65);
	            boom.body.setCircle(10);
	            boom.alpha=0.6;
	            player.score -=4;
	        }
	    }

	    // 蛇碰到炸弹
	    function _over(a, b){
	        if(b.owner !== a.name) {
	            var bn = b.owner.substring(b.owner.length-1,b.owner.length);
	            var an = a.name.substring(a.name.length-1,a.name.length);
	            playerdata[bn].score += playerdata[an].score;
	            var n = a.name;
	            for(var i = 0;i<snakeBodyLayer.children.length;i++){
	                if(snakeBodyLayer.children[i].name=== n) {
	                    snakeBodyLayer.children[i].kill();
	                }
	            }
	            for(var i = 0;i<snakeLayer.children.length;i++){
	                if(snakeLayer.children[i].name=== n) {
	                    snakeLayer.children[i].kill();
	                }
	            }
	            if(a.name === playerdata[0].name){
	                gameOver();
	            }
	        }
	    }

	    // 蛇头碰到别人的身子或者碰到墙
	    function _over2(a, b){
	        if(a.name != b.name) {
	            // 蛇头碰到蛇身子时，积分转移
	            if(a.name.substring(0,6) === 'player' && b.name !== 'wall'){
	                var an = a.name.substring(a.name.length-1,a.name.length);
	                var bn = b.name.substring(b.name.length-1,b.name.length);
	                playerdata[bn].score += playerdata[an].score;
	            }
	            // 清除蛇身
	            var n = a.name;
	            for(var i = 0;i<snakeBodyLayer.children.length;i++){
	                if(snakeBodyLayer.children[i].name=== n) {
	                    snakeBodyLayer.children[i].kill();
	                }
	            }
	            for(var i = 0;i<snakeLayer.children.length;i++){
	                if(snakeLayer.children[i].name=== n) {
	                    snakeLayer.children[i].kill();
	                }
	            }
	            if(a.name === playerdata[0].name){
	                gameOver();
	            }
	        }
	    }

	    // 蛇头探路者和其他精灵碰撞
	    function _over3(a, b){
	        if(a.name !== b.name) {
	            a.zhuanxiang();
	        }
	    }

	    function gameOver(){
	        result.visible = true;
	        game.input.onTap.addOnce(function(){
	            window.location.reload();
	        },this);
	    }

	    function _releaseButtonJiaSu() {
	        if(buttonJiaSu.isUp) {
	            game.time.events.remove(putBoomEvent);
	        }
	    }

	    function _saDouDou() {
	        for (var i = config.dou; i > 0; i--) {
	            var color = _getRadomColor();
	            var _dou = tangdouLayer.create(bounds.randomX, bounds.randomY, 'dou', color);
	            _dou.color = color;
	            // _dou.anchor.setTo(0.5,0.5);
	            _dou.scale.setTo(0.65);
	            _dou.body.setCircle(5);
	        }
	    }

	    function _jiaDouDou() {
	        for (var i = 0; i < 20; i++) {
	            var color = _getRadomColor();
	            var _dou = tangdouLayer.create(bounds.randomX, bounds.randomY, 'dou', color);
	            _dou.color = color;
	            // _dou.anchor.setTo(0.5,0.5);
	            _dou.scale.setTo(0.65);
	            _dou.body.setCircle(5)
	        }
	    }

	    // 蛇头和糖豆膨胀
	    function _chiTangDou(a, b) {
	        // b.body.moveTo(a) = a.body.velocity;
	        // game.camera.follow();
	        // game.physics.arcade.moveToPointer(b, 400);
	        // b.kill();
	        var num = a.name.substring(a.name.length-1,a.name.length);
	        b.destroy();
	        playerdata[num].score++;
	    }

	    function _getRadomColor() {
	        return douColor[Math.floor(Math.random() * 10)];
	    }

	    function render(){
	        game.debug.body(snake);
	        // console.log(snake)
	        // game.debug.spriteInfo(_dou, 32, 32);
	    }

	})(window, jQuery);


/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = 
	[{
	    name:'player0',
	    rota:0,
	    score:240,
	    len:6,
	    ix:'',
	    iy:'',
	    color:'anhuang',
	    speed:120,
	    space:6
	},{
	    name:'player1',
	    rota:1,
	    score:24,
	    len:6,
	    ix:'',
	    iy:'',
	    color:'anhuang',
	    speed:120,
	    space:6
	},{
	    name:'player2',
	    rota:2,
	    score:24,
	    len:6,
	    ix:'',
	    iy:'',
	    color:'anhuang',
	    speed:120,
	    space:6
	},{
	    name:'player3',
	    rota:3,
	    score:24,
	    len:6,
	    ix:'',
	    iy:'',
	    color:'anhuang',
	    speed:120,
	    space:6
	},{
	    name:'player4',
	    rota:4,
	    score:24,
	    len:6,
	    ix:'',
	    iy:'',
	    color:'anhuang',
	    speed:120,
	    space:6
	},{
	    name:'player5',
	    rota:5,
	    score:24,
	    len:6,
	    ix:'',
	    iy:'',
	    color:'anhuang',
	    speed:120,
	    space:6
	},{
	    name:'player6',
	    rota:5,
	    score:24,
	    len:6,
	    ix:'',
	    iy:'',
	    color:'anhuang',
	    speed:120,
	    space:6
	},{
	    name:'player7',
	    rota:5,
	    score:24,
	    len:6,
	    ix:'',
	    iy:'',
	    color:'anhuang',
	    speed:120,
	    space:6
	},{
	    name:'player8',
	    rota:5,
	    score:24,
	    len:6,
	    ix:'',
	    iy:'',
	    color:'anhuang',
	    speed:120,
	    space:6
	}];

/***/ },
/* 2 */
/***/ function(module, exports) {

	// __event__.snake = new Phaser.Signal();

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
	    // Phaser.Sprite.call(this, game, conf.ix, conf.iy, 'atlas', conf.color);
	    Phaser.Sprite.call(this, game, conf.ix, conf.iy);
	    t.anchor.setTo(0.5);
	    // t.scale.setTo(0.2);
	    game.physics.arcade.enable(t);
	    // 设置蛇头探路者的半径
	    t.body.setCircle(40);
	    t.body.offset = {x:-25,y:-25}

	    // game.physics.arcade.enable([t.head,t.eye]);
	    //  Init snakeSection array
	    for (var i = 1; i <= conf.len; i++) {
	        t.section[i] = game.add.sprite(t.x, t.y, 'atlas', conf.color);
	        if(i === 1) {
	            t.eye = t.section[i].addChild(game.make.sprite(0, 0, 'atlas', 'yanjing'));
	            t.eye.anchor.setTo(0.5);
	            snakeHeadLayer.add(t.section[i]);
	        } else{
	            snakeBodyLayer.add(t.section[i]);
	        }
	        t.section[i].name = t.name;
	        t.section[i].anchor.setTo(0.5, 0.5);
	        t.section[i].body.setCircle(10);
	    }

	    // 生成小蛇路径
	    for (var i = 0; i <= conf.len * t.space; i++) {
	        t.childPath[i] = new Phaser.Point(t.x, t.y);
	    }

	    game.add.existing(t);

	    t.move();

	    // 注册signal，用于在别的页面设置蛇的属性
	    // __event__.snake.add(t.ansy,t);
	}
	Snake.prototype = Object.create(Phaser.Sprite.prototype);
	Snake.prototype.constructor = Snake;

	Snake.prototype.addBody = function() {

	}

	Snake.prototype.dead = function() {

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
	    t.rota = conf.rota;
	    // 每个蛇身体间隔6个帧数的距离
	    t.space = conf.space;
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
	    if(t.name === playerdata[0].name) {
	        game.physics.arcade.velocityFromRotation(t.rota, t.speed, t.body.velocity);
	        // t.rotation = stick.rotation - Math.PI / 2;
	        // t.rotation = t.rota - Math.PI / 2;
	        t.eye.rotation = t.rota - Math.PI / 2;
	    } else {
	        // 其他玩家动
	        game.physics.arcade.velocityFromRotation(t.rota, t.speed, t.body.velocity);
	        t.eye.rotation = t.rota - Math.PI / 2;
	        // var t1 = game.time.events.loop(Phaser.Timer.SECOND , function(){
	        //     t.rota = Math.PI-(2*Math.random()*Math.PI);
	        //     // t.rotation = t.rota - Math.PI / 2;
	        //     t.eye.rotation = t.rota - Math.PI / 2;
	        //     game.physics.arcade.velocityFromRotation(t.rota, t.speed, t.body.velocity);
	        // }, this);
	        
	    }
	}

	// 蛇头探路者碰到物体时自动转向
	Snake.prototype.zhuanxiang = function() {
	    var t = this;
	    t.body.angularVelocity = 600;
	    t.rota = t.rotation;
	    t.move();
	}

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


/***/ }
/******/ ]);