require(["gitbook","jQuery"],function(t,n){var i=window,o={init:function(){this.winH=n(i).height(),this.bindEvents()},bindEvents:function(){var t=this;n("img").each(function(o,e){var r=n(e),a=r.offset().top,c=n(i).scrollTop();r.attr("loaded","false").attr("src","images/loading.gif"),a<t.winH+c&&a>c&&r.attr("src",r.attr("data-src")).attr("loaded","true")}),n(".book-body,.body-inner").on("scroll.lazy",function(){t.timer&&(clearTimeout(t.timer),t.timer=null),t.timer=setTimeout(function(){var o=n(i).scrollTop();n("img").each(function(i,e){var r=n(e),a=0;"false"==r.attr("loaded")&&(a=r.offset().top)<t.winH+o&&a>o&&r.attr("src",r.attr("data-src")).attr("loaded","true")})},200)})},unbindEvent:function(){n(".book-body,.body-inner").off("scroll.lazy")}};t.events.bind("page.change",function(){o.unbindEvent(),o.init()}),o.init()});