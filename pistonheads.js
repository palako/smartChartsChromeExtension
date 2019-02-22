function harvest() {
	var list=document.evaluate("//ul[@class='result_lv']/li/div", document, null, XPathResult.ANY_TYPE, null);
	while(listItem = list.iterateNext()) {
		var mileage=document.evaluate("./div[@class='summary']/ul/li[span[text()=\"Mileage: \"]]/span[2]", listItem, null, XPathResult.ANY_TYPE, null).iterateNext();
		if(mileage!=null) mileage = mileage.innerHTML.replace("£","").replace("$","").replace(",","").trim();
		var price=document.evaluate("./div[@class='contacts-price']/span[@class='ad-price']", listItem, null, XPathResult.ANY_TYPE, null).iterateNext();
		if(price!=null) price = price.innerHTML.replace("£","").replace("$","").replace(",","").trim();
		var headline=document.evaluate("./div[@class='summary']/h4/a[@class='headline-compact']", listItem, null, XPathResult.ANY_TYPE, null).iterateNext();
		var match =headline.innerHTML.match(/.*\(([0-9]{4})\)$/);
		if(match != null && match.length>0) {
			year=match[1];
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