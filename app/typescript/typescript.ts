import './css/style.less'
import '../../common/css/base.less'
import {PickerDateRange} from "./picker-date-range";

class Test{
    constructor(){
        new PickerDateRange('pickerDateRange', {
            // stopToday: false,	//今天之后不可选
            // stopTodayBefore: false,//今天之前不可选
            // isTodayValid: true,	//点击今天是否可选
            // shortOpr: true, //结合单天日期选择的短操作，不需要确定和取消的操作按钮。
            // autoSubmit: true,
            isSingleDay: true,  //是否单选日历
            calendars: 2, //日历数量
            // startDate: '', //默认开始时间
            inputTrigger: 'pickerDateRange',	 //触发日历的input id
            magicSelect: false,
            success:function (data) {
                console.info(data)
            }
        })
    }
}

new Test()
