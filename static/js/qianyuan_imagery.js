        var imageLayersManager = new Freedo.FdTools.FdImageryLayersManager(viewer);

         var linYeImageryLayerOptions = {
            'name': '林业影像',
            'type': 'ESRI',
            'iconUrl': 'Freedo/Freedo/Widgets/Images/ImageryProviders/blackMarble.png',
            'layerOption': {
                'show': true,
                'alpha': 1.0
            },
            'providerOptions': {
                'url':'http://localhost:6080/arcgis/rest/services/FreeDoImagery/MapServer/',
                'layer':'GF2_PMS2_E111.6_N28.1_20171030_L1A0002721658_warp1.tif',
                'style': 'default',
                'format': 'tiles',
                'tileMatrixSetID': '林业影像',
                'enablePickFeatures':false,
                'maximumLevel':19,
                'minimumLevel':0
    
            }
        };
        
        var hasAdd = false;
        imageLayersManager.add(linYeImageryLayerOptions, imageLayersManager.length);
        //添加工具条
        Sandcastle.addToolbarButton('切换影像', function () {
        	 document.getElementById("toolbar").style.display = "none";

             Sandcastle.addToolbarButton('天地图影像', function () {
             	if(hasAdd){
             		imageLayersManager.remove(imageLayersManager.length-1);//删除上一层叠加的影像
             	}
               	 imageLayersManager.addTianDiTuImageryLayer();
               	 hasAdd = true;
         //        var imageryLayerOptions = {
	        //     'name': '天地图影像',
	        //     'type': 'WMTS',
	        //     'iconUrl': '',
	        //     'layerOption': {
	        //         'show': true,
	        //         'alpha': 1.0
	        //     },
	        //     'providerOptions': {
	        //         'url': 'http://t6.tianditu.com/img_c/wmts',
	        //         'layer':'img',
	        //         'style': 'default',
	        //         'format': 'tiles',
	        //         'tileMatrixSetID': 'c',
	        //         'enablePickFeatures':false,
	    
	        //     }
	        // };
    // 			if(hasAdd){
				// 	imageLayersManager.remove(imageLayersManager.length-2);//删除上一层叠加的影像
				// }
		  //       imageLayersManager.add(imageryLayerOptions, imageLayersManager.length-1);
		  //       hasAdd = true;
	           
	        },"toolbar_imagery_menu");

	        Sandcastle.addToolbarButton('ESRI在线影像', function () {
                  var imageryLayerOptions = {
		            'name': 'ESRI在线影像',
		            'type': 'ESRI',
		            'iconUrl': '',
		            'layerOption': {
		                'show': true,
		                'alpha': 1.0
		            },
		            'providerOptions': {
		                'url': 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
		                'layer':'World Imagery',
		                'style': 'default',
		                'format': 'tiles',
		                'tileMatrixSetID': 'ESRI在线影像',
		                'enablePickFeatures':false,
		    
		            }
		        };
    			if(hasAdd){
					imageLayersManager.remove(imageLayersManager.length-1);//删除上一层叠加的影像
				}
		        imageLayersManager.add(imageryLayerOptions, imageLayersManager.length);
		        hasAdd = true;
		        
	        },"toolbar_imagery_menu");

	        Sandcastle.addToolbarButton('资源三号卫星影像', function () {
    			if(hasAdd){
					imageLayersManager.remove(imageLayersManager.length-1);//删除上一层叠加的影像
				}

	        	imageLayersManager.addDefaultImageryLayer();
	        	hasAdd = true;
	   //           var imageryLayerOptions = {
				// 	    'name': '资源三号卫星影像',
				// 	    'type': 'WMTS',
				// 	    'iconUrl': '',
				// 	    'layerOption': {
				// 	        'show': true,
				// 	        'alpha': 1.0
				// 	    },
				// 	    'providerOptions': {
				// 	        'url': '//219.142.143.106:7090/rest/wmts/',
				// 	        'layer': '资源三号卫星影像',
				// 	        'style': 'default',
				// 	        'format': 'tiles',
				// 	        'tileMatrixSetID': '资源三号卫星影像',
				// 	        'minimumLevel': 0,
				// 	        'maximumLevel': 18,
				// 	        'tilingScheme': 'Geographic'
				// 	    }
				// 	};
				// if(hasAdd){
				// 	imageLayersManager.remove(imageLayersManager.length-1);//删除上一层叠加的影像
				// }
				// var index = imageLayersManager.length;
				// imageLayersManager.add(imageryLayerOptions, index-1);
				// hasAdd = true;

	            


	        },"toolbar_imagery_menu");
	       	Sandcastle.addToolbarButton('清除', function () {
	       		if(hasAdd){
					imageLayersManager.remove(imageLayersManager.length-1);//删除上一层叠加的影像
				}
				hasAdd = false;
	        },"toolbar_imagery_menu");
	       	Sandcastle.addToolbarButton('返回', function () {
	       		toolbarGoBack();
	        },"toolbar_imagery_menu");
	        
            function toolbarGoBack(){
                var elem = document.getElementById("toolbar_imagery_menu");
                while(elem.hasChildNodes()) //当elem下还存在子节点时 循环继续
                {
                    elem.removeChild(elem.firstChild);
                }
                document.getElementById("toolbar").style.display = "block";
            }
        },"toolbar");

