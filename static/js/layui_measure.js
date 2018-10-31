		
layui.use(['layer'], function(){
    var $ = layui.jquery, layer = layui.layer; 
    var am = new Cesium.MeasureManager(viewer);
    $(".layui-btn-point").click(function(event) {
        am.start('Point');
    });
    $(".layui-btn-distance").click(function(event) {
        am.start('Polyline');
    });
    $(".layui-btn-height").click(function(event) {
         am.start('Height');
    });
    $(".layui-btn-area").click(function(event) {
        am.start('Polygon');
    });
    $(".layui-btn-angle").click(function(event) {
         am.start('Angle');
    });
    $(".layui-btn-cancel").click(function(event) {
        am.clearEffects();
    });
    $(".layui-btn-clear").click(function(event) {
        am.clearDrawingBoard();
    });
    $(".layui-btn-measure").hide();
    var flag = false;
    Sandcastle.addToolbarButton("空间测量",function(){
            if(!flag){
                $(".layui-btn-measure").show();
            }else{
                $(".layui-btn-measure").hide();
            }
             flag = !flag;
  },"toolbar");
});