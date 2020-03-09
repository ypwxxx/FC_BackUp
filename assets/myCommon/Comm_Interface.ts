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
};

/**
 * toast参数类型
 * @param title string 需要显示的内容
 * @param icon string 'success' || 'loading' || 'none' 默认'none'.
 * @param image cc.SpriteFrame | string 自定义图片替代icon，支持url/cc.spriteFrame/cc.Texture2D, 优先级大于icon.
 * @param duration number 延迟时间，默认1.5s.
 * @param mask boolean 透明蒙层,防止穿透.
 */
export interface Toast_Options {
    title: string,
    icon?: string,
    image?: cc.SpriteFrame | cc.Texture2D | string,
    duration?: number,
    mask?: boolean,
};

export interface Loading_Options{
    title: string,
    mask?: boolean,
}