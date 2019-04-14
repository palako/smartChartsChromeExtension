function harvest() {
	var list=document.evaluate("//ul[@class='search-page__results']/li[@class='search-page__result']", document, null, XPathResult.ANY_TYPE, null);
	while(listItem = list.iterateNext()) {
		var mileage=document.evaluate("./article/section[@class='content-column']/div[@class='information-container']/ul[@class='listing-key-specs ']/li[3]", listItem, null, XPathResult.ANY_TYPE, null).iterateNext();
		if(mileage!=null) mileage = mileage.innerHTML.replace(" miles","").trim();
		var price=document.evaluate("./article/section[contains(@class, 'price-column')]/a/div[@class='vehicle-price']", listItem, null, XPathResult.ANY_TYPE, null).iterateNext();
		if(price!=null) price = price.innerHTML.replace("£","").replace("$","").replace(",","").trim();
		var headline=document.evaluate("./article/section[@class='content-column']/div[@class='information-container']/ul[@class='listing-key-specs ']/li[1]", listItem, null, XPathResult.ANY_TYPE, null).iterateNext();
		if(headline!=null) {
			var match =headline.innerHTML.match(/^([0-9]{4}).*/);
			if(match != null && match.length>0) {
				year=match[1];
			}
		}
		if(!isNaN(parseInt(mileage)) && !isNaN(parseInt(price))) {
			 var car = new Car();
		     car.mileage = parseInt(mileage);
		     if(car.mileage < 200) {
		    	 car.mileage*=1000;//TODO: This is normally the case, some people say 113 instead of 113,000. False positives (but very few cars) are sold below 200miles
		     }
		     car.price = parseInt(price);
		     car.year=year;
			 car.domNode=listItem;
		     cars.push(car);
		}			
	}
}