import FC_GameData from "./FC_GameData";
import NOTIFICATION from "../../myCommon/core/event/NOTIFICATION";
import { FC_EVENT, FC_PLANE_TYPE, FC_PLAYER_TYPE, FC_ASSETS_NAME, FC_NAME_VIEW } from "./FC_Constant";
import { COMM_EVENT, VIEW_SWITCH_TYPE } from "../../myCommon/Comm_Constant";
import Comm_Main from "../../myCommon/Comm_Main";

/**
 * 设置游戏页面
 */

const {ccclass, property} = cc._decorator;

@ccclass
export default class FC_SetView extends cc.Component {

    // 选择的玩家类型描述
    @property([cc.Label])
    optionsDescribe: cc.Label[] = [];
    // 启动数字
    @property([cc.Sprite])
    launchNumSp: cc.Sprite[] = [];
    // 图集
    @property(cc.SpriteAtlas)
    spriteAtlas: cc.SpriteAtlas = null;
    // 开始游戏按钮
    @property(cc.Node)
    node_start: cc.Node = null;

    // 0: 无 1: 玩家 2: 电脑
    private _playerSetObj = [0,0,0,0];
    // 0: 2/4/6 1: 5/6 2: 6
    private _launchNum = 0;
    private _describeArr = ["关闭", "玩家", "电脑"];
    private _defaultPlayers = [1, 2, 2, 2];
    // 启动数字亮图
    private _launchNumLightSpFrames: cc.SpriteFrame[] = null;
    // 启动数字灰图
    private _launchNumGreySpFrames: cc.SpriteFrame[] = null;

    public onLoad(){

    };

    // 激活时
    public onEnable(){
        // 获取资源
        this._checkAndSetAssets();

        // 显示默认界面
        for(let i = 0; i < this._defaultPlayers.length; i++){
            let type = this._defaultPlayers[i];
            this._playerSetObj[i] = type;
            let label = this._describeArr[type];
            if(type !== 0){
                label += (i + 1);
            }
            this.optionsDescribe[i].string = label;
        }
        this.launchNumSp[0].spriteFrame = this._launchNumLightSpFrames[0];
        this.launchNumSp[1].spriteFrame = this._launchNumGreySpFrames[1];
        this.launchNumSp[2].spriteFrame = this._launchNumGreySpFrames[2];

        this._launchNum = 0;

        this.node_start.active = true;
    };

    // 禁用时
    public onDisable(){

    };

    //  选择玩家
    public btn_choosePlayer(touch: cc.Touch, data: string){
        let num = Number(data);
        this._playerSetObj[num]++;
        let type = this._playerSetObj[num];
        if(type > 2){
            this._playerSetObj[num] = 0;
            type = 0;
        }

        let label = this._describeArr[type];
        if(type !== 0){
            label += (num + 1);
        }
        this.optionsDescribe[num].string = label;

        let bool = false;
        // 检查选择的是否符合规则
        if(this._checkPlayerType(this._playerSetObj)){
            // 符合
            bool = true;
        }
        this.node_start.active = bool;
    }

    // 选择起飞号
    public btn_chooseLaunchNum(touch: cc.Touch, data: string){
        let num = Number(data);
        if(this._launchNum !== num){
            this._launchNum = num;
        }
        for(let i = 0; i < 3; i++){
            if(i === this._launchNum){
                this.launchNumSp[i].spriteFrame = this._launchNumLightSpFrames[i];
            }else{
                this.launchNumSp[i].spriteFrame = this._launchNumGreySpFrames[i];
            }
        }
    };

    // 开始游戏
    public btn_startGame(){
        // 设置游戏参数
        let planeTypes = [];
        let playerTypes = [];
        for(let i = 0; i < this._playerSetObj.length; i++){
            if(this._playerSetObj[i] > 0){
                if(i == 0){
                    planeTypes.push(FC_PLANE_TYPE.THE_RED);
                }else if(i == 1){
                    planeTypes.push(FC_PLANE_TYPE.THE_YELLOW);
                }else if(i == 2){
                    planeTypes.push(FC_PLANE_TYPE.THE_BLUE);
                }else if(i == 3){
                    planeTypes.push(FC_PLANE_TYPE.THE_GREEN);
                }

                if(this._playerSetObj[i] === 2){
                    playerTypes.push(FC_PLAYER_TYPE.AI);
                }else if(this._playerSetObj[i] === 1){
                    playerTypes.push(FC_PLAYER_TYPE.OFFLINE);
                }
            }else{
                playerTypes.push(FC_PLAYER_TYPE.NONE);
            }
        }

        // 记录游戏开始参数
        FC_GameData.getInstance().setStartInfo(planeTypes, playerTypes, this._launchNum);

        // 检查是否是游戏页面
        let scene = cc.director.getScene();
        if(scene.name == "FC_GameScene"){
            Comm_Main.switchView(FC_NAME_VIEW.main);
            NOTIFICATION.emit(FC_EVENT.GAME_RESTART);
        }else{
            cc.director.loadScene("FC_GameScene");
        }
    };
;
    // 返回
    public btn_back(){
        Comm_Main.switchView({name: FC_NAME_VIEW.set, type: VIEW_SWITCH_TYPE.MOVE_LEFT, solo: false});
    };

    // 检查玩家类型 0: 无 1: 电脑 2: 玩家
    private _checkPlayerType(type: number[]): boolean{
        let results = false;
        let playerCount = 0;            // 玩家数(玩家/电脑)
        let realPlayerCount = 0;        // 真人玩家数(玩家)
        for(let i = 0; i < type.length; i++){
            if(type[i] !== 0){
                playerCount++;
                if(type[i] === 1){
                    realPlayerCount++;
                }
            }
        }
        // 玩家个数至少大于2 且真人玩家至少有一个
        if(playerCount >= 2 && realPlayerCount >= 1){
            results = true;
        }

        return results;
    };

    // 获取资源
    private _checkAndSetAssets(){
        if(!this._launchNumLightSpFrames){
            this._launchNumLightSpFrames = [];
            for(let i = 0; i < 3; i++){
                let name = '' + FC_ASSETS_NAME.launch_num_light + i;
                this._launchNumLightSpFrames.push(this.spriteAtlas.getSpriteFrame(name));
            }
        }

        if(!this._launchNumGreySpFrames){
            this._launchNumGreySpFrames = [];
            for(let i = 0; i < 3; i++){
                let name = '' + FC_ASSETS_NAME.launch_num_grey + i;
                this._launchNumGreySpFrames.push(this.spriteAtlas.getSpriteFrame(name));
            }
        }
    };
}

