/**
 * autoHeader 应用
 * created by Finira 2016-1-11
 */



$(function(){
    //返回列表按钮
    $('#backlist').on('click', function() {
        $('#listdiv').slideDown();
        $('#viewdiv').slideUp();
    });
    $('#compare_avg').on('click', function(e) {
        $.fn.autoHeader.anaLyz({anaJson:currentJson,baseJson:bodyjson,anatype:'avg',tableid:'tabled',digit:2,compare:{enable:true}});
    });
    $('#compare_max').on('click', function(e) {
        $.fn.autoHeader.anaLyz({anaJson:currentJson,baseJson:bodyjson,anatype:'max',tableid:'tabled',digit:2,compare:{enable:true}});
    });
    $('#compare_min').on('click', function(e) {
        $.fn.autoHeader.anaLyz({anaJson:currentJson,baseJson:bodyjson,anatype:'min',tableid:'tabled',digit:2,compare:{enable:true}});
    });
    $('#compare_all').on('click', function(e) {
        $.fn.autoHeader.anaLyz({anaJson:currentJson,baseJson:bodyjson,anatype:'all',tableid:'tabled',digit:2,compare:{enable:true}});
    });

    $.fn.zTree.init($("#treeDemo_org"), setting, treejson_);

    //筛选按钮
    $('#generator').on('click', function() {
        //获取表头筛选数据，重新生成table
        var treeObj = $.fn.zTree.getZTreeObj("header_tree");
        var nodes = treeObj.getCheckedNodes();
        var bodyjson_ = getSelectOrg();
        initTable("tabled",nodes,bodyjson_);
        $("#containdivcnt").hide();
        //统计总表清空
        $('#tabledcnt').empty();
        //表头树默认缩回
        $('#headtre').slideUp();
        $('#headerchoose').html('<span class="glyphicon glyphicon-tasks" aria-hidden="true"></span>&nbsp;选择表头');

    });


    //最大化按钮功能
    $("#maxbt").on('click', function() {
        if(!ismax){
            $('#refdiv').fadeOut();
            $('#navs').fadeOut();
            $('#alldiv').fadeIn();
            $(this).html('<span class="glyphicon glyphicon-resize-small" aria-hidden="true"></span>&nbsp;回复原状');
            //复制按钮和table的内容到alldiv 中
            $('#buttons').insertBefore('#dtiyp');
            //增加导航css，滚动条滚动导航条不动
            $('#buttons').addClass('navbar-fixed-top');
            $('#analyzz').insertAfter('#dtiyp');
            $('#containdivcnt').insertAfter('#dtiyp');
            $('body').attr('class','bodyafter');
            //$('#tabled').insertAfter('#tabledcnt');
            //$('#container').insertAfter('#tabled');
            ismax = true;
        }else{
            //div隐藏关系改变，按钮和table内容重新复制回原来的位置
            $('#alldiv').fadeOut();
            $('#navs').fadeIn();
            $('#refdiv').fadeIn();
            $('#buttons').insertBefore('#datev');
            $('#analyzz').insertAfter('#tablepositonid');
            $('#containdivcnt').insertAfter('#datev');
            //$('#tabled').insertAfter('#tabledcnt');
            //$('#container').insertAfter('#tabled');
            $('#buttons').removeClass('navbar-fixed-top');
            $(this).html('<span class="glyphicon glyphicon-fullscreen" aria-hidden="true"></span>&nbsp;最大化');
            $('body').attr('class','bodypre');
            ismax = false;
        }

    });

    //表头树，按钮激发
    $('#headerchoose').on('click', function(e) {
        if($('#headtre').is(":hidden")){
            $('#headtre').slideDown();
            $(this).html('<span class="glyphicon glyphicon-tasks" aria-hidden="true"></span>&nbsp;收回表头');
        }else{
            $('#headtre').slideUp();
            $(this).html('<span class="glyphicon glyphicon-tasks" aria-hidden="true"></span>&nbsp;选择表头');
        }
    });

});



/**
 * 根据选择的部门信息过滤数据包，将符合条件的留下
 */
function validateBodyJson(orgstr){
    if(orgstr){
        var newJson =[];
        //循环json，获取上报部门ID字段
        $.each(bodyjson, function (j,itemj) {
            var orgcode = "_"+itemj.rep_org_code+"_";
            //如果不在选中的部门ID范围内 则删除数据
            if(orgstr.indexOf(orgcode)>=0){
                newJson.push(itemj);
            }
        });
        return newJson;
    }
}


//定义树
var setting = {
    check: {
        enable: true,
        chkboxType:{ "Y":"ps", "N":"ps"}

    },
    data: {
        simpleData: {
            enable: true
        }
    }
};

var code;
var ismax=false;
var treejson=null;
var bodyjson = null;
var currentJson =null;



/**
 * 初始化表格方法
 */
function initTable(tableId,headstr,bodystr){

    $.fn.autoHeader.init({
        laynum:5,
        headJson:headstr,
        dataJson:bodystr,
        tableid:'tabled',
        needsort:true,
        cssConfig:{
            table:' table-hover  table-striped table-bordered table-responsive',
            tr:''
        }
    });
}


//表格初始化
function showView(){
    $('#listdiv').slideUp();
    $('#viewdiv').slideDown();
    var headjson_ = header_;
    var bodyjson_= dataer_;
    treejson = headjson_ ;
    currentJson = bodyjson = bodyjson_ ;
    initTable("tabled",headjson_,bodyjson_);
    $.fn.zTree.init($("#header_tree"), setting, treejson);

}

function getSelectOrg(){
    var treeOrg = $.fn.zTree.getZTreeObj("treeDemo_org");
    var orgnodes = treeOrg.getCheckedNodes();

    var orgstr='_';
    //循环遍历已选部门 打包部门ID
    $.each(orgnodes, function (i, item) {
        orgstr += item.id+"_";
    });
    var bodyjson_ = bodyjson;
    //如果有选择部门，就去筛选body数据
    if(orgstr!='_' ){
        bodyjson_ = validateBodyJson(orgstr);
    }
    currentJson = bodyjson_;
    //console.log(JSON.stringify(currentJson) );
    return bodyjson_;
}



var treejson_ = [{id:1,  name: "三年级","isParent":1,"open":false},
    {id:232, "pid":1, name: "三年一班","open":false,icon:"../../src/css/ztree/img/diy/2.png"},
    {id:240, "pid":1, name: "三年二班","open":false,icon:"../../src/css/ztree/img/diy/2.png"},
    {id:701, "pid":1, name: "三年三班","open":false,icon:"../../src/css/ztree/img/diy/2.png"},
    {id:89, "pid":1, name: "三年四班","open":false},
    {id:247, "pid":1, name: "三年五班","open":false},
    {id:262, "pid":1, name: "三年六班","open":false},
    {id:281, "pid":1, name: "三年七班","open":false},
    {id:294, "pid":1, name: "三年八班","open":false},
    {id:313, "pid":1, name: "三年九班","open":false},
    {id:702, "pid":1, name: "三年十班","open":false},
    {id:703, "pid":1, name: "三年十一班","open":false},
    {id:704, "pid":1, name: "三年十二班","open":false}

];

var dataer_ = [{"column_001":"99.21","column_002":"99.74","column_003":"98.90","column_004":"99","column_005":"100","column_006":"99.29","column_007":"99.70","column_008":"97.59","column_009":"99.10","column_010":"98.89","id":227,"main_id":214,"rep_org_code":"232","rep_org_name":"三年一班","report_id":5},{"column_001":"98.91","column_002":"99.39","column_003":"97.90","column_004":"99","column_005":"100","column_006":"98.89","column_007":"99.86","column_008":"98.01","column_009":"98.90","column_010":"99.02","id":228,"main_id":201,"rep_org_code":"240","rep_org_name":"三年二班","report_id":5},{"column_001":"98.78","column_002":"99.23","column_003":"98.30","column_004":"99","column_005":"100","column_006":"98.96","column_007":"99.88","column_008":"95.43","column_009":"98.28","column_010":"98.06","id":229,"main_id":208,"rep_org_code":"703","rep_org_name":"三年十一班","report_id":5},{"column_001":"97.98","column_002":"95.59","column_003":"98.10","column_004":"98.50","column_005":"100","column_006":"97.66","column_007":"100","column_008":"97.81","column_009":"99.78","column_010":"99.28","id":230,"main_id":206,"rep_org_code":"701","rep_org_name":"三年三班","report_id":5},{"column_001":"97.88","column_002":"96.49","column_003":"98.80","column_004":"99","column_005":"100","column_006":"98.29","column_007":"98.79","column_008":"97.16","column_009":"91.96","column_010":"96.25","id":231,"main_id":219,"rep_org_code":"281","rep_org_name":"三年七班","report_id":5},{"column_001":"97.84","column_002":"95.61","column_003":"97.95","column_004":"100","column_005":"100","column_006":"98.07","column_007":"97.37","column_008":"97.31","column_009":"95.89","column_010":"96.91","id":232,"main_id":205,"rep_org_code":"313","rep_org_name":"三年九班","report_id":5},{"column_001":"97.54","column_002":"95.13","column_003":"97.90","column_004":"98.50","column_005":"100","column_006":"97.46","column_007":"100","column_008":"96.28","column_009":"96.65","column_010":"97.88","id":233,"main_id":209,"rep_org_code":"704","rep_org_name":"三年十二班","report_id":5},{"column_001":"97.23","column_002":"96.17","column_003":"97","column_004":"98.50","column_005":"100","column_006":"97.50","column_007":"99.85","column_008":"95.37","column_009":"91.94","column_010":"96.13","id":235,"main_id":215,"rep_org_code":"89","rep_org_name":"三年四班","report_id":5},{"column_001":"97.01","column_002":"92.18","column_003":"97.90","column_004":"98.50","column_005":"100","column_006":"96.57","column_007":"99.85","column_008":"97.69","column_009":"98.41","column_010":"98.77","id":236,"main_id":202,"rep_org_code":"247","rep_org_name":"三年五班","report_id":5},{"column_001":"95.56","column_002":"87.87","column_003":"98.55","column_004":"98","column_005":"100","column_006":"95.33","column_007":"98.68","column_008":"97.85","column_009":"92.16","column_010":"96.48","id":237,"main_id":203,"rep_org_code":"262","rep_org_name":"三年六班","report_id":5},{"column_001":"94.74","column_002":"83.24","column_003":"98.35","column_004":"98.50","column_005":"100","column_006":"94.03","column_007":"97.62","column_008":"96.81","column_009":"98.36","column_010":"97.60","id":238,"main_id":207,"rep_org_code":"702","rep_org_name":"三年十班","report_id":5},{"column_001":"92.15","column_002":"75.50","column_003":"96.50","column_004":"97.50","column_005":"100","column_006":"90.85","column_007":"97.56","column_008":"97.21","column_009":"97.22","column_010":"97.35","id":239,"main_id":220,"rep_org_code":"294","rep_org_name":"三年八班","report_id":5}];
var header_ = [{"checked":1,"cssstyle":"","headDesc":"三年级综合考试评定分析","id":502,"isleaf":"N","isopen":0,"level":"0","name":"三年级综合考试评定分析","pid":502,"reportColumnName":"","reportColumnType":"String","sts":"Y","transanalyzz":"","treeCode":"12","type":"org_exam"},{"checked":1,"cssstyle":"","headDesc":"","id":503,"isleaf":"Y","isopen":0,"level":"1","name":"班级","pid":502,"reportColumnName":"rep_org_name","reportColumnType":"String","sts":"Y","transanalyzz":"","treeCode":"1210","type":"org_exam"},{"checked":1,"cssstyle":"","headDesc":"80%A+20%B","id":504,"isleaf":"Y","isopen":0,"level":"1","name":"综合总分","pid":502,"reportColumnName":"column_001","reportColumnType":"Number","sts":"Y","transanalyzz":"","treeCode":"1211","type":"org_exam"},{"checked":1,"cssstyle":"","headDesc":"","id":505,"isleaf":"N","isopen":0,"level":"1","name":"考核项目","pid":502,"reportColumnName":"","reportColumnType":"String","sts":"Y","transanalyzz":"","treeCode":"1212","type":"org_exam"},{"checked":1,"cssstyle":"","headDesc":"描述","id":506,"isleaf":"N","isopen":0,"level":"2","name":"文化课程","pid":505,"reportColumnName":"","reportColumnType":"String","sts":"Y","transanalyzz":"","treeCode":"121210","type":"org_exam"},{"checked":1,"cssstyle":"","headDesc":"语文分数","id":507,"isleaf":"Y","isopen":0,"level":"3","name":"语文","pid":506,"reportColumnName":"column_002","reportColumnType":"String","sts":"Y","transanalyzz":"","treeCode":"12121010","type":"org_exam"},{"checked":1,"cssstyle":"","headDesc":"数学分数","id":508,"isleaf":"Y","isopen":0,"level":"3","name":"数学","pid":506,"reportColumnName":"column_003","reportColumnType":"Number","sts":"Y","transanalyzz":"","treeCode":"12121011","type":"org_exam"},{"checked":1,"cssstyle":"","headDesc":"综合科目分数","id":509,"isleaf":"Y","isopen":0,"level":"3","name":"综合科目","pid":506,"reportColumnName":"column_004","reportColumnType":"String","sts":"Y","transanalyzz":"","treeCode":"12121012","type":"org_exam"},{"checked":1,"cssstyle":"","headDesc":"外语","id":510,"isleaf":"Y","isopen":0,"level":"3","name":"外语","pid":506,"reportColumnName":"column_005","reportColumnType":"Number","sts":"Y","transanalyzz":"","treeCode":"12121013","type":"org_exam"},{"checked":1,"cssstyle":"","headDesc":"文化课程综合评估分数","id":511,"isleaf":"Y","isopen":0,"level":"3","name":"文化总体","pid":506,"reportColumnName":"column_006","reportColumnType":"Number","sts":"Y","transanalyzz":"","treeCode":"12121001","type":"org_exam"},{"checked":1,"cssstyle":"","headDesc":"综合素质","id":512,"isleaf":"N","isopen":0,"level":"2","name":"综合素质","pid":505,"reportColumnName":"","reportColumnType":"String","sts":"Y","transanalyzz":"","treeCode":"121211","type":"org_exam"},{"checked":1,"cssstyle":"","headDesc":"美术评定","id":513,"isleaf":"Y","isopen":0,"level":"3","name":"美术","pid":512,"reportColumnName":"column_007","reportColumnType":"Number","sts":"Y","transanalyzz":"","treeCode":"12121110","type":"org_exam"},{"checked":1,"cssstyle":"","headDesc":"体育评定","id":514,"isleaf":"N","isopen":0,"level":"3","name":"体育","pid":512,"reportColumnName":"","reportColumnType":"String","sts":"Y","transanalyzz":"","treeCode":"12121111","type":"org_exam"},{"checked":1,"cssstyle":"","headDesc":"基本体测评定","id":515,"isleaf":"Y","isopen":0,"level":"4","name":"体能测试","pid":514,"reportColumnName":"column_008","reportColumnType":"Number","sts":"Y","transanalyzz":"","treeCode":"1212111110","type":"org_exam"},{"checked":1,"cssstyle":"","headDesc":"体育考试评定","id":516,"isleaf":"Y","isopen":0,"level":"4","name":"体育考试","pid":514,"reportColumnName":"column_009","reportColumnType":"Number","sts":"Y","transanalyzz":"","treeCode":"1212111111","type":"org_exam"},{"checked":1,"cssstyle":"","headDesc":"综合总体评定分数","id":517,"isleaf":"Y","isopen":0,"level":"3","name":"综合总体","pid":512,"reportColumnName":"column_010","reportColumnType":"Number","sts":"Y","transanalyzz":"","treeCode":"12121101","type":"org_exam"}];
