function harvest() {
	var list=document.evaluate("//div[@id='search-results']/div[@class='result-contain']/div[@class='ad-listing']", document, null, XPathResult.ANY_TYPE, null);
	while(listItem = list.iterateNext()) {
		var mileage=document.evaluate("./div[@class='listing-content']/div[@class='listing-info']/ul[@class='specs']/li[1]", listItem, null, XPathResult.ANY_TYPE, null).iterateNext();
		if(mileage!=null) mileage = mileage.innerText.replace("\"").replace(",", "").trim();
		var price=document.evaluate("./div[@class='listing-content']/div[@class='listing-info']/div[@class='price-location']/span[@class='price']", listItem, null, XPathResult.ANY_TYPE, null).iterateNext();
		if(price!=null) price = price.innerHTML.replace("£","").replace("$","").replace(",","").trim();
		var headline=document.evaluate("./div[@class='listing-headline']/a/h3", listItem, null, XPathResult.ANY_TYPE, null).iterateNext();
		if(headline != null) {
			var match =headline.innerHTML.match(/.*\(([0-9]{4})\)$/);
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
		   //*[@id="1307048"]/div/div[1]/div[1]/a/span
			 var sold=document.evaluate("./div[@class='thumbnail']/div[@class='image image-full' | @class='image']/a/span[@class='sold img-link']", listItem, null, XPathResult.ANY_TYPE, null).iterateNext();
			 if(sold != null) {
				 car.sold = true;
			 }
			 car.year=year;
			 car.domNode=listItem;
		     cars.push(car);
		}			
	}
}