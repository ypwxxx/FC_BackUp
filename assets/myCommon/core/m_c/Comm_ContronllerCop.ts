import Comm_Command from "./Comm_Command";

const {ccclass, property} = cc._decorator;

/**
 * 控制器组件类模块
 */
@ccclass
export default class Comm_ContronllerCop extends cc.Component {

    // public _model: any = null;

    /**
     * 向model发送指令
     * @param msg 命令名
     * @param content 内容
     */
    public sendMessageToModel(msg: string, content?: any){

    };
    
    /**
     * 收到model发来的信息
     * @param command 指令
     */
    public receivedMessageByModel(command: Comm_Command){
        
    };
}
