"use strict";
var _DATA_LIST = function(){
	this.list = [];
	this.tag = [];
	this.key = false;
	this.name = "";
	this.ext = "unknown";
	this.namehasher = null;
	this.namecypher = null;
	this.size = -1;
	this.pf = null;
	this.options = {};
	this.flag = false;
	this.fragsize = 4194304;
	this.flag_word = "true";
	this.cflag = null;
	this.ver = "0.5.2b",
	this.setkey();
	this.init();
	this.state = new load_state();
};
_DATA_LIST.prototype.init = function(){
	const rdm = Math.floor( Math.random() * 33 ) + 32;
	this.pf = random(rdm);
	this.options = { iv: CryptoJS.lib.WordArray.random(128 / 8) , mode: CryptoJS.mode.CBC , padding: CryptoJS.pad.Pkcs7};
};
_DATA_LIST.prototype.setiv = function( v ){
	this.options = { iv: v , mode: CryptoJS.mode.CBC , padding: CryptoJS.pad.Pkcs7};
};
_DATA_LIST.prototype.setkey = function(){
	var cookie = document.cookie;
	this.key = cookie.split(";")[0].split("=")[1];
	console.log(this.key);
	return;
};
var _REFER = function(){
	this.name = "";
	this.raw = null;
	this.bin = null;
}
_DATA_LIST.prototype.repname = function(){
	this.cflag = String(CryptoJS.AES.encrypt(this.flag_word, this.pf, this.options) );
	var namecypher = String( CryptoJS.AES.encrypt(this.name, this.pf, this.options) );
	this.namecypher = namecypher;
	this.namehasher = (new jsSHA( this.name, "ASCII") ).getHash("SHA-256", "HEX") + this.ext;
	return;
};
_DATA_LIST.prototype.setpwd = function(p){
	this.pf = p;
};
_DATA_LIST.prototype.dumpsize = function(){
	this.size = 0;
	for(let i = 0;i < this.list.length; i++ ){
		this.size += this.list[i].bin.size;
	}
};
_DATA_LIST.prototype.checker = function(){
	var pflag = (CryptoJS.AES.decrypt( this.cflag , this.pf , this.options ) ).toString(CryptoJS.enc.Utf8);
	this.flag = ( pflag != this.flag_word ) ? false : true ;
	return this.flag;
};
_DATA_LIST.prototype.encrypt = function(){
	this.repname();
	const _F = function( datalist , point, resolve, reject ){
		window.setTimeout(function(){
			let refer = datalist.list[point];
			let encrypted = CryptoJS.AES.encrypt( refer.raw , datalist.pf , datalist.options );
			refer.raw = null;
			let buffer = toBuffer( String(encrypted) );
			refer.bin = new Blob( [buffer.buffer] );
			refer.name = datalist.key + "_" + point;
			datalist.list[point] = refer;
			datalist.state.loading( Math.floor( ( ( point + 1 ) / datalist.list.length) * 100) );
			if( !datalist.list[point + 1] ){
				datalist.state.loaded();
				resolve("hello promise");
			}
		}, 8);
		if( datalist.list[point + 1] ){
			_F( datalist , point + 1, resolve, reject );
		}
		return;
	}
	this.state.load();
	console.log("pw>>>",this.pf);
    return new Promise( (resolve, reject) => _F( this , 0, resolve, reject ));
};
_DATA_LIST.prototype.decname = function( point ){
	if( this.namecypher ){
		this.name = CryptoJS.AES.decrypt( this.namecypher, this.pf, this.options).toString(CryptoJS.enc.Utf8);
	}
	else{
		this.name = this.namehasher;
	}
	return;
};
_DATA_LIST.prototype.decrypt = function(point){
	var refer = this.list[point];
	var decrypted;
	var namecypher;
	decrypted = CryptoJS.AES.decrypt( refer.bin , this.pf , this.options );
	var buffer = toBuffer( decrypted.toString(CryptoJS.enc.Utf8) );
	refer.raw = buffer;
	refer.bin = null;
	this.list[point] = refer;
	return;
};
_DATA_LIST.prototype.safeSend = function(point = 0){
	this.state.load();
	let _F = function(datalist, point, resolve, reject){
		let form_data = new FormData();
		form_data.append( "@auth" , datalist.key );
		form_data.append( "@type" , "fragment");
		form_data.append( "@name" , datalist.list[point].name );
		form_data.append( "@bin"  , datalist.list[point].bin );
		let state = {
			"ready"   :"開始",
			"progress":"送信中",
			"finish"  :"送信完了",
			"param"   :( 1 / datalist.list.length ),
			"progress_function":datalist.state.loading
		};
		retstatus(form_data, state).then(function(value){
			if( datalist.list[point + 1] ){
				_F(datalist, point + 1, resolve, reject);
				console.log("next",point);					
			}
			else{
				datalist.state.loaded();
				resolve();
			}
		});
		return;
	}
	return new Promise( (resolve, reject) => _F( this , 0, resolve, reject ));
}
_DATA_LIST.prototype.fp = function(file){
//	let datalist = new _DATA_LIST();
	this.list = [];
	const ext = (file.name).match(/\.[^\.]+$/);
	this.ext = (ext && ext[0]) ? ext[0] : "unk";
	const fs = this.fragsize;
	const frag = (file.size < fs) ? 1 : Math.ceil( file.size / fs );
	const fpp = ( 1 / frag );
	let _st2 = document.getElementById("state_2");
	this.name = file.name;
	const _F = function( datalist, number, point ){
		var reader = new FileReader();
		var chunk = file.slice( point , point + fs );
		reader.readAsArrayBuffer( chunk );
		reader.onload = function() {
			let ald = Math.floor( fpp * number * 100 );
			datalist.state.loading(ald);
			let refer = new _REFER();
			refer.raw = toBase64( new Uint8Array( reader.result ) );
			datalist.list[number] = refer;
			( number + 1 < frag )
			 ? ( _F( datalist, number + 1, point + fs ) )
			 : ( datalist.state.loaded() );
		};
		return;
	};
	this.state.load();
	_F( this, 0, 0 );
	return;
};
_DATA_LIST.prototype.add_tag = function(tag){
	this.tag = tag;
}
_DATA_LIST.prototype.clear_tag = function(){
	this.list = [];
}
let load_state = function(){
	this.load;
	this.loading;
	this.loaded;
	this.callback;
}
load_state.prototype.load = function(){
	return;
}
load_state.prototype.loading = function(){
	return;
}
load_state.prototype.loaded = function(){
	return;
}
let _HUB = function(){
	this.hub = {};
};
_HUB.prototype.set_data = function(key,value){
	this.hub[key] = value;
	return;
}
function random( l ){
	var c = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+-/*:;'\"";
	var cl = c.length;
	var r = "";
	for(var i=0; i<l; i++){
		r += c[Math.floor(Math.random()*cl)];
	}
	return r;
};
function retPhrase( apw ){
	var inm;
	if( apw == "" || apw == null || apw == undefined ){
		inm = null;
	}
	else{
		inm = apw;
	}
	return inm;
};
var customPwd = function(){
	var inm = null;
	var apw = document.getElementById("apw");
	if( document.getElementById("pws").checked ){
		apw.disabled = "";
		inm = retPhrase( apw.value );
	}
	else{
		apw.disabled = "true";
		inm = null;

	}
	return inm;
};
function RAunit(i){
	let unit = "Byte";
	let value = parseInt(i);
	if(value > 1073741824){
		value = value / 1073741824;
		unit = "GByte";
	}
	else if(value > 1048576){
		value = value / 1048576;
		unit = "MByte";
	}
	else if(value > 1024){
		value = value / 1024;
		unit = "KByte";
	}
	else{
		unit = "-unk.unit"
	}
	value = value.toFixed(2);
	return value.toString(10) + unit;
};
function RAtime(i){
	var str = String(i);
	var sst = str.substr(0,4) + "/" + str.substr(4,2) + "/" + str.substr(6,2) + "/" + str.substr(8,2) + ":" + str.substr(10,2);
	return sst;
};
function breakKey(){
	console.log("vk");
	const dt = ( new Date('1999-12-31T23:59:59Z') ).toUTCString();
	document.cookie = "rst=; expires=" + dt;
	var h = new XMLHttpRequest();
	h.onreadystatechange = function(){
		if(h.readyState != 4 || h.status != 200){
			return;
		}
	};
	h.withCredentials = true;
	h.open("GET",urls,true);
	h.send();
};
var bin2hex = function( u8a ){
	let mode_hex = "";
	let padding;
	const ua = new Uint8Array( u8a );
	for(let i = 0; i < ua.length; i++){
		padding = ( "0" + ua[i].toString(16) ).slice(-2);
		mode_hex = mode_hex + padding;
	}
	return mode_hex;
};
var hex2bin = function( hex ){
	var hb = Math.ceil( hex.length / 2 );
	var buffer = new Uint8Array( hb );
	var f_p = 0;
	var e_p = 1;
	for (var j = 0; j < hb; j++) {
		var first = String( hex.substr(f_p , 1) );
		var end   = String( (e_p < hex.length) ? hex.substr(e_p, 1) : "" );
		var cargo = first + end;
		buffer[j] = parseInt( cargo , 16);
		f_p += 2;
		e_p += 2;
	}
	return buffer;
}
var toBuffer = function(base64) {
	var bin = atob( base64 );
	var buffer = new Uint8Array(bin.length);
	for (var i = 0; i < bin.length; i++) {
		buffer[i] = bin.charCodeAt(i);
	}
	return buffer;
};
var toBase64 = function( u8a ){
	var string = "";
	for(var i = 0; i < u8a.length; i++ ){
		string += String.fromCharCode( u8a[i] );
	}
	var base64 = btoa( string );
	return base64;
};

