import { FC_PLANE_TYPE, FC_GAME_BASE_DATA, FC_PLAYER_TYPE, FC_GAME_SAVE } from "./FC_Constant";
import CommFunc from "../../myCommon/utils/CommFunc";
import FC_UserData from "./FC_UserData";

/**
 * 游戏数据类
 */

export default class FC_GameData {
    private constructor(){};
    private static instance: FC_GameData = null;
    public static getInstance(): FC_GameData{
        this.instance = this.instance ? this.instance : new FC_GameData();
        return this.instance;
    };

    private _isSave: boolean = false;                   // 是否是存档开局
    private _playerCount: number = 0;                   // 本局游戏的人数
    private _planeType: FC_PLANE_TYPE[] = null;            // 本局参与的飞机类型
    private _launchPlaneNum: number[] = null;           // 起飞数字
    private _playerType: FC_PLAYER_TYPE[] = null;          // 本局玩家类型
    private _playerIconIndexs: number[] = null;         // 玩家头像序号
    private _playerOrderIndexs: number[] = null;        // 玩家次序序号

    public get playerCount(): number {
        return this._playerCount;
    };

    public get planeType(): FC_PLANE_TYPE[] {
        return this._planeType;
    };

    public get launchPlaneNums(): number[]{
        return this._launchPlaneNum;
    };

    public get isSave(): boolean{
        return this._isSave;
    }

    /**
     * 配置存档信息
     */
    public setSaveInfo(){
        // 读取之前的信息
        let data = FC_UserData.getInstance().getGameData();
        if(data){
            this._isSave = true;

            this._playerCount = data.playerCount;
            this._planeType = data.planeType;
            this._launchPlaneNum = data.launchNum;
            this._playerType = data.playerType;
            this._playerIconIndexs = data.playerIcon;
            this._playerOrderIndexs = data.playerOrder;
        }
    };

    // 设置开始游戏信息
    public setStartInfo(planeType: FC_PLANE_TYPE[], playerType: FC_PLAYER_TYPE[], launchNum: number){
        this._playerCount = planeType.length;           // 玩家数量
        this._planeType = [];
        this._playerType = [];
        let playerArr = [];                             // 记录玩家类型
        for(let i = 0; i < planeType.length; i++){      // 飞机类型
            this._planeType.push(planeType[i]);
        }
        for(let i = 0; i < playerType.length; i++){     // 玩家类型
            this._playerType.push(playerType[i]);
            if(playerType[i] === FC_PLAYER_TYPE.OFFLINE){
                playerArr.push(i);
            }
        }

        // 头像(0-10中选择,互不相同) 共11个
        this._playerIconIndexs = [];
        let temp = [];
        for(let i = 0; i < FC_GAME_BASE_DATA.player_icon_count; i++){
            temp.push(i);
        }

        CommFunc.randSortArr(temp, 3);
        for(let i = 0; i < 4; i++){
            this._playerIconIndexs.push(temp.pop());
        }

        // 次序(优先玩家;多个玩家,从中随机)
        CommFunc.randSortArr(playerArr, 3);
        let firstOrder = playerArr[0];
        this._playerOrderIndexs = [-1, -1, -1, -1];
        for(let i = 0; i < this._playerOrderIndexs.length; i++){
            let abs = i - firstOrder;
            let index = 0;
            if(abs >= 0){
                index = abs + 1;
            }else{
                index = abs + 5;
            }
            this._playerOrderIndexs[i] = index;
        }

        // 启动数字
        if(launchNum <= 2 && launchNum >= 0){
            this._launchPlaneNum = FC_GAME_BASE_DATA.launch_plane_num[launchNum];
        }

        // 清除旧存档
        FC_UserData.getInstance().clear();

        // 保存
        let data = {
            playerCount: this._playerCount,
            playerType: this._playerType,
            planeType: this._planeType,
            launchNum: this._launchPlaneNum,
            playerIcon: this._playerIconIndexs,
            playerOrder: this._playerOrderIndexs
        }
        cc.sys.localStorage.setItem(FC_GAME_SAVE.GAME_DATA, JSON.stringify(data));

        this._isSave = false;
    };

    // 获取玩家类型
    public getPlayerType(type: FC_PLANE_TYPE): FC_PLAYER_TYPE{
        let results = null;
        if(type === FC_PLANE_TYPE.THE_RED){
            results = 0;
        }else if(type === FC_PLANE_TYPE.THE_YELLOW){
            results = 1;
        }else if(type === FC_PLANE_TYPE.THE_BLUE){
            results = 2;
        }else if(type === FC_PLANE_TYPE.THE_GREEN){
            results = 3;
        }
        return this._playerType[results];
    };

    // 获取玩家头像编号后缀
    public getPlayerIconIndex(type: FC_PLANE_TYPE): number{
        let results = null;
        if(type === FC_PLANE_TYPE.THE_RED){
            results = 0;
        }else if(type === FC_PLANE_TYPE.THE_YELLOW){
            results = 1;
        }else if(type === FC_PLANE_TYPE.THE_BLUE){
            results = 2;
        }else if(type === FC_PLANE_TYPE.THE_GREEN){
            results = 3;
        }
        return this._playerIconIndexs[results];
    };

    // 获取玩家顺序
    public getPlayerOrder(type: FC_PLANE_TYPE): number{
        let results = null;
        if(type === FC_PLANE_TYPE.THE_RED){
            results = 0;
        }else if(type === FC_PLANE_TYPE.THE_YELLOW){
            results = 1;
        }else if(type === FC_PLANE_TYPE.THE_BLUE){
            results = 2;
        }else if(type === FC_PLANE_TYPE.THE_GREEN){
            results = 3;
        }
        return this._playerOrderIndexs[results];
    };
}
