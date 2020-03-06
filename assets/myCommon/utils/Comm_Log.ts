/**
 * 自定义log类
 * 简单包装console
 */
class Comm_Log {
    private constructor(){};
    private static instance: Comm_Log = null;
    public static getInstance(){
        this.instance = this.instance ? this.instance : new Comm_Log();
        return this.instance;
    };

    public isLog: boolean = false;      // 是否开启log

    public log(param?: any, ...params: any[]){
        this._callfunc(console.log, arguments);
    };

    public warn(param?: any, ...params: any[]){
        this._callfunc(console.warn, arguments);
    };

    public error(param?: any, ...params: any[]){
        this._callfunc(console.error, arguments);
    };

    public time(label?:string){
        this._callfunc(console.time, arguments);
    };

    public timeEnd(label?:string){
        this._callfunc(console.timeEnd, arguments);
    };

    private _callfunc(func: Function = null, params: IArguments = null, target: any = console){
        this.isLog && func.apply(target, params);
    };
}

export default Comm_Log.getInstance();