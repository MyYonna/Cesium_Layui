var CesiumHeatmapGL = (function(Cesium,createWebGLHeatmap){
    function CHGL(chglviewer,geojsonUrl){
        this._viewer=chglviewer;
        if(geojsonUrl){
            this.loadGeojson(geojsonUrl);
        }
    }

    CHGL.prototype.loadGeojson = function(url){
        getJSON(url,function(data){
            var lonmin=1000;
            var lonmax=-1000;
            var latmin=1000;
            var latmax=-1000;
            // let data1 = [{"x":147.1383442264,"y":-41.4360048372,"value":6},{"x":147.1384363011,"y":-41.4360298848,"value":3},{"x":147.138368102,"y":-41.4358360603,"value":1},{"x":147.1385627739,"y":-41.4358799123,"value":21},{"x":147.1385138501,"y":-41.4359327669,"value":28},{"x":147.1385031219,"y":-41.4359730105,"value":41},{"x":147.1384127393,"y":-41.435928255,"value":75},{"x":147.1384551136,"y":-41.4359450132,"value":3},{"x":147.1384927196,"y":-41.4359158649,"value":45},{"x":147.1384938639,"y":-41.4358498311,"value":45},{"x":147.1385183299,"y":-41.4360213794,"value":93},{"x":147.1384007925,"y":-41.4359860133,"value":46},{"x":147.1383604844,"y":-41.4358298672,"value":54},{"x":147.13851025,"y":-41.4359098303,"value":39},{"x":147.1383874733,"y":-41.4358511035,"value":34},{"x":147.1384981796,"y":-41.4359355403,"value":81},{"x":147.1384504107,"y":-41.4360332348,"value":39},{"x":147.1385582664,"y":-41.4359788335,"value":20},{"x":147.1383967364,"y":-41.4360581999,"value":35},{"x":147.1383839615,"y":-41.436016316,"value":47},{"x":147.1384082712,"y":-41.4358423338,"value":36},{"x":147.1385092651,"y":-41.4358577623,"value":69},{"x":147.138360356,"y":-41.436046789,"value":90},{"x":147.138471893,"y":-41.4359184292,"value":88},{"x":147.1385605689,"y":-41.4360271359,"value":81},{"x":147.1383585714,"y":-41.4359362476,"value":32},{"x":147.1384939114,"y":-41.4358844253,"value":67},{"x":147.138466724,"y":-41.436019121,"value":17},{"x":147.1385504355,"y":-41.4360614056,"value":49},{"x":147.1383883832,"y":-41.4358733544,"value":82},{"x":147.1385670669,"y":-41.4359650236,"value":25},{"x":147.1383416534,"y":-41.4359310876,"value":82},{"x":147.138525285,"y":-41.4359394661,"value":66},{"x":147.1385487719,"y":-41.4360137656,"value":73},{"x":147.1385496029,"y":-41.4359187277,"value":73},{"x":147.1383989222,"y":-41.4358556562,"value":61},{"x":147.1385499424,"y":-41.4359149305,"value":67},{"x":147.138404523,"y":-41.4359563326,"value":90},{"x":147.1383883675,"y":-41.4359794855,"value":78},{"x":147.1383967187,"y":-41.435891185,"value":15},{"x":147.1384610005,"y":-41.4359044797,"value":15},{"x":147.1384688489,"y":-41.4360396127,"value":91},{"x":147.1384431875,"y":-41.4360684409,"value":8},{"x":147.1385411067,"y":-41.4360645847,"value":42},{"x":147.1385237178,"y":-41.4358843181,"value":31},{"x":147.1384406464,"y":-41.4360003831,"value":51},{"x":147.1384679169,"y":-41.4359950456,"value":96},{"x":147.1384194314,"y":-41.4358419739,"value":22},{"x":147.1385049792,"y":-41.4359574813,"value":44},{"x":147.1384097378,"y":-41.4358598672,"value":82},{"x":147.1384993219,"y":-41.4360352975,"value":84},{"x":147.1383640499,"y":-41.4359839518,"value":81}];
            // data1.forEach(function(feature){
            //     var lon = feature.x;
            //     var lat = feature.y;
            //     lonmin = lon<lonmin?lon:lonmin;
            //     latmin = lat<latmin?lat:latmin;
            //     lonmax = lon>lonmax?lon:lonmax;
            //     latmax = lat>latmax?lat:latmax;
            // });
            // var xrange = lonmax-lonmin;
            // var yrange = latmax-latmin;
            // var extent={xMin:lonmin-xrange/10,yMin:latmin-yrange/10, xMax:lonmax+xrange/10,yMax:latmax+yrange/10};
            data.features.forEach(function(feature){
                var lon = feature.geometry.coordinates[0];
                var lat = feature.geometry.coordinates[1];
                lonmin = lon<lonmin?lon:lonmin;
                latmin = lat<latmin?lat:latmin;
                lonmax = lon>lonmax?lon:lonmax;
                latmax = lat>latmax?lat:latmax;
            });
            var xrange = lonmax-lonmin;
            var yrange = latmax-latmin;
            var extent={xMin:lonmin-xrange/10,yMin:latmin-yrange/10, xMax:lonmax+xrange/10,yMax:latmax+yrange/10};
            var heatmapcanvas = document.createElement('canvas');
            document.body.appendChild(heatmapcanvas);
            heatmapcanvas.width = 1000;
            heatmapcanvas.height = parseInt(1000/(extent.xMax-extent.xMin)*(extent.yMax-extent.yMin));
            try{
                var heatmap = this._heatmap = createWebGLHeatmap({canvas: heatmapcanvas,intensityToAlpha:true});
            }
            catch(error){
                console.error(error);
            }
            // for(var i=0;i<10;i++){
            // 	            data1.forEach(function(feature){
            //     var x = (feature.x-extent.xMin)/(extent.xMax-extent.xMin)*heatmapcanvas.clientWidth;
            //     var y = (-(feature.y-extent.yMin)/(extent.yMax-extent.yMin)+1)*heatmapcanvas.clientHeight;
            //     heatmap.addPoint(x, y, 20, 0.05);
            // });
            // }


            data.features.forEach(function(feature){
                var x = (feature.geometry.coordinates[0]-extent.xMin)/(extent.xMax-extent.xMin)*heatmapcanvas.clientWidth;
                var y = (-(feature.geometry.coordinates[1]-extent.yMin)/(extent.yMax-extent.yMin)+1)*heatmapcanvas.clientHeight;
                heatmap.addPoint(x, y, 20, 0.05);
            });
            heatmap.adjustSize(); 
            heatmap.update();
            heatmap.display();
            this.drawHeatmapRect(heatmapcanvas,extent);
            this._viewer.camera.flyTo({
                destination : Cesium.Rectangle.fromDegrees(extent.xMin, extent.yMin, extent.xMax, extent.yMax)
            });
        }.bind(this));
    }

	CHGL.prototype.drawHeatmapRect = function(canvas,extent) {
		var image = convertCanvasToImage(canvas);
		this._worldRectangle = this._viewer.scene.primitives.add(new Cesium.Primitive({
			geometryInstances : new Cesium.GeometryInstance({
				geometry : new Cesium.RectangleGeometry({
					rectangle : Cesium.Rectangle.fromDegrees(extent.xMin, extent.yMin, extent.xMax, extent.yMax),
					vertexFormat : Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT
				})
			}),
			appearance : new Cesium.EllipsoidSurfaceAppearance({
				aboveGround : false
			}),
			show : true
		}));
		this._worldRectangle.appearance.material = new Cesium.Material({
			fabric : {
				type : 'Image',
				uniforms : {
					image : image.src,
					// transparent:true
				}
			}
		});
    }

    CHGL.prototype.updateHeatmap=function(){
        this._heatmap.adjustSize(); 
        this._heatmap.update();
        this._heatmap.display();

        var image = convertCanvasToImage(this._heatmap.canvas);
        this._worldRectangle.appearance.material.uniforms.image=image.src;
        //  = new Cesium.Material({
		// 	fabric : {
		// 		type : 'Image',
		// 		uniforms : {
		// 			image : image.src
		// 		}
		// 	}
		// });
    }
    
    CHGL.prototype.multiply = function(value){
        this._heatmap.multiply(value);
        this.updateHeatmap();
    }

    CHGL.prototype.clamp = function(min,max){
        this._heatmap.clamp(min, max);
        this.updateHeatmap();
    }

    CHGL.prototype.blur = function(){
        this._heatmap.blur();
        this.updateHeatmap();
    }

	function convertCanvasToImage(canvas) {
		var image = new Image();
		image.src = canvas.toDataURL("image/png");
		return image;
    }

    function getJSON(url, callback) {
		const xhr = new XMLHttpRequest();
		xhr.responseType = 'json';
		xhr.open('get', url, true);
		xhr.onload = function () {
			if (xhr.status >= 200 && xhr.status < 300) {
				callback(xhr.response);
			} else {
				throw new Error(xhr.statusText);
			}
		};
		xhr.send();
	}
    
    return CHGL;
})(window.Cesium||{},window.createWebGLHeatmap||{});