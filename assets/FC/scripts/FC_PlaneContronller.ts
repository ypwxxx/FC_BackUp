import Comm_ContronllerComponent from "../../myCommon/script/Comm_ContronllerComponent";
import { COMMAND_FC_PLANE, PLANE_TYPE, GAME_BASE_DATA, ASSETS_NAME } from "./FC_Constant";
import Comm_Command from "../../myCommon/script/Comm_Command";
import Comm_Log from "../../myCommon/script/Comm_Log";
import { PlaneMoveTask } from "./FC_Interface";

/**
 * 飞机控制类
 */
const {ccclass, property} = cc._decorator;

@ccclass
export default class FC_PlaneContronller extends Comm_ContronllerComponent {

    @property(cc.Sprite)
    planeSkinSprite: cc.Sprite = null;                  // 飞机皮肤

    @property(cc.SpriteAtlas)
    spriteAtlas: cc.SpriteAtlas = null;                 // 图集

    private _pool: cc.NodePool = null;                  // 对象池
    private _standByActionTag: number = 1000;           // 待机动作tag
    private _moveActionTag: number = 1001;              // 移动动作tag
    private _moveEndCallback: Function = null;          // 移动结束回调
    private _planeSkinAssets: cc.SpriteFrame[] = null;  // assets

    public reuse(pool: cc.NodePool){
        this._restores();

        this._pool = pool;
        this._moveEndCallback = function(){
            this.sendMessageToModel(COMMAND_FC_PLANE.feedback_move_end);
        };
        this._checkAndSetAssets();

        // 添加点击事件监听
        this.node.on(cc.Node.EventType.TOUCH_END, this._touchEnd, this);
    };

    public unuse(){
        this._restores();

        // 取消点击事件监听
        this.node.off(cc.Node.EventType.TOUCH_END, this._touchEnd, this);
    };

    // 回收
    public recircle(){
        this._pool.put(this.node);
    };

    // 销毁
    public onDestroy(){
        if(cc.isValid(this.node)){
            this.node.off(cc.Node.EventType.TOUCH_END, this._touchEnd, this);
        }
    };

    // 接收信息
    public receivedMessageByModel(command: Comm_Command){
        command.complete = true;
        if(!command.checkCommand(1)){
            Comm_Log.log(command.failError.msg);
        }
        switch(command.msg){
            case COMMAND_FC_PLANE.set_skin :
                this._setSkin(command);
                break;
            case COMMAND_FC_PLANE.set_pos :
                this._setPos(command);
                break;
            case COMMAND_FC_PLANE.play_anim:
                this._playAnim(command);
                break;
            case COMMAND_FC_PLANE.stop_anim:
                this._stopAnim(command);
                break;
            case COMMAND_FC_PLANE.move_to:
                this._moveTo(command);
                break;
            case COMMAND_FC_PLANE.set_rotation:
                this._setRotation(command);
                break;
            case COMMAND_FC_PLANE.reset:
                this._reset();
                break;
            case COMMAND_FC_PLANE.pause:
                this._pause();
                break;
            case COMMAND_FC_PLANE.resume:
                this._resume();
                break;
            case COMMAND_FC_PLANE.set_active:
                this._setActive(command);
                break;
            case COMMAND_FC_PLANE.set_zIndex:
                this._setZIndex(command);
                break;
            default:
                break;
        }
    };

    /**
     * 设置zIndex
     * @param command 
     */
    private _setZIndex(command: Comm_Command){
        if(!command.checkCommand(2)){
            return;
        }

        let num = command.content;
        this.node.zIndex = num;
    };

    /**
     * 设置皮肤
     * @param command
     */
    private _setSkin(command: Comm_Command){
        if(!command.checkCommand(2)){
            return;
        }

        let type = command.content;
        let index = 0;

        if(type === PLANE_TYPE.THE_RED){
            index = 0;

        }else if(type === PLANE_TYPE.THE_YELLOW){
            index = 1;

        }else if(type === PLANE_TYPE.THE_BLUE){
            index = 2;

        }else if(type === PLANE_TYPE.THE_GREEN){
            index = 3;

        }

        this.planeSkinSprite.spriteFrame = this._planeSkinAssets[index];
    };

    /**
     * 设置坐标位置
     * @param command 
     */
    private _setPos(command: Comm_Command){
        if(!command.checkCommand(2)){
            return;
        }

        let pos = command.content;
        if(pos instanceof cc.Vec2){
            this.node.setPosition(pos);
        }
    };

    /**
     * 设置旋转度
     * @param command 
     */
    private _setRotation(command: Comm_Command){
        if(!command.checkCommand(2)){
            return;
        }

        let rotation = command.content;
        if(typeof rotation === 'number'){
            this.node.rotation = rotation;
        }
    };

    /**
     * 播放动画
     * @param command 
     */
    private _playAnim(command: Comm_Command){
        if(!command.checkCommand(2)){
            return;
        }

        let name: string = command.content;
        if(name === GAME_BASE_DATA.plane_standby_act){
            let act = cc.repeatForever(cc.sequence(
                cc.scaleTo(0.8, 1.2),
                cc.scaleTo(0.8, 1.0),
                cc.delayTime(0.1),
            ));
            act.setTag(this._standByActionTag);
            this.node.setScale(1);
            this.node.stopActionByTag(this._standByActionTag);
            this.node.runAction(act);
        }
    };

    /**
     * 停止动画
     * @param command 
     */
    private _stopAnim(command: Comm_Command){
        if(!command.checkCommand(2)){
            return;
        }

        let name: string = command.content;
        if(name === GAME_BASE_DATA.plane_standby_act){
            this.node.setScale(1);
            this.node.stopActionByTag(this._standByActionTag);
        }
    };

    /**
     * 移动
     * @param command 
     */
    private _moveTo(command: Comm_Command){
        if(!command.checkCommand(2)){
            return;
        }

        let task: PlaneMoveTask = command.content;
        let pos = task.point.pos;
        let rotate = task.rotation;
        let time = task.time;
        //回退模式
        if(task.isBack){
            time = 0.1;
        }
        let act = cc.sequence(
            cc.moveTo(time, pos),
            cc.delayTime(0.1),
        )

        // 判断是否需要旋转角度
        if(rotate !== this.node.rotation){
            act = cc.sequence(
                cc.moveTo(time, pos),
                cc.rotateTo(0.1, rotate).easing(cc.easeCubicActionOut()),
                cc.delayTime(0.1),
            )
        }

        if(task.isFlyCenter){
            // 飞行至交叉点
            act = cc.moveTo(time, pos)
        }

        this.node.stopActionByTag(this._moveActionTag);
        let act_1 = cc.sequence(
            act,
            cc.callFunc(() => {
                if(task.isEnd){
                    this.planeSkinSprite.spriteFrame = this._planeSkinAssets[4];
                    this.node.rotation = 0;
                }

                if(task.isTarget){
                    // 目标任务, 延迟0.1s
                    cc.director.getScheduler().schedule(this._moveEndCallback, this, 0.1, 0, 0, false);

                }else{
                    this.sendMessageToModel(COMMAND_FC_PLANE.feedback_move_end);
                }
            }),
        );

        act_1.setTag(this._moveActionTag);
        this.node.runAction(act_1);
    };

    /**
     * 重置
     */
    private _reset(){
        this.node.setScale(1);
        this.node.stopAllActions();
        cc.director.getScheduler().unschedule(this._moveEndCallback, this);
    };

    /**
     * 暂停
     */
    private _pause(){
        this.node.pauseAllActions();
        cc.director.getScheduler().pauseTarget(this);
    };

    /**
     * 恢复
     */
    private _resume(){
        this.node.resumeAllActions();
        cc.director.getScheduler().resumeTarget(this);
    };

    /**
     * 设置激活
     * @param command 
     */
    private _setActive(command: Comm_Command){
        if(!command.checkCommand(2)){
            return;
        }

        let bool = !!command.content;
        this.node.active = bool;
    };

    // 还原
    private _restores(){
        this._reset();
        this._pool = null;
    };

    // 点击
    private _touchEnd(){
        this.node.stopAllActions();
        this.node.setScale(1);
        this.sendMessageToModel(COMMAND_FC_PLANE.feedback_be_touch);
    };

    // 检查并获取资源
    private _checkAndSetAssets(){
        if(!this._planeSkinAssets){
            this._planeSkinAssets = [];

            let name = '';
            for(let i = 0; i < 4; i++){
                name = '' + ASSETS_NAME.plane + i + '_0';
                this._planeSkinAssets.push(this.spriteAtlas.getSpriteFrame(name));
            }

            name = '' + ASSETS_NAME.plane_finish;
            this._planeSkinAssets.push(this.spriteAtlas.getSpriteFrame(name));
        }
    };
}
