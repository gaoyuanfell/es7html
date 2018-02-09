import '../../common/css/base.less'
import './css/index.less'


export class Table {
    constructor(id, config) {
        this.ref = window.document.querySelector(id);
        Object.assign(this.defaultConfig, config);
        config.checkedItems = this.checkedItems.bind(this);
        config.setHeadRowCol = this.setHeadRowCol.bind(this);
        config.setRowCol = this.setRowCol.bind(this);

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
                c.hidden = !c.hidden;
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

        // let html = `
        //     <div class="table-wrap">
        //         <div class="head-row-col" style="display: none">
        //
        //         </div>
        //         <table>
        //             <thead>
        //                 <tr>
        //                     ${this.headCols()}
        //                 </tr>
        //             </thead>
        //             <tbody>
        //
        //             </tbody>
        //         </table>
        //     </div>
        // `
        //
        // this.ref.innerHTML = html;
        // this.tableWrapRef = this.ref.querySelector('.table-wrap')
        this.box();
        this.tableScrollInit();

    }

    ref
    tableWrapRef


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

    theadTrRef

    box() {
        this.tableWrapRef = window.document.createElement('div');
        this.tableWrapRef.classList.add('table-wrap')
        this.ref.appendChild(this.tableWrapRef)

        let tableRef = window.document.createElement('table');
        this.tableWrapRef.appendChild(tableRef)
        let theadRef = window.document.createElement('thead');
        let tbodyRef = window.document.createElement('tbody');
        tableRef.appendChild(theadRef)
        tableRef.appendChild(tbodyRef)

        let theadTrRef = this.theadTrRef = window.document.createElement('tr');
        theadRef.appendChild(theadTrRef)
        this.headCols();

    }

    checkedItems() {

    }

    setHeadRowCol() {

    }

    setRowCol() {

    }

    headCols() {
        let trRef = this.theadTrRef
        trRef.innerHTML = '';
        let cols = this.defaultConfig.cols;
        cols.every(h => {
            let td = window.document.createElement('td');
            if (h.translate) {
                td.classList.add('col_fixed', 'js-col_fixed')
            }
            if (!h.hidden) {
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
            trRef.appendChild(td);
            return true;
        })


        // let cols = this.defaultConfig.cols;
        // let ht = cols.map(h => {
        //     return `
        //         <td class="${h.translate ? 'col_fixed js-col_fixed' : ''}" ${!h.hidden ? 'style="display:none"' : ''}>
        //             <i class="yc-icon" ${!h.icon ? 'style="display:none"' : ''} title="${h.tip}">${h.icon}</i>
        //             <span ${h.sort ? 'style="display:none"' : ''}>${h.title}</span>
        //             <a ${!h.sort ? 'style="display:none"' : ''} href="javascript:;" (click)="sort(h)">
        //                 <span>${h.title}</span>
        //                 <i class="yc-icon ico-sort-up" ${(!h.sortType === 'asc' || !h.sortType) ? 'style="display:none"' : ''}><i>&#xe6c1;</i></i>
        //                 <i class="yc-icon ico-sort-down" ${(!h.sortType === 'desc' || !h.sortType) ? 'style="display:none"' : ''}><i>&#xe6c0;</i></i>
        //             </a>
        //             <i ${!h.sort ? 'style="display:none"' : ''} class="icon ico-help"><i></i></i>
        //         </td>
        //     `
        // })
        // if(this.defaultConfig.multiSelect){
        //     ht.unshift(`
        //         <td class="col_fixed js-col_fixed">
        //             <input type="checkbox">
        //         </td>
        //     `)
        // }
        // return ht.join('');
    }

    sortList = [];

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
        console.info(data);
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

new Table('#table', {
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
    clickEvent: ({ref, target, action, item, index}) => {
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
})
