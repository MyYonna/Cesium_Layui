(function(Cesium){
	Cesium.TerrainManager = function(viewer,isLighting){
		this.viewer = viewer;
		if(isLighting){
			this.isLighting = isLighting;
		}else{
			this.isLighting = false;
		}
		this.setTerrain = function(terrainProvider){
			this.viewer.terrainProvider = terrainProvider;
			this.viewer.scene.globe.enableLighting = this.isLighting;
		};
		this.setTerrainLighting =function(isLighting){
			this.viewer.scene.globe.enableLighting = isLighting;
		};
		this.setCesiumTerrain = function(url){
			var cesiumTerrainProvider = new Cesium.CesiumTerrainProvider({
		 			url:url
			});
			this.viewer.terrainProvider = cesiumTerrainProvider;
			this.viewer.scene.globe.enableLighting = this.isLighting;
		}
	}

})(Cesium);