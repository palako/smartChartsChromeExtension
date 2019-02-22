
var mmOpener = $('#makesModelsFieldset');
var mmExpander = $("#makesModelsExpander");
var mmResultLists = $('.mm-result');
var mmResultFinal = $('.mm-result', mmOpener);
var mmList = $('#M');
var mmMakes = $('#makeListContainer');
var mmModels = $('#modelListContainer');
var mmDisplay = $('#rdContainer');

var makeFormat = '<li><input rel="x{0}" id="x{0}" class="make-el" type="checkbox"{2}><label class="label make-el" for="x{0}">{1}</label></li>';
var makeCont = '<ul class="sl" id="makeList">{0}</ul>';

var modelMFormat = '<li id="lx{0}" class=""><ul><label class="ltopLevel label" for="lx{0}">{1}</label>{2}</ul></li>';
var modelItemFormat = '<li rel="xx{0}" class="subclass"><input class="model-el" id="xx{0}" type="checkbox"{2}><label class="label model-el" for="xx{0}">{1}</label></li>';
var modelCont = '<ul class="sl" id="modelList">{0}</ul>';

var resultCont = '<ul class="sl" id="resultsDisplay">{0}</ul>';
var resultItemFormat = '<li class="{0}">{1}<a href="#" rel="{0}" class="mm-closeall"></a></li>';

var attrIsChecked = ' checked="checked"';
var attrNotChecked = '';
var filterResult = null;
var textSearchTimer = null;
var textSearchTimerId = 0;
var removeDisplayedTimer = null;
var removeDisplayedTimerId = 0;
var removeDisplayedList = null;
var removeAllDisplayed = false; 

// Initialise makes models data.
var mmData = null;
function loadMakesModels() {
    var rawdata = $('#MakesModelsIsland').text();
    if (rawdata) mmData = $.parseJSON(rawdata);
    if (mmData) { indexMakeModelElements(); }
    configureRemoveDisplay(-1); 
}

// indexes elements sequentially, attaching them to the reference data for searching later. 
function indexMakeModelElements() {
    var mmGroups = $('#M optgroup', $makesModelsFieldset);
    var makeCount = mmData.length;
    for (var makeIndex = 0; makeIndex < makeCount; makeIndex++) {
        var mmMake = mmData[makeIndex];
        mmMake.t = 0; // Make.
        mmMake.el = $(mmGroups[makeIndex])[0];
        mmMake.com = mmMake.n.trim().toLowerCase();
        var models = mmData[makeIndex].el.children;
        var modelCount = mmData[makeIndex].l.length;
        for (var modelIndex = 0; modelIndex < modelCount; modelIndex++) { 
            var mmModel = mmMake.l[modelIndex];
            mmModel.t = 1; // Model.
            mmModel.com = mmModel.n.trim().toLowerCase();
            mmModel.el = $(models[modelIndex + 1])[0];
            mmModel.p = mmMake.v;
        }
    }
}

$(document).ready(function () {
    $('legend', mmOpener).click(function () {
        if (!mmData) return;

        loadMakeList();
        loadModelList();
        loadResultList();
        configureTextSearch();        

        mmExpander.show('fast', function () {
            configureSearchField('input.dt', mmExpander, 'Enter make or model...'); 

            $('a.updateMm', mmExpander).click(function () {
                showFlyoutChanges();
                mmExpander.hide('fast');
                $(this).unbind();
                return false;
            });
        });
    });
}); 

function loadMakeList(custom) {
    var myData = !custom ? mmData : custom;
    if (!myData) return;
    var makeCnt = myData.length;
    var makes = '';
    for (var makeIdx = 0; makeIdx < makeCnt; makeIdx++) {
        var mak = myData[makeIdx];
        var mdlCnt = mak.l.length;
        var mdlSel = 0; 
        for (var modelIdx = 0; modelIdx < mdlCnt; modelIdx++) {
            if (mak.l[modelIdx].s) mdlSel++;
        }
        if (mdlSel > 0) mak.s = 1; 
        var makeChk = mak.s == 1 ? attrIsChecked : attrNotChecked;
        makes = makes + makeFormat.format(mak.v, mak.n, makeChk);
    }

    mmMakes.html(makes.length > 0 ? makeCont.format(makes) : '');
    $('.make-el', mmMakes).click(selectMake);
    $('div.alphabet-search a', mmExpander).click(filterByLetter);
};

function loadModelList(custom) {
    var myData = !custom ? mmData : custom;
    if (!myData) return;
    var makeCnt = myData.length;
    var makeModels = '';
    for (var makeIdx = 0; makeIdx < makeCnt; makeIdx++) {
        var mak = myData[makeIdx];
        var selCnt = 0;
        var modelCnt = mak.l.length;
        var models = '';
        if (mak.s == 1 || custom) {
            var mdlFnd = 0;
            for (var modelIdx = 0; modelIdx < modelCnt; modelIdx++) {
                var mdl = mak.l[modelIdx];
                if (mdl.s == 1) selCnt++;
                if (mdl.m == 1) mdlFnd++;
                if (!custom || (mdl.m || mak.m)) {
                    var modelChk = mdl.s == 1 ? attrIsChecked : attrNotChecked;
                    models = models + modelItemFormat.format(mdl.v, mdl.n, modelChk);
                }
            }
        }

        if ((selCnt > 0 || mak.s == 1) || (custom && (mak.m || mdlFnd > 0))) {
            var makeChk = mak.s == 1 ? attrIsChecked : attrNotChecked;
            makeModels = makeModels + modelMFormat.format(mak.v, mak.n, models);
        }
    }

    mmModels.html(makeModels.length > 0 ? modelCont.format(makeModels) : '');
    $('.model-el', mmModels).click(selectModel);
};

function loadResultList() {
    if (!mmData) return;
    var resCnt = 0; 
    var makeCnt = mmData.length;
    var displayItems = '';
    for (var makeIdx = 0; makeIdx < makeCnt; makeIdx++) {
        var mak = mmData[makeIdx];
        var selCnt = 0;
        var subItems = '';
        var modelCnt = mak.l.length;
        for (var modelIdx = 0; modelIdx < modelCnt; modelIdx++) {
            var mdl = mak.l[modelIdx];
            if (mdl.s == 1) {
                subItems = subItems + resultItemFormat.format(mdl.v, mak.n + ' ' + mdl.n);
                selCnt += 1;
            }
        }

        if (mak.s == 1) {
            resCnt += 1; 
            if ((selCnt == modelCnt && modelCnt > 0) || (selCnt == 0)) {
                displayItems = displayItems + resultItemFormat.format(mak.v, 'All ' + mak.n);
            }
            else {
                displayItems = displayItems + subItems;
            }
        }
    }

    var final = displayItems.length > 0 ? resultCont.format(displayItems) : '';
    mmDisplay.html(final);
    setFinalDisplayHtml(final);

    configureRemoveDisplay(resCnt);
    setCarFilterHeight();
};

function setFinalDisplayHtml(content) {
    var header = $('.mm-result-header', mmResultFinal).first().outerHtml();
    mmResultFinal.html(header + content.replace('resultsDisplay', 'finalDisplay').replace(' class="sl"', ''));
}

function extractItemId($el, prefix) {
    var result = -1;
    if (!prefix) prefix = '';
    if ($el && $el.length > 0) {
        result = $el[0].id.replace(prefix, '');
    }

    return result * 1;
}

function removeDisplayedClick() {
    var id = new Number($(this).attr('rel'));
    if (removeDisplayedList.indexOf(id) == -1) {
        removeDisplayedList.add(id);
    }

    removeDisplayedTimerId = removeDisplayedTimer.call();
    return false;
}

function removeAllDisplayedClick() {
    removeAllDisplayed = true;
    removeDisplayedTimerId = removeDisplayedTimer.call();    
    return false;
}

function showHideRemoveAll(resCnt) {
    var $removeAllOptions = $('#searchConsole span.mmdisplay-rem');
    if (resCnt > 0) {
        $removeAllOptions.show();
    }
    else if (resCnt == 0) {
        $removeAllOptions.hide();
    }
}

function configureRemoveDisplay(resCnt) {
    if (mmList.length == 0) return;
    if (removeDisplayedList == null) removeDisplayedList = new Collection();
    removeDisplayedTimer = typeof (SlidingTimer) != 'undefined' ? new SlidingTimer(removeDisplayed, 300) : new {};
    $('a.mm-closeall', mmResultFinal).click(removeDisplayedClick);
    $('a.mm-closeall', mmDisplay).click(removeDisplayedClick);
    $('span.mmdisplay-rem', 'div.search-console-left').click(removeAllDisplayedClick);
    showHideRemoveAll(resCnt); 
}

function removeDisplayed() {
    removeDisplayedTimer.clear(removeDisplayedTimerId);
    if (removeAllDisplayed) {
        removeAllItems();
        showHideRemoveAll(0);
    }
    else {
        removeSpecificItems(); 
    }
    return false;
}

function removeAllItems() {
    removeAllDisplayed = false;
    if (removeDisplayedList) removeDisplayedList.clear();

    var selCnt = 0; 
    var makCnt = mmData.length;
    for (var makIdx = 0; makIdx < makCnt; makIdx++) {
        var mak = mmData[makIdx];
        if (mak.s) selCnt++; 
        mmData[makIdx].s = 0;        
        var mdlCnt = mak.l.length;
        for (var mdlIdx = 0; mdlIdx < mdlCnt; mdlIdx++) {
            if (mak.l[mdlIdx].s) selCnt++;
            mmData[makIdx].l[mdlIdx].s = 0;
        }
    }

    if (selCnt > 0) {
        mmList.val('');
        countFormSubmit();

        setFinalDisplayHtml('');
        mmDisplay.html('');
        mmModels.html('');
        loadMakeList();
    }
}

function removeSpecificItems() {
    var items = removeDisplayedList.toArray();
    removeDisplayedList.clear();
    var len = items.length;
    var mods = 0;
    var mdls = 0;
    for (var idx = 0; idx < len; idx++) {
        var id = items[idx];
        if (id > 0) {
            var item = findById(id);
            setItem(item, 0);
            if (item.t == 0) {
                var $mak = $('#x' + item.v, mmMakes);
                setChecked($mak, 0);
                mods++;
                mdls++;
            }
            else if (item.t == 1) {
                var $mdl = $('#xx' + item.v, mmModels);
                setChecked($mdl, 0);
                mods++;
            }
        }
    }

    if (mdls > 0) { loadModelList(); }
    if (mods > 0) { loadResultList(); showFlyoutChanges(); }
}

function selectMake() {
    resetSearchField('input.dt', mmExpander);
    var $this = $(this);
    var itemId = extractItemId($(this), 'x');
    var $chk = $this.attr('type') == 'checkbox' ? $this : $('#x' + itemId, $this.parent());
    var checked = $chk.vProp('checked');
    findById(itemId, checked ? function (item) { return setItem(item, 1); } : function (item) { return setItem(item, 0); }, 0);
    loadModelList();
    loadResultList();
    showFlyoutChanges();
}

function selectModel() {
    var $this = $(this);
    var itemId = extractItemId($(this), 'xx');
    var $chk = $this.attr('type') == 'checkbox' ? $this : $('#xx' + itemId, $this.parent());
    var checked = $chk.vProp('checked');
    findById(itemId, checked ?
        function (item) {
            var res = setItem(item, 1);
            if (res.t == 1) findById(res.p, function (parent) { setChecked($('#x' + parent.v, mmMakes), 1); }, 0);
            return res;
        } : 
        function (item) { var res = setItem(item, 0); return res; }, 1);

    loadResultList();
    showFlyoutChanges();
}

function filterByLetter() {
    resetSearchField('input.dt', mmExpander); 
    var $this = $(this);
    if (filterResult) { filterResult.clear(); } else { filterResult = new Collection(); }
    findByLetter($this.html(), null, filterResult);
    loadModelList(filterResult.toArray());
    return false;
}

function filterByText() {
    textSearchTimer.clear(textSearchTimerId);
    var val = valueOfSearchField('input.dt', mmExpander); 
    if (val && val.length >= 2) {
        if (filterResult) { filterResult.clear(); } else { filterResult = new Collection(); }
        findByText(val, null, filterResult);
        loadModelList(filterResult.toArray());
    }
    else if (val.length == 0) {
        loadModelList();
    }
    return false;
}

function textSearchKeyup() { textSearchTimerId = textSearchTimer.call(); }
function configureTextSearch() {
    if (mmList.length == 0) return;
    textSearchTimer = typeof (SlidingTimer) != 'undefined' ? new SlidingTimer(filterByText, 400) : new {};
    $('input.dt', mmExpander).keyup(textSearchKeyup);
}

function setItem(item, val) {
    item.s = val;
    var select = item.s == 1;
    if (item.t == 0) {
        var chs = 0;
        var cnt = item.l.length;
        for (var index = 0; index < cnt; index++) {
            var chld = item.l[index];
            setSelected(chld.el, item.s ? chld.s == 1 : 0);
            if (item.s == 1 && chld.s == 1) chs++;
        }
        if (select) select = chs == 0 || chs == cnt;
    }

    if (item.t == 1) {
        var parent = findById(item.p);
        var selCnt = 0;
        var cnt = parent.l.length;
        for (var index = 0; index < cnt; index++) {
            if (parent.l[index].s == 1) selCnt++;
        }
        // if (parent && parent.t == 0) setItem(parent, parent.s == 1 ? 1 : selCnt > 0); // 2 step remove make. 
        if (parent && parent.t == 0) setItem(parent, selCnt > 0); // 1 step remove make.
    }
    else { setSelected(item.el, select); }
    return item;
}

function showFlyoutChanges() {
    countFormSubmit();
}

// Finds matches by letter, sequentially, exiting when found.
function findByLetter(value, func, collection) {
    if (value.length == 0) return;
    var term = value.trim().toLowerCase();
    var found = false;
    var makeCount = mmData.length;
    for (var makeIndex = 0; makeIndex < makeCount; makeIndex++) {
        if (mmData[makeIndex].com.charAt(0) == term.charAt(0)) {
            found = true;
            var mak = mmData[makeIndex];
            mak.m = 1;
            var mdlCnt = mak.l.length;
            for (var mdlIndex = 0; mdlIndex < mdlCnt; mdlIndex++) {
                mak.l[mdlIndex].m = 1;
            }
            mmData[makeIndex] = processFinderMatch(mak, 0, func, collection);
        }
        else if (found) break;
    }
}

// Finds matches by word (make and model), sequentially, exiting when found.
function findByText(word, func, collection) {
    if (word.length == 0) return;
    var term = word.trim().toLowerCase();
    var found = false;
    var makMatch = 0;
    var makeCount = mmData.length;
    for (var makeIndex = 0; makeIndex < makeCount; makeIndex++) {
        var mak = mmData[makeIndex];
        mak.m = mak.com.indexOf(term) > -1;
        makMatch = 0;
        if (mak.m) {
            found = true;
            makMatch += 1;
            processFinderMatch(mak, 0, func, collection);
        }
        var modelCount = mak.l.length;
        for (var modelIndex = 0; modelIndex < modelCount; modelIndex++) {
            var mdl = mak.l[modelIndex];
            mdl.m = mdl.com.indexOf(term) > -1 || mak.m;
            if (mdl.m) {
                found = true;
                if (makMatch == 0) {
                    makMatch += 1;
                    processFinderMatch(mak, modelIndex, func, collection);
                }
            }
        }
    }
}

function findById(id, func, type) {
    if (!id || id <= 0) return;
    var found = false;
    var firstResult = null;
    var makeCount = mmData.length;
    for (var makeIndex = 0; makeIndex < makeCount; makeIndex++) {
        var mak = mmData[makeIndex];
        if (!type || type == 0) {
            if (mak.v == id) {
                found = true;
                firstResult = mak;
                mmData[makeIndex] = processFinderMatch(mak, 0, func);
                break;
            }
        }

        if (!type || type == 1) {
            var modelCount = mak.l.length;
            for (var modelIndex = 0; modelIndex < modelCount; modelIndex++) {
                var mdl = mak.l[modelIndex];
                if (mdl.v == id) {
                    found = true;
                    firstResult = mdl;
                    mak.l[modelIndex] = processFinderMatch(mdl, modelIndex, func);
                    break;
                }
            }
        }

        if (found) break;
    }
    return firstResult;
}

function processFinderMatch(item, index, func, collection) {
    var result = item;
    if (item) {
        if (func) {
            var test = func(item, index);
            if (test) { result = test; }
        }
        if (collection) {
            collection.add(result);
        }
    }
    return item;
}

function setSelected(el, selected) {
    if (el) {
        var isSelItem = new String(el.nodeName).toLowerCase() == 'option';
        var isSelGroup = new String(el.nodeName).toLowerCase() == 'optgroup';
        var item = isSelGroup ? $(el).children(0)[0] : !isSelItem && getAttribute(el, 'label').length > 0 ? el.parentNode.childNodes[0] : el;
        var attrib = isSelGroup || isSelItem ? 'selected' : 'checked';
        var $item = $(item);
        if (selected) { if (isSelItem || isSelGroup) $item.vProp('selected', 'selected'); else $item.vProp(attrib, attrib); }
        else { if (isSelItem || isSelGroup) $item.removeAttr('selected'); else $item.removeAttr(attrib); }
    }
}

function getAttribute(el, name) {
    var result = '';
    if (el && el.attributes) {
        var attr = el.attributes[name];
        if (attr) result = attr;
    }

    return result;
}

function Collection() {
    var collection = new Object();
    var order = [];

    this.getOrder = function() { return order; };
    this.getCollection = function() { return collection; };
    this.addProperty = function(property, value) {
        if (!this.exists(property)) {
            collection[property] = value;
            order.push(property);
        }
    };

    this.count = function() { return order.length; };
    this.clear = function() {
        collection = {};
        order = [];
        return this;
    };
    
    this.toArray = function() {
        var result = [];
        for (var index = 0; index < order.length; index++) {
            result.push(this.item(index));
        }

        return result;
    };

    this.add = function(value) {
        var len = order.length;
        this.addProperty('Key' + len, value);
        return len;
    };

    this.item = function(index) {
        var result = null;
        if (index >= 0 && index < order.length) {
            var key = order[index];
            result = collection[key];
        }
        return result;
    };

    this.indexOf = function(property) {
        var result = -1;
        var ii = order.length;
        while (ii-- > 0) {
            if (order[ii] == property) return ii;
        }
        return result;
    };

    this.remove = function (property) {
        collection[property] = null;
        var ii = order.length;
        while (ii-- > 0) {
            if (order[ii] == property) {
                order[ii] = null;
                return ii;
            }
        }
        return -1; 
    };

    this.toString = function() {
        var output = [];
        for (var ii = 0; ii < order.length; ++ii) {
            if (order[ii] != null) {
                output.push(collection[order[ii]]);
            }
        }
        return output;
    };

    this.getKeys = function() {
        var keys = [];
        for (var ii = 0; ii < order.length; ++ii) {
            if (order[ii] != null) {
                keys.push(order[ii]);
            }
        }
        return keys;
    };

    this.update = function(property, value) {
        if (value != null) {
            collection[property] = value;
        }
        var ii = order.length;
        while (ii-- > 0) {
            if (order[ii] == property) {
                order[ii] = null;
                order.push(property);
                break;
            }
        }
    };

    this.exists = function(property) {
        return collection[property] != null;
    };

    return this;
}

