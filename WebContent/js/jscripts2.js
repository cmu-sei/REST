// Global variables 
var baseUrl="../cgi-bin/tools/geoip.py?ip=";
baseUrl="DBCon?jndisource=jdbc/geoip&querytype=geoipsearch&out_type=jquery&ip=";
var query = {};
var data = {}; // This is the data pile list/dictionary for markers and such
var testData = {} // This is the data pile list/dictionary for Heatmap and simulation
var gmarker; // Max value marker
var layer; // Current layer
var bounds = { maxlat: -90, minlat: 90, maxlong: -180, minlong: 180 }; // This is our world!
var timeint; // This is the timer clearinterval function.
var map; // A global map 
var baseLayer; // This is the base layer where map is built
var mgradient = {
	0.1 : "rgba(0,255,0,1)",
	0.25 : "rgba(64,255,0,1)",
	0.50: "rgb(255,255,0)",
	0.75 : "rgb(255,128,0)",
	0.83 : "rgb(255,64,0)",
	1.0 : "rgba(255,0,0,1)"
	}
//Cluster map related global variables
var tk=-1;
var clusterdata=[];
var old_clusterdata=[];
var alltotal=0;
var gradient = [   'rgba(0, 255, 0, 1)',
          /*'rgba(32, 255, 0, 1)',
                    'rgba(64, 255, 0, 1)',
                    'rgba(96, 255, 0, 1)',
                    'rgba(128, 255, 0, 1)',*/
                    'rgba(160, 255, 0, 1)',
                    'rgba(192, 255, 0, 1)',
                    'rgba(224, 255, 0, 1)',
                    'rgba(255, 255, 0, 1)',
                    'rgba(255, 192, 0, 1)',
                    'rgba(255, 128, 0, 1)',
                    'rgba(255, 64, 0, 1)',
                    'rgba(255, 32, 0, 1)',
                    'rgba(255, 0, 0, 1)' ];
var polyline=[];
function update_datasource(nsource) {
if (baseUrl.indexOf('querytype=') > 0)
	baseUrl=baseUrl.replace(/querytype=[^\&]+/,'querytype='+nsource);
else
	baseUrl=baseUrl.replace('?','?querytype='+nsource+'&');
}
function listLength(mlist) {
var i=-1;
for (key in mlist) i++;
return i;
}


function process(data,batch,zoomIn) {
	if(data.error) { alert(data.error); return; }
	if(data.gdata)
		if(data.gdata.length < 1) { alert("None of the IP addresses you requested can be found"); return false;}
      for (var i=0; i < data.gdata.length; i++) {
        xdata=data.gdata[i];   
        if($.trim(xdata.latitude) != '' && !isNaN(xdata.latitude)){ //Geocoding successfull
		  var latitude = xdata.latitude;
		  var longitude = xdata.longitude;
		  console.log(latitude+":"+longitude);
		  setmaxmin(latitude,longitude);
		  var contentString = stringify(xdata);
		  var marker = L.marker([latitude, longitude]).addTo(map);
		  polyline.push(new L.LatLng(latitude,longitude));
		  marker.bindPopup(contentString);
		} else {
		  if(!batch) 
		   alert('IP Address provided is not valid or not seen in the Location database : '+data.gdata[i].ip);
		   continue;
		};
      }
      if(zoomIn) 
    	  map.fitBounds(new L.LatLngBounds(polyline));

//      console.log(bounds);
      
     	 
// Make last marker available to others
      gmarker=marker;
}
function stringify(lObject) {
	var stringer="";
	$.each(lObject, function(key, val) {
	          if(val)
	   stringer += '<b>' + key.toUpperCase().replace("_", " ") + ':</b> ' + val + '<br />';
			 });
	//if (lObject['ip']) 
	   //stringer+='<a href="javascript:siednslookup('+"'"+lObject.ip+"'"+','+lObject.latitude+','+lObject.longitude+');">SIE DNS Lookup </a><div id="zoomin" class="zoomclass" align="center"></div>'
	return stringer;
}

function siednslookup(ip,lat,long) {
  var contentString="<table cellpadding=0 cellspacing=0 style='table-layout: fixed;'><tr><td align='right'><a href='javascript:HideDiv(\"zoomin\")'>X</a></p></td></tr><tr><td align='left' style='word-wrap: break-word; word-break: break-all;'>";
  batch=true;
    var url = encodeURI('../cgi-bin/tools/sielookup.py?ip='+ip+"&callback=?"); //geocoding url
    $.getJSON(url, function(data) { 
	
	for(i=0;i<data.gdata.length;i++) contentString += stringify(data.gdata[i])+'----<br/>';
	contentString+="</td></tr></table>";
	ShowDiv('zoomin',contentString);
	});
   return 0;
}

function addIPMarker(ip,batch) {
//  var contentString;
	if(document.getElementById('upload_process'))
		document.getElementById('upload_process').style.visibility = 'visible';
    var url = encodeURI(baseUrl + ip + "&callback=?"); //geocoding url
    var qty = ip.split("&").length;
    $.getJSON(url, function(data) { 
    	process(data,batch,true); 
    	if(data.gdata)
    		if(data.gdata.length < qty) {
    			if(document.getElementById('debug')) {
    				toggleView('debug');
    				document.getElementById('debug').innerHTML="Some data was not represented provided data elements: "+data.gdata.length+", processed data elements:"+qty;
    				console.log("Some data was not represented "+data.gdata.length+":"+qty);
    			}
    		}
    		addpolyline();
    		if(document.getElementById('upload_process'))
    			document.getElementById('upload_process').style.visibility = 'hidden';
    		});
}

function setmaxmin(lat,long) {
  if(lat>bounds.maxlat) bounds.maxlat=lat;
  if(lat<bounds.minlat) bounds.minlat=lat;
  if(long>bounds.maxlong) bounds.maxlong=long;
  if(lat<bounds.minlong) bounds.minlong=long;
}

function addIPArray(ipArray,type){
/* JQuery way of doing this
  ipArray = $.grep(ipArray, function(v, k){
		 return $.inArray(v ,ipArray) === k;
	       });
*/
  // Get only unique array elements
	polyline=[];
  ipArray = unik(ipArray);
  if (ipArray.length > 10000) {
    alert("too many IP addresses limiting this to 10000 limit");
    ipArray.splice(0,ipArray.length-10000);
  }
    if(type === "Marker")
      addIPMarker(ipArray.join("&ip="),false);
    else { // HeatMap or ClusterMap
    	if(document.getElementById('upload_process'))
    		document.getElementById('upload_process').style.visibility = 'visible';
	var url = encodeURI(baseUrl + ipArray.join("&ip=") + "&callback=?"); //geocoding url
        $.getJSON(url, function(data) { 
	    var ldata={}; // temp hash
	    var mdata=[]; // temp array
	    var mmax=0;
	    for (var i=0; i < data.gdata.length; i++) {
		xdata=data.gdata[i];
		if($.trim(xdata.latitude) != '' && !isNaN(xdata.latitude)){ //Geocoding successfull 
		    var f=Math.round(xdata.latitude)+'|'+Math.round(xdata.longitude);
		    if(f in ldata) ldata[f]++;
		    else ldata[f]=1;
		    if(ldata[f] > mmax) { mmax=ldata[f]; testData['max_loc']=xdata; testData['max_loc']['value']=mmax; };
		    polyline.push(new L.LatLng(xdata.latitude,xdata.longitude));
		};
	    } // Finished the full JSON data stream
	    for (var k in ldata) { // convert data to testData model for heatmap or ClusterMap
		var p=k.split("|");
		mdata.push({ 'lat': p[0] , 'lon' : p[1], 'value' : ldata[k]});
	    }
	    testData['total_ip']=ipArray.length;
	    testData['total_locations']=mdata.length;
	    testData['ignored']=ipArray.length-data.gdata.length;
	    testData['data']=mdata;
	    testData['max']=mmax; 
            alert('Rendering new data');
        picture_bar=" Total Unique IP addresses processed <b>"+testData.total_ip+"</b>, IP rows ignored <b>"+testData.ignored+"</b>, Total Locations seen <b>"+testData.total_locations+"</b>"
            if(layer) map.removeLayer(layer);
            if(gmarker) map.removeLayer(gmarker);
            if(testData.max_loc);
            	picture_bar += plot_max_loc(testData.max_loc);
	    buildMap(type);
	    document.getElementById('progress_bar').innerHTML=picture_bar;
	    document.getElementById('progress_bar').style.visibility='visible';
    	if(document.getElementById('upload_process'))
    		document.getElementById('upload_process').style.visibility = 'hidden';
	    map.fitBounds(new L.LatLngBounds(polyline));
	});
    }; // HeatMap or ClusterMap
}

function addpolyline() {
   if(!document.getElementById('tracepath')) return;
   if(!document.getElementById('tracepath').checked) return;
   if(polyline.length > 1) {
	var firstpolyline = new L.Polyline(unik(polyline), {color: 'red',weight: 1,opacity: 0.9,smoothFactor: 1}).addTo(map)
//	alert('Trying polyline');
}
}

function unik(p) {
// Create a unique array
	var h={};
	var t=[]
	for(var i=0;i<p.length;i++) {
    		if(!h[p[i]]) { t.push(p[i]); h[p[i]]=true; }
	}
	return t
}

function toggleView(divId) {
  var ele = document.getElementById(divId);
  if(!ele) return;
  //  var text = document.getElementById("displayText");
  if(ele.style.display == "block") {
    ele.style.display = "none";
    //    text.innerHTML = "show";
  }
  else {
    ele.style.display = "block";
    //    text.innerHTML = "hide";
  }
}

function startUpload(){
    document.getElementById('progress_bar').innerHTML="Upload: ";
    document.getElementById('progress_bar').style.visibility = 'hidden';
    document.getElementById('upload_process').style.visibility = 'visible';
    return true;
}
function endUpload(type){
    document.getElementById('upload_process').style.visibility = 'hidden';
    document.getElementById('progress_bar').style.visibility = 'visible';
    var picture_bar;
    if (type === "Marker") { 
        alert('Displaying uploaded data');
        if(data.gdata.length>100) {
	    data.gdata.splice(0,data.gdata.length-100)
//	    console.log("Too many items where returned limiting to first 100")
	    }
	    process(data,true,true);
	    picture_bar=data.blob;
    }
    if (type === "HeatMap") {
        alert('Rendering new data');
	picture_bar=" Total Unique IP addresses processed <b>"+testData.total_ip+"</b>, IP rows ignored <b>"+testData.ignored+"</b>, Total Locations seen <b>"+testData.total_locations+"</b>"
	if(layer) map.removeLayer(layer);
	if(gmarker) map.removeLayer(gmarker)
//Max Location if found can be plotted
//As max location is derived data it looks like max_loc =  {latitude:30.05, longitude:31.25, value: 57302} 
	if(testData.max_loc)  
	   picture_bar += plot_max_loc(testData.max_loc);
	updateMap();
    }
    if (type === "HeatFlow") {
        jtime=0;
	if(layer)
		map.removeLayer(layer);
	randfile=testData.randfile;
	jtimemax=testData.jtimemax;
	var ipcount=testData.ipcount;
	var ignored=testData.ignored;
	var total_locations=testData.total_locations;
	var bin_time=testData.bin_time;
	picture_bar ="["
	for(var j=0;j<jtimemax;j++) {
	 picture_bar += "<a href='javascript:babystep("+j+")'><img src='empty.gif' id=step"+j+" width='10' border='0' style='border-bottom: 1px solid red;'/></a>";
   	}
        picture_bar+="] @ <input type='text' name='timestamp' id='timestamp' /><br />Total IP addresses processed <b>"+ipcount+"</b>, IP's ignored <b>"+ignored+ "</b>, Total Locations seen <b>"+total_locations+"</b> Time bins in this simulation <b>"+jtimemax+"</b> Each time bin is <b>"+bin_time+" seconds</b>"
//Add the first array to testData.data
    testData.data=[];
    document.getElementById('progress_bar').innerHTML=picture_bar
    alert("Begin Simulation");
    dataSimulate();
    if(testData.max_loc)  // plot the max location with more details.
	   picture_bar += plot_max_loc(testData.max_loc);
    }
    if (type === "ClusterMap") { 
	tk=-1;
	clusterdata=[];
	old_clusterdata=[];
	alltotal=0;
	picture_bar=" Total Unique IP addresses processed <b>"+testData.total_ip+"</b>, IP rows ignored <b>"+testData.ignored+"</b>, Total Locations seen <b>"+testData.total_locations+"</b>"
	if(layer) map.removeLayer(layer);
	if(gmarker) map.removeLayer(gmarker)
//Max Location if found can be plotted
//As max location is derived data it looks like max_loc =  {latitude:30.05, longitude:31.25, value: 57302} 
	if(testData.max_loc)  
	   picture_bar += plot_max_loc(testData.max_loc);
	alert("Rendering new data");
	clusterMap();
	}
	if(testData.myrand) {
	   picture_bar += "Link to share these results : "+location.href.split('?')[0]+'?shared='+testData.myrand
	}
    document.getElementById('progress_bar').innerHTML=picture_bar
}
  function plot_max_loc(max_loc) {
	 	data={ gdata : [max_loc] }
	 	process(data,true,false);
		var myIcon = L.icon({
		    iconUrl: 'js/leaflet/images/marker-icon-red.png',
		    iconSize: [12, 20],
		    iconAnchor: [8, 18],
		    popupAnchor: [-3, -76],
		    shadowUrl: 'js/leaflet/images/marker-shadow.png',
		    shadowSize: [24, 20]
		});
		gmarker.setIcon(myIcon);
		var picture_bar_addon = ", Max ("+testData.max_loc.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')+") Location is @ : <input type='image' src='js/leaflet/images/marker-icon-red.png' width='10' border='0' onclick='gmarker.openPopup(); return false;' /></a> <button onclick='map.hasLayer(gmarker) ? map.removeLayer(gmarker) : map.addLayer(gmarker); return false;'>Toggle Max Marker</button> "
	       return picture_bar_addon;
	}

  function dataSimulate()
  {

    timeint=setInterval(function(){mTimer()},1500); // every 5 seconds
  }
  function babystep(j) {
	map.removeLayer(layer);
	for (var i=0; i<jtimemax; i++)
      		document.getElementById('step'+i).src="empty.gif";
	testData.data=[];
	for (var i=0;i<=j;i++) 
		testData.data.push.apply(testData.data,testData.fdata[i]),
      		document.getElementById('step'+i).src="play2.png";
	if (testData.timestamp[j])
		document.getElementById('timestamp').value=testData.timestamp[j]
	updateMap();
}
  function mTimer()
  {
      if(jtime>=jtimemax) { clearInterval(timeint); timer=null; alert("Show is over"); return; };
      document.getElementById('step'+jtime).src="play2.png";
//	alert(jtime);
	var jstart=testData.data.length;
	var jend=testData.data.length+testData.fdata[jtime].length
	for(var j=jstart;j<jend;j++)
		testData.data[j]=testData.fdata[jtime][j-jstart];
	if(layer)
		map.removeLayer(layer);
	if (testData.timestamp[jtime])
		document.getElementById('timestamp').value=testData.timestamp[jtime]
	updateMap();
	jtime++;
}
            function addMoreData(ndata) {
                testData.data.push.apply(testData.data,ndata)
		layer.addData(testData.data);
                map.removeLayer(layer)
                map.addLayer(layer)
	        return layer;
            }

		function update_barIndex(gradient,min,max) {
		 gdiv=[]
		 for(key in gradient) gdiv.push(key);
		 hdiv=new Array(gdiv.length)
		 hdiv[0]=min
		 hdiv[gdiv.length-1]=max
		 gdiv.sort(function(a,b){return a-b});
		 barHtml="";
		 for(var i=0; i<gdiv.length; i++) {
		  var inner = hdiv[i] ? hdiv[i] : ""
		  inner=inner.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
		  barHtml += "<div id='bar"+i+"' style='background: "+gradient[gdiv[i]]+"; height: 24px; width: 18px; font-size: 12px;'>"+inner+"</div>"
		 }
		    if(document.getElementById('barIndex'))
			document.getElementById('barIndex').innerHTML=barHtml
		}


		function toggleGrayscale_old() {
		var allimg = document.getElementsByTagName( 'img' );
	        for( i = allimg.length-1; i >= 0 ; i-- ) {
		   if  (allimg[i].className.indexOf("leaflet-tile-loaded") > 0) {
		      if (allimg[i].className.indexOf("grayscale") < 0) {
		            oldclass=allimg[i].className
			    allimg[i].className += " grayscale"
			  } else {
			    allimg[i].className =oldclass;
			  }
		   }
		}
		}
	      function toggleHeatmap() {
        	map.hasLayer(layer) ? map.removeLayer(layer) : map.addLayer(layer)
	      }
		function toggleGrayscale() {
			if (baseLayer._url.search('Grey') > -1)
				baseLayer.setUrl('/tools/0to4/{z}/{x}/{y}.png')
			else 
				 baseLayer.setUrl('/tools/Grey/0to4/{z}/{x}/{y}.png')
		}

		function updateMap() {
		   var heatmapLayer = L.TileLayer.heatMap({
				radius: 14,
				opacity: 0.9,
				gradient: mgradient
			});
		heatmapLayer.addData(testData.data);
		map.addLayer(heatmapLayer);
		// make accessible for other routines globally
		var tarray = [];
		testData.data.forEach(function(item){
		            tarray.push(item.value || item.count);
			   });
                min= Math.min.apply(Math, tarray);
		var barend=listLength(mgradient);
	        if(document.getElementById('bar0')) 
		    document.getElementById('bar0').innerHTML=min,
		    document.getElementById('bar'+barend).innerHTML=heatmapLayer._cache.max
	        else
		    update_barIndex(mgradient,min,heatmapLayer._cache.max);
		layer = heatmapLayer;
		}
			function buildMap(type) {
			    if(!baseLayer)
				baseLayer = L.tileLayer(
			'/tools/0to4/{z}/{x}/{y}.png',{ attribution: 'Map data Centaur Operations DISA &copy;',
			maxZoom: 17,
                         minZoom: 0
			}
				);
			    if(!map) 
 				map = new L.Map('map', {
					center: new L.LatLng(0, 0), // Lets go to the center of the earth
					zoom: 2,
					layers: [baseLayer]
				});
			    //else // Show the whole maps
				//map.setZoom(2)
			if(type === "HeatMap")
				updateMap();
			if(type === "ClusterMap")
				clusterMap();
			}
var markers;
function clusterMap() {
		markers = new L.MarkerClusterGroup({ iconCreateFunction: function(cluster) {
                                               var c = ' marker-cluster-custom-';
                                               tk++;
                                               var children = cluster.getAllChildMarkers();
                                               var total = 0;
                                               for (var i = 0; i < children.length; i++) {
                                               total += children[i]._count;
                                               }
                                               clusterdata[tk]=total;
                                               c+=tk;
                                               register_class(tk)
//                                               console.log("Current valur of tk is "+tk)
                                               return new L.DivIcon({ html: '<div><span>' + total +'</span></div>', className: 'marker-cluster' + c, iconSize: new L.Point(40, 40) });
                                               
                                               }});

        var markersArray = [];
        for (var i = 0; i < testData.data.length; i++) {
            var a = testData.data[i];
			var title = a.value;
            if( a.lat == undefined ) { alert("Address Point missing for index 0 "+i+","+a.lat+","+a.lon); continue; }
            if( a.lon == undefined ) { alert("Address Point missing for index 1 "+i+","+a.lat+","+a.lon); continue; }

            var thisIcon = L.divIcon({ html: '<div><span>'+title+'</span></div>',className: 'marker-cluster marker-cluster-custom-default', iconSize: new L.Point(40, 40) });
            var m = new L.Marker(new L.LatLng(a.lat, a.lon), { title: title, icon: thisIcon });
            m.bindPopup(title.toString());
            m._count = parseInt(a.value)
	    alltotal += m._count;
            markersArray.push(m);
        }
        
        markers.addLayers(markersArray);
        map.addLayer(markers);
// make layer available for others to work with.
	layer=markers;
        update_colors(map.getZoom());
        map.on("zoomstart", function() {
               var zoom=map.getZoom();
//		console.log("Zoom at this stage on zoomstart is "+zoom+":"+clusterdata.length);
               if(!old_clusterdata[zoom]) {
                old_clusterdata[zoom]=new Array(clusterdata.length)
               //We cant avoid this loop of Javascript like java will make these pointers to each other and on emptying clusterdata old_clsuterdata will become 0 length too
                for(j=0;j<clusterdata.length;j++) old_clusterdata[zoom][j]=clusterdata[j]
               }
//               console.log("zoom before is "+map.getZoom());
	       tk=-1
	       clusterdata=[]
               });
        map.on("zoomend", function(){ 
               var zoom = map.getZoom()
//		console.log("Zoom at this stage on zoomend is "+zoom+":"+clusterdata.length);
		update_colors(zoom)
               });
}
        function register_class(j) {
  
                document.styleSheets[0].insertRule(".marker-cluster-custom-"+j+" { background-color: rgba(128,128,128,0.6) }",0);
                document.styleSheets[0].insertRule(".marker-cluster-custom-"+j+" div { background-color: rgba(128,128,128,0.4) }",0
);
                
          
        }
        function update_colors(zoom) {
	    if(old_clusterdata[zoom]) {
		clusterdata=[]
                for(j=0;j<old_clusterdata[zoom].length;j++) clusterdata[j]=old_clusterdata[zoom][j];
	} else if(clusterdata.length < 1) {
//			console.log("Problem updating colors at this layer "+zoom+":"+clusterdata.length);
			return false;
		}

            var mintotal=Infinity;
            var maxtotal=1;
            for (j=0;j<clusterdata.length;j++) {
                if(clusterdata[j]> maxtotal) maxtotal=clusterdata[j];
                if(clusterdata[j]< mintotal) mintotal=clusterdata[j];
            }
            //console.log("Max total is "+maxtotal)
            for(j=0;j<clusterdata.length;j++) {
                var myObj=document.getElementsByClassName("marker-cluster-custom-"+j);
                //alert(myObj.length)
                mycolor=Math.round(clusterdata[j]*gradient.length/maxtotal);
                //alert(mycolor);
                if(mycolor > gradient.length-1) mycolor=gradient.length-1;
                for(var i=0; i<myObj.length; i++){
                    myObj[i].style.background = gradient[mycolor];
                };
            }
//	console.log("Min Data is "+mintotal)
//	console.log("Max Data is "+maxtotal)
            document.getElementById('bar1').innerHTML=mintotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            document.getElementById('bar14').innerHTML=maxtotal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            return true;
        }

function readform()
{
  var qstr = window.location.search.substring(1);
  var a = qstr.split('&');
  for (var i in a)
  {
    var b = a[i].split('=');
    query[decodeURIComponent(b[0])] = decodeURIComponent(b[1]);
  }

  return query;
}
function HideDiv(d) {
	if(d.length < 1) { return; }
	document.getElementById(d).style.display = "none";
}
function ShowDiv(d,txt) {
	if(d.length < 1) { return; }
	document.getElementById(d).innerHTML=txt;
  	document.getElementById(d).style.display = "block";
}


