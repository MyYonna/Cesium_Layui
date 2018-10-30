// layui.use(['layer'], function(){
//     var $ = layui.jquery, layer = layui.layer; 
//         var scene = viewer.scene;
//         var drawHelper = new DrawHelper(viewer);
//     $(".layui-btn-marker").click(function(event) {
//         var b = new Cesium.BillboardCollection();
//             scene.primitives.add(b);
//             var billboard = b.add({
//                 show : true,
//                 position : event.position,
//                 pixelOffset : new Cesium.Cartesian2(0, 0),
//                 eyeOffset : new Cesium.Cartesian3(0.0, 0.0, 0.0),
//                 horizontalOrigin : Cesium.HorizontalOrigin.CENTER,
//                 verticalOrigin : Cesium.VerticalOrigin.CENTER,
//                 scale : 1.0,
//                 image: './img/glyphicons_242_google_maps.png',
//                 color : new Cesium.Color(1.0, 1.0, 1.0, 1.0)
//             });
//             billboard.setEditable();
//     });
//     $(".layui-btn-polyline").click(function(event) {
//             var polyline = new DrawHelper.PolylinePrimitive({
//                 positions: event.positions,
//                 width: 5,
//                 geodesic: true
//             });
//             scene.primitives.add(polyline);
//             polyline.setEditable();
//             polyline.addListener('onEdited', function(event) {
//                 console.log('Polyline edited, ' + event.positions.length + ' points');
//             });
//     });
//     $(".layui-btn-polygon").click(function(event) {
//             var polygon = new DrawHelper.PolygonPrimitive({
//                 positions: event.positions,
//                 material : Cesium.Material.fromType('Checkerboard')
//             });
//             scene.primitives.add(polygon);
//             polygon.setEditable();
//             polygon.addListener('onEdited', function(event) {
//                 console.log('Polygon edited, ' + event.positions.length + ' points');
//             });
//     });
//     $(".layui-btn-circle").click(function(event) {
//             var circle = new DrawHelper.CirclePrimitive({
//                 center: event.center,
//                 radius: event.radius,
//                 material: Cesium.Material.fromType(Cesium.Material.RimLightingType)
//             });
//             scene.primitives.add(circle);
//             circle.setEditable();
//             circle.addListener('onEdited', function(event) {
//                 console.log('Circle edited: radius is ' + event.radius.toFixed(1) + ' meters');
//             });
//     });
//     $(".layui-btn-extent").click(function(event) {
//     		var extent = event.extent;
//             var extentPrimitive = new DrawHelper.ExtentPrimitive({
//                 extent: extent,
//                 material: Cesium.Material.fromType(Cesium.Material.StripeType)
//             });
//             scene.primitives.add(extentPrimitive);
//             extentPrimitive.setEditable();
//             extentPrimitive.addListener('onEdited', function(event) {
//                 console.log('Extent edited: extent is (N: ' + event.extent.north.toFixed(3) + ', E: ' + event.extent.east.toFixed(3) + ', S: ' + event.extent.south.toFixed(3) + ', W: ' + event.extent.west.toFixed(3) + ')');
//             });
//     });
// });
	    // var cesiumWidget = new Cesium.CesiumWidget('cesiumContainer', {scene3DOnly: true});
	    var scene = viewer.scene;
        // var scene = cesiumWidget.scene;
        var drawHelper = new DrawHelper(viewer);
        var toolbar = drawHelper.addToolbar(document.getElementById("parkinfo"), {
            buttons: ['marker', 'polyline', 'polygon', 'circle', 'extent']
        });
        toolbar.addListener('markerCreated', function(event) {
            console.log('Marker created at ' + event.position.toString());
            // create one common billboard collection for all billboards
            var b = new Cesium.BillboardCollection();
            scene.primitives.add(b);
            var billboard = b.add({
                show : true,
                position : event.position,
                pixelOffset : new Cesium.Cartesian2(0, 0),
                eyeOffset : new Cesium.Cartesian3(0.0, 0.0, 0.0),
                horizontalOrigin : Cesium.HorizontalOrigin.CENTER,
                verticalOrigin : Cesium.VerticalOrigin.CENTER,
                scale : 1.0,
                image: './img/glyphicons_242_google_maps.png',
                color : new Cesium.Color(1.0, 1.0, 1.0, 1.0)
            });
            billboard.setEditable();
        });
        toolbar.addListener('polylineCreated', function(event) {
            console.log('Polyline created with ' + event.positions.length + ' points');
            var polyline = new DrawHelper.PolylinePrimitive({
                positions: event.positions,
                width: 5,
                geodesic: true
            });
            scene.primitives.add(polyline);
            polyline.setEditable();
            polyline.addListener('onEdited', function(event) {
                console.log('Polyline edited, ' + event.positions.length + ' points');
            });

        });
        toolbar.addListener('polygonCreated', function(event) {
            console.log('Polygon created with ' + event.positions.length + ' points');
            var polygon = new DrawHelper.PolygonPrimitive({
                positions: event.positions,
                material : Cesium.Material.fromType('Checkerboard')
            });
            scene.primitives.add(polygon);
            polygon.setEditable();
            polygon.addListener('onEdited', function(event) {
                console.log('Polygon edited, ' + event.positions.length + ' points');
            });

        });
        toolbar.addListener('circleCreated', function(event) {
            console.log('Circle created: center is ' + event.center.toString() + ' and radius is ' + event.radius.toFixed(1) + ' meters');
            var circle = new DrawHelper.CirclePrimitive({
                center: event.center,
                radius: event.radius,
                material: Cesium.Material.fromType(Cesium.Material.RimLightingType)
            });
            scene.primitives.add(circle);
            circle.setEditable();
            circle.addListener('onEdited', function(event) {
                console.log('Circle edited: radius is ' + event.radius.toFixed(1) + ' meters');
            });
        });
        toolbar.addListener('extentCreated', function(event) {
            var extent = event.extent;
            console.log('Extent created (N: ' + extent.north.toFixed(3) + ', E: ' + extent.east.toFixed(3) + ', S: ' + extent.south.toFixed(3) + ', W: ' + extent.west.toFixed(3) + ')');
            var extentPrimitive = new DrawHelper.ExtentPrimitive({
                extent: extent,
                material: Cesium.Material.fromType(Cesium.Material.StripeType)
            });
            scene.primitives.add(extentPrimitive);
            extentPrimitive.setEditable();
            extentPrimitive.addListener('onEdited', function(event) {
                console.log('Extent edited: extent is (N: ' + event.extent.north.toFixed(3) + ', E: ' + event.extent.east.toFixed(3) + ', S: ' + event.extent.south.toFixed(3) + ', W: ' + event.extent.west.toFixed(3) + ')');
            });
        });