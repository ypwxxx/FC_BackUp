import { FC_NAME_VIEW } from "./FC_Constant";
import FC_UserData from "./FC_UserData";
import FC_GameData from "./FC_GameData";
import Comm_Main from "../../myCommon/Comm_Main";

const {ccclass, property} = cc._decorator;

@ccclass
export default class FC_ContinueView extends cc.Component {

    private _oneTouch: boolean = false;

    public onEnable(){
        this._oneTouch = false;
    }

    public back(){
        if(this._oneTouch) return;
        this._oneTouch = true;
        Comm_Main.switchView(FC_NAME_VIEW.continue);
    };

    /**
     * 继续游戏
     */
    public continueGame(){
        if(this._oneTouch) return;
        this._oneTouch = true;

        FC_GameData.getInstance().setSaveInfo();
        cc.director.loadScene("FC_GameScene");
    };

    /**
     * 新游戏
     */
    public newGame(){
        if(this._oneTouch) return;
        this._oneTouch = true;

        // 清除存档
        FC_UserData.getInstance().clear();
        // 拉取设置新游戏界面
        Comm_Main.switchView(FC_NAME_VIEW.set);
    }
}
