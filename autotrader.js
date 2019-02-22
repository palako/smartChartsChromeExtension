console.log("autotrader.js");
function harvest() {
	console.log("harvesting");
	var list=document.evaluate("//div[@class='resultsWrapper ']/div/div[contains(@class,'searchResult')]", document, null, XPathResult.ANY_TYPE, null);
	while(listItem = list.iterateNext()) {
		console.log("found!");
		var mileage=document.evaluate("./div/div[@class='searchResultAdvert']/div[@class='searchResultBody']/div[@class='searchResultFeatures']/ul/li/span[@class='mileage']", listItem, null, XPathResult.ANY_TYPE, null).iterateNext();
		if(mileage!=null) mileage = mileage.innerHTML.replace(" miles","").trim();
		var price=document.evaluate("./div/div[@class='searchResultAdvert']/div[@class='searchResultHeader']/div[@class='vehicleTitle']/div[@class='offerPrice']/span[@class='deal-price']", listItem, null, XPathResult.ANY_TYPE, null).iterateNext();
		if(price!=null) price = price.innerHTML.replace("£","").replace("$","").replace(",","").trim();
		var headline=document.evaluate("./div/div[@class='searchResultAdvert']/div[@class='searchResultHeader']/div[@class='advertIconsPrice']/h3", listItem, null, XPathResult.ANY_TYPE, null).iterateNext();
		var match =headline.innerHTML.match(/^([0-9]{4}).*/);
		if(match != null && match.length>0) {
			year=match[1];
		}
		if(!isNaN(parseInt(mileage)) && !isNaN(parseInt(price))) {
			 var car = new Car();
		     car.mileage = parseInt(mileage);
		     if(car.mileage < 200) {
		    	 car.mileage*=1000;//TODO: This is normally the case, some people say 113 instead of 113,000. False positives (but very few cars) are sold below 200miles
		     }
		     console.log("miles:" + car.mileage);
		     car.price = parseInt(price);
		     console.log("price:" + car.price);
			 car.year=year;
			 console.log("year:" + car.year);
			 car.domNode=listItem;
		     cars.push(car);
		}			
	}
}