import { VIEW_SWITCH_TYPE } from "../../myCommon/Comm_Constant";
import { FC_NAME_VIEW } from "./FC_Constant";
import Comm_Main from "../../myCommon/Comm_Main";

const {ccclass, property} = cc._decorator;

@ccclass
export default class FC_HelpView extends cc.Component {

    // help info size
    @property({
        tooltip: "帮助信息图片大小",
    })
    help_info_size: cc.Size = cc.size(0, 0);

    @property([cc.SpriteFrame])
    help_info_res: cc.SpriteFrame[] = [];

    // help info prefab
    @property(cc.Prefab)
    help_info_prefab: cc.Prefab = null;

    // other
    @property(cc.Node)
    node_content: cc.Node = null;
    @property(cc.Node)
    node_tip: cc.Node = null;

    @property(cc.PageView)
    pageView: cc.PageView = null;

    public flushView(){
        let size = cc.winSize;
        // 设置大小, 设置位置
        this.node.setContentSize(size);
        // 设置浏览组件大小
        let node_page = this.pageView.node;
        let node_view = node_page.getChildByName("node_view");
        node_page.setContentSize(this.help_info_size.clone());
        node_view.setContentSize(this.help_info_size.clone());
        this.node_content.setPosition(cc.v2(this.help_info_size.width / 2, 0));

        // 创建info页
        if(this.node_content.childrenCount === 0){
            let count = this.help_info_res.length;
            for(let i = 0; i < count; i++){
                let info_page = cc.instantiate(this.help_info_prefab);
                // this.node_content.addChild(info_page);
                info_page.setContentSize(this.help_info_size);
                info_page.getComponent(cc.Sprite).spriteFrame = this.help_info_res[i];
                this.pageView.addPage(info_page);
            }
            // 设置content宽度
            this.node_content.setContentSize(this.help_info_size.width * count, this.help_info_size.height);
        }
        
        // 隐藏tip
        this.node_tip.active = false;
        // 启用监听
        this.node.off(cc.Node.EventType.TOUCH_END, this._touchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this._touchEnd, this);

        this.pageView.setCurrentPageIndex(0);
        this.node_tip.stopAllActions();
    };

    public sliding(pageView: cc.PageView, eventType: cc.PageView.EventType){
        if(eventType === cc.PageView.EventType.PAGE_TURNING){
            let all = pageView.getPages();
            let cur = pageView.getCurrentPageIndex();
            if(cur === all.length - 1){
                this.node_tip.active = true;
                this.node_tip.runAction(cc.fadeIn(1.0));
            }
        }
    };

    public skip(){
        Comm_Main.switchView({name: FC_NAME_VIEW.help, type: VIEW_SWITCH_TYPE.MOVE_RIGHT, solo: false});
    };

    private _touchEnd(){
        if(this.node_tip.active){
            this.skip();   
        }
    };
}
