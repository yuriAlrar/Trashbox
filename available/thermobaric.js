function loading(){
	var gst = "rgba(69,69,69,0.5)";
	var disp = "rgba(69,69,69,1)";
	document.getElementById("submit_3").style.color = gst;

	document.getElementById("navi_2").style.color = disp;
	document.getElementById("state_2").style.color = disp;
	document.getElementById("navi_3_1").style.color = disp;
	document.getElementById("state_2").innerHTML = "ロード開始";
};
function ready(){
	var disp = "rgba(69,69,69,1)";
	document.getElementById("navi_2").style.display = disp;
	document.getElementById("state_2").innerHTML = "準備完了";
	document.getElementById("submit_3").style.color = disp;
	document.getElementById("navi_3_2").style.color = disp;
};
function state_2(){
	var gst = "rgba(69,69,69,0.5)";
	var disp = "rgba(69,69,69,1)";
	document.getElementById("submit_3").style.color = gst;

	document.getElementById("state_3").style.color = disp;
	document.getElementById("navi_3_3").style.color = disp;
	document.getElementById("progress_3").style.color = disp;
	document.getElementById("unit_3").style.color = disp;
	document.getElementById("state_2").innerHTML = "暗号開始";
	document.getElementById("state_3").innerHTML = "準備完了";
};
function state_3(){
	var gst = "rgba(69,69,69,0.5)";
	var disp = "rgba(69,69,69,1)";
	document.getElementById("state_2").innerHTML = "暗号完了";
	document.getElementById("state_3").innerHTML = "送信完了";
};
function state_ael( listObject ){
	var _sbt = document.getElementById("submit_3");
	var f = function(){
		_sbt.removeEventListener("click" , f , false);
		state_2();
		listObject.setpwd();
		listObject.repname();
		document.getElementById("sluch").innerHTML = listObject.pf;
		listObject.encrypt();
	};
	_sbt.addEventListener("click" , f , false );
}
function tgr_clear( _tgr ){
	_tgr.style.height = "0px";
	_tgr.style.display = "none";
	document.getElementById("panel_arr").style.transform = "rotate(90deg)"
}
function tgr_option( _tgr ){
	_tgr.style.display = "block";
	_tgr.style.height = "auto";
	document.getElementById("panel_arr").style.transform = "rotate(-90deg)"
}
function clear_grid(){
	document.getElementById("grid_area").innerHTML = "";
}
function push_grid( object , id ){
	document.getElementById("grid_area").innerHTML += 
	"<div id='i" + id + "' class='clicker grid border text_wrap'><div>" + object.name + "</div>" +
	"<div class='grid_add' style='text-align:right;'>" + RAunit( object.size ) + "/" + RAtime( object.date ) + "</div>" +
	"</div>";
};
function retstatus( form_data, state, callback ){
	const ccf = ( ( typeof state["progress_function"] ) == "function" )
			? state["progress_function"]
			: function(progress , param = null){ return; };
	const cfp = ( state["param"] ) ? state["param"] : 1;
	let frv = 0.0;
	let h = new XMLHttpRequest();
	h.upload.onloadstart = function(e){
		ccf(0, state["ready"], [cfp, frv] );
	};
	h.upload.onprogress = function(e){
		const tmp = e.loaded / e.total;
		ccf(tmp, state["progress"],  [cfp, frv] );
		frv = tmp;
	};
	h.upload.onloadend = function(e){
		ccf(1, state["finish"],  [cfp, frv] );
		return;
	};
	h.onreadystatechange = function(){
		if(h.readyState != 4 || h.status != 200){
			return;
		}
		else if(( typeof callback ) == "function"){
			callback();
		}
	};
	h.open("POST","./src/pst.py",true);
	h.send(form_data);
};
function sendPst( listObject ){
	var filename = ( nameCypher() ) ? listObject.namecypher : listObject.namehasher;
	var fragname = [];
	var date = new Date();
	var stmp = String(date.getFullYear())
			 + ( "0" + String(date.getMonth() + 1) ).slice(-2)
			 + ( "0" + String(date.getDate()) ).slice(-2)
			 + ( "0" + String(date.getHours()) ).slice(-2)
			 + ( "0" + String(date.getMinutes()) ).slice(-2)
			 + ( "0" + String(date.getSeconds()) ).slice(-2);
	for(let i = 0; i < listObject.list.length; i++ ){
		fragname.push( listObject.list[i].name );
	}
	var form_data = new FormData();
	var json = {
		"filename"  : filename,
		"filesize"  : listObject.size,
		"timestamp" : stmp,
		"flag"      : listObject.cflag,
		"option"    : listObject.options["iv"],
		"fragment"  : fragname
	};
	form_data.append( "@auth" , listObject.key );
	form_data.append( "@type" , "header");
	form_data.append( "@name" , "." + listObject.key  );
	form_data.append( "@bin"  , JSON.stringify( json ) );
	let state = {
		"ready":"送信開始",
		"progress":"送信中",
		"finish":"送信完了",
		"progress_function":function(progress, state, cfp){
			document.getElementById("state_3").innerHTML = state;
			return;
		}};
	retstatus( form_data, state);
	return;
};
function dir_rqs(){
	var h = new XMLHttpRequest();
	h.onreadystatechange = function(){
		if(h.readyState != 4 || h.status != 200){
			return;
		}
		var json_object = JSON.parse( h.responseText );
		view( json_object );
	};
	h.open("POST","./src/dret.py",true);
	h.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
	h.send( "@auth=" + ( new _DATA_LIST ).key );
};
/***
true : 降順
false: 昇順
***/
function sort(list , rule){
	let output = list;
	const i = rule ? 1 : -1;
	const j = rule ? -1 : 1;
	output.sort(function(a,b){
		if(a < b) return i;
		if(a > b) return j;
		return 0;
	});
	return output;
}
function view( h ){
	var list = [];
	var es = [];
	clear_grid();
	for( let i in h ){
		let json = JSON.parse( h[i] );
		list.push( parseInt(json["timestamp"]) );
		es[ json["timestamp"] ] = {
			"header" : i,
			"name" : ( json["filename"]  ) ? json["filename"]  : "unknown",
			"size" : ( json["filesize"]  ) ? json["filesize"]  : -1,
			"date" : ( json["timestamp"] ) ? json["timestamp"] : "000000000000"
		};
	}
	const newer = sort(list , true);
	for( var i in newer ){
		push_grid( es[ list[i] ] , i );
	}
	for( var i in newer ){
		(function(i , j){
			document.getElementById( "i" + String(j) ).addEventListener("click" , function(){
				window.open("./?para=" + i["header"]);
			} , false);
		}( es[ list[i] ] , i),false);
	}
}
function initial_proc(){
	customPwd();
}
document.addEventListener("DOMContentLoaded",function(){
	var List = new _DATA_LIST();
	var _body = document.getElementById("body");
	var _fina = document.getElementById("filename");
	var _evt_fina = document.getElementById("evt_fina")
	var _hud  = document.getElementById("hud");
	var _spd  = document.getElementById("legacy_fp");
	var _tgr = document.getElementById("panel_tgr");
	var _sub = document.getElementById("panel_sub");

	var _pws = document.getElementById("pws");
//DOMロードが完了した時点で最初に行う処理
	initial_proc();
	dir_rqs();
	_body.addEventListener( "dragover" , function(evt){
		evt.preventDefault();
		evt.stopPropagation();
		_hud.style.display = "block";
	} , false );
	_body.addEventListener( "dragleave" , function(evt){
		evt.preventDefault();
		evt.stopPropagation();
		_hud.style.display = "none";
	} , false );
	_body.addEventListener( "drop" , function(evt){
		evt.preventDefault();
		evt.stopPropagation();
		_hud.style.display = "none";
		var files = evt.dataTransfer.files;
		_fina.innerHTML = files[0].name;
		if( _sub.style.height == "0px" ) _tgr.click();
		fp(List , files[0]);
	} , false );
	_spd.addEventListener( "change" , function(evt){
		_fina.innerHTML = _spd.value;
		if( _sub.style.height == "0px" ) _tgr.click();
		fp( List , _spd.files[0]);
	} , false );
	_tgr.addEventListener("click" , function(){
		( _sub.style.height == "0px" ) ? ( tgr_option(_sub) ) : ( tgr_clear(_sub) );
	} , false );

	_pws.addEventListener("click" , customPwd  ,false);
},false);
