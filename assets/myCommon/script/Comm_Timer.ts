/**
 * 公共计时器
 */

export default class Comm_Timer {
    private constructor(){};
    private _instance: Comm_Timer = null;
    public getInstance(): Comm_Timer {
        this._instance = this._instance ? this._instance : new Comm_Timer();
        return this._instance;
    };
}