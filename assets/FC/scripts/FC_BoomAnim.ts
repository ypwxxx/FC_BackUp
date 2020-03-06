const {ccclass, property} = cc._decorator;

@ccclass
export default class FC_BoomAnim extends cc.Component {

    @property(cc.Animation)
    anim: cc.Animation = null;

    private _pool: cc.NodePool = null;

    public reuse(pos: cc.Vec2, pool: cc.NodePool){
        this.node.setPosition(pos);
        this._pool = pool;

        this.anim.play();
    }

    public unuse(){
        this._pool = null;
    }

    public animEnd(){
        this.anim.stop();
        this._pool.put(this.node);
    }
}
