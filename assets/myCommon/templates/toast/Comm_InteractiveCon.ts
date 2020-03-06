
// /**
//  * toast 控制器
//  */

// const {ccclass, property} = cc._decorator;
// import {NOTIFICATION} from "./../../../Comm_Modules";
// import { COMM_EVENT } from "../../../script/Comm_Constant";
// import { Toast_Options } from "../../../script/Comm_Interface";

// @ccclass
// export default class Comm_ToastManager extends cc.Component {

//     @property(cc.Prefab)
//     toastPrefab: cc.Prefab = null;

//     @property({
//         tooltip: 'toast组件名，默认为通用'
//     })
//     componentName: string = 'Comm_Toast';

//     @property({
//         type: cc.Float,
//         tooltip: '默认显示时间, min--0.5,max--10',
//         min: 0.5,
//         max: 10,
//     })
//     duration: number = 1;

//     @property({
//         tooltip: '默认展示位置, (0, 0)',
//     })
//     defaultPos: cc.Vec2 = cc.v2(0, 0);

//     private _toastPool: cc.NodePool = null;

//     onLoad(): void{
//         this._toastPool = new cc.NodePool(this.componentName);
//         for(let i = 0; i < 5; i++){
//             let temp = cc.instantiate(this.toastPrefab);
//             this._toastPool.put(temp);
//         }

//         NOTIFICATION.on(COMM_EVENT.SHOW_TOAST, this._show, this);
//     };

//     /**
//      * 显示toast
//      * @param title 需要显示的内容
//      */
//     private _show(obj: Toast_Options | string): void{
//         let temp: Toast_Options = {
//             title: ''
//         };
//         if(typeof obj === 'string'){
//             temp.title = obj;
//         }
//         let {title = '', duration = this.duration, pos = this.defaultPos} = temp;
//         let data = {
//             duration: duration,
//             pos: pos.clone(),
//             title: title,
//             pool: this._toastPool,
//         };
//         this._createToastElement(data);
//     };

//     // 创建一个toast element
//     private _createToastElement(data){
//         if(this._toastPool.size() < 1){
//             let temp = cc.instantiate(this.toastPrefab);
//             this._toastPool.put(temp);
//         }
//         let toast = this._toastPool.get(data);
//         this.node.addChild(toast);
//     };

//     onDestroy(){
//         NOTIFICATION.off(COMM_EVENT.SHOW_TOAST, this._show, this);
//     };
// }
