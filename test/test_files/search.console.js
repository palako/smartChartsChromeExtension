
var $searchFacets;
var $searchFacetItems;
var $makesModelsFieldset;
var $searchConsole;
var $searchConsoleRight;
var $moreFilters;
var $searchOverlay;
var $mainHomePanel;
var mmSingle = null; 
/*var $classificationFade;*/

$(document).ready(function () {
    $mainHomePanel = $('.main-home-panel');
    if (!$mainHomePanel.length) { loadMakesModels(); }

    $('#searchAction').click(setListReorderOnce);
    $("#searchConsole .btn-wrapper").hover(
      function () {
          $(this).addClass('btn-wrapper-hovered');
      },
      function () {
          $(this).removeClass('btn-wrapper-hovered');
      }
    );


    $('#PartExchangeKeywords').focus(function () {
        PartExchangeKeywordsAlert();
    });

    //loads the dial number on page load from the hidden field
    if ($('#NumberOfCarsForSale').length) {
        buildDialNum($('#NumberOfCarsForSale').val());
    }

    // sets up drag and dropf
    $searchFacets = $('#searchFacets');
    $searchFacetItems = $("#searchFacets li");
    $makesModelsFieldset = $('#makesModelsFieldset');
    $searchConsole = $('#searchConsole');
    $searchConsoleRight = $('#searchConsoleRight');

    // TODO: get rid of this next line by having correct initial state before scripts start. 
    setCarFilterHeight();

    if ($searchFacets.length) {
        // adds hidden input to populate string for module ordering result so it can be captured if the user is logged in
        // this works in steps:::
        // 1. First it checks to see if the #ordering-cookie field exist as this will be displayed if the user is logged in.
        // 2. Then every time the user makes a change to the default module view it is stored as a string in the hidden input, This is so it can be saved against the user if the form is submitted.
        //    If the user is not logged in it will be save in the cookie.
        // 3. Every time the user loads the page it will check the for the hidden field first for the string, if nothing is there then it will look for the cookie and then run the ordering script.
        //    If neither the cookie exist of the the user is logged in the ordering script will not run and the default order will be displayed.

        if ($('#ordering-cookie').length) { // do nothing
        } else {
            $searchFacets.before('<input type="hidden" class="ordering-cookie" name="ordering-cookie" id="ordering-cookie"/>');
        }

        // this controls hover class for drag and drop modules
        $('li', $searchFacets).hover(
            function () {
                $(this).addClass('drag-hover');
            }, function () {
                $(this).removeClass('drag-hover');
            });

        // this controls hover class for drag and drop modules
        // and then..this add the html for the close buttons to each drag and drop modules 
        var $searchFacetLegends = $('legend', $searchFacets);
        $searchFacetLegends.hover(
            function () {
                $(this).closest('li').addClass('legend-hover');
            }, function () {
                $(this).closest('li').removeClass('legend-hover');
            });

        // this builds the reset function for the reset filters button        
        $('a.rf', $searchConsoleRight).click(function () {
            $('form', $searchConsole).clearForm();
            $('#searchFacets').find('input:checkbox').removeAttr('checked');
            resetMultiSelect();
            removeAllItems();
            countFormSubmit();

            $('#resultsDisplay').html('');
            $('.classificaion-fade').fadeOut().remove();

            var sort = $('#SortOptions');

            if (sort != null) {
                sort.val('Date');
                $("#SortOptions option:eq(0)").attr("selected", "selected");
            }

            return false;
        });

        var str = "";

        buildMoreFiltersList();

        // this is the control for the close button for each drag and drop module
        function searchFacetCloseClick() {
            var $closest = $(this).closest('li');
            var id = '#x_' + $closest.attr('id');

            $closest.addClass('inactive');
            $closest.removeClass('drag-hover').removeClass('visible').removeClass('hidden');
            $closest.find('select').each(function () {
                $(this).find('option:first').vProp('selected', 'selected');
            });

            $closest.find('input').each(function () {
                var $this = $(this);
                if ($this.attr('type') == 'checkbox') { $this.removeAttr('checked'); }
                else { $this.val(''); }
            });

            $(id).vProp('checked', false);

            setListCookie();
            countFormSubmit();
            setCarFilterHeight();

            var checked = $("input[type=checkbox]:checked", $moreFilters).length; // test to see if checked.
            if (checked < 4) {
                $searchConsoleRight.removeClass('advanced-filters');
                setSortHeight('86');
            }
            else
            { $searchConsoleRight.addClass('advanced-filters'); }
            return false;
        }


        $("<a href='#' class='closeLink'></a>").appendTo($searchFacetLegends).click(searchFacetCloseClick);

        $(function () {
            if ($searchFacets.sortable !== undefined) {
                $searchFacets.sortable({
                    placeholder: "ui-state-highlight",
                    handle: 'legend',
                    containment: '#searchConsoleRight',
                    deactivate: function(event, ui) {
                        $searchFacetItems.removeClass('legend-hover');
                        setListCookie();
                    }
                });
            }
            //$("ul.sortable").disableSelection();
        });
    } // end $('ul.sortable').length

    // $makesModelsFieldset.prepend('<div class="loading-sprinner">Searching<div>');  // NA

    // scc == setChangeClass
    var scc = 'changeFacetClass';
    var $facetCont = !$mainHomePanel.length ? $searchConsole : $mainHomePanel;

    $('#PartExchangeKeywords').attr('prevVal', '');
    $('select', $facetCont).addClass(scc);
    $('input', $facetCont).addClass(scc);
    $('#MaxPrice').addClass(scc);
    $('#makesModelsExpander input.mme-search').removeClass(scc);
    $('input', $moreFilters).removeClass(scc);
    $('input[type=hidden]').removeClass(scc);
    $('#Keyword, #Postcode, #Distance, input.dt').removeClass(scc);
    $('.select-options input').removeClass(scc);
    //$('#PartExchangeOnly').removeClass(scc);

    // bind to the form's submit event 
    $('select.' + scc).change(function () { facetFieldChange($(this)); });
    $('input[type="radio"].' + scc).change(function () { facetFieldChange($(this)); });
    $('input[type="checkbox"].' + scc).change(function () { facetFieldChange($(this)); });
    $('input[type="text"].' + scc).blur(function () {
        var $this = $(this);
        if ($this.attr('id') != 'PartExchangeKeywords' && $this.attr('id') != 'Keyword') { facetFieldChange($this); }
    });

    var $hints = $('input[type="text"][title!=""]');
    if ($hints.hint !== undefined) { $hints.hint(); }

    var singleFlip = false;
    var $singleMake = $('.single-make-picker');
    var $singleModel = $('.single-model-picker');
    if ($singleMake.length && $singleModel.length) {
        var rawdata = $('#MakesModelsIsland').text();
        if (rawdata) mmSingle = $.parseJSON(rawdata);
        singleMakeChange();
        $singleMake.change(singleMakeChange);
        $singleModel.change(singleModelChange);
    }

    $('#Keyword, #PartExchangeKeywords').blur(function () {
        $this = $(this);
        var val = valueOfSearchField$($this);
        if (!$this.hasClass('configBusy') && val != $this.attr('prevVal')) {
            $this.attr('prevVal', val);
            return facetFieldChange($this);
        }
    });

    $('#Postcode').blur(function () {
        if ($('#Distance option:first').vProp('selected') != true) {
            return facetFieldChange($(this));
        }
    });

    $('#Postcode').focus(function () {
        $(this).parents('fieldset').removeClass('invalid-pascode');
    });

    $('#Distance').change(function () {
        if ($('#Postcode').val() != '') {
            return facetFieldChange($(this));
            $(this).parents('fieldset').removeClass('invalid-pascode');
        }
        else {
            if ($('#Distance').val() != "2147483646") {
                $(this).parents('fieldset').addClass('invalid-pascode');
                displayAlert($('#Postcode'), 'To sort by <b>location</b> requires a postcode to be entered into the search field below.');
            } else {
                $(this).parents('fieldset').removeClass('invalid-pascode');
            }
        }
    });


    function facetFieldChange($this) {
        //$this.closest('form').ajaxSubmit(options); return false; 
        var $field = !$(this) ? $this : $(this);
        if (!$this.hasClass('configBusy')) { countFormSubmit($this); }
        return false;
    }

    //$('input[type="text"][title!=""]').hint();

    function singleMakeChange() {
        if (mmSingle != null && !singleFlip) {
            var pattern = '<option p="{0}" value="{1}">{2}</option>';
            var newModels = pattern.format(0, 0, 'Select Model');
            var sel = new Number($singleMake.val());
            if (sel > 0) {
                for (var mIdx = 0; mIdx < mmSingle.length; mIdx++) {
                    var mod = mmSingle[mIdx];
                    if (mod.v == sel) {
                        for (var kIdx = 0; kIdx < mod.l.length; kIdx++) {
                            var mak = mod.l[kIdx];
                            newModels += pattern.format(mod.v, mak.v, mak.n);
                        }
                    }
                }
            }
            singleFlip = true;
            if ($singleMake.val() == -1) {
                var makSel = -1;
                var $opt = $('option:selected', $singleMake);
                if ($opt.length) { makSel = new Number($opt.attr('p')) + 0; }
                if (makSel > 0) $opt.attr('value', makSel);
            }
            $singleModel.html(newModels);
            singleFlip = false;
        }
    }

    function singleModelChange() {
        if (mmSingle != null && !singleFlip) {
            var modSel = new Number($singleModel.val());
            var makSel = new Number($singleMake.val());
            var swapped = makSel <= 0;
            if (modSel > 0 || swapped) {
                var $opt = $('option:selected', $singleModel);
                if ($opt.length) { makSel = new Number($opt.attr('p')) + 0; }
                if (makSel <= 0) {
                    $opt = $('option:selected', $singleMake);
                    if ($opt.length) { makSel = new Number($opt.attr('p')) + 0; }
                }
            }
            var patternNo = '<option p="{0}" value="{1}">{2}</option>';
            var patternSel = '<option p="{0}" value="{1}" selected="selected">{2}</option>';
            var newMakes = patternNo.format(0, 0, 'Select Make');
            for (var mIdx = 0; mIdx < mmSingle.length; mIdx++) {
                var mak = mmSingle[mIdx];
                var chSel = false;
                if (modSel > 0 && makSel > 0) {
                    for (var kIdx = 0; kIdx < mak.l.length; kIdx++) {
                        chSel = mak.l[kIdx].v == modSel;
                        if (chSel) break;
                    }
                }

                var makId = chSel ? -1 : mak.v;
                newMakes += mak.v == makSel ? patternSel.format(mak.v, makId, mak.n) : patternNo.format(mak.v, makId, mak.n);
            }
            singleFlip = true;
            $singleMake.html(newMakes);
            singleFlip = false;
        }
    }

    //    var $MaxPrice = $('#MaxPrice');
    //    if ($MaxPrice.length) {
    //        var $MinPrice = $('#MinPrice');
    //        function setMaxPrice() {
    //            $('option', $MaxPrice).removeClass('remove').each(function () {
    //                var x = parseInt($(this).val());
    //                var y = parseInt($MinPrice.val());
    //                if (x < y + 1) { $(this).addClass('remove'); }
    //            });
    //        }

    //        function setMinPrice() {
    //            $('option', $MinPrice).removeClass('remove').each(function () {
    //                var x = parseInt($(this).val());
    //                var y = parseInt($MaxPrice.val());
    //                if (x > y - 1) { $(this).addClass('remove'); }
    //            });
    //        }

    //        $MinPrice.change(function () {
    //            setMaxPrice();
    //        });

    //        $MaxPrice.change(function () {
    //            setMinPrice();
    //        });

    //        setMaxPrice();
    //        setMinPrice();
    //    }    
});                                                                                                                         // end document body


// post-submit callback 
function showResponse(searchData, statusText, xhr, $form) {
    buildDialNum(searchData.Count);    
    changeSearchButtonText();
}

var ShowChangeSearchButtonText = true;

function changeSearchButtonText() {
    if ($('#makesModelsExpander').is(":hidden")) {
        var showResultAlert = $.cookie('showResultAlert');
        $('#searchConsole .footer .btn-wrapper input').val('Show results');
        if (showResultAlert != null) {
            // dont display alert
        } else {
            $.cookie('showResultAlert', true, { path: '/' });
            displayAlert($('#searchConsole .footer .btn-wrapper'), 'Click <b>Show Results</b> to display your chosen vehicle and filter choice.');
        }
    }
}

function PartExchangeKeywordsAlert() {
    
    var PartExchangeKeywords = $.cookie('PartExchangeKeywords');
    if (PartExchangeKeywords != null) {
        // dont display alert
    } else {
        $.cookie('PartExchangeKeywords', true, { path: '/' });
        displayAlert($('#PartExchangeKeywords'), 'Search for part exchanges e.g. <b>350Z</b> or leave blank to search for all our part exchanges.');
    }
}

function buildDialNum(x) {
    var ml = 6;
    var str = x + ''; var l = x.length; var nsrt = ''; var sp = str.split("");
    var missingZeros = ml - str.length;
    var $resultCountSpan = $('div.result-count span');

    for (var a = 0; a < missingZeros; a++) { nsrt += '<em id="e_' + a + '"><span style="color:#ccc;">0</span></em>'; }
    for (var i = 0; i < sp.length; i++) { nsrt += '<em id="num_' + i + '" class="num"><span>' + sp[i] + '</span></em>'; }
       
    $resultCountSpan.html(nsrt);

    var agt = navigator.userAgent.toLowerCase();
    if (agt.indexOf("msie") != -1) {
        $('span .num', $resultCountSpan).css('display', 'none');
    }

    setTimeout(function () {
        $('span ', $resultCountSpan).css('display', 'inline-block');
    }, 300);
}

// pre-submit callback 
function  showRequest(formData, jqForm, options) {
    $('div.result-count span .num span').css('display', 'none');
    var queryString = $.param(formData);
    return true;
}

var options = {
    target: 'div.result-count span:first',
    beforeSubmit: showRequest,
    success: showResponse
};

var activeState = 'inactive';
var timerVal;
var countFormCounter = 0;
function countFormSubmit(clickSource) {
    countFormCounter++; 
    if (activeState == 'inactive') {
        activeState = 'active';
    }
    else {
        clearTimeout(timerVal);
    }

    timerVal = setTimeout(function () {
        activeState = 'inactive';
        var $lctx = !$searchConsole.length ? $('form') : $('form', $searchConsole);
        if ($lctx.ajaxSubmit === undefined) {
            // plugins not loaded.
        } else { $lctx.ajaxSubmit(options); }        
    }, 500);
}

$searchOverlay = $('#searchOverlay');
function setCarFilterHeight() {
    var h = $searchConsoleRight.height();
    h = h - 17;
    var ih = h - 49;
    
    $makesModelsFieldset.css('height', h);
    $makesModelsFieldset.find('ul').css('height', ih);
    $makesModelsFieldset.parent().css('height', h + 6);
    $searchOverlay.removeClass('searchOverlay-full').removeClass('searchOverlay-med-facet').removeClass('searchOverlay-med-filter');


    if (h > 300) { $searchOverlay.addClass('searchOverlay-full').removeClass('search-console-2row_x'); }
    else if (h > 216) { $searchOverlay.addClass('searchOverlay-med-filter').removeClass('search-console-2row_x'); } 
    else if (h > 132) { $searchOverlay.addClass('searchOverlay-med-facet').removeClass('search-console-2row_x'); }

   
}

// clear form function
$.fn.clearForm = function () {
    return this.each(function () {
        var type = this.type, tag = this.tagName.toLowerCase();
        if (tag == 'form')
            return $(':input', this).clearForm();
        if (type == 'text' || type == 'password' || tag == 'textarea')
            this.value = '';
        //else if (type == 'checkbox' || type == 'radio')
        //this.checked = false;
        else if (tag == 'select')
            if ($(this).hasClass('mm-opener')) {
                // do nothing
            }
            else if ($(this).hasClass('select-makes-models')) {
                this.selectedIndex = -1;

            } else {
                this.selectedIndex = 0;
            }
    //$('input[name$="ShowTradeAds"]').attr('checked', true);
    //$('input[name$="ShowPrivateAds"]').attr('checked', true);
    $('input[name$="ShowSoldCars"]').vProp('checked', false);
    //$('input[name$="ShowUnsoldCars"]').attr('checked', true);

    $('#makesModelsExpander input:checked').vProp('checked', true); // WHY? 
    $('span.mm-result li', $makesModelsFieldset).remove();

    /*
    $('.smt').find('span').each(function () {
    $(this).remove();
    });
    */

    if ($('#searchType').length) {
        $('#new-search').vProp('checked', 'checked');
        //$('.so').addClass('hidden');
        $('#Keyword').siblings('.btn').removeClass('hidden');
        $('#Keyword').unbind();
    }
});
}

// rebuilds the more filter list list to match any closed modules
function buildMoreFiltersList() {
    $searchFacetItems.each(function () {
        var $this = $(this);
        setChecked($('#x_' + $this.attr('id')), $this.hasClass('visible') ? 1 : 0);
    });

    $moreFilters = $('div.more-filters'); 
    var checked = $("input[type=checkbox]:checked", $moreFilters).length; // test to see if checked.
    if (checked < 4) {
        //$('.search-console-right').removeClass('advanced-filters');
        //$('a.mf,a.cf', $searchConsoleRight).hide('fast');
        //$('a.cf', $searchConsoleRight).show('fast');
        //$('a.mf', $searchConsoleRight).hide('fast');
        //$moreFilters.show('fast');
    }
    else {
        //$('.search-console-right').removeClass('advanced-filters');
        $moreFilters.hide('fast');
        $('a.cf', $searchConsoleRight).hide('fast');
        $('a.mf', $searchConsoleRight).show('fast');
    }

    $('a.mf', $searchConsoleRight).click(function () {
        $('a.mf', $searchConsoleRight).hide('fast');
        $('a.cf', $searchConsoleRight).show('fast');
        $moreFilters.slideDown('slow', function () {
            setCarFilterHeight();
        });

        var checked = $("input[type=checkbox]:checked", $moreFilters).length; // test to see if checked.
        if (checked > 3) {
            $searchConsoleRight.addClass('advanced-filters');

        }

        return false;
    });

    $('a.cf', $searchConsoleRight).click(function () {
        $moreFilters.hide('fast', function () {
            setCarFilterHeight();
        });

        $('a.cf', $searchConsoleRight).hide('fast');
        $('a.mf', $searchConsoleRight).show('fast');

        $searchConsoleRight.removeClass('advanced-filters');


        return false;
    });


    $('input', $moreFilters).click(function () {

        var $thisItem = $(this).attr('name'); // gets name of filter
        $thisItem = $thisItem.replace('x_', ''); // add x to name
        var checked = $("input[type=checkbox]:checked", $moreFilters).length; // test to see if checked.

        var thisfacet = $("#" + $thisItem);
        if ($(this).is(':checked')) {

            if (checked > 3) {
                $searchConsoleRight.addClass('advanced-filters');
                setSortHeight('172');
                $('a.cf', $searchConsoleRight).show('fast');
            }
            else {
                $searchConsoleRight.removeClass('advanced-filters');

            }

            if (checked > 6) {
                $(this).vProp('checked', false);

                displayAlert($(this), '<b>You can only have a maximum of 6 filter types!</b><br/>Please remove one before adding another');
            } else {
                $('ul.sortable li.visible:last').after($("ul.sortable #" + $thisItem));
                thisfacet.removeClass().addClass('visible');
                setListCookie();
                //countFormSubmit();
            }
        } else {

            if (checked < 4) {
                $searchConsoleRight.removeClass('advanced-filters');
                setSortHeight('86');
                //$('a.cf', $searchConsoleRight).hide('fast');
            }
            else
            { $searchConsoleRight.addClass('advanced-filters'); $('.cf').show('fast'); }

            thisfacet.removeClass().addClass('inactive');
            //$('ul.sortable li.visible:last').after($("ul.sortable #" + $thisItem));
            thisfacet.find('input').val('');
            thisfacet.find('select').each(function () {
                $(this).find('option:first').vProp('selected', 'selected');
            });

            setListCookie();
            countFormSubmit();
        }

    });
}

// sets the cookie every time a module is moved or closed
function setListCookie(single) {
    var str = '';
    var $topCont = $('#contentSubNav span');
    if ($topCont.length == 0) { return; }
    var topLevel = $('#contentSubNav span').html().toCookieName();
    if (topLevel.length > 0) {
        var first = true;
        $("#searchFacets li").each(function () {
            var code = $(this).attr('code');
            var status = $(this).attr('class');
            if (code.length > 0 && status.length > 0) {
                status = $.trim(status.replace('drag-hover', '').replace('legend-hover', '')).substr(0, 1);
                if (!first) { str += '|'; }
                str += code + ':' + status;
                first = false;
            }
        });

        if (str.length && str.indexOf('<') == -1 && str.indexOf('>') == -1) {
            if (!single) {
                var cookieName = topLevel + 'FacetSeq';
                $.cookie(cookieName, str, { expires: 30, path: '/' });
                $('#ordering-cookie').val(str);
                $('#ReorderOnce').val('');
            }
            else {
                $('#ReorderOnce').val(str);
            }
        }
    }
}

function setListReorderOnce() {
    var option = $.urlParam('option');
    var obeyServer = option != null && option == 1;
    if (obeyServer) {setListCookie(1); } else { setListCookie(); }
}

(function ($, window, document, undefined) {
    $.fn.quicksearch = function (target, opt) {

        var timeout, cache, rowcache, jq_results, val = '', e = this, options = $.extend({
            delay: 300,
            selector: null,
            stripeRows: null,
            loader: null,
            noResults: '',
            bind: 'keyup',
            onBefore: function () {
                return;
            },
            onAfter: function () {
                return;
            },
            show: function () {
                this.style.display = "";
            },
            hide: function () {
                this.style.display = "none";
            },
            prepareQuery: function (val) {
                return val.toLowerCase().split(' ');
            },
            testQuery: function (query, txt, _row) {
                for (var i = 0; i < query.length; i += 1) {
                    if (txt.indexOf(query[i]) === -1) {
                        return false;
                    }
                }
                return true;
            }
        }, opt);

        this.go = function () {

            var i = 0,
			noresults = true,
			query = options.prepareQuery(val),
			val_empty = (val.replace(' ', '').length === 0);

            for (var i = 0, len = rowcache.length; i < len; i++) {
                if (val_empty || options.testQuery(query, cache[i], rowcache[i])) {
                    options.show.apply(rowcache[i]);
                    noresults = false;
                } else {
                    options.hide.apply(rowcache[i]);
                }
            }

            if (noresults) {
                this.results(false);
            } else {
                this.results(true);
                this.stripe();
            }

            this.loader(false);
            options.onAfter();

            return this;
        };

        this.stripe = function () {

            if (typeof options.stripeRows === "object" && options.stripeRows !== null) {
                var joined = options.stripeRows.join(' ');
                var stripeRows_length = options.stripeRows.length;

                jq_results.not(':hidden').each(function (i) {
                    $(this).removeClass(joined).addClass(options.stripeRows[i % stripeRows_length]);
                });
            }

            return this;
        };

        this.strip_html = function (input) {
            var output = input.replace(new RegExp('<[^<]+\>', 'g'), "");
            output = $.trim(output.toLowerCase());
            return output;
        };

        this.results = function (bool) {
            if (typeof options.noResults === "string" && options.noResults !== "") {
                if (bool) {
                    $(options.noResults).hide();
                } else {
                    $(options.noResults).show();
                }
            }
            return this;
        };

        this.loader = function (bool) {
            if (typeof options.loader === "string" && options.loader !== "") {
                (bool) ? $(options.loader).show() : $(options.loader).hide();
            }
            return this;
        };

        this.cache = function () {

            jq_results = $(target);

            if (typeof options.noResults === "string" && options.noResults !== "") {
                jq_results = jq_results.not(options.noResults);
            }

            var t = (typeof options.selector === "string") ? jq_results.find(options.selector) : $(target).not(options.noResults);
            cache = t.map(function () {
                return e.strip_html(this.innerHTML);
            });

            rowcache = jq_results.map(function () {
                return this;
            });

            return this.go();
        };

        this.trigger = function () {
            this.loader(true);
            options.onBefore();

            window.clearTimeout(timeout);
            timeout = window.setTimeout(function () {
                e.go();
            }, options.delay);

            return this;
        };

        this.cache();
        this.results(true);
        this.stripe();
        this.loader(false);

        return this.each(function () {
            $(this).bind(options.bind, function () {
                val = $(this).val();

                if (val.length > 1) {
                    e.trigger();
                }

                if (val.length < 1) {
                    e.trigger();
                    $('#modelList li.washidden').addClass('hidden').removeClass('washidden');
                }
            });
        });

    };

} (jQuery, this, document));


function setSortHeight(x) {
    $searchFacets.animate({
        height: x
    }, 400, function () {

        setCarFilterHeight();

    });
}

