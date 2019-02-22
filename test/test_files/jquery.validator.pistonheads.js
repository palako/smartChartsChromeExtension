
function validator_PostCodeIsValid(value, element, params) {
    var result = true;

    var depProperty = foolproof.getId(element, params["countrycodeproperty"]);
    var depElement = $("#" + depProperty);
    var depValue = depElement.val();

    depElement.unbind("change");
    depElement.bind("change", { id: element.id, value: value, params: params }, function (e) {
        validator_PostCodeIsValid(e.data.value, document.getElementById(e.data.id), e.data.params);
        jQuery("#" + e.data.id).valid();
    });

    var exp = params["postcoderegex"];
    var comp = new String((value + "").toUpperCase());
    if (depValue == params["applicablecountrycode"]) {
        var match = comp.match(exp);
        result = exp && exp.length > 0 ? match != null && match.length > 0 : true;
    }
    else {
        result = true;
    }

    return result; 
};

function validator_ContainsAny(value, element, params) {
    var result = true;
    if (value && value.length > 0) {
        var items = params["items"];
        var option = new Number(params["option"]);        
        var list = items.split(params["delimiter"]);
        var positive = option == 0;

        result = !positive;
        value = value + "";
        var len = list.length;
        for (var idx = 0; idx < len; idx++) {
            var pos = value.indexOf(list[idx]);
            if (pos != -1) { result = positive; break; }
        };        
    }
    return result; 
};

function validator_CurrencyRange(value, element, params) {
    if (value && value.length > 0) {        
        var min = parseFloat(params["minimum"]).toFixed(2);
        var max = parseFloat(params["maximum"]).toFixed(2);
        value = (value + "").replace(",", "").replace(" ", "");

        if (value.length > (max + "").length) {
            return false; 
        }

        var num = new Number(parseFloat(value).toFixed(2));
        return num >= new Number(min) && num <= new Number(max); 
    }
    return true;
};

jQuery.validator.unobtrusive.adapters.add("truerequired", function (options) {
    if (options.element.tagName.toUpperCase() == "INPUT" && options.element.type.toUpperCase() == "CHECKBOX") {
        options.rules["required"] = true;
        if (options.message) {
            options.messages["required"] = options.message;
        }
    }
});

jQuery.validator.unobtrusive.adapters.add("containsany", ["delimiter", "items", "option"], function (options) {
    options.rules["containsany"] = {
            delimiter: options.params.delimiter,
            items: options.params.items,
            option: options.params.option
        };
        if (options.message) {
            options.messages["containsany"] = options.message;
        }
});

jQuery.validator.addMethod("containsany", validator_ContainsAny);


jQuery.validator.unobtrusive.adapters.add("currencyrange", ["minimum", "maximum"], function (options) {
    options.rules["currencyrange"] = {
            minimum: options.params.minimum,
            maximum: options.params.maximum
        };
        if (options.message) {
            options.messages["currencyrange"] = options.message;
        }
});

jQuery.validator.addMethod("currencyrange", validator_CurrencyRange);


jQuery.validator.unobtrusive.adapters.add("postcodeisvalid", ["countrycodeproperty", "applicablecountrycode", "postcoderegex"], function (options) {
    options.rules['postcodeisvalid'] = {
            countrycodeproperty: options.params.countrycodeproperty,
            applicablecountrycode: options.params.applicablecountrycode,
            postcoderegex: options.params.postcoderegex
        };
        if (options.message) {
            options.messages['postcodeisvalid'] = options.message;
        }
});

jQuery.validator.addMethod("postcodeisvalid", validator_PostCodeIsValid);

jQuery.validator.unobtrusive.adapters.add('icregex', ['pattern'], function (options) {
    options.rules['icregex'] = options.params;
    options.messages['icregex'] = options.message;

    if (options.message) {
        options.messages["icregex"] = options.message;
    }
});

jQuery.validator.addMethod('icregex', function (value, element, params) {
    var match;
    if (this.optional(element)) {
        return true;
    }

    match = new RegExp(params.pattern, 'i').exec(value);
    return (match && (match.index === 0) && (match[0].length === value.length));
}, '');

function validator_BlockAjaxEvent(element) {
    var controls = []; // ["PostModel_Description", "PostModel_Headline", "PostModel_PartExchange"];
    var len = controls.length;
    for (var idx = 0; idx < len; idx++) {
        if (element.id == controls[idx]) {
            return true;
        }
        if (element.name in this.submitted || element == this.lastElement) {
            this.element(element);
        }
    }
};

jQuery.validator.setDefaults({
        onkeyup: validator_BlockAjaxEvent, 
        onfocusout: validator_BlockAjaxEvent
    });
