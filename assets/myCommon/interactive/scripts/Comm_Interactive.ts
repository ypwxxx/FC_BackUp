const {ccclass, property} = cc._decorator;
import { Toast_Options } from "../../Comm_Interface";
import Comm_Main from "../../Comm_Main";

@ccclass
export default class Comm_Interactive extends cc.Component {

    @property(cc.Node)
    toast: cc.Node = null;
    

    public static DEFAULT_TIME: number = 1.5;               // toast默认显示时间
    public static DEFAULT_ICON: string = 'none';            // toast默认icon
    public static DEFAULT_MASK: boolean = false;            // toast默认mask
    public static ZINDEX: number = 200;                     // 本组件的zIndex

    private _toast: any = null;

    onLoad(): void{
        // 设置为常驻节点
        cc.game.addPersistRootNode(this.node);
        this.node.zIndex = 200;

        this._toast = this.toast.getComponent('Comm_Toast');
        this.toast.active = false;

        let size = cc.view.getVisibleSize();
        this.node.setPosition(size.width / 2, size.height / 2);

        // 绑定
        let obj = {
            'showToast': this._showToast,
            'hideToast': this._hideToast,
            'showLoading': this._showToast,
            'hideLoading': this._hideToast,
            'showModal': this._showModal,
        }
        Comm_Main.bindViewMag(obj, this);
    };

    /**
     * 显示toast
     * @param obj Toast_Options | string
     */
    private _showToast(obj: Toast_Options | string){
        let data = {
            title: '',
            icon: 'none',
            image: null,
            duration: 1.5,
            mask: false,
        }
        if(typeof obj === 'string'){
            data.title = obj;
        }else{
            data.title = obj.title;
            data.icon = obj.icon ? obj.icon : data.icon;
            data.image = obj.image ? obj.image : data.image;
            data.duration = obj.duration ? obj.duration : data.duration;
            data.mask = obj.mask ? obj.mask : data.mask;
        }

        this._toast.show(data);
    };

    /**
     * 隐藏toast
     */
    private _hideToast(){
        this._toast.hide();
    };

    /**
     * 显示modal
     */
    private _showModal(){

    }
}
