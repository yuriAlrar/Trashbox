function GetPara(){
	var result = {};
	if( 1 < window.location.search.length ){
		var paratrooper = window.location.search.substring(1).split("&");
		for( var i = 0; i < paratrooper.length; i++ ){
			var element = paratrooper[i].split( '=' );
			result[ decodeURIComponent( element[ 0 ] ) ] = decodeURIComponent( element[ 1 ] );
		}
	}
	return result;
};
function JointPath(param = ""){
	var loc = location.protocol + "//" + location.hostname + location.pathname + param;
	return loc
};
function jointBuffer( list ){
	let lex = [];
	let len = list.length;
	for(let i = 0; i < len; i++ ){
		lex.push( list[i].raw );
	}
	let offset = 0;
	let stream = new Blob( lex );
//	const cap = new ArrayBuffer(size);
//	let stream = new Uint8Array( cap );
	return stream;
	/**
	for(let i = 0; i < len; i++ ){
		stream.set( list[i].raw, offset );
		offset += list[i].raw.length;
	}
	return stream;
	**/
};
function blobLoad( listObject , point ){
	var _lost = document.getElementById("load_status");
	let loc = listObject.list[ point ].raw;
	let mag = 1 / listObject.list.length;
	let basis = point / listObject.list.length;
//	console.log("fragment" , loc );

	let h = new XMLHttpRequest();
	h.open("GET", loc , true);
	h.responseType = 'arraybuffer';
	h.onloadstart = function(e){
		_lost.innerHTML = Math.floor( basis * 100 ) + "%";
	}
	h.onprogress = function(e){
		_lost.innerHTML = Math.floor( ( basis + ( e.loaded / e.total ) * mag ) * 100 ) + "%";
	}
	h.onload = function (e){
		_lost.innerHTML = Math.floor( ( basis + mag ) * 100 ) + "%";
		if( !h.response ){
			return;
		}
		var fragment = toBase64( new Uint8Array( h.response ) );
		listObject.list[ point ].bin = fragment;
		listObject.decrypt( point );
		if( listObject.list[ point + 1 ] ){
			blobLoad( listObject, point + 1 );
		}
		else{
			_lost.innerHTML = "100%";
			const stream = jointBuffer( listObject.list );
			const urlSch = window.URL.createObjectURL(stream);
/*** 復号完了後の処理 ***/
			let view  = document.getElementById("opt_viw");
			let dwn   = document.getElementById("opt_dwn");
			view.style.color = "#FFFFFF";
			view.href = urlSch;

			dwn.style.color = "#FFFFFF";
			dwn.href = urlSch;
			dwn.download = listObject.name;
			_lost.innerHTML = '<span style="color:#38B48B;">復号完了</span>';
			console.log(listObject.name);
/***/
		}
	}
	h.send();
};
function checker( listObject ){
	var _lost = document.getElementById("load_status");
	var burn  = document.getElementById("dec_burn");
//キーチェック
	var _FS = function( ){
		var dec_key = retPhrase( document.getElementById("dec_key").value );
		listObject.pf = ( dec_key != null ) ? dec_key : "default_key";
		_lost.innerHTML = '復号中';
		var _fs = function(flag){
			if(flag == false){
				_lost.innerHTML = '<span style="color:#EB6101;">復号キーが間違っているか、データが破損しています</span>';
			}
			else{
				_lost.innerHTML = '<span style="color:#38B48B;">キーチェック完了</span>';
				burn.removeEventListener("click" , _FS , true);
			}
			return flag;
		};
		if( _fs( listObject.checker() ) ){
			setTimeout( function(){
				_lost.innerHTML = 'Ready';
				listObject.decname();
				blobLoad( listObject , 0 );
			} , 25 );
		}
	};
	burn.addEventListener("click" , _FS , true);
};
function make_dl_object( sl , jp = "" ){
	let dali = new _DATA_LIST();
	for( var i in sl["fragment"] ){
		var refer = new _REFER();
		refer.raw = jp + sl["fragment"][i];
		refer.bin = null;
		dali.list.push( refer );
	}
	dali.key = "no need";
	dali.setiv( sl["iv"] );
	dali.size = sl["filesize"];
	if( parseInt( sl["filename"] , 16 ) ){
		dali.namehasher = sl["filename"];
	}
	else{
		dali.namecypher = sl["filename"];
	}
	dali.cflag = sl["flag"];
	return dali;
};
document.addEventListener("DOMContentLoaded",function(){
	var para = GetPara();
	var loc = JointPath("arc/" + para["para"]);
	var h = new XMLHttpRequest();
	var _lost = document.getElementById("load_status");
	h.open("GET", loc , true);
	h.responseType = 'json';
	h.onloadstart = function(e){
		_lost.innerHTML = "準備完了";
	}
	h.onprogress = function(e){
		_lost.innerHTML = "ヘッダーロード中&raquo;" + ( ( e.loaded / e.total ) * 100 ).toString() + "%";
	}
	h.onload = function (e){
		_lost.innerHTML = "パスワード入力待機";
		var sl = h.response;
		var lo = make_dl_object( sl , JointPath("arc/") );
		checker( lo );
	}
	h.send();
	console.log("header",loc);
},false);
