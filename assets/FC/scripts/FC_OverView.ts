import FC_RankItemModel from "./FC_RankItemModel";
import Comm_Binder from "../../myCommon/core/m_c/Comm_Binder";
import { FC_NAME_VIEW } from "./FC_Constant";
import FC_UserData from "./FC_UserData";
import Comm_Main from "../../myCommon/Comm_Main";

const {ccclass, property} = cc._decorator;

@ccclass
export default class FC_OverView extends cc.Component {

    @property(cc.Animation)
    animation: cc.Animation = null;
    @property(cc.Prefab)
    rankItemPrefab: cc.Prefab = null;
    @property(cc.Node)
    rankBoard: cc.Node = null;

    private _rankItems: FC_RankItemModel[] = [];
    private _count: number = 0;

    public onDisable(){
        this._closeView();
    };

    public init(){
        for(let i = 0; i < 4; i++){
            let item = cc.instantiate(this.rankItemPrefab);
            this.rankBoard.addChild(item);
            let model = new FC_RankItemModel();
            Comm_Binder.getInstance().bindMC(model, item);
            model.active = false;
            model.init(i);

            this._rankItems.push(model);
        }
    };
  
    public flushView(data: any){
        this._count = data.length;
        for(let i = 0; i < 4; i++){
            let item = this._rankItems[i];
            item.active = false;
            if(i < this._count){
                item.active = true;
                item.x = -1000;
                item.flush(data[i]);
            }
        }

        this.animation.play();
        // 清除存档
        FC_UserData.getInstance().clear();
    };

    // 展示排行
    public showRank(){
        Comm_Main.openMask();
        for(let i = 0; i < this._count; i++){
            let item = this._rankItems[i];
            let time = 0.05 * (i + 1);
            if(i < this._count - 1){
                this.node.runAction(cc.sequence(
                    cc.delayTime(time),
                    cc.callFunc(function(){
                        item.show();
                    }, this),
                ));

            }else{
                this.node.runAction(cc.sequence(
                    cc.delayTime(time),
                    cc.callFunc(function(){
                        Comm_Main.closeMask();
                    }, this),
                ));
                break;
            }
        }
    };

    public backHome(){
        cc.director.loadScene(G.startScene);
    };

    public share(){

    };

    public restart(){
        Comm_Main.switchView({name: FC_NAME_VIEW.set, solo: false});
    };

    private _closeView(){
        // 关闭所有rank
        for(let i in this._rankItems){
            let item = this._rankItems[i];
            item.active = false;
        }

        // 停下所有动作/动画
        this.animation.stop();
        this.node.stopAllActions();
    };
}
