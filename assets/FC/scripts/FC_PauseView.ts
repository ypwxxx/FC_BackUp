import { NOTIFICATION } from "../../myCommon/script/Comm_Modules";
import { COMM_EVENT, VIEW_SWITCH_TYPE } from "../../myCommon/script/Comm_Enum";
import { FC_EVENT } from "./FC_Constant";

const {ccclass, property} = cc._decorator;
// const Share = require("Share");
// const Statistics = require("Statistics");

@ccclass
export default class FC_PauseView extends cc.Component {

    @property(cc.Node)
    node_voice_close: cc.Node = null;
    @property(cc.Node)
    node_ad: cc.Node = null;

    public init(){
        // // 显示广告
        // this.showBannerAd();
    };

    public flushView(){

    };

    public close(){
        // 显示广告


        NOTIFICATION.emit(COMM_EVENT.SWITCH_VIEW, {name: 'pause', type: VIEW_SWITCH_TYPE.HIDE, solo: false});
        NOTIFICATION.emit(FC_EVENT.GAME_RESUME);
    };

    public restart(){
        NOTIFICATION.emit(COMM_EVENT.SWITCH_VIEW, {name: 'set', type: VIEW_SWITCH_TYPE.MOVE_LEFT, solo: false});
    };

    public home(){
        // CF.hideBanner();
        // Statistics.reportEvent("playtime","FC","time");
        // Statistics.reportEvent("overtime","FC","count");
        
        cc.director.loadScene(G.startScene);
    };

    public help(){
        NOTIFICATION.emit(COMM_EVENT.SWITCH_VIEW, {name: 'help', type: VIEW_SWITCH_TYPE.MOVE_RIGHT, solo: false});
    };

    public voice(){

    };

    public share(){
        // Share.shareGameMsg("FC");
    };

    public showBannerAd(){
        let ad_pos;
        let ad_key;
        if(1){
            ad_key = "FC_1"
            ad_pos = "banner2"
        }else{
            ad_key = "FC_2"
            ad_pos = "banner2"
        }

        // CF.createBanner(this.node_ad,{key: ad_key,pos: ad_pos});
    };
}