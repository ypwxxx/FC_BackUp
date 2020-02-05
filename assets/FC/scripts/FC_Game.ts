import FC_GameData from "./FC_GameData";
import { PLANE_TYPE, GAME_BASE_DATA, FC_EVENT, PLAYER_TYPE, AI_GRADE, PLANE_MOVE_TYPE, AI_BEHAVIOR, DIRECTION } from "./FC_Constant";
import FC_PlaneModel from "./FC_PlaneModel";
import { PlaneChesserObject, PlayerObject, PlaneMoveSimpleTask } from "./FC_Interface";
import Comm_Model from "../../myCommon/script/Comm_Model";
import Comm_ContronllerComponent from "../../myCommon/script/Comm_ContronllerComponent";
import Comm_Binder from "../../myCommon/script/Comm_Binder";
import FC_Chess from "./FC_Chess";
import { NOTIFICATION, CommFunc } from "../../myCommon/script/Comm_Modules";
import Comm_Log from "../../myCommon/script/Comm_Log";
import FC_PlayerModel from "./FC_PlayerModel";
import FC_ChessPoint from "./FC_ChessPoint";
import { COMM_EVENT, VIEW_SWITCH_TYPE } from "../../myCommon/script/Comm_Enum";

interface TaskObj {
    taskArr: PlaneMoveSimpleTask[],
    featureValues: number[],
    isOnlyMoveStackPlane: boolean,
};

/**
 * 游戏类
 */
const {ccclass, property} = cc._decorator;

@ccclass
export default class FC_Game extends cc.Component {

    @property(cc.Node)
    planeNode: cc.Node = null;                      // 飞机父节点
    @property(cc.Node)
    playerNode: cc.Node = null;                     // 玩家父节点
    @property(cc.Node)
    boardNode: cc.Node = null;                      // 棋盘父节点
    @property(cc.Node)
    animNode: cc.Node = null;                       // 动画显示父节点

    @property(cc.Prefab)
    planePrefab: cc.Prefab = null;                  // 飞机预制件
    @property(cc.Prefab)
    playerPrefab: cc.Prefab = null;                 // 玩家预制件
    @property(cc.Prefab)
    banPrefab: cc.Prefab = null;                    // ban预制件
    @property(cc.Prefab)
    boomAnimPrefab: cc.Prefab = null;               // 爆炸动画

    public static DefaultFeatureValue = 0;          // 默认特征值

    private _planePool: cc.NodePool = null;                         // 飞机池
    private _playerPool: cc.NodePool = null;                        // 玩家对象池
    private _boomAnimPool: cc.NodePool = null;                      // 爆炸动画对象池
    private _planesObj: PlaneChesserObject = {                      // 飞机对象
        red: [],
        yellow: [],
        blue: [],
        green: [],
    };
    private _banSpArr: cc.Node[] = [];                              // 禁用标志数组
    private _round: number[] = [0,0];                               // 回合数 回合数-玩家次序
    private _playerOrderArr: FC_PlayerModel[] = [];                 // 玩家次序数组
    private _isCheat: boolean = false;                              // 是否作弊了
    private _canDiceAgain: boolean = false;                         // 能否再次投掷
    private _stackPlanes: FC_PlaneModel[][][] = [];                 // 迭机的飞机棋子,0123--红黄蓝绿
    private _lastDiceNum: number = null;                            // 上一次骰子数
    private _lastPlane: FC_PlaneModel = null;                       // 上一次的飞机
    private _isOnlyMoveStackPlane: boolean = false;                 // 只能移动迭机上的飞机
    private _rankIndex: number = null;                              // 排行序号
    private _pause: boolean = null;                                 // 暂停

    public onLoad(){
        // 是否开始log
        Comm_Log.isLog = true;

        // 初始化棋盘 同时会将棋子初始化
        FC_Chess.getInstance().init();

        // 初始化飞机对象池
        this._planePool = new cc.NodePool("FC_PlaneContronller");
        let planesMax = GAME_BASE_DATA.player_max_count * GAME_BASE_DATA.player_chesser_count;
        for(let i = 0; i < planesMax; i++){
            let plane = cc.instantiate(this.planePrefab);
            this._planePool.put(plane);
        }

        // 初始化飞机
        this._createPlanes(PLANE_TYPE.THE_RED, this._planesObj.red);
        this._createPlanes(PLANE_TYPE.THE_YELLOW, this._planesObj.yellow);
        this._createPlanes(PLANE_TYPE.THE_BLUE, this._planesObj.blue);
        this._createPlanes(PLANE_TYPE.THE_GREEN, this._planesObj.green);


        // 初始化玩家对象池
        this._playerPool = new cc.NodePool("FC_PlayerController");
        for(let i = 0; i < GAME_BASE_DATA.player_max_count; i++){
            let player = cc.instantiate(this.playerPrefab);
            this._playerPool.put(player);
        }

        // 初始化玩家/禁用标志(玩家与控制的飞机固定,红-红,黄-黄...)
        for(let i = 0; i < GAME_BASE_DATA.player_max_count; i++){
            let playerModel = new FC_PlayerModel();
            this._playerOrderArr.push(playerModel);
            let pos = GAME_BASE_DATA.pos_player.clone();

            let ban = cc.instantiate(this.banPrefab);
            this.boardNode.addChild(ban);
            this._banSpArr.push(ban);
            let banPos = GAME_BASE_DATA.pos_banSp.clone();

            if(i === PLANE_TYPE.THE_RED){
                pos.scaleSelf(cc.v2(-1,-1));
                banPos.scaleSelf(cc.v2(-1,-1));

            }else if(i === PLANE_TYPE.THE_YELLOW){
                pos.scaleSelf(cc.v2(-1, 1));
                banPos.scaleSelf(cc.v2(-1,1));

            }else if(i === PLANE_TYPE.THE_BLUE){
                pos.scaleSelf(cc.v2(1, 1));
                banPos.scaleSelf(cc.v2(1,1));

            }else if(i === PLANE_TYPE.THE_GREEN){
                pos.scaleSelf(cc.v2(1, -1));
                banPos.scaleSelf(cc.v2(1,-1));

            }

            ban.setPosition(banPos);
            let player = this._createPlayer(pos, i);
            this._bindMC(playerModel, player);
            playerModel.init(i, i+1);
        }

        // 初始化爆炸动画对象池
        this._boomAnimPool = new cc.NodePool("FC_BoomAnim");
        for(let i = 0; i < 3; i++){
            let anim = cc.instantiate(this.boomAnimPrefab);
            this._boomAnimPool.put(anim);
        }

        NOTIFICATION.on(FC_EVENT.PLAYER_DICE_NUM, this._checkDiceNum, this);        // 接收玩家的骰子数
        NOTIFICATION.on(FC_EVENT.PLANE_MOVE_END, this._planeMoveEnd, this);         // 飞机移动结束
        NOTIFICATION.on(FC_EVENT.PLANE_BE_CHOOSE, this._choosePlane, this);         // 飞机被选中
        NOTIFICATION.on(FC_EVENT.PLANE_CRASH, this._crashPlanes, this);             // 飞机撞击事件
        NOTIFICATION.on(FC_EVENT.GAME_RESTART, this._resetGame, this);              // 重新开始
        NOTIFICATION.on(FC_EVENT.GAME_RESUME, this.resume, this);                   // 恢复游戏
    };

    public start(){
        // 重置游戏
        this._resetGame();
    };

    public onDestroy(){
        NOTIFICATION.offByTarget(this);
    };

    // 重置游戏(不重置绑定器)
    private _resetGame(){
        console.time('reset');
        Comm_Log.log("---重置游戏---");
        // 重置游戏数据
        this._round = [1,0];                    // 回合数: 第一个回合第一个玩家开始
        this._stackPlanes = [
            [],[],[],[]
        ];
        this._rankIndex = 1;
        this._pause = false;

        // 重置用户数据


        // 重置玩家/飞机/禁用标志
        for(let i = 0; i < this._playerOrderArr.length; i++){
            let player = this._playerOrderArr[i];
            // 玩家重置
            player.reset();

            // 飞机重置
            let planeType = player.planeType;
            let bool = player.active;
            let planes = this._getPlanesByType(planeType);
            for(let j = 0; j < planes.length; j++){
                let plane = planes[j];
                plane.reset(bool);
            }

            // 禁用标志重置
            this._banSpArr[planeType].active = !bool;
        }

        // 按照轮转序号重排序
        this._playerOrderArr.sort((a, b) => {
            return a.rotateIndex - b.rotateIndex;
        });

        // 重置完成,轮转回合
        this._rotaryRound();

        console.timeEnd('reset');
    };

    // 暂停游戏
    public pause(){
        this._pause = true;

        this._pauseOrResume();

        // 拉起暂停页面
        NOTIFICATION.emit(COMM_EVENT.SWITCH_VIEW, {name: 'pause', type: VIEW_SWITCH_TYPE.HIDE, solo: false});
    };

    // 恢复游戏
    public resume(){
        this._pause = false;

        this._pauseOrResume(1);
    };

    // 游戏暂停/恢复  0--暂停 !0--恢复
    private _pauseOrResume(type: number = 0){
        let name = 'pause';
        if(type !== 0){
            name = 'resume';
        }

        for(let i = 0; i < this._playerOrderArr.length; i++){
            let player = this._playerOrderArr[i];
            let planeType = player.planeType;
            
            // 玩家
            player[name]();
            // 飞机
            let planes = this._getPlanesByType(planeType);
            for(let j = 0; j < planes.length; j++){
                let plane = planes[j];
                plane[name]();
            }
        }
    };

    // 回合轮转 1.游戏开始时可以轮转 2.每个有效玩家回合结束后可以轮转.
    private _rotaryRound(){
        if(this._pause) return;

        this._round[1]++;
        if(this._round[1] === 5){
            // 已完成一个回合
            this._round[0]++;         // 游戏回合数加一
            this._round[1] = 1;       // 玩家次序归为第一位
        }

        Comm_Log.log("本回合: ", JSON.stringify(this._round));

        // 根据次序数组,按序开始玩家的回合
        let index = this._round[1] - 1;
        let curPlayer = this._playerOrderArr[index];

        // 配置该玩家可以移动的飞机数量
        let num = 0;
        let planes = this._getPlanesByType(curPlayer.planeType);
        for(let i = 0; i < planes.length; i++){
            if(!planes[i].inStopArea){
                num++;
            }
        }
        curPlayer.canMovePlaneCount = num;

        if(!curPlayer.startRound()){
            // 玩家类型不符, 跳过并重新轮转
            this._rotaryRound();
        }
    };

    /**
     * 选择飞机
     * @param obj 
     */
    private _choosePlane(obj: any){
        let player: FC_PlayerModel = this._playerOrderArr[this._round[1] - 1];          // 玩家
        let planeType: PLANE_TYPE = obj.type;
        let planeIndex: number = obj.index;
        // 校验点击的飞机类型是否是正确的
        if(player.planeType === planeType){
            let planes = this._getPlanesByType(planeType);
            let plane = planes[planeIndex];

            plane = this._updateStackPlanes(plane);

            let taskObj = this._simulatePlaneMove(planeType, plane, this._lastDiceNum + 1);

            this._isOnlyMoveStackPlane = taskObj.isOnlyMoveStackPlane;
            plane.moveTo(taskObj.taskArr);
            this._lastPlane = plane;

            Comm_Log.log(`moveTo: ${JSON.stringify(taskObj.taskArr)}`);

            // 停止其他飞机的动画
            for(let i = 0; i < planes.length; i++){
                planes[i].stopStandby();
            }
        }
    };

    /**
     * 敌机坠落
     * @param obj 
     */
    private _crashPlanes(obj: any){
        let targetPoint: FC_ChessPoint = obj.point;
        let type: PLANE_TYPE = obj.type;
        for(let i = 0; i < GAME_BASE_DATA.player_max_count; i++){
            if(i === type) continue;

            let planes = this._getPlanesByType(i);
            for(let n = 0; n < planes.length; n++){
                let plane = planes[n];
                if(plane.inOuter && targetPoint.isOuterRing && plane.locationIndex === targetPoint.index){
                    plane.backToStopArea();
                }else if(plane.inInner && targetPoint.isInnerRing && plane.locationIndex === targetPoint.index){
                    if(targetPoint.type === plane.type){
                        plane.backToStopArea();
                    }
                }
            }
        }

        // 检查一下迭机的栈,是否有迭机被撞
        for(let i = 0; i < this._stackPlanes.length; i++){
            let planesArr = this._stackPlanes[i];
            for(let j = 0; j < planesArr.length; j++){
                let temps = planesArr[j];
                if(temps[0].inOuter && targetPoint.isOuterRing || temps[0].inInner && targetPoint.isInnerRing){
                    if(temps[0].locationIndex === targetPoint.index){
                        // 迭机被撞
                        planesArr.splice(j, 1);
                        break;
                    }
                }
            }
        }
    };

    /**
     * 检查骰子 并准备走子
     * @param diceNum 骰子数
     */
    private _checkDiceNum(diceNum: number){
        Comm_Log.log(`骰子: ${diceNum + 1}`);
        this._lastDiceNum = diceNum;
        let player: FC_PlayerModel = this._playerOrderArr[this._round[1] - 1];          // 玩家
        let planeType = player.planeType;                                               // 飞机类型
        let playerType = player.playerType;                                             // 玩家类型
        let planes = this._getPlanesByType(planeType);                                  // 飞机组
        let canMovePlanes: FC_PlaneModel[] = [];                                        // 可以移动的飞机组
        let targetPlane: FC_PlaneModel = null;                                          // 被选中的目标飞机
        let targetTasks: TaskObj = null;                                                // 目标飞机的移动任务

        this._isCheat = false;                                                          // 是否作弊
        if(player.isThreeTimesDiceOfSix){
            // 检查是连续三个6
            this._isCheat = true;
            // 连续三个6 判断在作弊 遣返所有不在停驻区且未抵达终点的棋子
            for(let i = 0; i < planes.length; i++){
                if(!planes[i].inStopArea && !planes[i].inEndArea){
                    let bool = false;
                    if(i === 0){
                        bool = true;
                    }
                    planes[i].backToStopArea(bool);
                }
            }
            // 弹出作弊提示

            return;
        }

        this._canDiceAgain = false;
        if(diceNum === 5){                                  // 检查能否继续投掷
            this._canDiceAgain = true;
        }

        if(this._isOnlyMoveStackPlane){
            // 检查只能移动目标飞机
            canMovePlanes.push(this._lastPlane);

        }else{
            // 一般情况
            // 检查是否可以起飞飞机
            let canLaunchPlane = false;
            let launchNum = FC_GameData.getInstance().launchPlaneNums;
            for(let i = 0; i < launchNum.length; i++){
                if(diceNum === launchNum[i] - 1){
                    canLaunchPlane = true;
                    break;
                }
            }

            let inStopPlanes: FC_PlaneModel[] = [];             // 在停驻区的飞机
            let inWaitPlanes: FC_PlaneModel[] = [];             // 在等待区的飞机
            let inRoutesPlanes: FC_PlaneModel[] = [];           // 在航线上的飞机
            let hasFinishPlanes: FC_PlaneModel[] = [];          // 已经完成的飞机

            // 检查所有飞机状态 同时收集所有可走棋子
            for(let i = 0; i < planes.length; i++){
                let plane = planes[i];

                if(plane.inStopArea){
                    inStopPlanes.push(plane);
                    if(canLaunchPlane){
                        canMovePlanes.push(plane);
                    }

                }else if(plane.inWaitArea){
                    inWaitPlanes.push(plane);
                    // 检查是否被堵门
                    let startPoint = FC_Chess.getInstance().getStartPoint(planeType);       // 开始点
                    if(this._isStackPlanes(startPoint, planeType) && !(diceNum === 0 || diceNum === 5)) continue;

                    canMovePlanes.push(plane);

                }else if(plane.inRoutes){
                    inRoutesPlanes.push(plane);
                    canMovePlanes.push(plane);

                }else if(plane.inEndArea){
                    hasFinishPlanes.push(plane);

                }
            }

            let planeMaxCount = GAME_BASE_DATA.player_chesser_count;
            // 检查所有飞机状态是否正常
            if((inStopPlanes.length + inWaitPlanes.length + inRoutesPlanes.length + hasFinishPlanes.length) !== planeMaxCount){
                // 所有状态的飞机之和应等于4
                Comm_Log.error('' + planeType + '飞机的状态之和不等于4!存在飞机处于多个不兼容状态!' + `
                    stop: ${inStopPlanes},wait: ${inWaitPlanes},inRout: ${inRoutesPlanes},finish: ${hasFinishPlanes}
                `);
                return;
            }
        }

        // 没有可走子飞机, 跳过本回合
        if(canMovePlanes.length === 0){
            player.endRound();
            this._rotaryRound();
            return;
        }

        // 只有一个棋子可以走 直接走子
        if(canMovePlanes.length === 1){

            targetPlane = canMovePlanes[0];
            targetTasks = this._simulatePlaneMove(planeType, targetPlane, diceNum + 1);

        }else{
            // 判断是玩家还是电脑
            if(playerType === PLAYER_TYPE.AI){
                /**
                 * AL
                 * 
                 * 难度:
                 * 简单: 30%概率随机乱走
                 * 普通: 15%概率随机乱走
                 * 困难: 不乱走
                 * 
                 * 特性:
                 * 攻击型: 3 > 8 > 2 > 6 ≥ 5 > 1 > 4 > 7 > 9
                 * 闪避型: 2 ≥ 3 > 5 ≥ 7 ≥ 1 ≥ 6 > 4 > 8 > 9
                 * 发育型: 2 ≥ 3 > 5 ≥ 7 ≥ 6 > 1 > 4 > 8 > 9
                 * 倾向值: 7   6   5   4   3   2   1   0   -1 (用于评定某种走子偏向于哪种倾向)
                 * 
                 *                    (攻击倾向, 闪避倾向, 发育倾向)
                 * 1.可以到达终点               (2, 3, 2)
                 * 2.可以进入内环               (5, 7, 7)
                 * 3.可以撞到敌机-无自毁        (7, 6, 6)
                 * 4.可以跳                     (1, 1, 1)
                 * 5.可以飞行                   (3, 5, 5)
                 * 6.可以形成叠机               (4, 2, 3)
                 * 7.可以离开停机坪             (0, 4, 4)
                 * 8.可以撞到敌机-会自毁        (6, 0, 0)
                 * 9.从其他行为中随机           (-1, -1, -1)
                 * 
                 * 其他行为:
                 * 逃跑: 走后方6格内敌人最多的棋子
                 * 追杀: 走行动完之后前方6格内敌人最多的棋子
                 * 发育: 走自己离终点最近的棋子
                 * 乱走: 随机走一个棋子
                 * 
                 * 流程:
                 * 1.判断是否为随机走子
                 * A.随机走子:
                 *  a.对任意一个棋子模拟走子.
                 *  b.生成移动任务.
                 *  c.进行移动.
                 * 
                 * B.特性走子:
                 *  a.对所有可走棋子,进行模拟走子.
                 *  b.生成对应的移动任务表,以及对应的特性倾向
                 *  c.依据特性,选择最符合的棋子.(具有多个同级别的棋子时, 任选一个)
                 *  d.选中棋子移动.
                 */
                let ai_grade = player.AIDifficult;                          // ai级别
                let ai_behavior = player.AIBehavior;                        // ai行为特性
                let probability_rand: number = -1;                          // 随机乱走概率
                let indexA = 10;
                let indexB = 20;
                let indexC = 60;

                if(ai_grade === AI_GRADE.SIMPLE){
                    probability_rand = 30;

                }else if(ai_grade === AI_GRADE.NORMAL){
                    probability_rand = 15;
                    indexA = 20;
                    indexB = 40;

                }else if(ai_grade === AI_GRADE.HARD){
                    indexA = 40;
                    indexB = 60;
                    indexC = 90;

                }

                let num = CommFunc.rand(100);
                if(num < probability_rand){
                    // 随机乱走
                    num = CommFunc.rand(canMovePlanes.length);

                    targetPlane = canMovePlanes[num];
                    targetTasks = this._simulatePlaneMove(planeType, targetPlane, diceNum + 1);
                    Comm_Log.log(`随机-player${player.rotateIndex}-plane${targetPlane.index}: ${JSON.stringify(targetTasks.featureValues)}`);

                }else{
                    // 按特性走子
                    // 对所有可走棋子,生成对应的任务列以及特性表
                    let index  = 0;
                    targetTasks = null;

                    if(ai_behavior === AI_BEHAVIOR.EVASION){
                        index = 1;
                    }else if(ai_behavior === AI_BEHAVIOR.DEVELOPMENT){
                        index = 2;
                    }

                    let cache: TaskObj[] = [];                 // 任务表的缓存 顺序同canMovePlanes

                    for(let i = 0 ; i < canMovePlanes.length; i++){
                        let tempPlane = canMovePlanes[i];
                        let temp = this._simulatePlaneMove(planeType, tempPlane, diceNum + 1);
                        cache.push(temp);
                        Comm_Log.log(`player${player.rotateIndex}-plane${tempPlane.index}: ${JSON.stringify(temp.featureValues)}`);
                        if(targetTasks === null || targetTasks.featureValues[index] <= temp.featureValues[index]){
                            if(temp.featureValues[index] === FC_Game.DefaultFeatureValue && targetPlane !== null){
                                let getValue = function(plane: FC_PlaneModel){
                                    let value = -1;
                                    if(plane.inInner){
                                        value = -1;
                                    }else if(plane.inWaitArea){
                                        value = 0;
                                    }else if(plane.inOuter){
                                        value = 1;
                                    }
                                    return value;
                                };

                                let targetValue = getValue(targetPlane);
                                let tempValue = getValue(tempPlane);

                                if(tempValue > targetValue){
                                    targetTasks = temp;
                                    targetPlane = tempPlane;
                                }

                            }else{
                                targetTasks = temp;
                                targetPlane = tempPlane;
                            }
                        }
                    }

                    // 判断行为
                    if(targetTasks.featureValues[index] === FC_Game.DefaultFeatureValue){
                        // 从其他行为中随机
                        num = CommFunc.rand(100);
                        if(num < indexA){
                            // 逃跑
                            Comm_Log.log('逃跑');
                            let enemys = this._getLaterPlanes(targetPlane);
                            for(let i = 0; i < canMovePlanes.length; i++){
                                let tempPlane = canMovePlanes[i];
                                let temp = this._getLaterPlanes(tempPlane);
                                Comm_Log.log(`plane: ${tempPlane}}--追兵: ${temp}`);
                                if(temp > enemys){
                                    enemys = temp;
                                    targetPlane = tempPlane;
                                    targetTasks = cache[i];
                                }
                            }

                        }else if(num < indexB){
                            // 追杀
                            Comm_Log.log('追杀');
                            let enemys = this._getAheadPlanes(targetPlane, targetTasks.taskArr[targetTasks.taskArr.length - 1].point);
                            for(let i = 0; i < canMovePlanes.length; i++){
                                let tempPlane = canMovePlanes[i];
                                let endPoint = cache[i].taskArr[cache[i].taskArr.length - 1].point;
                                let temp = this._getAheadPlanes(tempPlane, endPoint);
                                Comm_Log.log(`plane: ${tempPlane}--逃兵: ${temp}`);
                                if(temp > enemys){
                                    enemys = temp;
                                    targetPlane = tempPlane;
                                    targetTasks = cache[i];
                                }
                            }

                        }else if(num < indexC){
                            // 发育
                            Comm_Log.log('发育');
                            let enemys = 1000;
                            for(let i = 0; i < canMovePlanes.length; i++){
                                let target = canMovePlanes[i];
                                let temp = this._getDisToEnd(target);
                                Comm_Log.log(`plane: ${target}--终点: ${temp}`);
                                if(temp < enemys){
                                    enemys = temp;
                                    targetPlane = target;
                                    targetTasks = cache[i];
                                }
                            }

                        }else{
                            // 随机
                            Comm_Log.log('随机');
                            num = CommFunc.rand(canMovePlanes.length);
                            targetPlane = canMovePlanes[num];
                            targetTasks = cache[num];

                        }
                    }
                }

            }else if(playerType === PLAYER_TYPE.OFFLINE){
                // 线下玩家
                // 有多个棋子可选, 等待玩家选择棋子
                // 可选棋子进入等待状态
                for(let i = 0; i < canMovePlanes.length; i++){
                    let plane = canMovePlanes[i];
                    plane.standby();
                }
            }
        }

        if(targetPlane && targetTasks){
            targetPlane = this._updateStackPlanes(targetPlane);

            this._isOnlyMoveStackPlane = targetTasks.isOnlyMoveStackPlane;
            targetPlane.moveTo(targetTasks.taskArr);
            this._lastPlane = targetPlane;

            Comm_Log.log(`moveTo: ${JSON.stringify(targetTasks.taskArr)}`);
        }
    };

    /**
     * 飞机移动结束
     */
    private _planeMoveEnd(obj: any){
        let player: FC_PlayerModel = this._playerOrderArr[this._round[1] - 1];
        let planeType: PLANE_TYPE = obj.type;

        if(this._isOnlyMoveStackPlane){
            // 只能移动迭机上的棋子
            player.setTouch(true);
            // 配置移动和zIndex
            let planes: FC_PlaneModel[] = null;
            for(let i = 0; i < this._stackPlanes.length; i++){
                if(i === planeType) continue;
                let planesArr = this._stackPlanes[i];
                for(let j = 0; j < planesArr.length; j++){
                    if(this._lastPlane.locationIndex === planesArr[j][0].locationIndex){
                        planes = planesArr[j];
                        break;
                    }
                }
            }
            planes.push(this._lastPlane);
            this._flushStackPlanes(planes, this._lastPlane.direction);
            planes.pop();

        }else if(this._isCheat){
            player.setTouch(true);

        }else{
            // 更新迭机数组
            let planes = this._getPlanesByType(planeType);
            let stackPlanes = this._stackPlanes[planeType];
            let isAdd = false;
            for(let i = 0; i < stackPlanes.length; i++){
                let plane = stackPlanes[i][0];
                if((this._lastPlane.inWaitArea && plane.inWaitArea) || (this._lastPlane.inOuter && plane.inOuter) || (this._lastPlane.inInner && plane.inInner)){
                    if(plane.locationIndex === this._lastPlane.locationIndex){
                        // 配置移动和zIndex
                        stackPlanes[i].push(this._lastPlane);
                        this._flushStackPlanes(stackPlanes[i], this._lastPlane.direction);
                        isAdd = true;
                        break;
                    }
                }
            }
            if(!isAdd){
                let stacks: FC_PlaneModel[] = [];
                for(let i = 0; i < planes.length; i++){
                    if((this._lastPlane.inWaitArea && planes[i].inWaitArea) || (this._lastPlane.inOuter && planes[i].inOuter) || (this._lastPlane.inInner && planes[i].inInner)){
                        if(this._lastPlane.locationIndex === planes[i].locationIndex){
                            stacks.push(planes[i]);
                        }
                    }
                }
                if(stacks.length > 1){
                    // 配置移动和zIndex
                    this._flushStackPlanes(stacks, this._lastPlane.direction);
                    stackPlanes.push(stacks);
                }
            }

            
            let num = 0;
            for(let i = 0; i < planes.length; i++){
                if(planes[i].inEndArea){
                    num++;
                }
            }
            if(num === 4){
                // 该玩家的飞机全部飞完了
                // 显示排名
                player.showRank(this._rankIndex);
                this._rankIndex++;
                // 检查游戏是否结束了
                if(this._checkGameOver()) return;
            }

            if(this._canDiceAgain){
                // 再次投掷
                if(player.playerType === PLAYER_TYPE.AI){
                    // ai 自动投掷
                    player.throwDice();

                }else if(player.playerType === PLAYER_TYPE.OFFLINE){
                    player.setTouch(true);
                }

            }else{
                // 轮转下一个玩家
                player.endRound();
                this._rotaryRound();

            }
        }

        this._lastPlane.isMoving = false;
    };

    /**
     * 更新跌机组中的飞机
     * @param plane 
     * @param planeType 
     */
    private _updateStackPlanes(plane: FC_PlaneModel){
        let target = plane;
        // 判断选择的是迭机中的飞机
        let stackPlanes = this._stackPlanes[plane.type];
        for(let i = 0; i < stackPlanes.length; i++){
            let stacks = stackPlanes[i];
            if(stacks[0].inWaitArea && plane.inWaitArea || stacks[0].inOuter && plane.inOuter || stacks[0].inInner && plane.inInner){
                if(stacks[0].locationIndex === plane.locationIndex && stacks[0].type === plane.type){
                    target = stacks.pop();
                    // 动了迭机栈上的飞机 更新一下迭机栈
                    if(stacks.length === 1){
                        stackPlanes.splice(i, 1);
                    }
                    break;
                }
            }
        }
        return target;
    };

    /**
     * 刷新飞机栈的显示
     * @param planes 
     * @param direction 
     */
    private _flushStackPlanes(planes: FC_PlaneModel[], direction: DIRECTION){
        let dis: number = null;
        let pos: cc.Vec2 = planes[0].position;
        let dir: cc.Vec2 = null;

        if(direction === DIRECTION.UP){
            dir = cc.v2(1, 0);

        }else if(direction === DIRECTION.DOWN){
            dir = cc.v2(-1, 0);

        }else if(direction === DIRECTION.LEFT){
            dir = cc.v2(0, 1);

        }else if(direction === DIRECTION.RIGHT){
            dir = cc.v2(0, -1);

        }

        let nums = [];
        for(let i = 0; i < planes.length; i++){
            Comm_Log.log('排序：', i, planes[i].zIndex);
            nums.push(planes[i].zIndex);
        }
        nums.sort((a,b) => {
            return Number(a) - Number(b);
        });
        for(let i = 0; i < planes.length; i++){
            planes[i].zIndex = nums[i];
            dis = 10 * i;
            planes[i].position = pos.add(dir.mul(dis));
        }
    };

    // 检查游戏结束
    private _checkGameOver(){
        let result = false;
        if(FC_GameData.getInstance().playerCount === this._rankIndex){
            // 游戏结束
            result = true;

            // 暂停游戏
            this._pause = true;
            this._pauseOrResume();
            
            // 拉取结束页面
            let rankData = [];
            for(let i = 0; i < this._playerOrderArr.length; i++){
                let player = this._playerOrderArr[i];
                if(player.active){
                    if(player.rank === -1){
                        player.showRank(FC_GameData.getInstance().playerCount);
                    }
                    let data = {
                        name: player.name,
                        planeType: player.planeType,
                        rank: player.rank,
                        iconIndex: player.iconIndex,
                    }
                    rankData.push(data);
                }
            }

            rankData.sort(function(a, b){
                return a.rank - b.rank;
            });

            NOTIFICATION.emit(COMM_EVENT.SWITCH_VIEW, {name: 'over', data: rankData, type: VIEW_SWITCH_TYPE.HIDE});
        }
        return result;
    };

    /**
     * 模拟棋子走子
     * @param type PLANE_TYPE 类型
     * @param plane FC_PlaneModel 被模拟的飞机
     * @param diceNum number 骰子数
     */
    private _simulatePlaneMove(type: PLANE_TYPE, plane: FC_PlaneModel, diceNum: number): TaskObj{
        let value = FC_Game.DefaultFeatureValue;
        let featureValueTable = [                                   // 特征值的表
            [3, 4, 3],                                              // 1.可以到达终点 
            [6, 8, 8],                                              // 2.可以进入内环 
            [8, 7, 7],                                              // 3.可以撞到敌机-无自毁
            [2, 2, 2],                                              // 4.可以跳  
            [4, 6, 6],                                              // 5.可以飞行 
            [5, 3, 4],                                              // 6.可以形成叠机 
            [1, 5, 5],                                              // 7.可以离开停机坪
            [7, 1, 1],                                              // 8.可以撞到敌机-会自毁
        ];
        let taskArr: PlaneMoveSimpleTask[] = [];                    // 任务表
        let featureValues: number[] = [value, value, value];        // 特征值
        let behaviors: number[] = [];                               // 行为组
        let stepNum = 0;                                            // 已经走的步数
        let curPoint: FC_ChessPoint = plane.point;                  // 当前棋点
        let nextPoint: FC_ChessPoint = null;                        // 下一个棋点
        let startPoint = FC_Chess.getInstance().getStartPoint(type);// 开始点
        let waitPoint = FC_Chess.getInstance().getWaitPoint(type);  // 等待点
        let isBack: boolean = false;                                // 是否是回退 叠棋回退 终点回退
        let isStackAndSixDice = false;                              // 是否停留在迭机

        if(curPoint.isStopPoint){
            // 棋子在停驻区
            nextPoint = waitPoint;
            if(!nextPoint){
                debugger;
            }
            let task: PlaneMoveSimpleTask = {
                point: nextPoint,
                moveType: PLANE_MOVE_TYPE.STEP,
            };
            taskArr.push(task);
            behaviors.push(6);

        }else{

            while(stepNum < diceNum){
                // 预测下一步棋子点数
                if(curPoint.isWaitPoint){
                    // 在等待区域
                    nextPoint = startPoint.clone();
                    if(!nextPoint){
                        debugger;
                    }

                }else if(curPoint.isOuterRing){
                    // 在外环
                    let index = curPoint.index + 1;
                    index = index === GAME_BASE_DATA.chesser_outter_count ? 0 : index;

                    if(isBack){
                        // 回退
                        index = curPoint.index - 1;
                        index = index === -1 ? (GAME_BASE_DATA.chesser_outter_count - 1) : index;
                    }

                    if(curPoint.isCutPoint && curPoint.type === plane.type && plane.forwardMoveStep >= 24){                     // 24是最小的抵达切入点需要的步数
                        // 是切入点 且是正常走完全程 允许进入内环
                        nextPoint = FC_Chess.getInstance().getInnerPoint(0, type);              // 获取内环内第一个点
                    }else{
                        nextPoint = FC_Chess.getInstance().getOuterPoint(index);
                    }

                    if(!nextPoint){
                        debugger;
                    }

                }else if(curPoint.isInnerRing){
                    // 在内环
                    let index = curPoint.index + 1;
                    index = index === GAME_BASE_DATA.chesser_inner_singer_count ? 4 : index;

                    if(isBack){
                        index = curPoint.index - 1;
                    }
    
                    nextPoint = FC_Chess.getInstance().getInnerPoint(index, type);

                    if(!nextPoint){
                        debugger;
                    }
                }
    
                // 根据预测的棋子数,判断后续要怎么走
                if(stepNum !== (diceNum - 1)){
                    // 还不是最后一步
                    // 生成任务
                    let task: PlaneMoveSimpleTask = {
                        point: nextPoint,
                        moveType: PLANE_MOVE_TYPE.STEP,
                        isBack: isBack
                    };

                    if(!isBack){
                        // 向前走的每一次,都判断是否是叠棋(叠棋: 每一次棋子完成走子后,进行一次更新)
                        if(this._isStackPlanes(nextPoint, type)){
                            isBack = true;

                            if(diceNum === 6){
                                // 判断骰子是6, 需要特殊处理
                                isStackAndSixDice = true;
                                isBack = false;
                                taskArr.push(task);
                                break;
                            }
                        }

                        if(nextPoint.isEndPoint){
                            isBack = true;
                        }
                    }

                    curPoint = nextPoint.clone();
                    taskArr.push(task);

                }else{
                    // 最后一步
                    // 获取飞行路线与内环交叉点上的飞机
                    let getCrossPlanes = (point: FC_ChessPoint) => {
                        let crossType = point.crossType;
                        let targetPlanes = this._getPlanesByType(crossType);
                        let crossPlanes: FC_PlaneModel[] = [];
                        for(let i = 0; i < targetPlanes.length; i++){
                            let temp = targetPlanes[i];
                            if(temp.active && temp.inInner && temp.point.isCrossPoint){
                                crossPlanes.push(temp);
                            }
                        }
                        return crossPlanes;
                    };

                    // 判断结束点
                    let judgeEndPoint = (endPoint: FC_ChessPoint, planeType: PLANE_TYPE, isBack: boolean, moveType: PLANE_MOVE_TYPE = PLANE_MOVE_TYPE.STEP) => {
                        let result = true;
                        let enemys = this._getEnemyPlanes(endPoint, planeType);
                        let task: PlaneMoveSimpleTask = {
                            point: endPoint.clone(),
                            moveType: moveType,
                            isBack: isBack,
                        };

                        if(enemys.length >= 1){
                            // 存在敌机
                            task.isCrash = true;
                            taskArr.push(task);

                            if(enemys.length === 1){
                                behaviors.push(2);
                            }else{
                                task = {
                                    point: plane.stopPoint,
                                    moveType: PLANE_MOVE_TYPE.STEP,
                                }
                                taskArr.push(task);
                                behaviors.push(7);
                                result = false;
                            }

                        }else{
                            taskArr.push(task);
                        }

                        return result;
                    };

                    // 判断飞行点
                    let judgeFlyPoint = (point: FC_ChessPoint, planeType: PLANE_TYPE) => {
                        let result = true;
                        let crossPlanes = getCrossPlanes(point);
                        if(crossPlanes.length > 1){
                            // 中途有迭机 回退 飞行失败
                            let crossPoint = crossPlanes[0].point.clone();
                            let task: PlaneMoveSimpleTask = {
                                point: crossPoint,
                                moveType: PLANE_MOVE_TYPE.FLY,
                                isBack: false,
                                isFly: true,
                                isFlyCenter: true,
                            };
                            taskArr.push(task);

                            task = {
                                point: point.clone(),
                                moveType: PLANE_MOVE_TYPE.FLY,
                                isBack: true,
                                isFly: true,
                            }
                            taskArr.push(task);
                            result = false;
                            return result;

                        }else if(crossPlanes.length === 1){
                            // 中途有敌机 无迭机 击毁敌机 刷新棋点
                            let crossPoint = crossPlanes[0].point.clone();
                            let task: PlaneMoveSimpleTask = {
                                point: crossPoint,
                                moveType: PLANE_MOVE_TYPE.FLY,
                                isBack: false,
                                isFly: true,
                                isCrash: true,
                                isFlyCenter: true,
                            };
                            behaviors.push(2);
                            taskArr.push(task);

                        }

                        point = FC_Chess.getInstance().getOuterPoint(point.flyEndIndex);
                        let task: PlaneMoveSimpleTask = {
                            point: point.clone(),
                            moveType: PLANE_MOVE_TYPE.FLY,
                            isBack: false,
                            isFly: true,
                            // isFlyCenter: crossPlanes.length === 1,
                        };

                        // 判断飞行结束点是否有敌机
                        let enemys = this._getEnemyPlanes(point, planeType);
                        if(enemys.length >= 1){
                            // 存在敌机
                            task.isCrash = true;
                            taskArr.push(task);

                            if(enemys.length === 1){
                                behaviors.push(2);
                            }else{
                                task = {
                                    point: plane.stopPoint,
                                    moveType: PLANE_MOVE_TYPE.STEP,
                                }
                                taskArr.push(task);
                                behaviors.push(7);
                                result = false;
                            }

                        }else{
                            taskArr.push(task);
                        }

                        behaviors.push(4);
                        if(result){
                            nextPoint = point;
                            if(!nextPoint){
                                debugger;
                            }
                        }
                        return result;
                    };

                    // 判断跳跃点
                    let judgeJumpPoint = (point: FC_ChessPoint, planeType: PLANE_TYPE) => {
                        let result = true;
                        let jumpEndIndex = (point.index + 4) % 52;
                        let stackPlanesInJump = this._getStackInTwoPoints(point.index, jumpEndIndex, planeType);
                        if(stackPlanesInJump){
                            // 跳跃中途有迭机, 准备回退
                            let task: PlaneMoveSimpleTask = {
                                point: stackPlanesInJump[0].point.clone(),
                                moveType: PLANE_MOVE_TYPE.JUMP,
                                isBack: false,
                            };
                            taskArr.push(task);

                            task = {
                                point: point.clone(),
                                moveType: PLANE_MOVE_TYPE.JUMP,
                                isBack: true,
                            };
                            taskArr.push(task);
                            result = false;
                        }else{
                            // 中途无迭机
                            point = FC_Chess.getInstance().getOuterPoint(jumpEndIndex);
                            if(judgeEndPoint(point, planeType, false, PLANE_MOVE_TYPE.JUMP)){
                                // 跳跃结束 成功
                                nextPoint = point;
                                if(!nextPoint){
                                    debugger;
                                }
                                result = true;

                            }else{
                                // 跳跃结束 失败
                                result = false;

                            }
                            behaviors.push(3);
                        }
                        return result;
                    };

                    // 判断终点行为
                    let judgeEndBehaviors = (point: FC_ChessPoint, type: PLANE_TYPE) => {
                        // 如果是内环 判断终点
                        if(point.isInnerRing && point.isEndPoint){
                            let task: PlaneMoveSimpleTask = {
                                point: plane.stopPoint,
                                moveType: PLANE_MOVE_TYPE.STEP,
                                isEnd: true,
                            };
                            taskArr.push(task);
                            behaviors.push(0);

                        }else if(point.isInnerRing && plane.point.isOuterRing){
                            // 进入内环
                            behaviors.push(1);

                        }else{
                            let sames = this._getSamePlanes(point, type);
                            // 内环,且不是交叉点的位置,迭机没有意义.
                            if(!(point.isInnerRing && !point.isCrossPoint)){
                                if(sames.length > 0){
                                    // 可以迭机
                                    behaviors.push(5);
                                }
                            }
                        }
                    };

                    // 行为判断
                    if(judgeEndPoint(nextPoint, type, isBack)){
                        if(!isBack && !(nextPoint.isCutPoint && nextPoint.type === type && plane.forwardMoveStep >= 24)){
                            // 不是切入点
                            if(nextPoint.isFlyStartPoint && nextPoint.type === type){
                                // 未坠机 未结束
                                // 可飞行
                                taskArr[taskArr.length - 1].isFly = true;
                                if(judgeFlyPoint(nextPoint, type)){
                                    // 飞行成功 中途未被挡住 飞行结束也未坠机
                                    // 跳跃
                                    judgeJumpPoint(nextPoint, type);
                                }
                            }else if(nextPoint.isOuterRing && nextPoint.type === type){
                                // 可跳跃
                                if(judgeJumpPoint(nextPoint, type)){
                                    // 跳跃成功
                                    // 判断可否飞行
                                    if(nextPoint.isFlyStartPoint && nextPoint.type === type){
                                        // 可飞行
                                        taskArr[taskArr.length - 1].isFly = true;
                                        judgeFlyPoint(nextPoint, type);
                                    }
                                }
                            }
                        }

                        judgeEndBehaviors(nextPoint, type);
                    }
                }
                
                stepNum++;
            }
        }

        // 合计特征值
        for(let i = 0; i < behaviors.length; i++){
            let values = featureValueTable[behaviors[i]];
            let length = values.length;
            for(let j = 0; j < length; j++){
                featureValues[j] += (values[j] + 1);            // 保证最小的值是1,与-1表现出区别
            }
        }

        // 标记最后一个移动任务为目标任务
        taskArr[taskArr.length - 1].isTarget = true;

        return {
            taskArr: taskArr,
            featureValues: featureValues,
            isOnlyMoveStackPlane: isStackAndSixDice,
        }
    };

    /**
     * 获取之后6格内,敌机数量
     * @param plane 
     */
    private _getLaterPlanes(plane: FC_PlaneModel){
        let num = 0;
        let type = plane.type;
        let index = -1;
        let isStart = false;
        if(plane.inWaitArea){
            // 判断起始点
            isStart = true;
            index = FC_Chess.getInstance().getStartPoint(type).index;
            
        }else if(plane.inOuter){
            // 判断6格内
            index = plane.locationIndex;

        }else{
            return num;
        }
        for(let i = 0; i < 4; i++){
            let temps = this._getPlanesByType(i);
            if(!temps[0].active || temps[0].type === type) continue;

            for(let j = 0; j < temps.length; j++){
                let enemy = temps[j];
                let enemyIndex = enemy.locationIndex;
                if(!(enemy.inOuter || enemy.inWaitArea)) continue;
                if(enemy.inWaitArea){
                    enemyIndex = FC_Chess.getInstance().getStartPoint(enemy.type).index;
                }

                if(isStart){
                    if(index === enemyIndex){
                        num++;
                    }

                }else{
                    // 判断6格内
                    let laterIndex = index - 6;
                    if(laterIndex < 0){
                        laterIndex += GAME_BASE_DATA.chesser_outter_count;
                    }
                    if(enemyIndex >= laterIndex && enemyIndex < index){
                        num++;
                    }
                }
            }
        }
        return num;
    };

    /**
     * 获取前6格内敌机数量
     * @param plane 
     * @param endPoint 
     */
    private _getAheadPlanes(plane: FC_PlaneModel, endPoint: FC_ChessPoint){
        let num = 0;
        let type = plane.type;
        let index = -1;

        if(endPoint.isWaitPoint){
            // 判断起始点
            index = FC_Chess.getInstance().getStartPoint(type).index;

        }else if(endPoint.isOuterRing){
            // 判断6格内
            index = endPoint.index;

        }else{
            return num;
        }

        for(let i = 0; i < 4; i++){
            let temps = this._getPlanesByType(i);
            if(!temps[0].active || temps[0].type === type) continue;

            for(let j = 0; j < temps.length; j++){
                let enemy = temps[j];
                let enemyIndex = enemy.locationIndex;
                if(!(enemy.inOuter || enemy.inWaitArea)) continue;
                if(enemy.inWaitArea){
                    enemyIndex = FC_Chess.getInstance().getStartPoint(enemy.type).index;
                }

                // 判断6格内
                let aheadIndex = index + 6;
                if(aheadIndex >= GAME_BASE_DATA.chesser_outter_count){
                    aheadIndex -= GAME_BASE_DATA.chesser_outter_count;
                }
                if(enemyIndex >= index && enemyIndex <= aheadIndex){
                    num++;
                }
            }
        }
        return num;
    };

    /**
     * 获取飞机到终点的距离
     * @param point 
     */
    private _getDisToEnd(plane: FC_PlaneModel){
        let num = 996;
        let point = plane.point;
        let type = plane.type;
        if(point.isStopPoint){
            num = 100;

        }else if(point.isWaitPoint){
            num = GAME_BASE_DATA.chesser_outter_count + 6;

        }else if(point.isOuterRing){
            let cutIndex = FC_Chess.getInstance().getCutPoint(type).index;
            let index = point.index;
            if(cutIndex < index){
                num = GAME_BASE_DATA.chesser_outter_count - index + cutIndex;
            }else{
                num = cutIndex - index;
            }

            num += 6;

        }else if(point.isInnerRing){
            num = 6 - point.index;

        }

        return num;
    };

    /**
     * 判断是否遇到迭机(仅外环)
     * @param point 目标点
     * @param type PLANE_TYPE 类型
     */
    private _isStackPlanes(point: FC_ChessPoint, type: PLANE_TYPE){
        let bool = false;
        if(point.isOuterRing){
            for(let i = 0; i < this._stackPlanes.length; i++){
                if(type === i) continue;
                let planesArr = this._stackPlanes[i];
                for(let n = 0; n < planesArr.length; n++){
                    let plane = planesArr[n][0];
                    if(plane.inOuter && point.index === plane.locationIndex){
                        // 下一步是迭机
                        bool = true;
                        break;
                    }
                }
            }
        }
        return bool;
    };

    /**
     * 获取两点之间的迭机点(不算前后点)
     * @param startIndex 点一
     * @param endIndex 点二
     * @param type 类型
     */
    private _getStackInTwoPoints(startIndex: number, endIndex: number, type: PLANE_TYPE){
        let result: FC_PlaneModel[] = null;
        let min = startIndex;
        let max = endIndex;
        let dis = 0;
        for(let i = 0; i < this._stackPlanes.length; i++){
            if(type === i) continue;
            let planesArr = this._stackPlanes[i];
            for(let n = 0; n < planesArr.length; n++){
                let planes = planesArr[n];
                let plane = planes[0];
                if(plane.active && plane.inOuter && plane.locationIndex > min && plane.locationIndex < max){
                    // 这个迭机在范围内
                    let dis_1 = plane.index - min;
                    dis_1 < 0 ? dis_1 += GAME_BASE_DATA.chesser_outter_count : 0;

                    if(!result || (result && dis_1 < dis)){
                        dis = dis_1;
                        result = planes;
                    }
                }
            }
            
        }
        return result;
    };

    /**
     * 获取目标点上,非本类型的其他飞机
     * @param targetPoint FC_ChessPoint 目标点
     * @param type PLANE_TYPE 类型
     */
    private _getEnemyPlanes(targetPoint: FC_ChessPoint, type: PLANE_TYPE){
        let result: FC_PlaneModel[] = [];
        if(targetPoint.isOuterRing){
            for(let i = 0; i < GAME_BASE_DATA.player_max_count; i++){
                let temps = this._getPlanesByType(i);
                if(!temps[0].active) continue;
                if(temps[0].type !== type){
                    for(let j = 0; j < temps.length; j++){
                        let temp = temps[j];
                        if((temp.inOuter && targetPoint.isOuterRing || temp.inInner && targetPoint.isInnerRing) && temp.locationIndex === targetPoint.index){
                            result.push(temp);
                        }
                    }
                }
            }
        }
        return result;
    };

    /**
     * 获取相同类型, 相同点的飞机
     * @param targetPoint FC_ChessPoint 目标点
     * @param type PLANE_TYPE 类型
     */
    private _getSamePlanes(targetPoint: FC_ChessPoint, type: PLANE_TYPE){
        let result: FC_PlaneModel[] = [];
        let planes = this._getPlanesByType(type);

        if(!planes[0].active || targetPoint.isStopPoint){
            return result;
        }

        for(let i = 0; i < planes.length; i++){
            if((planes[i].inOuter && targetPoint.isOuterRing || planes[i].inInner && targetPoint.isInnerRing) && planes[i].locationIndex === targetPoint.index){
                result.push(planes[i]);
            }
        }

        return result;
    };

    /**
     * 获取planes
     * @param type 
     */
    private _getPlanesByType(type: PLANE_TYPE){
        let planes: FC_PlaneModel[];
        if(type === PLANE_TYPE.THE_RED){
            planes = this._planesObj.red;
        }else if(type === PLANE_TYPE.THE_YELLOW){
            planes = this._planesObj.yellow;
        }else if(type === PLANE_TYPE.THE_BLUE){
            planes = this._planesObj.blue;
        }else if(type === PLANE_TYPE.THE_GREEN){
            planes = this._planesObj.green;
        }
        return planes;
    }

    /**
     * 创建飞机棋子
     * @param type 类型
     */
    private _createPlanes(type: PLANE_TYPE, group: FC_PlaneModel[]){
        let planeMaxCount = GAME_BASE_DATA.player_chesser_count;
        for(let i = 0; i < planeMaxCount; i++){
            // 新建飞机棋子
            let index = Number(type) * planeMaxCount + i + 1;
            let plane = new FC_PlaneModel(type);
            group.push(plane);
            // 绑定
            let planeContronller = this._planePool.get(this._planePool);
            this.planeNode.addChild(planeContronller, index);
            this._bindMC(plane, planeContronller);
            // 获取停驻点,进行初始化
            let stopPoint = FC_Chess.getInstance().getStopPoint(type, i);
            plane.init(stopPoint, index);
        }
    };

    /**
     * 创建玩家
     * @param pos 位置
     */
    private _createPlayer(pos: cc.Vec2, index: number){
        if(this._playerPool.size() < 1){
            let temp = cc.instantiate(this.playerPrefab);
            this._playerPool.put(temp);
        }
        let node = this._playerPool.get(pos, index);
        this.playerNode.addChild(node);
        return node;
    };

    /**
     * 创建爆炸动画
     * @param pos 位置
     */
    private _createBoomAnim(pos: cc.Vec2){
        if(this._boomAnimPool.size() < 1){
            let temp = cc.instantiate(this.boomAnimPrefab);
            this._boomAnimPool.put(temp);
        }
        let node = this._boomAnimPool.get(pos, this._boomAnimPool);
        this.animNode.addChild(node);
        return node;
    };

    private _bindMC(m: Comm_Model, c: Comm_ContronllerComponent | cc.Node){
        Comm_Binder.getInstance().bindMC(m, c);
    };
}
