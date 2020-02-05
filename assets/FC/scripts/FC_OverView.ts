import { NOTIFICATION } from "../../myCommon/script/Comm_Modules";
import { COMM_EVENT } from "../../myCommon/script/Comm_Enum";
import FC_RankItemModel from "./FC_RankItemModel";
import Comm_Binder from "../../myCommon/script/Comm_Binder";

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

    public onDisable(){
        this._closeView();
    };

    public init(){
        for(let i = 0; i < 4; i++){
            let item = cc.instantiate(this.rankItemPrefab);
            this.rankBoard.addChild(item);
            let model = new FC_RankItemModel(i);
            Comm_Binder.getInstance().bindMC(model, item);
            model.active = false;

            this._rankItems.push(model);
        }
    };

    public flushView(data: any){
        NOTIFICATION.emit(COMM_EVENT.OPEN_MASK);

        let count = data.length;
        for(let i = 0; i < 4; i++){
            let item = this._rankItems[i];
            if(i < count){
                item.active = true;
                item.x = -1000;
                item.flush(data[i]);

            }else{
                item.active = false;

            }
        }

        this.animation.play();
    };

    // 展示排行
    public showRank(){
        for(let i = 0; i < this._rankItems.length; i++){
            let item = this._rankItems[i];
            let time = 0.05 * (i + 1);
            if(item.active){
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
                        NOTIFICATION.emit(COMM_EVENT.CLOSE_MASK);
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
        NOTIFICATION.emit(COMM_EVENT.SWITCH_VIEW, {name: 'set', solo: false});
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
