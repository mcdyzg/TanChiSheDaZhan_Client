(function(win, $) {
    function log(content){
        console.log(content)
    }
    window.socket = io();
    window.__event__ = {};
    //获取所有蛇的数据
    // window.playerdata = require('./playerdata');
    window.playerdata = [];
    // 屏幕尺寸
    window.winW = $(window).width();
    window.winH = $(window).height();
    window.halfW = winW / 2;
    window.halfH = winH / 2;
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
    var putBoomEvent = {};
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
    // 小蛇头部的组
    window.snakeHeadLayer;
    // 小蛇实例
    var snake;
    // 玩家数据信息
    var player;
    // 敌人数组
    window.enemy = new Array();
    // 显示分数
    var scoreBoard;
    // 墙的组
    var wallGroup;
    var leftWall;
    var rightWall;
    var topWall;
    var bottomWall;
    // 玩家昵称
    var nicheng;
    // 房间信息
    var roomInfo;
    // 昵称输入框
    var nichengInput;
    // 是否已经死亡
    var isDead = false;

    // 游戏初始化
    // 全屏创建
    // var game = new Phaser.Game(winW, winH, Phaser.WEBGL, '', {
    //     preload: preload,
    //     create: create,
    //     update: update,
    //     render: render
    // }); 
    var game = new Phaser.Game(winW, winH, Phaser.WEBGL,'game'); 

    game.States = {};

    game.States.prepare = function(){
        this.preload = function(){
            
        };
        this.create = function(){
            game.state.start('preload');
        };
    }

    game.States.preload = function(){
        this.preload = function(){
            game.load.image('logo', 'assets/logo.png');
            game.load.image('connectBg', 'assets/bg2.png');
            game.load.image('grid', 'assets/bg.png');
            game.load.atlas('atlas', 'assets/sucai.png', 'assets/sucai.json');
            game.load.atlas('dou', 'assets/dou.png', 'assets/dou.json');
            game.load.atlas('boom', 'assets/boom.png', 'assets/boom.json');
            game.load.image('wall', 'assets/wall.png');
            // game.load.image('resultBg', 'assets/resultBg.png');
            game.load.image('ready', 'assets/ready.png');
        };

        this.create = function(){
            game.state.start('connect');
        }
        
    }

    game.States.connect = function(){

        this.create = function(){

            var t = this;

            // game.onPause.add(function(){
            //     game.paused = false;
            //     console.log(game.paused)
            // })

            this.stage.backgroundColor = '#EEE';

            // 首页背景图
            this.bg = game.add.tileSprite(0, 0, game.width, game.height, 'connectBg');

            // logo
            this.logo = game.add.sprite(game.world.centerX, game.world.centerY-70, 'logo');
            this.logo.anchor.setTo(0.5);

            // 输入昵称的框
            nichengInput = $('<input type="" />').css({
                'position':'fixed',
                'width':'172px',
                'left': game.world.centerX - 86,
                'top':game.world.centerY - 10
            })
            $('body').prepend(nichengInput)

            // 点击开始游戏
            this.ready = game.add.button(game.world.centerX , game.world.centerY + 60, 'ready', this.zhunbei, this);
            this.ready.anchor.set(0.5);

        };

        this.zhunbei = function(){
            var t = this;

            if(nichengInput.val() === '') {
                return;
            }

            // 隐藏背景
            this.ready.visible = false;
            this.bg.visible = false;
            this.logo.visible = false;
            nichengInput.hide();

            var ready = game.add.text(game.world.centerX , game.world.centerY, '正在匹配玩家，请稍等', this);
            ready.anchor.set(0.5);


            // 加入房间
            var d = new Date();
            nicheng = d.getTime();
            // nicheng = nichengInput.val().toString() + d.getTime();
            socket.emit('join room', {
                game: 'TanChiSheDaZhan',
                nicheng: nicheng
            });
            socket.on('start game', function(data){
                // console.log(data)

                // 如果ready为true那么开始游戏，为false显示房间还有几个空位
                if(data.ready) {
                    roomInfo = data;
                    // 同步游戏信息
                    socket.on('synced info ' + roomInfo.roomKey, function(otherPlayer){
                        if(isDead) {
                            return;
                        }
                        // 让其他蛇放炸弹
                        if(otherPlayer.toPutBoom) {
                            // console.log(otherPlayer)
                            var sn = otherPlayer.playerName.substring(otherPlayer.playerName.length-1, otherPlayer.playerName.length);
                            // 放炸弹
                            if(otherPlayer.pressBoom) {
                                // 没有放过或者再次安放
                                if(putBoomEvent[otherPlayer.playerName] === undefined || putBoomEvent[otherPlayer.playerName] === 'puted') {
                                    putBoomEvent[otherPlayer.playerName] = game.time.events.loop(Phaser.Timer.SECOND *0.3, putBoom, this, playerdata[sn], enemy[sn]);
                                }
                                
                            }else {
                                game.time.events.remove(putBoomEvent[otherPlayer.playerName]);
                                putBoomEvent[otherPlayer.playerName] = 'puted';
                            }
                        } else {
                            // 移动其他的蛇
                            _moveOtherSnake(otherPlayer);
                        }
                    });

                    // 开始游戏
                    playerdata = data.gameInfo;
                    for(var i in playerdata) {
                        if(playerdata[i].name.indexOf(nicheng) !== -1) {
                            player = playerdata[i]; 
                        }
                    }
                    t.start()
                }else {
                    ready.setText("再等待" + data.leftUsers + "位玩家，请稍候");
                }
            });
        };

        this.start = function(){
            game.state.start('main');
        };
    }

    game.States.main = function(){
        this.create = create;
        this.update = update;
        this.render = render;
    }

    function preload() {   

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

        // 蛇头探路者和墙碰撞，实现自动转向
        // game.physics.arcade.overlap(snakeLayer, wallGroup, _over3, null, this);
        // 蛇头探路者和蛇碰撞，实现自动转向
        // game.physics.arcade.overlap(snakeLayer, snakeBodyLayer, _over3, null, this);
        // 蛇头探路者和炸弹碰撞，实现自动转向
        // game.physics.arcade.overlap(snakeLayer, zhadanLayer, _over3, null, this);

        // 实时的显示炸弹数
        scoreBoard.text = Math.floor(player.score/4);
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
        // player.ix = game.world.centerX;
        // player.iy = game.world.centerY;
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
        for (var i = 0; i < playerdata.length; i++) {
            // 生成其他玩家的蛇，不包括自己
            if(playerdata[i].name.indexOf(nicheng) === -1) {
                // playerdata[i].rotation = i;
                // playerdata[i].ix = bounds.randomX;
                // playerdata[i].iy = bounds.randomY;
                // playerdata[i].color = COLORS[Math.floor(Math.random() * 10)];
                enemy[i] = new Snake(game, playerdata[i]);
                // enemy[i].body.setCircle(30);
                // enemy[i].body.offset = {x:-15,y:-15}
                snakeLayer.add(enemy[i]);
                // console.log(i + '--' + player.rotation);
            } else {
                enemy[i] = {}
            }
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
            player.rota = stick.rotation;
            snake.setConfig(player);
            // snake.move(stick);
            snake.move();

            // 向服务器同步信息
            socket.emit('sync info ' + roomInfo.roomKey, player);
            
        }
    }

    function _pressButtonJiaSu() {
        if(buttonJiaSu.isDown) {
            // player.speed = 200;
            // player.space = 3;
            // snake.setConfig(player);
            // snake.move();
            // console.log(snake.section[6].position)
            
            //点击右侧按钮时放炸弹，并向服务器同步信息
            socket.emit('sync info ' + roomInfo.roomKey, {
                toPutBoom:true,
                pressBoom:true,
                playerName:player.name
            });
            putBoomEvent[player.name] = game.time.events.loop(Phaser.Timer.SECOND *0.3, putBoom, this, player, snake);
        }
    }

    // 放炸弹
    function putBoom(theMan, theSnake){
        if(theMan.score>=4) {
            var pos = theSnake.section[theSnake.len].position;
            var boom = zhadanLayer.create(pos.x, pos.y, 'boom',theMan.color);
            boom.owner = theMan.name;
            boom.anchor.setTo(0.5,0.5);
            boom.scale.setTo(0.65);
            boom.body.setCircle(10);
            boom.alpha=0.6;
            theMan.score -=4;
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
            if(a.name === player.name){
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
            for(var i = 0;i<snakeHeadLayer.children.length;i++){
                if(snakeHeadLayer.children[i].name=== n) {
                    snakeHeadLayer.children[i].kill();
                }
            }
            if(a.name === player.name){
                gameOver();
            }
        }
    }

    // 根据socket传回的数据，改变其他蛇的走向
    function _moveOtherSnake(otherPlayer){
        var n = otherPlayer.name.substring(otherPlayer.name.length -1 , otherPlayer.name.length);
        enemy[n].setConfig(otherPlayer);
        enemy[n].move();
    }

    // 蛇头探路者和其他精灵碰撞
    function _over3(a, b){
        if(a.name !== b.name) {
            a.zhuanxiang();
        }
    }

    function gameOver(){
        isDead = true;
        stick.visible = false;
        buttonJiaSu.visible = false;
        window.location.reload();
        // game.state.start('replay');
    }

    function _releaseButtonJiaSu() {
        if(buttonJiaSu.isUp) {

            //松开右侧按钮时停止放炸弹，并向服务器同步信息
            socket.emit('sync info ' + roomInfo.roomKey, {
                toPutBoom:true,
                pressBoom:false,
                playerName:player.name
            });

            game.time.events.remove(putBoomEvent[player.name]);
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
        // game.debug.body(snake);
        // console.log(snake)
        // game.debug.spriteInfo(_dou, 32, 32);
    }

    game.States.replay = function(){
        this.create = function(){

            // game.stage.backgroundColor = '#EEE';

            // 重新来
            var chonglai = game.add.sprite(game.world.centerX, game.world.centerY, 'atlas', 'chonglai');
            chonglai.scale.setTo(0.65);
            chonglai.anchor.setTo(0.5);

            game.input.onTap.addOnce(function(){
                window.location.reload();
            },this);
        }
    }

    game.state.add('prepare', game.States.prepare);
    game.state.add('preload', game.States.preload);
    game.state.add('connect', game.States.connect);
    game.state.add('main', game.States.main);
    // game.state.add('replay', game.States.replay);

    game.state.start('prepare');

})(window, jQuery);
