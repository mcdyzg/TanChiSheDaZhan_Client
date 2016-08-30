(function(win, $) {
    window.__event__ = {};
    //获取所有蛇的数据
    window.playerdata = require('./playerdata');
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
        dou: 150
    };
    // 安放炸弹事件
    var putBoomEvent;
    // 初始化蛇对象
    var Snake = require('./snake');
    //糖豆组
    var tangdouLayer;
    //炸弹组
    var zhadanLayer;
    // 小蛇头部的组
    var snakeLayer;
    // 小蛇身体的组
    window.snakeBodyLayer ;
    // 小蛇实例
    var snake;
    // 玩家数据信息
    var player = playerdata[0]; 
    // 敌人数组
    var enemy = new Array();

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
        game.load.atlas('atlas', 'assets/tcs.png', 'assets/tcs.json');
        game.load.atlas('dou', 'assets/dou.png', 'assets/dou.json');
        game.load.image('boom', 'assets/boom.png');
    }

    function update() {
        // 注册碰撞事件
        // game.physics.arcade.collide(snake, tangdouLayer, _chiTangDou, null, this);
        // 头和糖豆碰撞
        game.physics.arcade.overlap(snakeLayer, tangdouLayer, _chiTangDou, null, this);
        // 头和炸弹碰撞
        game.physics.arcade.overlap(snakeLayer, zhadanLayer, _over, null, this);
        // 头和身子碰撞
        game.physics.arcade.overlap(snakeLayer, snakeBodyLayer, _over2, null, this);
        // player.body.setZeroVelocity();
        // player.body.velocity.x = 90;
        // player.body.velocity.y = 90;
        

        // 糖豆少时添加糖豆
        if(tangdouLayer.children.length < 130) {
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
        snakeLayer.add(snake);

        var a =new Phaser.Snake(game, game.centerX, game.centerY, 'boom')
        console.log(a)

        // 允许碰撞到边界
        snake.body.collideWorldBounds = true;

        // 碰撞到边界反弹
        // snake.body.bounce.set(1);

        // 生成随机小蛇
        for (var i = 1; i < playerdata.length; i++) {
            // playerdata[i].rotation = i;
            playerdata[i].ix = bounds.randomX;
            playerdata[i].iy = bounds.randomY;
            playerdata[i].color = COLORS[Math.floor(Math.random() * 10)];
            enemy[i] = new Snake(game, playerdata[i]);
            snakeLayer.add(enemy[i]);
            // console.log(i + '--' + player.rotation);
        }

        // cursors = game.input.keyboard.createCursorKeys();

        game.camera.follow(snake);

        _createStick();

        _saDouDou();
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
        var pos = snake.section[6].position;
        var boom = zhadanLayer.create(pos.x, pos.y, 'boom');
        boom.owner = player.name;
        boom.anchor.setTo(0.5,0.5);
        boom.scale.setTo(0.65);
        boom.body.setCircle(5);
    }

    function _over(a, b){
        if(b.owner !== a.name) {
            a.kill();
        }
    }

    function _over2(a, b){
        if(a.name != b.name) {
            // a.children[0].kill();
            b.kill();
            // snakeBodyLayer.children[1].destroy();
        }
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
            _dou.body.setCircle(5)
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

    function _chiTangDou(a, b) {
        // b.body.moveTo(a) = a.body.velocity;
        // game.camera.follow();
        // game.physics.arcade.moveToPointer(b, 400);
        // b.kill();
        b.destroy()
        player.score++;
        
    }

    function _getRadomColor() {
        return douColor[Math.floor(Math.random() * 10)];
    }

    function render(){
        // console.log(snake)
        // game.debug.spriteInfo(_dou, 32, 32);
    }

})(window, jQuery);
