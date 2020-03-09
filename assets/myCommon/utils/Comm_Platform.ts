import Comm_Log from "./Comm_Log";
import Comm_Main from "../Comm_Main";

// const CCGlobal = require('CCGlobal');
// const CCConst = require('CCConst');
// const Stat = require("Statistics");
// const Ads = require('AdsFunc');
// const Share = require('Share');
// const QQRank = require("QQrank");

interface VideoCallBack {
    pos?: string,
    success: Function,
    fail?: Function,
};

/**
 * 通用平台组件
 */
class Comm_Platform {
    private constructor() {};
    private static instance: Comm_Platform = null;
    public static getInstance(): Comm_Platform {
        this.instance = this.instance || new Comm_Platform();
        return this.instance;
    };

    private _gameKey: string = '';                  // 玩法key值
    private _statName: string = '';                 // 统计时使用的游戏名
    private _api: any = null;                       // sdk
    private _isInit: boolean = false;               // 初始化
    private _networkState:boolean = false;          // 网络状态
    private _isUseVideo: boolean = false;           // 是否在用激励视频
    private _isShowVideoPoint: boolean = true;      // 是否显示视频点
    private _creatInsert: Function = null;          // 创建插屏
    private _oldBannerPos: string = '';             // 旧bannerpos
    private _isShowBanner: boolean = false;         // 是否显示banner

    /**
     * 获取网络状况
     */
    public get networkStatus(): boolean {
        return this._networkState;
    };
    /**
     * 是否正在使用视频
     */
    public get isUseVideo(): boolean {
        return this._isUseVideo;
    };
    /**
     * 是否显示视频点
     */
    public get isShowVideoPoint(): boolean{
        return this._isShowVideoPoint;
    };

    /**
     * 配置游戏key值
     */
    public setGameKey(key: string){
        if(key){
            this._gameKey = key;
        }
    };

    /**
     * 配置统计用的名字
     */
    public setStatName(name: string){
        if(name){
            this._statName = name;
        }
    };

    /**
     * 初始化
     * @param key 玩法key
     * @param statName 玩法统计名
     */
    public init(key: string, statName: string){
        if(this._isInit) return;
        this._isInit = true;

        this._gameKey = key;
        this._statName = statName;
        
        // this._isShowVideoPoint = (window.GameConfig && window.GameConfig.info && window.GameConfig.info.showAd == "true") ? true : false;
        // let needInsert = false;
        // //根据不同平台,处理相应的逻辑
        // if(CCGlobal.platform == CCConst.PLATFORM.WEIXIN){
        //     this._api = wx;

        //     needInsert = true;
        // }else if(CCGlobal.platform == CCConst.PLATFORM.TT){
        //     this._api = tt;

        //     Ads.createVideoAd();
        // }else if(CCGlobal.platform == CCConst.PLATFORM.OPPO){
        //     this._api = qg;

        //     Ads.createVideoAd();
        // }else if(CCGlobal.platform == CCConst.PLATFORM.QQ){

        //     this._api = qq;
        // }

        if(!this._api) return;

        // 获取网络状态
        this._api.getNetworkType({
            success: (res) => {
                Comm_Log.log('network:', JSON.stringify(res));
                if(res.networkType == 'none'){
                    this._networkState = false;
                }else{
                    this._networkState = true;
                }
            }
        });

        // 监听网络状态
        this._api.onNetworkStatusChange((res) => {
            Comm_Log.log('network:', JSON.stringify(res));
            this._networkState = !!res.isConnected;
        });

        // if(needInsert){
        //     // 创建插屏
        //     this._creatInsert = () => {
        //         Comm_Log.log('切前后台，显示插屏');
        //         Ads.setInsertAdVisible(true);
        //         this._statInsertAdAll();
        //         let obj = {
        //             loadCallback: this._statInsertAdSelect.bind(this),
        //             showCallback: this._statInsertAdShow.bind(this),
        //         };
        //         Ads.createInsertAd(obj);
        //     };
        //     cc.game.off(cc.game.EVENT_SHOW, this._creatInsert, this);
        //     cc.game.on(cc.game.EVENT_SHOW, this._creatInsert, this);
        // }
    };

    /**
     * 服务器更新分数（QQ专用）
     * @param score 
     */
    public updateScore(score: number, key: string = this._gameKey){
        if(key){
            // if(CCGlobal.platform == CCConst.PLATFORM.QQ){
            //     QQRank.updateRecord('TCYZ', score);
            // }
        }
    };

    /* *************banner相关*************** */

    public creatBanner(isHide = true, adNode: cc.Node = null, key: string = this._gameKey, pos: string = ''){

        // Ads.initBannerNode(adNode);
        // if(CCGlobal.platform == CCConst.PLATFORM.WEIXIN){
        //     let model = {
        //         key: this._gameKey,
        //         pos: pos,
        //     };
        //     if(!this._canShowBanner(adNode)){
        //         this.hideBanner();
        //     }

        //     if(this._oldBannerPos != pos){
        //         this._oldBannerPos = pos;
        //         Ads.createBanner({model: model, flag: 0.5, isHide: isHide});
        //     }else{
        //         this.showBanner(adNode);
        //     }

        // }else if(CCGlobal.platform == CCConst.PLATFORM.OPPO){
        //     Comm_Log.log('create banner');
        //     Ads.createBanner({isHide: isHide});
            
        // }else if(CCGlobal.platform == CCConst.PLATFORM.TT){
        //     if(!this._canShowBanner(adNode)){
        //         this.hideBanner();
        //     }
            
        //     Ads.createBanner({isHide: isHide});

        // }else if(CCGlobal.platform == CCConst.PLATFORM.QQ){
        //     if(!this._canShowBanner(adNode)){
        //         this.hideBanner();
        //     }
            
		// 	Ads.createBanner({isHide: isHide});
		// }
    };

    // 显示banner
    public showBanner(adNode?: cc.Node){
        if(!this._canShowBanner(adNode)){
            this.hideBanner();
        }

        Comm_Log.log("show banner");
        // Ads.showBanner();
        this._isShowBanner = true;
    };

    // 隐藏banner
    public hideBanner(){
        Comm_Log.log("hide banner");
        // Ads.hideBanner();
        this._isShowBanner = false;
    };

    // 判断是否能显示banner
    private _canShowBanner(adNode: cc.Node){
        if(adNode == null) return true;

        let size = cc.view.getFrameSize();
        let y = adNode.getPosition().y;
        let realHeight = size.height * cc.view.getDesignResolutionSize().width / size.width;
        let h = realHeight / 2 + y;
        let adH = cc.view.getDesignResolutionSize().width / size.width * 104;
        Comm_Log.log('h: ', h, 'adH: ', adH);
        if(h < adH){
            return false;
        }else{
            return true;
        }
    };

    /* *************插屏相关*************** */

    /**
     * 显示插屏
     * @param obj 
     */
    public showInsertAd(obj?: any){
        // Ads.setInsertAdVisible(true);
        // this._statInsertAdAll();
        // let temp = {
        //     loadCallback: () => {
        //         if(obj.loadCallback){
        //             obj.loadCallback();
        //         }
        //         this._statInsertAdSelect();
        //     },
        //     showCallback: () => {
        //         if(obj.showCallback){
        //             obj.showCallback();
        //         }
        //         this._statInsertAdShow();
        //     },
        // }
        // Ads.createInsertAd(temp);
    };

    /* *************视频相关*************** */

    /**
     * 显示视频广告
     * @param {Object} options
     */
    public showVideoAds(options: VideoCallBack){
        if(!options.success) return;
        if(this._isUseVideo) return;
        this._isUseVideo = true;
        Comm_Log.log('网络状态: ', this._networkState);
        // 网络状态
        // if(this._networkState){
        //     let model = {
        //         key: this._gameKey,
        //         pos: options.pos
        //     };

        //     // Ads.createVideoAd({model: model});

        //     this.hideBanner();
        //     Ads.loadVideoAd({
        //         suCallback: () => {
        //             this._isUseVideo = false;
        //             if(typeof options.success === 'function'){
        //                 options.success();
        //                 Ads.setInsertAdVisible(false);
        //             }

        //             if(this._isShowBanner){
        //                 this.showBanner();
        //             }
        //         },
        //         failCallback: () => {
        //             this._isUseVideo = false;
        //             if(typeof options.fail === 'function'){
        //                 options.fail();
        //             }
        //             // 视频未播放完成
        //             Comm_Main.showToast('观看完整视频才能获得奖励哦!');
        //             Comm_Log.log('观看完整视频才能获得奖励哦!');
                    
        //             if(this._isShowBanner){
        //                 this.showBanner();
        //             }
        //         },
        //         errCallback: (err) => {
        //             this._isUseVideo = false;
        //             if(typeof options.fail === 'function' && this._networkState){
        //                 Share.shareGameMsg({
        //                     key: 'TCYZ',
        //                     suCallback: options.success,
        //                     failCallback: options.fail
        //                 })
        //             }else{
        //                 Comm_Main.showToast('暂时无法获取视频，请稍后再试!');
        //                 console.log('暂时无法获取视频，请稍后再试!');
        //                 if(typeof options.fail === 'function'){
        //                     options.fail();
        //                 }
        //             }

        //             if(this._isShowBanner){
        //                 this.showBanner();
        //             }
        //         }
        //     })
        // }else{
        //     // 无网络
        //     Comm_Main.showToast('您的网络不稳定，请稍后再试!');
        //     Comm_Log.log('您的网络不稳定，请稍后再试!');
        //     this._isUseVideo = false;
        //     if(typeof options.fail == 'function'){
        //         options.fail();
        //     }
        // }
    };

    /* *************统计相关*************** */

    /**
     * 统计玩家数量
     * @param storageStr 用于存储的字符串
     * @param statName 本玩法的名字
     */
    public statPlayerCount(storageStr: string, statName: string = this._statName){
        if(storageStr && statName){
            let isFirst = cc.sys.localStorage.getItem(storageStr);
            if(!isFirst){
                cc.sys.localStorage.setItem(storageStr, '1');
                // Stat.reportEvent("playpeople",statName,"count");
            }
        }
    };

    /**
     * 统计游戏开始
     * @param statName 本玩法的名字
     */
    public statGameStart(statName: string = this._statName){
        if(statName){
            // Stat.reportEvent("playtime",statName,"time");
            // Stat.reportEvent("starttimes",statName,"count");
        }
    };

    /**
     * 统计游戏结束
     * @param statName 本玩法的名字
     */
    public statGameEnd(statName: string = this._statName){
        if(statName){
            // Stat.reportEvent("playtime",statName,"time");
            // Stat.reportEvent("overtimes",statName,"count");
        }
    };

    /**
     * 统计视频点
     * @param videoName 视频点类型的名字
     * @param statName 玩法的名字
     */
    public statVideoAd(videoName: string, statName: string = this._statName){
        if(videoName && statName){
            // Stat.reportEvent("video_" + statName,videoName,"ad");
            // Stat.reportEvent("video",statName,"count");
        }
    };

    /**
     * 统计插屏广告-总数
     */
    private _statInsertAdAll(){
        // Stat.reportEvent("insertads", "home_all", "count");
    };

    /**
     * 统计插屏广告被点击
     */
    private _statInsertAdSelect(){
        // Stat.reportEvent("insertads", "home_select", "count");
    };

    /**
     * 统计插屏广告展示
     */
    private _statInsertAdShow(){
        // Stat.reportEvent("insertads", "home_show", "count");
    };
}

export default Comm_Platform.getInstance();
