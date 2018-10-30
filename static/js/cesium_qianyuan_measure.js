		
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
        
    });
    $(".layui-btn-cancel").click(function(event) {
        am.clearEffects();
    });
    $(".layui-btn-clear").click(function(event) {
        am.clearDrawingBoard();
    });
});