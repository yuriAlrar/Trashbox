"use strict";
var _DATA_LIST = function(){
//断片化されたデータオブジェクト
	this.list = [];
//認証キー:
	this.key = false;
//ファイル名
	this.name = null;
//保存ファイル名(どちらか)
	this.namehasher = null;
	this.namecypher = null;
//ファイルサイズ
	this.size = -1;
//パスワード
	this.pf = null;
//暗号化オプション（IV:初期化ベクトル, CBCモード, パディングモード：PKCS7)
	this.options = {};
//フラグ(予約)
	this.flag = false;
//フラグサイズ(4MB)
	this.fragsize = 4194304;
	//this.fragsize = 2097152;
//暗号前のフラグフレーズ
	this.flag_word = "true";
//暗号化されたフフラグフレーズ
	this.cflag = null;
	this.setkey();
	this.init();
};
_DATA_LIST.prototype.init = function(){
	this.pf = random(64);
	this.options = { iv: CryptoJS.lib.WordArray.random(128 / 8) , mode: CryptoJS.mode.CBC , padding: CryptoJS.pad.Pkcs7};
};
_DATA_LIST.prototype.setiv = function( v ){
	this.options = { iv: v , mode: CryptoJS.mode.CBC , padding: CryptoJS.pad.Pkcs7};
};
_DATA_LIST.prototype.setkey = function(){
	var cookie = document.cookie;
	this.key = cookie.split(";")[0].split("=")[1];
	return;
};
_DATA_LIST.prototype.setpwd = function(){
	var originKey = customPwd();
	if( originKey != null ){
		this.pf = originKey;
	}
	return;
};
var _REFER = function(){
	this.name = "";
	this.raw = null;
	this.bin = null;
}
_DATA_LIST.prototype.repname = function(){
	this.cflag = String( CryptoJS.AES.encrypt( this.flag_word , this.pf , this.options ) );
	var namecypher = String( CryptoJS.AES.encrypt( this.name , this.pf , this.options ) );
	this.namecypher = String( namecypher );
	this.namehasher = ( new jsSHA( this.name , "ASCII") ).getHash("SHA-256", "HEX");
	return;
};
_DATA_LIST.prototype.dumpsize = function(){
	this.size = 0;
	for(let i = 0;i < this.list.length; i++ ){
		this.size += this.list[i].bin.size;
	}
};
_DATA_LIST.prototype.checker = function(){
	var pflag = ( CryptoJS.AES.decrypt( this.cflag , this.pf , this.options ) ).toString(CryptoJS.enc.Utf8);
	this.flag = ( pflag != this.flag_word ) ? this.flag = false : this.flag = true ;
	return this.flag;
};
_DATA_LIST.prototype.encrypt = function(){
	let _st2 = document.getElementById("state_2");
	const _F = function( datalist , point ){
		let refer = datalist.list[point];
		let encrypted = CryptoJS.AES.encrypt( refer.raw , datalist.pf , datalist.options );
		refer.raw = null;
		let buffer = toBuffer( String(encrypted) );
		refer.bin = new Blob( [buffer.buffer] );
		refer.name = datalist.key + "_" + point;
		datalist.list[point] = refer;
		if( datalist.list[point + 1] ){
			_st2.innerHTML = "暗号中:" + Math.floor( ( ( point + 1 ) / datalist.list.length) * 100) + "%";
			window.setTimeout(function(){
				_F( datalist , point + 1 );
			} , 16);
		}
		else{
			datalist.dumpsize();
			state_3();
			sendPst( datalist );
			datalist.safeSend(0);
			dir_rqs();
			breakKey();
		}
		return;
	}
	_F( this , 0 );
	return;
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
_DATA_LIST.prototype.safeSend = function(point){
	let form_data = new FormData();
	form_data.append( "@auth" , this.key );
	form_data.append( "@type" , "fragment");
	form_data.append( "@name" , this.list[point].name );
	form_data.append( "@bin"  , this.list[point].bin );
	let state = {
		"ready"   :"開始",
		"progress":"送信中",
		"finish"  :"送信完了",
		"param"   :( 1 / this.list.length ),
		"progress_function":function(progress, state, cfp){
			let _sf = document.getElementById("progress_3");
			const nv  = parseInt( _sf.innerHTML );
			const nxv = Math.round((progress - cfp[1]) * cfp[0] * 100);
			if(nxv == 0){
				return;
			}
			_sf.innerHTML = ( nv + nxv < 100 ) ? nv + nxv : 100;
			return;
	}};
	let _F = function(datalist, point){
		if( datalist.list[point + 1] ){
			datalist.safeSend(point + 1);
		}
		else{
			document.getElementById("progress_3").innerHTML = "100";
		}
		return;
	}
	retstatus( form_data, state, _F(this, point) );
	return;
}
var fp = function(listObject , file ){
	const fs = listObject.fragsize;
	const frag = Math.ceil( file.size / fs );
	const fpp = ( 1 / frag );
	let _st2 = document.getElementById("state_2");
	const _F = function( number, point ){
		var reader = new FileReader();
		var chunk = file.slice( point , point + fs );
		reader.readAsArrayBuffer( chunk );
		reader.onload = function() {
			let ald = Math.floor( fpp * number * 100 );
			_st2.innerHTML = "ロード中:" + ald + "%";
			let refer = new _REFER();
			refer.raw = toBase64( new Uint8Array( reader.result ) );
			listObject.name = file.name;
			listObject.list[number] = refer;
			( number + 1 <= frag ) ? ( _F( number + 1, point + fs ) ) : ( _G() );
		};
	};
	const _G = function(){
		ready();
		state_ael( listObject );
	};
	loading();
	_F( 0, 0 );
	return;
};
var nameCypher = function(){
	if( document.getElementById("ncy").checked ){
		return true;
	}
	else{
		return false;
	}
};
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
	var unit = "Byte";
	var value = parseInt(i);
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
	value = value.toFixed(2);
	return value.toString(10) + unit;
};
function RAtime(i){
	var str = String(i);
	var sst = str.substr(0,4) + "/" + str.substr(4,2) + "/" + str.substr(6,2) + "/" + str.substr(8,2) + ":" + str.substr(10,2);
	return sst;
};
function breakKey(){
	const dt = ( new Date('1999-12-31T23:59:59Z') ).toUTCString();
	document.cookie = "rst=; expires=" + dt;
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

