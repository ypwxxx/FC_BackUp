/* *场景切换专用组件* */

const {ccclass, property} = cc._decorator;
import { View_Options } from "./../../Comm_Interface";
import { VIEW_SWITCH_TYPE, COMM_ACTION_TAG} from "./../../Comm_Constant";
import Comm_View from "./Comm_View";
import Comm_Log from "../../utils/Comm_Log";
import Comm_Main from "../../Comm_Main";

interface ViewMap {
    [propName: string]: Comm_View,
}

@ccclass
export default class Comm_ViewMag extends cc.Component {
    @property({
        type: VIEW_SWITCH_TYPE,
        tooltip: `view默认切换方式: \nMOVE_LEFT: 从左边移入/移出\nMOVE_RIGHT: 从右边移入/移出\nHIDE: 淡入淡出`,
    })
    defaultSwitchType = VIEW_SWITCH_TYPE.MOVE_LEFT;

    @property(cc.Integer)
    _viewCount = 0;

    @property([cc.Prefab])
    _viewPrefabs: cc.Prefab[] = [];

    @property({
        type: [cc.Prefab]
    })
    get viewPrefabs (){
        return this._viewPrefabs;
    };
    set viewPrefabs (value){
        this._viewPrefabs = value;

        let arr1 = [];
        let arr2 = [];
        for(let i = 0; i < value.length; i++){
            if(typeof this._viewNames[i] == 'undefined' || this._viewNames[i] == null){
                arr1.push('');
            }else{
                arr1.push(this._viewNames[i]);
            }
            if(typeof this._viewComponentNames[i] == 'undefined' || this._viewComponentNames[i] == null){
                arr2.push('');
            }else{
                arr2.push(this._viewComponentNames[i]);
            }
        }
        this._viewNames = arr1;
        this._viewComponentNames = arr2;
        this._viewCount = value.length;
    };

    @property([cc.String])
    _viewNames = [];

    @property({
        type: [cc.String],
        tooltip: '对应otherView数组顺序的view名, 调用时需要用到, 请不要使用重复的命名!否则可能导致错误!'
    })
    get viewNames (){
        return this._viewNames;
    };
    set viewNames (value){
        let arr = [];
        for(let i = 0; i < this._viewCount; i++){
            if(typeof this._viewNames[i] == 'undefined' || this._viewNames[i] == null){
                arr.push('');
            }else{
                arr.push(this._viewNames[i]);
            }
        }
        this._viewNames = arr;
    };

    @property([cc.String])
    _viewComponentNames = [];

    @property({
        type: [cc.String],
        tooltip: '对应otherView数组顺序的自定义脚本名, 初始化时需要用到, 请不要使用重复的命名!否则可能导致错误!'
    })
    get viewComponentNames (){
        return this._viewComponentNames;
    };
    set viewComponentNames (value){
        let arr = [];
        for(let i = 0; i < this._viewCount; i++){
            if(typeof this._viewComponentNames[i] == 'undefined' || this._viewComponentNames[i] == null){
                arr.push('');
            }else{
                arr.push(this._viewComponentNames[i]);
            }
        }
        this._viewComponentNames = arr;
    };

    @property(cc.Node)
    mask: cc.Node = null;

    private static MoveTime: number = 0.3;                      // 移动时间
    private MoveDistance: number = -1000;                // 移动距离
    private _zIndexNum: number = 0;                              // zIndex序号
    private _viewMap: ViewMap = {};
    private _commandStack: (View_Options | string)[] = [];

    // 初始化
    onLoad(): void{
        // 遍历命名数组,如果命名有错误则报错
        for(let i = 0; i < this._viewNames.length; i++){
            for(let j = i + 1; j < this._viewNames.length; j++){
                if(this._viewNames[i] === this._viewNames[j]){
                    return console.error('viewSwitch 中的view命名不能有重复! 重复命名: ' + this._viewNames[i]);
                }
            }
        }

        for(let i = 0; i < this._viewPrefabs.length; i++){
            let view = new Comm_View(this._viewPrefabs[i], this._viewComponentNames[i], this.node);
            view.switchType = this.defaultSwitchType;
            this._viewMap[this._viewNames[i]] = view;
        }

        let size = cc.view.getVisibleSize();
        this.node.setContentSize(size);
        this.mask.setContentSize(size);
        this.MoveDistance = size.width + 300;

        // 绑定
        let obj = {
            'switchView': this._addCommandStack,
            'openMask': this._openMask,
            'closeMask': this._closeMask,
            'addView': this._addView,
        }
        Comm_Main.bindViewMag(obj, this);

        this._zIndexNum = this._viewCount + 1;
        this._closeMask();
    };

    /**
     * 切换场景
     * @param {switchOptions}
     * @param {string} options 
     */
    private _switchView(options: View_Options | string): void{
        let name = 'main';
        let moveBefore = null;
        let moveAfter = null;
        let beforeData = null;
        let afterData = null;
        let switchType = this.defaultSwitchType;
        let solo = true;
        let view: Comm_View = this._viewMap[name];

        if(typeof options === 'string'){
            name = options;
        }else{
            name = options.name;
            view = this._viewMap[name];

            moveBefore = typeof options.moveBefore === 'function' ? options.moveBefore: null;
            moveAfter = typeof options.moveAfter === 'function' ? options.moveAfter: null;
            beforeData = options.beforeData ? options.beforeData: null;
            afterData = options.afterdata ? options.afterdata: null;
            switchType = typeof options.type === 'number' ? options.type: view.switchType;
            solo = typeof options.solo === 'boolean' ? options.solo: view.solo;

            view.switchType = switchType;
            view.solo = solo;
        }

        if(name === 'main'){
            // 切回主页面
            this._moveOutAllView();

        }else{
            if(!view){
                Comm_Log.log(`view: ${name} 不存在`);
                return;
            }

            if(!view.isShow){
                // 是否独显
                if(solo){
                    this._moveOutAllView();
                }
                this._moveIn(view, moveBefore, moveAfter, beforeData, afterData);

            }else{
                this._moveOut(view, moveBefore, moveAfter, beforeData, afterData);
            }
        }
    };

    // 移入
    private _moveIn(view: Comm_View, beforeCallback?: Function, afterCallback?: Function, beforeData?: any, afterData?: any):void{
        if(typeof name == 'undefined') return;

        // 启用点击屏蔽
        this._openMask();

        let type = view.switchType;
        view.isMoving = true;

        view.init();
        view.moveInBefore();

        if(beforeCallback){
            beforeCallback(beforeData);
        }

        // 确定view的初始状态
        view.node.opacity = 255;
        view.node.zIndex = this._zIndexNum;
        this._zIndexNum++;
        if(type === VIEW_SWITCH_TYPE.MOVE_LEFT){
            view.node.setPosition(this.MoveDistance, 0);
        }else if(type === VIEW_SWITCH_TYPE.MOVE_RIGHT){
            view.node.setPosition(-this.MoveDistance, 0);
        }else if(type === VIEW_SWITCH_TYPE.HIDE){
            view.node.opacity = 0;
            view.node.setPosition(0, 0);
        }

        let moveIn = this._getActionByType(type, 'in');
        let action = cc.sequence(
            moveIn,
            cc.callFunc(() => {
                view.isMoving = false;
                view.isShow = true;
                // 关闭点击屏蔽
                this._closeMask();

                if(afterCallback){
                    afterCallback(afterData);
                }

                // 检查命令栈
                this._checkCommandStack();
            })
        );
        action.setTag(COMM_ACTION_TAG.SWITCH_VIEW);
        view.node.stopActionByTag(COMM_ACTION_TAG.SWITCH_VIEW);
        view.node.runAction(action);
    };

    // 移出
    private _moveOut(view: Comm_View, beforeCallback?: Function, afterCallback?: Function, beforeData?: any, afterData?: any): void{
        if(!view) return;

        // 启动点击屏蔽
        this._openMask();

        if(beforeCallback){
            beforeCallback(beforeData);
        }

        view.isMoving = true;
        let type = view.switchType;
        let moveOut = this._getActionByType(type, 'out');
        let action = cc.sequence(
            moveOut,
            cc.callFunc(() => {
                if(afterCallback){
                    afterCallback(afterData);
                }
                // 关闭点击屏蔽
                this._closeMask();

                view.node.active = false;
                view.isMoving = false;
                view.isShow = false;

                // 检查命令栈
                this._checkCommandStack();
            })
        );
        action.setTag(COMM_ACTION_TAG.SWITCH_VIEW);
        view.node.stopActionByTag(COMM_ACTION_TAG.SWITCH_VIEW);
        view.node.runAction(action);
    };

    /**
     * 添加view
     */
    private _addView(temp: Comm_View | cc.Prefab, viewName: string, copName: string = null){
        if(!viewName) return;
        let view = temp;
        if(temp instanceof cc.Prefab && copName){
            view = new Comm_View(temp, copName, this.node);
        }
        if(!(view instanceof Comm_View)) return;

        view.switchType = this.defaultSwitchType;
        this._viewMap[viewName] = view;
    };

    // 获取对应切换动作
    private _getActionByType(type, direction: string){
        let action: cc.ActionInterval = null;
        if(direction === 'in'){
            if(type === VIEW_SWITCH_TYPE.MOVE_LEFT){
                action = cc.moveTo(Comm_ViewMag.MoveTime, cc.v2(0, 0)).easing(cc.easeCubicActionOut());
            }else if(type === VIEW_SWITCH_TYPE.MOVE_RIGHT){
                action = cc.moveTo(Comm_ViewMag.MoveTime, cc.v2(0, 0)).easing(cc.easeCubicActionOut());
            }else if(type === VIEW_SWITCH_TYPE.HIDE){
                action = cc.fadeIn(Comm_ViewMag.MoveTime).easing(cc.easeCubicActionOut());
            }
        }else if(direction === 'out'){
            if(type === VIEW_SWITCH_TYPE.MOVE_LEFT){
                action = cc.moveTo(Comm_ViewMag.MoveTime, cc.v2(this.MoveDistance, 0)).easing(cc.easeCubicActionOut());
            }else if(type === VIEW_SWITCH_TYPE.MOVE_RIGHT){
                action = cc.moveTo(Comm_ViewMag.MoveTime, cc.v2(-this.MoveDistance, 0)).easing(cc.easeCubicActionOut());
            }else if(type === VIEW_SWITCH_TYPE.HIDE){
                action = cc.fadeOut(Comm_ViewMag.MoveTime).easing(cc.easeCubicActionOut());
            }
        }

        return action;
    };

    // 移出目前的所有view
    private _moveOutAllView(){
        for(let prop in this._viewMap){
            let view = this._viewMap[prop];
            if(view && view.isShow){
                this._moveOut(view);
            }
        }
    };

    // 加入命令栈
    private _addCommandStack(data: View_Options | string){
        this._commandStack.push(data);

        this._checkCommandStack();
    };

    // 检查命令栈
    private _checkCommandStack(){
        if(this._commandStack.length !== 0){
            let data = this._commandStack.shift();
            this._switchView(data);
        }
    };

    // 打开遮罩
    private _openMask(){
        this.mask.active = true;
    };

    // 关闭遮罩
    private _closeMask(){
        this.mask.active = false;
    }

    public onDestroy(){
        for(let i in this._viewMap){
            this._viewMap[i].delete();
        }
    };
}
