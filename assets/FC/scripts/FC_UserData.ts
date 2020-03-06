import { FC_GAME_SAVE, FC_PLANE_TYPE } from "./FC_Constant";
import { FC_SaveGameData, FC_SaveUserData, FC_SavePlayerData } from "./FC_Interface";

/**
 * 用户数据(读取/保存存档)
 * 存档数据类型: 
 * a:全局: [回合数,飞机叠机栈,排行序号]
 * b:玩家信息: [排名,ai等级和特性]
 * c:飞机信息: [当前移动步数，棋点[序号，区域，类型]]
 */
export default class FC_UserData {
    private constructor (){};
    private static instance: FC_UserData = null;
    public static getInstance(): FC_UserData{
        this.instance = this.instance ? this.instance : new FC_UserData();
        return this.instance;
    };

    private _userData: FC_SaveUserData = null;
    private _gameData: FC_SaveGameData = null;
    private _hasSaveData: boolean = false;

    public get hasSave(): boolean {
        return this._hasSaveData;
    }

    /**
     * 初始化
     * 获取本地数据
     */
    public init(){
        // 读取本地数据，同时判断是否存在存档数据
        this._load();
    };

    /**
     * 保存存档
     */
    public save(obj: FC_SaveUserData){
        this._userData = obj;
        cc.sys.localStorage.setItem(FC_GAME_SAVE.USER_DATA, JSON.stringify(obj));
    };

    /**
     * 清除存档
     */
    public clear(){
        this._hasSaveData = false;
        cc.sys.localStorage.removeItem(FC_GAME_SAVE.USER_DATA);
        cc.sys.localStorage.removeItem(FC_GAME_SAVE.GAME_DATA);
        this._userData = null;
        this._gameData = null;
    };

    /**
     * 获取回合
     */
    public getRound(){
        let temp = [this._userData.round[0], this._userData.round[1]];
        return temp;
    };

    /**
     * 玩家存档
     */
    public getPlayerSave(planeType: FC_PLANE_TYPE){
        let data: FC_SavePlayerData = null;
        for(let value of this._userData.player){
            if(value.type === planeType){
                data = value;
                break;
            }
        }
        return data;
    };

    /**
     * 飞机存档
     */
    public getPlaneSave(){
        return this._userData.plane;
    }

    /**
     * 叠机栈
     */
    public getStackPlane(){
        let temp: number[][][] = [[],[],[],[]];
        for(let i = 0; i < this._userData.planeStacks.length; i++){
            let tempArr = this._userData.planeStacks[i];
            for(let j = 0; j < tempArr.length; j++){
                let stack = tempArr[j];
                let tempStack = [];
                for(let n = 0; n < stack.length; n++){
                    tempStack.push(stack[n]);
                }
                temp[i].push(tempStack);
            }
        }
        return temp;
    };

    /**
     * 排行
     */
    public getRankIndex(){
        return this._userData.rankIndex;
    };

    public getGameData(){
        return this._gameData;
    }

    /**
     * 加载存档
     */
    private _load(){
        let userData = cc.sys.localStorage.getItem(FC_GAME_SAVE.USER_DATA);
        let gameData = cc.sys.localStorage.getItem(FC_GAME_SAVE.GAME_DATA);
        if(userData && gameData){
            this._hasSaveData = true;
            // 存在存档
            this._userData = JSON.parse(userData);
            this._gameData = JSON.parse(gameData);
        }else{
            this._hasSaveData = false;
        }
    };
}