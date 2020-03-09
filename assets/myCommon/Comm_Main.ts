import { View_Options, Toast_Options, Loading_Options } from "./Comm_Interface";
import Comm_View from "./view/scripts/Comm_View";

/**
 * Comm_Main 主脚本
 */
class Comm_Main {
    private constructor(){};
    private static _instance: Comm_Main = null;
    public static getInstance(): Comm_Main{
        this._instance = this._instance ? this._instance : new Comm_Main();
        return this._instance;
    };

    private _viewMag = {
        target: null,
        switchView: null,
        openMask: null,
        closeMask: null,
        addView: null,
    };

    private _interactiveMag = {
        target: null,
        showToast: null,
        hideToast: null,
        showLoading: null,
        hideLoading: null,
        showModal: null,
    };

    /**
     * 绑定view
     * @param obj 
     * @param target 
     */
    public bindViewMag(obj: any, target: any){
        this._commBind('_viewMag', obj, target);
    };

    /**
     * 绑定toast
     * @param options 
     */
    public bindInteractive(obj:any, target: any){
        this._commBind('_interactiveMag', obj, target);
    };

    /**
     * 显示toast
     * @param obj Toast_Options | string
     *  @param title string 需要显示的内容
     *  @param icon string 'success' || 'loading' || 'none' 默认'none'.
     *  @param image cc.SpriteFrame | string 自定义图片替代icon，支持url/cc.spriteFrame/cc.Texture2D, 优先级大于icon.
     *  @param duration number 延迟时间，默认1.5s.
     *  @param mask boolean 透明蒙层,防止穿透.
     */
    public showToast(obj: Toast_Options | string){
        this._callfunc(this._interactiveMag.showToast, this._interactiveMag.target, arguments);
    };

    /**
     * 隐藏toast
     */
    public hideToast(){
        this._callfunc(this._interactiveMag.hideToast, this._interactiveMag.target, arguments);
    };

    /**
     * 显示loading
     */
    public showLoading(obj:Loading_Options){
        this._callfunc(this._interactiveMag.showLoading, this._interactiveMag.target, arguments);
    };

    /**
     * 隐藏loading
     */
    public hideLoading(){
        this._callfunc(this._interactiveMag.hideLoading, this._interactiveMag.target, arguments);
    };

    /**
     * 显示modal
     */
    public showModal(){
        this._callfunc(this._interactiveMag.showModal, this._interactiveMag.target, arguments);
    };

    /**
     * 切换view
     * @param options 
     */
    public switchView(options: View_Options | string){
        this._callfunc(this._viewMag.switchView, this._viewMag.target, arguments);
    };

    /**
     * 开启遮罩
     */
    public openMask(){
        this._callfunc(this._viewMag.openMask, this._viewMag.target);
    };

    /**
     * 关闭遮罩
     */
    public closeMask(){
        this._callfunc(this._viewMag.closeMask, this._viewMag.target);
    };

    /**
     * 添加view
     * @param view Comm_View | cc.Prefab
     * @param name string
     */
    public addView(temp: Comm_View | cc.Prefab, viewName: string, copName: string = null){
        this._callfunc(this._viewMag.addView, this._viewMag.target, arguments);
    };

    private _commBind(prop: string, obj: any, target: any){
        let keys = Object.keys(this[prop]);
        let keyStr = keys.join('$$');
        for(let name in obj){
            if(keyStr.search(name) === -1) continue;
            if(typeof obj[name] !== 'function') continue;

            this[prop][name] = obj[name];
        }

        this[prop].target = target;
    };

    private _callfunc(func: Function = null, target: any, params: IArguments = null){
        if(typeof func === 'function'){
            func.apply(target, params);
        }
    };
}

export default Comm_Main.getInstance();