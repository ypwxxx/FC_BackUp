import FC_ChessPoint from "./FC_ChessPoint";
import { PlayerTypeChessPointArray, PlayerTypeChessPointBase, ChessPointInit } from "./FC_Interface";
import { DIRECTION, PLANE_TYPE } from "./FC_Constant";

/**
 * 棋盘类模块
 */

export default class FC_Chess {
    private constructor() {
        this._pointOutArr = [];
        this._pointInArr = {
            red: [],
            yellow: [],
            blue: [],
            green: [],
        };
        this._planeWaitArr = {
            red: null,
            yellow: null,
            blue: null,
            green: null,
        };
        this._planeStopArr = {
            red: [],
            yellow: [],
            blue: [],
            green: [],
        };
    };
    private static instance: FC_Chess = null;
    public static getInstance(): FC_Chess{
        this.instance = this.instance || new FC_Chess();
        return this.instance;
    }
    
    // 棋盘外环棋点的坐标数组(以蓝色的起飞点起始--黄色)
    private static _ChessPointOutPosArr: cc.Vec2[] = [
        cc.v2(129, 300),cc.v2(152, 257),cc.v2(152, 214),cc.v2(129, 170),
        cc.v2(172, 129),cc.v2(213, 146),cc.v2(256, 146),cc.v2(299, 129),
        cc.v2(319, 86),cc.v2(320, 43),cc.v2(318, -1),cc.v2(320, -44),
        cc.v2(320, -85),cc.v2(301, -128),cc.v2(259, -148),cc.v2(216, -149),
        cc.v2(175, -126),cc.v2(127, -168),cc.v2(152, -210),cc.v2(152, -254),
        cc.v2(129, -296),cc.v2(89, -323),cc.v2(47, -323),cc.v2(5, -323),
        cc.v2(-40, -323),cc.v2(-82, -323),cc.v2(-124, -297),cc.v2(-146, -257),
        cc.v2(-146, -214),cc.v2(-124, -169),cc.v2(-167, -126),cc.v2(-209, -149),
        cc.v2(-253, -149),cc.v2(-294, -128),cc.v2(-316, -89),cc.v2(-316, -46),
        cc.v2(-318, -2),cc.v2(-317, 42),cc.v2(-316, 83),cc.v2(-297, 126),
        cc.v2(-256, 146),cc.v2(-212, 146),cc.v2(-168, 127),cc.v2(-125, 170),
        cc.v2(-146, 212),cc.v2(-146, 255),cc.v2(-127, 298),cc.v2(-85, 317),
        cc.v2(-43, 316),cc.v2(1, 316),cc.v2(44, 316),cc.v2(87, 316)
    ];
    // 棋盘外环方向(以蓝色开始点起始--黄色)(开始-结束-方向)
    private static _ChessPointOutDirArr: number[][] = [
        [0, 2, DIRECTION.DOWN],[3, 6, DIRECTION.RIGHT],
        [7, 12, DIRECTION.DOWN],[13, 15, DIRECTION.LEFT],
        [16, 19, DIRECTION.DOWN],[20, 25, DIRECTION.LEFT],
        [26, 28, DIRECTION.UP],[29, 32, DIRECTION.LEFT],
        [33, 38, DIRECTION.UP],[39, 41, DIRECTION.RIGHT],
        [42, 45, DIRECTION.UP],[46, 51, DIRECTION.RIGHT],
    ]
    // 棋盘内环棋点的坐标数组(红色开始)
    private static _ChessPointInPosArr: cc.Vec2[][] = [
        [cc.v2(4, -255),cc.v2(4, -213),cc.v2(4, -171),cc.v2(4, -130),cc.v2(4, -88),cc.v2(4, -41)],
        [cc.v2(-253, -2),cc.v2(-211, -2),cc.v2(-168, -2),cc.v2(-126, -2),cc.v2(-85, -2),cc.v2(-36, -2)],
        [cc.v2(4, 254),cc.v2(4, 212),cc.v2(4, 171),cc.v2(4, 129),cc.v2(4, 88),cc.v2(4, 43)],
        [cc.v2(258, -1),cc.v2(217, -1),cc.v2(174, -1),cc.v2(133, -1),cc.v2(91, -1),cc.v2(47, -1)]
    ];
    // 棋盘内环方向(红色开始)
    private static _ChessPointInDirArr: DIRECTION[] = [
        DIRECTION.UP, DIRECTION.RIGHT, DIRECTION.DOWN, DIRECTION.LEFT
    ];
    // 各方飞机停驻点的坐标(红色开始)
    private static _ChessPointPlaneStopPosArr: cc.Vec2[][] = [
        [cc.v2(-304, -252),cc.v2(-247, -252),cc.v2(-304, -305),cc.v2(-247, -305)],
        [cc.v2(-304, 302),cc.v2(-247, 302),cc.v2(-304, 249),cc.v2(-247, 249)],
        [cc.v2(250, 302),cc.v2(305, 302),cc.v2(250, 249),cc.v2(305, 249)],
        [cc.v2(250, -252),cc.v2(305, -252),cc.v2(250, -305),cc.v2(305, -305)]
    ];
    // 各方飞机待机点的坐标(红色开始)
    private static _ChessPointPlaneWaitPosArr: cc.Vec2[] = [
        cc.v2(-169, -338),cc.v2(-340, 170),cc.v2(173, 338),cc.v2(340, -173)
    ];
    // 各方飞机待机点(同停驻区域)方向
    private static _ChessPointPlaneWaitDirArr: DIRECTION[] = [
        DIRECTION.UP, DIRECTION.RIGHT, DIRECTION.DOWN, DIRECTION.LEFT
    ];
    // 各方飞机内环切入点序号(红色开始)
    private static _ChessPointPlaneToInIndexArr: number[] = [
        23,36,49,10
    ];
    // 各方飞机起飞点序号(红色开始)
    private static _ChessPointPlaneStartIndexArr: number[] = [
        26,39,0,13
    ];
    // 各方飞机飞棋点序号(红色开始)(开始[0]-结束[1]-方向)
    private static _ChessPointPlaneFlyIndexArr: number[][] = [
        [43, 3, DIRECTION.RIGHT],
        [4, 16, DIRECTION.DOWN],
        [17, 29, DIRECTION.LEFT],
        [30, 42, DIRECTION.UP]
    ];
    // 各方飞机内环与飞行线交叉点及类型(红色开始))(序号-类型)
    private static _ChessPointPlaneInCrossFlyLineIndexArr: number[][] = [
        [2, PLANE_TYPE.THE_BLUE],
        [2, PLANE_TYPE.THE_GREEN],
        [2, PLANE_TYPE.THE_RED],
        [2, PLANE_TYPE.THE_YELLOW],
    ];

    
    private _pointOutArr: FC_ChessPoint[] = null;                               // 外环棋点数组(以蓝色开始点起始)
    private _pointInArr: PlayerTypeChessPointArray = null;                      // 内环棋点数组(红色开始)
    private _planeWaitArr: PlayerTypeChessPointBase = null;                     // 飞机待机点数组(红色开始)
    private _planeStopArr: PlayerTypeChessPointArray = null;                    // 飞机停驻点数组(红色开始)

    // 初始化
    public init(){
        // 初始化外环
        this._initOuterRing();
        // 初始化内环
        this._initInnerRing();
        // 初始化待机点
        this._initWaitPoints();
        // 初始化停驻点
        this._initStopPoints();
    };

    /**
     * 获取停驻点
     * @param type 类型
     * @param index 序号
     */
    public getStopPoint(type: PLANE_TYPE, index: number){
        let result: FC_ChessPoint = null;
        let group: FC_ChessPoint[] = null;

        if(type === PLANE_TYPE.THE_RED){
            group = this._planeStopArr.red;
        }else if(type === PLANE_TYPE.THE_YELLOW){
            group = this._planeStopArr.yellow;
        }else if(type === PLANE_TYPE.THE_BLUE){
            group = this._planeStopArr.blue;
        }else if(type === PLANE_TYPE.THE_GREEN){
            group = this._planeStopArr.green;
        }

        for(let i = 0; i < group.length; i++){
            if(group[i].index === index){
                result = group[i];
                break;
            }
        }

        return result ? result.clone() : null;
    };

    /**
     * 获取待机点
     * @param type 类型
     */
    public getWaitPoint(type: PLANE_TYPE){
        let result: FC_ChessPoint = null;
        if(type === PLANE_TYPE.THE_RED){
            result = this._planeWaitArr.red;
        }else if(type === PLANE_TYPE.THE_YELLOW){
            result = this._planeWaitArr.yellow;
        }else if(type === PLANE_TYPE.THE_BLUE){
            result = this._planeWaitArr.blue;
        }else if(type === PLANE_TYPE.THE_GREEN){
            result = this._planeWaitArr.green;
        }
        return result ? result.clone() : null;
    };

    /**
     * 获取外环棋点
     * @param index 
     */
    public getOuterPoint(index: number){
        let point: FC_ChessPoint = null;
        for(let i = 0; i < this._pointOutArr.length; i++){
            point = this._pointOutArr[i];
            if(point.index === index){
                break;
            }
        }
        return point ? point.clone() : null;
    };

    /**
     * 获取内环棋点
     * @param index 
     * @param type 
     */
    public getInnerPoint(index: number, type: PLANE_TYPE){
        let point: FC_ChessPoint = null;
        let group: FC_ChessPoint[] = null;

        if(type == PLANE_TYPE.THE_RED){
            group = this._pointInArr.red

        }else if(type == PLANE_TYPE.THE_YELLOW){
            group = this._pointInArr.yellow

        }else if(type == PLANE_TYPE.THE_BLUE){
            group = this._pointInArr.blue

        }else if(type == PLANE_TYPE.THE_GREEN){
            group = this._pointInArr.green
            
        }

        for(let i = 0; i < group.length; i++){
            point = group[i];
            if(point.index === index){
                break;
            }
        }

        return point ? point.clone() : null;
    };

    /**
     * 获取开始点位置
     * @param type 
     */
    public getStartPoint(type: PLANE_TYPE){
        let temp = FC_Chess._ChessPointPlaneStartIndexArr[type];
        let point = this.getOuterPoint(temp);
        return point ? point.clone() : null;
    };

    /**
     * 获取切入点
     * @param type 
     */
    public getCutPoint(type: PLANE_TYPE){
        let temp = FC_Chess._ChessPointPlaneToInIndexArr[type];
        let point = this.getOuterPoint(temp);
        return point ? point.clone() : null;
    };

    /**
     * 初始化外环
     */
    private _initOuterRing(){
        for(let i = 0; i < FC_Chess._ChessPointOutPosArr.length; i++){
            let p = FC_Chess._ChessPointOutPosArr[i];           // 坐标
            let dir = this._getOutPointDirection(i);            // 方向
            let type = this._getOutPointType(i);                // 类型

            let data: ChessPointInit = {
                index: i,
                pos: p,
                type: type,
                dir: dir,
                outerRing: true,
            };
            if(this._checkIsStartFlyPoint(i)){
                // 起始点
                data.startPoint = true;
            }else{
                if(this._checkIsCutInPoint(i)){
                    // 切入点
                    data.cutPoint = true;
                    let cutDir = FC_Chess._ChessPointInDirArr[type];
                    data.cutDir = cutDir;

                }else{
                    // 飞行起始点
                    this._checkIsFlyPoint(data);
                }
            }

            let point = new FC_ChessPoint(data);               // new一个point
            this._pointOutArr.push(point);
        }
    };

    /**
     * 初始化内环
     */
    private _initInnerRing(){
        for(let i = 0; i < FC_Chess._ChessPointInPosArr.length; i++){
            let temp = FC_Chess._ChessPointInPosArr[i];
            let dir = FC_Chess._ChessPointInDirArr[i];      // 方向
            let type = this._getInnerPointType(i);          // 类型
            for(let j = 0; j < temp.length; j++){
                let p = temp[j];                            // 坐标
                let isEnd = j === temp.length - 1;

                let data: ChessPointInit = {
                    index: j,
                    pos: p,
                    type: type,
                    dir: dir,
                    innerRing: true,
                    crossPoint: false,
                    endPoint: isEnd,
                };
                // 检查是否是交叉点
                this._checkIsCrossPoint(data);

                let point = new FC_ChessPoint(data);
                
                if(i == PLANE_TYPE.THE_RED){
                    this._pointInArr.red.push(point);

                }else if(i == PLANE_TYPE.THE_YELLOW){
                    this._pointInArr.yellow.push(point);

                }else if(i == PLANE_TYPE.THE_BLUE){
                    this._pointInArr.blue.push(point);

                }else if(i == PLANE_TYPE.THE_GREEN){
                    this._pointInArr.green.push(point);

                }
            }
        }
    };

    /**
     * 初始化待机点
     */
    private _initWaitPoints(){
        for(let i = 0; i < FC_Chess._ChessPointPlaneWaitPosArr.length; i++){
            let p = FC_Chess._ChessPointPlaneWaitPosArr[i];     // 坐标
            let dir = FC_Chess._ChessPointPlaneWaitDirArr[i];   // 方向
            let type = this._numberToType(i);

            let data: ChessPointInit = {
                index: i,
                pos: p,
                type: type,
                dir: dir,
                waitPoint: true,
            };

            let point = new FC_ChessPoint(data);
            
            if(i == PLANE_TYPE.THE_RED){
                this._planeWaitArr.red = point;
            }else if(i == PLANE_TYPE.THE_YELLOW){
                this._planeWaitArr.yellow = point;
            }else if(i == PLANE_TYPE.THE_BLUE){
                this._planeWaitArr.blue = point;
            }else if(i == PLANE_TYPE.THE_GREEN){
                this._planeWaitArr.green = point;
            }
        }
    };

    /**
     * 初始化停驻点
     */
    private _initStopPoints(){
        for(let i = 0; i < FC_Chess._ChessPointPlaneStopPosArr.length; i++){
            let temp = FC_Chess._ChessPointPlaneStopPosArr[i];
            let dir = FC_Chess._ChessPointPlaneWaitDirArr[i];       // 方向
            let type = this._numberToType(i);
            let group = this._planeStopArr.red;
            if(i == PLANE_TYPE.THE_YELLOW){
                group = this._planeStopArr.yellow;
            }else if(i == PLANE_TYPE.THE_BLUE){
                group = this._planeStopArr.blue;
            }else if(i == PLANE_TYPE.THE_GREEN){
                group = this._planeStopArr.green;
            }
            
            for(let j = 0; j < temp.length; j++){
                let p = temp[j];                                    // 坐标

                let data: ChessPointInit = {
                    index: j,
                    pos: p,
                    type: type,
                    dir: dir,
                    stopPoint: true,
                };

                let point = new FC_ChessPoint(data);
                group.push(point);
            }
        }
    };

    /**
     * 获取外环棋点方向
     * @param index 序号
     */
    private _getOutPointDirection(index: number): DIRECTION{
        for(let i = 0; i < FC_Chess._ChessPointOutDirArr.length; i++){
            let config = FC_Chess._ChessPointOutDirArr[i];
            let start = config[0];
            let end = config[1];
            let dir = config[2];
            if(index >= start && index <= end){
                // 处于这个方向范围内
                let direction: DIRECTION = this._numberToDirection(dir);
                return direction;
            }
        }
    };

    /**
     * 获取外环棋点类型 按照黄-蓝-绿-红的顺序
     * @param index 序号
     */
    private _getOutPointType(index: number): PLANE_TYPE{
        let num = Number(index) % 4;
        let color: PLANE_TYPE = null;
        switch(num){
            case 0:
                color = PLANE_TYPE.THE_YELLOW;
                break;
            case 1:
                color = PLANE_TYPE.THE_BLUE;
                break;
            case 2:
                color = PLANE_TYPE.THE_GREEN;
                break;
            case 3:
                color = PLANE_TYPE.THE_RED;
                break;
            default: 
                break;
        }
        return color;
    };

    /**
     * 检查是否是飞行开始点
     * @param index 
     */
    private _checkIsStartFlyPoint(index: number): Boolean{
        for(let i = 0; i < FC_Chess._ChessPointPlaneStartIndexArr.length; i++){
            let temp = FC_Chess._ChessPointPlaneStartIndexArr[i];
            if(temp == index){
                return true;
            }
        }
        return false;
    };

    /**
     * 检查是否是外入内的切入点
     * @param index 
     */
    private _checkIsCutInPoint(index: number): Boolean{
        for(let i = 0; i < FC_Chess._ChessPointPlaneToInIndexArr.length; i++){
            let temp = FC_Chess._ChessPointPlaneToInIndexArr[i];
            if(temp == index){
                return true;
            }
        }
        return false;
    };

    /**
     * 检查是否是飞行点
     * @param data
     */
    private _checkIsFlyPoint(data: ChessPointInit){
        for(let i = 0; i < FC_Chess._ChessPointPlaneFlyIndexArr.length; i++){
            let temp = FC_Chess._ChessPointPlaneFlyIndexArr[i];
            let start = temp[0];
            let end = temp[1];
            let dir = this._numberToDirection(temp[2]);
            let type = this._numberToType(FC_Chess._ChessPointPlaneInCrossFlyLineIndexArr[data.type][1]);
            if(data.index == start){
                data.flyStartPoint = true;
                data.flyEndIndex = end;
                data.flyDir = dir;
                data.crossType = type;
            }
        }
    };

    /**
     * 检查是否是内环交叉点
     * @param data 
     */
    private _checkIsCrossPoint(data: ChessPointInit){
        let temp = FC_Chess._ChessPointPlaneInCrossFlyLineIndexArr[data.type];
        let p = temp[0];
        if(data.index == p){
            data.crossPoint = true;
        }
    };

    /**
     * 获取内环类型
     * @param num 
     */
    private _getInnerPointType(num: number): PLANE_TYPE{
        let type: PLANE_TYPE = null;
        if(num == 0){
            type = PLANE_TYPE.THE_RED;
        }else if(num == 1){
            type = PLANE_TYPE.THE_YELLOW;
        }else if(num == 2){
            type = PLANE_TYPE.THE_BLUE;
        }else if(num == 3){
            type = PLANE_TYPE.THE_GREEN;
        }
        return type;
    };

    /**
     * 数字转方向
     * @param num 
     */
    private _numberToDirection(num: number): DIRECTION{
        let direction: DIRECTION = null;
        if(num == DIRECTION.DOWN){
            direction = DIRECTION.DOWN;
        }else if(num == DIRECTION.UP){
            direction = DIRECTION.UP;
        }else if(num == DIRECTION.LEFT){
            direction = DIRECTION.LEFT;
        }else if(num == DIRECTION.RIGHT){
            direction = DIRECTION.RIGHT;
        }
        return direction;
    };

    /**
     * 数字转类型
     * @param num 
     */
    private _numberToType(num: number): PLANE_TYPE{
        let type: PLANE_TYPE = null;
        if(num == PLANE_TYPE.THE_RED){
            type = PLANE_TYPE.THE_RED;
        }else if(num == PLANE_TYPE.THE_BLUE){
            type = PLANE_TYPE.THE_BLUE;
        }else if(num == PLANE_TYPE.THE_YELLOW){
            type = PLANE_TYPE.THE_YELLOW;
        }else if(num == PLANE_TYPE.THE_GREEN){
            type = PLANE_TYPE.THE_GREEN;
        }
        return type;
    };
}
