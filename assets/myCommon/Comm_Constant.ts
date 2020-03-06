
/**
 * 公共事件名枚举
 */  
export const COMM_EVENT = {
	SHOW_TOAST: 'showtoast',       // 显示toast
	SWITCH_VIEW: 'switchView',     // 切换view
	OPEN_MASK: 'openMask',         // 打开遮罩
	CLOSE_MASK: 'closeMask',       // 关闭遮罩
};

// 切换view的方式
export const VIEW_SWITCH_TYPE = cc.Enum({
	MOVE_LEFT: 0,			// 从左边移入移出
	MOVE_RIGHT: 1,			// 从右边移入移出
	HIDE: 2,			    // 淡入淡出
});

// 动作标签
export enum COMM_ACTION_TAG {
	SWITCH_VIEW = 10086,              // 场景切换
	SHOW_TOAST,                       // 显示toast
};

// zIndex标签
export enum COMM_Z_INDEX {
	TOAST = 100,                      // toast
}