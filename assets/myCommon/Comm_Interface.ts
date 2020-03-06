/**
 * 公共组件接口
 */

/**
 * 页面切换传入参数选项
 */
export interface View_Options {
    name: string,
    beforeData?: any,
    afterdata?: any,
    moveBefore?: Function,
    moveAfter?: Function,
    type?: number,
    solo?: boolean,
}

/**
 * toast参数类型
 */
export interface Toast_Options {
    title: string,
    duration?: number,
    pos?: cc.Vec2,
}