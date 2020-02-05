/**
 * 玩家类模块
 * 记录玩家的相关数据,控制飞机棋子的运行
 */
import { PLAYER_TYPE, PLANE_TYPE, COMMAND_FC_PLAYER, FC_EVENT, AI_GRADE, AI_BEHAVIOR } from "./FC_Constant";
import Comm_Model from "../../myCommon/script/Comm_Model";
import FC_GameData from "./FC_GameData";
import Comm_Command from "../../myCommon/script/Comm_Command";
import Comm_Log from "../../myCommon/script/Comm_Log";
import { NOTIFICATION, CommFunc } from "../../myCommon/script/Comm_Modules";

export default class FC_PlayerModel extends Comm_Model{
    public constructor() {
        super();
    };

    private _playerName: string = null;             // 玩家名
    private _playerIcon: number = null;             // 玩家头像
    private _index: number = null;                  // 序号
    private _playerRank: number = null;             // 结束排名
    private _diceResults: number[] = null;          // 骰子结果
    private _canTouchDice: boolean = null;          // 可否点击骰子
    private _aiDifficute: AI_GRADE = null;          // ai等级
    private _aiBehavior: AI_BEHAVIOR = null;        // ai特性

    public rotateIndex: number = null;              // 轮转次序
    public playerType: PLAYER_TYPE = null;          // 玩家类型
    public planeType: PLANE_TYPE = null;            // 控制的飞机类型
    public canMovePlaneCount: number = null;        // 可以移动的飞机数量
    public active: boolean = null;                  // 是否激活

    public get AIDifficult(): AI_GRADE{
        return this._aiDifficute;
    };

    public get AIBehavior(): AI_BEHAVIOR{
        return this._aiBehavior;
    };

    public get rank(): number {
        return this._playerRank;
    };

    public get name(): string{
        return this._playerName;
    };

    public get iconIndex(): number {
        return this._playerIcon;
    };

    // 是否是连续三次六号骰子(判断作弊)
    public get isThreeTimesDiceOfSix(): boolean{
        let results = true;
        let length = this._diceResults.length;
        for(let i = length - 1, j = 0; j < 3; i--, j++){
            if(this._diceResults[i] !== 5){
                results = false;
            }
        }
        return results;
    };

    // 初始化(所控制的飞机类型)
    public init(plane: PLANE_TYPE, index: number){
        this.planeType = plane;
        this._index = index;
    };

    // 重置(只重置头像/玩家类型/次序...)
    public reset(){
        // 玩家类型
        this.playerType = FC_GameData.getInstance().getPlayerType(this.planeType);

        // icon编号
        this._playerIcon = -1;
        if(this.playerType !== PLAYER_TYPE.NONE){
            this._playerIcon = FC_GameData.getInstance().getPlayerIconIndex(this.planeType);
        }

        // 轮转次序
        this.rotateIndex = FC_GameData.getInstance().getPlayerOrder(this.planeType);

        this.active = true;
        if(this.playerType === PLAYER_TYPE.AI){
            this._playerName = "电脑" + this._index;
            // 随机ai等级
            let num = CommFunc.rand(90);
            if(num < 30){
                this._aiDifficute = AI_GRADE.SIMPLE;

                // test
                this._playerName = "简单" + this._playerName;

            }else if(num < 60){
                this._aiDifficute = AI_GRADE.NORMAL;

                // test
                this._playerName = "普通" + this._playerName;

            }else{
                this._aiDifficute = AI_GRADE.HARD;

                // test
                this._playerName = "困难" + this._playerName;

            }

            // 随机ai特性
            num = CommFunc.rand(90);
            if(num < 30){
                this._aiBehavior = AI_BEHAVIOR.ATTACK;

                // test
                this._playerName = "进攻" + this._playerName;

            }else if(num < 60){
                this._aiBehavior = AI_BEHAVIOR.EVASION;

                // test
                this._playerName = "闪避" + this._playerName;

            }else{
                this._aiBehavior = AI_BEHAVIOR.DEVELOPMENT;

                // test
                this._playerName = "发育" + this._playerName;

            }

        }else if(this.playerType === PLAYER_TYPE.OFFLINE){
            this._playerName = "玩家" + this._index;

        }else if(this.playerType === PLAYER_TYPE.ONLINE){
            this._playerName = "";

        }else if(this.playerType === PLAYER_TYPE.NONE){
            this._playerName = "";
            this.active = false;

        }

        this._playerRank = -1;          // 无排名
        this._diceResults = [];         // 骰子结果
        this._canTouchDice = false;     // 可否被点击

        this._flushUI();
    };

    // 暂停
    public pause(){
        this.sendMessageToContronller(COMMAND_FC_PLAYER.pause);
    };

    // 恢复
    public resume(){
        this.sendMessageToContronller(COMMAND_FC_PLAYER.resume);
    };

    // 开始本玩家的回合
    public startRound(){
        let start = false;

        if(this.active && this._playerRank === -1){
            // 还没有排名 继续游戏
            let num = this._diceResults[this._diceResults.length - 1];
            this.sendMessageToContronller(COMMAND_FC_PLAYER.start_round, num === undefined ? 0 : num);

            if(this.playerType === PLAYER_TYPE.AI){
                // 电脑,自动掷骰子
                this.throwDice();
                // 不可点击
                this._canTouchDice = false;
                start = true;
            }else if(this.playerType === PLAYER_TYPE.OFFLINE){
                this._canTouchDice = true;
                start = true;
            }
        }

        return start;
    };

    // 结束本玩家的回合
    public endRound(){
        this._canTouchDice = false;

        this.sendMessageToContronller(COMMAND_FC_PLAYER.end_round);
    };

    // 显示排名
    public showRank(rank: number){
        this._playerRank = rank;
        this.sendMessageToContronller(COMMAND_FC_PLAYER.show_rank, this._playerRank);
    };

    // 设置允许点击
    public setTouch(bool: boolean = false){
        this._canTouchDice = bool;
    };

    // 刷新UI
    private _flushUI(){
        // 刷新玩家名 刷新玩家头像 隐藏皇冠/骰子
        let obj = {
            name: this._playerName,
            iconIndex: this._playerIcon,
            planeType: this.planeType,
        };

        this.sendMessageToContronller(COMMAND_FC_PLAYER.flush_ui, obj);
    };

    // 投骰子
    public throwDice(){
        // 正准备投掷骰子,此时不可点击
        this._canTouchDice = false;

        let num = Math.floor(Math.random() * 6);
        this._diceResults.push(num);

        // 检查是否会导致连续出现三个6
        if(num === 5 && this.isThreeTimesDiceOfSix){
            // 连续出现了三个6
            num = Math.floor(Math.random() * 5);
            this._diceResults[this._diceResults.length - 1] = num;
        }
        // 防止多次无法启动飞机, 影响游戏体验
        if(this.canMovePlaneCount === 0){
            let launchNum = FC_GameData.getInstance().launchPlaneNums;
            let count = launchNum.length * 2 + 2;           // 4 - 6 - 8
            let times = this._diceResults.length - count;
            if(times > 0){
                for(let i = this._diceResults.length - 1, j = 0; j < count; i--, j++){
                    let canLaunch = false;
                    let diceNum = this._diceResults[i];
                    for(let n = 0; n < launchNum.length; n++){
                        if(diceNum === launchNum[n] - 1){
                            canLaunch = true;
                            break;
                        }
                    }
                    if(!canLaunch && j === count - 1){
                        // 连续多次未启动
                        this._diceResults[this._diceResults.length - 1] = launchNum[0] - 1;
                    }
                }
            }
        }

        this.sendMessageToContronller(COMMAND_FC_PLAYER.throw_dice, num);
    };

    // 接收反馈消息
    public receivedMessageByContronller(command: Comm_Command){
        command.complete = true;
        if(!command.checkCommand(1)){
            Comm_Log.log(command.failError.msg)
        }
        switch(command.msg){
            case COMMAND_FC_PLAYER.feedback_throw_end :
                this._throwEnd();
                break;
            case COMMAND_FC_PLAYER.feedback_touch_dice :
                this._touchDice();
                break;
            default:
                break;
        }
    };

    // 投掷结束
    private _throwEnd(){
        // 向游戏全局发送投掷结束信息
        NOTIFICATION.emit(FC_EVENT.PLAYER_DICE_NUM, this._diceResults[this._diceResults.length - 1]);
    };

    // 点击骰子
    private _touchDice(){
        if(this._canTouchDice){
            this.throwDice();
        }
    };
}
