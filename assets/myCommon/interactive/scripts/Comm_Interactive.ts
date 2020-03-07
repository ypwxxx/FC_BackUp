import CommFunc from "../../utils/CommFunc";

// toast element

const {ccclass, property} = cc._decorator;

@ccclass
export default class Comm_Interactive extends cc.Component {

    @property(cc.Node)
    node_bg: cc.Node = null;
    @property(cc.Sprite)
    sp_icon: cc.Sprite = null;
    @property(cc.Label)
    label_title: cc.Label = null;

    private _pool: cc.NodePool = null;
    private _icon: string = null;

    public reuse(data: any){
        let {icon = 'toast', title = '', duration = 1, pool = null} = data;
        if(!(pool instanceof cc.NodePool)) return;
        this.label_title.string = title;
        this._pool = pool;
        this._icon = icon;

        this.node.setPosition(0, 0);

        if(icon === 'none'){
            this.node_bg.setContentSize(250, 250);
            this.sp_icon.node.active = false;
            this.label_title.node.setPosition(0, 0);
            this.label_title.node.setContentSize(200, 200);
            this.label_title.fontSize = 32;
            this.label_title.lineHeight = 35;
            title = CommFunc.byteSplice(title, 0, 60);

        }else if(icon === 'loading'){
            

        }else if(icon === 'success'){

        }

        this.label_title.string = title;

        this.node.opacity = 0;
        this.node.stopAllActions();
        this.node.runAction(cc.sequence(
            cc.fadeIn(0.1),
            cc.delayTime(duration),
            cc.spawn(cc.moveBy(0.4, cc.v2(0, 100)), cc.fadeOut(0.4)),
            cc.callFunc(() => {
                this._pool.put(this.node);
            }),
        ));
    };

    public unuse(){
        this.label_title.string = '';
        this._pool = null;
        this.node.opacity = 0;
    };
}
