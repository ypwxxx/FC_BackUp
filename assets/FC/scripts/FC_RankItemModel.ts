import Comm_Model from "../../myCommon/script/Comm_Model";
import { COMMAND_FC_RANK } from "./FC_Constant";

// 排行项

export default class FC_RankItemModel extends Comm_Model {

    public constructor(num: number){
        super();
        this._rank = num;
        this.sendMessageToContronller(COMMAND_FC_RANK.set_rank, this._rank);
    };

    private _rank: number = null;
    
    public get x(): number{
        return this._contronller.x;
    };
    public set x(num: number){
        this._contronller.x = num;
    };

    public get active(): boolean{
        return !!this._contronller.active;
    };
    public set active(bool: boolean){
        this._contronller.active = bool;
    };


    public flush(data: any){
        this.sendMessageToContronller(COMMAND_FC_RANK.flush, data);
    };

    public show(){
        this.sendMessageToContronller(COMMAND_FC_RANK.play_anim);
    };
}
