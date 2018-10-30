//弹出一个列出千园列表的窗体
Sandcastle.addToolbarButton('显示千园场景',function(){
      var win = new Ext.Window({
            title:'千园',
            layout:'fit',       //弹出窗口内布局会充满整个窗口;
            width:300,          //设置窗口大小;
            height:500,
            closeAction:'hide', //点击右上角关闭按钮后会执行的操作;
            closable:true,     //隐藏关闭按钮;
            minimizable:true,
            draggable:true,     //窗口可拖动;
            items:[panel],         //默认会生成Ext.Panel类型的对象;并且随窗口大小改变而改变;
            buttons:[],
            x: 170,
            y: 10,
            listeners : { 
                close : function(window) { 
                    // var delObj = document.getElementById(window.button.id); 
                    // delObj.parentNode.parentNode.removeChild(delObj.parentNode); 
                } 
            }
          });
       win.show();
},"toolbar");


		//可以进行再次格式化
        function renderTitle(value, p, record) {
            return value ? Ext.String.format(
                '<a href="#" target="_blank">{0}</a>',
                '定位'
            ) : '';
        }
        //对TreeModel进行扩展
        Ext.define('Post', {
            extend: 'Ext.data.TreeModel',
            idProperty: 'postid',
            fields: [{
                name: "postid",
                convert: undefined
            }, {
                name: "declare_subject",
                convert: undefined
            },
            {
                name: "longitude",
                convert: undefined
            },
            {
                name: "latitude",
                convert: undefined
            },
            {
                name: "height",
                convert: undefined
            },
            {
                name: "heading",
                convert: undefined
            },
            {
                name: "pitch",
                convert: undefined
            },
            {
                name: "roll",
                convert: undefined
            }]
        });
          var store = Ext.create('Ext.data.TreeStore', {
            model: 'Post',
            proxy: {
                type: 'ajax',
                reader: 'json',
                url: './static/data/qianyuan.json'
            },
            lazyFill: true
        });
        var panel = Ext.create('Ext.tree.Panel', {
            //title: 'Forum Folder Summary',
            reserveScrollbar: true,
            loadMask: true,
            useArrows: true,
            store: store,
            rootVisible: false,
            animate: true,
            listeners: {
                    itemdblclick:function(that,record, item, index, e, eOpts){
                        if(record.isLeaf()){
                            var longitude = record.data.longitude;
                            var latitude = record.data.latitude;
                            var height = record.data.height;
                            var heading = record.data.heading;
                            var pitch = record.data.pitch;
                            var roll = record.data.roll;
                            var cameraInfo = [longitude, latitude, height, heading, pitch, roll];
                            Freedo.FdCamera.flyToByCameraInfo(viewer.scene.camera, cameraInfo) ;
                        }
                        e.stopEvent;
                    }
                 }
        });