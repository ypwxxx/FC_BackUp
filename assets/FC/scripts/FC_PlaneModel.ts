import { PLANE_TYPE, DIRECTION, COMMAND_FC_PLANE, FC_EVENT, GAME_BASE_DATA, PLANE_MOVE_TYPE } from "./FC_Constant";
import Comm_Model from "../../myCommon/script/Comm_Model";
import Comm_Command from "../../myCommon/script/Comm_Command";
import FC_ChessPoint from "./FC_ChessPoint";
import Comm_Log from "../../myCommon/script/Comm_Log";
import { NOTIFICATION } from "../../myCommon/script/Comm_Modules";
import { PlaneMoveTask, PlaneMoveSimpleTask } from "./FC_Interface";

/**
 * 飞机类模块
 */

export default class FC_PlaneModel extends Comm_Model {
    public constructor(type: PLANE_TYPE){
        super();
        this._type = type;
    };

    public static PLANE_DIRECTION = {           // 方向
        UP: 0,
        DOWN: 180,
        LEFT: 270,
        RIGHT: 90,
    };

    private _zIndex: number = null;             // zIndex
    private _type: PLANE_TYPE = null;           // 类型 -- 皮肤会根据类型自动确定
    private _index: number = null;              // 序号 -- 飞机序号
    private _direction: DIRECTION = null;       // 方向
    private _location: number = null;           // 在棋盘上的序号坐标
    private _stopPoint: FC_ChessPoint = null;   // 停驻点
    private _canTouch: boolean = false;         // 可否点击
    private _taskArr: PlaneMoveTask[] = null;   // 移动任务列表
    private _moveTaskIndex: number = null;      // 移动任务序号
    private _forwardMoveStep: number = null;    // 向前移动的步数
    private _isMoving: boolean = null;          // 移动中

    public inOuter: boolean = false;            // 在外环
    public inInner: boolean = false;            // 在内环
    public inStopArea: boolean = null;          // 在停驻区域(未完成飞行)
    public inWaitArea: boolean = null;          // 在等待区域
    public inEndArea: boolean = null;           // 抵达终点(完成飞行)
    public point: FC_ChessPoint = null;         // 所在棋点

    /**
     * 飞机是否激活
     */
    public get active(): boolean{
        return this._contronller.node.active;
    };
    public set active(bool: boolean){
        this._contronller.node.active = bool;
    }

    /**
     * 类型
     */
    public get type(): PLANE_TYPE{
        return this._type;
    }

    /**
     * 飞机的序号
     */
    public get index(): number{
        return this._index;
    };

    /**
     * zIndex
     */
    public get zIndex(): number{
        return this._contronller.node.zIndex % GAME_BASE_DATA.plane_count;
    };
    public set zIndex(num: number){
        let index = num % GAME_BASE_DATA.plane_count;
        this._contronller.node.zIndex = index;
        this._zIndex = index;
    };

    /**
     * 位置
     */
    public get position(): cc.Vec2{
        return this._contronller.node.getPosition();
    };
    public set position(pos: cc.Vec2){
        this._contronller.node.setPosition(pos);
    };

    /**
     * 方向
     */
    public get direction(): DIRECTION{
        return this._direction;
    };
    public set direction(dir: DIRECTION){
        this._direction = dir;
        let rotation = this._getRotateByDirection(this.direction);
        this.sendMessageToContronller(COMMAND_FC_PLANE.set_rotation, rotation);
    };

    /**
     * 飞机所处点的序号
     */
    public get locationIndex(): number{
        return this._location;
    };
    public set locationIndex(num: number){
        this._location = num;
    };

    /**
     * 已经走过的向前的步数
     */
    public get forwardMoveStep(): number{
        return this._forwardMoveStep;
    };

    /**
     * 在航线
     */
    public get inRoutes(): boolean{
        return (this.inInner || this.inOuter);
    };

    public get stopPoint(): FC_ChessPoint{
        return this._stopPoint.clone();
    };

    /**
     * 是否在移动中
     */
    public get isMoving(): boolean{
        return this._isMoving;
    };
    public set isMoving(bool: boolean){
        this._isMoving = bool;
        if(bool){
            this._contronller.node.zIndex = this._zIndex + GAME_BASE_DATA.plane_count;

        }else{
            this._contronller.node.zIndex = this._zIndex;

        }
    };

    /**
     * 初始化
     * @param point 停驻点
     * @param zIndex
     */
    public init(point: FC_ChessPoint, zIndex: number = 0){
        this._stopPoint = point;
        this._index = this._stopPoint.index;
        this._zIndex = zIndex;
        this._isMoving = false;

        this.sendMessageToContronller(COMMAND_FC_PLANE.set_skin, this._type);                   // 设置皮肤
    };

    /**
     * 重置
     * @param bool 是否激活
     */
    public reset(bool: boolean){
        this.active = bool;
        this.position = this._stopPoint.pos;
        this.direction = this._stopPoint.direction;
        this._location = this._stopPoint.index;
        this._canTouch = false;
        this._taskArr = null;
        this._moveTaskIndex = null;
        this._forwardMoveStep = 0;

        this.isMoving = false;
        this.inStopArea = true;
        this.inWaitArea = false;
        this.inEndArea = false;
        this.inOuter = false;
        this.inInner = false;
        this.point = this._stopPoint.clone();

        this.sendMessageToContronller(COMMAND_FC_PLANE.reset);
        this.sendMessageToContronller(COMMAND_FC_PLANE.set_skin, this._type);
    };

    /**
     * 暂停
     */
    public pause(){
        this.sendMessageToContronller(COMMAND_FC_PLANE.pause);
    };

    /**
     * 恢复
     */
    public resume(){
        this.sendMessageToContronller(COMMAND_FC_PLANE.resume);
    };

    /**
     * 等待
     */
    public standby(){
        this._canTouch = true;
        this.sendMessageToContronller(COMMAND_FC_PLANE.play_anim, GAME_BASE_DATA.plane_standby_act);
    };

    /**
     * 停止等待动画
     */
    public stopStandby(){
        this._canTouch = false;
        this.sendMessageToContronller(COMMAND_FC_PLANE.stop_anim, GAME_BASE_DATA.plane_standby_act);
    };

    /**
     * 返回停驻区
     */
    public backToStopArea(isTarget: boolean = false){
        let data: PlaneMoveSimpleTask[] = [
            {
                point: this._stopPoint,
                moveType: PLANE_MOVE_TYPE.STEP,
                isTarget: isTarget
            }
        ];
        this.moveTo(data);
    };

    /**
     * 移动
     * @param taskArr PlaneMoveSimpleTask
     */
    public moveTo(taskArr: PlaneMoveSimpleTask[]){
        this._canTouch = false;
        this._taskArr = [];
        this._moveTaskIndex = 0;

        for(let i = 0; i < taskArr.length; i++){
            let temp = taskArr[i];
            let rotate = this._getRotateByDirection(temp.point.direction);
            let scale = GAME_BASE_DATA.plane_step_scale;
            let time = GAME_BASE_DATA.plane_step_time;
            let isEnd = temp.isEnd ? true : false;
            let isCrash = temp.isCrash ? true : false;
            let isBack = temp.isBack ? true : false;
            let isFly = temp.isFly ? true : false;
            let isFlyCenter = temp.isFlyCenter ? true : false;
            let isTarget = temp.isTarget ? true : false;

            if(temp.moveType === PLANE_MOVE_TYPE.JUMP){
                scale = GAME_BASE_DATA.plane_jump_scale;
                time = GAME_BASE_DATA.plane_jump_time;

            }else if(temp.moveType === PLANE_MOVE_TYPE.FLY){
                scale = GAME_BASE_DATA.plane_fly_scale;
                time = GAME_BASE_DATA.plane_fly_time;
            }

            // 切点
            if(temp.point.isCutPoint){
                Comm_Log.log('类型point: ',temp.point.type, 'plane type: ', this._type, 'step: ', this._forwardMoveStep);
            }
            if(temp.point.isCutPoint && temp.point.type === this._type && this._forwardMoveStep >= 24){
                rotate = this._getRotateByDirection(temp.point.cutDirection);
            }

            // 飞行点
            if(isFly){
                if(!isBack && temp.point.isFlyStartPoint){
                    rotate = this._getRotateByDirection(temp.point.flyDirection);
                }

                if((i > 0 && taskArr[i - 1].isFlyCenter) || isFlyCenter){
                    time /= 2;
                }
            }

            let task: PlaneMoveTask = {
                point: temp.point,
                rotation: rotate,
                time: time,
                scale: scale,
                isEnd: isEnd,
                isCrash: isCrash,
                isBack: isBack,
                isFly: isFly,
                isFlyCenter: isFlyCenter,
                isTarget: isTarget,
            };
            this._taskArr.push(task);
        }

        this.sendMessageToContronller(COMMAND_FC_PLANE.move_to, this._taskArr[this._moveTaskIndex]);

        // 增加渲染序号
        this.isMoving = true;
    };

    /**
     * 接收反馈
     * @param command Comm_Command
     */
    public receivedMessageByContronller(command: Comm_Command){
        command.complete = true;
        if(!command.checkCommand(1)){
            Comm_Log.log(command.failError.msg);
        }
        switch(command.msg){
            case COMMAND_FC_PLANE.feedback_move_end:
                this._moveEnd();
                break;
            case COMMAND_FC_PLANE.feedback_be_touch:
                this._beTouch();
                break;
            default:
                break;
        }
    };

    // 移动结束
    private _moveEnd(){
        // 刷新状态
        let task = this._taskArr[this._moveTaskIndex];
        
        this._flushStatuByPoint(task.point);

        // 向前
        if(task.isBack){
            this._forwardMoveStep--;
        }else{
            this._forwardMoveStep++;
        }

        if(task.isCrash){
            // 撞击了其他飞机
            NOTIFICATION.emit(FC_EVENT.PLANE_CRASH, {point: this.point.clone(), type: this._type});
        }

        if(this._taskArr.length === this._moveTaskIndex + 1){
            // 全部移动任务完成, 反馈移动结束
            if(task.isEnd){
                // 该飞机抵达了最终点, 已回到停驻区
                this.inEndArea = true;
                this.inStopArea = false;
            }

            this._taskArr = null;
            this._moveTaskIndex = null;
            if(task.isTarget){
                NOTIFICATION.emit(FC_EVENT.PLANE_MOVE_END, {type: this._type, index: this._index});

            }else{
                // 还原zIndex
                this.isMoving = false;
            }
            
        }else{
            // 继续移动任务
            this._moveTaskIndex++;
            this.sendMessageToContronller(COMMAND_FC_PLANE.move_to, this._taskArr[this._moveTaskIndex]);
        }
    };

    // 被点击
    private _beTouch(){
        if(this._canTouch){
            this._canTouch = false;
            NOTIFICATION.emit(FC_EVENT.PLANE_BE_CHOOSE, {type: this._type, index: this._index});
        }
    };

    // 根据棋点刷新飞机位置状态
    private _flushStatuByPoint(point: FC_ChessPoint){
        // 更新属性
        this._direction = point.direction;
        this._location = point.index;
        this.position = point.pos;
        this.point = point;

        // 更新位置状态
        this.inStopArea = false;
        this.inWaitArea = false;
        this.inEndArea = false;
        this.inOuter = false;
        this.inInner = false;

        if(point.isStopPoint){
            this.inStopArea = true;
            this._forwardMoveStep = 0;

        }else if(point.isWaitPoint){
            this.inWaitArea = true;

        }else if(point.isOuterRing){
            this.inOuter = true;

        }else if(point.isInnerRing){
            this.inInner = true;
        }
    };

    // 根据方向返回角度
    private _getRotateByDirection(dir: DIRECTION){
        let rotation = null;

        if(dir === DIRECTION.UP){
            rotation = FC_PlaneModel.PLANE_DIRECTION.UP;

        }else if(dir === DIRECTION.DOWN){
            rotation = FC_PlaneModel.PLANE_DIRECTION.DOWN;

        }else if(dir === DIRECTION.LEFT){
            rotation = FC_PlaneModel.PLANE_DIRECTION.LEFT;

        }else if(dir === DIRECTION.RIGHT){
            rotation = FC_PlaneModel.PLANE_DIRECTION.RIGHT;

        }

        return rotation;
    };

    // 根据角度返回方向
    private _getDirectionByRotate(rotate: number){
        let dir: DIRECTION = null;

        if(rotate === FC_PlaneModel.PLANE_DIRECTION.UP){
            dir = DIRECTION.UP;

        }else if(rotate === FC_PlaneModel.PLANE_DIRECTION.DOWN){
            dir = DIRECTION.DOWN;

        }else if(rotate === FC_PlaneModel.PLANE_DIRECTION.LEFT){
            dir = DIRECTION.LEFT;

        }else if(rotate === FC_PlaneModel.PLANE_DIRECTION.RIGHT){
            dir = DIRECTION.RIGHT;

        }

        return dir;
    };
}
