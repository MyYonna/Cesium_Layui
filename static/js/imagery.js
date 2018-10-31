var layers = viewer.scene.imageryLayers;
// layers.addImageryProvider(new Cesium.WebMapTileServiceImageryProvider({
//         url : 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
//         // format:'tiles',
//         layer:'World Imagery',
//         style:'default',
//         "tileMatrixSetID":"dd"

//     }));
layers.addImageryProvider(new Cesium.ArcGisMapServerImageryProvider({
        url : 'http://localhost:6080/arcgis/rest/services/JingZhouDOM/MapServer',
        layers:'0',
        style:'default',
        "tileMatrixSetID":"dd"
    }));