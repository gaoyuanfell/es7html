/**
 * path：app目录下的子项目
 * output：打包后的目标目录
 * publicPath：静态资源目录
 * name：入口函数文件名称，service页面对应的名称，开发环境不能重复
 * title：页面标题
 */
module.exports = [
    {
        path:'ruzhu',
        output:'ruzhu',
        publicPath: '/',
        name:'ruzhu-index',
        title:'乐橙互联科技有限公司'
    },
    {
        path:'lcinc',
        output:'lcinc',
        publicPath:'/',
        name:'lcinc-index',
        title:'乐橙互联科技有限公司'
    },
    {
        path:'lcinc-activity',
        output:'lcinc-activity',
        publicPath:'/',
        name:'activity-index',
        title:'乐橙互联科技有限公司'
    }
];
