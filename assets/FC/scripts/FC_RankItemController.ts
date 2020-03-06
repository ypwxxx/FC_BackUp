import Comm_ContronllerCop from "../../myCommon/core/m_c/Comm_ContronllerCop";
import Comm_Command from "../../myCommon/core/m_c/Comm_Command";
import Comm_Log from "../../myCommon/utils/Comm_Log";
import { COMMAND_FC_RANK, FC_ASSETS_NAME } from "./FC_Constant";

// 排行榜组件控制器
const {ccclass, property} = cc._decorator;

@ccclass
export default class FC_RankItemController extends Comm_ContronllerCop {

    @property(cc.Animation)
    animation: cc.Animation = null;
    @property(cc.Sprite)
    rankIndexSp: cc.Sprite = null;
    @property(cc.Label)
    rankIndexLabel: cc.Label = null;
    @property(cc.Sprite)
    iconSp: cc.Sprite = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Sprite)
    planeSp: cc.Sprite = null;
    @property(cc.SpriteAtlas)
    assets: cc.SpriteAtlas = null;

    public receivedMessageByModel(command: Comm_Command){
        if(!command.checkCommand(1)){
            Comm_Log.log(command.failError.msg);
        }

        switch(command.msg){
            case COMMAND_FC_RANK.flush:
                this._flushItem(command);
                break;
            case COMMAND_FC_RANK.play_anim:
                this._showRank(command);
                break;
            case COMMAND_FC_RANK.set_rank:
                this._setRank(command);
                break;
            default:
                break;
        }
    };

    private _setRank(command: Comm_Command){
        if(!command.checkCommand(2)){
            return;
        }

        this.rankIndexSp.node.active = false;
        this.rankIndexLabel.node.active = false;

        let rank = command.content;
        switch(rank){
            case 0:
                this.rankIndexSp.node.active = true;
                this.rankIndexSp.spriteFrame = this.assets.getSpriteFrame(FC_ASSETS_NAME.rank + '1');
                break;
            case 1:
                this.rankIndexSp.node.active = true;
                this.rankIndexSp.spriteFrame = this.assets.getSpriteFrame(FC_ASSETS_NAME.rank + '2');
                break;
            case 2:
                this.rankIndexLabel.node.active = true;
                this.rankIndexLabel.string = '3';
                break;
            case 3:
                this.rankIndexLabel.node.active = true;
                this.rankIndexLabel.string = '4';
                break;
            default:
                break;
        }
    };

    private _flushItem(command: Comm_Command){
        if(!command.checkCommand(2)){
            return;
        }

        let data = command.content;
        let name = data.name;
        let iconIndex = data.iconIndex;
        let planeType = data.planeType;
        this.nameLabel.string = name;
        this.iconSp.spriteFrame = this.assets.getSpriteFrame(FC_ASSETS_NAME.head + iconIndex);
        this.planeSp.spriteFrame = this.assets.getSpriteFrame(FC_ASSETS_NAME.plane + planeType + '_0');
    };

    private _showRank(command: Comm_Command){
        this.animation.play();
    };

}
