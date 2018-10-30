
        var viewer_before,viewer_after,imageLayersManager_before,imageLayersManager_after;
        Sandcastle.addToolbarButton('专项变化', function () {
        	document.getElementById("toolbar").style.display = "none";
             Sandcastle.addToolbarButton('建筑变化', function () {
             	document.getElementById("freedoContainer").style.display = "none"
             	document.getElementById("freedoContainer_before").style.display = "inline-block";
             	document.getElementById("freedoContainer_after").style.display = "inline-block"
	            viewer_before = Freedo.FdApp.createDefaultViewer('freedoContainer_before');
				viewer_after = Freedo.FdApp.createDefaultViewer('freedoContainer_after');

				viewer_before.showLogo = false;
				viewer_after.showLogo = false;

				imageLayersManager_before = new Freedo.FdTools.FdImageryLayersManager(viewer_before);
				imageLayersManager_before.addTianDiTuImageryLayer();

				imageLayersManager_after = new Freedo.FdTools.FdImageryLayersManager(viewer_after);
				imageLayersManager_after.addDefaultImageryLayer();		     
			    var gView = {
		            v: "",
		            t: 0,
		            o: ""
		        };
		        var before = new FdMultiViewSync(gView, viewer_before, "before");
		        var after = new FdMultiViewSync(gView, viewer_after, "after");
			    before.run();
			    after.run();

	        },"toolbar_compare_menu");

            Sandcastle.addToolbarButton('道路变化', function () {
	            
	        },"toolbar_compare_menu");

	        Sandcastle.addToolbarButton('返回', function () {
	        	//清除对比球体中的内容
				clearCompareBall()
             	//最后再返回
             	toolbarGoBack();
	        },"toolbar_compare_menu");

	        function clearCompareBall(){
	        	//清楚对比球体中的内容
	       		var elem_before = document.getElementById("freedoContainer_before");
       		    while(elem_before.hasChildNodes()) //当elem下还存在子节点时 循环继续
			    {
			        elem_before.removeChild(elem_before.firstChild);
			    }

			    var elem_after = document.getElementById("freedoContainer_after");
       		    while(elem_after.hasChildNodes()) //当elem下还存在子节点时 循环继续
			    {
			        elem_after.removeChild(elem_after.firstChild);
			    }
			    document.getElementById("freedoContainer").style.display = "block";
			    document.getElementById("freedoContainer_before").style.display = "none";
             	document.getElementById("freedoContainer_after").style.display = "none";
             	//清除内存
             	viewer_before = null;
             	viewer_after = null;
             	imageLayersManager_before = null;
             	imageLayersManager_after = null;
	        }

	        function toolbarGoBack(){
				var elem = document.getElementById("toolbar_compare_menu");
			    while(elem.hasChildNodes()) //当elem下还存在子节点时 循环继续
			    {
			        elem.removeChild(elem.firstChild);
			    }
			    document.getElementById("toolbar").style.display = "block";
			}

         },"toolbar")
