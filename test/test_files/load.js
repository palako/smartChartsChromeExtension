
//======SO-METRICS=====

var metricsEnabled = true;
var metricsStart = new Date();
var metricsPrevious = 0;
function renderMetrics(tag) {
    if (metricsEnabled) {
        var metricsNew = Math.abs(metricsStart - new Date());
        var metricsDiff = metricsNew - metricsPrevious;
        metricsPrevious = metricsNew;
        var elem = '<p>Tag: ' + tag + ' Ms: ' + Math.abs(metricsStart - new Date()) + ' Diff: ' + metricsDiff + '</p>';
        var rm = $('#renderMetrics');
        if (!rm.length) {
            $('body').prepend('<div id="renderMetrics" style="left:0;top:0;border:1px solid red;color:blue;">&nbsp;</div>');
            rm = $('#renderMetrics');
        }
        rm.prepend(elem);
    }
}
function renderStart(tag) { renderMetrics('[Start]: ' + tag); }
function renderStop(tag) { renderMetrics('[Stop]: ' + tag); }

//======EO-METRICS=====

var isMobileMode = false;
var hasTouchOrPointer = 'ontouchstart' in window || 'onmsgesturechange' in window || 'onmousemove' in window;
var expanderSuspend = false;

//======GPT-Tags=====

var metrics = {
    validationError: function (customClass) {
        if (typeof (Haymarket) != 'undefined') {
            Haymarket._validationErrors(customClass);
        }
    },
    virtualPageView: function (virtualPageUri, code) {
        if (typeof (Haymarket) != 'undefined' && typeof (virtualPageUri) != 'undefined' && virtualPageUri != null && virtualPageUri.length > 0) {
            if (virtualPageUri[0] != '/') { virtualPageUri = '/' + virtualPageUri; }
            if (typeof (code) != 'undefined') {
                Haymarket._vpv('/' + code + virtualPageUri);
            } else {
                Haymarket._vpv(virtualPageUri);
            }
        }
    },
    postCodeEntry: function (postCode) {
        if (typeof (Haymarket) != 'undefined' && postCode != null && postCode != '') {
            if (postCode.length > 4) postCode = postCode.substr(0, 4);
            Haymarket._cv(46, 'Postcode', postCode, 1);
        }
    }
};


$(document).ready(function () {
    isMobileMode = $('body').hasClass('mobile-mode');

    $('form.validationForm').bind('submit', function () {
        var $this = $(this);
        $this.find('input.trackablePostcode').each(function () {
            metrics.postCodeEntry($(this).val()); 
        });
        metrics.validationError();
    });

    //Share button
    $("#detail-share").click(function () {
        var keyParam = $("#BitlyKey").val();
        var idParam = $("#BitlyId").val();
        var url = "http://" + document.location.host + "/api/getsharedata";

        $.get(
            url,
            { advertid: idParam, key: keyParam },
            function (data) {
                var x = screen.width / 2 - 600 / 2;
                var y = screen.height / 2 - 300 / 2;
                var shareData = data.split('|');

                $("#detail-share-options-bitly").text(shareData[0]);
                $("#detail-share-facebook").click(function () {
                    window.open(shareData[1], 'ShareOnFacebook', 'height=250,width=600,left=' + x + ',top=' + y + ',resizable=no,scrollbars=no,toolbar=no,menubar=no,location=no,directories=no, status=yes');
                });
                $("#detail-share-twitter").click(function () {
                    window.open(shareData[2], 'ShareOnTwitter', 'height=250,width=600,left=' + x + ',top=' + y + ',resizable=no,scrollbars=no,toolbar=no,menubar=no,location=no,directories=no, status=yes');
                });
                $("#detail-share-email").attr("href", shareData[3]);
            }
        );

        var element = $('div#detail-share-options');
        element.toggle(300);
    });

    $("#EditDetailsButton").click(function () {
        $.post('/selfservice/editcardetails', $('#SSIForm').serialize(), function (data) {
            window.location = data;
        });
    });

    function buildReloader() {
        setTimeout(function () {
            $('a.reloader').unbind().click(function () {
                if (this.href + '' == '#' || window.location.href.replace('#', '') == this.href.replace('#', '')) {
                    window.location.reload(true);
                }
                else {
                    window.location.href = this.href;
                }
                return false;
            });
            $('.setBookmarked,.setUnbookmarked').unbind().click(function () { return setBookmarkClick($(this)); });
        }, 500);
    }

    var mapView = $('.map-visible');
    if (mapView.length) {
        onLoadDisplayMap();
    }

    var $searchOverlay = $('#searchOverlay');
    var $searchHelp = $('#use-search');
    var $searchFullOverlay = $('#search-full-overlay');

    function startTrans($this, nodis) {
        if ($this.hasClass('trans-action') && $this.parents('#dialogBox').length == 0) {
            if (!nodis || nodis == 0) {
                $this.attr('disabled', 'disabled');
            }
            if ($this.attr('trans') !== undefined) {
                var textOrig = $this.val();
                $this.val($this.attr('trans'));
                $this.attr('orig', textOrig);
            }
            var cls = 'trans-progress' + (isMobileMode && $this.hasClass('btn') ? '-a' : '');
            $this.wrap('<div class="' + cls + '" />');
        }
    }

    function stopTrans() {
        var $this = $('input.trans-action');
        var cls = 'trans-progress' + (isMobileMode && $this.hasClass('btn') ? '-a' : '');
        if ($this.length && $this.parent && $this.parent().hasClass(cls)) {
            $this.removeAttr('disabled');
            if ($this.attr('orig') !== undefined) {
                $this.val($this.attr('orig'));
            }
            $this.unwrap();
        }
    }

    function togglesearchOverlay(pref) {
        var $target = $('#use-search');
        var prefVal = pref === true ? true : pref === false ? false : $target.html() == "How to use this search" ? true : false;

        if (prefVal == true) {
            if (isIEAgent()) { $searchOverlay.show(); } else { $searchOverlay.show('slow'); }
            $target.html('Close how to use this search');
            $searchFullOverlay.show();

        } else {
            if (isIEAgent()) { $searchOverlay.hide(); } else { $searchOverlay.hide('slow'); }
            $target.html('How to use this search');
            $searchFullOverlay.hide();
        }

        return false;
    }

    if (isIPhoneAgent()) { togglesearchOverlay(false); }
    $searchFullOverlay.css('height', $('body').height());
    if ($('#classifiedsIndex').length) { $searchHelp.click(togglesearchOverlay); $searchOverlay.click(togglesearchOverlay); }
    else { $searchHelp.hide(); }

    configureSearchField('#Keyword', '#searchConsoleRight', 'Enter Keywords');
    configureSearchField('#q_Keyword', '#quickSearch', 'Enter Keywords');
    configureSearchField('#sell-panel-reg', '#sell-panel-reg-container', 'YOUR REG');
    configureSearchField('#Postcode', '#searchConsoleRight', 'Enter Postcode');

    $(".sell-on-ph .btn-wrapper").hover(
        function () { $(this).addClass('btn-wrapper-hovered'); },
        function () { $(this).removeClass('btn-wrapper-hovered'); }
    );

    var defaultCtx = null;
    function advertGalleryClick() {
        var $this = $(this);
        if (defaultCtx == null && typeof (GetAnalyticsContext) != 'undefined') {
            defaultCtx = GetAnalyticsContext();
        }
        if (defaultCtx != null && typeof (SetAnalyticsContext) != 'undefined') {
            var $suggests = $this.closest('div.related-products');
            SetAnalyticsContext($suggests.length && $suggests.length > 0 ? 'suggests' : defaultCtx);
        }

        loadGalleryIntoLightBox($this.attr('href'));
        return false;
    }

    $('#gallery-wrapper a').click(advertGalleryClick);
    $('.mi a').click(advertGalleryClick);

    if (!isMobileMode) {
        var hoverText = "";
        $(".info-tip").hover(
            function () {
                var $this = $(this);
                hoverText = $(this).attr('title');
                $(this).attr('title', '');
                displayHover($this, hoverText);
            },
            function () {
                $(this).attr('title', hoverText);
                $('#alert-box-wrapper').css('display', 'none');
            }
        );
    } else {
        var $foot = $("div.footer");
        if ($foot.length > 0) {
            if ($("div.fixed-block").length > 0) { $foot.append('<div class="scroll-block"></div>'); }
            if ($("ul.fixed-block").length > 0) { $foot.append('<div class="scroll-block-b"></div>'); }
        }
    }

    function configureSliders(rootSel) {
        if (!hasTouchOrPointer) return; // Sliders require touch capability or a pointer device. 
        getReference('div.slider', rootSel).each(function () {
            var $this = $(this);
            var $cont = $this.closest('div.slider-container');
            if ($cont.length == 0) return;
            var is2Handle = $this.hasClass('double');
            var defaultText = $this.attr('default-text');
            var useDef = defaultText !== undefined && defaultText != null && defaultText.length > 0;
            var invVal = $this.attr('invert');
            var invert = invVal !== undefined && invVal != null && invVal.toLowerCase() == 'true';
            var prefix = $this.attr('prefix-text');
            var usePrefix = prefix !== undefined && prefix != null && prefix.length > 0;
            var $label = $('#' + $this.attr('label'));
            var $sel1 = $('#' + $this.attr('target1'));
            var $sel2 = $('#' + $this.attr('target2'));
            var $options1 = $sel1.find('option');
            var count1 = $options1.length;
            var $options2 = is2Handle ? $sel2.find('option') : null;
            var count2 = is2Handle ? $options2.length : 0;
            var $val1Label = $('label[for=' + $this.attr('target1') + ']');
            var $val2Label = is2Handle ? $('label[for=' + $this.attr('target2') + ']') : null;


            var slideChange = function (event, ui) {
                var is2 = ui.values.length > 1;
                var ind1 = ui.values[0] < count1 ? ui.values[0] : 0;
                var ind2 = is2 ? ui.values[1] < count2 ? ui.values[1] : 0 : 0;
                var $opt1 = $($options1[ind1 > 0 && invert ? count1 - ind1 : ind1]);
                var $opt2 = is2 ? $($options2[ind2 > 0 && invert ? count2 - ind2 : ind2]) : null;
                if ($sel1.length > 0 && $sel1.is('select')) {
                    $sel1.val($opt1.attr('value'));
                }
                if (is2 && $sel2.length > 0 && $sel2.is('select')) {
                    $sel2.val($opt2.attr('value'));
                }
                if ($label.length > 0) {
                    var val1Label = ind1 == 0 && useDef ? defaultText : $opt1.text();
                    if (is2) {
                        var val2Label = ind2 == 0 && useDef ? defaultText : $opt2.text();
                        $label.text('From ' + val1Label.toLowerCase() + ' to ' + val2Label.toLowerCase());
                    } else {
                        $label.text(usePrefix ? prefix + ': ' + val1Label : val1Label);
                    }
                }
            };

            var sel1 = $sel1.length > 0 ? invert ? count1 - $sel1[0].selectedIndex : $sel1[0].selectedIndex : 0;
            var sel2 = $sel2.length > 0 ? invert ? count2 - $sel2[0].selectedIndex : $sel2[0].selectedIndex : count2;
            var selIdx1 = sel1 > 0 && sel1 < count1 ? sel1 : 0;
            var selIdx2 = sel2 > 0 && sel2 < count2 ? sel2 : count2;
            if (selIdx1 > 0 && selIdx1 != count1 && selIdx2 == 0) { selIdx2 = selIdx1; selIdx2 = 0; }
            if (selIdx1 > selIdx2 && invert) { var swap = selIdx1; selIdx1 = selIdx2; selIdx2 = swap; }

            var vals = is2Handle ? [selIdx1, selIdx2] : [selIdx1];
            var sliderData = {
                range: is2Handle,
                min: 0,
                max: count1,
                step: 1,
                values: vals,
                slide: slideChange
            };


            $this.slider(sliderData);

            if ($sel1.length > 0) {
                $sel1.hide();
                if ($val1Label.length > 0) $val1Label.hide();
            }

            if (is2Handle && $sel2.length > 0) {
                $sel2.hide();
                if ($val2Label.length > 0) $val2Label.hide();
            }

            slideChange(null, sliderData);
            $cont.show();

            $('.ui-slider-handle').each(function () {
                $(this).addClass('sliderNumber_' + $(this).index());
            });
        });
    }

    function configureMultiSelect(rootSel) {
        var $ref = getReference(rootSel);
        if (!isMobileMode) {
            $('div.mselect-list', $ref).hide();
            $('div.mselect-opener a, div.mselect-opener', $ref).click(function () {
                var $root = $(this).closest('.mselect-root');
                $('.mselect-list', $root).toggle();
                return false;
            });
        }

        $('label.checkbox-label, div.mselect-list', $ref).click(function () {
            var $parent = $(this).parent();
            if ($parent.length) {
                var $chk = $(this).siblings('input[type=checkbox]');
                var revSel = $chk.is(':checked') == true ? 0 : 1;
                setChecked($chk, revSel);
                return $chk.length == 0;
            }
            return true;
        });

        $('.mselect-add', $ref).click(function () {
            var $root = $(this).closest('.mselect-root');
            $.each($('.mselect-list input[type=checkbox]', $root), function (i, chk) { $(chk).vProp('checked', 'checked'); });
            return false;
        });

        $('.mselect-rem', $ref).click(function () {
            var $root = $(this).closest('.mselect-root');
            $.each($('.mselect-list input[type=checkbox]', $root), function (i, chk) { $(chk).vProp('checked', false); });
            return false;
        });

        $('.mselect-cls', $ref).click(function () {
            var mselectStr = "";
            var $list = $(this).closest('.mselect-list');
            var $root = $(this).closest('.mselect-root');
            var $target = $root.find('.mselect-lbl');
            $list.hide();

            if ($target.length) {
                var delReq = 0;
                $.each($('.mselect-list input[type=checkbox]', $root), function (i, chk) {
                    var t = $(chk);
                    if (t.is(':checked')) {
                        mselectStr = mselectStr + (delReq == 1 ? ", " : "") + $(t).parent().find('label').text();
                        delReq = 1;
                    }

                });
                if (!mselectStr || mselectStr == "") {
                    $target.html('Select by checking options in the drop down');
                    $target.removeAttr("title");
                } else {
                    var str = mselectStr;
                    var shortText = str.truncate(40);
                    $target.html("Selected: " + shortText);
                    $target.attr('title', "Selected: " + str);
                }
            }

            if (countFormSubmit) {
                countFormSubmit();
            } else {
                $(this).closest('form').ajaxSubmit(options);
            };
            return false;
        });
    }

    configureMultiSelect();

    function postCodeChange() {
        if (this.value !== 'PostCode') { $('#Distance').val('2147483647'); }
        if (this.value == '') { $('#Distance').val('ANY'); }
    }

    var $homeSearchLeft = $('#homeSearchLeft');
    if ($homeSearchLeft.length) {

        $('#Postcode').change(postCodeChange);

        $('#Keyword, #Postcode', $homeSearchLeft).each(function () {
            var t = $(this).parent().attr('title');
            var i = $(this);
            var n = i.attr('name');
            if (i.val() == '') {
                i.val(t).addClass('searchinactive').attr('name', 'xx' + n);
            }
            i.focus(function () { if (i.val() == t) { i.val('').removeClass('searchina+ctive').attr('name', n); } });
            i.blur(function () { if (i.val() == '') { i.val(t).addClass('searchinactive').attr('name', 'xx' + n); } });
        });

        var $makesModels = $('#M');
        var $makesModelGroups = $("optgroup", $makesModels);
        var $makesModelOpts = $('option', $makesModels);

        if (!$homeSearchLeft.hasClass('main-home-panel')) {
            $makesModels.parent().addClass('hidden');

            // (potential for improvment)
            var makeModels = '<div class="field"><label for="SelectModel">Select make</label><select name="SelectModel" id="SelectModel"><option value="na" selected>Select a model</option>';
            var makeSelect = '<div class="field"><label for="SelectMake">Select make</label><select name="SelectMake" id="SelectMake"><option value="na" selected>Select a make</option>';

            $makesModelGroups.each(function () {
                var $thisGrp = $(this);
                makeSelect += '<option value="' + $thisGrp.attr('value') + '">' + $thisGrp.attr('label') + '</option>';
            });

            makeModels += ' </select></div>';
            makeSelect += ' </select></div>';
            $homeSearchLeft.prepend(makeModels).prepend(makeSelect);

            $('#SelectMake').change(function () {
                buildModelList($(this), $(this).val());
            });

            $makesModels.change(selectionChanged);
            var $selectModel = $('#SelectModel');
            if ($selectModel) {
                $selectModel.change(selectionChanged);
            }
        }

        function buildModelList(x, val) {
            $makesModelOpts.vProp('selected', '');
            $makesModelGroups.each(function () {
                var $this = $(this);
                if ($this.attr('value') == val) {
                    $this.find('option:first').vProp('selected', 'selected');

                    var $localSelectModel = $('#SelectModel');
                    $localSelectModel.html($this.html());
                    $localSelectModel.find('option:first').each(function () {
                        var $that = $(this);
                        $that.text('All ' + $that.text());
                    });
                }
            });

            $(x).parents('form').ajaxSubmit(options);
            return false;
        }

        function selectionChanged() {
            var $this = $(this);
            $makesModelOpts.vProp('selected', '');
            $makesModelOpts.filter('[value="' + $this.attr('value') + '"]').vProp('selected', 'selected');
            if (countFormSubmit) { countFormSubmit(); } else {
                $this.parents('form').ajaxSubmit(options);
            };
            return false;
        };
    }

    $('a.menu-opener').click(function (ev) {
        if ($(this).hasClass('menu-static')) {
            return true;
        }
        ev.preventDefault();
        var menuOpenCls = 'menu-open';
        var menuButtonSel = 'menuSelected';
        var ref = $(this).attr('data-menu-selector');
        if (ref != null && ref.length > 0) {
            var $ref = $(ref);
            //$ref.css('display', 'none');
            if ($ref.hasClass(menuOpenCls)) {
                $ref.animate({
                    'height': '0'
                }, 200, function () {
                    $(this).css({
                        'padding': '0',
                        'opacity': '0',
                        'display': 'none'
                    });
                }).removeClass(menuOpenCls);
                $(this).parent('div').removeClass(menuButtonSel);
            } else {
                $ref.css('display', 'block');
                var animationHeight;
                var animationSpeed;
                if ($(ref).attr('id') == 'my-account-menu') {
                    animationHeight = '255';
                    animationSpeed = '500';
                } else {
                    animationHeight = '95';
                    animationSpeed = '200';
                }
                $ref.animate({
                    'opacity': '1',
                    'display': 'block',
                    'padding': '10px 0px',
                    'height': animationHeight
                }, animationSpeed).addClass(menuOpenCls);
                $(this).parent('div').addClass(menuButtonSel);
            }
        }
        return false;
    });

    function checkPhoneSafe(element) {
        var selector = element.val() + '_PhoneSafe';
        var val = $('#' + selector).val();
        setPhoneSafeState(val);
    }

    function setPhoneSafeState(state) {

        var phoneSafeBox = $('#ChooseAdTypePostModel_UsePhoneSafe');

        if (state == 'PhoneSafeRequired') {
            phoneSafeBox.vProp('checked', 'checked');
            phoneSafeBox.attr('disabled', 'disabled');
            var elem = $('input[name*="ChooseAdTypePostModel.UsePhoneSafe"]');
            elem.val(true);
        }

        //  Editable
        else if (state == 'PhoneSafeOptional') {
            phoneSafeBox.removeAttr('disabled');
        }

        //  Unticked and readonly
        else if (state == 'PhoneSafeNotAvailable') {
            phoneSafeBox.attr('disabled', 'disabled');
            phoneSafeBox.removeAttr('checked');
        }
    }

    function thumbnailLinkClick() {
        if ($('div.thumbnail a').hasClass('alsoEvent')) {
            sendEventLog('AlsoFound');
        };
    }

    $('div.thumbnail a').click(thumbnailLinkClick);

    function keywordCloseLinkClick() {
        if ($(this).hasClass('ResetAdForm')) {
            resetWriteAdPage($(this).prev());
        }

        resetSpecElement($(this));
        return false;
    }

    function searchAgainButtonClick() {
        var valid = $('#PostModel_Registration').valid();

        if (valid == true) {
            $('#PostModel_SearchAgain').val(true);
            $('form.ajaxForm').unbind();
            return true;
        }
        return false;
    }

    function selfServiceStepClick() {
        var ssiForm = $('#SSIForm');
        var valid = ssiForm.valid; //func?
        if (valid == false) {
            $('.field-validation-error').hide();
            return true;
        }
        var r = this.id;
        $('input.RedirectStep').val(r);
        displayAlert($(this), 'Your changes have been saved');
        ssiForm.submit();
        $('#alert-box-wrapper').fadeOut(3000);
        return false;
    };

    function selfServicePreviewClick() {
        var ssiForm = $('#SSIForm');
        var valid = ssiForm.valid; //func?
        if (valid == false) {
            $('.field-validation-error').hide();
            return true;
        }
        var r = this.id;
        $('input.RedirectStep').val(r);
        ssiForm.submit();

        return false;
    };

    function whatsThisClick() {
        var $spans = $(this).siblings('span');
        var whatIsThisText = $spans.length > 0 ? $spans.text() : $(this).siblings('div').text();
        displayAlert($(this), whatIsThisText);
        return false;
    }
    $('#WhatIsThis a').click(whatsThisClick);

    // SSI specific event handlers here:
    var $ssiForm = $('#SSIForm');
    if ($ssiForm.length > 0) {
        $('a.keywordCloseLink', $ssiForm).click(keywordCloseLinkClick);
        $('#SearchAgain').click(searchAgainButtonClick);
        $('#processSteps a.SSISave').click(selfServiceStepClick);
        $('#ssi-footer a.SSISave').click(selfServicePreviewClick);
        $('.ssi-header-nav a.SSISave').click(selfServicePreviewClick);

        $('#CompleteDetails').click(function () {
            $('#PostModel_CompleteDetails').val(true);
            $('form.ajaxForm').unbind();
            return true;
        });

        $('#resetAdForm').click(function () {
            resetWriteAdPage($(this));
            return false;
        });

        if (isMobileMode) {
            $ssiForm.find('input[type=submit]').click(function () {
                if (this.id == 'SearchAgain') return;
                var $first = null;
                var $exp = $ssiForm.find('div.expander-wrapper');
                var cnt = $exp.length;
                for (var idx = 0; idx < cnt; idx++) {
                    var $this = $($exp[idx]);
                    if (!$this.hasClass('expander-open')) {
                        var $invs = $this.find('span.field-validation-error');
                        if ($invs.length > 0) {
                            expandNow($this);
                            if ($first == null) {
                                $first = $invs.first();
                                var fld = $first.attr('data-valmsg-for');
                                var $fld = $first;
                                if (fld !== undefined && fld != null && fld.length > 0) {
                                    var $tmp = $('#' + fld.replace('.', '_').replace('.', '_').replace('.', '_') + '');
                                    $fld = $tmp.length > 0 ? $tmp : $first;
                                }
                                scrollTo($fld, 300, -50);
                            }
                        }
                    }
                };
                if ($first == null) return true;
            });
        }

        var $checkPhoneSafeEls = $('#addList input.checkPhoneSafe');
        checkPhoneSafe($checkPhoneSafeEls.filter(':checked'));
        $checkPhoneSafeEls.click(function () { checkPhoneSafe($(this)); });
    }

    $('a.external-link').click(function () {
        sendEventLog('ExternalDealerLink');
        return true;
    });

    $('a.external-deep-link').click(function () {
        sendEventLog('ExternalDealerAdvertDeepLink');
        return true;
    });

    // call to correct missing images in results view   
    var blankImageUrl = $('#image-url').val() + 'blank.jpg';
    $('#resultsList img').each(function () {
        if (this.src == document.location.href) this.src = blankImageUrl;
    });

    var simpleOptions = {
        beforeSubmit: simpleShowRequest,  // pre-submit callback 
        success: simpleShowResponse  // post-submit callback 
    };

    var bookmarkListOptions = {
        beforeSubmit: simpleShowRequest,  // pre-submit callback 
        success: bookmarkListShowResponse  // post-submit callback 
    };


    function simpleShowRequest() { }

    function bookmarkListShowResponse(responseText, statusText, xhr, $form) {
        $form.find('div.bookmarkListUrlOrLabel').html(responseText);
    }

    function simpleShowResponse(responseText, statusText, xhr, $form) {
        $form.find('label').html(responseText);
    }

    var $paymentOptions = $('#resultsList input.payment-option');
    $paymentOptions.change(function () {
        var total = new Number(0.00);
        var items = $('#advertPaymentForm input.advert-data');
        items.each(function (index, element) { $(element).val(''); });

        $paymentOptions.filter(':checked').each(function (index, element) {
            var val = $(element).attr('tag');
            if (val) {
                total += new Number(val);
                var id = $(element).attr('id');
                var added = false;
                items.each(function (ind, el) {
                    if (!added && $(el).val() == '') {
                        $(el).val(id); added = true;
                    }
                });
                index++;
            }
        });

        $('#PaymentAmount').text(total.toFixed(2));

        if (isMobileMode) {
            var $this = $(this);
            var $item = $this.closest('li.product');
            if ($this[0].checked) { $item.addClass('selected'); }
            else { $item.removeClass('selected'); }
        }
    });

    function setSubmitLock() {
        var $this = $(this);
        // This caters for other types of submit behaviour, including SSI. 
        if (!$this.hasClass('ajaxSubmitButton') && !$this.hasClass('ajaxAction')) {
            var $form = $this.closest('form');
            if ($form.valid()) { startTrans($this); }
            $form.submit();
            return false;
        }
        return true;
    }

    $('input.trans-action').click(setSubmitLock);

    function ajaxSubmitNearest($this) {
        var isForm = $this.is('form');
        var $form = isForm ? $this : $this.closest('form');
        if ($form.valid()) {
            startTrans(isForm ? $form.find('input.trans-action') : $this);
            $form.append('<input type="hidden" name="actionId" value="' + $this.attr('rel') + '"/>');
        }
        // In regularForm, non ajax, non dialog cases we need a plain old form submit. 
        if ($form.hasClass('regularForm') ||
                ($form.parents('#dialogBox').length == 0 && !$this.hasClass('ajaxAction') && !$this.hasClass('ajaxSubmitButton'))) {
            $form.submit();
        }
        else {
            if ($form.validate().form()) {
                $form.ajaxSubmit(ajaxAction);
            }
        }
        return false;
    }

    function setSingleBookmark(id, val) {
        if (id <= 0) return;
        var $elem = $('span.bookmark[id=' + id + ']');
        if ($elem.length) {
            if (val == true) {
                $elem.find('.bookmark-link').hide();
                $elem.find('.bookmark-label').show();
            }
            else {
                $elem.find('.bookmark-label').hide();
                $elem.find('.bookmark-link').show();
            }
        }
        if (val == false) {
            var $bm = $('#' + id);
            if ($bm.hasClass('bookmark') && $bm.hasClass('can-del')) {
                var $cont = $bm.parents('div.results');
                if ($cont.length && $bm.siblings('.bookmark').length == 0) {
                    $cont.replaceWith('<div class="message"><p>All bookmarks have been removed.</p></div>');
                }
                else {
                    $bm.remove();
                }
            }
        }
        return;
    }

    function setBookmarkClick($this) {
        var bookmarkId = new Number($this.attr('bookmark'));
        setSingleBookmark(bookmarkId, $this.hasClass('setBookmarked'));
        if ($this.hasClass('ajaxAction')) { ajaxSubmitNearest($this); }
        if ($this.hasClass('closeModal')) { closeDialog(); }
        return false;
    }

    $('#resultsList input.bookmarkListItem').change(function () {
        $(this).closest('form').ajaxSubmit(bookmarkListOptions);
    });

    $('#resultsList input.notifySaveSearch').change(function () {
        var $this = $(this);
        var $form = $this.closest('form');
        var $notify = $form.find('.notifyVal');
        $notify.val($this.is(':checked') + '');
        $form.ajaxSubmit(simpleOptions);
    });

    function showSaveRequest() {
    }

    function showSaveResponse(responseText, statusText, xhr, $form) {
        // the reloads the original content on the page.  
        var respHtml = responseText != null ? responseText.trim() : null;
        var $resp = $(respHtml);
        var path = $resp.find('input#modalCallback').val();
        var target = $resp.find('input#modalCallbackTarget').val();
        var fulPageTest = $resp.find('#modalRedirectLocation');

        var fullPage = false;
        if (fulPageTest.length > 0) {
            closeDialog();
            var loc = $(fulPageTest).val();
            window.location.replace(loc);
            fullPage = true;
        }
        else {
            // load the returned content into modal window
            htmlLoadedDialog(responseText, 'ui-ajax-modal');
        }

        if (!fullPage && path != null) {
            var db = $('#dialogBox');
            var thisHeight = $('#modal-content', db).height(); // 200;
            $(target).css('height', $(target).height());
            $(target).html('<div class="loading-sprinner"><br/><br/><br/><div>');

            $.ajax({
                url: path,
                context: '#modal-content',
                success: function (html) {
                    $(target).html(html);
                    setModalHeight($('#modal-content', db).height(), thisHeight);
                    $(target).css('height', 'auto');

                    buildReloader();
                }
            });
        }

        setTimeout(stopTrans, 200);
    }

    var ajaxAction = { target: '#dialogBox', beforeSubmit: showSaveRequest, success: showSaveResponse };
    $('a.ajaxAction,input.ajaxAction,input.ajaxSubmitButton').vLive('click', function () {
        return ajaxSubmitNearest($(this));
    });

    $('body').append('<div id="mapWindow"></div>');

    var $changeView = $('#changeView');
    var $resultsList = $('#resultsList');

    function expanderCheckBoxClick($el, w, ec, cl) {
        if ($el.is(':checked')) {
            ec.slideDown('slow'); w.addClass(cl);
        }
        else {
            ec.slideUp('slow'); w.removeClass(cl);
            // prevent complex validations from stopping the page (i.e.: use required-if on the checkbox).
            $(ec).find('input').val('');
            $(ec).find('select').val('');
        }
    }

    var expanderAnimate = true;
    var expanderWorking = false;
    function expanderLinkClick($el, w, ec, cl) {
        if (expanderSuspend == true) { expanderSuspend = false; return; }
        if (expanderWorking) return;
        expanderWorking = true;
        if ($el.hasClass('ec-open')) {
            $el.removeClass('ec-open');
            w.removeClass(cl);
            if (expanderAnimate) {
                ec.slideUp('slow', function () { expanderWorking = false; });
            } else {
                ec.hide(); expanderWorking = false;
            }
        }
        else {
            $el.addClass('ec-open');
            w.addClass(cl);
            if (expanderAnimate) {
                ec.slideDown('slow', function () { expanderWorking = false; });
            } else {
                ec.show(); expanderWorking = false;
            }
        }
    }

    function expandNow($wrap, anim, func) {
        var thisAnim = anim !== undefined && anim != null && anim.length > 0 ? anim : undefined;
        $wrap.addClass('expander-open').find('.expander-control').addClass('ec-open').end().find('.expander-content').show(thisAnim, func);
    };
    function collapseNow($wrap, anim, func) {
        var thisAnim = anim !== undefined && anim != null && anim.length > 0 ? anim : undefined;
        $wrap.removeClass('expander-open').find('.expander-control').removeClass('ec-open').end().find('.expander-content').hide(thisAnim, func);
    };

    function checkExpanders(rootSel, nobind) {
        var $contExpanders = getReference('div.expander-wrapper', rootSel);
        var noBinding = nobind !== undefined && nobind != null && nobind == true;
        var cl = 'expander-open';

        $contExpanders.each(function () {
            var w = $(this);
            var ec = w.find('.expander-content');
            if (!w.hasClass('no-check') && w.find(':checkbox').length) {
                // checkbox type
                if (w.find('input:checked').val() == undefined) { ec.hide(); w.removeClass(cl); }
                else { ec.show(); w.addClass(cl); }
                if (!noBinding) w.find('input:checkbox').click(function () { expanderCheckBoxClick($(this), w, ec, cl); });
            } else {
                // link type
                var $ect = w.find('.expander-control');
                if (w.hasClass(cl)) { ec.show(); $ect.addClass('ec-open'); w.addClass(cl); }
                else { ec.hide(); $ect.removeClass('ec-open'); w.removeClass(cl); }
                if (!noBinding) $ect.click(function () { expanderLinkClick($(this), w, ec, cl); });
            }
        });

        $('a.expand-next').click(function (ev) {
            var $this = $(this);
            var expRef = $this.attr('data-expander-ref');
            if (expRef !== undefined && expRef != null && expRef.length > 0) {
                var $target = $('#' + expRef);
                if ($target.length > 0) {
                    var $wrapper = $this.closest('div.expander-wrapper');
                    if (validateRegion($wrapper) == true) {
                        var scrollToTarg = function () { scrollTo($target, 500, -65); };
                        collapseNow($wrapper, 'fade', scrollToTarg);
                        expandNow($target, 'fade', scrollToTarg);
                    }
                }
                ev.preventDefault();
            }
        });

        var $contParas = getReference('div.para', rootSel);
        $contParas.each(function () {
            var $this = $(this);
            var desc = $this.attr('data-para-name');
            desc = desc !== undefined ? desc : "full text";
            var $less = $this.find('span.para-less');
            var $more = $this.find('span.para-more').hide();

            $more.hide();
            $this.removeClass('para-expanded');
            $less.append('<span class="para-sep">...</span><span><a class="para-open" href="">Show ' + desc + ' + </a></span>');
            $more.append('<span><a class="para-close" href="">Hide ' + desc + ' - </a></span>');

            $this.find('.para-open').bind('click', function () {
                var $local = $(this);
                var $cont = $local.closest('div.para');
                if ($cont.attr('busy') == '1') return false;
                $cont.attr('busy', '1');
                $cont.find('.para-sep').hide();
                $cont.addClass('para-expanded');
                $local.hide();
                $cont.find('span.para-more').fadeIn();
                $cont.removeAttr('busy');
                return false;
            });

            var hiddenTextHeight = $more.height();
            $this.find('.para-close').bind('click', function () {
                var $local = $(this);
                var $cont = $local.closest('div.para');
                if ($cont.attr('busy') == '1') return false;
                $cont.attr('busy', '1');
                $cont.removeClass('para-expanded');
                $cont.find('span.para-more').fadeOut();
                $cont.find('a.para-open').fadeIn();
                $cont.find('.para-sep').fadeIn();
                $cont.removeAttr('busy');

                var screenTop = $(document).scrollTop();
                var newScrollPosition = (screenTop - hiddenTextHeight);
                $('html, body').animate({
                    scrollTop: newScrollPosition
                }, 500);
                return false;
            });

        });
    }

    function attachResetFields(rootSel) {
        getReference('a.reset-fields', rootSel).click(function () {
            var $this = $(this);
            var target = $this.attr('data-reset-target');
            if (target !== undefined && target != null && (target.length > 0 || rootSel.length > 0)) {
                var $target = getReference(target, rootSel);
                if ($target === undefined || $target == null) {
                    $target = getReference(rootSel);
                }
                if ($target !== undefined && $target != null) {
                    var resetEv = $this.attr('data-reset-event');
                    if (resetEv !== undefined && resetEv == 'facet-reset') {
                        $target.find('input,textarea').clearInputs();
                        $target.find('select').each(function () { $(this)[0].selectedIndex = 0; });
                        $target.find('div.slider').each(function () {
                            var $slider = $(this);
                            var isDouble = $slider.hasClass('double');
                            var vals = isDouble ? [0, 0] : [0];
                            $slider.slider("values", 0, vals[0]);
                            if (isDouble) {
                                var $upper = $('#' + $slider.attr('target2'));
                                vals[1] = $upper.find('option').length;
                                $slider.slider("values", 1, vals[1]);
                            }
                            $slider.slider('option', 'slide').call($slider, null, { handle: $('.ui-slider-handle', $slider), values: vals });
                        });
                    } else {
                        $target.find('input,select,textarea').clearInputs();
                    }
                }
                Popout.ResetEvent($this.attr('data-reset-event'));
            }
            return false;
        });
    }

    attachResetFields();
    checkExpanders();

    // this removes last seperator form list
    var $classifiedsIndex = $('#classifiedsIndex');
    if ($classifiedsIndex.length) {
        $('td:nth-child(2)', $classifiedsIndex).each(function () {
            $(this).find('div.model:last-child span').css('border-right', 'none');
        });
    }

    // this removes last seperator form list
    var $quickLinks = $('#quickLinks');
    if ($quickLinks.length) {
        $('li:last-child a', $quickLinks).css('border-right', 'none');
    }

    // this set odd even class for the search results list
    $resultsList.children('ul').children('li:even').addClass('even');

    //this controls the results list hover style
    $resultsList.find('ul:first li, #mapResult li').hover(function () {
        $(this).toggleClass('hover');
    });

    // show response for ajax call to populate modal window
    function showResponse(responseText, statusText, xhr, $form) {
        var formhtml = responseText != null ? responseText.trim() : null;
        var $resp = $.vHtml(responseText);

        var fulPageTest = $resp.find('#modalRedirectLocation');
        var modalActionUrlval = $resp.find('#modalActionUrl').val();
        var modalActionUrl = $resp.find('#modalActionUrl');

        if (modalActionUrl.length > 0 && modalActionUrlval.length > 0) {

            $.ajax({
                url: modalActionUrlval,
                success: function (data) {
                    $('#dialogBox').html(data);
                    $('.closeModal').unbind().click(function () { window.location.reload(true); });
                    buildReloader();
                    stopTrans();
                }
            });

        } else {
            if (fulPageTest.length > 0) {
                closeDialog();
                var loc = $(fulPageTest).val();
                window.location.replace(loc);

            } else {

                htmlLoadedDialog(responseText, 'ui-ajax-modal');

                var $modalContent = $('#modal-content');
                var orgHeight = $modalContent.height();
                $modalContent.html('');
                $modalContent.html(formhtml);
                $modalContent.show('slow', function () {
                    var $thisModal = $('#modal-content');
                    setModalHeight($thisModal.height(), orgHeight);
                    $('form', $thisModal).ajaxForm(modaloptions);
                });

                buildReloader();
                setTimeout(stopTrans, 200);
            }
        }
    }

    // Ajax callback options
    var modaloptions = {
        success: showResponse,  // post-submit callback 
        beforeSubmit: checkForm // add this to your ajaxForms options 
    };

    function checkForm(data, form) {
        // this method will tell the beforSubmit method if the form is valid  
        $.validator.unobtrusive.parse(form);
        var $dialog = $('#dialogBox');
        $dialog.css('height', 'auto');

        if ($(form).valid() == true) {
            if ($('#submit-spanner').length) { // nothing
            } else {
                var $dialogSubmit = $dialog.find('input[type="submit"]');
                $dialogSubmit.animate({ opacity: 0.5 }, 100, function () { });
                $dialogSubmit.parent().before('<div id="submit-spanner" class="loading-sprinner" style="float: right;height: 12px; margin-top: -2px;"><div>');
            }
        }
        return $(form).valid();
    }

    // quick test on which browsers
    function whichBrs() {
        var agt = navigator.userAgent.toLowerCase();
        if (agt.indexOf("opera") != -1) return 'Opera';
        if (agt.indexOf("chrome") != -1) return 'Chrome';
        if (agt.indexOf("firefox") != -1) return 'Firefox';
        if (agt.indexOf("safari") != -1) return 'Safari';
        if (agt.indexOf("msie") != -1) return 'Explorer';
        if (agt.indexOf("netscape") != -1) return 'Netscape';
        if (agt.indexOf("mozilla/5.0") != -1) return 'Mozilla';
        if (agt.indexOf('\/') != -1) {
            if (agt.substr(0, agt.indexOf('\/')) != 'mozilla') {
                return navigator.userAgent.substr(0, agt.indexOf('\/'));
            }
            else return 'Netscape';
        } else if (agt.indexOf(' ') != -1)
            return navigator.userAgent.substr(0, agt.indexOf(' '));
        else return navigator.userAgent;
    }
    var browserName = whichBrs();

    if (browserName == 'Safari') {
        $('head').append('<style>.ui-dialog {margin : 0 auto;}</style>');
    }

    if (browserName == 'Chrome') {
        $('head').append('<style>.ui-dialog {margin : 0 auto;}</style>');
    }

    // dialog window open options across browsers
    var dialogOp = 'scale';
    if (browserName == 'Explorer') {
        dialogOp = 'slide';
    }

    if (browserName == 'Chrome') {
        dialogOp = 'fade';
    }

    if (browserName == 'Safari') {
        dialogOp = 'fade';
    }

    function getElementFlags($pop, attrName) {
        var rflags = {};
        if ($pop !== undefined && $pop != null && $pop.length > 0 && attrName != undefined && attrName.length > 0) {
            var opt = $pop.attr(attrName);
            if (opt != null && opt.length > 0) {
                var opts = opt.toLowerCase().split(';'), olen = opts.length;
                for (var oidx = 0; oidx < olen; oidx++) { rflags[opts[oidx]] = true; }
            }
        }
        return rflags;
    }

    var db = $('#dialogBox');
    function htmlLoadedDialog(i, dcls) {
        db.html(isMobileMode ? '<div class="ui-loader">Loading...</div>' : '');
        var extraCloser = '<a class="btn ui-corner-closer" href="#" title="Close"><span class="ui-closer-icon"></a>';
        var inject = isMobileMode ? extraCloser : '';
        var a = inject + i;
        var thisHeight = 200;
        var dialogWidth = isMobileMode ? $(window).width - 20 : 400;
        var dialogHeight = isMobileMode ? 'auto' : thisHeight;
        var extraClass = (dcls !== undefined && dcls != null) ? ' ' + dcls : '';

        db.dialog({
            show: dialogOp,
            modal: true,
            autoOpen: true,
            dialogClass: 'light-box1' + extraClass,
            width: dialogWidth,
            height: dialogHeight,
            closeOnEscape: true,
            closeBtnText: 'xxx'
        });

        setTimeout(function () {
            db.html(a);
            Popout.IsOpen = true;

            // NOTE: for inline popouts, prefix the id elements to maintain page integrity
            var refFunc = function (i, val) {
                return val !== undefined && val != null && val.length > 0 && val.substr(0, 2) != 'p_' ? 'p_' + val : val;
            };
            var clFunc = function () {
                var id = $(this).attr('id');
                if (id.length > 0 && id.substr(0, 2) == 'p_') { return $('#' + id.substr(2, id.length - 2)).click(); }
                return true;
            };

            var popSel = 'div.popout-cont';
            var $pop = db.find(popSel);
            var eventName = '';
            if ($pop.length > 0) {
                eventName = $pop.attr('data-popout-event');
                var pflags = Popout.Flags = getElementFlags($pop, 'data-popout-flags');
                if (pflags.island) $pop.find('div.dataIsland').remove();
                var fieldSel = pflags.fields ? pflags.inputs ? 'input' : 'input,select' : '';
                var sliderSel = pflags.sliders ? 'div.slider,div.slider-label' : '';
                var fsSel = pflags.fields && pflags.sliders ? fieldSel + ',' + sliderSel : fieldSel + sliderSel;
                if (pflags.fields || pflags.sliders) $pop.find(fsSel).attr('id', refFunc).attr('name', refFunc);
                if (pflags.sliders) $pop.find('div.slider').attr('target1', refFunc).attr('target2', refFunc).attr('label', refFunc);
                if (pflags.fields) $pop.find('label').attr('for', refFunc);
                if (pflags.accept) { $pop.find('a.accept-fields').click(function () { closeDialog(); }); }
                if (pflags.radios) { $pop.find('input[type=radio]').bind('click', clFunc); }
                if (pflags.fields) { transferFields($pop, 0, pflags.inputs ? 'input' : null); }
                if (pflags.groups) { attachGroupEvents($pop); }
                if (pflags.expanders) { checkExpanders($pop); }
                if (pflags.multi) { configureMultiSelect($pop); }
                if (pflags.sliders) { configureSliders($pop); }
                if (pflags.reset) { attachResetFields($pop); }
                Popout.OpenEvent(eventName);
            }

            var dc = $('.ui-dialog-titlebar-close,.ui-corner-closer');
            var mc = $('.closeModal');

            if ($pop.length > 0) {
                if ($pop.hasClass('facet-pop')) {
                    $('.ui-dialog-titlebar-close').parent('div').addClass('facet-button').end().find('span').text('Add filter');
                } else {
                    $('.ui-dialog-titlebar-close').addClass('btn-accept').find('span').text(
                        $pop.hasClass('ssi-pop') || $pop.hasClass('acc-pop') ? 'Close' : 'Accept');
                }
            }

            dc.unbind().click(function () {
                closeDialog($(this).hasClass('ui-corner-closer'));
                return false;
            });

            mc.unbind();
            mc.click(function () {
                closeDialog();
                return false;
            });
            setModalHeight($('#modal-content', db).height(), thisHeight);
            findFocus('#dialogBox');
        }, 400);

        if (browserName == 'Chrome' || browserName == 'Safari') {
            window.setTimeout(function () {
                jQuery(document).unbind('mousedown.dialog-overlay').unbind('mouseup.dialog-overlay');
            }, 400);
        }
    }
    // end dialog by str

    // dialog opener    
    var $spanModal = $('span.modal a');
    $spanModal.vLive('click', modalOpenClick);
    $spanModal.find('a').vLive('click', modalOpenClick);

    function modalOpenClick() {
        var thisHeight = $('#dialogBox #modal-content').height();
        if (thisHeight < 150) { thisHeight = 200; }
        var $dialog = $('#dialogBox');
        $dialog.html('');

        var a = $(this);
        var href = a.attr('href');

        if (href.indexOf('?') >= 0) {
            href = href + '&a=y';
        } else {
            href = href + '?a=y';
        }

        $dialog.dialog({
            show: dialogOp,
            modal: true,
            autoOpen: true,
            dialogClass: 'light-box2 ui-ajax-modal',
            width: isMobileMode ? 'auto' : '400px',
            height: isMobileMode ? 'auto' : thisHeight + 'px',
            closeOnEscape: true
        });

        db.prepend('<div class="loading-sprinner">Loading<div>');
        $.ajax({
            url: href,
            context: '#modal-content',
            success: function (html) {

                var fulPageTest = $(html.trim()).find('#modalRedirectLocation');

                if (fulPageTest.length > 0) {
                    closeDialog();
                    var loc = $(fulPageTest).val();
                    window.location.replace(loc);
                }
                else {

                    var extraCloser = '<a class="btn ui-corner-closer" href="#" title="Close"><span class="ui-closer-icon"></a>';
                    var inject = isMobileMode ? extraCloser : '';
                    var dialoghtml = inject + html; // $(html).find('#modal-content');

                    setTimeout(function () {
                        db.vHtml(dialoghtml);
                        setModalHeight($('#dialogBox #modal-content').height(), thisHeight);
                        var dc = $('.ui-dialog-titlebar-close, .ui-corner-closer');
                        var mc = $('.closeModal');

                        dc.unbind();
                        dc.click(function () {
                            closeDialog();
                            return false;
                        });

                        mc.unbind();
                        mc.click(function () {
                            closeDialog();
                            return false;
                        });

                        buildReloader();
                        attachGroupEvents();
                        findFocus('#dialogBox');
                    }, 300);

                    if (browserName == 'Chrome' || browserName == 'Safari') {
                        window.setTimeout(function () {
                            jQuery(document).unbind('mousedown.dialog-overlay').unbind('mouseup.dialog-overlay');
                        }, 300);
                    }
                }
            }
        });
        return false;
    } // end dialog opener


    function loadGalleryIntoLightBox(href) {
        if (href == "#") return false;
        var glb = $('#dialogBox'); var thisHeight = 832; glb.html('');

        // dialog window open options across browsers
        var galleryOp = 'scale';
        if (browserName == 'Explorer') { galleryOp = 'slide'; }
        if (browserName == 'Chrome') { galleryOp = 'fade'; }
        if (browserName == 'Safari') { galleryOp = 'fade'; }

        if (href.indexOf('?') >= 0) { href = href + '&a=y'; } else { href = href + '?a=y'; }

        glb.dialog({
            show: galleryOp,
            modal: true,
            autoOpen: true,
            dialogClass: 'new-gallery',
            width: 746,
            height: thisHeight,
            closeOnEscape: true
        });

        glb.prepend('<div class="loading-sprinner">Loading<div>');
        $.ajax({
            url: href,
            context: '#modal-content',
            success: function (html) {
                glb.html(html);
                var ngw = $('.gallery-with-banner');
                var objData = $('#GalleryData').text();
                setModalHeight($(ngw).height() + 28, thisHeight);
                loadGalleryControls(objData);
                if (browserName == 'Chrome' || browserName == 'Safari') {
                    window.setTimeout(function () {
                        jQuery(document).unbind('mousedown.dialog-overlay').unbind('mouseup.dialog-overlay');
                    }, 400);
                }
            }
        });
        sendEventLog('ImageView');
        return false;
    }

    function afterModalSetHeight(x, y) {
        // x: element position, y: content height (est).
        var db = $('#dialogBox');
        $('.loading-sprinner', db).remove();
        db.fadeIn('slow', function () {
            var bodyHeight = $('body').height();
            var scrollPos = $(document).scrollTop();
            if (isMobileMode) {
                $('.ui-dialog').css({ 'top': scrollPos + 50 + 'px', 'left': '0', 'right': '0', 'position': 'absolute' });
            } else {
                if ($(window).height() > y) {
                    $.noop();
                } else {
                    var popupPosition = -((bodyHeight - y) - (scrollPos - 8));
                    $('.ui-dialog').css({ 'top': popupPosition });
                }
            }
        });

        $('#modal-content form', db).ajaxForm(modaloptions);
        $('.buttons a').click(closeDialog);
        $('.ui-widget-overlay').click(function () { closeDialog(); return false; });
    }

    // function to resize modal height dependent on its content and move its position
    function setModalHeight(x, y) {
        // mobile mode?
        //$('.ui-dialog').css({ 'height': dialogHeight, position: 'absolute', top: '50px', left: '5px', right: '5px' })
        //.animate({ opacity: 1 });
        var contHeight = y;
        var speed = x * 2;
        if (!isMobileMode) {
            $('#dialogBox').animate(
                { height: x },
                { duration: speed, complete: afterModalSetHeight(contHeight) });
        } else {
            afterModalSetHeight(contHeight);
        }
    }

    // change view on click
    if ($changeView.length) {
        var rl = $('#resultsList');
        var rlul = $('ul:first', rl);
        var a = $('a', $changeView);
        var amv = $('a.mv', $changeView);

        // non-map view click.
        a.not('.mv').click(mapExitClick);

        // map view click 
        var mappath = '';
        amv.click(mapViewClick);

        var $mapSel = $('li.active .mv', $changeView);
        if ($mapSel.length > 0) { mapViewOpen(amv); }
    }
    // end change view on click	

    function mapExitClick() {
        var $this = $(this);

        $('.map-visible').removeClass('map-visible');
        $mapWrapper.addClass('hidden');
        $this.parent().addClass('active').siblings().removeClass('active');
        var $class = $this.attr('class');

        $.cookie('ViewPref', 'result_' + $class, { expires: 30, path: '/' });

        $('#resultsInfoTop,#resultsInfoBottom').css('display', 'block');
        rl.css('display', 'block');


        rlul.removeClass().addClass('result_' + $class);

        sendChangeViewToAnalytics($class);
        return false;
    }

    function mapViewClick() {
        return mapViewOpen($(this));
    }

    function mapViewOpen($this) {
        $('.results').addClass('map-visible');
        rlul.removeClass();
        $('#resultsInfoTop,#resultsInfoBottom').css('display', 'none');
        rl.css('display', 'none');
        $mapWrapper.removeClass('hidden');

        $this.parent().addClass('active').siblings().removeClass('active');
        var $class = $this.attr('class');
        $.cookie('ViewPref', $class, { expires: 30, path: '/' });

        var thisMappath = $('#MapSearchUrl').val();
        if (!mappath || thisMappath != mappath) {
            loadThisMap(thisMappath);
            mappath = thisMappath;
        }

        sendChangeViewToAnalytics('mv');

        return false;
    }

    function sendChangeViewToAnalytics(viewName) {
        // NOTE: External Declaration: 'CallAnalytics', 'listView', 'gridView', 'defaultView'
        if (typeof (CallAnalytics) == 'undefined' || typeof (listView) == 'undefined') {
            return;
        }
        var selectedView = viewName == 'lv' ? listView : (viewName == 'dv' ? defaultView : (viewName == 'tv' ? gridView : (viewName == 'mv') ? mapView : ''));
        var viewData = { contentMetrics: { format: selectedView} };
        CallAnalytics(viewData);
    }

    var $sortSelField = $('select#SortOptionList');
    function sortControls() {
        var strR = $('select#ResultsPerPageList').val();
        var strS = $('select#SortOptionList').val();

        var $thisForm = $('#searchConsole form');
        if ($thisForm.length > 0) {
            var $inpR = $('input#ResultsPerPage');
            if ($inpR.length > 0) $inpR.val(strR);

            var $inpS = $('input#SortOptions');
            if ($inpS.length > 0) $inpS.val(strS);

            $thisForm[0].submit();
        } else {
            var $ts = $('#templateSortUrl');
            if ($ts.length > 0) {
                var ts = $ts.attr('data-url');
                if (ts != null && ts.length > 0) {
                    window.location.href = ts.replace('[SortOptions]', strS);
                }
            }
        }
    }

    var sortIndex = $('input#SortOptions').val();
    $sortSelField.focus(function () {
        sortIndex = $sortSelField.val();
    });

    $('select#ResultsPerPageList, select#SortOptionList').change(sortOrderListChange);
    $('select#ResultsPerPage, select#SortOptions').change(function () {
        var $thisForm = $('.results form');
        if ($thisForm.length > 0) $thisForm[0].submit();
    });

    function sortOrderListChange() {
        var selText = $sortSelField.first("option[value='" + sortIndex + "']").val(); // $(this).find('option:selected').val()
        if (selText != 'Location') {
            sortControls();
        } else {
            if ($('#Postcode').val() != '') {
                sortControls();
            } else {
                displayAlert($(this), 'To sort by <b>location</b> requires a postcode to be entered into the search field above');
                $("option[value='" + sortIndex + "']", $sortSelField).vProp('selected', true);
            }
        }
    }

    $('select#MyAdsSortOrder').change(function () {
        var url = $('#MyAdsSortUrl');
        //alert(url[0].value.replace("[sort]",this.value));
        window.location.replace(url[0].value.replace("[sort]", this.value));
    });

    $('.myalert').click(function () {
        var content = $(this).siblings('.alert-message').text();
        displayAlert($(this), content);
        return false;
    });

    $('#close-alert').click(function () {
        $('#alert-box-wrapper').hide().find('.content').html('');
        return false;
    });

    $('ul.sub-nav li').last().children('a').css('border', 'none');

    if (isMobileMode) {
        var obj = $('#GalleryData').text();
        loadGalleryControls(obj);
    }

    $('.tabitem a').click(function (ev) {
        var $this = $(this);
        var $tab = $this.closest('.tabitem');
        if ($tab.hasClass('urlonly')) { return true; }
        $this.attr('href', '#');
        $tab.click();
        ev.preventDefault();
    });

    $('.tabitem').click(function (ev) {
        var $this = $(this);
        var $tab = $('#' + $this.attr('data-tab-id'));
        if ($tab.hasClass('urlonly')) {
            $tab.find('a').click();
            return;
        }
        var $panel = $('#' + $this.attr('data-tab-panel'));
        $this.siblings().removeClass('tabactive');
        $this.addClass('tabactive');
        if ($tab.length > 0 && $panel.length) {
            var $all = $this.parent().find('.tabitem');
            $all.each(function () {
                var $this1 = $(this);
                var $tab1 = $('#' + $this1.attr('data-tab-id'));
                if ($this1.hasClass('tabactive')) { $tab1.show(); } else { $tab1.hide(); }
            });
        }
    });

    $("input.uppernospace").vLive("change", function () {
        var $this = $(this);
        if ($this.val !== undefined && item !== undefined) {
            $this.val(item.val().replace(' ', '').toUpperCase());
        }
    });

    $("input.lowernospace").vLive("change", function () {
        var $this = $(this);
        if ($this.val !== undefined && item !== undefined) {
            $this.val(item.val().replace(' ', '').toLowerCase());
        }
    });

    // ssi-tab-control    
    $('#registration').addClass('help-text');
    // $(".tab_content").hide();
    var tabname = $.urlSegment !== undefined ? $.urlSegment(1, '/selfservice/') : null;
    if (tabname != null) {
        $('#PostModel_SelectedTab').val(tabname);
        $('ul.tabs li#x' + tabname).addClass("active").show();
        $('ul.tabs li#x' + tabname + ' input').attr("checked", "checked");
        $('#' + tabname).show();
        $('#' + tabname.toLowerCase() + '-preference').show();
        $('body').addClass(tabname.toLowerCase());
    } else {
        var item = "first";
        $("ul.tabs li:" + item).addClass("active").show();
        $(".tab_content:" + item).show();
    }

    displayNoregOption();
    function displayNoregOption(newTab) {
        var allowNoreg = true;
        if (!newTab) { newTab = $('#PostModel_SelectedTab').val(); }
        if (!newTab) return true;
        var $noreg = $('#noreg');
        var isTrade = newTab.toLowerCase() == 'trade';
        var defaultCategory = $('body').attr('data-default-category');
        if (defaultCategory === undefined || defaultCategory == null) { defaultCategory = 'used-cars'; }
        if ($noreg.length && !isTrade && $('#PostModel_CategoryName').val() == defaultCategory) { allowNoreg = false; }
        if (allowNoreg) { $noreg.show(); } else { $noreg.hide(); }
        return allowNoreg;
    }

    function switchNoregPanel(noreg) {
        if (noreg) {
            $('#registration').hide();
            $('#make-model').fadeIn();
            $('#er h4').html('<span>Step 1</span> Choose make/model');
            $("#PostModel_EnterRegistration").attr("value", false);
            $("#PostModel_EnterCategory").attr("value", true);
        }
        else {
            $('#make-model').hide();
            $('#registration').fadeIn();
            $('#er h4').html('<span>Step 1</span> Enter registration');
            $("#PostModel_EnterRegistration").attr("value", true);
            $("#PostModel_EnterCategory").attr("value", false);
        }
    }

    // $("#PostModel_SelectedTab")
    $("ul.tabs li input, div.tabs input.seller-opt").click(function () {

        $('body').removeClass();
        $("ul.tabs li").removeClass("active");
        $(this).parent().addClass("active");

        $(".tab_content").hide();

        var newTab = $(this).attr("id").replace('opt-', '');
        var activeTab = '#' + newTab;
        $('div.account-detail').children().each(function () { $(this).toggleClass('hidden'); });

        $(activeTab).fadeIn();
        $('body').addClass(newTab.toLowerCase());
        $('#PostModel_SelectedTab').val(newTab);
        $(this).find('a').blur();
        var href = $('#ad-wanted').attr('href');
        var query = $.query.load(href);
        var path = query.set('tab', newTab).toString();
        var base = href.split('?');
        var newUrl = base[0] + path;
        $('#ad-wanted').attr('href', newUrl);
        var noregAllowed = displayNoregOption(newTab);
        if (!noregAllowed && $('#make-model').is(':visible')) { switchNoregPanel(false); }
        findFocus("#registration");
        //return false;
    });
    $('#registration').focus(function () { $(this).val('').removeClass('help-text'); });
    // $('#make-model').fadeOut();
    $('#noreg').click(function () {
        switchNoregPanel(true);
        return false;
    });
    $('#havereg').click(function () {
        switchNoregPanel(false);
        return false;
    });

    var $selectedMakeList = $("#PostModel_SelectedMakeId");
    var $selectedModelList = $("#PostModel_SelectedModelId");
    $selectedMakeList.change(function () {
        var waititems = '<option value="">Loading...</option>';
        $selectedModelList.html(waititems);
        var curr = window.location.href.toLowerCase();
        var pref = curr.indexOf('/refine') > 0 ? '../../' : '../';
        var alpha = isMobileMode ? "alpha=true&" : "";
        var defaultRel = pref + "SelfService/FindCategories?" + alpha + "parentId=";
        var enterVrmRel = pref + "FindCategories?" + alpha + "parentId=";
        var isEnterVrm = curr.indexOf('/selfservice/') > 0 && (curr.indexOf('/private') > 0 || curr.indexOf('/trade')) > 0;
        var thisRel = isEnterVrm ? enterVrmRel : defaultRel;
        var $option = $("#PostModel_SelectedMakeId > option:selected");
        var pval = $option.attr('p');
        if (pval !== undefined && pval != null) { $option.attr('value', pval); }
        $.getJSON(thisRel + $option.attr("value"), function (data) {
            var newitems = '';
            $.each(data, function (i, optionItem) {
                var txt = i == 0 && isMobileMode ? 'Select Model' : optionItem.Text;
                newitems += '<option value="' + optionItem.Value + '">' + txt + '</option>';
            });
            $selectedModelList.html(newitems);
        });
    });

    $selectedModelList.change(function () {
        if ($selectedMakeList.length == 0 || $selectedModelList.length == 0) { return; }
        var $option = $("#PostModel_SelectedMakeId > option:selected");
        var pval = $option.attr('p');
        if (pval !== undefined && pval != null) {
            var targVal = $selectedModelList[0].selectedIndex <= 0 ? pval : '-1';
            $option.attr('value', targVal);
        }
    });

    findFocus('div.main-content');

    $('#resultsInfoTop a.page-prev, #resultsInfoBottom a.page-prev, div.pc').hide();
    var pagingHtml = '';
    var $pageNext = $('#resultsInfoBottom a.page-next'); //#resultsInfoTop a.page-next,
    $pageNext.click(function () {
        if ($pageNext.hasClass('page-end')) {
            $pageNext.hide();
            return false;
        }
        var $this = $(this);
        pagingHtml = $this.html();
        $this.html('Loading...');
        $this.prepend('<span class="loading-sprinner" />');
        $.ajax({
            url: $this.attr('href'),
            success: function (data) {
                if (typeof (data) == 'undefined' || data.length == 0) return;
                var $result = $('#xResult');
                var $data = $(data.trim());
                var $next = $data.find('a.page-next');
                // Any li.auto-load can be selected from the response (result/mpu).
                $result.append($data.find('li.auto-load').hide().fadeIn(300));
                if ($next.length > 0) {
                    $pageNext.attr('href', $next.attr('href'));
                    $pageNext.show();
                } else {
                    $pageNext.hide();
                    $pageNext.addClass('page-end');
                }
                $pageNext.find('span.loading-sprinner').remove();
                $pageNext.html(pagingHtml);
                loadGoogleTagBlocks($result);
            }
        });

        return false;
    });

    var scrollRefresh = {
        pastTop: false,
        pastBottom: false,
        pending: false,
        previous: 0,
        isBottom: function () {
            var $content = $('div.body') || $('body');
            return $(window).height() + $(window).scrollTop() >= $content.height();
        },
        isTop: function () {
            return $(window).scrollTop() < this.scrollPrevious && $(window).scrollTop <= 0;
        },
        bottom: function (callback) {
            var pBottom = this.isBottom();
            if (!this.pastBottom && pBottom) {
                callback($(window).height() + $(window).scrollTop());
                this.pastBottom = true;
            } else if (!pBottom) {
                this.pastBottom = false;
                this.pending = false;
            }
            this.previous = $(window).scrollTop();
        },
        top: function (callback) {
            var pTop = this.isTop();
            if (!this.pastTop && pTop) {
                callback($(window).scrollTop());
                this.pastTop = true;
            } else if (!pTop) {
                this.pastTop = false;
            }
            this.previous = $(window).scrollTop();
        }
    };

    $(window).scroll(function () {
        // scrollRefresh.top(function () { });
        scrollRefresh.bottom(function () {
            if (!scrollRefresh.pending && $pageNext.length > 0 && $pageNext.hasClass('page-auto')) {
                scrollRefresh.pending = true;
                setTimeout(function () {
                    if (scrollRefresh.isBottom()) {
                        if (scrollRefresh.pending) $pageNext.click();
                    };
                }, 800);
            }
        });
    });

    function getDeferredParam(data, dlen, nam, val) {
        for (var dind = 0; dind < dlen; dind++) {
            if (data[dind].n == nam && (val === undefined || data[dind].v == val)) { return data[dind]; }
        }
        return null;
    }

    function handleDeferredParams($loaderCont, defLoaderParam) {
        if ($loaderCont.length > 0 && defLoaderParam == "#deferred-params-MAK") {
            var $defLoaderParam = $(defLoaderParam);
            var raw = $defLoaderParam.text();
            $defLoaderParam.text('');
            if (raw.length > 0) {
                var data = $.parseJSON(raw);
                if (data !== undefined && data != null) {
                    var dlen = data.length;
                    $loaderCont.find('input[name=M]').each(function () {
                        var $this = $(this);
                        var ditem = getDeferredParam(data, dlen, 'M', $this.val());
                        setChecked($this, ditem != null);
                    });
                }
            }
        }
    }

    $('a.popout-link').click(function () {
        var $this = $(this);
        var defLoaderRef = '', defLoaderParam = '';
        var match = $this.attr('data-popout-ref');
        var popCls = $this.attr('data-popout-class');
        var popAddCls = popCls !== undefined && popCls != null ? ' ' + popCls : '';
        var $content = $('div.popout[data-popout-ref=' + match + ']');
        if ($content.length > 0 && match != null) {
            var popEvent = $content.attr('data-popout-event');
            var popFlags = $content.attr('data-popout-flags');
            var $deferred = $content.find('div.deferred-load');
            if ($deferred.length > 0) {
                defLoaderRef = '#' + $deferred.attr('data-loader-ref');
                defLoaderParam = '#' + $deferred.attr('data-loader-param');
                var $defCont = $deferred.find('#' + $deferred.attr('data-loader-ref'));
                if ($defCont.length > 0 && $defCont.html() != '') {
                    $content = $defCont;
                } else {
                    $this.prepend('<span class="loading-sprinner"></span>');
                    var url = $deferred.attr('data-loader-url');
                    $.ajax({
                        url: url,
                        success: function (data) {
                            if (data != null && data.indexOf('<html') == -1) {
                                var $loaderCont = $(defLoaderRef);
                                $loaderCont.html(data);
                                handleDeferredParams($loaderCont, defLoaderParam);
                            } else {
                                data = "Failed to load data";
                            }
                            $this.remove('span.loading-sprinner');
                            htmlLoadedDialog('<div class="popout-cont' + popAddCls + '" ' +
                                'data-popout-flags="' + popFlags + '" ' +
                                'data-popout-event="' + popEvent + '" >' + data + '</div>',
                                'ui-local-popout');
                        }
                    });
                    return false;
                }
            }

            var content = $content.html();
            htmlLoadedDialog('<div class="popout-cont' + popAddCls + '" ' +
                'data-popout-flags="' + popFlags + '" ' +
                'data-popout-event="' + popEvent + '" >' + content + '</div>',
                'ui-local-popout');
            return false;
        }
        return true;
    }).show();

    function findFocus(within) {
        if (isAppleAgent() == true) return;
        if (!setFocusWithin(within, 'input.focus')) {
            setFocusWithin(within, 'textarea.focus');
        }
    }

    function setFocusWithin(within, selector) {
        if (isAppleAgent() == true) return 0;
        var elm = $(within).find(selector).first();
        if (elm.length) { elm.focus(); elm.select(); return 1; }
        return 0;
    }

    attachGroupEvents();
    function attachGroupEvents(rootSel) {
        var selector = (typeof (rootSel) == "function" || typeof (rootSel) == "object")
            && rootSel.selector !== undefined ? rootSel.selector + '' : rootSel;
        getReference('.group-display', rootSel).each(function (index, elem) {
            var $item = $(elem);
            $item.attr('group-sel', selector);
            $item.change(function () { displayGroup($(this)); });
            displayGroup($item);
        });

        getReference('.group-toggle', rootSel).each(function (index, elem) {
            var $item = $(elem);
            $item.attr('group-sel', selector);
            $item.click(function () { toggleGroup($(this)); });
            toggleGroup($item);
        });
    }

    function displayGroup(valueElement) {
        var valElem = $(valueElement);
        var group = valElem.attr('group');
        var rootSel = valElem.attr('group-sel');
        if (rootSel == undefined) {
            rootSel = "";
        }
        if (group && group.length > 0) {
            var elems = $(rootSel + ' .group-' + group);
            elems.each(function (index, item) {
                var itemO = $(item);
                var valList = itemO.attr('values').split('|');
                var valInvert = itemO.attr('invert');
                var setVal = itemO.hasAttr('default');
                var valDefault = setVal ? itemO.attr('default') + '' : '';
                valInvert = (valInvert == true || (valInvert + '').toLowerCase() == "true");

                var group = findInList(itemO.attr('class').split(' '), 'group-');
                var groupVal = $('[group=' + group.toLowerCase().replace('group-', '') + ']').first().val();

                if (inList(valList, groupVal) != valInvert) {
                    itemO.show();
                }
                else {
                    if (setVal) {
                        if (itemO.hasAttr('value')) {
                            itemO.attr('value', valDefault);
                        }
                        else {
                            try { itemO.val(valDefault + ''); } catch (ex) { }
                        }
                    }
                    itemO.hide();
                }
            });
        }
    }

    function findInList(list, val) {
        for (var idx = 0; idx < list.length; idx++) {
            if ((list[idx] + '').toLowerCase().indexOf((val + '').toLowerCase()) >= 0) { return list[idx]; }
        }
        return null;
    }

    function inList(list, val) {
        for (var idx = 0; idx < list.length; idx++) {
            if ((list[idx] + '').toLowerCase() == (val + '').toLowerCase()) { return true; }
        }
        return false;
    }

    function toggleGroup(checkboxElement) {
        // NOTE: this is later version than admin pages. 
        var chk = $(checkboxElement);
        var val = chk[0].checked;
        var group = chk.attr('group');
        var rootSel = chk.attr('group-sel');
        if (rootSel == undefined) {
            rootSel = "";
        }
        var disabledVal = chk.attr('invert') == 'true' || chk.attr('invert') == true;
        if (group && group.length > 0) {
            var elems = $(rootSel + ' .group-' + group);
            elems.each(function (index, titem) {
                var thisItem = $(titem);
                if (val == disabledVal) {
                    thisItem.attr('disabled', true);
                    thisItem.addClass('disabled');
                    if (thisItem.hasClass('input-validation-error')) { thisItem.removeClass('input-validation-error'); }
                    if (thisItem.hasClass('field-validation-error')) { thisItem.removeClass('field-validation-error').html(''); }
                    if (thisItem.hasClass('group-inf')) { thisItem.hide(); }
                    if (thisItem.hasClass('group-clear')) { thisItem.val(''); }
                }
                else {
                    thisItem.removeAttr('disabled');
                    thisItem.removeClass('disabled');
                    if (thisItem.hasClass('group-inf')) { thisItem.show(); }
                    if (thisItem.hasClass('group-focus')) { thisItem.focus(); thisItem.select(); }
                }
            });
        }

        return val;
    }

    $(document).bind('keyup', function (ev) {
        if (Popout.IsOpen && ev.keyCode == 27) { closeDialog(true); }
        if (Popout.IsAlt && ev.keyCode == 27 && Popout.CloseAlt !== undefined && Popout.CloseAlt != null) { Popout.CloseAlt(); }
    });
});                                                                   // ------------------ EO-jQuery-Doc-Load.

var Popout = {
    Flags: { }, 
    Options: { },
    IsOpen: false, 
    IsAlt: false,
    CloseEvent: function (eventTag, cancel) { },
    OpenEvent: function (eventTag) { },
    ResetEvent: function (eventTag) { }, 
    CloseAlt: null
};

function transferField($source, $target) {
    if ($target.length == 0) { return; }
    if ($source[0].disabled != $target[0].disabled) { $target[0].disabled = $source[0].disabled; }    
    
    if ($target.is('[type=checkbox]') || $target.is('[type=radio]')) {
        var isChecked = $source.is(':checked');
        if (!isIEAgent() && Popout.Flags.radios) {
            var baseId = $source[0].id.replace('p_', '');
            var saved = Popout.Options[baseId];
            isChecked = saved !== undefined ? saved : $source[0].outerHTML.indexOf('checked=') > 0 ? true : false;
            Popout.Options[baseId] = isChecked;
        }       
        setChecked($target, isChecked); 
    } else {
        $target.val($source.val() + '');                    
    }
}

function transferFields($cont, direction, fieldTypes) {
    if (fieldTypes === undefined || fieldTypes == null) fieldTypes = 'input,select,textarea';
    $cont.find(fieldTypes).each(function () {
        var $this = $(this);
        var thisId = $this.attr('id');
        if (thisId.substring(0, 2) == 'p_') {
            var $prim = $('#' + thisId.replace(/^p\_/,''));
            transferField(direction == 1 ? $this : $prim, direction == 1 ? $prim : $this); 
        }
    });
}

function closeDialog(cancel) {
    var noData = cancel !== undefined && cancel != null && cancel == true;
    var $db = $('#dialogBox');
    var $pop = $db.find('div.popout-cont');
    if ($pop.length > 0) {
        if (!noData && Popout.Flags.fields) transferFields($pop, 1, Popout.Flags.inputs ? 'input' : null); 
        if ($pop.hasAttr('data-popout-event')) {            
            Popout.CloseEvent($pop.attr('data-popout-event'), cancel);
        }        
    }

    $('.ui-dialog').animate({
        //opacity: 0
    }, 200, function () {
        var db = $('#dialogBox'); 
        db.dialog('close');
        db.find('.ui-dialog').css('opacity', '1');        
    });
    Popout.IsOpen = false;
    return false;
}

var displayAlertCount = 0;
var displayHold;
function displayAlert($this, content) {    
    displayAlertCount = displayAlertCount + 1;

    var p = $this.offset();
    var h = $this.height();
    var alertId = 'alert-box-wrapper_' + displayAlertCount;
    var alertClose = 'alert-close_' + displayAlertCount;

    $('body').append('<div id="'+ alertId+'" class="alert-box-wrapper">' +
		'<div id="alert-pointer"></div>' +
			'<div id="alert-box-content">' +
				'<a href="#" class="close-alert" id="'+alertClose+'"></a>' +
				'<div class="content">'+content+'</div>' +
			'</div>' +
			'<div id="alert-box-footer"></div>' +
		'</div>');

    var $thisid = $('#' + alertId);
    var $close = $('#' + alertClose);

    var alertHeight = $thisid.height();
    var alertWidth = $this.width();


    var topValue = p.top;    
    var halfWidth = alertWidth / 2;
    var leftWidth = p.left + halfWidth;
    var scrollPos = $(document).scrollTop();
    var offsettop = isMobileMode ? scrollPos + 70 : topValue - alertHeight + (h / 2);
    var offsetleft = isMobileMode ? '10%' : (leftWidth - 106) + 'px';
    
    var contentLength = content.length;
    if (contentLength < 100) { contentLength = 90; }       
    $thisid.css('top', offsettop + 'px').css('left', offsetleft);
    $close.click(function () { $thisid.css('display', 'none');
        return false;
    });
    $thisid.css('display', 'block');
    displayHold = $thisid.delay(contentLength * 50).fadeOut(2000);

    if ($this.attr('type') != 'checkbox') {
        $thisid.mouseover(function () { $thisid.stop(); $thisid.css('display', 'block').css('cursor', 'default'); }).mouseleave(function () { $thisid.delay(contentLength * 30).fadeOut(2000); });
    }
}

function displayHover($this, content) {
    var a = $('#alert-box-content');
    var w = $('#alert-box-wrapper');
    w.addClass('alert-hover');
    //var ap = $('#alert-pointer');
    var p = $this.offset();
    var h = $this.height();
    var wi = $this.width();
    a.find('.content').html(content);
    var alertHeight = w.height();

    var topValue = p.top;

    var offsettop = topValue - alertHeight + (h / 2);
    var pointerSize = 14;
    var newLeft = p.left - 93 + wi;
    //var pointerMargin = alertHeight - pointerSize; // - ap.height();
    w.css('top', offsettop + 'px').css('left', newLeft + 'px');
    //ap.css('margin-top', pointerMargin + 'px');
    w.css('display', 'block');
}

var $mapWrapper = $('#map_wrapper');
function loadThisMap(thisMappath) {
    // NOTE: External Declaration: 'google'
    var str = thisMappath.split('?');
    var prams = str[1];
    if (prams == null) { prams = ''; }

    var latlng = new google.maps.LatLng(52.400, -2.500);
    var myOptions = {
        zoom: 12,
        center: latlng,
        scaleControl: true,
        streetViewControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

    var geoOptions = { preserveViewport: false, suppressInfoWindows: true };

    var path = thisMappath;

    var georssLayer = new google.maps.KmlLayer(path, geoOptions);

    georssLayer.setMap(map);
    google.maps.event.addListener(georssLayer, 'click', function (kmlEvent) {
        var description = kmlEvent.featureData.description;
        var text = kmlEvent.featureData.name;
        var posicionDeClick = kmlEvent.latLng;
        var posX = new google.maps.LatLng(posicionDeClick.lat(),
        posicionDeClick.lng());
        buildInfoBox(text, posX, description, prams);
    });

    function buildInfoBox(text, posX, description, infParams) {
        var ajaxPath = $('#classifieds-base-url').val() + '/AdvertsByLocation?' + infParams + '&LatLong=' + text + '&numAdverts=' + description;
        var thisHeight = 70;

        var strBld = text.replace(/\./g, '-');
        strBld = strBld.replace(/\,/g, '-');
        strBld = strBld.replace(/ /g, '-');
        strBld = jQuery.trim(strBld);

        $('#' + strBld + 'mapResult').remove();

        var numHeightCount = description;
        if (numHeightCount == 1) { thisHeight = 159; }
        if (numHeightCount == 2) { thisHeight = 280; }
        if (numHeightCount == 3) { thisHeight = 410; }

        var flyoutBorder = $mapWrapper.attr('flyout-border');
        flyoutBorder = flyoutBorder.length && flyoutBorder.length > 2 ? "#" + flyoutBorder : "#000079"; 

        var infoBubble = new InfoBubble({
            maxWidth: 500,
            borderColor: flyoutBorder,
            borderWidth: 6,
            map: map,
            shadowStyle: 1,
            content: '<div id="' + strBld + 'mapResult" class="mapResult" style="height:' + thisHeight + 'px;"><div class="loading-sprinner">Searching<div></div>'
        });

        if (!infoBubble.isOpen()) {
            infoBubble.setPosition(posX);
            infoBubble.open(map);
        }

        $.ajax({
            url: ajaxPath,
            success: function (data) {
                setTimeout(function () {
                    $('#' + strBld + 'mapResult').html(data);
                }, 300);
            }
        });
    }
} // end loadMap()

function sendEventLog(eventType) {
    var path = $('#EventLogPath').val();

    $.ajax({
        type: "POST",
        url: path,
        data: ({ EventName: eventType }),
        cache: false
    });
}

function resetSpecElement(element) {
    if (element.prev().hasClass('dropdown')) {
        element.prev().attr('disabled', '');
        element.prev().hide();
        element.prev().prev().show();
    }
    else {

        element.prev().removeClass('disabled').removeClass('hidden').removeAttr('readonly');
    }
    element.remove();
}

function resetWriteAdPage() {
    $('#SearchAgain').show();
    $('input.specialFields,select.specialFields').clearFields();
    $('a.keywordCloseLink').each(function () {
        resetSpecElement($(this));
    });
}

var trade;

String.prototype.truncate = function (len, del) {
    var result = this;
    if (!del) del = '...';
    if (len > del.length && result.length > len) {
        result = result.substring(0, len - del.length);
        result = result + del;
    }
    return result;
};

String.prototype.format = function () {
    var result = this;
    var len = arguments.length;
    if (result && result.length > 0 && len > 0) {
        for (var index = 0; index < len; index++) {
            var pattern = "\\{" + new String(index) + "\\}";
            result = result.replace(new RegExp(pattern, 'g'), arguments[index]);
        }
    }
    return result;
};

$.urlParam = function(name, url) {
    if (url) {
    } else {
        url = window.location.href.toLowerCase();
    }
    var results = new RegExp('[\\?&]' + name.toLowerCase() + '=([^&#]*)').exec(url);
    if (!results) {
        return 0;
    }
    return results[1] || 0;
};

$.urlSegment = function(index, after, url) {
    var res = null;
    if (url) {
    } else {
        url = window.location.href.toLowerCase();
    }
    var parts = url.split('?');
    if (parts.length > 0) {
        var pos = parts[0].indexOf(after);
        var posEnd = pos + after.length;
        if (pos > 0 && parts[0].length >= posEnd) {
            var segments = parts[0].substring(posEnd).split('/');
            if (segments.length > index) res = segments[index];
        }
    }
    return res;
};

String.prototype.append = function() {
    var result = this;
    var len = arguments.length;
    for (var index = 0; index < len; index++) {
        result += arguments[index];
    }
    return result;
};

String.prototype.replaceAll = function(find, repl) {
    var result = (this + '').replace(new RegExp(find, 'gi'), repl);
    return result;
};

$.fn.outerHtml = function() {
    var $t = $(this);
    if ("outerHTML" in $t[0]) {
        return $t[0].outerHTML;
    } else {
        var content = $t.wrap('<div></div>').parent().html();
        $t.unwrap();
        return content;
    }
};

$.fn.hasAttr = function (name) {
    return this.attr(name) !== undefined;
};
    
String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, "");
};

String.prototype.toFriendlyUrl = function() {
    return this.replace !== undefined ? this.replace(/ /g, '').replace(/;/g, '').replace('&amp', 'and')
        .replace('&', 'and').replace('/', '').toLowerCase() : '';
};

String.prototype.toCookieName = function() {
    var result = '';
    if (this.length && this.indexOf('<') == -1 && this.indexOf('>') == -1) {
        result = this.toFriendlyUrl().replace('-', '').replace('_', '');
    }
    return result;
};

var imageData;
var imagesList;
var currentImageID;
var oBj;
var numOfImagesText;
var numOfImage;
var currentNum;
var numText;
var prevImage = 0;
var imgChgAutoReset = 0;
function updateNumberOfImagesText(numOfImage, totalImages, reloadImage) {
    if (prevImage == numOfImage) return;

    var $thumbSel = $('.gallery-images li.thumb img');
    if ($thumbSel.length > 0) $thumbSel.removeClass('active');
    
    var $numOfEl = $('#image_'+ numOfImage + ' img');
    if ($numOfEl.length > 0) $numOfEl.addClass('active');

    var $imageCont = $('#main-image');
    var $mainGalleryImage = $imageCont.find('img');

    numText = numOfImage + 1;
    numOfImagesText = 'Image ' + numText + ' of ' + totalImages;
    var $imageNum = $('#image-number');
    if ($imageNum.length > 0) $imageNum.html(numOfImagesText);

    if (reloadImage == true) {
        if (isMobileMode) {
            var $anch = $imageCont.find('a');
            if ($anch.length > 0) { $anch.attr('href', imagesList[numOfImage].LargeImageUrl); }
            if (false) {
                // NOTE: main-image replaced by trial swipe functionality (interact.Mobile.js).
                $mainGalleryImage.animate({ 'opacity': 0 }, 100, function() {
                    $(this).bind("load", function() { $(this).animate({ 'opacity': 1 }, 100); }).attr('src', imagesList[numOfImage].LargeImageUrl);
                });
            }
        } else {
            $mainGalleryImage.hide().bind("load", function () { $(this).fadeIn(); }).attr('src', imagesList[numOfImage].LargeImageUrl);
        }
    }

    $('#current-img').val(numOfImage);

    if (numOfImage > 0) {
        $('.nav-previous').removeClass('hidden');
    }

    if (totalImages == 1) {
        $('.nav-previous').addClass('hidden');
        $('.nav-next').addClass('hidden');
    }

    var $galInd = $('#gallery-indicator'); 
    if ($galInd.length > 0) {
        $galInd.find('div').each(function (index, el) {
            if (index == numOfImage) {
                $(el).addClass('sel');
            } else {
                $(el).removeClass('sel'); 
            }
        });
    }
    
    if (isMobileMode) {
        imgChgAutoReset++;
        if (imgChgAutoReset == 3) {
            imgChgAutoReset = 0;
            var $top = $('#advert-inner-banner0'); 
            if ($top.length > 0) { $top.html(''); loadGoogleTagBlocks($top); }
        }
    } else {
        // NOTE: External Declaration: 'galleryAnalyticValues', 'CallAnalyticsWithContext'
        if (typeof galleryAnalyticValues !== 'undefined' && typeof CallAnalyticsWithContext !== 'undefined') {
            CallAnalyticsWithContext(galleryAnalyticValues);
        }
    }

    prevImage = numOfImage;
}

var impressionAutoReset = 0;
function handleImpressionAutoReset() {
    impressionAutoReset++;
    // currently every image causes a render.
    if (impressionAutoReset == 1) {
        impressionAutoReset = 0; 
        if (Popout.AdvertRenderCopy !== undefined) Popout.AdvertRenderCopy(); 
    }
};

function loadGalleryControls(str) {
    if (typeof (str) == 'undefined' || str.length == 0) return;
    impressionAutoReset = 0;
    var $galleryControls = $('.gallery-controls');
    var $galleryClose = $('.gallery-controls a');
    $galleryControls.append('<input type="hidden" id="current-img"/>');
    
    imageData = $.parseJSON(str); //ok!
    if (imageData === null) return;
    imagesList = imageData.Images;

    // build text for number of images
    var totalImages = imagesList.length;
    numOfImage = imageData.Current;
    prevImage = numOfImage; 

    if (imageData.AdvertPanelVisible == true) {
        //$('.banner-advert').css('display', 'none');
    }

    updateNumberOfImagesText(numOfImage, totalImages, false);
    if (imageData.IsValid == false) {
        $('.new-gallery-wrapper').html('<div class="gallery-info"><div class="gallery-controls">' + 
            '<span id="image-number">Sorry!! Gallery failed to load</span></div></div>');
    } else {        
        $('#current-img').val(numOfImage);

        $galleryClose.click(function () {
            opener.location.href = $(this).attr('href');
            window.close();
        });

        if (totalImages > 1) {

            $('.nav-next a').click(function () {                                
                var nextImage = parseInt($('#current-img').val()) + 1;
                if (nextImage === totalImages) { nextImage = 0; }
                if (!isMobileMode) updateNumberOfImagesText(nextImage, totalImages, true); // swipe
                sendEventLog('ImageView');
                $(this).blur();
                $(this).addClass('hovered');
                if (!isMobileMode) handleImpressionAutoReset();
                return false;
            }).attr('href', '#');

            $('.nav-previous a').click(function () {
                var prevImage = parseInt($('#current-img').val()) - 1;
                if (prevImage < 0) { prevImage = totalImages - 1; }
                if (!isMobileMode) updateNumberOfImagesText(prevImage, totalImages, true); // swipe
                sendEventLog('ImageView');
                $(this).blur();
                $(this).addClass('hovered');
                if (!isMobileMode) handleImpressionAutoReset();
                return false;
            }).attr('href', '#');

            $('.gallery-images li.thumb a').click(function () {
                var $this = $(this);
                var orderNumId = $this.parent('li').index();
                updateNumberOfImagesText(orderNumId, totalImages, true);                
                sendEventLog('ImageView');
                if (!isMobileMode) handleImpressionAutoReset();
                return false;
            });

            if (!isMobileMode) {
                $('#main-image a').click(function() {
                    var nextImage = parseInt($('#current-img').val()) + 1;
                    if (nextImage < totalImages) {
                        updateNumberOfImagesText(nextImage, totalImages, true);
                    } else {
                        updateNumberOfImagesText(0, totalImages, true);
                    }
                    sendEventLog('ImageView');
                    return false;
                });
                
            } else {
                $('#main-image a').attr('title', 'Click to open...'); 
                
                $("#main-image").touchwipe({
                    min_move_x: 30,
                    min_move_y: 30,
                    wipeLeft: function() {
                        var nextImage = parseInt($('#current-img').val()) + 1;
                        if (nextImage === totalImages) { nextImage = 0; }
                        updateNumberOfImagesText(nextImage, totalImages, true);
                        sendEventLog('ImageView');
                        $(this).blur();
                        $(this).addClass('hovered');
                        return false;
                    },
                    wipeRight: function() {
                        var prevImage = parseInt($('#current-img').val()) - 1;
                        if (prevImage < 0) { prevImage = totalImages - 1; }
                        updateNumberOfImagesText(prevImage, totalImages, true);
                        sendEventLog('ImageView');
                        $(this).blur();
                        $(this).addClass('hovered');
                        return false;
                    },
                    preventDefaultEvents: false
                });
            }

            $('#main-image a').mousemove(function () {
                $('.nav-previous a').removeClass('hovered');
                $('.nav-next a').removeClass('hovered');
            });
        
        } else {
            $('.gallery-images a').click(function () { return false; }).css('cursor', 'default');
        }
    }
}

function getReference(node, ctx) {
    if (node !== undefined && node != null && node.length > 0) {
        if (typeof(ctx) == "function" || typeof(ctx) == "object") {
            return ctx.find(node);
        }
        if (ctx !== undefined && ctx != null && ctx.length > 0) {
            return $(ctx + ' ' + node);
        }
        return $(node);
    }
    return null;
}

function onLoadDisplayMap () {
    $('#resultsInfoTop,#resultsInfoBottom').css('display', 'none');
    $('#resultsList').css('display', 'none');
    $mapWrapper.removeClass('hidden');
    $('a.mv').parent().addClass('active');
    loadThisMap($('#MapSearchUrl').val());
}

function getUrlVars() {
    var vars = [], hash; var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) { hash = hashes[i].split('='); vars.push(hash[0]); vars[hash[0]] = hash[1]; } return vars; 
}

function setChecked($el, val) {
    if ($el && $el.length > 0) {
        var checked = 'checked';
        var newVal = val && (val == 1 || val == true || val == 'checked'); 
        if (newVal == true) { // Must not reselect same value.
            if ($el[0].checked == true) return;
            $el[0].setAttribute(checked, checked);
            $el[0].checked = true;
        }
        if (newVal == false) {
            if ($el[0].checked == false) return;
            $el[0].setAttribute(checked, ''); // For IE
            $el[0].removeAttribute(checked); // For other browsers            
            $el[0].checked = false;
        }
    }
}

function resetMultiSelect() {
    var $roots = $('fieldset.mselect-root');
    $roots.each(function () { 
        var $root = $(this); 
        $.each($('.mselect-list input[type=checkbox]', $root), function (i, a) { $(a).removeAttr('checked'); });
        $('.mselect-lbl', $root).html('Select by checking options in the drop down'); 
    }); 
}

function configureSearchField(selector, container, searchLabel) {
    // NOTE: this can cause an additional ajax request for count because the value is changing/triggering events. 
    var $elem = container == null ? $(selector) : $(selector, container);
    $elem.addClass('configBusy');
    if (searchLabel !== undefined && searchLabel != null) { $elem.attr('searchLabel', searchLabel); }
    $elem.blur(function () { var $field = $(this); if ($field.val() == '') { $field.addClass('help-text'); setSearchFieldClosure($field, $field.attr('searchLabel')); } })
         .focus(function () { var $field = $(this); if ($field.val() == $field.attr('searchLabel')) { setSearchFieldClosure($field, '').removeClass('help-text'); } });
    /*if (!isAppleAgent()) { $elem.focus(); } else { if ($elem.val() == '') { $elem.addClass('help-text'); setSearchFieldClosure($elem, $elem.attr('searchLabel')); } }*/
    var trueVal = valueOfSearchField$($elem);
    if (isMobileMode) { if (trueVal == '') { $elem.addClass('help-text'); setSearchFieldClosure($elem, $elem.attr('searchLabel')); } }
    $elem.attr('prevVal', trueVal);
    $elem.removeClass('configBusy');
}

function setSearchFieldClosure($field, val) {
    if ($field) { $field.val(val); }
    return $field; 
}

function resetSearchField(selector, container) {
    var $field = $(selector, container);
    setSearchFieldClosure($field, $field.attr('searchLabel')).addClass('help-text');
}

function valueOfSearchField(selector, container) {
    var result = '';
    var $field = $(selector, container);
    if ($field.val() != $field.attr('searchLabel')) { result = $field.val(); }
    return result;
}

function valueOfSearchField$($field) {
    var result = '';
    if ($field.val() != $field.attr('searchLabel')) { result = $field.val(); }
    return result;
}

function isAppleAgent() {
    return ((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i))) ? true : false; 
}

function isIEAgent() {
    return (navigator.userAgent.match(/MSIE/i)) ? true : false;
}

function isIPhoneAgent() {
    return (navigator.userAgent.match(/iPhone/i)) ? true : false;
}

function isChromeAgent() {
    return (navigator.userAgent.match(/Chrome/i)) ? true : false;
}

function scrollTo($el, speed, offset) {
    if (speed === undefined || speed == null) { speed = 300; }
    if (offset === undefined || offset == null) { offset = 0; }
    var eltop = $el.offset().top;
    $('html, body').animate({ scrollTop: (eltop + offset) > 0 ? (eltop + offset) : eltop }, speed);
};

function refreshBookmarks(adsCsv) {
    var ads = adsCsv.split(',');
    $('.bookmark').each(function (idx, elem) {
        var $elem = $(elem);
        if (jQuery.inArray($elem.attr('id'), ads) >= 0) {
            $elem.find('.bookmark-label').show();
            $elem.find('.bookmark-link').hide();
        }
        else {
            $elem.find('.bookmark-label').hide();
            $elem.find('.bookmark-link').show();
        }
    });
}

var firstValidate = true;
function validateRegion($cont, fields) {
    var $ref = getReference($cont);
    if (fields === undefined || fields == null) fields = 'input,select,textarea';
    var $flds = $ref.find(fields);
    var inv = 0, cnt = $flds.length, focus = false; 
    for (var idx = 0; idx < cnt; idx++) {
        var $fld = $($flds[idx]);
        if ($fld.attr('type') != 'button') {
            if ($fld.valid() != true) {
                if (firstValidate == true) {
                    var val = $fld.val();
                    if (val != null && val.length > 0) { continue; }
                }
                if (focus == false) { focus = true; $fld.focus(); }
                inv++;                
            }
        }
    };
    firstValidate = false; 
    return inv == 0;
}

var loadGTIterCount = 0;
var loadGTIterInst = 0; 
var $loadGTIterCtx = null;
function loadGoogleTagBlocks($ctx) {
    var obj = null;
    $loadGTIterCtx = $ctx;
    try { obj = typeof(googletag) !== 'undefined' && googletag != null ? googletag : null;
    } catch (ex) { }
    if (obj != null) {
        var sel = '.advert-block div.content';
        var $ads = null; 
        if ($ctx !== undefined && $ctx != null && $ctx.length > 0) {
            $ads = $ctx.selector.indexOf(sel) >= 0 
                || ($ctx.hasClass('content') && $ctx.parent().hasClass('advert-block'))
                ? $ctx : $ctx.find(sel); 
        } else {
            $ads = $(sel); 
        }
        var alen = $ads.length;                
        for (var aind = 0; aind < alen; aind++) {
            var blockid = $ads[aind].id;
            if (blockid != null && blockid.length > 0 && $ads[aind].innerHTML.length == 0) {
                loadGTIterInst++;
                $ads[aind].setAttribute('instance', loadGTIterInst); 
                obj.cmd.push(function() { obj.display(blockid); });
            }
        }
    } else {
        if (loadGTIterCount < 10) {
            loadGTIterCount+=1;
            setTimeout(function() { loadGoogleTagBlocks($loadGTIterCtx); }, 500);
        }
    }    
}

function SlidingTimer(func, timeout) {
    this.pending = false;
    this.chainedCalls = 0;
    this.prevChain = 0;
    this.delegate = func;
    this.schedule = timeout * 1;
    this.timerId = 0;
    this.result = null;

    this.call = function() {
        if (this.delegate != null || this.schedule <= 0) {
            this.chainedCalls += 1;
            if (this.pending && this.timerId != 0) {
                clearTimeout(this.timerId);
            }

            this.pending = true;
            this.timerId = setTimeout(this.delegate, this.schedule);
            return this.timerId;
        }
    };

    this.clear = function(timerId) {
        if (timerId = this.timerId && !this.pending) {
            this.prevChain = this.chainedCalls;
            this.pending = false;
            this.chainedCalls = 0;
            this.timerId = 0;
        }
    };

    this.cancel = function(timerId) {
        if (timerId == this.timerId) {
            clearTimeout(this.timerId);
            this.prevChain = this.chainedCalls;
            this.pending = false;
            this.chainedCalls = 0;
            this.timerId = 0;
        }
    };
    
}
