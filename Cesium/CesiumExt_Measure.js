(function(Cesium){
    
    function MeasureManager(viewer){
      this.viewer = viewer;
      this.scene =  viewer.scene;
      this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    }
    MeasureManager.prototype.tempEntities = [];
    MeasureManager.prototype.tooltip = null;
    MeasureManager.prototype.handler = null;
    //开始测量
    MeasureManager.prototype.start = function(mode){
        this.setMeasureMode(mode);
    }

    MeasureManager.prototype.setMeasureMode = function(mode){
        switch (mode) {
            case "Point": 
                this.startPickPosition();
                break;
            case "Polygon":
                this.startDrawPolygon();
                break;
            case "Polyline":
                this.startClampGroundPolyline();
                break;
            case "Height":
                this.startSpaceMeasure();
                break;
            case "Angle":
                this.startAngleMeasure();
                break;
            default:
                // statements_def
                break;
        }
    }
        //点位测量
    MeasureManager.prototype.startPickPosition = function(){
        var _this = this;
        _this.clearEffects();
        this.handler = new Cesium.ScreenSpaceEventHandler(this.scene.canvas);
        _this.tooltip = this.createToolTip();
        var cartesian = null;
        this.handler.setInputAction(function(movement){
            _this.tooltip.style.left = movement.endPosition.x - 50 + "px";
            _this.tooltip.style.top = movement.endPosition.y - 80 + "px";
            _this.tooltip.innerHTML ='<p>双击结束</p>';
             cartesian = _this.transformWindowPositionToCartesian(movement.endPosition);
            var cartographic = _this.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
            var longitude = Cesium.Math.toDegrees(cartographic.longitude).toFixed(2);
            var latitude = Cesium.Math.toDegrees(cartographic.latitude).toFixed(2);
            var height = cartographic.height.toFixed(2);
            var coorInfo ="<div class='coorinfo'><p>经度："+longitude+"</p>"+"<p>纬度："+latitude+"</p>"+"<p>高度："+height+"</p></div>"
            _this.tooltip.innerHTML = coorInfo ;   
        },Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        this.handler.setInputAction(function (movement) {
                _this.tooltip.style.display = 'none'
                _this.drawBillboard(cartesian)
                var cartographic = _this.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
                var longitude = Cesium.Math.toDegrees(cartographic.longitude).toFixed(2);
                var latitude = Cesium.Math.toDegrees(cartographic.latitude).toFixed(2);
                var height = cartographic.height.toFixed(2);
                var text = "经度："+longitude+"\n纬度："+latitude+"\n高度："+height;
                _this.drawLabel(cartesian,text);
                _this.clearEffects();
            }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    }
    //角度测量
    MeasureManager.prototype.startAngleMeasure = function(){
            var _this = this;
            _this.clearEffects();
            var tempPoints = [];
            var label_entitys = [];
            var positionss = [];
            var polyline_entitys = [];
            _this.tooltip = this.createToolTip();
            var cartesian = null;
            this.handler = new Cesium.ScreenSpaceEventHandler(this.scene.canvas);
            //左键单击
            this.handler.setInputAction(function (movement) {
                cartesian = _this.transformWindowPositionToCartesian(movement.position);
                positions = [];
                if (cartesian) {
                    tempPoints.push(cartesian);
                    var position = [];
                    positions.push(cartesian);
                    positions.push(cartesian.clone());
                    positionss.push(positions);
                    _this.drawPoint(cartesian);
                    
                } 
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
            //移动
            this.handler.setInputAction(function(movement){
                _this.tooltip.style.left = movement.endPosition.x + 3 + "px";
                _this.tooltip.style.top = movement.endPosition.y - 25 + "px";
                _this.tooltip.innerHTML ='<p>单击开始，双击结束</p>';
                var length = positionss.length;
                if(positionss[length-1] && positionss[length-1].length == 2){
                    cartesian = _this.transformWindowPositionToCartesian(movement.endPosition);
                    if(cartesian){
                        positionss[length-1].pop(); //弹出之前的存在的点                   
                        positionss[length-1].push(cartesian);//放入这一次的点

                        if ( !Cesium.defined(polyline_entitys[length-1])) {
                            polyline_entitys[length-1] = _this.drawLine(positionss[length-1]);
                            polyline_entitys[length-1].polyline.positions = new Cesium.CallbackProperty(function(){
                                return positionss[length-1];
                            },false)
                        }   

                        if(length > 1){
                            var angle = computeAngle(tempPoints[length-2],tempPoints[length-1],positionss[length-1][1]).toFixed(2)+"°";
                            if(!Cesium.defined(label_entitys[length-2])){
                                label_entitys[length-2] = _this.drawLabel(tempPoints[length-1],angle); 
                            }else{
                                label_entitys[length-2].label.text = angle;
                            }

                        }
                    }
                }

            },Cesium.ScreenSpaceEventType.MOUSE_MOVE);

            //双击
            this.handler.setInputAction(function (movement) {
                    var tempLength = tempPoints.length 
                    if (tempLength  < 4) {
                        alert('请选择3个以上的点再执行操作命令');
                    } else {       
                        _this.clearEffects();
                }
            }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
            //计算角度
            function computeAngle(p1,p2,p3){
                var distance12 = Cesium.Cartesian3.distance(p1,p2);
                var distance23 = Cesium.Cartesian3.distance(p2,p3);
                var distance13 = Cesium.Cartesian3.distance(p1,p3);
                var cos2 = (distance12 * distance12 + distance23 * distance23 - distance13 * distance13)/(2*distance12*distance12)
                var radianA = Math.acos(cos2);
                var degreeA = Cesium.Math.toDegrees(radianA);
                return degreeA;
            }
    }
    //贴地线
    MeasureManager.prototype.startClampGroundPolyline = function(){
        var _this = this;
        _this.clearEffects();
        _this.handler = new Cesium.ScreenSpaceEventHandler(_this.scene.canvas);
        var positionss = [];
        var label_entitys = [];
        var polylne_entitys = [];
        var tempPoints = [];
        _this.tooltip = _this.createToolTip();
        var distance = 0;
        var tempDistance = 0;
        //单击
        _this.handler.setInputAction(function(movement){
            var cartesian = _this.transformWindowPositionToCartesian(movement.position);
            var positions = [];
            positions.push(cartesian);
            positions.push(cartesian.clone());
            positionss.push(positions);
            tempPoints.push(cartesian);
            _this.drawPoint(cartesian);   
            distance += parseFloat(tempDistance);
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        //移动鼠标
        _this.handler.setInputAction(function(movement){
            _this.tooltip.style.left = movement.endPosition.x + 3 + "px";
            _this.tooltip.style.top = movement.endPosition.y - 25 + "px";
            _this.tooltip.innerHTML ='<p>单击开始，双击结束</p>';

            var length = positionss.length;
            if(positionss[length -1] && positionss[length -1].length == 2){
                var cartesian = _this.transformWindowPositionToCartesian(movement.endPosition);
                if(Cesium.defined(cartesian)){
                        positionss[length -1].pop(); //弹出之前的存在的点                   
                        positionss[length -1].push(cartesian);//放入这一次的点
                    if (!Cesium.defined(polylne_entitys[length -1])) {
                        polylne_entitys[length -1] = _this.drawLine();
                        polylne_entitys[length -1].polyline.positions = new Cesium.CallbackProperty(function(){
                            return positionss[length -1];
                        },false)
                       
                    }
                    tempDistance =  Cesium.Cartesian3.distance(positionss[length -1][0],positionss[length -1][1]).toFixed(2);
                    if (!Cesium.defined(label_entitys[length -1])) {
                        label_entitys[length -1] = _this.drawLabel();
                        label_entitys[length -1].position = new Cesium.CallbackProperty(function(){
                            return positionss[length -1][1];
                        },false)
                        label_entitys[length -1].label.text = tempDistance+'米';
                    }else{
                        label_entitys[length -1].label.text = tempDistance+'米';
                    }
                }
            }

        },Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        //双击
        _this.handler.setInputAction(function(movement){
            _this.drawLabel(positionss[0][0],"总长"+(distance-tempDistance).toFixed(2)+'米');
            _this.clearEffects();
            }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK );    
    }
    //贴地面
    MeasureManager.prototype.startDrawPolygon = function(){
            var _this = this;
            _this.clearEffects();
            var positionss = [];
            var polyline_entitys = [];
            var tempPoints = [];
            var polygonHierarchy = null;
            var polygon_entity = null;
            var label_entity = null;
            var cartesian = null;
            _this.tooltip = this.createToolTip();
            this.handler = new Cesium.ScreenSpaceEventHandler(this.scene.canvas);
            //单击
            this.handler.setInputAction(function (movement) {
                var feature = _this.viewer.scene.pick(movement.position); 
                cartesian = _this.transformWindowPositionToCartesian(movement.position);
                
                if (cartesian) {
                    tempPoints.push(cartesian);
                    var positions = [];
                    positions.push(cartesian);
                    positions.push(cartesian.clone());
                    positionss.push(positions);
                    _this.drawPoint(cartesian);
                } 
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
            //移动鼠标
            this.handler.setInputAction(function(movement){
                _this.tooltip.style.left = movement.endPosition.x + 3 + "px";
                _this.tooltip.style.top = movement.endPosition.y - 25 + "px";
                _this.tooltip.innerHTML ='<p>单击开始，双击结束</p>';
                if(positionss[positionss.length-1] && positionss[positionss.length-1].length == 2){
                    cartesian = _this.transformWindowPositionToCartesian(movement.endPosition)
                    if(Cesium.defined(cartesian)){
                            var length = positionss.length;
                            positionss[length-1].pop(); //弹出之前的存在的点                   
                            positionss[length-1].push(cartesian);//放入这一次的点

                            if (!Cesium.defined(polyline_entitys[length-1])) {
                                polyline_entitys[length-1] = _this.drawLine();
                                
                                polyline_entitys[length-1].polyline.positions = new Cesium.CallbackProperty(function(){
                                    return positionss[length-1]
                                }, false);
                            }

                            if(tempPoints.length >=2){
                                 var tempPointsc = tempPoints.concat(cartesian);
                                 polygonHierarchy = new Cesium.PolygonHierarchy(tempPointsc);
                                if(!Cesium.defined(polygon_entity)){

                                     polygon_entity = _this.drawPolygon();
                                     polygon_entity.polygon.hierarchy = new Cesium.CallbackProperty(function(){
                                                    return polygonHierarchy;
                                                }, false);
                                }
                                var area = computeArea(tempPointsc).toFixed(2)+ '㎡';
                                if(!Cesium.defined(label_entity)){
                                    label_entity = _this.drawLabel(cartesian,area);
                                }else{
                                    label_entity.label.text = area;
                                }
                            }
                        }
                }

            },Cesium.ScreenSpaceEventType.MOUSE_MOVE);

            //双击
            this.handler.setInputAction(function (movement) {
                    tempPoints.splice(tempPoints.length-1)
                    var tempLength = tempPoints.length;
                    if (tempLength < 3) {
                        alert('请选择3个以上的点再执行闭合操作命令');
                    } else {
                        //闭合曲面
                        var position_last = [];
                        position_last.push(tempPoints[0]);
                        position_last.push(tempPoints[tempLength-1]);
                        _this.drawLine(position_last);
                        _this.clearEffects();
                }
            }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

            //计算三角的面积，三角在同一个平面内
            function computeAreaOfTriangle(pos1, pos2, pos3){
                var a = Cesium.Cartesian3.distance(pos1, pos2);
                var b = Cesium.Cartesian3.distance(pos2, pos3);
                var c = Cesium.Cartesian3.distance(pos3, pos1);

                var S = (a + b + c) / 2;

                return Math.sqrt(S * (S - a) * (S - b) * (S - c));
            }
            //计算各块三角面积，相加得总面积
            function computeArea(positions){
                var cartesian_0 = positions[0];
                var length = positions.length;
                var count = length-2;
                var totalArea = 0;
                for(var i=0;i<count;i++){
                    var cartesian_1 = positions[i+1];
                    var cartesian_2 = positions[i+2];
                    var area = computeAreaOfTriangle(cartesian_0, cartesian_1, cartesian_2);
                    totalArea +=area;
                }
                return totalArea;
            }

    }

    /*空间量算*/
    MeasureManager.prototype.startSpaceMeasure = function(){
        var _this = this;
        _this.clearEffects();
        _this.handler = new Cesium.ScreenSpaceEventHandler(_this.scene.canvas);
        var positions = [];
        var floatingPoint = null;
        var polyline_entity = null;
        _this.tooltip = _this.createToolTip();
        var distance = 0;
        var cartesian = null;

        //单击
        _this.handler.setInputAction(function(movement){
            cartesian = _this.transformWindowPositionToCartesian(movement.position);
            if(Cesium.defined(cartesian)){
                if(positions.length == 0){
                    positions.push(cartesian.clone());
                    positions.push(cartesian);
                    _this.drawPoint(positions[0]);
                }

            }    
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        //移动鼠标
         _this.handler.setInputAction(function(movement){
            _this.tooltip.style.left = movement.endPosition.x + 3 + "px";
            _this.tooltip.style.top = movement.endPosition.y - 25 + "px";
            _this.tooltip.innerHTML ='<p>单击开始，双击结束</p>';
            if(positions.length == 2){
                cartesian = _this.transformWindowPositionToCartesian(movement.endPosition);
                if(Cesium.defined(cartesian)){
                    positions.pop(); //弹出之前的存在的点                   
                    positions.push(cartesian);//放入这一次的点
                    if (!Cesium.defined(polyline_entity)) {
                        polyline_entity = _this.drawSpaceLine(positions);
                        polyline_entity.polyline.positions = new Cesium.CallbackProperty(function(){
                            return positions;
                        },false)
                    }
                   distance = getHeight(positions);
                   _this.tooltip.innerHTML ='<p>垂直高度差：'+distance+'米</p>';  
                }
  
            }
        },Cesium.ScreenSpaceEventType.MOUSE_MOVE);


         //双击
        _this.handler.setInputAction(function(movement){
            _this.tooltip.style.display = "none";
            _this.drawPoint(positions[1]);
            var point1cartographic =_this.scene.globe.ellipsoid.cartesianToCartographic(positions[0]);
            var point2cartographic =_this.scene.globe.ellipsoid.cartesianToCartographic(positions[1]);
            var point_temp_1 = Cesium.Cartesian3.fromDegrees(Cesium.Math.toDegrees(point1cartographic.longitude), Cesium.Math.toDegrees(point1cartographic.latitude),point2cartographic.height); 
            var point_temp_2 = Cesium.Cartesian3.fromDegrees(Cesium.Math.toDegrees(point2cartographic.longitude), Cesium.Math.toDegrees(point2cartographic.latitude),point1cartographic.height); 
            var centerPoint = Cesium.Cartesian3.midpoint(positions[0], positions[1],new Cesium.Cartesian3())
            _this.drawDottedLine([point_temp_1,positions[0]]);
            _this.drawDottedLine([point_temp_2,positions[0]]);
            _this.drawDottedLine([point_temp_1,positions[1]]);
            _this.drawDottedLine([point_temp_2,positions[1]]);

            _this.drawLabel(positions[0],"垂直高度："+distance+"米");

            var distance_h = Cesium.Cartesian3.distance(positions[0],point_temp_2).toFixed(2);
            _this.drawLabel(positions[1],"水平距离："+distance_h+"米");

            var distance_s = Cesium.Cartesian3.distance(positions[0],positions[1]).toFixed(2);
            _this.drawLabel(centerPoint,"空间距离："+distance_s+"米");

            _this.clearEffects();
        },Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

        function getHeight(_positions){
            var point1cartographic =_this.scene.globe.ellipsoid.cartesianToCartographic(_positions[0]);
            var point2cartographic =_this.scene.globe.ellipsoid.cartesianToCartographic(_positions[1]);
            var height = _this.viewer.scene.globe.getHeight(point1cartographic);
            var height1 = _this.viewer.scene.globe.getHeight(point2cartographic) 
            var height_temp = height - height1;                 
            return Math.abs(height_temp.toFixed(2));              
        }
    }

    /*画点*/
    MeasureManager.prototype.drawPoint = function(cartesian) {
        var entity = 
        this.viewer.entities.add({
            position: cartesian,
            point : {
                pixelSize : 5,
                color : Cesium.Color.RED,
                outlineColor : Cesium.Color.WHITE,
                outlineWidth : 2,
                heightReference:Cesium.HeightReference.CLAMP_TO_GROUND
            }
        });
        this.tempEntities.push(entity);
        return entity;
    }
    /*画label*/
    MeasureManager.prototype.drawLabel = function(cartesian,text){
        var entity = 
        this.viewer.entities.add(new Cesium.Entity({
            position : cartesian,         
            label:{
                    text : text,
                    font : '15px sans-serif',
                    fillColor : new Cesium.Color(1, 1, 1, 1),
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineWidth : 2,
                    pixelOffset : new Cesium.Cartesian2(0, -50),
                    showBackground:true,
                    backgroundColor:new Cesium.Color(48/255, 51/255, 54/255, 1),
                    backgroundPadding:new Cesium.Cartesian2(7, 5),
                    horizontalOrigin : Cesium.HorizontalOrigin.CENTER,
                    verticalOrigin : Cesium.VerticalOrigin.CENTER,
                    heightReference:Cesium.HeightReference.CLAMP_TO_GROUND

            }
        }));
        this.tempEntities.push(entity);   
        return entity;    
    };
    /*画标牌*/
    MeasureManager.prototype.drawBillboard = function(cartesian) {
        var cartesian = Cesium.defined(cartesian)?cartesian:null;
        var entity = 
        this.viewer.entities.add({
            position:cartesian,
            billboard:{
                image:'./Cesium/Image/position.png',
                show : true,
                pixelOffset : new Cesium.Cartesian2(0, 0),
                eyeOffset : new Cesium.Cartesian3(0.0, 0.0, 0.0),
                horizontalOrigin : Cesium.HorizontalOrigin.CENTER,
                verticalOrigin : Cesium.VerticalOrigin.CENTER,
                heightReference:Cesium.HeightReference.CLAMP_TO_GROUND,
                scale : 1.0,
                color : new Cesium.Color(1.0, 1.0, 1.0, 1.0)
            }
        });
        this.tempEntities.push(entity);
        return entity;
    }
    /*画线*/
    MeasureManager.prototype.drawLine = function(positions) {
        positions = Cesium.defined(positions)?positions:[];
        var entity = 
        this.viewer.entities.add({
                polyline: {
                    show: true,
                    positions: positions,
                    material: Cesium.Color.CHARTREUSE,
                    width: 2,
                    clampToGround:true
                }
        });
        this.tempEntities.push(entity);
        return entity;
    }
    //画空间线
    MeasureManager.prototype.drawSpaceLine = function(positions) {
        positions = Cesium.defined(positions)?positions:[];
        var entity = 
        this.viewer.entities.add({
                polyline: {
                    show: true,
                    positions: positions,
                    material: Cesium.Color.CHARTREUSE,
                    width: 2
                }
        });
        this.tempEntities.push(entity);
        return entity;
    }
    /*画虚线*/
    MeasureManager.prototype.drawDottedLine = function(positions) {
        positions = Cesium.defined(positions)?positions:[];
        var entity = 
        this.viewer.entities.add({
                polyline: {
                    show: true,
                    positions: positions,
                    material:  new Cesium.StripeMaterialProperty({
                        evenColor:Cesium.Color.CORAL ,
                        oddColor:new Cesium.Color(0, 0, 0, 0),
                        orientation:Cesium.StripeOrientation.VERTICAL,
                        repeat:1000
                    }),
                    width: 2
                }
        });
        this.tempEntities.push(entity);
        return entity;
    }
    /*画面*/
    MeasureManager.prototype.drawPolygon = function(positions) {
        positions = Cesium.defined(positions)?positions:[];
        var entity = 
        this.viewer.entities.add({
                polygon: {
                    hierarchy: new Cesium.PolygonHierarchy(positions),
                    material: Cesium.Color.DODGERBLUE.withAlpha(.5),
                    heightReference:Cesium.HeightReference.CLAMP_TO_GROUND
                }
        });
        this.tempEntities.push(entity);
        return entity;
    }

    MeasureManager.prototype.clearEffects = function() {
        if(this.tooltip){
            this.tooltip.style.display = 'none';
        }
        if (this.handler != null && !this.handler.isDestroyed()) {
            this.handler.destroy();
        }
    }

    /**
     * 清除地图痕迹
     */
    MeasureManager.prototype.clearDrawingBoard = function() {
        var primitives = this.viewer.entities;
        for (i = 0; i <  this.tempEntities.length; i++) {
            primitives.remove(this.tempEntities[i]);
        }
        this.tempEntities=[];
        this.clearEffects();
    }
        //将屏幕坐标转换成Cesium中的坐标Cartesian
    MeasureManager.prototype.transformWindowPositionToCartesian = function(position){
                var feature = this.viewer.scene.pick(position); 
                var cartesian = null
                if(feature instanceof Cesium.Cesium3DTileFeature){ 
                    if(this.viewer.scene.pickPositionSupported){
                        cartesian = this.viewer.scene.pickPosition(position); 
                    }else{
                        alert("此浏览器不支持模型高度拾取！")
                    }
                }else{
                    var ray = this.viewer.scene.camera.getPickRay(position); 
                    cartesian = this.viewer.scene.globe.pick(ray,this.viewer.scene); 
                }
                return cartesian;
    }
    /*提示**/
    MeasureManager.prototype.createToolTip = function(){
        var tooltip = document.createElement("div");
        this.viewer.container.appendChild(tooltip);
        tooltip.className = 'backdrop';
        tooltip.style.display = 'none';
        tooltip.style.position = 'absolute';
        tooltip.style.bottom = '0';
        tooltip.style.left = '0';
        tooltip.style['pointer-events'] = 'none';
        tooltip.style.padding = '4px';
        tooltip.style.display = 'block';
        return tooltip;
    };

    Cesium.MeasureManager = MeasureManager;
})(Cesium)