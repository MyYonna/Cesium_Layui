(function(Cesium){
	function MeasureManager(viewer){
      this.viewer = viewer;
      this.scene =  viewer.scene;
      viewer.scene.camera._suspendTerrainAdjustment = false;;
	}
	MeasureManager.prototype.loadedModels = [];
    MeasureManager.prototype.tempPoints = [];
    MeasureManager.prototype.tempEntities = [];
    MeasureManager.prototype.tempEntity = [];
    MeasureManager.prototype.tooltip = null;
    MeasureManager.prototype.tempPinEntities = [];
    MeasureManager.prototype.tempPinLon = null;
    MeasureManager.prototype.tempPinLat = null;
    MeasureManager.prototype.surveyOptions = {
    	loadedModels:this.loadedModels,
    	tempPoints:this.tempPoints,
    	tempEntities:this.tempEntities,
    	tempPinEntities:this.tempPinEntities,
    	tempPinLon:this.tempPinLon,
    	tempPinLat:this.tempPinLat,
    	handler:this.handler
    }

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
			default:
				// statements_def
				break;
		}
	}
    MeasureManager.prototype.startPickPosition = function(){
        var _this = this;
        this.handler = new Cesium.ScreenSpaceEventHandler(this.scene.canvas);
        _this.tooltip = this.createToolTip();
        var cartesian = null;
        this.handler.setInputAction(function(movement){
            _this.tooltip.style.left = movement.endPosition.x - 50 + "px";
            _this.tooltip.style.top = movement.endPosition.y - 70 + "px";
            _this.tooltip.innerHTML ='<p>双击结束</p>';
            
            var feature = _this.viewer.scene.pick(movement.endPosition); 
            if(feature instanceof Cesium.Cesium3DTileFeature){ 
                if(_this.viewer.scene.pickPositionSupported){
                    cartesian = _this.viewer.scene.pickPosition(movement.endPosition); 
                }else{
                    alert("此浏览器不支持模型高度拾取！")
                }
            }else{
                var ray = _this.viewer.scene.camera.getPickRay(movement.endPosition); 
                cartesian = _this.viewer.scene.globe.pick(ray,_this.viewer.scene); 
            }

            var cartographic = _this.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
            var longitude = Cesium.Math.toDegrees(cartographic.longitude).toFixed(2);
            var latitude = Cesium.Math.toDegrees(cartographic.latitude).toFixed(2);
            var height = cartographic.height.toFixed(2);
            var coorInfo ="<div class='coorinfo'><p>经度："+longitude+"</p>"+"<p>纬度："+latitude+"</p>"+"<p>高度："+height+"</p></div>"
            _this.tooltip.innerHTML = coorInfo ;   
        },Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        this.handler.setInputAction(function (movement) {
                _this.tooltip.style.display = 'none'
                _this.clearEffects();
                var entity = {
                    name : '起点',
                    position : cartesian,                
                    point : {
                        pixelSize : 5,
                        color : Cesium.Color.RED,
                        outlineColor : Cesium.Color.WHITE,
                        outlineWidth : 2,
                        heightReference:Cesium.HeightReference.CLAMP_TO_GROUND
                    }
                }
                _this.tempEntities.push(_this.viewer.entities.add(entity));

                var cartographic = _this.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
                var longitude = Cesium.Math.toDegrees(cartographic.longitude).toFixed(2);
                var latitude = Cesium.Math.toDegrees(cartographic.latitude).toFixed(2);
                var height = cartographic.height.toFixed(2);
                var entity_label = {
                    name : '坐标信息',
                    position : cartesian,         
                    label:{
                            text : "经度："+longitude+"\n纬度："+latitude+"\n高度："+height,
                            font : '15px sans-serif',
                            fillColor : new Cesium.Color(1, 1, 1, 1),
                            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                            outlineWidth : 2,
                            verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
                            pixelOffset : new Cesium.Cartesian2(-50, -10),
                            showBackground:true,
                            backgroundColor:new Cesium.Color(52/255, 61/255, 70/255, 0.9),
                            backgroundPadding:new Cesium.Cartesian2(7, 5),
                            horizontalOrigin:Cesium.HorizontalOrigin.LEFT,
                            heightReference:Cesium.HeightReference.CLAMP_TO_GROUND

                    }
                };
              _this.tempEntities.push(_this.viewer.entities.add(entity_label));

            }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    }

	MeasureManager.prototype.startDrawPolygon = function(){
			var _this = this;
		    var tempPoints = [];
            var positions = [];
            var poly = null;
            _this.tooltip = this.createToolTip();
            var cartesian = null;
            this.handler = new Cesium.ScreenSpaceEventHandler(this.scene.canvas);
            
            this.handler.setInputAction(function (movement) {
                var feature = _this.viewer.scene.pick(movement.position); 
                if(feature instanceof Cesium.Cesium3DTileFeature){ 
                    if(_this.viewer.scene.pickPositionSupported){
                        cartesian = _this.viewer.scene.pickPosition(movement.position); 
                    }else{
                        alert("此浏览器不支持模型高度拾取！")
                    }
                }else{
                    var ray = _this.viewer.scene.camera.getPickRay(movement.position); 
                    cartesian = _this.viewer.scene.globe.pick(ray,_this.viewer.scene); 
                }
                positions = [];
                if (cartesian) {
                    tempPoints.push(cartesian);
                    positions.push(cartesian);
                    positions.push(cartesian.clone());
                    _this.drawPoint(cartesian);
                    poly = null;
                } 
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

            this.handler.setInputAction(function(movement){
                _this.tooltip.style.left = movement.endPosition.x + 3 + "px";
                _this.tooltip.style.top = movement.endPosition.y - 25 + "px";
                _this.tooltip.innerHTML ='<p>单击开始，双击结束</p>';
                var cartesian = null;
                var feature = _this.viewer.scene.pick(movement.endPosition); 
                if(feature instanceof Cesium.Cesium3DTileFeature){ 
                    if(_this.viewer.scene.pickPositionSupported){
                        cartesian = _this.viewer.scene.pickPosition(movement.endPosition); 
                    }else{
                        alert("此浏览器不支持模型高度拾取！")
                    }
                }else{
                    var ray = _this.viewer.scene.camera.getPickRay(movement.endPosition); 
                    cartesian = _this.viewer.scene.globe.pick(ray,_this.viewer.scene);
                }

                if(positions.length == 2){
                    if (!Cesium.defined(poly)) {
                        poly = new ClampPolyLinePrimitive(positions);
                    } else{
                        positions.pop(); //弹出之前的存在的点                   
                        positions.push(cartesian);//放入这一次的点
                    
                    }
                     var distance =  Cesium.Cartesian3.distance(positions[0],positions[1]).toFixed(2);
                   _this.tooltip.innerHTML ='<p>线段长度：'+distance +'米</p>';
                }
            },Cesium.ScreenSpaceEventType.MOUSE_MOVE);


            this.handler.setInputAction(function (movement) {
                    tempPoints.splice(tempPoints.length-1)
                    var tempLength = tempPoints.length;
                    if (tempLength < 3) {
                        alert('请选择3个以上的点再执行闭合操作命令');
                    } else {
                        var position_last2 = [];
                        position_last2.push(tempPoints[tempLength-1]);
                        position_last2.push(tempPoints[tempLength-2]);
                        _this.tempEntities.push(_this.viewer.entities.add({
                                    name: '直线',
                                    polyline: {
                                        show: true,
                                        positions: position_last2,
                                        material: Cesium.Color.CHARTREUSE,
                                        width: 2,
                                        clampToGround:true
                                    }
                          }));
                        var position_last = [];
                        position_last.push(tempPoints[0]);
                        position_last.push(tempPoints[tempLength-1]);
                        _this.tempEntities.push(_this.viewer.entities.add({
                                    name: '直线',
                                    polyline: {
                                        show: true,
                                        positions: position_last,
                                        material: Cesium.Color.CHARTREUSE,
                                        width: 2,
                                        clampToGround:true
                                    }
                          }));
                        var entity = _this.viewer.entities.add({
                            polygon: {
                                hierarchy: new Cesium.PolygonHierarchy(tempPoints),
                                material: Cesium.Color.DODGERBLUE.withAlpha(.5),
                                heightReference:Cesium.HeightReference.CLAMP_TO_GROUND,
                                outline:true,
                                outlineColor:Cesium.Color.CHARTREUSE,
                                outlineWidth:2
                            }
                        });
                        _this.tempEntities.push(entity);

                        // var ent = _this.viewer.entities.add({
                        //           position: Cesium.Cartesian3.fromDegrees(((_this.tempPoints[0].lon +(_this.tempPoints[_this.tempPoints.length-1].lon+ _this.tempPoints[_this.tempPoints.length-2].lon)/2)/2 ),
                        //           ((_this.tempPoints[0].lat +(_this.tempPoints[_this.tempPoints.length-1].lat+_this.tempPoints[_this.tempPoints.length -2].lat)/2 )/2)),
                        //           label: {
                        //               text: _this.SphericalPolygonAreaMeters(_this.tempPoints) .toFixed(1) + '㎡',
                        //               font: '22px Helvetica',
                        //               fillColor: Cesium.Color.BLACK
                        //           }
                        //       });
                        // _this.tempEntities.push(ent);
                        tempPoints = [];
                        _this.clearEffects();
                }
            }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

            var ClampPolyLinePrimitive = (function (_this) {
                function ClampPolyLinePrimitive(positions) {
                    this.options = {
                        name: '直线',
                        polyline: {
                            show: true,
                            positions: [],
                            material: Cesium.Color.CHARTREUSE,
                            width: 2,
                            clampToGround:true
                        }
                    };
                    this.positions = positions;
                    this._init();
                }
         
                ClampPolyLinePrimitive.prototype._init = function () {
                    var _self = this;
                    var _update = function () {
                        return _self.positions;
                    };
                    //实时更新polyline.positions
                    this.options.polyline.positions = new Cesium.CallbackProperty(_update, false);
                    
                    _this.tempEntities.push(_this.tempEntity = _this.viewer.entities.add(this.options));
                };
                return ClampPolyLinePrimitive;
            })(_this); 

	}

    MeasureManager.prototype.clearEffects = function() {
        if (this.handler != null) {
            var primitives = this.viewer.entities;
            if(this.tempEntity){
                primitives.remove(this.tempEntity);
                var index = this.tempEntities.indexOf(this.tempEntity);
                if (index > -1) {
                 this.tempEntities.splice(index, 1);
                }
                this.tempEntity = null;
            }
            if(this.tooltip){
                this.tooltip.style.display = 'none';
            }
            this.handler.destroy();
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
                heightReference:Cesium.HeightReference.CLAMP_TO_GROUND,
            }
        });
        this.tempEntities.push(entity);
    }

    //计算多边形面积
    var earthRadiusMeters = 6371000.0;
    var radiansPerDegree = Math.PI / 180.0;
    var degreesPerRadian = 180.0 / Math.PI;



    MeasureManager.prototype.SphericalPolygonAreaMeters = function(points) {
        var totalAngle = 0;
        for (var i = 0; i < points.length; i++) {
            var j = (i + 1) % points.length;
            var k = (i + 2) % points.length;
            totalAngle += this.Angle(points[i], points[j], points[k]);
        }
        var planarTotalAngle = (points.length - 2) * 180.0;
        var sphericalExcess = totalAngle - planarTotalAngle;
        if (sphericalExcess > 420.0) {
            totalAngle = points.length * 360.0 - totalAngle;
            sphericalExcess = totalAngle - planarTotalAngle;
        } else if (sphericalExcess > 300.0 && sphericalExcess < 420.0) {
            sphericalExcess = Math.abs(360.0 - sphericalExcess);
        }
        return sphericalExcess * radiansPerDegree * earthRadiusMeters * earthRadiusMeters;
    }

    /*角度*/
     MeasureManager.prototype.Angle = function(p1, p2, p3) {
        var bearing21 = this.Bearing(p2, p1);
        var bearing23 = this.Bearing(p2, p3);
        var angle = bearing21 - bearing23;
        if (angle < 0) {
            angle += 360;
        }
        return angle;
    }
    /*方向*/
    MeasureManager.prototype.Bearing = function(from, to) {
        var lat1 = from.lat * radiansPerDegree;
        var lon1 = from.lon * radiansPerDegree;
        var lat2 = to.lat * radiansPerDegree;
        var lon2 = to.lon * radiansPerDegree;
        var angle = -Math.atan2(Math.sin(lon1 - lon2) * Math.cos(lat2), Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2));
        if (angle < 0) {
            angle += Math.PI * 2.0;
        }
        angle = angle * degreesPerRadian;
        return angle;
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
    MeasureManager.prototype.startClampGroundPolyline = function(){
        var _this = this;
        _this.handler = new Cesium.ScreenSpaceEventHandler(_this.scene.canvas);
        var positions = [];
        var poly = null;
        _this.tooltip = _this.createToolTip();
        var distance = 0;
        var cartesian = null;
        _this.handler.setInputAction(function(movement){
            _this.tooltip.style.left = movement.endPosition.x + 3 + "px";
            _this.tooltip.style.top = movement.endPosition.y - 25 + "px";
            _this.tooltip.innerHTML ='<p>单击开始，双击结束</p>';
            var cartesian = null;
            var feature = _this.viewer.scene.pick(movement.endPosition); 
            if(feature instanceof Cesium.Cesium3DTileFeature){ 
                if(_this.viewer.scene.pickPositionSupported){
                    cartesian = _this.viewer.scene.pickPosition(movement.endPosition); 
                }else{
                    alert("此浏览器不支持模型高度拾取！")
                }
            }else{
                var ray = _this.viewer.scene.camera.getPickRay(movement.endPosition); 
                cartesian = _this.viewer.scene.globe.pick(ray,_this.viewer.scene);
            }

            if(positions.length == 2){
                if (!Cesium.defined(poly)) {
                    poly = new ClampPolyLinePrimitive(positions);
                } else{
                    positions.pop(); //弹出之前的存在的点                   
                    positions.push(cartesian);//放入这一次的点
                
                }
                 var distance =  Cesium.Cartesian3.distance(positions[0],positions[1]).toFixed(2);
               _this.tooltip.innerHTML ='<p>空间距离：'+distance +'米</p>';
            }
        },Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        _this.handler.setInputAction(function(movement){
            var cartesian = null;
            var feature = _this.viewer.scene.pick(movement.position); 
            if(feature instanceof Cesium.Cesium3DTileFeature){ 
                if(_this.viewer.scene.pickPositionSupported){
                    cartesian = _this.viewer.scene.pickPosition(movement.position); 
                }else{
                    alert("此浏览器不支持模型高度拾取！")
                }
            }else{
                var ray = _this.viewer.scene.camera.getPickRay(movement.position); 
                cartesian = _this.viewer.scene.globe.pick(ray,_this.viewer.scene); 
            }

            if(positions.length == 0) {
                positions.push(cartesian);
                positions.push(cartesian.clone())
               
                var entity = {
                    name : '起点',
                    position : positions[0],                
                    point : {
                        pixelSize : 5,
                        color : Cesium.Color.RED,
                        outlineColor : Cesium.Color.WHITE,
                        outlineWidth : 2,
                        heightReference:Cesium.HeightReference.CLAMP_TO_GROUND,
                    }
                }
                _this.tempEntities.push(_this.viewer.entities.add(entity));

            }   
            _this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);    
                  
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        _this.handler.setInputAction(function(movement){
           //销毁handler
           _this.tempEntity = null;
            _this.clearEffects();

            var point1cartographic =_this.scene.globe.ellipsoid.cartesianToCartographic(positions[0]);
            var point2cartographic =_this.scene.globe.ellipsoid.cartesianToCartographic(positions[1]);
            var point_temp_1 = Cesium.Cartesian3.fromDegrees(Cesium.Math.toDegrees(point1cartographic.longitude), Cesium.Math.toDegrees(point1cartographic.latitude),point2cartographic.height); 
            var point_temp_2 = Cesium.Cartesian3.fromDegrees(Cesium.Math.toDegrees(point2cartographic.longitude), Cesium.Math.toDegrees(point2cartographic.latitude),point1cartographic.height); 
            //端点
            var entity_point_end = {
                    name:"终点",
                    position : positions[1], 
                    point : {
                        pixelSize : 5,
                        color : Cesium.Color.RED,
                        outlineColor : Cesium.Color.WHITE,
                        outlineWidth : 2,
                        heightReference:Cesium.HeightReference.none 
                    }  
                 }  
             _this.tempEntities.push(_this.viewer.entities.add(entity_point_end));

             //文本，空间距离
            var distance_s = Cesium.Cartesian3.distance(positions[0],positions[1]).toFixed(2);
            var entity_label_s = {
                name : '直线距离',
                position : positions[1],         
                label:{
                        text : "空间距离："+distance_s+"米",
                        font : '18px sans-serif',
                        fillColor : Cesium.Color.GOLD,
                        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                        outlineWidth : 2,
                        verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
                        pixelOffset : new Cesium.Cartesian2(20, 20)
                        }
                };
            _this.tempEntities.push(_this.viewer.entities.add(entity_label_s));
            _this.tempEntity = null;
            }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK );  


            var ClampPolyLinePrimitive = (function (_this) {
                function ClampPolyLinePrimitive(positions) {
                    this.options = {
                        name: '直线',
                        polyline: {
                            show: true,
                            positions: [],
                            material: Cesium.Color.CHARTREUSE,
                            width: 2,
                            clampToGround:true
                        }
                    };
                    this.positions = positions;
                    this._init();
                }
         
                ClampPolyLinePrimitive.prototype._init = function () {
                    var _self = this;
                    var _update = function () {
                        return _self.positions;
                    };
                    //实时更新polyline.positions
                    this.options.polyline.positions = new Cesium.CallbackProperty(_update, false);
                    
                    _this.tempEntities.push(_this.tempEntity = _this.viewer.entities.add(this.options));
                };
                return ClampPolyLinePrimitive;
            })(_this); 

    }



    MeasureManager.prototype.startSpaceMeasure = function(){
        var _this = this;
        _this.handler = new Cesium.ScreenSpaceEventHandler(_this.scene.canvas);
        var positions = [];
        var floatingPoint = null;
        var poly = null;
        _this.tooltip = _this.createToolTip();
        var distance = 0;
        var cartesian = null;

         _this.handler.setInputAction(function(movement){
            _this.tooltip.style.left = movement.endPosition.x + 3 + "px";
            _this.tooltip.style.top = movement.endPosition.y - 25 + "px";
            _this.tooltip.innerHTML ='<p>单击开始，双击结束</p>';
            var cartesian = null;
            var feature = _this.viewer.scene.pick(movement.endPosition); 
            if(feature instanceof Cesium.Cesium3DTileFeature){ 
                if(_this.viewer.scene.pickPositionSupported){
                    cartesian = _this.viewer.scene.pickPosition(movement.endPosition); 
                }else{
                    alert("此浏览器不支持模型高度拾取！")
                }
            }else{
                var ray = _this.viewer.scene.camera.getPickRay(movement.endPosition); 
                cartesian = _this.viewer.scene.globe.pick(ray,_this.viewer.scene);
            }

            if(positions.length == 2){
                if (!Cesium.defined(poly)) {
                    poly = new PolyLinePrimitive(positions);
                } else{
                    positions.pop(); //弹出之前的存在的点                   
                    positions.push(cartesian);//放入这一次的点
                }

               distance = getHeight(positions);
               _this.tooltip.innerHTML ='<p>垂直高度差：'+distance+'米</p>';    
            }
        },Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        _this.handler.setInputAction(function(movement){
            var cartesian = null;
            var feature = _this.viewer.scene.pick(movement.position); 
            if(feature instanceof Cesium.Cesium3DTileFeature){ 
                if(_this.viewer.scene.pickPositionSupported){
                    cartesian = _this.viewer.scene.pickPosition(movement.position); 
                }else{
                    alert("此浏览器不支持模型高度拾取！")
                }
            }else{
                var ray = _this.viewer.scene.camera.getPickRay(movement.position); 
                cartesian = _this.viewer.scene.globe.pick(ray,_this.viewer.scene); 
            }

            if(positions.length == 0) {
                positions.push(cartesian.clone());
                positions.push(cartesian);
                distance =getHeight(positions);
                var entity = {
                    name : '起点',
                    position : positions[0],                
                    point : {
                        pixelSize : 5,
                        color : Cesium.Color.RED,
                        outlineColor : Cesium.Color.WHITE,
                        outlineWidth : 2,
                        heightReference:Cesium.HeightReference.CLAMP_TO_GROUND,
                    }
                }
                _this.tempEntities.push(_this.viewer.entities.add(entity));

            }   
            _this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);    
                  
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        _this.handler.setInputAction(function(movement){
            _this.tempEntity = null;
           //销毁handler
            _this.clearEffects();

            var point1cartographic =_this.scene.globe.ellipsoid.cartesianToCartographic(positions[0]);
            var point2cartographic =_this.scene.globe.ellipsoid.cartesianToCartographic(positions[1]);
            var point_temp_1 = Cesium.Cartesian3.fromDegrees(Cesium.Math.toDegrees(point1cartographic.longitude), Cesium.Math.toDegrees(point1cartographic.latitude),point2cartographic.height); 
            var point_temp_2 = Cesium.Cartesian3.fromDegrees(Cesium.Math.toDegrees(point2cartographic.longitude), Cesium.Math.toDegrees(point2cartographic.latitude),point1cartographic.height); 
           
            new DottedPolyLinePrimitive([point_temp_1,positions[0]]);
            new DottedPolyLinePrimitive([point_temp_2,positions[0]]);
            new DottedPolyLinePrimitive([point_temp_1,positions[1]]);
            new DottedPolyLinePrimitive([point_temp_2,positions[1]]);

            _this.tooltip.style.display = "none";
            //文本，显示垂直高度
            var entity_label_v = {
                name : '垂直高度',
                position : point_temp_1,         
                label:{
                        text :  "垂直高度："+distance+"米",
                        font : '18px sans-serif',
                        fillColor : Cesium.Color.GOLD,
                        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                        outlineWidth : 2,
                        verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
                        pixelOffset : new Cesium.Cartesian2(20, 20)
                        }
                };
           _this.tempEntities.push(_this.viewer.entities.add(entity_label_v));

            //文本，显示水平长度
            var distance_h = Cesium.Cartesian3.distance(positions[0],point_temp_2).toFixed(2);
            var entity_label_h = {
                name : '水平长度',
                position : point_temp_2,         
                label:{
                        text : "水平距离："+distance_h+"米",
                        font : '18px sans-serif',
                        fillColor : Cesium.Color.GOLD,
                        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                        outlineWidth : 2,
                        verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
                        pixelOffset : new Cesium.Cartesian2(20, 20)
                        }
                };
           _this.tempEntities.push(_this.viewer.entities.add(entity_label_h));
            //端点
            var entity_point_end = {
                    name:"终点",
                    position : positions[1], 
                    point : {
                        pixelSize : 5,
                        color : Cesium.Color.RED,
                        outlineColor : Cesium.Color.WHITE,
                        outlineWidth : 2,
                        heightReference:Cesium.HeightReference.none 
                    }  
                 }  
             _this.tempEntities.push(_this.viewer.entities.add(entity_point_end));

             //文本，空间距离
            var distance_s = Cesium.Cartesian3.distance(positions[0],positions[1]).toFixed(2);
            var entity_label_s = {
                name : '直线距离',
                position : positions[1],         
                label:{
                        text : "空间距离："+distance_s+"米",
                        font : '18px sans-serif',
                        fillColor : Cesium.Color.GOLD,
                        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                        outlineWidth : 2,
                        verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
                        pixelOffset : new Cesium.Cartesian2(20, 20)
                        }
                };
            _this.tempEntities.push(_this.viewer.entities.add(entity_label_s));
            _this.tempEntity = null;
            }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK );  


            var PolyLinePrimitive = (function (_this) {
                function PolyLinePrimitive(positions) {
                    this.options = {
                        name: '直线',
                        polyline: {
                            show: true,
                            positions: [],
                            material: Cesium.Color.CHARTREUSE,
                            width: 2
                        }
                    };
                    this.positions = positions;
                    this._init();
                }
         
                PolyLinePrimitive.prototype._init = function () {
                    var _self = this;
                    var _update = function () {
                        return _self.positions;
                    };
                    //实时更新polyline.positions
                    this.options.polyline.positions = new Cesium.CallbackProperty(_update, false);
                    
                    _this.tempEntities.push(_this.tempEntity = _this.viewer.entities.add(this.options));
                };
                return PolyLinePrimitive;
            })(_this); 


            var DottedPolyLinePrimitive = (function (_this) {
                function PolyLinePrimitive(positions) {
                    this.options = {
                        name: '虚线',
                        polyline: {
                            show: true,
                            positions: [],
                            material:  new Cesium.StripeMaterialProperty({
                                evenColor:Cesium.Color.CORAL ,
                                oddColor:new Cesium.Color(0, 0, 0, 0),
                                orientation:Cesium.StripeOrientation.VERTICAL,
                                repeat:1000
                            }),
                            width: 2
                        }
                    };
                    this.positions = positions;
                    this._init();
                }
         
                PolyLinePrimitive.prototype._init = function () {
                    var _self = this;
                    var _update = function () {
                        return _self.positions;
                    };
                    //实时更新polyline.positions
                    this.options.polyline.positions = new Cesium.CallbackProperty(_update, false);
                    
                    _this.tempEntities.push(_this.viewer.entities.add(this.options));
                };
                return PolyLinePrimitive;
            })(_this); 

        function getHeight(_positions){
            var point1cartographic =_this.scene.globe.ellipsoid.cartesianToCartographic(_positions[0]);
            var point2cartographic =_this.scene.globe.ellipsoid.cartesianToCartographic(_positions[1]);
            var height = _this.viewer.scene.globe.getHeight(point1cartographic);
            var height1 = _this.viewer.scene.globe.getHeight(point2cartographic) 
            var height_temp = height - height1;                 
            return Math.abs(height_temp.toFixed(2));              
        }
    }
    Cesium.MeasureManager = MeasureManager;
})(Cesium)