/**
 * view类，用于创建一个view的实例，需要配合viewMag使用
 */
export default class Comm_View {
    public constructor(prefab: cc.Prefab, name: string, root: cc.Node){
        this._prefab = prefab;
        this._name = name;
        this._root = root;
    };

    private _root: cc.Node = null;
    private _prefab: cc.Prefab = null;
    private _node: cc.Node = null;
    private _name: string = null;
    private _cop: any = null;
    
    /**
     * 是否在移动中
     */
    public isMoving: boolean = false;
    /**
     * 是否单独显示，即是否与其他view共存
     */
    public solo: boolean = true;
    /**
     * 切换的方式
     */
    public switchType: number = 0;
    /**
     * 是否正在显示
     */
    public isShow: boolean = false;

    /**
     * 实例化以后的节点
     */
    public get node(): cc.Node{
        return this._node;
    };

    /**
     * 名称
     */
    public get name(): string{
        return this._name;
    };

    /**
     * 初始化
     */
    public init(){
        if(!this._node){
            let size = cc.view.getVisibleSize();
            this._node = cc.instantiate(this._prefab);
            this._cop = this._node.getComponent(this._name);
            this._root.addChild(this.node);
            this._node.setContentSize(size);
            this._cop && this._cop.init && this._cop.init();
        }else{
            this._node.active = true;
        }
    };

    /**
     * 移入之前
     */
    public moveInBefore(){
        this._cop && this._cop.moveInBefore && this._cop.moveInBefore();
    };

    /**
     * 移入之后
     */
    public moveInAfter(){
        this._cop && this._cop.moveInAfter && this._cop.moveInAfter();
    };

    /**
     * 移出之前
     */
    public moveOutBefore(){
        this._cop && this._cop.moveOutBefore && this._cop.moveOutBefore();
    };

    /**
     * 移出之前
     */
    public moveOutAfter(){
        this._cop && this._cop.moveOutAfter && this._cop.moveOutAfter();
    };

    /**
     * 删除
     */
    public delete(){
        this._cop = null;
        this._name = null;
        this._node.stopAllActions();
        this._node = null;
        this._prefab = null;
        this._root = null;
        this.isMoving = null;
        this.isShow = null;
        this.solo = null;
        this.switchType = null;
    };

}