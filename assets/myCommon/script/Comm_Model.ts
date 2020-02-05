import Comm_Command from "./Comm_Command";

/**
 * 模块类模块
 */
export default class Comm_Model {
    public constructor() {

    };

    public _contronller: any = null;

    /**
     * 向控制器发送指令
     * @param msg 命令名
     * @param content 内容
     */
    public sendMessageToContronller(msg: string, content?: any){
        
    };

    /**
     * 接收控制器的信息
     * @param command 指令
     */
    public receivedMessageByContronller(command: Comm_Command){
        
    }
};