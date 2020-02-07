import Comm_ContronllerComponent from "../../myCommon/script/Comm_ContronllerComponent";
import Comm_Command from "../../myCommon/script/Comm_Command";
import Comm_Log from "../../myCommon/script/Comm_Log";
import { COMMAND_FC_PLAYER, PLANE_TYPE, ASSETS_NAME } from "./FC_Constant";
import { CommFunc } from "../../myCommon/script/Comm_Modules";

/**
 * 玩家控制类
 * 负责玩家类的沟通,同步修改显示.
 */
const {ccclass, property} = cc._decorator;

@ccclass
export default class FC_PlayerController extends Comm_ContronllerComponent {

    @property(cc.Label)
    playerName: cc.Label = null;
    @property(cc.Sprite)
    uiSp: cc.Sprite = null;
    @property(cc.Sprite)
    playerIcon: cc.Sprite = null;
    @property(cc.Sprite)
    diceSp: cc.Sprite = null;
    @property(cc.Sprite)
    rankSp: cc.Sprite = null;
    @property(cc.Node)
    arrowNode: cc.Node = null;

    @property(cc.SpriteAtlas)
    spriteAtlas: cc.SpriteAtlas = null;

    private _arrowBasePos: cc.Vec2 = null;
    private _iconGreyFrame: cc.SpriteFrame = null;
    private _uiGreyFrame: cc.SpriteFrame = null;
    private _diceFrames: cc.SpriteFrame[] = null;
    private _iconFrames: cc.SpriteFrame[] = null;
    private _rankFrames: cc.SpriteFrame[] = null;
    private _throwEnd: Function = null;


    public reuse(pos: cc.Vec2, index: number){
        this.node.setPosition(pos);

        if(pos.x > 0){
            // 做一下对称处理
            let children = this.node.children;
            for(let i = 0; i < children.length; i++){
                children[i].x *= -1;
            }

            this.arrowNode.scaleX = -1;
        }

        let name = '' + ASSETS_NAME.head_bg + index;
        this.uiSp.spriteFrame = this.spriteAtlas.getSpriteFrame(name);
        this._throwEnd = function(){
            this.sendMessageToModel(COMMAND_FC_PLAYER.feedback_throw_end);
        };

        this._checkAndSetAssets();
    };

    public unuse(){

    };

    // 点击骰子
    public touchDice(){
        this.sendMessageToModel(COMMAND_FC_PLAYER.feedback_touch_dice);
    };
    
    // 接收消息
    public receivedMessageByModel(command: Comm_Command){
        command.complete = true;
        if(!command.checkCommand(1)){
            Comm_Log.log(command.failError.msg)
        }
        switch(command.msg){
            case COMMAND_FC_PLAYER.flush_ui :
                this._flushUI(command);
                break;
            case COMMAND_FC_PLAYER.start_round :
                this._startRound(command);
                break;
            case COMMAND_FC_PLAYER.end_round :
                this._endRound();
                break;
            case COMMAND_FC_PLAYER.throw_dice :
                this._throwDice(command);
                break;
            case COMMAND_FC_PLAYER.show_rank :
                this._showRank(command);
                break;
            case COMMAND_FC_PLAYER.pause :
                this._pause();
                break;
            case COMMAND_FC_PLAYER.resume :
                this._resume();
                break;
            default:
                break;
        }
    };

    private _pause(){
        cc.director.getScheduler().pauseTarget(this);
        this.diceSp.node.pauseAllActions();
        this.rankSp.node.pauseAllActions();
        this.arrowNode.pauseAllActions();
    };

    private _resume(){
        cc.director.getScheduler().resumeTarget(this);
        this.diceSp.node.resumeAllActions();
        this.rankSp.node.resumeAllActions();
        this.arrowNode.resumeAllActions();
    };

    /**
     * 回合开始
     */
    private _startRound(command: Comm_Command){
        if(!command.checkCommand(2)){
            return;
        }

        let beforeDiceNum = command.content;

        // 显示当前玩家上一次投掷的骰子数
        this.diceSp.spriteFrame = this._diceFrames[beforeDiceNum];

        // 显示播放箭头动画
        this._playArrowAnim();
    };

    /**
     * 回合结束
     */
    private _endRound(){
        // 隐藏骰子,停止箭头
        this._hideDice();
        this._stopArrowAnim();
    };

    /**
     * 显示排名
     * @param command 
     */
    private _showRank(command: Comm_Command){
        if(!command.checkCommand(2)){
            return;
        }

        // 隐藏骰子
        this._hideDice();

        let rank = command.content;
        if(rank == 1){
            this.rankSp.spriteFrame = this._rankFrames[0];
        }else if(rank == 2){
            this.rankSp.spriteFrame = this._rankFrames[1];
        }else{
            return;
        }

        this.rankSp.node.scale = 0;
        this.rankSp.node.stopAllActions();
        this.rankSp.node.runAction(cc.sequence(
            cc.scaleTo(0.5, 1.2),
            cc.scaleTo(0.5, 1.0)
        ));
    };

    /**
     * 刷新ui--名字/头像/隐藏排名/骰子
     * @param command 
     */
    private _flushUI(command: Comm_Command){
        if(!command.checkCommand(2)){
            return;
        }

        let name: string = command.content.name;
        let iconIndex: number = command.content.iconIndex;
        let planeType: PLANE_TYPE = command.content.planeType;
        let scaleX = -1;

        this.playerName.string = name;
        if(iconIndex === -1){
            this.playerIcon.spriteFrame = this._iconGreyFrame;
            this.uiSp.spriteFrame = this._uiGreyFrame;

            if(planeType === PLANE_TYPE.THE_RED || planeType === PLANE_TYPE.THE_YELLOW){
                scaleX = 1;
            }
        }else{
            this.playerIcon.spriteFrame = this._iconFrames[iconIndex];
        }
        this.uiSp.node.scaleX = scaleX;

        this.diceSp.spriteFrame = null;
        this.rankSp.spriteFrame = null;

        this._stopArrowAnim();
        this.diceSp.node.stopAllActions();
        this.rankSp.node.stopAllActions();
        this.arrowNode.stopAllActions();
        cc.director.getScheduler().unschedule(this._throwEnd, this);

        // 记录下箭头的起始位置
        if(!this._arrowBasePos){
            this._arrowBasePos = this.arrowNode.getPosition().clone();
        }
    };

    /**
     * 投骰子
     * @param command 
     */
    private _throwDice(command: Comm_Command){
        if(!command.checkCommand(2)){
            return;
        }

        let result: number = command.content;
        let i = 0;
        let arr = [0, 1, 2, 3, 4, 5];
        CommFunc.randSortArr(arr);
        while(arr[5] === result){
            CommFunc.randSortArr(arr);
        }

        this.diceSp.node.stopAllActions();
        this.diceSp.node.runAction(cc.repeat(cc.sequence(
            cc.callFunc(() => {
                if(i <= 5){
                    this.diceSp.spriteFrame = this._diceFrames[arr[i]];
                    i++;
                }else{
                    // 投掷完成 发送消息
                    this.diceSp.spriteFrame = this._diceFrames[result];
                    this.diceSp.node.stopAllActions();
                    // 延时0.5s再发送, 给与骰子数一个停留时间
                    cc.director.getScheduler().schedule(this._throwEnd, this, 0.5, 0, 0, false);
                }
            }),
            cc.delayTime(0.1)
        ), 7))
    };

    /**
     * 隐藏骰子
     */
    private _hideDice(){
        this.diceSp.spriteFrame = null;
    };

    // 播放箭头动画
    private _playArrowAnim(){
        this.arrowNode.active = true;
        let dis = this.node.x < 0 ? -25 : 25;

        this.arrowNode.setPosition(this._arrowBasePos);
        this.arrowNode.stopAllActions();
        this.arrowNode.runAction(cc.repeatForever(
            cc.sequence(
                cc.moveBy(1.0, cc.v2(dis, 0)),
                cc.moveBy(1.0, cc.v2(-dis, 0))
            )
        ));
    };

    // 停止箭头
    private _stopArrowAnim(){
        this.arrowNode.stopAllActions();
        this.arrowNode.active = false;
    };

    // 检查并设置资源
    private _checkAndSetAssets(){
        let name = '';
        if(!this._iconGreyFrame){
            name = '' + ASSETS_NAME.head_grey;
            this._iconGreyFrame = this.spriteAtlas.getSpriteFrame(name);
        }
        if(!this._uiGreyFrame){
            name = '' + ASSETS_NAME.player_bg_default;
            this._uiGreyFrame = this.spriteAtlas.getSpriteFrame(name);
        }
        if(!this._diceFrames){
            this._diceFrames = [];
            for(let i = 1; i <= 6; i++){
                name = '' + ASSETS_NAME.dice + i;
                this._diceFrames.push(this.spriteAtlas.getSpriteFrame(name));
            }
        }
        if(!this._iconFrames){
            this._iconFrames = [];
            for(let i = 0; i < 11; i++){
                name = '' + ASSETS_NAME.head + i;
                this._iconFrames.push(this.spriteAtlas.getSpriteFrame(name));
            }
        }
        if(!this._rankFrames){
            this._rankFrames = [];
            for(let i = 0; i < 2; i++){
                name = '' + ASSETS_NAME.rank + (i + 1);
                this._rankFrames.push(this.spriteAtlas.getSpriteFrame(name));
            }
        }
    };
}
