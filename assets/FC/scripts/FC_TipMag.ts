import { FC_TipOptions } from "./FC_Interface";
import NOTIFICATION from "../../myCommon/core/event/NOTIFICATION";
import { FC_NAME_VIEW } from "./FC_Constant";

/**
 * tip
 */

const {ccclass, property} = cc._decorator;

@ccclass
export default class FC_TipMag extends cc.Component {

    @property(cc.Prefab)
    tipPrefab: cc.Prefab = null;

    @property({
        type: cc.Float,
        tooltip: '默认显示时间, min--0.5,max--10',
        min: 0.5,
        max: 10,
    })
    duration: number = 1

    @property({
        tooltip: '默认展示位置, (0, 0)',
    })
    defaultPos: cc.Vec2 = cc.v2(0, 0);

    private _tipPool: cc.NodePool = null;

    onLoad(): void{
        this._tipPool = new cc.NodePool('FC_Tip');
        for(let i = 0; i < 5; i++){
            let temp = cc.instantiate(this.tipPrefab);
            this._tipPool.put(temp);
        }

        NOTIFICATION.on(FC_NAME_VIEW.tip, this._show, this);
    };

    /**
     * 显示tip
     * @param title 需要显示的内容
     */
    private _show(options: FC_TipOptions): void{
        let temp: FC_TipOptions = {
            title: ''
        };
        if(typeof options === 'string'){
            temp.title = options;
        }
        let {title = '', duration = this.duration, pos = this.defaultPos} = temp;
        let data = {
            duration: duration,
            pos: pos.clone(),
            title: title,
            pool: this._tipPool,
        };
        this._createTipElement(data);
    };

    // 创建一个tip element
    private _createTipElement(data){
        if(this._tipPool.size() < 1){
            let temp = cc.instantiate(this.tipPrefab);
            this._tipPool.put(temp);
        }
        let tip = this._tipPool.get(data);
        this.node.addChild(tip);
    };

    onDestroy(){
        NOTIFICATION.offByTarget(this);
    };
}
