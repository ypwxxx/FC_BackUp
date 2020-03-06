import FC_ChessPoint from "./FC_ChessPoint";
import FC_PlaneModel from "./FC_PlaneModel";
import FC_PlayerModel from "./FC_PlayerModel";
import { FC_PLANE_TYPE, FC_DIRECTION, FC_PLANE_MOVE_TYPE, FC_PLAYER_TYPE, FC_POINT_POS_TYPE } from "./FC_Constant";

// 接口

// 棋点初始化接口
export interface FC_ChessPointInit {
    index: number,
    pos: cc.Vec2,
    type: FC_PLANE_TYPE,
    dir: FC_DIRECTION,
    innerRing?: boolean,
    outerRing?: boolean,
    waitPoint?: boolean,
    stopPoint?: boolean,
    startPoint?: boolean,
    endPoint?: boolean,
    cutPoint?: boolean,
    cutDir?: FC_DIRECTION,
    flyStartPoint?: boolean,
    flyDir?: FC_DIRECTION,
    flyEndIndex?: number,
    crossPoint?: boolean,
    crossType?: FC_PLANE_TYPE,
};

// 飞机移动任务简表
export interface FC_PlaneMoveSimpleTask {
    point: FC_ChessPoint,
    moveType: FC_PLANE_MOVE_TYPE,          // 移动类型
    isEnd?: boolean,                    // 是否是结束位置
    isCrash?: boolean,                  // 是否撞击
    isBack?: boolean,                   // 是否回退
    isFly?: boolean,                    // 是否飞行
    isFlyCenter?: boolean,              // 是否只飞行到中途
    isTarget?: boolean,                 // 是否是飞行
};

// 飞机移动任务
export interface FC_PlaneMoveTask {
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
export interface FC_PlayerTypeChessPointBase {
    red: FC_ChessPoint,
    yellow: FC_ChessPoint,
    blue: FC_ChessPoint,
    green: FC_ChessPoint
};

// 棋手类型棋点 数组
export interface FC_PlayerTypeChessPointArray {
    red: FC_ChessPoint[],
    yellow: FC_ChessPoint[],
    blue: FC_ChessPoint[],
    green: FC_ChessPoint[]
};

// 飞机棋子对象类型
export interface FC_PlaneChesserObject {
    red: FC_PlaneModel[],
    yellow: FC_PlaneModel[],
    blue: FC_PlaneModel[],
    green: FC_PlaneModel[]
};
// 玩家对象类型
export interface FC_PlayerObject {
    red: FC_PlayerModel,
    yellow: FC_PlayerModel,
    blue: FC_PlayerModel,
    green: FC_PlayerModel
};

// tip
export interface FC_TipOptions {
    title: string,
    duration?: number,
    pos?: cc.Vec2,
}

export interface FC_SavePlayerData {
    type: FC_PLANE_TYPE,
    rank: number,
    aiDiffi: number,
    aiBehavior: number,
};

export interface FC_SavePointData {
    index: number,
    area: FC_POINT_POS_TYPE,
    type: FC_PLANE_TYPE,
};

export interface FC_SavePlaneData {
    index: number,
    type: FC_PLANE_TYPE,
    moveStep: number,
    point: FC_SavePointData,
    posX: number,
    posY: number,
    isFinish: boolean,
};

// 保存用户数据类型
// 红-黄-蓝-绿排序
export interface FC_SaveUserData {
    round: number[],
    planeStacks: number[][][],
    rankIndex: number,
    player: FC_SavePlayerData[],
    plane: FC_SavePlaneData[],
};

// 保存游戏数据类型
export interface FC_SaveGameData {
    playerCount: number,
    planeType: FC_PLANE_TYPE[],
    launchNum: number[];
    playerType: FC_PLAYER_TYPE[],
    playerIcon: number[],
    playerOrder: number[],
}