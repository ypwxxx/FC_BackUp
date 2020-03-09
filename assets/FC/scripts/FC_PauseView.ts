import NOTIFICATION from "../../myCommon/core/event/NOTIFICATION";
import { VIEW_SWITCH_TYPE } from "../../myCommon/Comm_Constant";
import { FC_EVENT, FC_NAME_VIEW } from "./FC_Constant";
import Comm_Main from "../../myCommon/Comm_Main";
import Comm_Platform from "../../myCommon/utils/Comm_Platform";

const {ccclass, property} = cc._decorator;
// const Share = require("Share");

@ccclass
export default class FC_PauseView extends cc.Component {

    @property(cc.Node)
    node_voice_close: cc.Node = null;
    @property(cc.Node)
    adNode: cc.Node = null;

    public moveInBefore(){
        Comm_Platform.creatBanner(false, this.adNode, 'FC_1', 'banner2');
    };

    public close(){
        Comm_Main.switchView({name: FC_NAME_VIEW.pause, type: VIEW_SWITCH_TYPE.HIDE, solo: false});
        NOTIFICATION.emit(FC_EVENT.GAME_RESUME);
    };

    public restart(){
        Comm_Main.switchView({name: FC_NAME_VIEW.set, type: VIEW_SWITCH_TYPE.MOVE_LEFT, solo: false});
    };

    public home(){
        Comm_Platform.hideBanner();
        
        cc.director.loadScene(G.startScene);
    };

    public help(){
        Comm_Platform.hideBanner();

        Comm_Main.switchView({name: FC_NAME_VIEW.help, type: VIEW_SWITCH_TYPE.MOVE_RIGHT, solo: false})
    };

    public voice(){

    };

    public share(){
        // Share.shareGameMsg("FC");
    };
}
