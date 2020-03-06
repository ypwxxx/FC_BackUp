import { VIEW_SWITCH_TYPE } from "../myCommon/Comm_Constant";
import { FC_NAME_VIEW } from "../FC/scripts/FC_Constant";
import FC_UserData from "../FC/scripts/FC_UserData";
import Comm_Main from "../myCommon/Comm_Main";
import CommFunc from "../myCommon/utils/CommFunc";

const {ccclass, property} = cc._decorator;

@ccclass
export default class StartScene extends cc.Component {

    @property(cc.Canvas)
    canvas: cc.Canvas = null;

    public onLoad(){
        CommFunc.fitScreen(this.canvas);
        if(!window.G){
            window.G = {
                startScene: 'StartScene',
            }
        }

        FC_UserData.getInstance().init();
    };

    public start (){
    };

    public btn_startGame(){
        if(FC_UserData.getInstance().hasSave){
            Comm_Main.switchView({name: FC_NAME_VIEW.continue, type: VIEW_SWITCH_TYPE.MOVE_LEFT});

        }else{
            Comm_Main.switchView({name: FC_NAME_VIEW.set, type: VIEW_SWITCH_TYPE.MOVE_LEFT});

        }
    };
}
