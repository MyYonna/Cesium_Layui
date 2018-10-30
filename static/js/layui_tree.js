layui.use(['layer','tree'], function(){ //独立版的layer无需执行这一句
  var $ = layui.jquery, layer = layui.layer; //独立版的layer无需执行这一句

 function openTreeWindow(){
  loadTree();
  var that = this; 
  //多窗口模式，层叠置顶
  layer.open({
     type: 1 //此处以iframe举例
    ,title: '千园园区'
    ,area: ['390px', '260px']
    ,shade: 0
    ,maxmin: true
    ,offset: [ //为了演示，随机坐标
       170
      ,10
    ] 
    ,content: $("#parkinfo_tree")
    ,btn: ['刷新', '关闭'] //只是为了演示
    ,yes: function(){
      console.log("reloadData")
    }
    ,btn2: function(){
      layer.closeAll();
    }
    ,zIndex: layer.zIndex //重点1
    ,success: function(layero){
      layer.setTop(layero); //重点2
    }
  });
}
function loadTree(){
   var index=null;
    $.ajax({
      url : './static/data/QianYuanParkInfo.json',
      type : 'get',
      // dataType : 'json',
     //  data:{},
      beforeSend: function (request) {
       index = layer.load();
      },
      success : function(jsonObject) {
          layer.close(index);
          layui.tree({
           elem: '#parkinfo_tree', //传入元素选择器
           nodes:jsonObject,
          click: function(node){
                if(node.leaf){
                    var longitude = node.longitude;
                    var latitude = node.latitude;
                    var height = node.height;
                    var heading = node.heading;
                    var pitch = node.pitch;
                    var roll = node.roll;
                    var cameraInfo = [longitude, latitude, height, heading, pitch, roll];
                    var camera = viewer.scene.camera;
                    camera.flyToByCameraInfo(cameraInfo);
                }
          }  
        });
      } ,
      error:function(e){
            layer.close(index);
      }               
    });
  }
  Sandcastle.addToolbarButton("显示千园场景",function(){
  	openTreeWindow();
  },"toolbar");


});
