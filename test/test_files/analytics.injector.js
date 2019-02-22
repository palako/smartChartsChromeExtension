
var x = 0; // 3rd party fix.

// Injector overrides (IE8 support)
function hasTracker() {
    var test = null;
    if (typeof (tracker) != "undefined") {
        test = tracker;
    }
    else {
        try {
            test = new HaymarketAnalytics();
        } catch(ex) {
        }
    }

    return test != null; 
}

var trackingEnabled = hasTracker();
if (trackingEnabled) {
    HaymarketAnalytics.mergeValues = function (existing, newvalues) { for (var i in newvalues) { existing[i] = newvalues[i]; } return existing; };
    HaymarketAnalytics.itemInArray = function (item, arr) { for (var a in arr) { if (arr[a] == item) { return true; } } return false; };
}

function CallAnalytics(pageValues) {
    if (trackingEnabled) {
        var mergedResult = MergeData(pageValues, injectorPageDefaults);
        try {
            var trackerToCall = tracker || new HaymarketAnalytics();
            // WARNING: NOTE: HaymarketAnalytics.mergeValues method does not work correctly in IE8 causing adverts to not render on default home page. 
            trackerToCall.navigationMetrics = (mergedResult.navigationMetrics || {});
            trackerToCall.affiliateMetrics = (mergedResult.affiliateMetrics || {});
            trackerToCall.contentMetrics = (mergedResult.contentMetrics || {});
            trackerToCall.locationMetrics = (mergedResult.locationMetrics || {});
            trackerToCall.productMetrics = (mergedResult.productMetrics || {});
            trackerToCall.searchMetrics = (mergedResult.searchMetrics || {});
            trackerToCall.systemMetrics = (mergedResult.systemMetrics || {});

            trackerToCall.render();
        }
        catch (e) { }
    }
}

var $ctxVar = $('#contextRef');
function GetAnalyticsContext() { return $ctxVar.length ? $ctxVar.attr('contextVal') : 'default'; }
function SetAnalyticsContext(context) { if ($ctxVar.length) $ctxVar.attr('contextVal', context); }

function CallAnalyticsWithContext(pageValues) {
    var ctxVal = GetAnalyticsContext();
    if (pageValues && pageValues.navigationMetrics && pageValues.navigationMetrics.hierarchy) {
        var len = pageValues.navigationMetrics.hierarchy.length;
        if (len && len > 0) {
            // Suffix the last hierarchy element with context.
            var currVal = pageValues.navigationMetrics.hierarchy[len - 1];
            var newVal = currVal.indexOf('-') == -1 ? currVal + '-' + ctxVal : currVal = currVal.split('-')[0] + '-' + ctxVal;
            pageValues.navigationMetrics.hierarchy[len - 1] = newVal;            
        }
    }

    // Continue with normal process. 
    CallAnalytics(pageValues);
}

function MergeData(sourceA, sourceB) {
    var result = {};
    var sourceAMembers = getMembers(sourceA);
    var sourceBMembers = getMembers(sourceB);
    for (var i = 0; i < sourceAMembers.length; i++) {
        member = sourceAMembers[i];
       if (sourceB[member] == null) {
           result[member] = sourceA[member];
       }
       else {
           if (sourceA[member] != null) {
               if (typeof sourceA[member] == 'object') {
                   result[member] = MergeData(sourceA[member], sourceB[member]);
               }
               else {
                   result[member] = sourceA[member];
               }
           }
       }
   }

   // now just copy all vals from the sourceB that might not have been on the soureA
   for (var i = 0; i < sourceBMembers.length; i++) {
       member = sourceBMembers[i];

       if (sourceA[member] == null) {
           result[member] = sourceB[member];
       }
   }

   return result;
}

function getMembers(obj) {
	var members = new Array();
	var i = 0;
	for (var member in obj) {
		members[i] = member;
		i++;
	}

	return members.sort();
}

