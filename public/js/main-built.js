define("common/init",["require"],function(e){function t(e,t){var n=$("#grid");n.data("kendoGrid")&&(n.data("kendoGrid").destroy(),n.empty());var i=$(".right-wrapper").eq(0).height(),r=$(".right-header").eq(0).height(),a=i-r-2+"px";DataSource.serverPaging=!0,DataSource.serverFiltering=!0,DataSource.serverSorting=!0,DataSource.pageSize=10;var n=n.kendoGrid({dataSource:new kendo.data.DataSource(e),height:a,scrollable:!0,resizable:!0,sortable:!0,filterable:!0,refresh:!0,editable:"inline",pageable:{input:!0,numeric:!1,refresh:!0},columns:t,columnMenu:!0});return n}function n(e,t,n){if(e.data("kendoWindow"))return e.data("kendoWindow").center().open();e.kendoWindow({width:n||"400px",title:t||"form",visible:!1,actions:["Pin","Minimize","Maximize","Close"]}).data("kendoWindow").center().open()}function i(e){return e.data("kendoEditor")?e.data("kendoEditor"):e.kendoEditor({resizable:{content:!1,toolbar:!0},change:function(){},select:function(){},execute:function(){},paste:function(){},tools:["bold","italic","underline","strikethrough","justifyLeft","justifyCenter","justifyRight","justifyFull","insertUnorderedList","insertOrderedList","indent","outdent","createLink","unlink","insertImage","insertFile","subscript","superscript","createTable","addRowAbove","addRowBelow","addColumnLeft","addColumnRight","deleteRow","deleteColumn","viewHtml","formatting","cleanFormatting","fontName","fontSize","foreColor","backColor","print"]}).data("kendoEditor")}return{grid:t,window:n,editor:i}}),define("common/utils",["require"],function(e){return{htmlEncode:function(e){var t=document.createElement("div");void 0!=t.textContent?t.textContent=e:t.innerText=e;var n=t.innerHTML;return t=null,n},htmlDecode:function(e){var t=document.createElement("div");t.innerHTML=e;var n=t.innerText||t.textContent;return t=null,n},htmlEncodeByRegExp:function(e){var t="";return 0==e.length?"":(t=e.replace(/&/g,"&amp;"),t=t.replace(/</g,"&lt;"),t=t.replace(/>/g,"&gt;"),t=t.replace(/ /g,"&nbsp;"),t=t.replace(/\'/g,"&#39;"),t=t.replace(/\"/g,"&quot;"))},htmlDecodeByRegExp:function(e){var t="";return 0==e.length?"":(t=e.replace(/&amp;/g,"&"),t=t.replace(/&lt;/g,"<"),t=t.replace(/&gt;/g,">"),t=t.replace(/&nbsp;/g," "),t=t.replace(/&#39;/g,"'"),t=t.replace(/&quot;/g,'"'))}}}),define("manager/config",["require","./../common/utils","./../common/init"],function(e,t,n){var i={};return i.articles=function(e,t){return[{field:"title",title:"标题",width:"100px"},{field:"description",title:"文章说明"},{field:"img",title:"图片地址",width:"100px"},{field:"navId",title:"导航id",width:"100px"},{field:"serverTime",title:"发布时间"},{title:"操作",command:[{text:"删除",click:e||new Function},{text:"编辑",click:t||new Function}]}]},i.categories=function(){return[{field:"name",title:"类别名称"},{field:"_id",title:"id"},{command:"destroy",title:" ",width:"150px"}]},i.navs=function(e,t){return[{field:"name",title:"导航名称"},{field:"_id",title:"id"},{title:"操作",command:[{name:"destroy",text:"删除",click:e||new Function},{name:"edit",text:"编辑",click:t||new Function}]}]},{columns:i,editor:{tools:["bold","italic","underline","strikethrough","justifyLeft","justifyCenter","justifyRight","justifyFull","insertUnorderedList","insertOrderedList","indent","outdent","createLink","unlink","insertImage","insertFile","subscript","superscript","createTable","addRowAbove","addRowBelow","addColumnLeft","addColumnRight","deleteRow","deleteColumn","viewHtml","formatting","cleanFormatting","fontName","fontSize","foreColor","backColor","print"],resizable:{content:!0,toolbar:!1}}}}),define("manager/index",["require","./../common/init","./config"],function(e,t,n){function i(e){var n=this.dataItem($(e.currentTarget).closest("tr"));t.editor($("#articleUpdateEditor")).value(n.content||""),$("#articleUpdateForm").children().each(function(e,t){var i=$(t).children().eq(1),r=i.attr("name"),a=n[r];"recommend"==r&&$(i).attr("checkbox",a),i.val(a)}),l($("#articleUpdateForm #categories"),$(d).siblings().andSelf()),$("#articleUpdateForm #categories").children().each(function(e,t){var i=$(t).attr("value");n.categoriesId.forEach(function(e,n){i==e.id&&$(t).attr("checked",!0)})}),t.window($("#articleUpdateForm"),"文章项编辑","800px")}var r=0,a=null,o=null,c=null,d=null;$("#navMenu").kendoMenu({}),$("#panelWrapper").kendoPanelBar({expandMode:"multiple",select:function(e){switch(d=$(e.item),r=d.attr("panel-item-type")){case"0":break;case"1":a=d.attr("navId"),c=t.grid(null,n.columns.categories());break;case"2":o=d.attr("categoryId"),l($("#articleForm #categories"),$(d).siblings().andSelf()),$("#navIdInput").val(a);var u="/article/data?navId="+a+"&categoryId="+o,s={transport:{read:{url:u,dataType:"json",type:"get"},parameterMap:function(e,t){return e}},batch:!0,schema:{data:"articles",total:"total"}};t.grid(s,n.columns.articles(null,i))}}});var l=function(e,t){var n="";$.each(t,function(e,t){var t=$(t),i=t.attr("categoryId"),r=t.text();n+="<input type='checkbox' name='categoriesId[]' value="+i+">"+r}),e.html(n)};$("#toolbar").kendoToolBar({items:[{type:"button",text:"添加",id:"add"},{type:"button",text:"刷新",id:"refresh"}],click:function(e){if("add"==e.id)switch(r){case"0":t.window($("#navForm"));break;case"1":t.window($("#categoryForm"));break;case"2":l($("#articleForm #categories"),$(d).siblings().andSelf()),t.window($("#articleForm"),"添加文章","900px")}else $("#grid").data("kendoGrid").dataSource.read()}})}),require.config({paths:{manager:"./manager/index",config:"./manager/config",init:"./common/init",utils:"./common/utils"},shim:{manager:{deps:["css!./../css/reset.css","css!./../css/common.css","css!./../css/manager.css"]}},map:{"*":{css:"../lib/require/css.min.js"}}}),require(["./manager/index"],function(e){}),define("main",function(){});