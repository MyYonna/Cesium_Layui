(function(Cesium){
	Cesium.TilesetManager = function(viewer,testDepth){
		this.viewer = viewer;
		this.testDepth = testDepth;
		this.add3DTileSet = function(url,options){
			var tileset = new Cesium.Cesium3DTileset({ url: url});
			this.viewer.scene.primitives.add(tileset);
			var _this = this;
			tileset.readyPromise.then(function (tileset) {
				if(Cesium.defined(options) && options.hasOwnProperty("height")){
					var height = options.height;
		    		_this.changeTilesetHeight(tileset,height);
				}
				// _this.viewer.camera.viewBoundingSphere(tileset.boundingSphere, new Cesium.HeadingPitchRange(0, -90, 0));
				// _this.viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);

			});
		};
		this.viewer.scene.globe.depthTestAgainstTerrain = this.testDepth;
		this.changeTilesetHeight = function(tileset,height){
			height = Number(height);
			if (isNaN(height)) {
				return;
			}
			var cartographic = Cesium.Cartographic.fromCartesian(tileset.boundingSphere.center);
			var source = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height);
			var target = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude,height);
			var translation = Cesium.Cartesian3.subtract(target,source , new Cesium.Cartesian3());
			tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);	
		}
	}

})(Cesium);