import FC_ChessPoint from "./FC_ChessPoint";
import FC_PlaneModel from "./FC_PlaneModel";
import FC_PlayerModel from "./FC_PlayerModel";
import { PLANE_TYPE, DIRECTION, PLANE_MOVE_TYPE } from "./FC_Constant";

// 接口

// 棋点初始化接口
export interface ChessPointInit {
    index: number,
    pos: cc.Vec2,
    type: PLANE_TYPE,
    dir: DIRECTION,
    innerRing?: boolean,
    outerRing?: boolean,
    waitPoint?: boolean,
    stopPoint?: boolean,
    startPoint?: boolean,
    endPoint?: boolean,
    cutPoint?: boolean,
    cutDir?: DIRECTION,
    flyStartPoint?: boolean,
    flyDir?: DIRECTION,
    flyEndIndex?: number,
    crossPoint?: boolean,
    crossType?: PLANE_TYPE,
};

// 飞机移动任务简表
export interface PlaneMoveSimpleTask {
    point: FC_ChessPoint,
    moveType: PLANE_MOVE_TYPE,          // 移动类型
    isEnd?: boolean,                    // 是否是结束位置
    isCrash?: boolean,                  // 是否撞击
    isBack?: boolean,                   // 是否回退
    isFly?: boolean,                    // 是否飞行
    isFlyCenter?: boolean,              // 是否只飞行到中途
    isTarget?: boolean,                 // 是否是飞行
};

// 飞机移动任务
export interface PlaneMoveTask {
    point: FC_ChessPoint,                       // 棋点
    rotation: number,                           // 角度
    scale: number,                              // 移动时放大的系数
    time: number,                               // 需要的时间
    isEnd: boolean,                             // 是否是结束位置
    isCrash: boolean,                           // 是否撞击
    isBack: boolean,                            // 是否回退
    isFly: boolean,                             // 是否飞行
    isFlyCenter: boolean,                       // 是否只飞行到中途
    isTarget: boolean,                          // 目标
};

// 棋手类型棋点 基本
export interface PlayerTypeChessPointBase {
    red: FC_ChessPoint,
    yellow: FC_ChessPoint,
    blue: FC_ChessPoint,
    green: FC_ChessPoint
};

// 棋手类型棋点 数组
export interface PlayerTypeChessPointArray {
    red: FC_ChessPoint[],
    yellow: FC_ChessPoint[],
    blue: FC_ChessPoint[],
    green: FC_ChessPoint[]
};

// 飞机棋子对象类型
export interface PlaneChesserObject {
    red: FC_PlaneModel[],
    yellow: FC_PlaneModel[],
    blue: FC_PlaneModel[],
    green: FC_PlaneModel[]
};
// 玩家对象类型
export interface PlayerObject {
    red: FC_PlayerModel,
    yellow: FC_PlayerModel,
    blue: FC_PlayerModel,
    green: FC_PlayerModel
};