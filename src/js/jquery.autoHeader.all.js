/**
 * JQuery complex multi header auto write header and rowdata V1.1.1
 * 实现自动书写复杂树状表头以及表格数据的插件,并且具备一定的数据分析功能
 *
 * Copyright (c) 2016 Finira
 *
 * Licensed same as jquery - MIT License
 * http://www.opensource.org/licenses/mit-license.php
 *
 * V1.1.1 updated 2016-7-21 fix bugs and code issues
 *
 * V1.1 updated 2016-3-9
 *
 * FirstEditDate: 2016-02-2
 */

;(function($,window,document,undefined) {

	//记录各层级数据的三维数组
	var headerList = [];
	//记录叶子节点的数组
	var leafList = [];

	//统计分析的数组，用于记录横向预设值比对的统计数据
	var anaList = [];

	//书写数量统计的临时变量
	var trcount=0;

	//jquery版本是否大于1.7
	var morethan17 = true;

	//排序开启
	var sortconf = {};

	//数据格式化的字符串
	var elmtstr = '<{0} {1}>{2}</{0}>',
		propstr = ' {0}="{1}" ';
	//序列化行
	var serial = {};



	/**
	 * 表格生成模块
	 * @param opt
	 * @constructor
	 */
	var TheTable = function(opt){
		//列配置参数
		this.columConfig = {
			'treecode': 'treeCode', //表头树形编码
			'level': 'level',//表头节点的层级
			'isleaf': 'isleaf',//是否为叶子节点
			'showname': 'name',//表头节点名称
			'desc': 'headDesc',//表头描述
			'datacolumn':'reportColumnName',//对应数据json的属性名
			'thstyle': 'cssstyle',//表头自定义css样式
			'transcomp':'transcomp' //横向比对配置名，1.1版本新增
		},
			//表头描述配置
			this.descConfig = {
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
			},
			//自定义格式配置
			this.cssConfig = {
				'table': '',
				'caption':'',
				'tr': '',
				'th': '',
				'datatr':'',
				'td': ''
			},
			//表格排序设置 使用tablesort插件 会影响加载速度，不需要的情况下关闭即可 add by v1.1
			//配置同tablesort插件的配置
			this.sort={
				'enable':false, //是否开启
				'headerTemplate' : '{content} {icon}',
				'rank':false, //当前实时排名是否开启
				'widgets' : [ "uitheme"], //外观主题
				'sortInitialOrder': 'desc',
				'rankdesc':'当前排名:' //排名描述
			},

			//行序列号功能 V1.1
			this.serial={
				'enable':1, //是否开启
				'type':'inverse', //序号排序方式 nochange排序后不变 inverse跟随排序方式进行上下倒转排序
				'inverseOrder':'asc',//如果排序方式是inverse，就需要指定倒转的排序类型，asc或者desc
				'order':'asc', //默认顺序 从大往小desc，或者从小往大asc
				'serialColumnName':'排名',//序列号列名
				'serialColumnIndex':0  //序列号列位置
			},

			//一级参数，默认配置
			this.defaults = {
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
				'sort':this.sort, //排序配置
				'serial':this.serial, //行序列号功能
				'colConfig': this.columConfig, //列名配置，根据配置的列名读取json里的属性字段进行一一对应
				'cssConfig': this.cssConfig //css自定义配置，若不指定，则使用默认的配置
			},
			this.tablestr={
				'prefix':'autohead_',
				'split':'\:<br/>',
				'caption':'caption',
				'head':'thead',
				'body':'tbody',
				'tr':'tr',
				'th':'th',
				'td':'td',
				'span':'span',
				'div':'div',
				'class':'class',
				'id':'id',
				'border':'b',
				'name':'name',
				'desc':'desc',
				'style':'style',
				'cols':'colspan',
				'rows':'rowspan',
				'title':'title',
				'elmtstr':'<{0} {1}>{2}</{0}>',
				'propstr':' {0}="{1}" ',
				'closespan':'<span class="{0}"><b>&times;</b></span>',
				'morethan17':true,
				'debuginfo':'数据列数为{0}，数据量为{1}条，总共消耗时间为：{2}毫秒，表头生成消耗时间为{3}毫秒。'
			};
			//入参复制，因为入参为树状结构，使用深度拷贝
			this.options = $.extend(true,{}, this.defaults, opt);
			//初始化jquery版本
			this.initJqversion();
	};

	TheTable.prototype = {

		/**
		 * 初始化获得jquery的版本并且放入常量中
		 */
		initJqversion:function() {
			var vers = $.fn.jquery.replace(/[.]/g,"");
			if(Number(vers)<Number('1.7.0'.replace(/[.]/g,""))){
				this.tablestr.morethan17=false;
				morethan17 = false;
			}
		},

		/**
		 * 初始化展示表格入口，调用各个初始化方法
		 */
		initTable: function () {
			var datestart=new Date();
			this.initVarible();
			var table = $("#" + this.options.tableid);
			this.initTableHeader(table);
			var dateheader=new Date();
			this.initTableData();
			var dateend=new Date();
			var date3=dateend.getTime()-datestart.getTime();
			var date4 = dateheader.getTime()-datestart.getTime();
			this.options.debug &&
			$("#"+this.options.outspanid).html(this.tablestr.debuginfo.format(leafList.length,trcount,date3,date4));
			//开启序列号，就书写序列号add by v1.1
			serial.enable && this.initSerial(table);
			//如果开启排序，就初始化排序（继承tablesorter的配置参数直接传入） add by v1.1
			this.options.sort.enable && this.initSort(table);

		},
		/**
		 * 初始化序列号
		 * @param table
		 */
		initSerial:function(table) {
			generateIndexHeader(table, serial.serialColumnName, this.options.laynum,serial.serialColumnIndex);
			generateIndex(table,serial.serialColumnIndex);
			//将序列号设置为不可排序
			this.options.sort.headers = {0:{sorter:false}};

		},
		/**
		 * 初始化排序
		 */
		initSort:function(table) {

			table.tablesorter(this.options.sort);
			//刷新一次 应对有表格重新生成的情况
			table.trigger("updateAll");
			//开启当前排名
			generateRank(table);
			//监控排序开始以及完成函数，生成当前排名
			table.bind("sortEnd",function(){
				//获取当前排序方式 赋值到sortconf变量中
				sortconf.corder = $.tablesorter.getCurrentOrder();
				//生成 title形式的排名
				generateRank(table);
				//根据序列号排序方式，刷新序列号
				refreashBodyIndex(table,serial.serialColumnIndex);
			});
		},
		/**
		 * 初始化本地变量
		 */
		initVarible:function() {
			headerList = [];

			leafList = [];

			anaList = [];

			trcount=0;

			serial = this.options.serial;
			sortconf = this.options.sort;
		},
		/**
		 * 初始化表头
		 */
		initTableHeader:function(table) {

			this.initTableElement(table);
			this.readHeaderLeafList();
			this.initHeaderList();
			this.writeHeader(table,headerList);
			this.initDescDiv(table);

		},
		/**
		 * 初始化表格数据
		 */
		initTableData:function() {
			this.writeTableData();
		},
		/**
		 * 书写表格数据的方法
		 */
		writeTableData: function () {
			if(leafList.length>0){
				//如果配置信息里的数据是需要排序的话，那么这里的叶子节点数组也需要根据code进行排序
				this.options.needsort && this.sortArray(leafList);
				var $this = this;
				//循环遍历数据json
				var trall = '';
				$.each(this.options.dataJson, function (i, item) {
					if(item){
						var tdall = '';
						for(var idx=0;idx<leafList.length;idx++) {
							//循环leaflist，获取对应字段名，然后在json数据里找到对应的值
							var vlue =$this.readObjDymValue(item, leafList[idx][2])||'';
							//拼装td字符串，并且加到tdall的变量中去
							var opt = $this.options.cssConfig.td ? [[$this.tablestr.class,$this.options.cssConfig.td]] : [];
							tdall += $this.formatElementStr($this.tablestr.td,opt,vlue);
						}
						//封装tr字符串，并且添加到trall的变量中
						var optr = $this.options.cssConfig.datatr ? [[$this.tablestr.class,$this.options.cssConfig.datatr]] : [];
						trall += $this.formatElementStr($this.tablestr.tr,optr,tdall);
						trcount++;
					}
				});
				//如果是调试模式，tr根据数量配置进行对应的翻番
				if(this.options.debug && this.options.datamulti>0){
					var trtmp = trall ;
					trcount = trcount * this.options.datamulti;
					trall = Array(this.options.datamulti+1).join(trtmp);
				}
				//采取一次书写的方法，减少时间消耗 使用id查找，提高查找效率
				$('#'+this.tablestr.prefix+this.tablestr.body).append(trall);
			}
		},
		/**
		 * 生成表头对应的输入框
		 */
		/*initInputBody:function(table) {
			var $this = this;
			//循环leafList生成输入框
			$.each(leafList, function (i, item) {

			});
		},*/

		/**
		 * 根据传入的table对象进行thead,tbody的书写,并且在thead上根据层数增加对应的tr行
		 * @param table
		 */
		initTableElement: function (table) {
			//初始化table，清除元素
			table.empty();

			//如果存在table的class就设置table的class
			this.options.cssConfig.table && table.prop(this.tablestr.class, this.options.cssConfig.table);
			//存在表格名称则赋值表格名称
			this.options.caption && table.append(this.formatElementStr(this.tablestr.caption, [[this.tablestr.class, this.options.cssConfig.caption||'']],this.options.caption));
			//增加thead，如果不存在 generate head if not exists
			table.find(this.tablestr.head).length == 0 &&
			table.append(this.formatElementStr(this.tablestr.head, [[this.tablestr.id,this.tablestr.prefix+this.tablestr.head]]));

			//生成tbody，如果不存在 generate body if not exists
			table.find(this.tablestr.body).length == 0 &&
			table.append(this.formatElementStr(this.tablestr.body, [[this.tablestr.id,this.tablestr.prefix+this.tablestr.body]]));

		},
		/**
		 * 根据层级数量，读取每个层级的数据到对应的数组中去，并且放入headerList中保存
		 */
		initHeaderList: function () {
			for (var lever = this.options.startlay; lever < this.options.startlay+this.options.laynum; lever++) {
				headerList.push([]);
				this.readHeaderJsonToLevelList(lever);
			}
		},
		/**
		 * 循环json数据，读取表头节点的叶子节点对象，并且放入leafList数组中
		 */
		readHeaderLeafList: function () {
			var $this = this;//定义变量指向，循环中this指向会变化，无法正确引用
			$.each(this.options.headJson, function (i, item) {
				if (item.isleaf == 'Y') {
					var leaf = [$this.readObjDymValue(item, $this.options.colConfig.treecode),
						$this.readObjDymValue(item, $this.options.colConfig.showname),
						$this.readObjDymValue(item, $this.options.colConfig.datacolumn),
						$this.readObjDymValue(item, $this.options.colConfig.transcomp)];
					leafList.push(leaf);
				}
			});
		},
		/**
		 * 读取json的分层级数据，并且把数据放入各自层级的数组中
		 * @param level
		 */
		readHeaderJsonToLevelList: function (level) {
			var $this = this;//定义变量指向，循环中this指向会变化，无法正确引用
			$.each(this.options.headJson, function (i, item) {
				if(item){
					var lvl = $this.readObjDymValue(item, $this.options.colConfig.level);
					if (lvl == level) {
						var code = $this.readObjDymValue(item, $this.options.colConfig.treecode),
							isleaf = $this.readObjDymValue(item, $this.options.colConfig.isleaf),
							showname = $this.readObjDymValue(item, $this.options.colConfig.showname);
						var optionList = [];
						//增加id的书写
						optionList.push([$this.tablestr.id, code]);
						//增加th的class的书写，如果有配置
						$this.options.cssConfig.th && optionList.push([$this.tablestr.class, $this.options.cssConfig.th]);
						//判断是否叶子节点，进行不同的属性处理
						if (isleaf == 'Y') {
							//如果是叶子节点并且层级并非最下面一级，那么就需要增加rowspan属性
							$this.options.laynum > lvl && optionList.push([$this.tablestr.rows, $this.options.laynum + 1 - lvl]);

						} else {//如果 不是叶子节点，就需要读取子节点的数量，并且书写colspan属性
							var col = $this.readLeafCount(code,leafList);
							optionList.push([$this.tablestr.cols, col == 0 ? 1 : col]);
						}
						//如果描述启用并且能读取到描述字段，即加入描述的属性的书写
						if($this.options.descConfig.enable && $this.readObjDymValue(item, $this.options.colConfig.desc)){
							var descstr = $this.readObjDymValue(item, $this.options.colConfig.desc)||'';
							//如果启用了描述，并且类型为title的话，就在名字外面包一层span标签
							if($this.options.descConfig.enable && $this.options.descConfig.desc_type=='title'){
								showname =$this.formatElementStr($this.tablestr.span,[[$this.tablestr.title,descstr]],showname);
							}else{
								optionList.push([$this.tablestr.desc, descstr]);
							}
						}

						//如果th标头的style配置为true，需要进行加入描述，那么就在th中加入style的属性，值为json里取得的值
						$this.options.thstyle && optionList.push([$this.tablestr.style, $this.readObjDymValue(item, $this.options.colConfig.thstyle)]);

						//加入到headerList大家庭中
						headerList[level - $this.options.startlay].push([code, $this.formatElementStr($this.tablestr.th, optionList, showname)]);
					}
				}
			});
		},
		/**
		 * 读取下属叶子节点数量的方法 到叶子节点列表中去遍历
		 * @param treecode
		 * @param leafList
		 * @returns {number}
		 */
		readLeafCount: function (treecode,leafList) {
			var rCount = 0;
			$.each(leafList, function (leaf, lea) {
				isStartWith(lea[0], treecode) && rCount++;
			});
			return rCount;
		},
		/**
		 * 书写表头的方法
		 * @param table
		 * @param headerList
		 */
		writeHeader: function (table,headerList) {
			if (headerList.length >= 0) {
				var headtr = '';
				for (var lever = 0; lever < this.options.laynum; lever++) {
					var array = headerList[lever];
					var headtd = '';
					//如果需要排序，那就进行一次排序，按照treecode，即第一个元素进行升序排序
					this.options.needsort && this.sortArray(array);
					//开始书写th
					for (var al = 0; al < array.length; al++) {
						//打包td信息
						headtd+= array[al][1];
					}
					//根据打包的td信息生成tr信息并且一起打包到headtr
					var optr = this.options.cssConfig.tr ? [[this.tablestr.class, this.options.cssConfig.tr]]:[];
					headtr+=  this.formatElementStr(this.tablestr.tr, optr,headtd);
				}
				//书写组装完毕的表头信息  使用id查找，提高查找效率
				$('#'+this.tablestr.prefix+this.tablestr.head).append(headtr);
				//防止之前是隐藏状态，在这里进行一次显示
				table.show();
			}
		},
		/**
		 * 列表的排序方法,支持字符串排序 比如ABC 目前以第一个元素([0])，即treecode编号进行升序排序
		 * @param array
		 */
		sortArray: function (array) {
			array.sort(function (x, y) {
				if(x[0] && y[0] ){
					return x[0].localeCompare(y[0]);
				}
			});
		},

		/**
		 * 读取字符串命名的对象属性
		 * @param inObj obj对象
		 * @param col 字符串
		 * @returns {Object}
		 */
		readObjDymValue: function (inObj, col) {
			if (inObj != null && inObj !== undefined && col !== undefined&&col!=='') {
				return inObj[col];
			}
		},
		/**
		 * 格式化元素内容方法 按照元素的名称类型，将元素的属性列表进行打包，按照入参的属性列表书写进入元素内容中（比如id class style等属性）
		 * @param elmtname
		 * @param propList
		 * @param innerHtm
		 * @returns {*}
		 */
		formatElementStr: function (elmtname, propList, innerHtm) {
			var $this = this;
			if (elmtname != null) {
				var propstr = ' ';
				if (propList != null && propList.length > 0) {
					//如果属性列表有数据，那么就开始遍历属性列表进行属性的打包
					for (var propidx = 0; propidx < propList.length; propidx++) {
						propstr += $this.tablestr.propstr.format(propList[propidx][0], propList[propidx][1]);
					}
				}
				return $this.tablestr.elmtstr.format(elmtname, propstr, innerHtm||'');
			} else {
				return '';
			}
		},
		/**
		 * 初始化描述div
		 * @param table
		 */
		initDescDiv: function (table) {
			//如果配置描述div为true，并且类型为div，而且目标div为空，即初始化div，否则只绑定描述函数
			if(this.options.descConfig.enable && this.options.descConfig.desc_type=='div'){
				if(!this.options.descConfig.d_target_id){
					this.appendDescDiv(table);
				}
				this.appendDescDivEvent(table);
			}
		},
		/**
		 * 在table后方增加用于描述的div对象
		 * @param table
		 */
		appendDescDiv: function (table) {
			//默认生成双层有透明度的div嵌套
			var  divin = this.formatElementStr(this.tablestr.div,
				[[this.tablestr.id,this.tablestr.prefix+this.options.descConfig.css_in],
					[this.tablestr.class,this.options.descConfig.css_in]]);
			var divout = this.formatElementStr(this.tablestr.div,
				[[this.tablestr.id,this.tablestr.prefix+this.options.descConfig.css_out],
					[this.tablestr.class,this.options.descConfig.css_out]],divin);
			table.after(divout);
		},
		/**
		 * 增加div的事件
		 * @param table
		 */
		appendDescDivEvent:function(table){
			var $this = this;
			table.find(this.tablestr.th).each(function(){
				//获取描述字段
				var desc = $(this).attr($this.tablestr.desc);
				if(desc){
					//如果包含描述的表头th的class值被配置，那么这里就覆盖th原来的class
					$this.options.descConfig.desc_th_class && $(this).prop($this.tablestr.class,$this.options.descConfig.desc_th_class);
					var divin =  $('#'+$this.tablestr.prefix+$this.options.descConfig.css_in),
						divout = $('#'+$this.tablestr.prefix+$this.options.descConfig.css_out);
					//如果配置了目标div，那么divout和divin都是目标div，否则读取生成的div
					if($this.options.descConfig.d_target_id){
						var divtgt = $('#'+$this.options.descConfig.d_target_id);
						divin = divtgt;
						divout  = divtgt;
					}
					//绑定描述函数，如果是1.7以上的版本，用on绑定，不是则用bind绑定
					if(morethan17) {
						$(this).on($this.options.descConfig.showevent, function (e) {
							$this.showDescDiv(divin, divout, $(this).html(), desc, e.pageX, e.pageY);
						});
						$(this).on($this.options.descConfig.hideevent, function () {
							$this.hideDescDiv(divout);
						});
					}else{
						$(this).bind($this.options.descConfig.showevent, function (e) {
							$this.showDescDiv(divin, divout, $(this).html(), desc, e.pageX, e.pageY);
						});
						$(this).bind($this.options.descConfig.hideevent, function () {
							$this.hideDescDiv(divout);
						});
					}
				}
			});
		},
		/**
		 * 显示div
		 * @param divin
		 * @param divout
		 * @param titlestr
		 * @param desc
		 * @param pagex
		 * @param pagey
		 */
		showDescDiv:function(divin,divout,titlestr,desc,pagex,pagey) {
			//默认的会加入关闭按钮以及标题栏
			var span = this.tablestr.closespan.format(this.options.descConfig.css_close)+titlestr;
			var title = this.formatElementStr(this.tablestr.div,[[this.tablestr.class,this.options.descConfig.css_title]],span);
			var content = this.formatElementStr(this.tablestr.div,[[this.tablestr.class,this.options.descConfig.css_content]],desc);
			var inhtml = title+content;
			//如果指定了div，那么就简单的将标题加粗，并且换行
			if(this.options.descConfig.d_target_id){
				title = this.formatElementStr(this.tablestr.border,[],titlestr+this.tablestr.split);
				inhtml = title+desc;
			}
			divin.html(inhtml);
			//div显示位置，根据position来决定显示方式是漂浮还是固定
			this.options.descConfig.position=='fly' &&
			divout.css({top:pagey+this.options.descConfig.pos_y,left:pagex+this.options.descConfig.pos_x}).show();

			this.options.descConfig.position=='absolute' &&
			divout.css({top:this.options.descConfig.pos_y,left:this.options.descConfig.pos_x}).show();

			//没有指定目标div的情况下，关闭符号绑定关闭函数 版本大于1.7用on绑定，其余则用bind绑定
			!this.options.descConfig.d_target_id && morethan17 &&
			divout.find(this.tablestr.span).on("click",function(){
				divout.hide();
			});
			!this.options.descConfig.d_target_id && !morethan17 &&
			divout.find(this.tablestr.span).bind("click",function(){
				divout.hide();
			});

		},
		/**
		 * 隐藏元素
		 * @param divout
		 */
		hideDescDiv: function (divout) {
			divout.hide();
		}
	};

	//临时表头和叶子节点数组
	var tmpHeaderList = [];
	var tmpLeafList = [];
	//临时选中的列名数组
	var switchColumnsList = [];

	/**
	 * 数据分析模块 用于生成数据的平均值、最大值、最小值、合计值等列表以及数据比对功能
	 * @param opt
	 * @constructor
	 */
	var TheAnaLyze = function(opt){

		this.tablestr = {
			'extremeswitch':{'max':'>','min':'<'},
			'descswitch':{'max':'最大值','min':'最小值','all':'合计值','avg':'平均值'}, //抬头描述默认值
			"prefix":'analy_',
			'tr':'tr',
			'th':'th',
			'divide':',',
			'head':'thead',
			'body':'tbody',
			'td':'td',
			'span':'span',
			'caption':'caption',
			'id':'id',
			'border':'b',
			'name':'name',
			'div':'div',
			'desc':'desc',
			'style':'style',
			'title':'title',
			'class':'class',
			'strdivide':'\'',
			'transIdPre':'tran_',
			'divPrefix':'autoTrans_',
			'split':'\:<br/>',
			'closespan':'<span class="{0}"><b>&times;</b></span>',
			'elstr':'<{0} {1}>{2}</{0}>',
			'prstr':' {0}="{1}" '
		},
			//比对的配置
			this.compare={
				'enable':false,//比对开关，默认为关闭
				'followelmt':'span',//跟在td数据后方的标签，默认为span
				'elmthtml':'',//跟在td数据后方的标签的html
				'upclass':'moreThanSpan',//比比对数值大的css
				'lowclass':'lessThanSpan',//比比对数值小的css
				'eqclass':'equalToSpan'//于比对数值相同的css

			},
			//预设值比对的配置，V1.1版本新增
			this.transcp={
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
				'pos_y':0//y位置
			},
			//预设值比对的统计表格设置，V1.1版本新增
			this.transCountCp ={
				'enable':true, //统计表格是否开启，默认为false
				'tgtTableId':'tabledcnt', //展示统计表格数据的容器id
				'table':' table-hover  table-striped table-bordered table-responsive',//表格css
				'caption':'分析统计结果', //表格标题
				'captionstyle':'',//标题格式css
				'title':'类型/单位', //统计表格的标头，显示在表格左上角区域
				'rowcol':'rep_org_name', //数据行单位的标示字段名，标明该行数据归属的说明，将会横向成为统计表格的表头
				'switchenable':true,//统计表格数据关联明细表数据筛选功能是否开启。
				// 如果开启，将会根据触发机制，在总表的每个单元格绑定事件，进行有问题数据列的筛选。（如点击某单位的不合格项，明细表只显示该单位的不合格列和数据）
				'switchevent':'click'//触发事件，默认为单击
			},


			//css配置，进行值比对时所用，如果在init时候指定了cssConfig入参，此处的配置应当同init时的配置
			this.cssConfig = {
				'tr': '',
				'th': '',
				'datatr':'',
				'td': ''
			},

			//默认配置
			this.default = {
				'anaJson':null,//需要进行比较分析的内容数据
				'baseJson': null,//进行比较分析的基准数据，如果为空，则默认等于anaJson，如果有指定，则按指定值来。（用于在进行比价分析时，内容数据不等于基准数据的场景，如内容只显示两条数据，但是需要比对所有十条数据的平均值）
				'tableid': 'tableid',//表格id
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
				"countJson":[],//临时使用，即比对描述的内容数据
				'compare':this.compare, //比对的配置
				'cssConfig':this.cssConfig, //css配置
				'transcp':this.transcp, //横向比对的配置，1.1版本新增
				'transCountCp':this.transCountCp //横向比对的统计表格设置，V1.1版本新增
			},
			//入参复制，因为入参为树状结构，使用深度拷贝
			this.options = $.extend(true,{}, this.default, opt);
			//给baseJson赋值，如果为空并且内容数据不为空，则赋值为内容数据
			if(!this.options.baseJson){
			 	this.options.baseJson = this.options.anaJson ?  this.options.anaJson:[];
			}


	};

	TheAnaLyze.prototype = {

		/**
		 * 根据传入的table对象进行thead,tbody的书写
		 * @param table
		 */
		initTableElement: function (table) {
			//初始化table，清除元素
			table.empty();

			//如果存在table的class就设置table的class
			this.options.transCountCp.table && table.prop(this.tablestr.class, this.options.transCountCp.table);
			//存在表格名称则赋值表格名称
			this.options.transCountCp.caption && table.append(this.formatElementStr(this.tablestr.caption, [[this.tablestr.class, this.options.transCountCp.captionstyle||'']],this.options.transCountCp.caption));
			//增加thead，如果不存在 generate head if not exists
			table.find(this.tablestr.head).length == 0 &&
			table.append(this.formatElementStr(this.tablestr.head, [[this.tablestr.id,this.tablestr.prefix+this.tablestr.head]]));

			//生成tbody，如果不存在 generate body if not exists
			table.find(this.tablestr.body).length == 0 &&
			table.append(this.formatElementStr(this.tablestr.body, [[this.tablestr.id,this.tablestr.prefix+this.tablestr.body]]));

		},
		/**
		 * add by V1.1
		 * 书写横向比对统计分析总表表头方法
		 * @param table
		 */
		writeCountTableHeader:function(table) {
			var $this = this;
			//打包头部列表，以数据行单位为横轴
			var tds = '',trs = '';
			//组成标头
			tds += this.formatElementStr(this.tablestr.td, [],this.options.transCountCp.title);
			//循环anajson数据，获取对应的行标示字段名组成表头td串
			$.each(this.options.anaJson, function (anai, anaitem) {
				var head = readObjvalue(anaitem, $this.options.transCountCp.rowcol) || '';
				tds += $this.formatElementStr($this.tablestr.td, [],head);
			});
			//td串打包成一个tr
			trs+=this.formatElementStr(this.tablestr.tr, [],tds);
			//table的thead书写tr
			//书写组装完毕的表头信息  使用id查找，提高查找效率
			$('#'+this.tablestr.prefix+this.tablestr.head).append(trs);
			//防止之前是隐藏状态，在这里进行一次显示
			table.show();
		},

		/**
		 * add by V1.1
		 * 根据analist，书写横向比对统计分析总表数据内容方法
		 * @param table
		 */
		writeCountTableData:function(table) {
			var $this = this;
			var thetr = '';
			//循环titleConfig配置，获取分析结果类型（会有多种）
			$.each(this.options.transcp.titleConfig, function (ci, citem) {
				var thetd = '';
				//ci是类型，用于到数组中获取对应的数据，citem是类型名称，用于在界面上展示，一次循环为一行数据
				//包装第一列数据，第一列为类型名称
				thetd+=$this.formatElementStr($this.tablestr.td, [],citem);
				//遍历analist，获取统计信息，并且书写到对应的td中
				$.each(anaList, function (idx,ite) {
					var count_ = $this.getFitCountFromAnaList(ci,ite)||'0';
					thetd+=$this.formatElementStr($this.tablestr.td, [[$this.tablestr.desc,idx+$this.tablestr.divide+ci]],count_);
				});
				thetr+=$this.formatElementStr($this.tablestr.tr, [],thetd);
			});
			//tbody书写结果内容
			$('#'+this.tablestr.prefix+this.tablestr.body).append(thetr);
		},

		/**
		 * add by V1.1
		 * 绑定比对统计表的单元格事件
		 * @param table
		 */
		bindCountTableCell:function(table) {
			var $this = this;
			table.find(this.tablestr.body).find(this.tablestr.td).each(function(){
				if(morethan17) {
					$(this).on($this.options.transCountCp.switchevent, function () {
						$this.switchTableByCountCell($(this));
					});
				}else{
					$(this).bind($this.options.transCountCp.switchevent, function () {
						$this.switchTableByCountCell($(this));
					});
				}
			});
		},
		/**
		 * add by V1.1
		 * 根据点击的单元格，进行明细表分别显示
		 * @param cell 单元格
		 */
		switchTableByCountCell:function(cell) {
			//获取cell的desc属性，来取得他的行顺序和类型
			var position = cell.attr(this.tablestr.desc);
			//有值的情况下才进行主表的筛选
			if(position){
				//对顺序类型字符串进行分割
				var pL = position.split(this.tablestr.divide);
				if(pL[0]&&pL[1]){
					//获取该单元格的分析统计结果所需要显示的列数据名 ，从switchColumnsList中对应获得
					var containColumn = switchColumnsList[pL[0]][pL[1]];
					//有列数据名才进行筛选显示操作，否则界面不变
					if(containColumn){
						//containColumn 增加数据行单位的标示字段名，作为行表示显示
						containColumn = containColumn + this.tablestr.divide+this.options.transCountCp.rowcol;
						//先筛选leafList，即叶子节点
						this.initTmpLeafFromTransColumns(containColumn);
						//初始化headerList节点
						this.initTmpHeaderByTmpLeaf();
						//书写表头
						var tb = $('#'+this.options.tableid);
						theTableIns.initTableElement(tb);
						theTableIns.writeHeader(tb, tmpHeaderList);
						//获取行数据 即某一行的数据 根据单元格的pl[0]属性 即数据行位置 获取
						var dataArray = [];
						dataArray.push(this.options.anaJson[pL[0]]);
						//行数据的书写
						this.overwriteTransValue(dataArray,tmpLeafList, false, false);
					}
				}
			}
		},
		/**
		 * add by V1.1
		 * 根据数据列名字符串进行叶子节点的筛选
		 * @param columnstr
		 */
		initTmpLeafFromTransColumns:function(columnstr) {
			tmpLeafList = [];
			$.each(leafList, function (li, lt) {
				//leafList中，数据列类型被包含在columnstr中的节点将会被复制到tmpLeafList中。
				if(lt[2]&&(columnstr.indexOf(lt[2]))>=0){
					tmpLeafList.push(lt);
				}
			});
		},
		/**
		 * add by V1.1
		 * 根据叶子节点列表进行筛选总的表头列表
		 */
		initTmpHeaderByTmpLeaf:function() {
			if(tmpLeafList){
				//遍历headerList第一重循环
				tmpHeaderList = [];
				for (var hindex = 0; hindex < headerList.length; hindex++) {
					var tmpHeader = headerList[hindex];
					var newHeader = [];
					//第二重循环
					for (var al = 0; al < tmpHeader.length; al++) {
						//获取编码
						var code_ = tmpHeader[al][0];
						//如果该表头为叶子节点的父表头，即编码符合父节点编码，那么就将该节点放置到newHeader数组中
						if(this.judgeCodeByTmpLeaf(code_)){
							//重新读取叶子节点个数
							var leafCount = TheTable.prototype.readLeafCount(code_,tmpLeafList);
							var thstr = tmpHeader[al][1];
							//正则替代叶子节点个数
							var reg =/colspan="(\d+)"/;
							thstr = thstr.replace(reg,'colspan="'+leafCount+'"');
							//以headerList的格式放入数组中。
							newHeader.push([code_,thstr]);
						}
					}
					//循环完毕把newHeader放置到tmp数节点中
					tmpHeaderList.push(newHeader);
				}
			}
		},

		/**
		 * add by V1.1
		 * 判断树节点是为叶子节点的父节点
		 * @param code 节点编号
		 * @returns {boolean}
		 */
		judgeCodeByTmpLeaf:function(code) {
			var ret = false;
			$.each(tmpLeafList, function (ti, tt) {
				if(tt[0]&&isStartWith(tt[0],code)){
					ret = true;
					return false;
				}
			});
			return ret;
		},



		/**
		 * add by V1.1
		 * 从analist中获取符合分析结果类型的数量值
		 * @param type 分析结果类型
		 * @param anaListI analist的第一子集数组，为类型列表
		 * @returns {*}
		 */
		getFitCountFromAnaList: function (type,anaListI) {
			var returnCount ;
			if(type&&anaListI){
				$.each(anaListI, function (i_,item_) {
					if(item_&&item_[0]&&item_[2]&&type==item_[0]){
						//如果类型与数组0位置的类型相同，那么就返回2位置的数据数量
						returnCount = item_[2];
					}
				});
			}
			return returnCount;
		},

		/**
		 * 获取平均值
		 * @returns {Array}
		 */
		getAvgList :function() {
			var returnList = [];
			//临时list，二维list，用于记录数据的值，0放置数据的总和，1放置数据的个数
			var tmpList = [];
			var $this = this;
			if(this.options.baseJson && leafList.length>0){
				returnList.length = leafList.length;
				tmpList.length = leafList.length;
				//循环json 进行每一行数据的读取
				$.each(this.options.baseJson, function (i, item) {
					if(item) {
						for (var idx = 0; idx < leafList.length; idx++) {
							//循环leaflist，获取对应字段名，然后在json数据里找到对应的值
							var vlue = readObjvalue(item, leafList[idx][2]) || '';
							$this.initAvgListValue($.trim(vlue), idx, tmpList);
						}
					}
				});
				//遍历循环tmplist 取得平均数放入返回的list中
				for(var itemp=0;itemp<tmpList.length;itemp++) {
					var tmp_ = tmpList[itemp];
					if(tmp_){
						var all_ = Number(tmp_[0]);
						var cnt_ = Number(tmp_[1]);
						var avg_ = all_/cnt_;
						returnList[itemp] = avg_.toFixed($this.options.digit);
					}

				}
			}
			this.initListDesc(returnList);
			return returnList;
		},
		/**
		 * 将数据值放置到tmp数组里的方法
		 * @param value_
		 * @param index_
		 * @param List_
		 */
		initAvgListValue:function(value_,index_,List_) {
			if(value_ && !isNaN(value_)){
				var vlu = Number(value_);
				//取list对应index的值，如果list在index处的值为undefined，那么就将该值赋值给该位置的0号位置，1号位置放置数量
				var listval = List_[index_];
				if(!listval){
					List_[index_] = [vlu,1];
				}else{
					var listvalue = Number(listval[0]);
					var listcount = Number(listval[1])+1;
					var initL = [listvalue+vlu,listcount];
					List_[index_] = initL;
				}
			}
		},
		/**
		 * 生成总计list的方法
		 */
		getCountList:function() {
			var returnList = [];
			var $this = this;
			if(this.options.baseJson && leafList.length>0){
				returnList.length = leafList.length;
				//循环json 进行每一行数据的读取
				$.each(this.options.baseJson, function (i, item) {
					if(item) {
						for (var idx = 0; idx < leafList.length; idx++) {
							//循环leaflist，获取对应字段名，然后在json数据里找到对应的值
							var vlue = readObjvalue(item, leafList[idx][2]) || '';
							$this.initCountListValue($.trim(vlue), idx, returnList);
						}
					}
				});
			}
			this.initListDesc(returnList);
			return returnList;
		},
		/**
		 * 统计列表计算方法
		 * @param value_
		 * @param index_
		 * @param List_
		 */
		initCountListValue:function(value_,index_,List_) {
			if(value_ && !isNaN(value_)){
				var vlu = Number(value_);
				//取list对应index的值，如果list在index处的值为undefined，那么就将该值赋值给该位置
				var listval = List_[index_];
				if(!listval){
					List_[index_] = vlu;
				}else{
					var listvalue = Number(listval);
					var tmp_ = listvalue + vlu;
					List_[index_] = tmp_.toFixed(this.options.digit);
				}
			}
		},
		/**
		 * 获取极端值列表 最大 最小值
		 */
		getExtremeList:function() {
			//根据tp进行最大最小符号的赋值和定义
			var compchar =this.tablestr.extremeswitch [this.options.anatype]||'';
			var returnList = [];
			var $this = this;
			if(compchar && this.options.baseJson && leafList.length>0){
				returnList.length = leafList.length;
				//循环bodyjson 进行每一行数据的读取
				$.each(this.options.baseJson, function (i, item) {
					if(item) {
						for (var idx = 0; idx < leafList.length; idx++) {
							//循环leaflist，获取对应字段名，然后在json数据里找到对应的值
							var vlue = readObjvalue(item, leafList[idx][2]) || '';
							$this.initExtremeListValue($.trim(vlue), idx, returnList, compchar);
						}
					}
				});
			}
			this.initListDesc(returnList);
			return returnList;
		},
		/**
		 * 生成极限值list值
		 * @param value_
		 * @param index_
		 * @param List_
		 * @param compchar
		 */
		initExtremeListValue:function(value_,index_,List_,compchar) {
			if(value_ && !isNaN(value_)){
				var vlu = Number(value_);
				//取list对应index的值，如果list在index处的值为undefined，那么就将该值赋值给该位置
				var listval = List_[index_];
				if(!listval){
					List_[index_] = vlu;
				}else{
					listval = Number(listval);
					//如果有值的话，就按照入参的比较符比较，符合要求的则放入数组替代原值
					if(eval('vlu'+compchar+'listval')){
						List_[index_] = vlu;
					}
				}
			}
		},
		/**
		 * 如果入参有比对数据抬头的话，就按照位置给他替代掉原来的内容
		 */
		initListDesc:function(List) {
			//如果抬头描述开启（默认开启）
			if(this.options.descenable){
				//获取描述值，如果入参有，就按入参的来，没有的话就取默认值
				List[this.options.desccol] = this.options.descstr ? this.options.descstr :this.tablestr.descswitch [this.options.anatype]||'';
			}
		},
		/**
		 * 分析统计的统一出口
		 * @returns {*}
		 */
		anaLyzz:function() {
			var returnList= this.queryStatList();
			//如果需要进行比对，就执行比对方法，重写table的tbody内容
			this.options.compare.enable && this.overwriteTbody(returnList);
			//如果需要书写则书写到table中
			this.options.writetotable && this.writeToTable(returnList,this.options.writepos);
			//刷新排序功能
			refreashSortTable($('#'+this.options.tableid));

			if(this.options.returntype == 'this'){
				return 'this';
			}
			if(this.options.returntype == 'list' ) {
				return returnList;
			}
		},
		/**
		 * 横向比对的统一出口 V1.1新增
		 */
		transCompare:function() {
			//重新书写比对后的数据
			this.overwriteTransValue(this.options.anaJson,leafList,this.options.transcp.count,this.options.transCountCp.switchenable);
			//如果开启了信息统计，开启显示统计的信息的div
			var tb = $('#'+this.options.tableid);
			this.options.transcp.count && this.initTransCountDiv(tb);
			//如果开启了统计表格，那么就书写统计表格
			if(this.options.transCountCp.enable){
				var cnttb = $('#'+this.options.transCountCp.tgtTableId);
				//书写统计表格
				this.initCountTable(cnttb);
				//如果开启统计表格的明细切换，那就绑定表格单元格的明细切换功能
				this.options.transCountCp.switchenable && this.bindCountTableCell(cnttb);
			}
			//刷新排序功能
			refreashSortTable(tb);

		},
		/**
		 * add by V1.1
		 * 初始化统计表格
		 * @param table
		 */
		initCountTable:function(table) {
			this.initTableElement(table);
			this.writeCountTableHeader(table);
			this.writeCountTableData(table);
		},


		/**
		 * 与设定值比对的方法，如果符合设定时书写的公式，那么就将css置为设定的css，例如标红、标黄等设置
		 * @param theJson 需要书写的数据
		 * @param leafList 叶子数组
		 * @param transcount 是否开启信息统计
		 * @param switchenable 是否开启信息统计的明细切换
		 */
		overwriteTransValue:function(theJson,leafList,transcount,switchenable) {
			var $this = this;
			var trall = '';
			//清空list
			anaList = [];
			//循环anaJson，进行遍历
			$.each(theJson, function (i, item) {
				if(item) {
					var tdall = '';
					//循环开始时，先push一个空值到analist和switchColumnsList中
					transcount && anaList.push([]);
					transcount && switchColumnsList.push({});
					for (var idx = 0; idx < leafList.length; idx++) {
						//循环leaflist，获取对应字段名，然后在json数据里找到对应的值
						var vlue = readObjvalue(item, leafList[idx][2])|| '';
						//td的css设置
						var opt = $this.options.cssConfig.td ? [[$this.tablestr.class, $this.options.cssConfig.td]] : [];

						//如果第三个值不为空，那么td的css就按照比对的css来取
						opt =  $this.anaLyzTrans (leafList[idx][3],leafList[idx][1],opt,vlue,item,i,idx,leafList[idx][2],transcount,switchenable);
						//拼装td字符串，并且加到tdall的变量中去
						tdall += $this.formatElementStr($this.tablestr.td, opt, vlue);
					}
					//封装tr字符串，并且添加到trall的变量中
					var optr = $this.options.cssConfig.datatr ? [[$this.tablestr.class, $this.options.cssConfig.datatr]] : [];
					trall += $this.formatElementStr($this.tablestr.tr, optr, tdall);
				}
			});
			//先清空table的tbody，然后书写
			$('#'+this.options.tableid).find(this.tablestr.body).html('').append(trall);
		},

		/**
		 * 横向比对的比对方法 根据比对结果返回在表达式里预设好的css，并且根据信息统计开关，进行信息统计
		 * @param transStr 比对条件
		 * @param headerName 表头名称
		 * @param theCss 返回css
		 * @param theValue 数据字段值
		 * @param theJsonRow json行数据
		 * @param rownum json行数据的标号
		 * @param leafnum 叶子节点的编号
		 * @param dataColumn 数据列名
		 * @param transcount 是否开启信息统计
		 * @param switchenable 是否开启信息统计的明细切换
		 * @returns {*}
		 */
		anaLyzTrans:function(transStr,headerName,theCss,theValue,theJsonRow,rownum,leafnum,dataColumn,transcount,switchenable) {
			if(transStr){
				var $this = this;
				//根据比对条件的分隔符，将比对条件分割成为有效的比对条件数组
				var transList = transStr.split($this.options.transcp.listDivide);
				//循环数组进行比对处理
				$.each(transList, function (transIndex, transItem) {
					if(transItem) {
						//单条条件的值，默认是以英文逗号（分隔符可以自定义）作为分割，前方是条件，后方是结果
						var queryL = transItem.split($this.options.transcp.conditionDivide);
						//如果条件和结果都不为空才进行比对操作
						if(queryL[0]&&queryL[1]&&$this.matchExp(theValue,queryL[0],theJsonRow)){
							//判断值是否符合条件，如果符合的话，那么就把class属性设置为预定好的class,并且跳出循环
							//根据配置获取预设的css
							var getcss = $this.options.transcp.clzConfig [queryL[1]]||'';
							var theId = $this.tablestr.transIdPre+rownum+leafnum;
							//加入id锚点便于定位
							theCss = getcss? [[$this.tablestr.class, getcss],[$this.tablestr.id,theId]]:[];
							//如果开启了信息统计，就封装统计信息到数组中 统计信息为左侧显示div和统计表格共用
							//$this.options.transcp.count
							transcount &&  $this.putTransToList(theValue,headerName,theId,queryL[1],anaList[rownum]);
							//如果开启了信息统计的明细切换，就进行封装信息的初始化
							//$this.options.transCountCp.switchenable
							switchenable && $this.putFitColumnToRecord(rownum,queryL[1],dataColumn,queryL[0]);
							return false;

						}
					}
				});

			}
			return theCss;
		},

		/**
		 * 放置符合比对条件的数据到记录列表里
		 * @param row 当前行数据 即循环到了第几行
		 * @param type 当前比对类型
		 * @param baseColumn 被比较的列名
		 * @param query 比较公式
		 */
		putFitColumnToRecord:function(row,type,baseColumn,query) {
			//默认为被比较的列字段
			//var cols = baseColumn;
			//如果查询条件里包含替代属性的，即jsonRow.column格式 ，字段指向标识符默认为#，那就将替代属性列一并放置进来
			var cols = ((query.indexOf(this.options.transcp.columnReference))>=0) ?
				baseColumn +this.tablestr.divide+ query + this.tablestr.divide : baseColumn +this.tablestr.divide;

			//获取switchColumnsList数组里对应下标 对应type的字符串，即对应行数据的对应类型已存在的字符串
			var exist_ = readObjvalue(switchColumnsList[row],type);
			//如果存在，就把字符串进行相加，进行放置
			exist_ = exist_? exist_+cols:cols;
			//放置字符串到对应的json值里
			switchColumnsList[row][type]= exist_;
			//eval('switchColumnsList[row].'+type+ '=\'' + exist_+'\'');
		},

		/**
		 * 实际的值是否符合表达式
		 * @param theValue 实际值
		 * @param exp 表达式
		 * @param jsonRow 行json数据
		 * @returns {boolean}
		 */
		matchExp:function(theValue,exp,jsonRow) {
			var result  = false;
			//处理theValue，如果不是数字的话，那么增加''，否则字符串比对都会出错
			if(isNaN(theValue)){
				theValue = this.tablestr.strdivide+theValue+this.tablestr.strdivide;
			}
			//解析exp表达式 将表达式中的字段指向替代为属性格式，即jsonRow.column格式 ，字段指向标识符默认为#，可以自定义
			var exp_ = exp.replace(this.options.transcp.columnReference,'jsonRow.');
			//如果表达式里有与、或的符号，那么就在这两种符号之后加上value进行与或的比对支持
			if((exp_.indexOf('&&'))>=0){
				exp_ = exp_.replace('&&','&&'+theValue);
			}
			if((exp_.indexOf('||'))>=0){
				exp_ = exp_.replace('||','||'+theValue);
			}
			//如果表达式里有写明本体的，那么就将本体替代为本体字段的值来进行比较 暂时只支持 a<this<b 或者 a>this>b 的格式
			if((exp_.indexOf(this.options.transcp.selfReference))>=0){
				exp_ = exp_.replace(this.options.transcp.selfReference,theValue+'&&'+theValue);
			}else{
				//如果没有写明本体，那么默认将本体字段值加在表达式之前 ，>b 会被解析为this>b
				exp_ = theValue + exp_;
			}
			//如果包含等于号个数为1，那么就将一个等于号替代为两个
			if(containStrCount(exp_,'=')==1){
				exp_ = exp_.replace('=','==');
			}
			//进行表达式取值，并且返回，如果表达式异常，则默认返回为false
			try{
				result = eval(exp_);
			}catch (exception) {
				//console.log(exception);
			}
			return result;
		},
		/**
		 * 把比对值放入统计数组的方法，统计数组为五维数组
		 * 第一维度：行内容列表，格式为[行内容1,行内容2,行内容3] ，维度为行数据
		 * 第二维度，行内容数组，类型列表，格式为[类型1,类型2,类型3]，维度为统计类型
		 * 第三维度，类型内容数组，数据列表，格式为[类型标记,类型显示名称,数据数量,数据列表]，维度为类型的具体内容
		 * 第四维度，数据列表，格式为[基础数据1,基础数据2,基础数据3]，维度具体单元格数据内容
		 * 第五维度，基础数据列表，格式为[字段名,字段值,单元格id定位]，维度为符合比对条件的具体单元格数据内容
		 * @param theValue 单元格字段值
		 * @param headerName 表头名称
		 * @param theId 单元格id
		 * @param theType 统计类型
		 * @param anaObj 行内容数组
		 */
		putTransToList:function(theValue,headerName,theId,theType,anaObj) {
			//传入的行内容数组不为空才进行处理
			if(anaObj){
				var $this = this;
				//封装基础值数组
				var base_ = [headerName,theValue,theId];
				//判断入参的地区数组里是否有此类型的数组元素了，如果没有，就添加，如果有，就更新
				var notContain = true;
				$.each(anaObj, function (index_, obj_) {
					//需要循环内容有值
					//统计类型标记放在类型内容数组的第一个位置,与入参类型比对是否相等，如若相等，就更新此数组内容
					if(obj_&&obj_[0]&&obj_[0]==theType){
						//第三个位置放的是数据数量，数据数量加一
						var cnt_ = Number(obj_[2]);
						if(cnt_&&obj_[3]){
							obj_[2] = cnt_+1;
							//数据列表数组增加当前基础值数组
							obj_[3].push(base_);
							notContain = false;
						}
					}

				});
				//循环下来如果没有此类型的元素，即notContain仍然为true的话，那么就增加该类型
				if(notContain){
					//获取类型的显示名称 例如red显示为不合格 yellow显示为警告，通过入参进行配置
					var typeStr = $this.options.transcp.titleConfig [theType] || theType;
					//根据基础值数组，封装类型内容数组
					var type_ = [theType,typeStr,1,[base_]];
					//把类型内容数组放置到行内容数组中
					anaObj.push(type_);
				}

			}
		},

		/**
		 * 初始化横向比对的统计显示功能
		 * @param table
		 */
		initTransCountDiv:function(table) {
			this.appendTransDiv(table);
			this.appendTransDivEvent(table);
		},

		/**
		 * 在table之下增加隐藏的用于横向比对的div
		 * @param table
		 */
		appendTransDiv:function(table){
			//默认生成双层有透明度的div嵌套
			var  divin = this.formatElementStr(this.tablestr.div,
				[[this.tablestr.id,this.tablestr.divPrefix+this.options.transcp.css_in],
					[this.tablestr.class,this.options.transcp.css_in]]);
			var divout = this.formatElementStr(this.tablestr.div,
				[[this.tablestr.id,this.tablestr.divPrefix+this.options.transcp.css_out],
					[this.tablestr.class,this.options.transcp.css_out]],divin);
			table.after(divout);
		},

		/**
		 * 对应的字段增加横向比对统计div的展示和隐藏的触发事件
		 * @param table
		 */
		appendTransDivEvent:function(table) {
			var $this = this;
			table.find($this.tablestr.td+":nth-child(1)").each(function(i,td){
				//获取描述字段
				var desc = readObjvalue($this.options.countJson,td.innerHTML)||'情况正常';
					//$this.options.countJson.sc||'暂无';
				if(desc){
					var divin =  $('#'+$this.tablestr.divPrefix+$this.options.transcp.css_in),
						divout = $('#'+$this.tablestr.divPrefix+$this.options.transcp.css_out);
					//如果配置了目标div，那么divout和divin都是目标div，否则读取生成的div
					if($this.options.transcp.d_target_id){
						var divtgt = $('#'+$this.options.transcp.d_target_id);
						divin = divtgt;
						divout = divtgt;
					}
					//绑定描述函数，如果是1.7以上的版本，用on绑定，不是则用bind绑定
					if(morethan17) {
						$(this).on($this.options.transcp.showevent, function (e) {
							$this.showDescDiv(divin, divout, $(this).html(), desc, e.pageX, e.pageY);
						});
						$(this).on($this.options.transcp.hideevent, function () {
							$this.hideDescDiv(divout);
						});
					}else{
						$(this).bind($this.options.transcp.showevent, function (e) {
							$this.showDescDiv(divin, divout, $(this).html(), desc, e.pageX, e.pageY);
						});
						$(this).bind($this.options.transcp.hideevent, function () {
							$this.hideDescDiv(divout);
						});
					}
				}
			});
		},

		/**
		 * 展示描述div的方法
		 * @param divin
		 * @param divout
		 * @param titlestr
		 * @param desc
		 * @param pagex
		 * @param pagey
		 */
		showDescDiv:function(divin,divout,titlestr,desc,pagex,pagey) {
			//默认的会加入关闭按钮以及标题栏
			var span = this.tablestr.closespan.format(this.options.transcp.css_close)+titlestr;
			var title = this.formatElementStr(this.tablestr.div,[[this.tablestr.class,this.options.transcp.css_title]],span);
			var content = this.formatElementStr(this.tablestr.div,[[this.tablestr.class,this.options.transcp.css_content]],desc);
			var inhtml = title+content;
			//如果指定了div，那么就简单的将标题加粗，并且换行
			if(this.options.transcp.d_target_id){
				title = this.formatElementStr(this.tablestr.border,[],titlestr+this.tablestr.split);
				inhtml = title+desc;
			}
			divin.html(inhtml);
			//div显示位置，根据position来决定显示方式是漂浮还是固定
			this.options.transcp.position=='fly' &&
			divout.css({top:pagey+this.options.transcp.pos_y,left:pagex+this.options.transcp.pos_x}).show();

			this.options.transcp.position=='absolute' &&
			divout.css({top:this.options.transcp.pos_y,left:this.options.transcp.pos_x}).show();


			//没有指定目标div的情况下，关闭符号绑定关闭函数 版本大于1.7用on绑定，其余则用bind绑定
			!this.options.transcp.d_target_id && morethan17 &&
			divout.find(this.tablestr.span).on("click",function(){
				divout.hide();
			});
			!this.options.transcp.d_target_id && !morethan17 &&
			divout.find(this.tablestr.span).bind("click",function(){
				divout.hide();
			});

		},

		/**
		 * 隐藏描述div的方法
		 * @param div
		 */
		hideDescDiv: function (div) {
			div.hide();
		},

		/**
		 * 根据比对，重写页面tbody的内容
		 */
		overwriteTbody:function(list) {
			var $this = this;
			//根据定义的小数位数，计算出在比较时所需要乘以的倍数
			var times = Number('1E'+this.options.digit);
			var trall = '';
			if(list.length>0) {
				//循环anaJson，进行遍历
				$.each(this.options.anaJson, function (i, item) {
					if(item) {
						var tdall = '';
						for (var idx = 0; idx < leafList.length; idx++) {
							//循环leaflist，获取对应字段名，然后在json数据里找到对应的值
							var vlue = readObjvalue(item, leafList[idx][2]) || '';
							//比较json数据取到的值和入参list对应的值 获取比较结果
							var res = $this.compareValue(vlue, list[idx], times);
							//获取需要添加的class
							var addClass = $this.getCompareClassConfig() [res] || '';

							//包装td内容后面附加的内容
							vlue = addClass ?
							vlue + $this.formatElementStr($this.options.compare.followelmt, [[$this.tablestr.class, addClass]], $this.options.compare.elmthtml) : vlue;

							//拼装td字符串，并且加到tdall的变量中去
							var opt = $this.options.cssConfig.td ? [[$this.tablestr.class, $this.options.cssConfig.td]] : [];
							tdall += $this.formatElementStr($this.tablestr.td, opt, vlue);
						}
						//封装tr字符串，并且添加到trall的变量中
						var optr = $this.options.cssConfig.datatr ? [[$this.tablestr.class, $this.options.cssConfig.datatr]] : [];
						trall +=  $this.formatElementStr($this.tablestr.tr, optr, tdall);
					}
				});
				//先清空table的tbody，然后书写
				$('#'+this.options.tableid).find(this.tablestr.body).html('').append(trall);
			}
		},
		/**
		 * 比较已取得的两个值
		 * @param value 被比较数
		 * @param compavl 比较数
		 * @param times 倍数
		 */
		compareValue:function(value,compavl,times) {
			if(value  && compavl ){
				//value和compavl转换为数字
				var value_ = parseInt(Number(value)*times);
				var compavl_ = Number((compavl)*times);
				if(value_ && compavl_){
					if(value_ > compavl_){
						return 'up';
					}else if (value_ < compavl_){
						return 'down';
					}else if (value_ == compavl_){
						return 'eq';
					}else{
						return '';
					}
				}
			}
		},
		/**
		 * 配置最大，最小和平均值的显示class 即最大值只会显示和最大值持平的数据，最小值显示和最小值持平的数据，平均值的话则是高、低和相等都显示
		 * @returns {*|string}
		 */
		getCompareClassConfig:function() {
			return {'max':{'eq':this.options.compare.eqclass},
				'min':{'eq':this.options.compare.eqclass},
				'avg':{'up':this.options.compare.upclass,'down':this.options.compare.lowclass,'eq':this.options.compare.eqclass}}[this.options.anatype]||''

		},
		/**
		 * 查询各类list 通过anatype进行判断list类型
		 * @returns {*}
		 */
		queryStatList:function() {
			if(this.options.anatype){
				var rList ;
				if(this.options.anatype=='max'||this.options.anatype=='min'){
					rList= this.getExtremeList();
				}else if(this.options.anatype=='all') {
					rList= this.getCountList();
				}else if(this.options.anatype=='avg') {
					rList= this.getAvgList();
				}
				return rList;
			}
		},
		/**
		 * 书写统计list到table中的方法
		 * @param list
		 * @param pos 书写位置，before：tbody之前，after：tbody之后
		 */
		writeToTable:function(list,pos) {
			//遍历list并且进行包装书写
			var $this = this;
			if(list.length>0){
				var tdstr = '';
				for(var idx=0;idx<list.length;idx++) {
					//循环list,获取值，打包成td
					var vlue = list[idx];
					//包装td的class，如果有则封装，没有则为空
					var opti = $this.options.tdclass ? [[$this.tablestr.class,$this.options.tdclass]]:[];
					tdstr += $this.formatElementStr($this.tablestr.td, opti, vlue);
				}
				//循环完毕之后td放入tr中
				//包装tr的class，如果有则封装，没有则只封装id
				var trop = $this.options.trclass ? [[$this.tablestr.id,$this.tablestr.prefix+$this.options.anatype],[$this.tablestr.class,$this.options.trclass]]
					:[[$this.tablestr.id,$this.tablestr.prefix+$this.options.anatype]];
				var trstr = $this.formatElementStr($this.tablestr.tr, trop, tdstr);
				//书写tr 判断是before还是after ，进行不同的书写
				var table = $('#'+this.options.tableid);
				pos=='after' &&
					table.find(this.tablestr.body).find(this.tablestr.tr).last().after(trstr);
				pos=='before' &&
					table.find(this.tablestr.body).find(this.tablestr.tr).eq(0).before(trstr);
			}
		},
		/**
		 * 格式化元素内容方法 按照元素的名称类型，将元素的属性列表进行打包，按照入参的属性列表书写进入元素内容中（比如id class style等属性）
		 * @param elmtname
		 * @param propList
		 * @param innerHtm
		 * @returns {*}
		 */
		formatElementStr: function (elmtname, propList, innerHtm) {
			var $this = this;
			if (elmtname != null) {
				var propstr = ' ';
				if (propList != null && propList.length > 0) {
					//如果属性列表有数据，那么就开始遍历属性列表进行属性的打包
					for (var propidx = 0; propidx < propList.length; propidx++) {
						if(propList[propidx][0]&&propList[propidx][1]){
							propstr += $this.tablestr.prstr.format(propList[propidx][0], propList[propidx][1]);
						}
					}
				}
				return $this.tablestr.elstr.format(elmtname, propstr, innerHtm||'');
			} else {
				return '';
			}
		}

	};



	/**
	 * 参数替代的函数声明 正则
	 */
	String.prototype.format = function(args) {
		var result = this;
		if (arguments.length > 0) {
			//处理参数类型的入参 ({name:"name_",age:33})
			if (arguments.length == 1 && typeof (args) == "object") {
				for (var key in args) {
					if(args[key]!=undefined){
						var reg = new RegExp("({" + key + "})", "g");
						result = result.replace(reg, args[key]);
					}
				}
			}
			//处理数据类型的入参({0},{1} 指代 "name_",33)
			else {
				for (var i = 0; i < arguments.length; i++) {
					if (arguments[i] !== undefined) {
						var reg = new RegExp("({[" + i + "]})", "g");
						result = result.replace(reg, arguments[i]);
					}
				}
			}
		}
		return result;
	};

	/**
	 * 格式化元素内容方法 按照元素的名称类型，将元素的属性列表进行打包，按照入参的属性列表书写进入元素内容中（比如id class style等属性）
	 * @param elmtname
	 * @param propList
	 * @param innerHtm
	 * @returns {string}
	 */
	function formatElementStr(elmtname, propList, innerHtm) {
		if (elmtname != null) {
			var pstr = ' ';
			if (propList != null && propList.length > 0) {
				//如果属性列表有数据，那么就开始遍历属性列表进行属性的打包
				for (var propidx = 0; propidx < propList.length; propidx++) {
					if(propList[propidx][0]&&propList[propidx][1]){
						pstr += propstr.format(propList[propidx][0], propList[propidx][1]);
					}
				}
			}
			return elmtstr.format(elmtname, pstr, innerHtm||'');
		} else {
			return '';
		}
	}

	/**
	 * 读取对象的对应key属性
	 * @param inObj
	 * @param key
	 * @returns {Object}
	 */
	function readObjvalue(inObj, key) {
		if (inObj != null && inObj != undefined && key != undefined&&key!='') {
			return inObj[key];
		}
	}

	/**
	 * 刷新排序表格 add by v1.1
	 * @param table
	 */
	function refreashSortTable(table){
		//如果开启序列号，增加序列号的书写
		serial.enable && generateIndex(table,serial.serialColumnIndex);
		sortconf.enable && table.trigger("updateAll");
		//生成当前排名
		generateRank(table);
	}

	/**
	 * 给表格数据处产生index排序行数据
	 * @param table
	 * @param pos
	 */
	function generateIndex(table,pos){
		//循环tr 在对应的td位置插入排序数据
		table.find('tbody tr').each(function (i, item) {
			//包装td的index
			var tdstr =  formatElementStr('td', [], initSortIndexByOrder(i));
			$(item).find('td:eq('+pos+')').before(tdstr);
		});
	}

	/**
	 * 根据排序方式，产生当前序号 add by v1.1
	 * @param currentI
	 */
	function initSortIndexByOrder(currentI) {
		//如果是asc就按当前循环号+1，如果是desc则以数据总量减去当前循环号
		if(serial.order=='asc'){
			return currentI+1;
		}else if(serial.order=='desc'){
			return trcount - currentI ;
		}
	}

	/**
	 * 根据是否需要反转排序以及当前排序类型产生当前序号
	 * @param currentI
	 */
	function initSortIndexByInverse(currentI){
		//当前排序类型与反转顺序相等则返回倒转的序号 - 数据总量减去当前循环号
		if(serial.type=='inverse'&&serial.inverseOrder==sortconf.corder){
			return trcount - currentI ;
		}
		return currentI+1;
	}

	/**
	 * 表格数据处刷新对应index
	 * @param table
	 * @param pos
	 */
	function refreashBodyIndex(table,pos){
		//循环tr 在对应的td位置刷新排序数据
		table.find('tbody tr').each(function (i, item) {
			$(item).find('td:eq('+pos+')').html(initSortIndexByInverse(i));
		});
	}

	/**
	 * 给表格表头处产生index排序行表头
	 * @param table
	 * @param headerstring
	 * @param rownum
	 * @param pos
	 */
	function generateIndexHeader(table,headerstring,rownum,pos){
		//定义rowspan和表头名称
		var opt = [['rowspan',rownum]];
		var tdstr =  formatElementStr('th', opt, headerstring);
		//在指定位置书写表头
		table.find('thead tr th:eq('+pos+')').before(tdstr);
	}

	/**
	 * 生成当前排名属性用于显示
	 * @param table
	 */
	function generateRank(table){
		if(sortconf.rank){
			table.find('tbody tr').each(function (i, item) {
				$(item).attr("title",sortconf.rankdesc+(initSortIndexByInverse(i)));
			});
		}
	}

	/**
	 * 返回instr里包含了多少regstr ，如果没有的话返回0
	 * @param instr
	 * @param regstr
	 * @returns {*}
	 */
	function containStrCount(instr,regstr){
		var reg =  new RegExp(regstr,"g");
		var arr = instr.match(reg);
		if(arr){
			return arr.length;
		}else{
			return 0;
		}

	}
	/**
	 * 判断regStr是否以compStr开头的方法
	 * @param regStr
	 * @param compStr
	 * @returns {boolean}
	 */
	function isStartWith(regStr, compStr) {
		if(regStr&&compStr){
			return !regStr.indexOf(compStr);
		}
		return false;
	}

	//表格书写的全局实例
	var theTableIns;

	/**
	 * 主体函数定义
	 */
	$.fn.autoHeader ={
		/**
		 * 树的初始化生成方法
		 * @param options
		 * @returns {$.fn.autoHeader}
		 */
		init : function(options){
			theTableIns = new TheTable(options);
			theTableIns.initTable();
			//返回主体函数，以便可以进行链式调用 exp: $.fn.autoHeader.init().ddc();

			return this;
		},
		/**
		 * 返回叶子树数组
		 * @returns {Array}
		 */
		getLeafList: function () {
			return leafList;
		},
		/**
		 * 纵向分析统计方法
		 * 入参为数据json 为了适用于结果集被筛选过的情况
		 * @returns {Array}
		 */
		anaLyz:function(options) {
			var ana = new TheAnaLyze(options);
			var anaReturn = ana.anaLyzz();
			//如果分析方法返回的是一个object，那么就返回他，如果不是，就返回自身（支持链式调用）
			if(typeof (anaReturn) =='object'){
				return anaReturn;
			}else{
				return this;
			}

		},
		/**
		 * 横向对比分析方法 V1.1新增
		 * @param options
		 * @returns {$.fn.autoHeader}
		 */
		transCompare:function(options) {
			var ana = new TheAnaLyze(options);
			ana.transCompare();
			return this;
		}

	}


}(jQuery,window,document));