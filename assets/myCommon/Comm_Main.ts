import { View_Options } from "./Comm_Interface";
import Comm_View from "./view/Comm_View";

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

    public bindViewMag(obj: any, target: any){
        let keys = Object.keys(this._viewMag);
        let keyStr = keys.join('$$');
        for(let name in obj){
            if(keyStr.search(name) === -1) continue;
            if(typeof obj[name] !== 'function') continue;

            this._viewMag[name] = obj[name];
        }

        this._viewMag.target = target;
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

    private _callfunc(func: Function = null, target: any, params: IArguments = null){
        if(typeof func === 'function'){
            func.apply(target, params);
        }
    };
}

export default Comm_Main.getInstance();