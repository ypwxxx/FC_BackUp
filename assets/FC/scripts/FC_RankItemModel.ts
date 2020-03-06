import Comm_Model from "../../myCommon/core/m_c/Comm_Model";
import { COMMAND_FC_RANK } from "./FC_Constant";

// 排行项

export default class FC_RankItemModel extends Comm_Model {

    public constructor(){
        super();
    };

    private _rank: number = null;
    
    public get x(): number{
        return this._contronller.node.x;
    };
    public set x(num: number){
        this._contronller.node.x = num;
    };

    public get active(): boolean{
        return !!this._contronller.node.active;
    };
    public set active(bool: boolean){
        this._contronller.node.active = bool;
    };

    public init(num: number){
        this._rank = num;
        this.sendMessageToContronller(COMMAND_FC_RANK.set_rank, this._rank);
    };

    public flush(data: any){
        this.sendMessageToContronller(COMMAND_FC_RANK.flush, data);
    };

    public show(){
        this.sendMessageToContronller(COMMAND_FC_RANK.play_anim);
    };
}
