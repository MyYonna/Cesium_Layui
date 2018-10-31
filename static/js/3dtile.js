var tilesetManager = new Cesium.TilesetManager(viewer,true);//是否及逆行深度测试
tilesetManager.add3DTileSet('./tile3d/tileset.json',{height:130});//调整模型高度
tilesetManager.add3DTileSet('./datile3d/tileset.json',{height:30});//调整模型高度