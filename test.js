var PAPER_WIDTH=640;
var PAPER_HEIGHT=480;
var PAPER_PADDING=15;
var PAPER_DEPTH=30; //max difference between bubble sizes
var BUBBLE_MIN_SIZE = 5;

    
var mileages = [100, 200, 400, 650];
var prices = [5000, 4200, 2500, 2000];
var years = [2012, 2012, 2006, 2007];

var min_mileage=9999999,max_mileage=0;
var min_price=9999999,max_price=0;
var min_year=9999999,max_year=0;


var canvas = null; 

function Car() {
    this.mileage = 0;
    this.price = 0;
    this.year = 0;
}

var cars = [];

function init() {
    for (i=0; i<mileages.length;i++) {
        var car = new Car();
        car.mileage = mileages[i];
        car.price = prices[i];
        car.year = years[i];
        cars.push(car);
        if(car.mileage<min_mileage) min_mileage = car.mileage;
        if(car.price<min_price) min_price = car.price;
        if(car.year<min_year) min_year = car.year;
        if(car.mileage>max_mileage) max_mileage = car.mileage;
        if(car.price>max_price) max_price = car.price;
        if(car.year>max_year) max_year = car.year;
    }
    
    var controlPanel = document.createElement("form");
    controlPanel.setAttribute("id", "controlPanel");
    controlPanel.setAttribute("style", "position:absolute; z-index:500; top:0px; left:"+PAPER_WIDTH+"px; height:"+PAPER_HEIGHT+"; width:200px; border:2px solid #aaaaaa; background-color:#ccc; padding:10px");
    document.body.appendChild(controlPanel);

    var dimensions = ["x", "y", "z"];
    var attributes = ["price", "year", "mileage"];
    
    for(d=0; d<dimensions.length; d++) {
        var labelNode = document.createElement("label");
        labelNode.setAttribute("for", dimensions[d]);
        labelNode.innerHTML = dimensions[d] + " axis: "; 
        controlPanel.appendChild(labelNode);
        var axisNode = document.createElement("select");
        axisNode.setAttribute("id", dimensions[d]+"Axis");
        axisNode.setAttribute("name", dimensions[d]+"Axis");
        axisNode.addEventListener("change", function() {draw();});
        var axisReversed = document.createElement("input");
        axisReversed.setAttribute("type", "checkbox");
        axisReversed.setAttribute("id", dimensions[d]+"AxisReversed");
        axisReversed.addEventListener("change", function() {draw();});
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
        controlPanel.appendChild(axisNode);
        controlPanel.appendChild(axisReversed);
        controlPanel.appendChild(document.createElement("br"));
    }
    draw();
}

function draw() {
    xAxis = document.getElementById("xAxis").value;
    yAxis = document.getElementById("yAxis").value;
    zAxis = document.getElementById("zAxis").value;
    
    var maxX = eval("max_"+xAxis);
    var minX = eval("min_"+xAxis);
    var widthSpan = maxX - minX;
    var maxY = eval("max_"+yAxis);
    var minY = eval("min_"+yAxis);
    var heigthSpan = maxY - minY;
    var maxZ = eval("max_"+zAxis);
    var minZ = eval("min_"+zAxis);
    var zSpan = maxZ - minZ;

    var zScale = (PAPER_DEPTH-BUBBLE_MIN_SIZE)/ zSpan;
    var padding = PAPER_PADDING + BUBBLE_MIN_SIZE+(maxZ*zScale);
    var wScale = (PAPER_WIDTH-2*padding) / widthSpan;
    var hScale = (PAPER_HEIGHT-2*padding) / heigthSpan;

    if(canvas != null) {
        canvas.remove();
    }
    
    canvas = document.createElement("div");
    canvas.setAttribute("id", "canvas");
    canvas.setAttribute("style", "position:absolute; z-index:500; top:0px; left:0px;  border:2px solid #aaaaaa; background-color:#eeeeee");
    document.body.appendChild(canvas);


    //var paper = Raphael(10, 50, 320, 200);
    var paper = Raphael("canvas", PAPER_WIDTH, PAPER_HEIGHT);
    paper.path("M"+PAPER_PADDING + " " + (PAPER_HEIGHT-PAPER_PADDING) + "L"+(PAPER_WIDTH-PAPER_PADDING) + " " + (PAPER_HEIGHT-PAPER_PADDING));
    paper.path("M"+PAPER_PADDING + " " + PAPER_PADDING + "L"+PAPER_PADDING + " "+(PAPER_HEIGHT-PAPER_PADDING));
    var t = paper.text(PAPER_WIDTH-PAPER_PADDING, PAPER_HEIGHT-PAPER_PADDING/2, "everything else is priceless").attr({'text-anchor': 'end'});
    var t = paper.text(PAPER_PADDING/2, PAPER_PADDING, "year of the desktop linux").rotate(270).attr({'text-anchor': 'end'});
    console.log(t);
    for(i=0; i<cars.length; i++) {
        var car = cars[i];
        var x = eval("car."+xAxis);
        var y = eval("car."+yAxis);
        var z = eval("car."+zAxis);
        xVal = (x-minX)*wScale;
        yVal = (y-minY)*hScale;
        zVal = z*zScale;
        
        if(document.getElementById("xAxisReversed").checked) {
            xVal = PAPER_WIDTH - xVal - 2*padding;
        }
        
        if(document.getElementById("yAxisReversed").checked) {
            yVal = PAPER_HEIGHT - yVal - 2*padding;
        }
        
        if(document.getElementById("zAxisReversed").checked) {
            zVal = (maxZ*zScale) - zVal;
        }
        var circle = paper.circle(padding+xVal, 
                                  PAPER_HEIGHT-(padding+yVal), 
                                  BUBBLE_MIN_SIZE+zVal);
                                  
        circle.attr("fill", "#ff00ff");
        circle.attr("fill-opacity", 0.3);
        circle.attr("stroke", "#f0f");
        circle.data("car" , cars[i]); 
        
        circle.click(function() {info(this.data("car"));});
    }
}

function info(car) {
    alert(car.price);
}































