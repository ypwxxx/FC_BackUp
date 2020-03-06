import Comm_Command from "./Comm_Command";

/**
 * 控制器模块
 */
export default class Comm_Contronller {
    public constructor() {

    };

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
};