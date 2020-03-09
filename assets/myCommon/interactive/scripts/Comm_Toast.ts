import CommFunc from "../../utils/CommFunc";

// toast element

const {ccclass, property} = cc._decorator;

@ccclass
export default class Comm_Toast extends cc.Component {

    @property(cc.Node)
    node_bg: cc.Node = null;
    @property(cc.Sprite)
    sp_icon: cc.Sprite = null;
    @property(cc.Label)
    label_title: cc.Label = null;
    @property(cc.SpriteFrame)
    icon_success: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    icon_loading: cc.SpriteFrame = null;
    @property(cc.Animation)
    anim: cc.Animation = null;
    @property(cc.BlockInputEvents)
    mask: cc.BlockInputEvents = null;

    public static TOAST_BETY_MAX: number = 60;          // toast最多60个字节
    public static LOAD_BETY_MAX: number = 14;           // load最多14个字节

    private _imageSp: cc.SpriteFrame = null;

    public show(data: any){
        this.node.active = true;
        this.anim.stop();
        this.node.stopAllActions();
        this.node.opacity = 0;
        this._imageSp = null;

        let {icon = 'none', title = '', duration = 1.5, mask = false, image = null} = data;
        if(!image && icon === 'none'){
            this.node_bg.setContentSize(250, 250);
            this.sp_icon.node.active = false;
            this.label_title.node.setPosition(0, 0);
            this.label_title.node.setContentSize(200, 200);
            this.label_title.fontSize = 32;
            this.label_title.lineHeight = 35;
            title = CommFunc.byteSplice(title, 0, Comm_Toast.TOAST_BETY_MAX);

        }else{
            this.node_bg.setContentSize(220, 240);
            this.sp_icon.node.active = true;
            this.label_title.node.setPosition(0, -70);
            this.label_title.node.setContentSize(200, 40);
            this.label_title.fontSize = 32;
            this.label_title.lineHeight = 35;
            title = CommFunc.byteSplice(title, 0, Comm_Toast.LOAD_BETY_MAX);

            if(image){
                this.sp_icon.fillRange = 1;
                if(typeof image === 'string'){
                    CommFunc.createSpritFrame(image, (sp) => {
                        this._imageSp = sp;
                        this.sp_icon.spriteFrame = sp;
                    });

                }else if(image instanceof cc.Texture2D){
                    let sp = new cc.SpriteFrame(image);
                    this.sp_icon.spriteFrame = sp;

                }else if(image instanceof cc.SpriteFrame){
                    this.sp_icon.spriteFrame = image;
                }

            }else{
                if(icon === 'loading'){
                    this.sp_icon.spriteFrame = this.icon_loading;
                    this.sp_icon.fillRange = 1;
                    this.anim.play('loading');
    
                }else if(icon === 'success'){
                    this.sp_icon.spriteFrame = this.icon_loading;
                    this.sp_icon.fillRange = 0;
                    this.anim.play('loading');
    
                }
            }
        }

        this.node.setPosition(0, 0);
        this.label_title.string = title;
        this.mask.enabled = mask;

        let action = cc.sequence(
            cc.fadeIn(0.1),
            cc.delayTime(duration),
            cc.fadeOut(0.2),
            cc.callFunc(() => {
                this.hide();
            }),
        );
        if(icon === 'loading'){
            action = cc.fadeIn(0.2);
        }
        this.node.runAction(action);
    };

    public hide(){
        this.node.stopAllActions();
        this.node.runAction(cc.sequence(
            cc.fadeOut(0.2),
            cc.callFunc(() => {
                this.label_title.string = '';
                this.node.opacity = 0;
                this.node.stopAllActions();
                this.anim.stop();
                this.node.active = false;
                this._imageSp && cc.loader.releaseAsset(this._imageSp);
                this._imageSp = null;
            }),
        ));
    };
}
