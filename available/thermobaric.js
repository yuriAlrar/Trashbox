const urls = location.protocol + "//" + location.hostname;
console.log(urls);
function clear_grid(){
	document.getElementById("grid_area").innerHTML = "";
}
function push_grid( object , id ){
	document.getElementById("grid_area").innerHTML += 
	"<div id='i" + id + "' class='clicker grid border text_wrap'>"+
		"<div>" + object.name + "</div>" +
		"<div id='t" + id + "'>unknown</div>"+
		"<div class='mNotice' style='font-size:0.8em;text-align:right;'>" + 
			(object.ext).replace(".","") + "/" + RAunit(object.size) + " - " + RAtime(object.date) +
		"</div>" +
	"</div>";
	const path = (object.tag) ? (urls + "/arc/" + object.tag) : undefined;
	if( path ){
		var h = new XMLHttpRequest();
		h.open( 'GET', path, true );
		h.onreadystatechange = function(){
			if( this.readyState == 4 && this.status == 200 ){
				if( this.response ){
					const tls = this.response.map(decodeURIComponent);
					let ta = document.getElementById("t" + id);
					ta.innerHTML = "";
					for(var i = 0; i < tls.length; i++ ){
						ta.innerHTML += '<span class="ui label">' + tls[i] + '</span>';
					}
				}
			}
		}
		h.responseType = 'json';
		h.send();
	}
};
function retstatus( form_data, state ){
	const ccf = ( ( typeof state["progress_function"] ) == "function" )
			? state["progress_function"]
			: function(progress , param = null){ return; };
	const cfp = ( state["param"] ) ? state["param"] : 1;
	let frv = 0.0;//直前の進捗パラメータ
	return new Promise( function(resolve, reject){
		let h = new XMLHttpRequest();
		h.upload.onprogress = function(e){
			const tmp = e.loaded / e.total;
			//console.log("現在値:",tmp,"増加量",(tmp - frv), "進捗",(tmp - frv) * cfp );
			ccf( (tmp - frv) * cfp, state["progress"]);
			frv = tmp;
		};
		h.upload.onloadend = function(e){
			resolve("ok");
		}
		h.open("POST","./src/pst.py",true);
		h.send(form_data);	
	} );
};
function sendPst( datalist, ifc ){
	var filename = ( ifc ) ? datalist.namecypher : datalist.namehasher;
	var fragname = [];
	var date = new Date();
	var stmp = String(date.getFullYear())
			 + ( "0" + String(date.getMonth() + 1) ).slice(-2)
			 + ( "0" + String(date.getDate()) ).slice(-2)
			 + ( "0" + String(date.getHours()) ).slice(-2)
			 + ( "0" + String(date.getMinutes()) ).slice(-2)
			 + ( "0" + String(date.getSeconds()) ).slice(-2);
	for(let i = 0; i < datalist.list.length; i++ ){
		fragname.push( datalist.list[i].name );
	}
	var form_data = new FormData();
	var json = {
		"filename"  : filename,
		"extension" : datalist.ext,
		"filesize"  : datalist.size,
		"timestamp" : stmp,
		"version"   : datalist.ver,
		"flag"      : datalist.cflag,
		"option"    : datalist.options["iv"],
		"fragment"  : fragname,
		"tag"		: datalist.key + ".t" 
	};
	form_data.append( "@auth" , datalist.key );
	form_data.append( "@type" , "header");
	form_data.append( "@name" , "." + datalist.key  );
	form_data.append( "@bin"  , JSON.stringify( json ) );
	let state = {
		"ready":"ヘッダ",
		"progress":"確認中",
		"finish":"完了"
		};
	retstatus( form_data, state).then(function(value){
		console.log("sendpst");
	});
	return;
};
function sendTag( datalist, itc ){
	var form_data = new FormData();
	var json = (itc) ? itc : [];
	console.log(JSON.stringify( json ));
	form_data.append( "@auth" , datalist.key );
	form_data.append( "@type" , "tag");
	form_data.append( "@name" , datalist.key + ".t" );
	form_data.append( "@bin"  , JSON.stringify( json ) );
	let state = {
		"ready":"タグ送信",
		"progress":"確認中",
		"finish":"完了"
		};
	retstatus( form_data, state).then(function(value){
		console.log("sendpst");
	});
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
			"ext"  : ( json["extension"] ) ? json["extension"] : "unknown",
			"name" : ( json["filename"]  ) ? json["filename"]  : "unknown",
			"size" : ( json["filesize"]  ) ? json["filesize"]  : -1,
			"date" : ( json["timestamp"] ) ? json["timestamp"] : "unknown",
			"tag"  : ( json["tag"] ) ? json["tag"] : undefined
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
document.addEventListener("DOMContentLoaded",function(){
	let _body = document.getElementById("body");
	_body.addEventListener( "dragover" , function(evt){
		evt.preventDefault();
	} , false );
	_body.addEventListener( "dragleave" , function(evt){
		evt.preventDefault();
	} , false );
	_body.addEventListener( "drop" , function(evt){
		evt.preventDefault();
	} , false );
},false);
