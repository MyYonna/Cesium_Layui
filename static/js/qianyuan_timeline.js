new Freedo.Timeline(document.getElementById("timeLineContainer"), new Freedo.Clock({
               startTime : Freedo.JulianDate.fromIso8601("2013-12-25"),
               currentTime : Freedo.JulianDate.fromIso8601("2015-10-19"),
               stopTime : Freedo.JulianDate.fromIso8601("2018-12-26"),
               clockRange : Freedo.ClockRange.LOOP_STOP,
               clockStep : Freedo.ClockStep.SYSTEM_CLOCK_MULTIPLIER,
               multiplier : 86400
        }))

        var times = Freedo.TimeIntervalCollection.fromIso8601({ 
            iso8601: '2013-07-30/2017-06-16/P1M', 
            leadingInterval: true, 
            trailingInterval: true, 
            isStopIncluded: false, 
            dataCallback: dataCallback 
            });

        function dataCallback(interval, index) { 
            console.log(index); 
            var time; 
            if (index === 0) { 
                time = Freedo.JulianDate.toIso8601(interval.stop); 
            } else { 
                time = Freedo.JulianDate.toIso8601(interval.start); 
            } 
            return { Time: time }; 
        }


        var provider = new Freedo.WebMapTileServiceImageryProvider({ url : 'https://gibs.earthdata.nasa.gov/wmts/epsg4326/{best}/{Layer}/{Style}/{Time}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png', 
            layer : 'AMSR2_Snow_Water_Equivalent', 
            style : 'default', 
            tileMatrixSetID : '2km',
            maximumLevel : 5, 
            format : 'image/png',
            clock: viewer.clock, 
            times: times, 
            credit : new Freedo.Credit({
                text: 'NASA Global Imagery Browse Services for EOSDIS'
            }),
             dimensions: { 
                Layer : 'AMSR2_Snow_Water_Equivalent',
                best: 'best' 
             }
           });

        var imageryLayers = viewer.imageryLayers;
        imageryLayers.addImageryProvider(provider);

        var pm = new Freedo.FdMicroApp.FdPickPMComponent(viewer);
        pm.start();
        pm.setHighlightColor(224, 153, 56, 0.9);
        pm.setSingleMode(true);
        pm.setMode('HIGH_LIGHT');