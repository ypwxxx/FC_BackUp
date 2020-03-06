// 常量

// 游戏信息存储时使用的常量
export const FC_GAME_SAVE = {
    GAME_DATA: 'FC_GameData',
    USER_DATA: 'FC_UserData',
}

// view切换字符串
export const FC_NAME_VIEW = {
    main: 'main',
    pause: 'pause',
    set: 'set',
    help: 'help',
    over: 'over',
    continue: 'continue',
    tip: 'tip',
}

export enum FC_POINT_POS_TYPE {
    STOP,
    WAIT,
    OUTTER,
    INNER
}

// 飞行棋基础数据
export const FC_GAME_BASE_DATA = {
    chesser_outter_count: 52,                       // 外环棋点数量
    chesser_inner_count: 24,                        // 内环棋点数量
    chesser_inner_singer_count: 6,                  // 内环单方棋点数量

    player_max_count: 4,                            // 最大玩家数量
    player_min_count: 2,                            // 最小玩家数量
    player_chesser_count: 4,                        // 玩家棋子数量
    player_icon_count: 11,                          // 玩家可选头像数量

    plane_count: 16,                                // 飞机数量

    plane_step_time: 0.16,                          // 飞机移动时间
    plane_jump_time: 0.28,                          // 飞机跳跃时间
    plane_fly_time: 0.4,                            // 飞机飞行时间
    plane_step_scale: 1.05,                         // 飞机移动缩放
    plane_jump_scale: 1.08,                         // 飞机跳跃缩放
    plane_fly_scale: 1.12,                          // 飞机飞行缩放

    plane_standby_act: 'standby',                   // 飞机待机动作名

    launch_plane_num: [[2, 4, 6], [5, 6], [6]],     // 起飞号码
    continuous_throwing_num: 6,                     // 连续投掷的点数

    pos_player: cc.v2(247, 442),                    // 玩家席位基本坐标
    pos_banSp: cc.v2(276, 277),                     // ban图基本坐标
};

// 资源命名
export const FC_ASSETS_NAME = {
    launch_num_light: 'num_light_',
    launch_num_grey: 'num_gray_',

    plane: 'plane_',
    plane_finish: 'plane_back',

    dice: 'dice_',

    head: 'default_',
    head_grey: 'head_default',
    head_bg: 'head_bg_',

    player_bg_default: 'head_bg_default',

    rank: 'rank_',
};

// 提示字符集
export const FC_TIP = {
    "0":    "#方获取先行机会",
    "1":    "请点击股子 \n 进行投掷",
    "2":    "请选择一枚 \n 可移动的棋子",
    "3":    "#方行棋",
    "4":    "轮到#方投掷",
    "5":    "#方投掷中",
    "6":    "无法起飞",
    "7":    "#方再投一次",
    "8":    "游戏结束",
    "9":    "系统检测连续三次幸运6 \n 遣返当前所有棋子",
    "10":   "游戏开始",
    "11":   "已超时*次，再超时\n &次将被移出游戏",
    "12":   "#方超时",
    "13":   "连接成功",
    "14":   "连接服务器失败，正在努力重连",
    "15":   "正在连接服务器...",
    "16":   "无法连接网络",
};

/**
 * 方向
 */
export enum FC_DIRECTION {
    UP,
    DOWN,
    LEFT,
    RIGHT
};

/**
 * 飞机类型
 */
export enum FC_PLANE_TYPE {
    THE_RED,
    THE_YELLOW,
    THE_BLUE,
    THE_GREEN,
    THE_END
};

/**
 * 飞机移动类型
 */
export enum FC_PLANE_MOVE_TYPE {
    STEP,
    JUMP,
    FLY
};

/**
 * 玩家类型
 */
export enum FC_PLAYER_TYPE {
    NONE,       // 无
    ONLINE,     // 线上真人
    OFFLINE,    // 线下真人
    AI          // 电脑
};

/**
 * ai等级
 */
export enum FC_AI_GRADE {
    SIMPLE,
    NORMAL,
    HARD
};

/**
 * ai特性
 */
export enum FC_AI_BEHAVIOR {
    ATTACK,                     // 攻击型
    EVASION,                    // 躲避型
    DEVELOPMENT,                // 发育型
};

/**
 * 指令
 */

// 飞机指令
export const COMMAND_FC_PLANE = {
    pause: 'fc_cod_plane_pause',                                    // 暂停
    resume: 'fc_cod_plane_resume',                                  // 恢复
    reset: 'fc_cod_plane_reset',                                    // 重置
    set_skin: 'fc_cod_plane_set_skin',                              // 设置皮肤
    set_rotation: 'fc_cod_plane_set_rotation',                      // 设置角度
    move_to: 'fc_cod_plane_move_to',                                // 移动
    play_anim: 'fc_cod_plane_play_anim',                            // 播放飞机动画
    stop_anim: 'fc_cod_plane_stop_anim',                            // 停止飞机动画
    feedback_move_end: 'fc_cod_plane_feedback_move_end',            // 反馈移动结束
    feedback_be_touch: 'fc_cod_plane_feedback_be_touch',            // 反馈被点击
};

// 玩家指令
export const COMMAND_FC_PLAYER = {
    pause: 'fc_cod_player_pause',                                   // 暂停
    resume: 'fc_cod_player_resume',                                 // 恢复
    flush_ui: 'fc_cod_player_flush_ui',                             // 刷新ui
    start_round: 'fc_cod_player_start_round',                       // 开始回合
    end_round: 'fc_cod_player_end_round',                           // 结束回合
    throw_dice: 'fc_cod_player_throw_dice',                         // 投掷骰子
    show_rank: 'fc_cod_player_show_rank',                           // 显示排行
    feedback_touch_dice: 'fc_cod_plane_feedback_touch_dice',        // 反馈点击骰子
    feedback_throw_end: 'fc_cod_player_feedback_throw_end',         // 反馈投掷结束
};

// 排行指令
export const COMMAND_FC_RANK = {
    flush: 'fc_cod_rank_flush',                                     // 刷新排行项
    set_rank: 'fc_cod_rank_set_rank',                               // 设置排行
    play_anim: 'fc_cod_rank_play_anim',                             // 播放排行动画
};

/**
 * 事件
 */
export const FC_EVENT = {
    GAME_RESTART: "fc_event_game_restart",                        // 重新开始游戏
    GAME_RESUME: "fc_event_game_resume",                          // 恢复游戏

    PLAYER_DICE_NUM: 'fc_event_player_dice_num',                  // 玩家骰子数          

    PLANE_MOVE_END: 'fc_event_move_end',                          // 飞机移动结束
    PLANE_BE_CHOOSE: 'fc_event_be_choose',                        // 飞机被选中
    PLANE_CRASH: 'fc_event_crash',                                // 飞机发生碰撞
}