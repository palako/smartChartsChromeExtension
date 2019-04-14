//chrome.extension.onConnect.addListener(function(port) {
//	port.onMessage.addListener(function receive(msg) {
//	  var tmp = document.createElement("div");
//	  tmp.innerHTML = msg;
//	  //alert(tmp.innerHTML);
//	});
//});
var PAPER_WIDTH=670;
var PAPER_HEIGHT=400;
var PAPER_PADDING=15;
var BUBBLE_MIN_SIZE = 5;

var min_mileage=9999999,max_mileage=0;
var min_price=9999999,max_price=0;
var min_year=9999999,max_year=0;

var cars = [];

var canvas = null; 

function Car() {
    this.mileage = 0;
    this.price = 0;
    this.year = 0;
    this.sold = false;
    this.domNode = null;
}

var smartCharts;
var canvas=null;
var paper =null;
var infoPanel;

//function harvest() {
//	var list=document.evaluate("//ul[@class='result_lv']/li/div", document, null, XPathResult.ANY_TYPE, null);
//	while(listItem = list.iterateNext()) {
//		var mileage=document.evaluate("./div[@class='summary']/ul/li[span[text()=\"Mileage: \"]]/span[2]", listItem, null, XPathResult.ANY_TYPE, null).iterateNext();
//		if(mileage!=null) mileage = mileage.innerHTML.replace("£","").replace("$","").replace(",","").trim();
//		var price=document.evaluate("./div[@class='contacts-price']/span[@class='ad-price']", listItem, null, XPathResult.ANY_TYPE, null).iterateNext();
//		if(price!=null) price = price.innerHTML.replace("£","").replace("$","").replace(",","").trim();
//		var headline=document.evaluate("./div[@class='summary']/h4/a[@class='headline-compact']", listItem, null, XPathResult.ANY_TYPE, null).iterateNext();
//		var match =headline.innerHTML.match(/.*\(([0-9]{4})\)$/);
//		if(match != null && match.length>0) {
//			year=match[1];
//		}
//		if(!isNaN(parseInt(mileage)) && !isNaN(parseInt(price))) {
//			 var car = new Car();
//		     car.mileage = mileage;
//		     if(car.mileage < 200) {
//		    	 car.mileage*=1000;//TODO: This is normally the case, some people say 113 instead of 113,000. False positives (but very few cars) are sold below 200miles
//		     }
//		     car.price = price;
//		   //*[@id="1307048"]/div/div[1]/div[1]/a/span
//			 var sold=document.evaluate("./div[@class='thumbnail']/div[@class='image image-full' | @class='image']/a/span[@class='sold img-link']", listItem, null, XPathResult.ANY_TYPE, null).iterateNext();
//			 if(sold != null) {
//				 car.sold = true;
//			 }
//			 car.year=year;
//			 car.domNode=listItem;
//		     cars.push(car);
//		}			
//	}
//}


function renderNavBar(smartCharts) {
    navBar = document.createElement("div");
    navBar.setAttribute("id", "navBar");
    smartCharts.appendChild(navBar);
    
    closeButton = document.createElement("img");
    closeButton.src=chrome.extension.getURL("WebContent/images/close.png");
    closeButton.setAttribute("title", "close");
    closeButton.setAttribute("alt", "close");
    closeButton.setAttribute("id", "closeButton");
    closeButton.onclick=function() {
    	document.body.removeChild(smartCharts);
    	smartCharts = document.getElementById("smartCharts");
        if(smartCharts != null) {
        	document.body.removeChild(smartCharts);
        }
    };
    navBar.appendChild(closeButton);

    minimizeButton = document.createElement("img");
    minimizeButton.src=chrome.extension.getURL("WebContent/images/minimize.png");
    minimizeButton.setAttribute("title", "minimize");
    minimizeButton.setAttribute("alt", "minimize");
    minimizeButton.setAttribute("id", "minimizeButton");
    minimizeButton.onclick=function() {
    	document.body.removeChild(smartCharts);
    	smartCharts = document.getElementById("smartCharts");
        if(smartCharts != null) {
        	document.body.removeChild(smartCharts);
        }
    };
    navBar.appendChild(minimizeButton);

    maximizeButton = document.createElement("img");
    maximizeButton.src=chrome.extension.getURL("WebContent/images/maximize.png");
    maximizeButton.setAttribute("title", "maximize");
    maximizeButton.setAttribute("alt", "maximize");
    maximizeButton.setAttribute("id", "maximizeButton");
    maximizeButton.onclick=function() {
    	document.body.removeChild(smartCharts);
    	smartCharts = document.getElementById("smartCharts");
        if(smartCharts != null) {
        	document.body.removeChild(smartCharts);
        }
    };
    navBar.appendChild(maximizeButton);
}

function renderControlPanel(smartcharts) {
    controlPanel = document.createElement("form");
    controlPanel.setAttribute("id", "controlPanel");
    smartCharts.appendChild(controlPanel);

    var priceVSMileage = document.createElement("input");
    priceVSMileage.setAttribute("type", "radio");
    priceVSMileage.setAttribute("id", "priceVSMileage");
    priceVSMileage.setAttribute("name", "setupOptions");
    controlPanel.appendChild(priceVSMileage);
    priceVSMileage.addEventListener("click", function() {
    	document.getElementById("xAxis").value="mileage";
    	document.getElementById("xAxisScale").removeAttribute("checked");
    	document.getElementById("yAxis").value="price";
    	document.getElementById("yAxisScale").removeAttribute("checked");
    	document.getElementById("zAxis").value="year";
    	document.getElementById("zAxisScale").setAttribute("checked", "checked");
    	document.getElementById("advancedSetupPanel").style.display="none";
    	draw();
    });
    
    var pVmLabelNode = document.createElement("label");
    pVmLabelNode.setAttribute("for", "priceVSMileage");
    pVmLabelNode.innerHTML = "Price / Mileage"; 
    controlPanel.appendChild(pVmLabelNode);
    
    controlPanel.appendChild(document.createElement("br"));

    var priceVSYear = document.createElement("input");
    priceVSYear.setAttribute("type", "radio");
    priceVSYear.setAttribute("id", "priceVSYear");
    priceVSYear.setAttribute("name", "setupOptions");
    controlPanel.appendChild(priceVSYear);

    priceVSYear.addEventListener("click", function() {
    	document.getElementById("xAxis").value="year";
    	document.getElementById("xAxisScale").setAttribute("checked", "checked");
    	document.getElementById("yAxis").value="price";
    	document.getElementById("yAxisScale").setAttribute("checked", "checked");
    	document.getElementById("zAxis").value="mileage";
    	document.getElementById("zAxisScale").setAttribute("checked", "checked");
    	document.getElementById("advancedSetupPanel").style.display="none";
    	draw();
    });
    
    var pVyLabelNode = document.createElement("label");
    pVyLabelNode.setAttribute("for", "priceVSYear");
    pVyLabelNode.innerHTML = "Price / Year (scaled)"; 
    controlPanel.appendChild(pVyLabelNode);

    controlPanel.appendChild(document.createElement("br"));

    var advancedSetup = document.createElement("input");
    advancedSetup.setAttribute("type", "radio");
    advancedSetup.setAttribute("id", "advancedSetup");
    advancedSetup.setAttribute("name", "setupOptions");
    controlPanel.appendChild(advancedSetup);
    
    advancedSetup.addEventListener("click", function() {
    	document.getElementById("advancedSetupPanel").style.display="block";
    });

    var advancedSetupLabelNode = document.createElement("label");
    advancedSetupLabelNode.setAttribute("for", "priceVSYear");
    advancedSetupLabelNode.innerHTML = "Advanced"; 
    controlPanel.appendChild(advancedSetupLabelNode);

    controlPanel.appendChild(document.createElement("br"));

    var advancedSetupPanel = document.createElement("div");
    advancedSetupPanel.setAttribute("id", "advancedSetupPanel");
    advancedSetupPanel.setAttribute("name", "advancedSetupPanel");
    advancedSetupPanel.style.display="none";
    controlPanel.appendChild(advancedSetupPanel);
    
    var dimensions = ["x", "y", "z"];
    var attributes = ["price", "mileage", "year"];
    var scaled = [false, false, true];
    var variableRange = [false, false, true];
    
    for(d=0; d<dimensions.length; d++) {
        var labelNode = document.createElement("label");
        labelNode.setAttribute("for", dimensions[d]);
        labelNode.innerHTML = dimensions[d] + " axis: "; 
        advancedSetupPanel.appendChild(labelNode);
        var axisNode = document.createElement("select");
        axisNode.setAttribute("id", dimensions[d]+"Axis");
        axisNode.setAttribute("name", dimensions[d]+"Axis");
        axisNode.addEventListener("change", function() {draw();});
        var axisReversed = document.createElement("input");
        axisReversed.setAttribute("type", "checkbox");
        axisReversed.setAttribute("title", "Reverse");
        axisReversed.setAttribute("id", dimensions[d]+"AxisReversed");
        axisReversed.addEventListener("change", function() {draw();});
        var axisScale = document.createElement("input");
        axisScale.setAttribute("type", "checkbox");
        axisScale.setAttribute("title", "Scale");
        axisScale.setAttribute("id", dimensions[d]+"AxisScale");
        if(scaled[d]) {
        	axisScale.setAttribute("checked", "checked");
        }
        axisScale.addEventListener("change", function() {draw();});
        
        for(i=0; i < attributes.length; i++) {
            var option = document.createElement("option");
            option.setAttribute("id", attributes[i]);
            option.setAttribute("value", attributes[i]);
            if(d==i) {
                option.setAttribute("selected", "selected");
            }
            option.innerHTML = attributes[i];
            axisNode.appendChild(option);
        }
        advancedSetupPanel.appendChild(axisNode);
        advancedSetupPanel.appendChild(axisReversed);
        advancedSetupPanel.appendChild(axisScale);
        if(variableRange[d]) {
        	var range = document.createElement("input");
        	range.setAttribute("type", "range");
        	range.setAttribute("style", "width: 60px; margin:5px; vertical-align:middle")
        	range.setAttribute("id", dimensions[d]+"Range");
        	range.setAttribute("name", dimensions[d]+"Range");
        	range.setAttribute("min", 5);
        	range.setAttribute("max", 60);
        	range.setAttribute("value", 20);
        	range.addEventListener("change", function() {draw();});
            advancedSetupPanel.appendChild(range);
        }
        advancedSetupPanel.appendChild(document.createElement("br"));
    }	
}

function renderInfoPanel(smartCharts) {
	
	//This emulates the wrapper in the original page to achieve the same look without rewriting the CSS
	w0 = document.createElement("div");
    w0.setAttribute("class", "default-view");
    smartCharts.appendChild(w0);
    w1 = document.createElement("div");
    w1.setAttribute("class", "results-list");
    w0.appendChild(w1);
    w2 = document.createElement("ul");
    w2.setAttribute("class", "result_lv");
    w1.appendChild(w2);
    w3 = document.createElement("li");
    w3.setAttribute("class", "product");
    w2.appendChild(w3);
    
    infoPanel = document.createElement("div");
    infoPanel.setAttribute("id", "infoPanel");
    w0.setAttribute("style", "position:relative; float:left; clear:left; border:1px solid #aaaaaa;width:670px; margin: 10px");
    infoPanel.setAttribute("class", "default-view");
    w2.appendChild(infoPanel);
}

function showCarDetails(car) {
    console.log("show car details");
	panel = document.getElementById("infoPanel");
    if(panel != null) {
    	while (panel.firstChild) {
    	    panel.removeChild(panel.firstChild);
    	}
    	panel.appendChild(car.domNode);
    }
}

function init() {
	for (i=0; i<cars.length;i++) {
        var car = cars[i];
        min_mileage = Math.min(car.mileage,min_mileage);
        min_price = Math.min(car.price,min_price);
        min_year = Math.min(car.year,min_year);
        max_mileage = Math.max(car.mileage,max_mileage);
        max_price = Math.max(car.price,max_price);
        max_year = Math.max(car.year,max_year);
    }
    
    smartCharts = document.getElementById("smartCharts");
    if(smartCharts != null) {
    	document.body.removeChild(smartCharts);
    }
    
    smartCharts = document.createElement("div");
    smartCharts.setAttribute("id", "smartCharts");
    document.body.appendChild(smartCharts);

    renderNavBar(smartCharts);
    
    canvas = document.createElement("div");
    canvas.setAttribute("id", "canvas");
    canvas.setAttribute("style", "width:"+PAPER_WIDTH+"px; height:"+PAPER_HEIGHT+"px;");
    smartCharts.appendChild(canvas);
    
    renderControlPanel(smartCharts);
    renderInfoPanel(smartCharts);

    draw();
}

function draw() {
    xAxis = document.getElementById("xAxis").value;
    yAxis = document.getElementById("yAxis").value;
    zAxis = document.getElementById("zAxis").value;
    zDepth = parseInt(document.getElementById("zRange").value);
    
    var maxX = eval("max_"+xAxis);
    var minX = document.getElementById("xAxisScale").checked ? eval("min_"+xAxis) : 0;
    var widthSpan = maxX - minX;
    var maxY = eval("max_"+yAxis);
    var minY = document.getElementById("yAxisScale").checked ? eval("min_"+yAxis) : 0;
    var heightSpan = maxY - minY;
    var maxZ = eval("max_"+zAxis);
    var minZ = document.getElementById("zAxisScale").checked ? eval("min_"+zAxis) : 0;
    var zSpan = maxZ - minZ;
    //TODO: Fix divisions by zero case
    var zScale = (zDepth-BUBBLE_MIN_SIZE)/ zSpan;
    var padding = PAPER_PADDING + zDepth;
    var wScale = (PAPER_WIDTH-2*padding) / widthSpan;
    var hScale = (PAPER_HEIGHT-2*padding) / heightSpan;
    
    if(canvas == null || paper == null) {
    	paper = Raphael("canvas", PAPER_WIDTH, PAPER_HEIGHT);
    } 
    
    paper.clear();
    paper.path("M"+PAPER_PADDING + " " + (PAPER_HEIGHT-PAPER_PADDING) + "L"+(PAPER_WIDTH-PAPER_PADDING) + " " + (PAPER_HEIGHT-PAPER_PADDING));
    paper.path("M"+PAPER_PADDING + " " + PAPER_PADDING + "L"+PAPER_PADDING + " "+(PAPER_HEIGHT-PAPER_PADDING));
    paper.text(PAPER_WIDTH-PAPER_PADDING, PAPER_HEIGHT-PAPER_PADDING/2, xAxis).attr({'text-anchor': 'end'});
    paper.text(PAPER_PADDING/2, PAPER_PADDING, yAxis).rotate(270).attr({'text-anchor': 'end'});
    
    for(i=0; i<cars.length; i++) {
        var car = cars[i];
        var x = eval("car."+xAxis);
        var y = eval("car."+yAxis);
        var z = eval("car."+zAxis);
        xVal = (x-minX)*wScale;
        yVal = (y-minY)*hScale;
        zVal = (z-minZ)*zScale;
        if(document.getElementById("xAxisReversed").checked) {
            xVal = PAPER_WIDTH - xVal - 2*padding;
        }
        
        if(document.getElementById("yAxisReversed").checked) {
            yVal = PAPER_HEIGHT - yVal - 2*padding;
        }
        
        if(document.getElementById("zAxisReversed").checked) {
            zVal = zDepth - zVal;
        }
        var circle = paper.circle(padding+xVal, 
                                  PAPER_HEIGHT-(padding+yVal), 
                                  BUBBLE_MIN_SIZE+zVal);
                                  
        if(cars[i].sold) {
        	circle.attr("fill", "rgba(233,197,197,1.0)");
            circle.attr("stroke", "rgba(180,59,59,1.0)");
        } else {
        	circle.attr("fill", "#365594");
        	circle.attr("fill-opacity", 0.5);
            circle.attr("stroke", "#365594");
        }
        circle.data("car" , cars[i]); 
        circle.click(function() {showCarDetails(this.data("car"));});
        circle.hover(function() {this.g = this.glow({color:this.attr('fill')});}, function() {this.g.remove();});
    }
}
harvest();
init();