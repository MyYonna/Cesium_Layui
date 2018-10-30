layui.use(['laytpl','layer'], function(){
	var laytpl = layui.laytpl;
	var $ = layui.jquery, layer = layui.layer; 
	var getTpl = parkinfoTemplate.innerHTML,view = document.getElementById('parkinfo');
	//利用layui前端模板引擎渲染页面
	function loadParkInfo(infoType,parkIndex){
		var url = "./static/data/"+infoType+parkIndex+".json";
		var index = null;
		 $.ajax({
	      url : url,
	      type : 'get',
	      // dataType : 'json',
	     //  data:{},
	      beforeSend: function (request) {
	       index = layer.load();
	      },
	      success : function(jsonObject) {
	            layer.close(index);
	            var data = {
	            	data:jsonObject.data,
	            	filed:FiledInfo.ParkBasicInfo
	            }
			    laytpl(getTpl).render(data, function(html){
				  view.innerHTML = html;
				  showParkInfo(jsonObject.title);
				});
	      } ,
	      error:function(e){
	            layer.close(index);
	      }               
	    });
	}


	//显示园区有关的信息
	function showParkInfo(title){
	  var index = layer.open({
	     type: 1 
	    ,title: title
	    ,area: ['390px', '500px']
	    ,shade: 0
	    ,maxmin: true
	    ,offset: [ 
	       10,
	       170
	    ] 
	    ,content: $("#parkinfo")
	    ,btn: ['刷新', '关闭'] //只是为了演示
	    ,yes: function(){
	      console.log("reloadData")
	    }
	    ,btn2: function(){
  	    	 layer.close(index)
			 document.getElementById('parkinfo').innerHTML = "";
			 document.getElementById('parkinfo').style.display = "none"
	    }
	    ,zIndex: layer.zIndex //重点1
	    ,success: function(layero){
	      layer.setTop(layero); //重点2
	    },
	    cancel: function(index, layero){ 
	    	 layer.close(index)
			 document.getElementById('parkinfo').innerHTML = "";
			 document.getElementById('parkinfo').style.display = "none"
		  return false; 
		} 
	  });
    }
    //加入显示园区信息的按钮
     Sandcastle.addToolbarButton('园区信息', function () {
        	document.getElementById("toolbar").style.display = "none";
             Sandcastle.addToolbarButton('园区基本情况', function () {
	           loadParkInfo("ParkBasicInfo",1);
	        },"toolbar_parkinfo_menu");

	        Sandcastle.addToolbarButton('产业融合情况', function () {
	            loadParkInfo("IndustryIntergrationInfo",1);
	        },"toolbar_parkinfo_menu");

	        Sandcastle.addToolbarButton('土地流转情况', function () {
	           loadParkInfo("LandTransferInfo",1);
	        },"toolbar_parkinfo_menu");

	        Sandcastle.addToolbarButton('投资收益情况', function () {
	           loadParkInfo("InvestmentIncomeInfo",1);
	        },"toolbar_parkinfo_menu");

	        Sandcastle.addToolbarButton('投融资情况', function () {
	           loadParkInfo("InvestmentFinancingInfo",1);
	        },"toolbar_parkinfo_menu");

	         Sandcastle.addToolbarButton('品牌建设情况', function () {
	            loadParkInfo("BrandBuildingInfo",1);
	        },"toolbar_parkinfo_menu");

	        Sandcastle.addToolbarButton('科技创新情况', function () {
	           loadParkInfo("TechnicalInnovationInfo",1);
	        },"toolbar_parkinfo_menu");

	       	Sandcastle.addToolbarButton('返回', function () {
                toolbarGoBack();
	        },"toolbar_parkinfo_menu");

            function toolbarGoBack(){
                var elem = document.getElementById("toolbar_parkinfo_menu");
                while(elem.hasChildNodes()) //当elem下还存在子节点时 循环继续
                {
                    elem.removeChild(elem.firstChild);
                }
                document.getElementById("toolbar").style.display = "block";
            }
        },"toolbar");

});
 

 

      