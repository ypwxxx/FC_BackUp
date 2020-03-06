const {ccclass, property} = cc._decorator;

@ccclass
export default class FC_TipView extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    private _pool: cc.NodePool = null;

    public reuse(data){
        let {pos = cc.v2(0, 0), title = '', duration = 1, pool = null} = data;
        if(!(pool instanceof cc.NodePool)) return;
        this.node.setPosition(pos);
        this.label.string = title;
        this._pool = pool;

        this.node.opacity = 0;
        this.node.runAction(cc.sequence(
            cc.fadeIn(0.2),
            cc.delayTime(duration),
            cc.fadeOut(0.2),
            cc.callFunc(() => {
                this._pool.put(this.node);
            }),
        ));
    };

    public unuse(){
        this.label.string = '';
        this._pool = null;
        this.node.setPosition(cc.v2(0, 0));
        this.node.opacity = 0;
    };
}
