try{!function(e){var t={};function i(n){if(t[n])return t[n].exports;var s=t[n]={i:n,l:!1,exports:{}};return e[n].call(s.exports,s,s.exports,i),s.l=!0,s.exports}i.m=e,i.c=t,i.d=function(e,t,n){i.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},i.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},i.t=function(e,t){if(1&t&&(e=i(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(i.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var s in e)i.d(n,s,function(t){return e[t]}.bind(null,s));return n},i.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return i.d(t,"a",t),t},i.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},i.p="",i(i.s=0)}([function(e,t,i){e.exports=i(5)},function(e,t){void 0===window.QSI.WebResponsiveDialog&&(QSI.WebResponsiveDialog={CREATIVE_CONTAINER_CLASS:QSI.BuildResponsiveElementModule.PARENT_CONTAINER_CLASS+"-creative-container",smallViewportBreakpoint:768,smallLivePreviewerViewportBreakpoint:330,Animation:{TYPES:{FADE:"fade",SLIDE_IN:"slide-in"},fade:{initCreativeStyles:function(e){e.style.opacity=0,e.style.transform="translateY(40px)"},updateCreativeAnimationStyles:function(e){e.style.opacity=1,e.style.transition="transform 1s, opacity 0.5s",e.style.transform=""},setInitialCreativeStyles:function(e){this.initCreativeStyles(e)},setCreativeAnimationStyles:function(e){this.updateCreativeAnimationStyles(e)},initLivePreviewerCreativeAnimationStyles:function(e){this.initCreativeStyles(e)},updateLivePreviewerCreativeAnimationStyles:function(e){this.updateCreativeAnimationStyles(e)},addCreativeTransitionEndListener:function(e,t){e.addEventListener("transitionend",function(e){"transform"===e.propertyName&&t.displayed.resolve()})}},"slide-in":{TOP_LEFT:"top-left",TOP_RIGHT:"top-right",BOTTOM_LEFT:"bottom-left",BOTTOM_RIGHT:"bottom-right",initMobileViewportStyles:function(e,t){e.style.position="fixed",e.style.top="50%",t.Position===this.TOP_LEFT||t.Position===this.BOTTOM_LEFT?(e.style.transform="translate(-50%, -50%)",e.style.left="-100%"):t.Position!==this.TOP_RIGHT&&t.Position!==this.BOTTOM_RIGHT||(e.style.transform="translate(50%, -50%)",e.style.right="-100%")},initDesktopViewportStyles:function(e,t){e.style.position="fixed",t.Position===this.TOP_LEFT?(e.style.top="24px",e.style.left="-100%",e.style.transition="left 1s"):t.Position===this.TOP_RIGHT?(e.style.top="24px",e.style.right="-100%",e.style.transition="right 1s"):t.Position===this.BOTTOM_LEFT?(e.style.bottom="24px",e.style.left="-100%",e.style.transition="left 1s"):t.Position===this.BOTTOM_RIGHT&&(e.style.bottom="24px",e.style.right="-100%",e.style.transition="right 1s")},updateMobileViewportAnimationStyles:function(e,t){t.Position===this.TOP_LEFT||t.Position===this.BOTTOM_LEFT?(e.style.left="50%",e.style.transition="left 1s"):t.Position!==this.TOP_RIGHT&&t.Position!==this.BOTTOM_RIGHT||(e.style.right="50%",e.style.transition="right 1s")},updateDesktopViewportAnimationStyles:function(e,t){switch(t.Position){case this.TOP_LEFT:case this.BOTTOM_LEFT:e.style.left="24px";break;case this.TOP_RIGHT:case this.BOTTOM_RIGHT:e.style.right="24px"}},setInitialCreativeStyles:function(e,t){QSI.WebResponsiveDialog.isMobileViewport()?this.initMobileViewportStyles(e,t):this.initDesktopViewportStyles(e,t)},setCreativeAnimationStyles:function(e,t){QSI.WebResponsiveDialog.isMobileViewport()?this.updateMobileViewportAnimationStyles(e,t):this.updateDesktopViewportAnimationStyles(e,t)},initLivePreviewerCreativeAnimationStyles:function(e,t){QSI.WebResponsiveDialog.isMobileViewportForLivePreviewer()?this.initMobileViewportStyles(e,t):this.initDesktopViewportStyles(e,t)},updateLivePreviewerCreativeAnimationStyles:function(e,t){QSI.WebResponsiveDialog.isMobileViewportForLivePreviewer()?this.updateMobileViewportAnimationStyles(e,t):this.updateDesktopViewportAnimationStyles(e,t)},addCreativeTransitionEndListener:function(e,t){e.addEventListener("transitionend",function(){t.displayed.resolve()})}}},initLivePreviewerCreativeStyles:function(e){e.style.position="fixed",e.style.top="50%",e.style.right="50%",e.style.transform="translate(50%, -50%)"},getStaticClassNames:function(e,t){return{MODAL_CONTENT:e.DIALOG_CONTENT+" "+e.DIALOG_CONTENT+"-"+t.SizeAndStyle.ContentSpacing+" "+e.BORDER_RADIUS+"-"+t.SizeAndStyle.BorderRadius+" "+e.DROP_SHADOW+"-"+t.SizeAndStyle.DropShadow,LOGO_CONTAINER:e.LOGO_CONTAINER+" "+e.LOGO_CONTAINER+"-"+t.SizeAndStyle.ContentSpacing,CLOSE_BUTTON_CONTAINER:e.CLOSE_BUTTON_CONTAINER+" "+e.CLOSE_BUTTON_CONTAINER+"-"+t.SizeAndStyle.ContentSpacing,CLOSE_BUTTON:e.CLOSE_BUTTON,LOGO:e.LOGO,HEADLINE:e.HEADLINE+" "+e.HEADLINE+"-"+t.SizeAndStyle.ContentSpacing+" "+e.FONT_WEIGHT+"-"+t.Message.Headline.FontWeight,DESCRIPTION:e.DESCRIPTION+" "+e.FONT_WEIGHT+"-"+t.Message.Description.FontWeight,TEXT_CONTAINER:e.TEXT_CONTAINER+"-"+t.SizeAndStyle.ContentSpacing,BUTTON_CONTAINER:e.BUTTON_CONTAINER,EMBEDDED_TARGET_CONTAINER:e.EMBEDDED_TARGET_CONTAINER+" "+e.EMBEDDED_TARGET_CONTAINER+"-"+t.SizeAndStyle.ContentSpacing}},getButtonClassName:function(e,t,i,n){return e.BUTTON+" "+e.BUTTON+"-"+n+" "+e.BUTTON_BORDER_RADIUS+"-"+i},display:function(e,t){var i=0;if("DisplayAfter"in t&&t.DisplayAfter>0&&(i=1e3*t.DisplayAfter),this.isPreview)t.LivePreviewerRun||(i=0),setTimeout(this._displayForLivePreviewer.bind(this,e,t),i);else{var n=setTimeout(this._display.bind(this,e,t),i);QSI.util.pushTimeout(n)}},_display:function(e,t){this.isPreview||this.impress(),this.previouslyFocussedElement=document.activeElement,this.container=QSI.BuildResponsiveElementModule.buildParentContainer();var i=this.buildCreativeContainer(e,t);i.appendChild(e),this.Animation[t.Type].setInitialCreativeStyles(e,t),t.Type===this.Animation.TYPES.FADE&&(this.shadowBox=QSI.BuildResponsiveElementModule.buildShadowBox(),i.style.zIndex=this.shadowBox.style.zIndex,this.container.appendChild(this.shadowBox),this.setInitialShadowBoxStyles(this.shadowBox)),this.container.appendChild(i),document.body.appendChild(this.container),this.addAccessibilityFunctionality(i,t,this.previouslyFocussedElement);var n=!1;if(this.options&&(n=QSI.util.usePostToStart(this.options.targetURLType)),n&&this.hasCreativeEmbeddedTarget){var s=this.getTarget();s=QSI.util.addScreenCaptureParameterToTarget(s);var o=QSI.EmbeddedData.getEmbeddedDataAsArray(this.options.id,this.options.requestId);QSI.WindowUtils.postToIframe("survey-iframe-"+this.options.id,s,o)}if(t.Type===this.Animation.TYPES.FADE&&this.setShadowBoxAnimationStyles(this.shadowBox,t),this.Animation[t.Type].addCreativeTransitionEndListener(e,this),this.Animation[t.Type].setCreativeAnimationStyles(e,t),QSI.global.currentZIndex++,t.ShouldAutoClose)if(t.CloseAfter>0){var a=1e3*t.CloseAfter;setTimeout(this.close.bind(this),a)}else this.close()},_displayForLivePreviewer:function(e,t){var i=!0===t.LivePreviewerRun;this.container=QSI.BuildResponsiveElementModule.buildParentContainer();var n=this.buildCreativeContainer(e,t);if(n.appendChild(e),i?(this.Animation[t.Type].initLivePreviewerCreativeAnimationStyles(e,t),t.Type===this.Animation.TYPES.FADE&&(this.shadowBox=QSI.BuildResponsiveElementModule.buildShadowBox(),n.style.zIndex=this.shadowBox.style.zIndex,this.container.appendChild(this.shadowBox),this.setInitialShadowBoxStyles(this.shadowBox))):this.initLivePreviewerCreativeStyles(e),this.container.appendChild(n),document.body.appendChild(this.container),i){t.Type===this.Animation.TYPES.FADE&&this.setShadowBoxAnimationStyles(this.shadowBox,t),this.Animation[t.Type].addCreativeTransitionEndListener(e,this);var s=this.Animation;setTimeout(function(){s[t.Type].updateLivePreviewerCreativeAnimationStyles(e,t)},100)}if(QSI.global.currentZIndex++,i&&t.ShouldAutoClose)if(t.CloseAfter>0){var o=1e3*t.CloseAfter;setTimeout(this.close.bind(this),o)}else this.close()},impress:function(){},buildCreativeContainer:function(e,t){var i=this.CREATIVE_CONTAINER_CLASS+"-"+t.Type;return QSI.BuildResponsiveElementModule.buildHTMLElement({elementType:QSI.BuildResponsiveElementModule.HTML_ELEMENT_TYPES.CONTAINER,content:e,className:i})},setInitialShadowBoxStyles:function(e){e.style.opacity=0},setShadowBoxAnimationStyles:function(e,t){"none"===t.BackgroundScreen?e.style.opacity=0:"light"===t.BackgroundScreen?e.style.opacity=.1:"medium"===t.BackgroundScreen?e.style.opacity=.25:"dark"===t.BackgroundScreen&&(e.style.opacity=.5),e.style.transition="transform 0.5s, opacity 0.5s"},shouldDisplayCloseButton:function(e){return!!e.Buttons.UseCloseButton},shouldDisplayLogo:function(e){if(void 0===e.Logos||void 0===e.Logos.Desktop||void 0===e.Logos.Mobile)return!1;if(!e.Logos.Desktop.ImageId&&!e.Logos.Mobile.ImageId)return!1;var t=this.isPreview?this.isMobileViewportForLivePreviewer():this.isMobileViewport();return!(!e.Logos.Mobile.ImageId&&t)},isMobileViewportForLivePreviewer:function(){return window.innerWidth<=QSI.WebResponsiveDialog.smallLivePreviewerViewportBreakpoint},isMobileViewport:function(){return window.innerWidth<=QSI.WebResponsiveDialog.smallViewportBreakpoint},buildModalContentStyle:function(e){var t={};return t["background-color"]=e,t},buildTextStyle:function(e,t){return{"font-size":e,color:t}},buildButtonStyle:function(e){return{"font-size":e}},addStandardButtonStyle:function(e,t){t.style.color=e.LabelColor,t.style["background-color"]=e.BackgroundColor,t.style["border-color"]=e.BorderColor},addAccessibilityFunctionality:function(e,t,i){t.Type===this.Animation.TYPES.FADE&&(e.tabIndex=0);var n=e.querySelectorAll("[tabindex]");if(n&&n.length>0){this.firstTabbableElement=n[0],this.lastTabbableElement=n[n.length-1];var s=this;QSI.util.observe(e,"keydown",function(i){try{t.Type===s.Animation.TYPES.FADE&&9===i.which&&(i.target!==s.lastTabbableElement||i.shiftKey?i.target===s.firstTabbableElement&&i.shiftKey?(i.preventDefault(),s.lastTabbableElement.focus()):i.target!==e||i.shiftKey?i.target===e&&i.shiftKey&&(i.preventDefault(),s.lastTabbableElement.focus()):(i.preventDefault(),s.firstTabbableElement.focus()):(i.preventDefault(),s.firstTabbableElement.focus()))}catch(e){"undefined"!=typeof QSI&&QSI.dbg&&QSI.dbg.e&&QSI.dbg.e(e)}}),QSI.util.observe(document,"keyup",function(t){try{27===t.which&&(t.preventDefault(),s.close?s.close():QSI.util.closeResponsiveEmbeddedTarget(e,i))}catch(e){"undefined"!=typeof QSI&&QSI.dbg&&QSI.dbg.e&&QSI.dbg.e(e)}}),this.firstTabbableElement&&!this.isPreview&&this.firstTabbableElement.focus()}},getCreativeContainerStylesheetString:function(){return"        ."+this.CREATIVE_CONTAINER_CLASS+"-fade {          outline: none;          position: fixed;          z-index: "+QSI.global.currentZIndex+";          left: 0;          top: 0;          width: 100%;          height: 100%;          padding: 0px;          margin: 0px;          display: -ms-flexbox;          display: flex;          -ms-flex-pack: center;          justify-content: center;          -ms-flex-align: center;          align-items: center;          -webkit-text-size-adjust: 100%;          -moz-text-size-adjust: 100%;          -ms-text-size-adjust: 100%        }        ."+this.CREATIVE_CONTAINER_CLASS+"-slide-in {          outline: none;          z-index:"+QSI.global.currentZIndex+";          position: relative;        }      "}})},function(e,t){void 0===window.QSI.WebResponsive&&(QSI.WebResponsive={}),void 0===window.QSI.WebResponsive.WebResponsiveDialog&&(QSI.WebResponsive.WebResponsiveDialog={}),void 0===window.QSI.WebResponsive.WebResponsiveDialog.Layout1&&(QSI.WebResponsive.WebResponsiveDialog.Layout1=QSI.util.Creative(QSI.WebResponsiveDialog,{LAYOUT_CLASS_NAME:"QSIWebResponsiveDialog-Layout1",initialize:function(e){this.globalInitialize(e),this.elements=e.elements||{},this.replaceTranslatedFields(),this.animationOptions=this.elements.Animation||this.getDefaultAnimation(),this.hasCreativeEmbeddedTarget=e.hasCreativeEmbeddedTarget||this.elements.SizeAndStyle.UseEmbeddedTarget,this.resizeCreativeWithEmbeddedSurvey=this.elements.SizeAndStyle.ResizeForEmbeddedTargets||!1,this.hasCreativeEmbeddedTarget&&(this.elements.SizeAndStyle.ContentSpacing="medium"),this.targetURL=e.targetURL,this.isPreview=e.isPreview,this.LAYOUT_CLASS_NAME=this.LAYOUT_CLASS_NAME+"-"+this.id,this.CLASS_NAME_MAPPING=this.getClassNameMapping(),this.ID_MAPPING=this.getIdMapping(),this.CLASS_NAMES=this.getStaticClassNames(this.CLASS_NAME_MAPPING,this.elements),this.shouldShow()&&(this.resetStyles(),this.preloadLogoAndDisplay()),this.surveyHeightEventListener=this.surveyHeightEventListener.bind(this),QSI.surveyHeightListenerRegistered||(QSI.surveyHeightListenerRegistered=!0,window.addEventListener("message",this.surveyHeightEventListener))},replaceTranslatedFields:function(){var e=QSI.LocalizationModule.getTranslation(this.elements);e&&(e.H&&(this.elements.Message.Headline.Text=e.H),e.D&&(this.elements.Message.Description.Text=e.D),e.B1&&(this.elements.Buttons.ButtonOne.Text=e.B1),e.B2&&(this.elements.Buttons.ButtonTwo.Text=e.B2),e.B1AriaLabel&&(this.elements.Buttons.ButtonOne.ARIALabel=e.B1AriaLabel),e.B2AriaLabel&&(this.elements.Buttons.ButtonTwo.ARIALabel=e.B2AriaLabel),e.LogoAltText&&(this.elements.Logos.AltText=e.LogoAltText),e.EmbeddedTargetIFrameTitle&&(this.elements.SizeAndStyle.EmbeddedTargetIFrameTitle=e.EmbeddedTargetIFrameTitle))},preloadLogoAndDisplay:function(){if(this.shouldDisplayLogo(this.elements)){var e=new Image;this.isMobileViewport()||!this.isMobileViewport()&&this.elements.Logos.Mobile.ImageId&&!this.elements.Logos.Desktop.ImageId?e.src=QSI.global.graphicPath+this.elements.Logos.Mobile.ImageId:e.src=QSI.global.graphicPath+this.elements.Logos.Desktop.ImageId;var t=this;e.onload=function(){t.buildAndDisplay()},e.onerror=function(){t.buildAndDisplay()}}else this.buildAndDisplay()},buildAndDisplay:function(){var e=this.getStylesheet(null);void 0===window.QSI.wrdStyleElement&&(window.QSI.wrdStyleElement={}),window.QSI.wrdStyleElement[this.id]=QSI.BuildResponsiveElementModule.appendStylesToDocument(e);var t=this.buildCreative();this.display(t,this.animationOptions),this.hasCreativeEmbeddedTarget&&(window.QSI.global.featureFlags["DX.StatsAccuracy"]||this.click())},getClassNameMapping:function(){return{CLOSE_BUTTON_CONTAINER:this.LAYOUT_CLASS_NAME+"_close-btn-container",CLOSE_BUTTON:this.LAYOUT_CLASS_NAME+"_close-btn",LOGO_CONTAINER:this.LAYOUT_CLASS_NAME+"_logo-container",TEXT_CONTAINER:this.LAYOUT_CLASS_NAME+"_text-container",DIALOG_CONTENT:this.LAYOUT_CLASS_NAME+"_content",LOGO:this.LAYOUT_CLASS_NAME+"_logo",HEADLINE:this.LAYOUT_CLASS_NAME+"_headline",FONT_WEIGHT:this.LAYOUT_CLASS_NAME+"_font-weight",DESCRIPTION:this.LAYOUT_CLASS_NAME+"_description",BUTTON_CONTAINER:this.LAYOUT_CLASS_NAME+"_button-container",BUTTON:this.LAYOUT_CLASS_NAME+"_button",BUTTON_BORDER_RADIUS:this.LAYOUT_CLASS_NAME+"_button-border-radius",BORDER_RADIUS:this.LAYOUT_CLASS_NAME+"_border-radius",DROP_SHADOW:this.LAYOUT_CLASS_NAME+"_drop-shadow",EMBEDDED_TARGET_CONTAINER:this.LAYOUT_CLASS_NAME+"_embedded-target-container"}},getIdMapping:function(){return{TEXT_CONTAINER:this.LAYOUT_CLASS_NAME+"-text-container",HEADLINE:this.LAYOUT_CLASS_NAME+"-headline",DESCRIPTION:this.LAYOUT_CLASS_NAME+"-description"}},getDefaultAnimation:function(){return{Type:"fade",BackgroundScreen:"light"}},buildDummyTarget:function(){var e=QSI.util.build("div",{style:{position:"relative",overflow:"hidden",margin:"auto",fontSize:"25px",height:"250px",textAlign:"center",verticalAlign:"middle",paddingTop:"50px"}},[]);return e.innerText=QSI.LocalizationModule.getLocalizedString("SurveyWillBeShownHere"),e},buildCreative:function(){var e,t=[];(this.shouldDisplayCloseButton(this.elements)||this.hasCreativeEmbeddedTarget)&&(e=this.buildCloseButton(),t.push(e)),this.shouldDisplayLogo(this.elements)&&t.push(this.buildLogo()),this.hasCreativeEmbeddedTarget?this.isPreview?t.push(this.buildDummyTarget()):t.push(this.buildEmbeddedTarget(e)):(t.push(this.buildText()),t.push(this.buildButtons()));var i=QSI.BuildResponsiveElementModule.buildHTMLElement({elementType:QSI.BuildResponsiveElementModule.HTML_ELEMENT_TYPES.CONTAINER,content:t,className:this.CLASS_NAMES.MODAL_CONTENT,elementStyle:this.buildModalContentStyle(this.elements.SizeAndStyle.InterceptColor)});return this.addAccessibilityAttributesToModal(i),i},buildEmbeddedTarget:function(e){var t=this.getTarget(),i=this.options?this.options.targetURLType:null,n=new QSI.BuildResponsiveEmbeddedTarget(t,i),s="survey-iframe-"+this.options.id,o={containerOptions:{className:this.CLASS_NAME_MAPPING.EMBEDDED_TARGET_CONTAINER},iframeOptions:{accessibilityTitle:this.elements.SizeAndStyle.EmbeddedTargetIFrameTitle,interceptId:this.options.id,dataName:s},inCreative:!0};if(window.QSI.global.featureFlags["DX.StatsAccuracy"]){this.dataName=s,QSI.util.detectClickInIframeListener(this)}return n.build(o,e)},buildCloseButton:function(){var e=QSI.global.baseURL;"#FFFFFF"===this.elements.Buttons.CloseButtonColor?e+="/WRSiteInterceptEngine/../WRQualtricsShared/Graphics/siteintercept/wr-dialog-close-btn-white.png":e+="/WRSiteInterceptEngine/../WRQualtricsShared/Graphics/siteintercept/wr-dialog-close-btn-black.png";var t=this.hasCreativeEmbeddedTarget?"16px":"17px",i=QSI.BuildResponsiveElementModule.buildHTMLElement({elementType:QSI.BuildResponsiveElementModule.HTML_ELEMENT_TYPES.IMAGE,src:e,altText:QSI.LocalizationModule.getLocalizedString("Close"),elementStyle:{height:t,width:t,marginTop:"1px"}}),n=QSI.BuildResponsiveElementModule.buildHTMLElement({elementType:QSI.BuildResponsiveElementModule.HTML_ELEMENT_TYPES.BUTTON,content:i,elementStyle:{},className:this.CLASS_NAMES.CLOSE_BUTTON,ariaLabel:QSI.LocalizationModule.getLocalizedString("Close"),tabbable:!0});return QSI.BuildResponsiveElementModule.addButtonFunctionality(QSI.BuildResponsiveElementModule.ACTION_TYPES.DISMISS,n,this),QSI.BuildResponsiveElementModule.buildHTMLElement({elementType:QSI.BuildResponsiveElementModule.HTML_ELEMENT_TYPES.CONTAINER,content:n,className:this.CLASS_NAMES.CLOSE_BUTTON_CONTAINER})},buildLogo:function(){var e="";e=!(this.isPreview?this.isMobileViewportForLivePreviewer():this.isMobileViewport())&&this.elements.Logos.Desktop.ImageId?this.elements.Logos.Desktop.ImageId:this.elements.Logos.Mobile.ImageId;var t=QSI.global.graphicPath+e,i=this.elements.Logos.AltText,n=QSI.BuildResponsiveElementModule.buildHTMLElement({elementType:QSI.BuildResponsiveElementModule.HTML_ELEMENT_TYPES.IMAGE,className:this.CLASS_NAMES.LOGO,src:t,altText:i});return QSI.BuildResponsiveElementModule.buildHTMLElement({elementType:QSI.BuildResponsiveElementModule.HTML_ELEMENT_TYPES.CONTAINER,content:n,className:this.CLASS_NAMES.LOGO_CONTAINER})},buildText:function(){var e=[],t=this.elements.Message.Color,i=this.elements.Message.Headline,n=i.Text,s=QSI.BuildResponsiveElementModule.buildHTMLElement({elementType:QSI.BuildResponsiveElementModule.HTML_ELEMENT_TYPES.HEADLINE,content:n,className:this.CLASS_NAMES.HEADLINE,id:this.ID_MAPPING.HEADLINE,elementStyle:this.buildTextStyle(i.FontSize,t)}),o=this.elements.Message.Description,a=o.Text,l=QSI.BuildResponsiveElementModule.buildHTMLElement({elementType:QSI.BuildResponsiveElementModule.HTML_ELEMENT_TYPES.TEXT,content:a,className:this.CLASS_NAMES.DESCRIPTION,id:this.ID_MAPPING.DESCRIPTION,elementStyle:this.buildTextStyle(o.FontSize,t)});return e.push(s),e.push(l),QSI.BuildResponsiveElementModule.buildHTMLElement({elementType:QSI.BuildResponsiveElementModule.HTML_ELEMENT_TYPES.CONTAINER,content:e,className:this.CLASS_NAMES.TEXT_CONTAINER,id:this.ID_MAPPING.TEXT_CONTAINER})},buildButtons:function(){var e=this.elements.Buttons,t=this.elements.SizeAndStyle,i=[],n=e.ButtonOne;if(n){var s=this.buildButton(n,t);i.push(s)}if(2===e.Number&&e.ButtonTwo){var o=e.ButtonTwo,a=this.buildButton(o,t);i.push(a)}return QSI.BuildResponsiveElementModule.buildHTMLElement({elementType:QSI.BuildResponsiveElementModule.HTML_ELEMENT_TYPES.CONTAINER,content:i,className:this.CLASS_NAMES.BUTTON_CONTAINER})},buildButton:function(e,t){var i=QSI.BuildResponsiveElementModule.buildHTMLElement({elementType:QSI.BuildResponsiveElementModule.HTML_ELEMENT_TYPES.BUTTON,content:e.Text,elementStyle:this.buildButtonStyle(this.elements.Buttons.FontSize),className:this.getButtonClassName(this.CLASS_NAME_MAPPING,e.Action,this.elements.Buttons.BorderRadius,t.ContentSpacing),tabbable:!0,ariaLabel:e.ARIALabel});return this.addStandardButtonStyle(e,i),QSI.BuildResponsiveElementModule.addButtonFunctionality(e.Action,i,this),i},close:function(e){try{if(this.container&&this.container.parentNode){this.container.style.opacity="0",this.container.style.transition="opacity 0.5s";var t=this;this.container.addEventListener("transitionend",function(){try{t.container.parentNode.removeChild(t.container)}catch(e){}})}!e&&this.previouslyFocussedElement&&this.previouslyFocussedElement.focus(),QSI.callbacks&&QSI.callbacks[this.id]&&QSI.callbacks[this.id].onClose&&QSI.callbacks[this.id].onClose()}catch(e){}},addAccessibilityAttributesToModal:function(e){e.setAttribute("role","dialog"),e.setAttribute("aria-modal",!0),this.elements.SizeAndStyle.UseEmbeddedTarget?e.setAttribute("aria-label",this.elements.SizeAndStyle.EmbeddedTargetIFrameTitle):(e.setAttribute("aria-labelledby",this.ID_MAPPING.HEADLINE),e.setAttribute("aria-describedby",this.ID_MAPPING.DESCRIPTION))},getStylesheet:function(e){return window.QSI.GenerateWebResponsiveDialogCSS.generateCSS(e,this.CLASS_NAME_MAPPING,this.hasCreativeEmbeddedTarget)+this.getCreativeContainerStylesheetString()},surveyHeightEventListener:function(e){if(this.hasCreativeEmbeddedTarget&&this.resizeCreativeWithEmbeddedSurvey)try{var t=QSI.util.validatePostMessage(e);if(!t||"JFE"!==t.from||"SI"!==t.to)return;if("sendingSurveyHeight"===t.event&&"string"==typeof t.value&&t.value.match(/^\d+(\.\d+)?(px)$/)){var i=(parseInt(t.value)+6).toString()+"px",n=this.getStylesheet(i);QSI.wrdStyleElement[this.id]=QSI.BuildResponsiveElementModule.appendStylesToDocument(n,QSI.wrdStyleElement[this.id]),window.removeEventListener("message",this.surveyHeightEventListener),QSI.surveyHeightListenerRegistered=void 0}}catch(e){window.removeEventListener("message",this.surveyHeightEventListener),QSI.surveyHeightListenerRegistered=void 0,window.QSI.wrdStyleElement=void 0,"undefined"!=typeof QSI&&QSI.dbg&&QSI.dbg.e&&QSI.dbg.e(e)}}}))},function(e,t){QSI.LocalizationModule={getBrowserLangs:function(){return navigator.languages},isLocalized:function(e){var t=e.toUpperCase();return null!=QSI.LocalizationHelper.getTranslationMap(t)},getLocalizedString:function(e,t){if(!this.isLocalized(e))return e;var i=QSI.LocalizationHelper.getTranslationMap(e.toUpperCase()),n="";t&&"global-js-var"===t.DetectionMethod&&(n=t.GlobalJsVar);var s=this.getLangToShow(i,n);return null===s?e:i[s]},setUpGetLangToShow:function(e){if(0===Object.keys(e).length)return null;var t=e.Translations;if(!t)return null;var i="";return e.TranslationSettings&&"global-js-var"===e.TranslationSettings.DetectionMethod&&(i=e.TranslationSettings.GlobalJsVar),Object.keys(t).forEach(function(e){t[e].A||delete t[e]}),this.getLangToShow(t,i)},getTranslation:function(e){var t=this.setUpGetLangToShow(e);return t?e.Translations[t]:null},getTranslationCode:function(e){return this.setUpGetLangToShow(e)},getDefaultLang:function(e){return e.TranslationSettings&&e.TranslationSettings.DefaultLang?e.TranslationSettings.DefaultLang:null},getLangToShow:function(e,t){if(t){var i=QSI.strToVal(t);if(i)if(o=this.findLangMatchIfExists(e,i.toUpperCase()))return o}var n=this.getBrowserLangs();if(n&&n[1]){for(var s=0;s<n.length;s++){if(o=this.findLangMatchIfExists(e,n[s]))return o}return null}var o,a=(window.QSI.Browser&&QSI.util.isIE(10)?navigator.browserLanguage:n&&n[0]||navigator.language||navigator.userLanguage).toUpperCase();return o=this.findLangMatchIfExists(e,a)},findLangMatchIfExists:function(e,t){if("ZH-S"===t?t="ZH-CN":"ZH-T"===t&&(t="ZH-TW"),e[t=t.toUpperCase()])return t;var i=this.trimLangCode(t);return e[i]?i:null},trimLangCode:function(e){return e.split("-")[0]}}},function(e,t){const i={SOMEWHATUNHELPFUL:{DE:"Eher nicht hilfsbereit",SV:"Ganska hjälpsam",RU:"Скорее бесполезен",FI:"Jonkin verran hyödytön",PT:"Parcialmente inútil",KO:"어느 정도 도움이 되지 않음","PT-BR":"Mais ou menos inútil",EN:"Somewhat unhelpful",IT:"Abbastanza inutile",FR:"Plutôt inutile","RI-GI":"⁪⁪⁪‍‌‌​‌​‍​​‍‍​‌‌‌​‌‍​‌‌‌​‌‌​‌‍‌‍‌​​​​‍‌‍‍⁪Somewhat unhelpful⁪⁪",ES:"Algo inútil","ZH-HANS":"有点没用","ZH-HANT":"不算有幫助",PB:"⟦용용용용용 Śοmęẃнąţ ŭήнêľρƒμľ 歴歴歴歴歴⟧",TH:"ค่อนข้างช่วยไม่ได้",JA:"どちらかといえば役立っていない",DA:"Nogenlunde uhjælpsom","EN-GB":"Somewhat unhelpful",NL:"Enigszins onbehulpzaam","ES-419":"Poco útil","EN-US":"Somewhat unhelpful"},EXTREMELYUNHELPFUL:{DE:"Überhaupt nicht hilfsbereit",SV:"Inte alls hjälpsam",RU:"Совсем бесполезен",FI:"Todella hyödytön",PT:"Extremamente inútil",KO:"매우 도움이 되지 않음","PT-BR":"Extremamente inútil",EN:"Extremely unhelpful",IT:"Estremamente inutile",FR:"Extrêmement inutile","RI-GI":"⁪⁪⁪‍‌​‍‍​‍‌​​​​‍‍‌‌‍​‍‌‌‌‍‍​‌​​‍‍‌​​‌​‍​‌​⁪Extremely unhelpful⁪⁪",ES:"Extremadamente inútil","ZH-HANS":"毫无帮助","ZH-HANT":"毫無幫助",PB:"⟦용용용용용 Ē×τґέmєĺỳ űŋħėĺρƒüĺ 歴歴歴歴歴⟧",TH:"ช่วยไม่ได้อย่างยิ่ง",JA:"まったく役立っていない",DA:"Meget uhjælpsom","EN-GB":"Extremely unhelpful",NL:"Buitengewoon onbehulpzaam","ES-419":"Extremadamente poco útil","EN-US":"Extremely unhelpful"},CLOSE:{DE:"Schließen",EN:"Close","EN-GB":"Close","EN-US":"Close",ES:"Cerrar","ES-419":"Cerrar",FI:"Sulje",FR:"Fermer",IT:"Chiudi",JA:"閉じます",KO:"닫힙니다",NL:"Sluiten",PB:"⟦용용용용 Čĺőŝе",PT:"Fechar","PT-BR":"Feche","ZH-HANS":"关闭","ZH-HANT":"關閉"},NEITHERHELPFULNORUNHELPFUL:{DE:"Weder hilfsbereit noch nicht hilfsbereit",SV:"Varken eller",RU:"Трудно сказать, полезен или бесполезен",FI:"Ei hyödyllinen eikä hyödytön",PT:"Nem útil nem inútil",KO:"도움이 되지도 안 되지도 않음","PT-BR":"Nem útil nem inútil",EN:"Neither helpful nor unhelpful",IT:"Né utile né inutile",FR:"Ni utile, ni inutile","RI-GI":"⁪⁪⁪‌‌​​​‌​​‌​‍‍‌‌‌‌​‌‍‍‌‌‌‍‌‍​​‌‌‌‌​‌‍​‍​‌‌⁪Neither helpful nor unhelpful⁪⁪",ES:"Ni útil ni inútil","ZH-HANS":"无所谓有没有帮助","ZH-HANT":"無所謂有幫助或無幫助",PB:"⟦용용용용용 Иєíťнěŗ нéľρƒűļ ŉοг üņħēĺρƒųĺ 歴歴歴歴歴⟧",TH:"เฉยๆ",JA:"どちらでもない",DA:"Hverken hjælpsom eller uhjælpsom","EN-GB":"Neither helpful nor unhelpful",NL:"Niet behulpzaam, niet onbehulpzaam","ES-419":"Ni útil ni poco útil","EN-US":"Neither helpful nor unhelpful"},EXTREMELYHELPFUL:{DE:"Äußerst hilfsbereit",SV:"Mycket hjälpsam",RU:"Очень полезен",FI:"Todella hyödyllinen",PT:"Extremamente útil",KO:"매우 도움이 됨","PT-BR":"Extremamente útil",EN:"Extremely helpful",IT:"Estremamente utile",FR:"Extrêmement utile","RI-GI":"⁪⁪⁪‍‌​‍‍‌‌‍‍‍​​‍​​‌‍‍‍‍‌​​‌‌‍‌‌‍‌​​‍​‍‌‍​‌‍⁪Extremely helpful⁪⁪",ES:"Extremadamente útil","ZH-HANS":"非常有帮助","ZH-HANT":"極有幫助",PB:"⟦용용용용용 Σхτгëmєļÿ ĥěĺρƒůĺ 歴歴歴歴歴⟧",TH:"ช่วยได้อย่างยิ่ง",JA:"非常に役立っている",DA:"Meget hjælpsom","EN-GB":"Extremely helpful",NL:"Buitengewoon behulpzaam","ES-419":"Extremadamente útil","EN-US":"Extremely helpful"},SOMEWHATHELPFUL:{DE:"Eher hilfsbereit",SV:"Ganska hjälpsam",RU:"Скорее полезен",FI:"Jonkin verran hyödyllinen",PT:"Parcialmente útil",KO:"어느 정도 도움이 됨","PT-BR":"Mais ou menos útil",EN:"Somewhat helpful",IT:"Abbastanza utile",FR:"Assez utile","RI-GI":"⁪⁪⁪‌‌‌​‌‍​​‍‌‌‌​‍‍​‌​‍‌​​‌‍​‌‌​‍‌‌‌‍‌​‌‌‍‍‍‌⁪Somewhat helpful⁪⁪",ES:"Algo útil","ZH-HANS":"有点帮助","ZH-HANT":"還算有幫助",PB:"⟦용용용용 Ŝômέẁħäŧ ħēļρƒůĺ 歴歴歴歴⟧",TH:"ค่อนข้างช่วยได้",JA:"いくらか役立っている",DA:"Nogenlunde hjælpsom","EN-GB":"Somewhat helpful",NL:"Enigszins behulpzaam","ES-419":"Algo útil","EN-US":"Somewhat helpful"},THUMBSUP:{DE:"Zustimmen",SV:"Tummen upp",RU:"Нравится",FI:"Peukalo ylös",PT:"Polegar para cima",KO:"승인","PT-BR":"Curto",EN:"Thumbs Up",IT:"Benissimo",FR:"Pouce vers le haut","RI-GI":"⁪⁪⁪‌​‌‍‍‌‌‍​‍​​​‌‍​‍​​‍‌‌​​‌‍‍‌‌‍​‍​‌‍‍‍​‌‍‌⁪Thumbs Up⁪⁪",ES:"Conforme","ZH-HANS":"赞","ZH-HANT":"喜歡",PB:"⟦용용용 Ŧнųmьś Ŭρ 歴歴歴⟧",TH:"ชอบ",JA:"賛成",DA:"Tommelfingeren op","EN-GB":"Thumbs Up",NL:"Duim omhoog","ES-419":"Pulgar arriba","EN-US":"Thumbs Up"},THUMBSDOWN:{DE:"Ablehnen",SV:"Tummen ned",RU:"Не нравится",FI:"Peukalo alas",PT:"Polegar para baixo",KO:"거절","PT-BR":"Não curto",EN:"Thumbs Down",IT:"Malissimo",FR:"Pouce vers le bas","RI-GI":"⁪⁪⁪‌​‌​​‍‌‌‌​‌‍‍‍‌‌‍‍‍‍‌‌‍‍‌‌‍‍‌‍‍‌‌​​‍‍‍‍‍‌⁪Thumbs Down⁪⁪",ES:"No conforme","ZH-HANS":"很逊","ZH-HANT":"不喜歡",PB:"⟦용용용 Τнцmвŝ Ðοωń 歴歴歴⟧",TH:"ไม่ชอบ",JA:"不賛成",DA:"Tommelfingeren ned","EN-GB":"Thumbs Down",NL:"Duim omlaag","ES-419":"Pulgar abajo","EN-US":"Thumbs Down"},SUBMIT:{DE:"Abschicken",SV:"Skicka",RU:"Отправить",FI:"Lähetä",PT:"Enviar",KO:"제출","PT-BR":"Enviar",EN:"Submit",IT:"Invia",FR:"Envoyer","RI-GI":"⁪⁪⁪‌​‌‍‌​​‌‌‍‌​‌​‌​​​​‌‌​‌‌‌​‌‌‍​‌‌‌​‍​‍​‍​‌⁪Submit⁪⁪",ES:"Enviar","ZH-HANS":"提交","ZH-HANT":"提交",PB:"⟦용용 Ŝųьmįţ 歴歴⟧",TH:"ส่ง",JA:"送信",DA:"Send","EN-GB":"Submit",NL:"Verzenden","ES-419":"Enviar","EN-US":"Submit"},SURVEYWILLBESHOWNHERE:{DE:"Umfrage wird hier angezeigt",SV:"Undersökning visas här",RU:"Опрос будет показан здесь",FI:"Kysely näytetään täällä",PT:"O inquérito será apresentado aqui",KO:"설문조사가 여기에 표시됩니다.","PT-BR":"A pesquisa será exibida aqui",EN:"Survey will be shown here",IT:"Il sondaggio sarà mostrato qui",FR:"L'enquête sera affichée ici.","RI-GI":"⁪⁪⁪‌​‌‍‌​​‌‌‍‌​‌​‌​​​​‌‌​‌‌‌​‌‌‍​‌‌‌​‍​‍​‍​‌⁪Survey will be shown here",ES:"La encuesta se mostrará aquí","ZH-HANS":"调查将显示在此处","ZH-HANT":"調查會顯示於此",PB:"⟦용용용용 ŜųѓνęУ ŵįľļ вє śħöώŋ ħéяê 歴歴歴歴⟧",TH:"แบบสำรวจจะแสดงที่นี่",JA:"アンケートはここに表示されます",DA:"Undersøgelsen vises her","EN-GB":"Survey will be shown here",NL:"Enquête wordt hier weergegeven","ES-419":"La encuesta se mostrará aquí","EN-US":"Survey will be shown here",ID:"Survei akan ditampilkan di sini",MS:"Kaji selidik akan ditunjukkan di sini"}};QSI.LocalizationHelper={getTranslationMap:function(e){return i[e]}}},function(e,t,i){"use strict";i.r(t);i(1),i(2);var n={desktop:"377px",phonePortrait:"276px",phoneLandscape:"173px",tablet:"339px"};function s(e){return"."+window.QSI.BuildResponsiveElementModule.PARENT_CONTAINER_CLASS+" ."+e}function o(e,t,i,o,a){var l=e?"and (min-height: "+e+") ":"",r=t?"and (max-height: "+t+") ":"";return"60vh"===a||"490px"!==e&&"610px"!==e||parseInt(a)<parseInt(n.desktop)&&(a=n.desktop),"@media only screen and (max-width: 767px) "+l+r+"{      "+s(o.DIALOG_CONTENT)+"-medium {          width: 90%;          max-height: 95vh;      }      "+s(o.EMBEDDED_TARGET_CONTAINER)+"{          width: 95%;          height: "+a+";          max-height: "+i+";      }    }@media only screen and (min-width: 768px) "+l+r+"{      "+s(o.DIALOG_CONTENT)+"-medium {          width: 80%;          max-width: 750px;          max-height: 95vh;      }      "+s(o.EMBEDDED_TARGET_CONTAINER)+"{          width: 95%;          height: "+a+";          max-height: "+i+";      }    }"}function a(e,t,i,o,a,l){var r=e?"and (min-height: "+e+") ":"",d=t?"and (max-height: "+t+") ":"",h=a,u=a;return l?("40vh"!==a&&(parseInt(a)<parseInt(n.phoneLandscape)&&(h=n.phoneLandscape),parseInt(a)<parseInt(n.tablet)&&(u=n.tablet)),"@media only screen and (max-device-width: 926px) and (orientation: landscape) "+r+d+"{    "+s(o.DIALOG_CONTENT)+"-medium {        width: 80%;        max-height: 95vh;    }    "+s(o.EMBEDDED_TARGET_CONTAINER)+"{        width: 95%;        height: "+h+";        max-height: "+i+";    }  }  @media only screen and (min-device-width: 927px) and (orientation: landscape) "+r+d+"{    "+s(o.DIALOG_CONTENT)+"-medium {        width: 70%;        max-height: 95vh;    }    "+s(o.EMBEDDED_TARGET_CONTAINER)+"{        width: 95%;        height: "+u+";        max-height: "+i+";    }  }"):("40vh"!==a&&(parseInt(a)<parseInt(n.phonePortrait)&&(h=n.phonePortrait),parseInt(a)<parseInt(n.tablet)&&(u=n.tablet)),"@media only screen and (max-device-width: 767px) and (orientation: portrait) "+r+d+"{      "+s(o.DIALOG_CONTENT)+"-medium {          width: 90%;          max-height: 95vh;      }      "+s(o.EMBEDDED_TARGET_CONTAINER)+"{          width: 95%;          height: "+h+";          max-height: "+i+";      }    }    @media only screen and (min-device-width: 768px) and (orientation: portrait) "+r+d+"{      "+s(o.DIALOG_CONTENT)+"-medium {          width: 80%;          max-width: 750px;          max-height: 95vh;      }      "+s(o.EMBEDDED_TARGET_CONTAINER)+"{          width: 95%;          height: "+u+";          max-height: "+i+";      }    }")}window.QSI.GenerateWebResponsiveDialogCSS={generateCSS:function(e,t,i){var n=window.QSI.Browser.isMobile?e||"40vh":e||"60vh";function l(e){return s(e.DIALOG_CONTENT)+"{      box-sizing: border-box;       background-color: #fefefe;    }    "+s(e.DROP_SHADOW)+"-none {      box-shadow: none;    }    "+s(e.DROP_SHADOW)+"-light {      box-shadow: 0 2px 4px 0 rgba(0,0,0,0.2);    }    "+s(e.DROP_SHADOW)+"-medium {      box-shadow: 0 2px 8px 0 rgba(0,0,0,0.3);    }    "+s(e.DROP_SHADOW)+"-heavy {      box-shadow: 0 2px 16px 0 rgba(0,0,0,0.4);    }    "+s(e.TEXT_CONTAINER)+"-spacious{        margin-bottom: 24px;        word-wrap: break-word;        overflow-wrap: break-word;    }    "+s(e.CLOSE_BUTTON_CONTAINER)+"{        width: 100%;        display: -ms-flexbox;        display: flex;        flex-direction: row-reverse;        -ms-flex-direction: row-reverse;    }    "+s(e.CLOSE_BUTTON_CONTAINER)+"-compact{        margin-top: 4px;        margin-bottom: 4px;    }    "+s(e.CLOSE_BUTTON_CONTAINER)+"-medium{        margin-top: 6px;        margin-bottom: 6px;    }    "+s(e.CLOSE_BUTTON_CONTAINER)+"-spacious{        margin-top: 8px;        margin-bottom: 8px;    }    "+s(e.LOGO_CONTAINER)+"{        width: 100%;        display: -ms-flexbox;        display: flex;        -ms-flex-pack: center;        justify-content: center;        -ms-flex-align: center;        align-items: center;    }    "+s(e.LOGO_CONTAINER)+"-compact{        margin-bottom: 8px;    }    "+s(e.LOGO_CONTAINER)+"-medium{        margin-bottom: 12px;    }    "+s(e.LOGO_CONTAINER)+"-spacious{        margin-bottom: 16px;    }    "+s(e.LOGO)+"{        max-height: 48px;        max-width: 192px;    }    "+s(e.BORDER_RADIUS)+"-none {        border-radius: 0px;    }    "+s(e.BORDER_RADIUS)+"-slightly-rounded {        border-radius: 4px;    }    "+s(e.BORDER_RADIUS)+"-moderately-rounded {        border-radius: 10px;    }    "+s(e.BORDER_RADIUS)+"-very-rounded {        border-radius: 16px;    }    "}return i?l(t)+function(e,t){var i=o(null,null,"60vh",e,"60vh")+o("610px",null,"78vh",e,t)+o("490px","609px","74vh",e,t)+o("385px","489px","68vh",e,t)+o("305px","384px","60vh",e,t)+o(null,"304px","55vh",e,t)+s(e.DIALOG_CONTENT)+"-medium{            padding-bottom: 20px;      }      "+s(e.CLOSE_BUTTON)+"{            background: rgba(255, 255, 255, 0.6);            border: 0;            width: 26px;            height: 26px;            border-radius: 13px;            margin-top: 5px;            margin-right: 10px;            padding: 0px;      }      ",n=a(null,null,"40vh",e,"40vh",!1)+a(null,null,"40vh",e,"40vh",!0)+a("1366px",null,"86vh",e,t,!1)+a("1024px","1365px","83vh",e,t,!1)+a("845px","1023px","82vh",e,t,!1)+a("737px","844px","80vh",e,t,!1)+a("668px","736px","79vh",e,t,!1)+a("569px","667px","77vh",e,t,!1)+a(null,"568px","74vh",e,t,!1)+a("1024px",null,"83vh",e,t,!0)+a("768px","1023px","79vh",e,t,!0)+a("376px","767px","66vh",e,t,!0)+a("321px","375px","63vh",e,t,!0)+a(null,"320px","57vh",e,t,!0)+s(e.DIALOG_CONTENT)+"-medium{              padding-bottom: 20px;        }        "+s(e.CLOSE_BUTTON)+"{              background: rgba(255, 255, 255, 0.6);              border: 0;              width: 26px;              height: 26px;              border-radius: 13px;              margin-top: 5px;              margin-right: 10px;              padding: 0px;        }        ";return window.QSI.Browser.isMobile?n:i}(t,n):l(t)+function(e){return"      @media only screen and (max-width: 520px) {          "+s(e.DIALOG_CONTENT)+"-compact {              width: 70%;          }          "+s(e.DIALOG_CONTENT)+"-medium {              width: 80%;          }          "+s(e.DIALOG_CONTENT)+"-spacious {              width: 90%;          }      }      @media only screen and (min-width: 521px) and (max-width: 768px) {          "+s(e.DIALOG_CONTENT)+"-compact {              width: 40%;          }          "+s(e.DIALOG_CONTENT)+"-medium {              width: 50%;          }          "+s(e.DIALOG_CONTENT)+"-spacious {              width: 60%;          }      }      @media only screen and (min-width: 769px) and (max-width: 992px) {          "+s(e.DIALOG_CONTENT)+"-compact {              width: 30%;          }          "+s(e.DIALOG_CONTENT)+"-medium {              width: 35%;          }          "+s(e.DIALOG_CONTENT)+"-spacious {              width: 40%;          }      }      @media only screen and (min-width: 993px) {          "+s(e.DIALOG_CONTENT)+"-compact {              width: 25%;              max-width: 480px;          }          "+s(e.DIALOG_CONTENT)+"-medium {              width: 28%;              max-width: 480px;          }          "+s(e.DIALOG_CONTENT)+"-spacious {              width: 30%;              max-width: 480px;          }      }      "+s(e.DIALOG_CONTENT)+"-compact{          padding-top: 8px;          padding-bottom: 16px;          padding-left: 16px;          padding-right: 16px;      }      "+s(e.DIALOG_CONTENT)+"-medium{          padding-top: 12px;          padding-bottom: 20px;          padding-left: 20px;          padding-right: 20px;      }      "+s(e.DIALOG_CONTENT)+"-spacious{          padding-top: 16px;          padding-bottom: 24px;          padding-left: 24px;          padding-right: 24px;      }      "+s(e.TEXT_CONTAINER)+"-compact{          margin-bottom: 16px;          word-wrap: break-word;          overflow-wrap: break-word;      }      "+s(e.TEXT_CONTAINER)+"-medium{          margin-bottom: 20px;          word-wrap: break-word;          overflow-wrap: break-word;      }      "+s(e.TEXT_CONTAINER)+"-spacious{          margin-bottom: 24px;          word-wrap: break-word;          overflow-wrap: break-word;      }      "+s(e.HEADLINE)+"{          text-align: center;          white-space: pre-wrap;      }      "+s(e.HEADLINE)+"-compact{          margin-bottom: 8px;      }      "+s(e.HEADLINE)+"-medium{          margin-bottom: 12px;      }      "+s(e.HEADLINE)+"-spacious{          margin-bottom: 16px;      }      "+s(e.FONT_WEIGHT)+"-light {          font-weight: 300;      }      "+s(e.FONT_WEIGHT)+"-regular {          font-weight: 400;      }      "+s(e.FONT_WEIGHT)+"-semibold {          font-weight: 600;      }      "+s(e.FONT_WEIGHT)+"-bold {          font-weight: 700;      }      "+s(e.DESCRIPTION)+"{          text-align: center;          white-space: pre-wrap;      }      "+s(e.BUTTON_CONTAINER)+"{          text-align: center;          display: block;          word-wrap: break-word;          overflow-wrap: break-word;      }      "+s(e.CLOSE_BUTTON)+"{          background: rgba(255, 255, 255, 0.6);          border: 0;          width: 28px;          height: 28px;          border-radius: 14px;          margin-top: 5px;          margin-right: 10px;          padding: 0px;      }      "+s(e.BUTTON)+"{          box-sizing: border-box;          font-weight: 600;          padding: 10px 25px;          cursor: pointer;          width: 100%;          border-width: 2px;          max-width: 240px;          border-style: solid;      }      ."+e.BUTTON+"-compact + ."+e.BUTTON+"-compact{          margin-top: 8px;      }      ."+e.BUTTON+"-medium + ."+e.BUTTON+"-medium{          margin-top: 12px;      }      ."+e.BUTTON+"-spacious + ."+e.BUTTON+"-spacious{          margin-top: 16px;      }      "+s(e.BUTTON_BORDER_RADIUS)+"-none {        border-radius: 0px;      }      "+s(e.BUTTON_BORDER_RADIUS)+"-slightly-rounded {        border-radius: 4px;      }      "+s(e.BUTTON_BORDER_RADIUS)+"-moderately-rounded {        border-radius: 12px;      }      "+s(e.BUTTON_BORDER_RADIUS)+"-completely-rounded {        border-radius: 20px;      }    "}(t)},getDesktopHeights:o,getMobileHeights:a};i(3),i(4)}]);}catch(e){if(typeof QSI!=='undefined'&&QSI.dbg&&QSI.dbg.e){QSI.dbg.e(e);}}