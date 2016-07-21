# autoHeader
一个用于生成多层复杂表头的jquery插件,可以进行表头和数据的动态生成,动态筛选以及一定的统计分析功能

## 欢迎使用autoHeader插件

打开index.html即可查看示例列表。

在线演示地址:http://finira.oschina.io/autoheader

----------

**autoHeader**插件基于jquery开发，目前包含的功能有： 
 
1. 自动书写复杂多层表头以及表格数据  
2. 在界面中，基于表头进行数据的筛选
3. 对合计值、平均值、最大值、最小值进行附加显示以及比对（比对不包括合计值）  
4. 对结果集进行排序
5. 行序列号（支持正序、倒序）
6. 与预设值进行比较以及统计展示


插件的特性包含：  
1. **css无关性**：使用者可使用自定义的任何css来定义生成的内容外观  
2. **前后端分离性**：后端只需传送json格式数据（或者key：value格式的object对象）作为入参即可完成前端的一系列功能。  
3. **插件通用的易集成性**：与zTree树插件，HighCharts报表插件，tablesorter，bootstrap均能进行很好的集成使用，你可以在demo中看到相应的例子。

###当前版本：V1.1

------------------------


##浏览器支持
**IE（9+）**  
**Firefox（最新）**
**Chrome（最新）**
**Opera（最新）** 

---------------------------
##文件夹说明
- `src`：包括插件用到的各种资源和插件本身
- `example`：插件使用的具体例子，展示使用bootstrap。base：基础使用，extend：和其他插件的集成使用。


-----------

##使用方法
###插件的引入 
在页面中引入jquery文件以及本插件（jquery版本要求在1.6以上，1.6以下的版本无法支持prop属性）  

```<script src="../../src/js/jquery.min.js"></script>
<script src="../../src/js/jquery.autoHeader.all.js"></script>```

如果需要使用插件自带的css，请复制css目录下的style.css文件以及autoHimg图片文件夹到项目路径下，并且在页面中引入css文件：  
`<link rel="stylesheet" type="text/css" href="../../src/css/style.css">` 
 
(请分别更改为你项目中的实际地址）  
(插件提供了压缩版本，建议将jquery.autoHeader.all.js更换为jquery.autoHeader.min.js） 

---------------
###插件的使用

####1. 自动书写表头和数据功能  

####最简单的调用  
html：在你认定的位置，放置用于显示表头和数据的table  
`<table id="tabled" ></table>`  

js：在代码中，传入必要入参，执行init函数即可  

	   $.fn.autoHeader.init({
	   laynum:5,
	   startlay:1,
	   headJson:headstr,
	   dataJson:bodystr,
	   tableid:'tabled'});

*参数说明：*
>**laynum**：表头层数，插件默认为1，超过1层则需要自己设置  
>**startlay**:数据从哪层开始计入表头，默认为1  
>**headJson**：表头树的json数据（数据格式在下方说明）（key：value格式的object数据亦可，但是推荐使用json格式数据，之后不再进行说明）  
>**dataJson**：表格数据的json数据  
>**tableid**：放置表头和数据的表格id  

*headJson表头树数据结构说明：* **（首次使用必看）**


1. json数据中，必须包含层级、树形编号、是否叶子节点、表头节点名称、对应数据字段名这五个属性，可选属性有表头字段描述内容、字段css样式两个属性。
2. 这些属性对应的默认属性名为：层级（level）、树形编号（treeCode）、是否叶子节点（isleaf）、表头节点名称（name）、对应数据字段名（reportColumnName）以及表头字段描述内容（headDesc）、字段css样式（cssstyle）。
3. 属性名可根据实际情况更改，插件以入参形式提供了属性名更改的方式。具体操作方法可看**扩展调用**介绍说明。  
4. 表头树的书写顺序默认按照headJson的顺序正序书写。插件同时也提供了**排序功能**，按照表头树形编码从小到大进行排序，可按需开启，使用方法查阅**扩展调用**对应说明。

*表头样例数据解析说明：* **（首次使用必看）**  
一段表头样例数据：

    [{"cssstyle":"width:80px;height:50px;","headDesc":"表头描述","isleaf":"Y","level":"1","name":"表头名称","reportColumnName":"column1","treeCode":"1010"}]
其中：
>1. **level**：注明该表头节点的层级（从上至下），插件会综合startlay和level对表头数据进行筛选，比startlay数值小的数据不会写入到表头之中。
>2. **isleaf**：注明该节点是否为叶子节点，即直接与数据接触的节点，也就是最底层的表头。本属性值为‘Y’的数据将会被认定为是叶子节点。（在任何层级的节点均可成为叶子节点，插件会进行跨行展示）。
>3. **name**：表头节点名称，显示在表头单元格里的节点名称。
>4. **treeCode**：表头树形编码，该编码是插件的**核心解析**部分，插件根据编码进行上下级关系的解析。子表头的编码必须包含父表头的全部编码，每个表头的编码不可重复。例如中国编码为86，中国北京为8601，中国上海为8602，中国北京海淀区为860109，中国上海静安区为860203。以此类推，对编码大小和位数不做限制，符合树形编码规范即可。
>5. **reportColumnName**：对应数据json的属性名，与dataJson相关，叶子节点的表头需要书写该属性，其他则不需要。插件会根据属性名将数据和表头进行对应书写。
>6. **headDesc**：表头描述，选填字段，如果开启表头描述功能，则表头描述的内容会取此属性的值。
>7. **cssstyle**：表头自定义css样式，选填字段，**开启表头格式指定**并且该属性有值的话，表头的style属性会对应添加指定的css内容值。（某些特定的表头需要指定格式的情况之下考虑使用这个功能，普遍情况下推荐使用css文件）

*dataJson表格数据入参说明：* **（首次使用必看）**  
表格数据的属性名只需和表头树里的**reportColumnName**（该属性名可被更改）属性名对应即可。例表头树里的reportColumnName值为column1，表格数据json里需要有属性名为column1的值，表头对应列下才会有值。


####扩展调用

#####自定义表头树属性名  
插件提供了columConfig这个二级入参，用于自定义表头树的属性名。该入参包含的内容如下：  

    columConfig = {
    			'treecode': 'treeCode', 
    			'level': 'level',
    			'isleaf': 'isleaf',
    			'showname': 'name',
    			'desc': 'headDesc',
    			'datacolumn':'reportColumnName',
    			'thstyle': 'cssstyle'
    		}

如果表头数据里的属性名和默认的并不相同，那么便可以通过这个入参进行更改。例如层级属性名称为lvl，表头节点名称属性为viewname。那么，在调用init方法的时候传入**columConfig**入参即可进行修改：

    $.fn.autoHeader.init({
    laynum:5,
    startlay:1,
    headJson:headstr,
    dataJson:bodystr,
    tableid:'tabled',
    columConfig:{
    level:'lvl',
    showname:'viewname'
    }});
如需提高独立性，亦可将columConfig单独定义，之后进行传参（之后的代码举例说明将采取此方法，提高可阅读性）：

    var columConf={
    level:'lvl',
    showname:'viewname'
    }
    $.fn.autoHeader.init({
    laynum:5,
    startlay:1,
    headJson:headstr,
    dataJson:bodystr,
    tableid:'tabled',
    columConfig:columConf
    });



其他属性名的修改也与此相同，不再赘述，需要注意的是，表头树json里的属性名需要和自定义的属性名对应上

#####表头树排序功能
插件默认按照headJson的顺序正序书写，从上至下，从左到右。插件也提供了按照树形编码的排序功能，每个层级单独排序，默认按照编码从小到大进行排列。**即编码最小的，排在最左边**。
  
如果需要启用这个功能，只需将一级入参**needsort**设置为true即可。

    $.fn.autoHeader.init({
    laynum:5,
    startlay:1,
    headJson:headstr,
    dataJson:bodystr,
    tableid:'tabled',
    needsort:true
    });
  
#####css自定义功能
css自定义功能有两种方法，一种是直接在css内容中定义插件所使用的table等容器的格式，例如直接指定#tabled这个元素的css与下属元素的css内容：

    #tabled {text-align:center;}
    #tabled caption{}
    #tabled th{padding:5px;text-align:center; word-break: normal;}
    #tabled td{padding:5px 50px 5px 50px;text-align:center;white-space:nowrap;}
另一种是使用插件的二级入参：**cssConfig**
下方为二级入参的具体定义以及参数含义

	   cssConfig = {
	   				'table': '', //表格的class属性
	   				'caption':'', //表格标题的class属性
	   				'tr': '', //表头tr的class属性
	   				'th': '',//表头th的class属性
	   				'datatr':'',//数据行tr的class属性
	   				'td': ''//数据行td的class属性
	   			}

指定参数并且在init方法中传参之后，插件将会把指定的class属性赋值给对应的表格元素。

    var cssconfig={
    table:'tablecss',
    tr:'trcss'
    }
    $.fn.autoHeader.init({
    laynum:5,
    startlay:1,
    headJson:headstr,
    dataJson:bodystr,
    tableid:'tabled',
    cssConfig:cssconfig
    });

#####表头格式指定功能
如果某些表头需要特定的style格式，那么就可以开启该功能，并且在对应的表头节点数据里将style格式添加到cssstyle属性里（该属性名可修改，详情参见**自定义表头树属性名**）。  
该功能的开启只需指定一级入参thstyle为true即可。

    $.fn.autoHeader.init({
    laynum:5,
    startlay:1,
    headJson:headstr,
    dataJson:bodystr,
    tableid:'tabled',
    thstyle:true
    });

#####表头描述功能 
该功能用于有表头描述需要的场景，该功能以二级入参descConfig进行开启和配置。  
下方为二级入参descConfig的定义、默认值以及参数含义

    descConfig = {
    				'enable':false,//开启状态：默认为关闭
    				'desc_type':'div',//显示方式：可选方式有div、title。div在div处显示，title则会在th内容外包一层span，span的title置为描述值。默认为div
    				'd_target_id':'',//描述信息展示的容器：默认为空，即插件自动生成描述div。如指定描述的容器id，会将信息放入描述容器中.
    				//插件默认的容器，为里外两个div，可重新指定里外div的css格式
    				'css_out': 'descdivdefault_out',//外侧div的css
    				'css_in': 'descdivdefault_in',//里侧div的css
    				'css_title': 'ttitle',//描述的标题css
    				'css_content': 'content',//描述的内容css
    				'css_close': 'close',//关闭按钮的css
    				'showevent':'click',//弹出描述的事件
    				'hideevent':'',//关闭描述的事件
    				'position':'fly',//div显示位置 有absolute和fly两种状态 absolute：div的位置是绝对值，以x和y作为起点。fly：div的位置以鼠标作为起点，x和y为偏移量
    				'pos_x':10,//x位置
    				'pos_y':10,//y位置
    				'desc_th_class':'' //包含描述的表头th的class，如果有值，表头内容包含描述时，class属性将会由这个值覆盖。仅显示方式为div时有效
    			}

插件自带了一个半透明的div描述框来进行描述信息的展示，最简单的调用方式如下：

    var descConfig={
    enable:true
    }
    $.fn.autoHeader.init({
    laynum:5,
    startlay:1,
    headJson:headstr,
    dataJson:bodystr,
    tableid:'tabled',
    descConfig:descConfig
    });
插件会使用默认的半透明的div描述框来进行信息展示，单击事件触发描述框的显示。  

如果需要使用title的方式来展示描述，那么只需这样定义descConfig：

    var descConfig={
    enable:true,
    desc_type:'title'
    }
> 具体调用方法不再赘述

如果需要将描述信息展示到自定义的容器中（div，span等均可），那么只需指定d_target_id即可：

    var descConfig={
    enable:true,
    d_target_id:'tagrgetid'
    }
> tagrgetid为容器的id属性

如果需要更改插件自带描述div的css属性，下列入参可供指定挑选（可单独指定）：

    var descConfig={
    enable:true,
    css_out: 'your_out_css',//外侧div的css
    css_in: 'your_in_css',//里侧div的css
    css_title: 'your_title_css',//描述的标题css
    css_content: 'your_content_css',//描述的内容css
    css_close: 'your_close_css'//关闭按钮的css
    }

> 插件自带的描述div的css可以在demo里找到，是半透明效果的显示
> 
    .descdivdefault_out{ height: auto !important;height:300px;min-height:300px;padding:10px;position:absolute;display:none}
    .descdivdefault_in { background:	#d8f8c5;height:100%;overflow:auto;width:300px; position:absolute;color:#3b3b3b;border-radius: 5px; filter:alpha(Opacity=60);-moz-opacity:0.95;opacity: 0.95;position:absolute}
    .descdivdefault_in .close{float:right;cursor:pointer; color:#fff;margin:0px;}
    .descdivdefault_in .content{padding:10px;text-indent:2em; line-height:1.5; padding-bottom:1em;font-size:12px;}
    .descdivdefault_in .ttitle{height:30px;background:#6fce37;color:#fff;line-height:30px;padding:0 10px;font-size:14px;}

如果需要更改描述框出现和消失的事件，指定对应的showevent和hideevent参数即可（可单独指定）：

    var descConfig={
    enable:true,
    showevent:'click',//弹出描述的事件
    hideevent:'mouseout'//关闭描述的事件
    }

> 事件均绑定在th元素中

如需更改描述框的显示方式和显示位置，那么可以使用下列入参：

    var descConfig={
    enable:true,
    position:'fly',//div显示位置 有absolute和fly两种状态 absolute：div的位置是绝对值，以x和y作为起点。fly：div的位置以鼠标作为起点，x和y为偏移量
    pos_x:10,//x位置
    pos_y:10//y位置
    }

如果需要将有描述的表头元素和没有描述的表头元素区分开来，那么可以使用desc_th_class参数，该参数指定之后，有描述的表头节点的class将会被置为desc_th_class指定的内容：

    var descConfig={
    enable:true,
    desc_th_class:'got_desc'
    }
> 该功能仅显示方式为div时有效

#####debug性能测试模式 
该功能可用于测试插件的页面数据填充速度（页面填充速度与计算机配置以及浏览器性能有关），该功能有三个相关一级参数：

    'debug':false,//debug模式 会输出数据生成等信息值
    'outspanid':'',//debug输出模式下输出信息的元素 id 信息会书写到这个元素中。一般是span
    'datamulti':0,//测试书写性能的数据，如果开启了debug模式，数据包将会进行翻倍书写，倍数为此值

使用方法类似其他功能：

    $.fn.autoHeader.init({
    laynum:5,
    startlay:1,
    headJson:headstr,
    dataJson:bodystr,
    tableid:tabled,
    datamulti:30,
    debug:true,
    outspanid:'datev'
    });
> 开启debug模式，数据循环30倍书写，并且最后将耗时信息输出到id为datev的元素下。  


--------------------
####2. 基于表头的数据筛选功能  
严格来说，这并不能算是插件的自带功能，因为它的调用接口和生成的接口一样，都是init方法，你只需要重新传入一段过滤之后的headJson即可实现类似页面查询过滤的功能，dataJson的过滤也是同理。可以在demo中看到具体实现方法。

    $.fn.autoHeader.init({
    laynum:5,
    startlay:1,
    headJson:newheadstr,
    dataJson:newbodystr,
    tableid:tabled
    });

> 为什么将这个功能独立起来，因为基于表头的类似excel的勾选功能在插件的设计内容中，该功能可提高用户的感知度和使用流畅感，遗憾的是该功能目前仍处于建设阶段。

--------------------
####3. 统计以及比对功能  
目前包括合计值、平均值、最大值、最小值的显示以及平均值、最大值、最小值与数据行的比对。  
该功能使用anaLyz方法进行调用，调用方式如下：

    $.fn.autoHeader.anaLyz({
    baseJson:bodyjson,
    anatype:'avg',
    tableid:'tabled',
    digit:2});

具有两个二级参数，一个一级参数，可在参数说明中具体查看。

> 统计分析功能针对不同类型的通用性很高，入参具体通用配置将会放在类型之后进行说明。

####合计值
#####合计值统计
调用anaLyz方法，注明anatype值为all即可。

    $.fn.autoHeader.anaLyz({
    baseJson:bodyjson,
    anatype:'all',
    tableid:'tabled',
    digit:2});
> 合计值没有比对功能

####平均值
#####平均值统计
调用anaLyz方法，注明anatype值为avg：

    $.fn.autoHeader.anaLyz({
    baseJson:bodyjson,
    anatype:'avg',
    tableid:'tabled',
    digit:2});

#####平均值比对 
可将页面上数据与平均值进行比较，比平均值大的会使用向上箭头，小的则是向下箭头。箭头css可以自定义。

    var compare={
    'enable':true,//比对开关，默认为关闭
    'followelmt':'span',//跟在td数据后方的标签，默认为span
    'elmthtml':'',//跟在td数据后方的标签的html
    'upclass':'moreThanSpan',//比比对数值大的css
    'lowclass':'lessThanSpan',//比比对数值小的css
    'eqclass':'equalToSpan'//于比对数值相同的css
    }
    
    $.fn.autoHeader.anaLyz({
	anaJson：anajson
    baseJson:basejson,
    anatype:'avg',
    tableid:'tabled',
    digit:2,
    compare:compare
    });
> 如果不需要自定义在后方的标签css，compare的入参只需需定义enable为true即可。  
> 如果不配置baseJson，则默认以anaJson为基准进行比较。有两个json参数的应用场景是比对数据与基准数据有区别的情况：例页面上筛选只剩两条数据，而平均值比对则需要与之前加载来的十条数据的平均值进行比对。  
> 其他比对功能入参情况与此相同，不再赘述。

####最大值
#####最大值统计  
调用anaLyz方法，注明anatype值为max：

    $.fn.autoHeader.anaLyz({
    baseJson:bodyjson,
    anatype:'max',
    tableid:'tabled',
    digit:2});

#####最大值比对 
可将页面上数据与最大值进行比较，与最大值持平的使用右向箭头。箭头css可以自定义。


    var compare={
    'enable':true//比对开关，默认为关闭
    }
    
    $.fn.autoHeader.anaLyz({
	anaJson：anajson
    baseJson:basejson,
    anatype:'max',
    tableid:'tabled',
    digit:2,
    compare:compare
    });

####最小值
#####最小值统计
调用anaLyz方法，注明anatype值为min：

    $.fn.autoHeader.anaLyz({
    baseJson:bodyjson,
    anatype:'min',
    tableid:'tabled',
    digit:2});

#####最小值比对   
可将页面上数据与最小值进行比较，与最小值持平的使用右向箭头。箭头css可以自定义。


    var compare={
    'enable':true//比对开关，默认为关闭
    }
    
    $.fn.autoHeader.anaLyz({
	anaJson：anajson
    baseJson:basejson,
    anatype:'min',
    tableid:'tabled',
    digit:2,
    compare:compare
    });


--------------------
####4. 排序功能  
排序功能集成了`tablesorter`插件，只需在表格初始化时在对应的配置中进行设置即可。

	$.fn.autoHeader.init({
	        laynum:5,
	        headJson:headstr,
	        dataJson:bodystr,
	        tableid:'tabled',
	        needsort:true,
	        columConfig:{
	            level:'lvl',
	            showname:'viewname'
	        },
	        cssConfig:{
	            table:' table-hover  table-striped table-bordered table-responsive',
	            tr:''
	        },
	        sort:{
	            enable:true,
	            rank:1,
	            theme:"bootstrap",
	            debug:0,
	        }
	    });
其中，`sort`参数便是排序的设置参数，具体配置作用可查看最下方的参数说明。
> 排序插件在初始化时略消耗资源


--------------------
####5. 行序列号功能  
功能开启后，将会在对应列显示按照指定配置顺序进行排列的行序列号。
在使用init方法时，配置`serial`参数即可对行序列号功能进行配置。

	serial={
	'enable':true, //是否开启
	'type':'inverse', //序号排序方式 nochange排序后不变 inverse跟随排序方式进行上下倒转排序
	'inverseOrder':'asc',//如果排序方式是inverse，就需要指定倒转的排序类型，asc或者desc
	'order':'asc', //默认顺序 从大往小desc，或者从小往大asc
	'serialColumnName':'排名',//序列号列名
	'serialColumnIndex':0  //序列号列位置
	}
序列号在排序时可保持不变，或者跟随行数据而动。


--------------------
####6. 预设值比对功能  
该功能可以根据表头预设的比对公式，对数据进行比对计算，将计算后的结果以色块覆盖的形式进行展示，并且也可同时进行统计分析。
#####比对数值对象
目前比对的数值对象支持绝对数值（如100）和其他列（插件将会动态获取同一行中对应列的数值）
#####比对公式
比对公式目前支持基础运算符和数学表达式，一个公式的条件只能是一个表达式，一个表头可以有多个公式。
#####比对公式的默认配置
公式默认使用英文分号（;）作为分隔符，使用英文逗号（,）作为单个公式里条件和结果的分隔符，使用英文井号（#）作为字段指代标识符（该符号后的连续字符串会被认作为表头对应列名），使用{this}作为本体指代标识符，用于指代本表头列。
这些配置可以通过修改`transcp`参数下的`listDivide、conditionDivide、columnReference、selfReference`进行自定义。
#####比对公式示例
- 值小于100则为红色：`<100,red`
- 值小于col列则为红色：`<#col,red`
- 值超过col列的一半则为红色：`>#col*0.5,red`
- 值介于90和100之间则为红色：`90<{this}<100,red`
- 值介于90和100之间则为红色，小于90为黄色：`90<{this}<100,red;<90,yellow`
#####比对的使用
使用`transCompare`方法即可开启：

	$.fn.autoHeader.transCompare({anaJson:currentJson,baseJson:bodyjson,tableid:'tabled'});
必须指定的参数为：
- `anaJson` 进行比对的数据
- `baseJson`被比对的基础数据，如果为空，则默认等于`anaJson`
- `tableid`比对后数据的输出表格id
#####比对的描述配置
修改`transcp`参数下的`titleConfig`和`clzConfig`可以进行比对统计标题和对应css的配置：

	'titleConfig':{'red':'不合格','yellow':'警告'}, //比对统计标题的配置，将会根据此配置显示统计的标题，如果没有设置，将会默认使用表头配置里的字符作为标题（如red）
	'clzConfig':{'red':'lever2','yellow':'lever1'},  //比对css的配置，即不同的比对结果，td显示不同的css（背景色等设置）
>插件设置的默认值为不合格和警告，如需自定义，只需修改参数即可。

#####比对的统计
该功能可以根据行维度统计每行数据符合比对公式的总计数量，如第一行数据总共有多少不合格，多少警告。
如果开启数据明细筛选，将会根据触发机制，在总表的每个单元格绑定事件，进行有问题数据列的筛选。（如点击某结果的不合格项，明细表只显示该结果的不合格列和数据）
该功能通过配置`transCountCp`参数进行开启和配置（在使用`transCompare`方法时）。

	transCountCp ={
	'enable':true, //统计表格是否开启，默认为true
	'tgtTableId':'tabledcnt', //展示统计表格数据的容器id
	'table':' table-hover  table-striped table-bordered table-responsive',//表格的css
	'caption':'分析统计结果', //表格标题
	'captionstyle':'',//标题格式css
	'title':'类型/单位', //统计表格的标头，显示在表格左上角区域
	'rowcol':'rep_org_name', //数据行单位的标示字段名，标明该行数据归属的说明，将会横向成为统计表格的表头
	'switchenable':true,//统计表格数据关联明细表数据筛选功能是否开启。
	// 如果开启，将会根据触发机制，在总表的每个单元格绑定事件，进行有问题数据列的筛选。（如点击某结果的不合格项，明细表只显示该结果的不合格列和数据）
	'switchevent':'click'//触发事件，默认为单击
	}

####通用功能
#####表格的css配置  
插件提供了一个二级入参cssConfig，如果在调用init方法的时候指定了这个参数，那么在比对的时候也必须指定这个参数，值同init方法时的入参。
> 比对时会重写表格数据，所以如果定义过了cssConfig，这里就需要也传入一次。

#####比对标签css配置
插件亦提供了比对标签的css自定义功能，使用二级入参compare的相关参数即可进行修改。

	compare={
    'followelmt':'span',//跟在td数据后方的标签，默认为span
    'elmthtml':'',//跟在td数据后方的标签的html
    'upclass':'moreThanSpan',//比比对数值大的css
    'lowclass':'lessThanSpan',//比比对数值小的css
    'eqclass':'equalToSpan'//于比对数值相同的css
    }

> 比对之后的td默认内容为
> `<td>value<span class="moreThanSpan"></span></td>`

#####返回类型配置 
以一级参数returntype指定，默认为this，即返回插件本身，可供链式调用。可选参数为list，这种情况下插件会根据anatype类型，返回对应的比对结果的一维数组。

#####小数保留位数配置  
以一级参数digit指定，默认为0，多用于平均值。

#####自定义抬头描述配置功能 
以descenable等相关参数指定：  

    'descenable':true,//抬头描述开关，默认开启
    'descstr':'',//生成的比对数据的抬头，例合计值 平均值 最大值 等，可自定义输入
    'desccol':0 ,//数据的抬头对应的列位置，默认为0，即第一列

#####书写位置的配置
以writepos参数指定，默认为after，在所有数据之后添加。可选参数before，在所有数据之前添加。

#####统计值css自定义功能  
插件提供了统计值行的css自定义功能，应用场景：统计值行需要与数据行的格式有区别。配置下列参数即可：

	trclass:'',//生成的tr的class
	tdclass:'',//生成的td的class  


##参数说明
这段内容列举了插件的可用参数定义以及默认值


----------


###书写部分

	//列配置参数
	colConfig = {
		'treecode': 'treeCode', //表头树形编码
		'level': 'level',//表头节点的层级
		'isleaf': 'isleaf',//是否为叶子节点
		'showname': 'name',//表头节点名称
		'desc': 'headDesc',//表头描述
		'datacolumn':'reportColumnName',//对应数据json的属性名
		'thstyle': 'cssstyle'//表头自定义css样式
	}

	//表头描述配置
	descConfig = {
		'enable':false,//开启状态：默认为关闭
		'desc_type':'div',//显示方式：可选方式有div、title。div在div处显示，title则会在th内容外包一层span，span的title置为描述值。
		'd_target_id':'',//描述信息展示的容器：默认为空，即插件自动生成描述div。如指定描述的容器id，会将信息放入描述容器中.
		//插件默认的容器，为里外两个div，可重新指定里外div的css格式
		'css_out': 'descdivdefault_out',//外侧div的css
		'css_in': 'descdivdefault_in',//里侧div的css
		'css_title': 'ttitle',//描述的标题css
		'css_content': 'content',//描述的内容css
		'css_close': 'close',//关闭按钮的css
		'showevent':'click',//弹出描述的事件
		'hideevent':'',//关闭描述的事件
		'position':'fly',//div显示位置 有absolute和fly两种状态 absolute：div的位置是绝对值，以x和y作为起点。fly：div的位置以鼠标作为起点，x和y为偏移量
		'pos_x':10,//x位置
		'pos_y':10,//y位置
		'desc_th_class':'' //包含描述的表头th的class，如果有值，表头内容包含描述时，class属性将会由这个值覆盖。仅显示方式为div时有效
	}

	//自定义格式配置
	cssConfig = {
		'table': '',
		'caption':'',
		'tr': '',
		'th': '',
		'datatr':'',
		'td': ''
	}
	//表格排序设置 使用tablesort插件 会影响加载速度，不需要的情况下关闭即可 add by v1.1
	//配置同tablesort插件的配置
	sort={
		'enable':false, //是否开启
		'headerTemplate' : '{content} {icon}',
		'rank':false, //当前实时排名是否开启
		'widgets' : [ "uitheme"], //外观主题
		'sortInitialOrder': 'desc',//初始排序顺序
		'rankdesc':'当前排名:' //排名描述
	},

	//行序列号功能 V1.1
	serial={
		'enable':true, //是否开启
		'type':'inverse', //序号排序方式 nochange排序后不变 inverse跟随排序方式进行上下倒转排序
		'inverseOrder':'asc',//如果排序方式是inverse，就需要指定倒转的排序类型，asc或者desc
		'order':'asc', //默认顺序 从大往小desc，或者从小往大asc
		'serialColumnName':'排名',//序列号列名
		'serialColumnIndex':0  //序列号列位置
	},

	//一级参数，默认配置
	defaults = {
		'laynum': 1, //层数 必填
		'startlay':1,//从哪层开始 默认为1 即lvl=1的数据开始
		'headJson': null,//表头数据 必填
		'dataJson': null,//内容数据 必填
		'caption':'',//表格名称
		'debug':false,//debug模式 会输出数据生成等信息值
		'outspanid':'',//debug输出模式下输出信息的span id 信息会书写到这个span下。
		'datamulti':0,//测试书写性能的数据，如果开启了debug模式，数据包将会进行翻倍书写，倍数为此值
		'tableid': 'tableid',//表格识别符
		'needsort':false,//是否需要排序，默认为false，排序的话会增加时间消耗
		'thstyle':false,//th表头的附带css是否需要激活，默认为false
		'descConfig': this.descConfig,//描述框配置
		'colConfig': this.columConfig, //列名配置，根据配置的列名读取json里的属性字段进行一一对应
		'cssConfig': this.cssConfig //css自定义配置，若不指定，则使用默认的配置
	}

###统计分析部分

	//css配置，进行值比对时所用，如果在init时候指定了cssConfig入参，此处的配置应当同init时的配置
    cssConfig = {
		'tr': '',
		'th': '',
		'datatr':'',
		'td': ''
		}
    
    //比对的配置
    compare={
		'enable':false,//比对开关，默认为关闭
		'followelmt':'span',//跟在td数据后方的标签，默认为span
		'elmthtml':'',//跟在td数据后方的标签的html
		'upclass':'moreThanSpan',//比比对数值大的css
		'lowclass':'lessThanSpan',//比比对数值小的css
		'eqclass':'equalToSpan'//于比对数值相同的css
		}
    
    //默认配置
    default = {
		'anaJson':null,//需要进行比较分析的内容数据
		'baseJson': null,//进行比较分析的基准数据，如果为空，则默认等于anaJson，如果有指定，则按指定值来。（用于在进行比价分析时，内容数据不等于基准数据的场景，如内容只显示两条数据，但是需要比对所有十条数据的平均值）
		'tableid': 'tableid',//表格id 同init方法时的表格id
		'anatype':'', //分析类型 ，平均值avg 最大值max 最小值min 合计值all 等
		'returntype':'this',//返回类型，可返回list：数据比对的结果list，默认为返回this字符，在插件入口处进行判断，是否返回插件自身
		'digit':0 ,//小数保留位数，默认为0
		'descenable':true,//抬头描述开关，默认开启
		'descstr':'',//生成的比对数据的抬头，例如 合计值 平均值 最大值 等，可以被用户自定义
		'desccol':0 ,//数据的抬头对应的列位置，默认为0，即第一列
		'writetotable':true,//是否需要写到表格中去，默认开启
		'writepos':'after', //写到表格中对于table tbody的位置，默认为after，可选参数before，为所有数据之前
		'trclass':'',//生成的tr的class
		'tdclass':'',//生成的td的class
		'compare':this.compare, //比对的配置
		'cssConfig':this.cssConfig //css配置
		}
	//预设值比对的配置，V1.1版本新增
	transcp={
		'titleConfig':{'red':'不合格','yellow':'警告'}, //比对统计标题的配置，将会根据此配置显示统计的标题，如果没有设置，将会默认使用表头配置里的字符作为标题（如red）
		'clzConfig':{'red':'lever2','yellow':'lever1'},  //比对css的配置，即不同的比对结果，td显示不同的css（背景色等设置）
		'listDivide':';', //比对条件的列表分隔符，插件会按照该分隔符将比对字符串分割成几个不同的结果列表，类似 大于10,红色;小于10,黄色
		'conditionDivide':',', //单条比对数据的条件和结果分隔符，前方为条件，后方为结果 ，类似 大于10,红色
		'columnReference':'#', //字段指代标识符，该符号标识的内容，将会通过通过之后跟随的字段名去获取对应数值进行比对
		'selfReference':'{this}', //本体指代标识符，不可与其他字段名重复，将会使用本体值替换该内容进行比较 目前支持a>this>b a<this<b格式
		'count':true, //是否开启总数统计，默认为false
		'd_target_id':'',//描述信息展示的容器：默认为空，即插件自动生成描述div。如指定描述的容器id，会将信息放入描述容器中.
		'css_out': 'descdivdefault_out',//外侧div的css
		'css_in': 'descdivdefault_in',//里侧div的css
		'css_title': 'ttitle',//描述的标题css
		'css_content': 'content',//描述的内容css
		'css_close': 'close',//关闭按钮的css
		'showevent':'click',//弹出描述的事件
		'hideevent':'',//关闭描述的事件
		'position':'fly',//div显示位置 有absolute和fly两种状态 absolute：div的位置是绝对值，以x和y作为起点。fly：div的位置以鼠标作为起点，x和y为偏移量
		'pos_x':-100,//x位置
		'pos_y':0,//y位置

	},
	//预设值比对的统计表格设置，V1.1版本新增
	transCountCp ={
		'enable':true, //统计表格是否开启，默认为true
		'tgtTableId':'tabledcnt', //展示统计表格数据的容器id
		'table':' table-hover  table-striped table-bordered table-responsive',//表格css
		'caption':'分析统计结果', //表格标题
		'captionstyle':'',//标题格式css
		'title':'类型/单位', //统计表格的标头，显示在表格左上角区域
		'rowcol':'rep_org_name', //数据行单位的标示字段名，标明该行数据归属的说明，将会横向成为统计表格的表头
		'switchenable':true,//统计表格数据关联明细表数据筛选功能是否开启。
		// 如果开启，将会根据触发机制，在总表的每个单元格绑定事件，进行有问题数据列的筛选。（如点击某数据的警告项，明细表只显示该单位的警告列和数据）
		'switchevent':'click'//数据筛选触发事件，默认为单击

	},

##License
与jquery相同 - MIT

##更新日志

###V1.1

- 排序功能
- 行序列号功能
- 预设值比对分析

   *2016-5-1*
###V1.0

- 表格生成功能
- 表头动态筛选
- 基础统计分析

	*2016-2-26*

##展望功能

- 根据复杂表头生成输入框功能
- 过长表头的折叠功能
