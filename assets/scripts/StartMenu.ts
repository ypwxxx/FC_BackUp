import { VIEW_SWITCH_TYPE } from "../myCommon/Comm_Constant";
import { FC_NAME_VIEW } from "../FC/scripts/FC_Constant";
import FC_UserData from "../FC/scripts/FC_UserData";
import Comm_Main from "../myCommon/Comm_Main";
import CommFunc from "../myCommon/utils/CommFunc";
import Comm_Log from "../myCommon/utils/Comm_Log";
import Comm_Platform from "../myCommon/utils/Comm_Platform";
// const WXGameClub = require("WXGameClub");
// const Examin = require('Examin');
// const CCGlobal = require('CCGlobal');
// const CCConst = require('CCConst');
// const Share = require('Share');

const {ccclass, property} = cc._decorator;

@ccclass
export default class StartScene extends cc.Component {

    @property(cc.Canvas)
    canvas: cc.Canvas = null;
    @property(cc.Node)
    gameBtnList: cc.Node = null;
    @property(cc.Node)
    FCNode: cc.Node = null;
    @property(cc.Node)
    BBDNNode: cc.Node = null;
    @property(cc.Node)
    N2048Node: cc.Node = null;
    @property(cc.Node)
    HCNode: cc.Node = null;

    private _hasLoad: boolean = false;
    private _ranking: any = null;

    public onLoad(){
        // 是否开始log
        Comm_Log.isLog = true;
        Comm_Platform.init('FC', 'FC');

        CommFunc.fitScreen(this.canvas);
        if(!window.G){
            window.G = {
                appId: '',
                startScene: 'StartScene',
            }
        }

        FC_UserData.getInstance().init();
        this._initExamin();
        // Share.initMsg();
        // Share.onSystemShare('FC');
    };

    public onDestroy(){
        // 隐藏游戏圈等
        // if(CCGlobal.platform == CCConst.PLATFORM.WEIXIN){
        //     WXGameClub.hideGameClubButton();
        //     this._hideRankUI();
        // }
    }

    public start (){
        this._ranking = cc.find('Canvas/WXCommon/rankingUIStart');
        if(cc.isValid(this._ranking)){
            this._ranking = this._ranking.getComponent("RankingUIStart");
        }
    };

    public btn_startGame(touch: cc.Touch, data: string){
        if(this._hasLoad) return;

        if(data == 'FC_GameScene'){
            if(FC_UserData.getInstance().hasSave){
                Comm_Main.switchView({name: FC_NAME_VIEW.continue, type: VIEW_SWITCH_TYPE.MOVE_LEFT});
    
            }else{
                Comm_Main.switchView({name: FC_NAME_VIEW.set, type: VIEW_SWITCH_TYPE.MOVE_LEFT});
    
            }
        }else{
            this._hasLoad = true;

            // cc.director.preloadScene(data, function(){
            //     if(CCGlobal.platform == CCConst.PLATFORM.WEIXIN){
            //         WXGameClub.hideGameClubButton();
            //         this._hideRankUI();
            //     }
            //     cc.director.loadScene(data);
            // });
        }
    };

    public showFullRank(touch: cc.Touch, data: string){
        if(this._hasLoad) return;

        // if(CCGlobal.apiVer > '2.0.2'){
        //     WXGameClub.hideGameClubButton();
        // }
        // this._ranking && this._ranking.showFullList({
        //     onHide:function(){
        //         if(!this._hasLoad){
        //             WXGameClub.showGameClubButton();
        //         }
        //     },
        //     key:data
        // },this);
    };

    public share(){
        // Share.shareGameMsg('FC');
    }

    // 隐藏排行榜
    private _hideRankUI(){
        this._ranking && this._ranking.hideRankingUI();
    };

    private _initExamin(){
        this.gameBtnList.active = false;
        let obj = {
            duration: 1200,    //开屏持续时间
            off: () => {
                Comm_Log.log("关审核")
                // Comm_Log.log("审核参数---关：" + Examin.switchState);

                this.gameBtnList.active = true;
            },
            on: () => {
                Comm_Log.log("开审核")
                // Comm_Log.log("审核参数---开：" + Examin.switchState);

                this.gameBtnList.active = true;
                this.FCNode.setPosition(6, 0);
                this.BBDNNode.active = false;
                this.N2048Node.active = false;
                this.HCNode.active = false;
            },
        }
        // Examin.getExamineMsg(obj);
    }
}
