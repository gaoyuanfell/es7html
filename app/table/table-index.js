import '../../common/css/base.less'
import './css/index.less'


export class Table {
    constructor(id, config) {
        this.ref = window.document.querySelector(id);
        Object.assign(this.defaultConfig, config);
        config.checkedItems = this.checkedItems.bind(this);
        config.setHeadRowCol = this.setHeadRowCol.bind(this);
        config.setRowCol = this.setRowCol.bind(this);
        this.sortListFn();
        this.box();
        this.tableScrollInit();

    }


    defaultConfig = {
        cols: [],
        autoLoad: true,
        remoteSort: true,
        sortName: undefined,
        sortStatus: undefined,
        loadingText: '正在载入...',
        noDataText: '没有符合条件的任何数据',
        loadErrorText: '数据加载出现异常',
        multiSelect: false,
        checkedItems: () => {
        },
        setHeadRowCol: () => {
        },
        setRowCol: () => {
        },
        clickEvent: () => {
        },
    }

    ref
    tableWrapRef
    theadTrRef;
    tbodyRef;

    box() {
        this.tableWrapRef = window.document.createElement('div');
        this.tableWrapRef.classList.add('table-wrap')
        this.ref.appendChild(this.tableWrapRef)

        let tableRef = window.document.createElement('table');
        this.tableWrapRef.appendChild(tableRef)
        let theadRef = window.document.createElement('thead');
        let tbodyRef = this.tbodyRef = window.document.createElement('tbody');
        tableRef.appendChild(theadRef)
        tableRef.appendChild(tbodyRef)

        let theadTrRef = this.theadTrRef = window.document.createElement('tr');
        theadRef.appendChild(theadTrRef)
        this.headCols();

        this.bodyCols()
    }

    checkedItems() {

    }

    setHeadRowCol() {

    }

    sortListFn(){
        if (this.defaultConfig && this.defaultConfig.cols instanceof Array) {
            let list = [];
            let list2 = [];
            this.defaultConfig.cols.every((col, i) => {
                if (col.translate) {
                    list.push(col);
                } else {
                    list2.push(col);
                }
                return true;
            });
            this.defaultConfig.cols = [...list, ...list2];
            this.defaultConfig.cols.forEach(c => {
                if (c.renderer) {
                    let fun = c.renderer;
                    c.renderer = (val, item, index) => {
                        return fun(val, item, index) || ''
                    }
                } else {
                    c.renderer = (val, item, index) => val || ''
                }
            })
        }
    }

    setRowCol(index, deleteCount, data) {
        this.defaultConfig.cols.splice(index, deleteCount, data)
        this.sortListFn();
        this.headCols();
        this.bodyCols();
    }

    headCols() {
        let trRef = this.theadTrRef;
        trRef.innerHTML = '';
        let cols = this.defaultConfig.cols;
        cols.every(h => {
            let td = window.document.createElement('td');
            if (h.translate) {
                td.classList.add('col_fixed', 'js-col_fixed')
            }
            if (h.hidden) {
                td.style.display = 'none';
            }

            if (h.icon) {
                let i = window.document.createElement('i');
                i.classList.add('yc-icon');
                i.title = h.tip;
                i.innerHTML = h.icon;
                td.appendChild(i)
            }

            if (h.sort) {
                let a = window.document.createElement('a');
                a.onclick = () => {
                    this.sort(h);
                };
                let span = window.document.createElement('span');
                span.innerHTML = h.title;
                a.appendChild(span);

                if (h.sortType === 'asc') {
                    let i = window.document.createElement('i');
                    i.classList.add('yc-icon');
                    i.innerHTML = '&#xe6c1;';
                    a.appendChild(i)
                }

                if (h.sortType === 'desc') {
                    let i = window.document.createElement('i');
                    i.classList.add('yc-icon');
                    i.innerHTML = '&#xe6c0;';
                    a.appendChild(i)
                }

                let i = window.document.createElement('i');
                i.classList.add('icon', 'ico-help');
                a.appendChild(i);
                td.appendChild(a);

            } else {
                let span = window.document.createElement('span');
                span.innerHTML = h.title;
                td.appendChild(span)
            }
            td.style.minWidth = '120px';
            if(h.width) {
                td.style.width = h.width + 'px';
            }
            trRef.appendChild(td);
            return true;
        })
    }

    bodyCols() {
        let tbodyRef = this.tbodyRef;
        tbodyRef.innerHTML = '';
        if (!(this.list instanceof Array)) return;
        this.list.forEach((l, i) => {
            let tr = window.document.createElement('tr');
            tr.onclick = (event)=> {
                this.rowClick(event,tr,l,i)
            };
            this.defaultConfig.cols.forEach(h => {
                let td = window.document.createElement('td');
                if (h.translate) {
                    td.classList.add('col_fixed', 'js-col_fixed');
                }
                if (h.hidden) {
                    td.style.display = 'none';
                }
                td.innerHTML = h.renderer(l[h.name], l, i);
                tr.appendChild(td);
            });
            tbodyRef.appendChild(tr);
        })
    }

    _list;
    set list(val) {
        this._list = val;
        this.bodyCols();
    }

    get list() {
        return this._list;
    }

    sortList = [];

    rowClick(e, ref, item, index){
        let target = e.target;
        let dataset = target.dataset;
        if (dataset.event === 'click' || dataset.action) {
            this.defaultConfig.clickEvent && this.defaultConfig.clickEvent.bind(this)({
                ref: ref,
                target: target,
                action: dataset.action,
                item: item,
                index: index
            })
        }
    }

    sort(data) {
        if (this.sortList.length > 0 && this.sortList[0] !== data) {
            this.sortList[0].sortType = null;
            this.sortList.length = 0;
        }
        this.sortList.push(data);
        if (data.sortType === 'desc') {
            data.sortType = 'asc'
        } else if (data.sortType === 'asc') {
            data.sortType = 'desc'
        } else {
            data.sortType = 'desc'
        }
        this.headCols();
    }

    tableScrollInit() {
        let warp = this.tableWrapRef;
        warp.onscroll = (event) => {
            let left = event.target.scrollLeft;
            this.tdFixed(Array.from(warp.querySelectorAll('thead tr .js-col_fixed')), left);
            Array.from(warp.querySelectorAll('tbody tr')).every(tr => {
                this.tdFixed(Array.from(tr.querySelectorAll('.js-col_fixed')), left);
                return true;
            })
        }
    }

    tdFixed(refs, left) {
        refs.every((ref, index) => {
            ref.style.left = `${left}px`;
            if (index + 1 === refs.length) {
                if (left > 0) {
                    ref.classList.add('col_fixed_border')
                } else {
                    ref.classList.remove('col_fixed_border')
                }
            }
            return true;
        })
    }
}

let table = new Table('#table', {
    cols: [
        {title: '计划名称1', name: 'a', align: 'center', translate: true, disabled: true, icon: '&#xe600;', tip: '活动名称长度不能低于4个字符且帐号下的活动名称不允许重复'},
        {title: '计划名称2', name: 'b', align: 'center', translate: true, disabled: true},
        {
            title: '操作',
            name: 'a',
            align: 'center',
            renderer: (val, item, index) => {
                return `
                        <a data-action="edit" href="javascript:;">修改</a>
                        <a data-action="delete" >删除</a>
                    `
            }
        },
        {
            title: '计划名称c',
            name: 'c',
            align: 'center',
            sort: true,
            renderer: (val, item, index) => {
                return `<a>${val + index}</a>`
            }
        },
        {title: '计划名称d', name: 'd', align: 'center', sort: true,},
        {title: '计划名称e', name: 'e', align: 'center', hidden: true},
        {title: '计划名称f', name: 'f', align: 'center'},
        {title: '计划名称g', name: 'g', align: 'center', translate: true},
        {title: '计划名称h', name: 'h', align: 'center'},
        {title: '计划名称i', name: 'i', align: 'center'},
        {title: '计划名称j', name: 'j', align: 'center'},
        {title: '计划名称k', name: 'k', align: 'center'},
        {title: '计划名称l', name: 'l', align: 'center'},
        {title: '计划名称m', name: 'm', align: 'center'},
        {title: '计划名称n', name: 'n', align: 'center'},
    ],
    clickEvent: function ({ref, target, action, item, index})  {
        switch (action) {
            case 'edit':
                console.info(target);
                console.info(index);
                console.info(this);
                break;
            case 'delete':
                console.info(target);
                console.info(index);
                break;
        }
    }
});

table.list = [
    {a: '计划名称01', b: '计划名称2', c: '计划名称c', d: '计划名称d', e: '计划名称e', f: '计划名称f', g: '计划名称g', h: '计划名称h', i: '计划名称i', j: '计划名称j', k: '计划名称k', l: '计划名称l', m: '计划名称m', n: '计划名称n'},
    {a: '计划名称02', b: '计划名称2', c: '计划名称c', d: '计划名称d', e: '计划名称e', f: '计划名称f', g: '计划名称g', h: '计划名称h', i: '计划名称i', j: '计划名称j', k: '计划名称k', l: '计划名称l', m: '计划名称m', n: '计划名称n'},
    {a: '计划名称03', b: '计划名称2', c: '计划名称c', d: '计划名称d', e: '计划名称e', f: '计划名称f', g: '计划名称g', h: '计划名称h', i: '计划名称i', j: '计划名称j', k: '计划名称k', l: '计划名称l', m: '计划名称m', n: '计划名称n'},
    {a: '计划名称04', b: '计划名称2', c: '计划名称c', d: '计划名称d', e: '计划名称e', f: '计划名称f', g: '计划名称g', h: '计划名称h', i: '计划名称i', j: '计划名称j', k: '计划名称k', l: '计划名称l', m: '计划名称m', n: '计划名称n'},
    {a: '计划名称05', b: '计划名称2', c: '计划名称c', d: '计划名称d', e: '计划名称e', f: '计划名称f', g: '计划名称g', h: '计划名称h', i: '计划名称i', j: '计划名称j', k: '计划名称k', l: '计划名称l', m: '计划名称m', n: '计划名称n'},
    {a: '计划名称06', b: '计划名称2', c: '计划名称c', d: '计划名称d', e: '计划名称e', f: '计划名称f', g: '计划名称g', h: '计划名称h', i: '计划名称i', j: '计划名称j', k: '计划名称k', l: '计划名称l', m: '计划名称m', n: '计划名称n'},
    {a: '计划名称07', b: '计划名称2', c: '计划名称c', d: '计划名称d', e: '计划名称e', f: '计划名称f', g: '计划名称g', h: '计划名称h', i: '计划名称i', j: '计划名称j', k: '计划名称k', l: '计划名称l', m: '计划名称m', n: '计划名称n'},
    {a: '计划名称08', b: '计划名称2', c: '计划名称c', d: '计划名称d', e: '计划名称e', f: '计划名称f', g: '计划名称g', h: '计划名称h', i: '计划名称i', j: '计划名称j', k: '计划名称k', l: '计划名称l', m: '计划名称m', n: '计划名称n'},
    {a: '计划名称09', b: '计划名称2', c: '计划名称c', d: '计划名称d', e: '计划名称e', f: '计划名称f', g: '计划名称g', h: '计划名称h', i: '计划名称i', j: '计划名称j', k: '计划名称k', l: '计划名称l', m: '计划名称m', n: '计划名称n'},
    {a: '计划名称10', b: '计划名称2', c: '计划名称c', d: '计划名称d', e: '计划名称e', f: '计划名称f', g: '计划名称g', h: '计划名称h', i: '计划名称i', j: '计划名称j', k: '计划名称k', l: '计划名称l', m: '计划名称m', n: '计划名称n'},
]

table.setRowCol(0,0,{title: '计划名称n11', name: 'n', align: 'center',translate:true})
