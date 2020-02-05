import { NOTIFICATION } from "../myCommon/script/Comm_Modules";
import { COMM_EVENT, VIEW_SWITCH_TYPE } from "../myCommon/script/Comm_Enum";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    public onLoad(){
        if(!window.G){
            window.G = {
                startScene: 'StartScene',
            }
        }else{
            window.G.startScene = 'StartScene';
        }
    };

    public btn_startGame(){
        NOTIFICATION.emit(COMM_EVENT.SWITCH_VIEW, {name: 'set', type: VIEW_SWITCH_TYPE.MOVE_LEFT, solo: false});
    };
}
