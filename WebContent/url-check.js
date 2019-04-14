if (typeof String.prototype.startsWith != 'function') {
    	  String.prototype.startsWith = function (str){
    	    return this.slice(0, str.length) == str;
    	  };
}

//var port = chrome.runtime.connect();
//
//window.addEventListener("message", function(event) {
//    // We only accept messages from ourselves
//    if (event.source != window)
//      return;
//
//    if (event.data.type && (event.data.type == "FROM_PAGE")) {
//      console.log("Content script received: " + event.data.text);
//      port.postMessage(event.data.text);
//    }
//}, false);

var pistonheadsOnClickListenerAdded = false;
var autotraderOnClickListenerAdded = false;
var autotraderCarsOnClickListenerAdded = false;

      // Called when the url of a tab changes.
      function checkForValidUrl(tabId, changeInfo, tab) {
    	  if(changeInfo.status == "loading" ) {
      	    if (tab.url.startsWith("https://www.pistonheads.com/classifieds") ||
      	    	tab.url.startsWith("file:///Users/palako/Documents/workspace/SmartChartsChromeExtension/test/")) {
            	chrome.tabs.executeScript(tab.id, {code: 
	        		"var x = document.getElementById(\"advert-wrapper-leaderboard\");" +
	        		"if(x!=null)x.parentNode.removeChild(x);" +
	        		"x = document.getElementById(\"advert-wrapper-mpu\");" +
	        		"if(x!=null)x.parentNode.removeChild(x);"
	        	});
	        }
    	  }
    	  if(changeInfo.status == "complete" ) {
	        if (tab.url.startsWith("https://www.pistonheads.com/classifieds") ||
	        	tab.url.startsWith("file:///Users/palako/Documents/workspace/SmartChartsChromeExtension/test/")) {
	        	chrome.tabs.executeScript(tab.id, {code: 
	        		"var x = document.getElementById(\"advert-wrapper-leaderboard\");" +
	        		"if(x!=null)x.parentNode.removeChild(x);" +
	        		"x = document.getElementById(\"advert-wrapper-mpu\");" +
	        		"if(x!=null)x.parentNode.removeChild(x);"
	        	});
	        	
	          // ... show the page action.
	          chrome.pageAction.show(tabId);
	          if(!pistonheadsOnClickListenerAdded) {
		          chrome.pageAction.onClicked.addListener(
					function(tab) {
						chrome.tabs.insertCSS({file: "smartcharts.css"});
						chrome.tabs.executeScript(tab.id, {file: "raphael.min.js"});
						chrome.tabs.executeScript(tab.id, {file: "pistonheads.js"}, function() {
							chrome.tabs.executeScript(tab.id, {file: "smartcharts.js"});
						});
		        	}
				  );
		          pistonheadsOnClickListenerAdded=true;
	          }
	        } else if (tab.url.startsWith("https://www.autotrader.co.uk/car-search")) {
	        	// ... show the page action.
		          chrome.pageAction.show(tabId);
		          if(!autotraderOnClickListenerAdded) {
			          chrome.pageAction.onClicked.addListener(
						function(tab) {
							chrome.tabs.insertCSS({file: "smartcharts.css"});
							chrome.tabs.executeScript(tab.id, {file: "raphael.min.js"});
							chrome.tabs.executeScript(tab.id, {file: "autotrader.js"}, function() {
								chrome.tabs.executeScript(tab.id, {file: "smartcharts.js"});
							});
			        	}
					  );
			          autotraderOnClickListenerAdded=true;
		          }
	        } else if (tab.url.startsWith("https://www.autotrader.co.uk/cars")) {
	        	// ... show the page action.
		          chrome.pageAction.show(tabId);
		          if(!autotraderCarsOnClickListenerAdded) {
			          chrome.pageAction.onClicked.addListener(
						function(tab) {
							chrome.tabs.insertCSS({file: "smartcharts.css"});
							chrome.tabs.executeScript(tab.id, {file: "raphael.min.js"});
							chrome.tabs.executeScript(tab.id, {file: "autotrader-cars.js"}, function() {
								chrome.tabs.executeScript(tab.id, {file: "smartcharts.js"});
							});
			        	}
					  );
			          autotraderCarsOnClickListenerAdded=true;
		          }
	        }
    	  }
      };

      // Listen for any changes to the URL of any tab.
      chrome.tabs.onUpdated.addListener(checkForValidUrl);
      