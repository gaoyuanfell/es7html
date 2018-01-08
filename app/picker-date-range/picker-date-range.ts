import './css/style.less'
// import '../../common/css/base.less'

Date.prototype.calendar = function (dateType, num) {
    switch (dateType) {
        case 1:
            let d = this.getDate();
            this.setDate(d + num);
            return this;
        case 2:
            let m = this.getMonth();
            this.setMonth(m + num);
            return this;
        case 3:
            let y = this.getFullYear();
            this.setFullYear(y + num);
            return this;
        case 4:
            let h = this.getHours();
            this.setHours(h + num);
            return this;
        case 5:
            let M = this.getMinutes();
            this.setMinutes(M + num);
            return this;
        case 6:
            let s = this.getSeconds();
            this.setSeconds(s + num);
            return this;
    }
};

Date.prototype.formatDate = function (format) {
    let o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "H+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(format)) format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (let k in o)
        if (new RegExp("(" + k + ")").test(format)) format = format.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return format;
};

function insertAfter(newElement, targetElement) {
    targetElement.parentNode.insertBefore(newElement, targetElement.nextSibling)
}

interface PickerDateRangeOption {
    aToday? //今天
    aYesterday?  //昨天
    aRecent7Days?//最近7天
    aRecent14Days?//最近14天
    aRecent30Days?//最近30天
    aRecent90Days? //最近90天
    shortbtn?	//是否显示快捷操作按钮
    date?
    /**
     * 开始日期
     * @type {string}
     */
    startDate?
    /**
     * 结束日期
     * @type {string}
     */
    endDate?
    startCompareDate? // 对比开始日期
    endCompareDate? // 对比结束日期
    minValidDate? //最小可用时间，控制日期选择器的可选力度
    maxValidDate? // 最大可用时间，与stopToday 配置互斥
    success? //回调函数，选择日期之后执行何种操作
    startDateId? // 开始日期输入框ID
    startCompareDateId?// 对比开始日期输入框ID
    endDateId? // 结束日期输入框ID
    endCompareDateId? // 对比结束日期输入框ID
    target ? // 日期选择框的目标，一般为 <form> 的ID值
    needCompare ? // 是否需要进行日期对比
    suffix ? //相应控件的后缀
    inputTrigger ?
    compareTrigger ?
    compareCheckboxId ?// 比较选择框
    calendars ? // 展示的月份数，最大是2
    calendarsChoose ?//2为开始时间和结束时间都需要选择才能确认
    dayRangeMax ?// 日期最大范围(以天计算)
    monthRangeMax ?// 日期最大范围(以月计算)
    dateTable ? // 日期表格的CSS类
    selectCss ? // 时间选择的样式
    compareCss ? // 比较时间选择的样式
    coincideCss ? // 重合部分的样式
    firstCss ? //起始样式
    lastCss ? //结束样式
    clickCss ?//点击样式
    disableGray ? // 非当前月的日期样式
    isToday? // 今天日期的样式
    joinLineId ?
    isSingleDay ?  //是否单选日期  false：表示选择时间段，
    defaultText ?
    singleCompare ?
    stopTodayBefore ?//今天之前不可选
    stopToday ?//今天之后不可选
    isTodayValid ?
    weekendDis ? //灰掉周末不可选。
    disCertainDay ? //不可用的周日期设置数组，如：[13]是要周一， 周三 两天不可选，每个周的周一，周三都不可选择。
    disCertainDate ?//不可用的日期设置数组，如=[13]是要1号，3号 两天不可选，特别的，[true13]则反之，只有1，3可选，其余不可选。
    shortOpr ? //结合单天日期选择的短操作，不需要确定和取消的操作按钮。
    noCalendar ? //日期输入框是否展示
    theme ? //日期选择器的主题，目前支持 'gri' / 'ta'
    magicSelect ? //用户自定义选择年、月，与{theme=ta}配合使用。
    autoCommit ? //加载后立马自动提交
    autoSubmit ? //是否显示确定，取消按钮，直接提交
    replaceBtn ?
    singleDateRange ? //默认多个对象
}

interface PickerValue {
    startCompareDate?
    endCompareDate?
    needCompare?
    startDate?: Date | string
    endDate?: Date | string
}

interface PickerDate {
    format: string
    month: number
    date: Date
    year: number
    week: number
    day: number
    disabled?: boolean
    type?: 'first' | 'second' | 'range'
    selected?: boolean
}

class Renderer {
    constructor() {
    }

    static listen(target: 'window' | 'document' | 'body' | any, eventName: string, callback: (event: any) => boolean | void) {
        let ref = null;
        switch (target) {
            case 'window':
                ref = self;
                break;
            case 'document':
                ref = self.document;
                break;
            case 'body':
                ref = self.document.body;
                break;
        }
        ref.addEventListener(eventName, callback)
        return function () {
            ref.removeEventListener(eventName, callback);
        }
    }

    static addClass(el: any, ...name: string[]) {
        el.classList && el.classList.add(name);
    };

    static removeClass(el: any, ...name: string[]) {
        el.classList && el.classList.remove(name);
    };
}

export class PickerDateRange {
    constructor(id: string, option: PickerDateRangeOption = {}) {
        Object.assign(this.option, option)
        this.defaultOption();
        this.ref = <HTMLInputElement> self.document.querySelector(`#${id}`);
        this.init();
        this.initEvent();
    }

    init() {
        let d = this.option.endDate;
        let firstDayOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);

        let selectYearHTML =
            `<select class="select-year">
                ${PickerDateRange.getSelectYear(firstDayOfMonth.getFullYear()).map(y => {
                return `<option value="${y}">${y}</option>`
            }).join('')}
            </select>`;

        let selectMonthHTML =
            `<select class="select-month">
                ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => {
                return `<option value="${m - 1}">${m}</option>`
            }).join('')}
            </select>`;

        let btnHTML =
            `<div class="picker-footer">
                <button class="picker-btn-yes">确定</button>
                <button class="picker-btn-no">取消</button>
            </div>`;

        let pickerRef =
            `<div class="picker">
                <div class="picker-body">
                    <div class="picker-nav">
                        <a href="javascript:void 0" class="nav-reduce">上</a>
                        <a href="javascript:void 0" class="nav-add">下</a>
                        <p class="picker-date">
                            ${selectYearHTML}年${selectMonthHTML}月
                        </p>
                    </div>
                    <div class="picker-week">
                        ${['一', '二', '三', '四', '五', '六', '日'].map(w => {
                return `<span class="week-item">${w}</span>`
            }).join('')}
                    </div>
                    <div class="picker-day"></div>
                </div>
                ${(this.option.calendars == 2 || !this.option.isSingleDay) ? btnHTML : ''}
            </div>`;

        this.ref.readOnly = true;
        this.setValue({
            startDate:this.option.startDate,
            endDate:this.option.endDate,
        })
        this.boxRef = self.document.createElement('div');
        this.boxRef.innerHTML = pickerRef;
        this.boxRef.style.position = 'absolute';

        insertAfter(this.boxRef, this.ref);
        // self.document.body.appendChild(this.boxRef);
        this.navAddRef = this.boxRef.querySelector('.nav-add');
        this.navReduce = this.boxRef.querySelector('.nav-reduce');
        this.btnYesRef = this.boxRef.querySelector('.picker-btn-yes');
        this.btnNoRef = this.boxRef.querySelector('.picker-btn-no');
        //年
        this.selectYearRef = <HTMLSelectElement> this.boxRef.querySelector('.select-year');
        //月
        this.selectMonthRef = <HTMLSelectElement> this.boxRef.querySelector('.select-month');
        //天
        this.pickerDayRef = <HTMLDivElement> this.boxRef.querySelector('.picker-day');
        this.getFillDays();
        this.boxRef.style.display = 'block';
        this.boxPosition.boxHeight = this.boxRef.clientHeight;
        this.boxPosition.boxWidth = this.boxRef.clientWidth;
        this.boxRef.style.display = 'none';
        this.setPosition();
    }


    defaultOption() {
        if (!this.option.startDate) this.option.startDate = new Date();
        if (this.option.calendars == 2 || !this.option.isSingleDay) {
            if (!this.option.endDate) this.option.endDate = new Date();
        } else {
            if (!this.option.endDate) this.option.endDate = this.option.startDate;
        }
        if (typeof this.option.startDate === 'string') this.option.startDate = new Date(this.option.startDate);
        if (typeof this.option.endDate === 'string') this.option.endDate = new Date(this.option.endDate);
        this.option.date = new Date(this.option.endDate)
    }

    initEvent() {
        this.windowEvent = Renderer.listen('window', 'click', (e: any) => {
            if (e.target === this.ref || this.pickerDayRef.contains(e.target) || this.boxRef.contains(e.target)) return;
            this.close();
        })

        window.onresize = () => {
            this.setPosition();
        }

        if (this.ref) this.ref.addEventListener('click', () => {
            this.show();
        });
        if (this.pickerDayRef) this.pickerDayRef.addEventListener('click', (e: any) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.target.parentNode != this.pickerDayRef) return;
            let index = e.target.dataset.index;
            let day = this.days[index];
            if (day.disabled) return;
            this.selected(day);
        });

        if (this.selectYearRef) this.selectYearRef.addEventListener('change', (e: any) => {
            this.yearSelect(e.target.value, e.target)
        });
        if (this.selectMonthRef) this.selectMonthRef.addEventListener('change', (e: any) => {
            this.monthSelect(e.target.value, e.target);
        });
        if (this.navAddRef) this.navAddRef.addEventListener('click', (e:any) => {
            e.preventDefault();
            e.stopPropagation();
            this.option.date.calendar(2, 1);
            this.getFillDays();
        });
        if (this.navReduce) this.navReduce.addEventListener('click', (e:any) => {
            e.preventDefault();
            e.stopPropagation();
            this.option.date.calendar(2, -1);
            this.getFillDays();
        });
        if (this.btnYesRef) this.btnYesRef.addEventListener('click', (e:any) => {
            e.preventDefault();
            e.stopPropagation();
            if (!this.firstDate || !this.secondDate) return;
            this.ref.value = `${this.firstDate.format}${this.option.defaultText}${this.secondDate.format}`;
            this.option.success({
                startCompareDate: null,
                endCompareDate: null,
                needCompare: null,
                startDate: this.firstDate.format,
                endDate: this.secondDate.format,
            });
            this.option.startDate = this.firstDate.date;
            this.option.endDate = this.secondDate.date;
            this.close();
        });
        if (this.btnNoRef) this.btnNoRef.addEventListener('click', (e:any) => {
            e.preventDefault();
            e.stopPropagation();
            this.close();
        })
    }

    option: PickerDateRangeOption = {
        aToday: 'aToday', //今天
        aYesterday: 'aYesterday', //昨天
        aRecent7Days: 'aRecent7Days', //最近7天
        aRecent14Days: 'aRecent14Days',//最近14天
        aRecent30Days: 'aRecent30Days', //最近30天
        aRecent90Days: 'aRecent90Days', //最近90天
        shortbtn: 0,	//是否显示快捷操作按钮
        /**
         * 开始日期
         * @type {string}
         */
        startDate: new Date(),
        /**
         * 结束日期
         * @type {string}
         */
        endDate: new Date(),
        startCompareDate: '', // 对比开始日期
        endCompareDate: '', // 对比结束日期
        minValidDate: '315507600', //最小可用时间，控制日期选择器的可选力度
        maxValidDate: '', // 最大可用时间，与stopToday 配置互斥
        success: (obj) => true, //回调函数，选择日期之后执行何种操作
        startDateId: 'startDate', // 开始日期输入框ID
        startCompareDateId: 'startCompareDate', // 对比开始日期输入框ID
        endDateId: 'endDate', // 结束日期输入框ID
        endCompareDateId: 'endCompareDate', // 对比结束日期输入框ID
        target: '', // 日期选择框的目标，一般为 <form> 的ID值
        needCompare: false, // 是否需要进行日期对比
        suffix: '', //相应控件的后缀
        inputTrigger: 'input_trigger',
        compareTrigger: 'compare_trigger',
        compareCheckboxId: 'needCompare', // 比较选择框
        calendars: 2, // 展示的月份数，最大是2
        calendarsChoose: 2,//2为开始时间和结束时间都需要选择才能确认
        dayRangeMax: 0, // 日期最大范围(以天计算)
        monthRangeMax: 12, // 日期最大范围(以月计算)
        dateTable: 'dateRangeDateTable', // 日期表格的CSS类
        selectCss: 'dateRangeSelected', // 时间选择的样式
        compareCss: 'dateRangeCompare', // 比较时间选择的样式
        coincideCss: 'dateRangeCoincide', // 重合部分的样式
        firstCss: 'first', //起始样式
        lastCss: 'last', //结束样式
        clickCss: 'today', //点击样式
        disableGray: 'dateRangeGray', // 非当前月的日期样式
        isToday: 'dateRangeToday', // 今天日期的样式
        joinLineId: 'joinLine',
        isSingleDay: false,  //是否单选日期  false：表示选择时间段，
        defaultText: ' 至 ',
        singleCompare: false,
        stopTodayBefore: false,//今天之前不可选
        stopToday: true,	//今天之后不可选
        isTodayValid: true,
        weekendDis: false, //灰掉周末不可选。
        disCertainDay: [], //不可用的周日期设置数组，如：[13]是要周一， 周三 两天不可选，每个周的周一，周三都不可选择。
        disCertainDate: [],//不可用的日期设置数组，如:[13]是要1号，3号 两天不可选，特别的，[true13]则反之，只有1，3可选，其余不可选。
        shortOpr: false, //结合单天日期选择的短操作，不需要确定和取消的操作按钮。
        noCalendar: false, //日期输入框是否展示
        theme: 'ta', //日期选择器的主题，目前支持 'gri' / 'ta'
        magicSelect: false, //用户自定义选择年、月，与{theme:ta}配合使用。
        autoCommit: false, //加载后立马自动提交
        autoSubmit: false, //是否显示确定，取消按钮，直接提交
        replaceBtn: 'btn_compare',
        singleDateRange: false, //默认多个对象
    };
    ref: HTMLInputElement;
    boxRef: HTMLDivElement;
    pickerDayRef: HTMLDivElement;
    selectYearRef: HTMLSelectElement;
    selectMonthRef: HTMLSelectElement;
    navAddRef: Element;
    navReduce: Element;
    btnYesRef: Element;
    btnNoRef: Element;
    days: Array<PickerDate> = [];
    calendaState = 0;

    firstDate: PickerDate;
    secondDate: PickerDate;

    windowEvent

    boxPosition = {
        inputPosition: {
            left: 0,
            top: 0
        },
        bodyHeight: 0,
        bodyWidth: 0,
        inputHeight: 0,
        inputWidth: 0,
        boxHeight: 0,
        boxWidth: 0,
    }

    setPosition() {
        let inputPo = PickerDateRange.getPosition(this.ref);
        let bodyH = self.document.body.clientHeight;
        let bodyW = self.document.body.clientWidth;
        let inputH = this.ref.clientHeight;
        let inputW = this.ref.clientWidth;
        let boxH = this.boxPosition.boxHeight;
        let boxW = this.boxPosition.boxWidth;

        this.boxPosition.inputPosition = inputPo;
        this.boxPosition.bodyHeight = bodyH;
        this.boxPosition.bodyWidth = bodyW;
        this.boxPosition.inputHeight = inputH;
        this.boxPosition.inputWidth = inputW;
        this.boxRef.style.left = '-1px';
        this.boxRef.style.zIndex = '999';

        if(inputPo.left + boxW > bodyW){
            this.boxRef.style.left = -Math.abs(boxW - inputW) + 1 + 'px';
        }
    }

    selected(data: PickerDate) {
        switch (this.option.calendars) {
            case 1:
                this.firstDate = data;
                this.secondDate = data;
                this.ref.value = data.format;

                this.option.success({
                    startCompareDate: null,
                    endCompareDate: null,
                    needCompare: null,
                    startDate: this.firstDate.format,
                    endDate: this.secondDate.format,
                })

                this.option.startDate = this.firstDate.date;
                this.option.endDate = this.secondDate.date;

                this.close();
                break;
            case 2:
                if (this.firstDate && this.secondDate) {
                    this.firstDate = null;
                    this.secondDate = null;
                }
                if (this.firstDate) {
                    this.secondDate = data;
                    data.type = 'second';
                    this.calendaState = 3;
                    if (this.firstDate.date.getTime() > this.secondDate.date.getTime()) {
                        let a = this.firstDate;
                        this.firstDate = this.secondDate;
                        this.secondDate = a;
                    }
                    this.changeFillDays();
                } else {
                    this.firstDate = data;
                    data.type = 'first';
                    data.selected = true;
                    this.calendaState = 2;
                    this.changeFillDays();
                }
                break;
        }
    }

    yearSelect(value, ref) {
        this.option.date.setFullYear(value);
        this.getFillDays();
    }

    monthSelect(value, ref) {
        this.option.date.setMonth(value);
        this.getFillDays();
    }

    static getSelectYear(year) {
        let array = [];
        for (let y = year - 40; y < year + 20; y++) {
            array.push(y);
        }
        return array;
    }

    changeFillDays() {
        if (this.pickerDayRef) {
            Array.from(this.pickerDayRef.childNodes).forEach((c: any, i) => {
                c.classList.remove('first', 'second', 'range', 'selected');
                let firstDayOfMonth = this.days[i].date;
                if (this.firstDate && this.secondDate) {
                    if (this.firstDate.date.getTime() == firstDayOfMonth.getTime()) {
                        c.classList.add('first');
                        c.classList.remove('selected')
                    }
                    if (this.secondDate.date.getTime() == firstDayOfMonth.getTime()) {
                        c.classList.add('second');
                        c.classList.remove('selected')
                    }
                    if (this.firstDate.date.getTime() < firstDayOfMonth.getTime() && this.secondDate.date.getTime() > firstDayOfMonth.getTime()) {
                        c.classList.add('range');
                        c.classList.remove('selected')
                    }
                    if (this.firstDate.date.getTime() == this.secondDate.date.getTime() && this.secondDate.date.getTime() == firstDayOfMonth.getTime()) {
                        c.classList.remove('first', 'second', 'range');
                        c.classList.add('selected')
                    }
                }
                if (this.firstDate && !this.secondDate) {
                    if (this.firstDate.date.getTime() == firstDayOfMonth.getTime()) {
                        c.classList.add('selected')
                    }
                }
            })
        }
    }

    /**
     * 当月的日期 渲染日期
     */
    getFillDays() {
        let d = this.option.date;
        let firstDayOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
        this.days.length = 0;
        do {
            let day: PickerDate = {
                year: firstDayOfMonth.getFullYear(),
                month: firstDayOfMonth.getMonth(),
                day: firstDayOfMonth.getDate(),
                week: firstDayOfMonth.getDay(),
                date: new Date(firstDayOfMonth),
                format: firstDayOfMonth.formatDate('yyyy-MM-dd'),
            };
            if (this.firstDate && this.secondDate) {
                if (this.firstDate.date.getTime() == firstDayOfMonth.getTime()) {
                    day.type = 'first'
                }
                if (this.secondDate.date.getTime() == firstDayOfMonth.getTime()) {
                    day.type = 'second'
                }
                if (this.firstDate.date.getTime() < firstDayOfMonth.getTime() && this.secondDate.date.getTime() > firstDayOfMonth.getTime()) {
                    day.type = 'range'
                }
                if (this.firstDate.date.getTime() == this.secondDate.date.getTime() && this.secondDate.date.getTime() == firstDayOfMonth.getTime()) {
                    day.selected = true;
                    day.type = null;
                }
            }
            if (this.firstDate && !this.secondDate) {
                if (this.firstDate.date.getTime() == firstDayOfMonth.getTime()) {
                    day.selected = true
                }
            }
            this.days.push(day);
            firstDayOfMonth.calendar(1, 1);
        }
        while (firstDayOfMonth.getDate() != 1);

        let w1 = this.days[0].week;
        firstDayOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
        while (w1 > 1) {
            firstDayOfMonth.calendar(1, -1);
            this.days.unshift({
                year: firstDayOfMonth.getFullYear(),
                month: firstDayOfMonth.getMonth(),
                day: firstDayOfMonth.getDate(),
                week: firstDayOfMonth.getDay(),
                date: new Date(firstDayOfMonth),
                format: firstDayOfMonth.formatDate('yyyy-MM-dd'),
                disabled: true,
            });
            w1--
        }

        let w2 = this.days[this.days.length - 1].week;
        firstDayOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        while (w2 != 0) {
            firstDayOfMonth.calendar(1, 1);
            this.days.push({
                year: firstDayOfMonth.getFullYear(),
                month: firstDayOfMonth.getMonth(),
                day: firstDayOfMonth.getDate(),
                week: firstDayOfMonth.getDay(),
                date: new Date(firstDayOfMonth),
                format: firstDayOfMonth.formatDate('yyyy-MM-dd'),
                disabled: true,
            });
            w2++;
            if (w2 > 6) w2 = 0;
        }

        //selected
        if (this.pickerDayRef) this.pickerDayRef.innerHTML = this.days.map((day, i) => {
            return `<span  data-index="${i}"  class="day-item${day.disabled ? ' disabled' : ''}${day.type == 'first' ? ' first' : ''}${day.type == 'second' ? ' second' : ''}${day.type == 'range' ? ' range' : ''}${day.selected ? ' selected' : ''}">${day.day}</span>`
        }).join('');

        if (this.selectYearRef) {
            this.selectYearRef.value = String(d.getFullYear())
        }
        if (this.selectMonthRef) {
            this.selectMonthRef.value = String(d.getMonth())
        }
    }

    show() {
        if (this.calendaState == 1) return;
        this.option.date = new Date(this.option.endDate);
        this.firstDate = PickerDateRange.getPickerDate(this.option.startDate);
        this.secondDate = PickerDateRange.getPickerDate(this.option.endDate);

        this.getFillDays();
        this.calendaState = 1
        this.boxRef.style.display = 'block'
    }

    close() {
        this.firstDate = null;
        this.secondDate = null;
        this.calendaState = 0;
        this.boxRef.style.display = 'none';
    }

    static getPickerDate(date = new Date()) {
        return {
            format: date.formatDate('yyyy-MM-dd'),
            month: date.getMonth(),
            date: date,
            year: date.getFullYear(),
            week: date.getDay(),
            day: date.getDate(),
        }
    }

    static getPosition(element) {
        let actualTop = element.offsetTop;
        let actualLeft = element.offsetLeft;
        let current = element.offsetParent;

        while (current !== null) {
            actualLeft += current.offsetLeft;
            actualTop += current.offsetTop;
            current = current.offsetParent;
        }
        return {
            top: actualTop,
            left: actualLeft
        }
    }

    destroy() {
        this.ref.parentNode.removeChild(this.boxRef);
        // self.document.body.removeChild(this.boxRef);
        this.windowEvent && this.windowEvent();
    }

    setValue(data: PickerValue) {
        this.option.startDate = data.startDate;
        this.option.endDate = data.endDate;
        this.defaultOption();
        this.firstDate = PickerDateRange.getPickerDate(this.option.startDate);
        this.secondDate = PickerDateRange.getPickerDate(this.option.endDate);
        this.getFillDays();
        if (this.option.calendars == 2 || !this.option.isSingleDay) {
            this.ref.value = `${this.firstDate.format}${this.option.defaultText}${this.secondDate.format}`;
        } else {
            this.ref.value = this.secondDate.format;
        }
    }
}

window['pickerDateRange'] = PickerDateRange;
/*let p = new window['pickerDateRange']('pickerDateRange', {
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

setTimeout(()=> {
    p.setValue({
        startDate:'2015-5-12',
        endDate:'2016-5-12',
    })
},2000)*/
