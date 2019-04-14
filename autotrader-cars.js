function harvest() {
	var list=document.evaluate("//ul[@class='grid-results__list']/li[@class='grid-results__list-item--4']", document, null, XPathResult.ANY_TYPE, null);
	while(listItem = list.iterateNext()) {
		var yearAndMileage=document.evaluate("./a/div[@class='atc-card__body']/section[@class='atc-card__copy']/p[2]", listItem, null, XPathResult.ANY_TYPE, null).iterateNext();
		if(yearAndMileage!=null) {
			var match =yearAndMileage.innerHTML.match(/^([0-9]{4}).*/);
			if(match != null && match.length>0) {
				year=match[1];
			}
			match =yearAndMileage.innerHTML.match(/.+\| ([0-9,]+ miles)/);
			if(match != null && match.length>0) {
				mileage=match[1];
				mileage = mileage.replace(" miles","").trim();
			}
		}
		var price=document.evaluate("./a/div[@class='atc-card__header']/h2", listItem, null, XPathResult.ANY_TYPE, null).iterateNext();
		if(price!=null) price = price.innerHTML.replace("£","").replace("$","").replace(",","").trim();
		
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