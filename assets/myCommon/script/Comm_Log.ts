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
        if(!this.isLog) return;
        console.log.apply(console, arguments);
    };

    public warn(param?: any, ...params: any[]){
        if(!this.isLog) return;
        console.warn.apply(console, arguments);
    };

    public error(param?: any, ...params: any[]){
        if(!this.isLog) return;
        console.error.apply(console, arguments);
    };
}

export default Comm_Log.getInstance();