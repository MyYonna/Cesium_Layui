		var am = new Freedo.FdMicroApp.FdAnalysisManager(viewer);

        am.on(function (eventType, eventArg) {
            if (eventType == "DataChanged") {
                //console.log(eventArg);
                needSave = true;
            }
        })
        //添加工具条
        Sandcastle.addToolbarButton('空间测量', function () {
        	document.getElementById("toolbar").style.display = "none";
             Sandcastle.addToolbarButton('点量测', function () {
	            am.start('SINGLE_POINT');
	        },"toolbar_measure_menu");

	        Sandcastle.addToolbarButton('单点量测', function () {
	            am.start('SINGLE_POINT');
	            am.setSingleMode(true);
	        },"toolbar_measure_menu");

	        Sandcastle.addToolbarButton('直线量测', function () {
	            am.start('LINE_DISTANCE');
	        },"toolbar_measure_menu");

	        Sandcastle.addToolbarButton('折线量测', function () {
	            am.start('SEGMENTS_DISTANCE');
	            am.setSumPointMode(false);
	        },"toolbar_measure_menu");

	        Sandcastle.addToolbarButton('折线量测(累计长)', function () {
	            am.start('SEGMENTS_DISTANCE');
	            am.setSumPointMode(true);
	        },"toolbar_measure_menu");

	         Sandcastle.addToolbarButton('面量测', function () {
	            am.start('Polygon');
	        },"toolbar_measure_menu");

	        Sandcastle.addToolbarButton('高程量测', function () {
	            am.start('HEIGHT');
	        },"toolbar_measure_menu");

	        Sandcastle.addToolbarButton('夹角量测', function () {
	            am.start('ANGLE');
	        },"toolbar_measure_menu");

	        Sandcastle.addToolbarButton('清空数据', function () {
	            am.removeAll();
	        },"toolbar_measure_menu");
	        Sandcastle.addToolbarButton('取消', function () {
	            am.cancel();
	        },"toolbar_measure_menu");
	       	Sandcastle.addToolbarButton('返回', function () {
	       		am.cancel();
	       		am.removeAll();
                toolbarGoBack();
	        },"toolbar_measure_menu");

            function toolbarGoBack(){
                var elem = document.getElementById("toolbar_measure_menu");
                while(elem.hasChildNodes()) //当elem下还存在子节点时 循环继续
                {
                    elem.removeChild(elem.firstChild);
                }
                document.getElementById("toolbar").style.display = "block";
            }
        },"toolbar");


       
        var needSave = false;

        function writeToLocalStorage(prop, data) {
            if (!Freedo.defined(data)) {
                localStorage.removeItem(prop);
            } else {
                localStorage[prop] = JSON.stringify(data);
            }
        }

        function readFromLocalStorage(prop) {
            let rawData;
            if (typeof localStorage[prop] !== 'undefined') {
                try {
                    rawData = JSON.parse(localStorage[prop]);
                } catch (error) {
                    console.log(error);
                }
            }

            return rawData;
        }

        function save() {
            if (needSave) {
                writeToLocalStorage("surveyOptions", am.surveyOptions);
                needSave = false;
            }
        };

        function read() {
            let rawData = readFromLocalStorage("surveyOptions");
            am.surveyOptions = rawData;
        };

        setTimeout("read()", 1000);
        setInterval("save()", 1000);