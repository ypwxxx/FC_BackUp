import { FC_DIRECTION, FC_PLANE_TYPE, FC_POINT_POS_TYPE } from "./FC_Constant";
import { FC_ChessPointInit } from "./FC_Interface";
import Comm_Log from "../../myCommon/utils/Comm_Log";

/**
 * 棋点类
 */
export default class FC_ChessPoint {
    public constructor(data: FC_ChessPointInit) {
        this._initData = data;
        this._index = data.index;
        this._pos = data.pos;
        this._type = data.type;
        this._direction = data.dir;

        this._innerRing = false;
        this._outerRing = false;
        this._waitPoint = false;
        this._stopPoint = false;
        this._startPoint = false;
        this._endPoint = false;
        this._cutPoint = false;
        this._flyStartPoint = false;
        this._flyDir = null;
        this._flyEndIndex = null;
        this._crossPoint = false;
        this._crossType = null;

        if(data.innerRing === true){
            // 内环
            this._area = FC_POINT_POS_TYPE.INNER;
            this._innerRing = true;
            this._endPoint = data.endPoint ? data.endPoint : false;
            if(!this._endPoint){
                // 不是结束点
                this._crossPoint = data.crossPoint ? data.crossPoint :false;
            }

        }else if(data.outerRing === true){
            // 外环
            this._area = FC_POINT_POS_TYPE.OUTTER;
            this._outerRing = true;
            this._startPoint = data.startPoint ? data.startPoint : false;
            this._crossType = data.crossType;
            if(!this._startPoint){
                // 不是开始点
                this._cutPoint = data.cutPoint ? data.cutPoint : false;
                if(this._cutPoint){
                    // 切入点
                    this._cutDir = data.cutDir;

                }else{
                    // 不是切入点
                    this._flyStartPoint = data.flyStartPoint ? data.flyStartPoint : false;
                    if(this._flyStartPoint){
                        // 飞行起始点 记录结束位置
                        this._flyEndIndex = data.flyEndIndex;
                        this._flyDir = data.flyDir;
                    }

                }
            }

        }else if(data.stopPoint === true){
            // 停驻点
            this._area = FC_POINT_POS_TYPE.STOP;
            this._stopPoint = true;

        }else if(data.waitPoint === true){
            // 等待点
            this._area = FC_POINT_POS_TYPE.WAIT;
            this._waitPoint = true;

        }else{
            Comm_Log.warn(`${this._index}chess init data is abnormal`);
        }
    };

    private _index: number = null;                      // 序号
    private _pos: cc.Vec2 = null;                       // 位置坐标
    private _type: FC_PLANE_TYPE = null;                   // 类型
    private _direction: FC_DIRECTION = null;               // 方向(停留的飞机的)
    private _initData: FC_ChessPointInit = null;           // 保留初始化时候的数据

    private _innerRing: boolean = null;                 // 内环
    private _outerRing: boolean = null;                 // 外环
    private _waitPoint: boolean = null;                 // 待机点
    private _stopPoint: boolean = null;                 // 停机点
    private _area: FC_POINT_POS_TYPE = null;               // 区域代码

    private _startPoint: boolean = null;                // 起点
    private _endPoint: boolean = null;                  // 结束点
    private _cutPoint: boolean = null;                  // 切入点(外环->内环)
    private _cutDir: FC_DIRECTION = null;                  // 切入点方向
    private _flyStartPoint: boolean = null;             // 飞行点-起始
    private _flyDir: FC_DIRECTION = null;                  // 飞行方向
    private _flyEndIndex: number = null;                // 飞行结束点序号
    private _crossPoint: boolean = null;                // 内环与飞行线交叉点
    private _crossType: FC_PLANE_TYPE = null;              // 交叉类型

    /**
     * 序号
     */
    public get index(): number{
        return this._index;
    };

    /**
     * 区域位置
     */
    public get area(): FC_POINT_POS_TYPE{
        return this._area;
    }

    /**
     * 位置
     */
    public get pos(): cc.Vec2{
        return this._pos;
    };

    /**
     * 类型
     */
    public get type(): FC_PLANE_TYPE{
        return this._type;
    };

    /**
     * 方向
     */
    public get direction(): FC_DIRECTION{
        return this._direction;
    };

    /**
     * 是内环
     */
    public get isInnerRing(): boolean{
        return this._innerRing;
    };

    /**
     * 是外环
     */
    public get isOuterRing(): boolean{
        return this._outerRing;
    };

    /**
     * 是等待区
     */
    public get isWaitPoint(): boolean{
        return this._waitPoint;
    };

    /**
     * 是停驻区
     */
    public get isStopPoint(): boolean{
        return this._stopPoint;
    };

    /**
     * 是开始点
     */
    public get isStartPoint(): boolean{
        return this._startPoint;
    };

    /**
     * 是结束点
     */
    public get isEndPoint(): boolean{
        return this._endPoint;
    };

    /**
     * 是切入点
     */
    public get isCutPoint(): boolean{
        return this._cutPoint;
    };

    /**
     * 切点方向
     */
    public get cutDirection(): FC_DIRECTION{
        return this._cutDir;
    };

    /**
     * 是飞行开始点
     */
    public get isFlyStartPoint(): boolean{
        return this._flyStartPoint;
    };

    /**
     * 是交叉点
     */
    public get isCrossPoint(): boolean{
        return this._crossPoint;
    };

    /**
     * 飞行方向
     */
    public get flyDirection(): FC_DIRECTION{
        return this._flyDir;
    };

    /**
     * 飞行结束序号
     */
    public get flyEndIndex(): number{
        return this._flyEndIndex;
    };

    /**
     * 交叉类型
     */
    public get crossType(): FC_PLANE_TYPE{
        return this._crossType;
    };

    /**
     * 克隆
     */
    public clone(){
        let clone = new FC_ChessPoint(this._initData);
        return clone;
    };
}
