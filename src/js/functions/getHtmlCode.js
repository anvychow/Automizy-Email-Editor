define([
    "core"
], function () {
    $AEE.getHtmlCodeInProgress = false;
    var htmlCode = '';
    $AEE.getHtmlCode = function (options) {
        if(typeof options === 'undefined'){
            var options = {};
        }
        if($AEE.getHtmlCodeInProgress){
            return htmlCode;
        }
        $AEE.delay(function(){
            $AEE.getHtmlCodeInProgress = false;
        }, 50);

        var responsiveEmail = $AEE.inputs.blockSettingsResponsiveEmail.checked();

        htmlCode = '';
        $AEE.getHtmlCodeInProgress = true;
        $AEE.elements.$document.css('max-width', 'none').find('.aee-block-content-cell').each(function(){
            var $t = $(this);
            $t.attr('data-width', $t.width());
        });
        $AEE.elements.$document.css('max-width', '80%');
        var $document = $AEE.elements.$document.clone('.aee-block-content-cell');
        var $html = $AEE.newBlock({onlyContent:true});
        var $content = $html.data('$contentCell');
        var s = $AEE.elements.$document[0].style;
        $document.removeAttr('style').appendTo($content);

        $content.attr('style',[
            'padding-top:'+(s.paddingTop || 0),
            'padding-right:'+(s.paddingRight || 0),
            'padding-bottom:'+(s.paddingBottom || 0),
            'padding-left:'+(s.paddingLeft || 0),
            'border-top-width:'+(s.borderTopWidth || 0),
            'border-right-width:'+(s.borderRightWidth || 0),
            'border-bottom-width:'+(s.borderBottomWidth || 0),
            'border-left-width:'+(s.borderLeftWidth || 0),
            'border-top-style:'+(s.borderTopStyle || 'none'),
            'border-right-style:'+(s.borderRightStyle || 'none'),
            'border-bottom-style:'+(s.borderBottomStyle || 'none'),
            'border-left-style:'+(s.borderLeftStyle || 'none'),
            'border-top-color:'+(s.borderTopColor || 'transparent'),
            'border-right-color:'+(s.borderRightColor || 'transparent'),
            'border-bottom-color:'+(s.borderBottomColor || 'transparent'),
            'border-left-color:'+(s.borderLeftColor || 'transparent'),
            'background-color:'+(s.backgroundColor || 'transparent')
        ].join('; '));

        $html.find('.automizy-remove-tr').parent().remove();

        $html.find('.aee-block-handle, .aee-image-block-content .aee-image-block-button, aee-image-block-content br, .aee-gallery-block-element.aee-empty, .aee-gallery-block-element-separator, .aee-columns-block-column:not(.aee-active)').remove();

        /* RebuildColumns */
        function rebuildColumnBlock(){
            var $block = $html.find('.aee-block.aee-columns-block-item:not(.aee-column-converted):first');
            if($block.length <= 0){
                return false;
            }
            var floatable = $A.parseBoolean($block.attr('data-floatable'));
            if(!floatable){
                var $table = $('<table border="0" cellpadding="0" cellspacing="0" width="100%" style="width:100%; border:none; padding:0; margin:0"></table>');
                var $tr = $('<tr></tr>').appendTo($table);
                $block.find('.aee-block-content-cell:first').children('.aee-active').each(function(){
                    var $t = $(this);
                    var width = $t.attr('data-width-in-percent');
                    $('<td width="'+width+'%" valign="top" align="left" style="margin:0; padding:0; border:none; width:'+width+'%; vertical-align:top; text-align:left"></td>').html($t.html()).appendTo($tr);
                });
                $block.find('.aee-block-content-cell:first').html($table);
            }
            $block.addClass('aee-column-converted');
            rebuildColumnBlock();
        }
        rebuildColumnBlock();

        $html.find('.aee-block').each(function(){
            var $block = $(this);
            var $contentCell = $block.find('.aee-block-content-cell:first');
            var contentCellWidth = parseInt($contentCell.attr('data-width'));

            if($contentCell.find('.aee-block-content-cell').length <= 0) {
                $contentCell.find('.aee-imagepicker-image').each(function () {
                    var $img = $(this);
                    var $parent = $img.parent();
                    if ($parent.hasClass('ui-wrapper')) {
                        $img.insertAfter($parent);
                        $parent.remove();
                        $parent = $img.parent();
                    }
                    $img.closest('.aee-gallery-block-element').contents().unwrap();
                    $img.removeStyles('resize', 'position', 'zoom', 'display', 'opacity');
                    if ($img.is('[data-percent-width]')) {
                        $img[0].style.maxWidth = $img.attr('data-percent-width') + '%';
                        //$img[0].style.minWidth = $img.attr('data-percent-width') + '%';
                    }
                    if ($img.is('[data-width]')) {
                        $img[0].style.width = $img.attr('data-width') + 'px';
                    }
                    $img.attr('width', $img.width());

                    if (!responsiveEmail) {
                        var dataWidth = parseInt($img.attr('data-width'));
                        var minWidth = dataWidth + 'px';
                        var maxWidth = dataWidth + 'px';
                        maxWidth = '100%';

                        width = dataWidth + 'px';
                        if(contentCellWidth > dataWidth){
                            contentCellWidth = dataWidth;
                        }

                        $img.attr('style', 'margin:0; border:none; max-width:' + maxWidth + '; width:' + contentCellWidth + 'px');
                        $img.attr('width', contentCellWidth);
                    }
                });
            }

            if($block.hasClass('aee-gallery-block-item')){
                var distance = $block.attr('data-space');
                $AEE.elements.$gallerySeparatorHtml.attr('width', distance).css({width:distance+'px'});
                $contentCell.find('.aee-imagepicker-image').each(function(index){
                    if(index > 0){
                        $(this).before($AEE.elements.$gallerySeparatorHtml[0].outerHTML);
                    }
                });
            }

            var segments = $block.attr('data-dynamic-segments');
            if(typeof segments !== 'undefined'){
                $block.before('<!--[[CONDITION:{"blockshows":"segments","segments":['+segments+']}]]-->');
            }else{
                $block.before('<!--[[CONDITION:{"blockshows":"all","segments":null}]]-->');
            }
            $block.after('<!--[[CONDITION:{"blockshows":"all","segments":null}]]-->');

            //contentCellBackgroundColor = $AEE.rgbStyleToHex($contentCell[0].style.backgroundColor);
            //$block.attr('style', 'width:100%; margin:0; padding:0; border:none; outline:none; background-color:' + contentCellBackgroundColor + '; border-color:' + contentCellBackgroundColor);
            $block.attr('style', 'width:100%; margin:0; padding:0; border:none; outline:none');

        });


        $html.find('*').andSelf().removeAttr('id contenteditable data-mce-style spellcheck data-space');
        $html.find('*').andSelf().not('.aee-noremoveclass').removeAttr('class');
        var html = $html[0].outerHTML;

        html = html.replace(/(\[%7B|%7B%7B)(.*?)(%7D\]|%7D%7D)/g, function(match,$1,$2,$3){
            var start = '{{';
            var end = '}}';
            if($1 === '[%7B'){
                start = '[{';
            }
            if($3 === '%7D]'){
                end = '}]';
            }
            return start + $2 + end;
        }).replace(/\[\{(.*?)\}\]/g, function(match,$1){
            var value = '[{'+$1+'}]';
            if($1 === 'share_facebook'){
                value = "https://www.facebook.com/sharer/sharer.php?u=[{webversion}]";
            }else if($1 === 'share_twitter'){
                value = "http://twitter.com/share?via=protopmail&text=" + encodeURI($AEE.title()) + "&url=[{webversion}]";
            }else if($1 === 'share_gplus'){
                value = "https://plus.google.com/share?url=[{webversion}]";
            }else if($1 === 'share_linkedin'){
                value = "http://www.linkedin.com/shareArticle?mini=true&title=" + encodeURI($AEE.title()) + "&summary=" + $AEE.getDescription().substring(150) + "...&source=Automizy&url=[{webversion}]";
            }
            return value;
        }).replace(/&amp;/g, '&');

        var outerColor = $AEE.inputs.blockSettingsDocumentOuterColor.val();
        if(outerColor.length <= 0){
            outerColor = '#ffffff';
        }

        var maxWidth = $AEE.maxWidth();

        if(responsiveEmail) {
            var content = '<div align="center" width="100%" bgcolor="' + outerColor + '" style="display:inline-block; text-align:center; width:100%; max-width:' + maxWidth + 'px; background-color:' + outerColor + '; margin:0 auto 0 auto">' +
                '<!--[if mso]>' +
                '<div align="center" class="outlook" style="text-align:center">' +
                '<table cellpadding="0" cellspacing="0" border="0" width="' + Math.min(maxWidth, 800) + '" style="width:' + Math.min(maxWidth, 800) + 'px">' +
                '<tr>' +
                '<td>' +
                '<![endif]-->' +

                html +

                '<!--[if mso]>' +
                '</td>' +
                '</tr>' +
                '</table>' +
                '</div>' +
                '<![endif]-->' +
                '</div>';
        }else{
            var content = '<div align="center" width="' + maxWidth + 'px" bgcolor="' + outerColor + '" style="display:inline-block; text-align:center; width:' + maxWidth + 'px; background-color:' + outerColor + '; margin:0 auto 0 auto">' +
                '<div align="center" class="outlook" style="text-align:center">' +
                '<table cellpadding="0" cellspacing="0" border="0" width="' + maxWidth + '" style="width:' + maxWidth + 'px">' +
                '<tr>' +
                '<td>' +

                html +

                '</td>' +
                '</tr>' +
                '</table>' +
                '</div>' +
                '</div>';
        }


        htmlCode = '' +
            '<!DOCTYPE>' +
            '<html>' +
                '<head>' +
                    //'<title>' + $AEE.title() + '</title>' +
                    '<title>[{subject}]</title>' +
                    '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">' +
                    '<meta property="og:title" content="[{subject}]" />' +
                    '<meta property="og:description" content="' + $AEE.getDescription().substring(150) + '..." />' +
                    '<meta property="og:type" content="website" />' +
                    '<meta property="og:url" content="[{webversion}]" />' +
                    '<meta property="og:image" content="' + $AEE.d.config.url + '/images/automizy-logo-100x100.jpg" />' +
                    '<style>' +
                    '.automizy-column-1{' +
                        'width: 100% !important;' +
                    '}' +
                    '@media only screen and (max-width: 400px) {' +
                        '.automizy-column-2, .automizy-column-3, .automizy-column-4{' +
                            'width: 100% !important;' +
                        '}' +
                    '}' +
                    '@media only screen and (max-width: 550px) {' +
                        '.automizy-column-3, .automizy-column-4{' +
                            'width: 100% !important;' +
                        '}' +
                    '}' +
                    '@media only screen and (max-width: 800px) {' +
                        '.automizy-column-4{' +
                            'width: 100% !important;' +
                        '}' +
                    '}' +
                    '</style>' +
                '</head>' +
                '<body align="center" width="100%" bgcolor="'+outerColor+'" style="text-align:center; min-width: 100%; width:100%; background-color:'+outerColor+'">' +

                    content +

                '</body>' +
            '</html>';

        if(options.conditions !== true) {
            if (options.conditions === false || !$AEE.dynamicBlocks()) {
                htmlCode = htmlCode.replace(/<\!\-\-\[\[.*?\]\]\-\->/g, "");
            }
        }
        return htmlCode;
    };
});