import React from 'react';
import ReactDOM from 'react-dom';

class TagWrapper extends React.Component{
    constructor(props){
		super(props);
		this.state = {
			defaultContent:"ここには設定予定のタグ/説明文がドバーっと表示されます",
		};
	}
	render(){
		const lle = this.props.list.map( (i) => {return(
			<div className="ui small label" key={i}>
				{i}
				<i className="clicker delete icon"
					onClick={ () => {
						this.props.dct(i);
					}
				}></i>
			</div>
		)});
		return(
			<div className="ui labels" style={{flexWrap:"wrap",alignItems:"stretch"}}>
				{ ( lle.length ) ? lle : this.state.defaultContent }				
			</div>
		);
	}
}
class AddTagPanel extends React.Component{
    constructor(props){
        super(props);
        this.state = {
			newTag:"",
			tagStatus:false,
			tagContent:[],
			dataList:this.props.dataList,
			hub:this.props.hub
		};
		this.setTag = this.setTag.bind(this);
		this.increaseTag = this.increaseTag.bind(this);
		this.decreaseTag = this.decreaseTag.bind(this);
		this.clearTag = this.clearTag.bind(this);
	}
	setTag(e){
		this.setState({
			newTag : e.target.value,
		});
	}
	decreaseTag(t){
		let list = this.state.tagContent;
		list = list.filter( (value, index) => {
			return value !== t;
		 } );
		 let ts = (list.length) ? true : false;
		 this.setState({
			tagContent:list,
			tagStatus:ts
		});
		const uel = list.map( encodeURIComponent );
		this.state.hub.set_data("itc",uel);
	}
	increaseTag(e){
		if( e.which != undefined && e.which != 13 ){
			return;
		}
//もっと正確な判定器を用意する
		if(this.state.newTag == ""){
			return;
		}
		let list = this.state.tagContent;
		list.push( this.state.newTag );
		list = list.filter( (value, index) => {
			return index === list.indexOf( value );
		 } );
		let ts = true;
		this.setState({
			tagContent:list,
			tagStatus:ts,
			newTag:""
		});
		const uel = list.map( encodeURIComponent );
		this.state.hub.set_data("itc",uel);
	}
	clearTag(e){
		this.state.dataList.clear_tag();
		this.setState({
			tagContent:[],
			tagStatus:false,
			newTag:""
		});
	}
	render(){
		const cn = ( ( this.state.tagStatus ) ? "mText" : "mPlaceholder" );
		this.state.dataList.add_tag(this.state.tagContent);
		return(
		<div>
			<div className="">
				ファイルに対してタグとか説明をつける
			</div>
			<div className="flex_box" style={{flexWrap:"wrap",alignItems:"flex-start"}}>
				<div className="flex_box" style={{alignItems:"center"}}>
					<div className="arrow direct_arrow"></div>
					<div className="ui mini action input">
						<input type="text" placeholder="タグの追加"
							value={this.state.newTag} 
							onChange={this.setTag} 
							onKeyPress={this.increaseTag}					
						/>
						<button className="ui mini button" onClick={this.increaseTag}>
							追加
						</button>
					</div>
					<div className="navi"></div>
				</div>
				<div className={cn} style={{flex:1}}>
					<TagWrapper dct={this.decreaseTag} list={this.state.tagContent} />
				</div>
				<button className="ui button mini" onClick={this.clearTag}>
					全部消す
				</button>
			</div>
		</div>
		);
	}
}
class UploadOptionPanel extends React.Component{
    constructor(props){
        super(props);
        this.state = {
			ifc:false,
			ifp:false,
			pw:"暗号処理後、ここにはパスワードが表示されます",
			hub:this.props.hub
		};
		this.setPw = this.setPw.bind(this);
		this.state.hub.set_data("ifc",this.state.ifc);
		this.state.hub.set_data("ifp",this.state.ifp);
    }
	setPw(e){
		this.setState({
			pw : e.target.value,
		});
		this.state.hub.set_data("pw",e.target.value);
	}
	render(){
		return(
			<div className="flex_box koyoso" style={{flexWrap:"wrap"}}>
				<div className="ui checkbox">
					<input id="fey" type="checkbox" className="hidden" checked="checked" disabled="disabled" />
					<label>
						ファイルを暗号化する
						<br />
						<span className="text_wrap mText" style={{fontSize:"0.9em"}}>暗号アルゴリズム：AES256</span>		
					</label>
				</div>
				<div className="ui checkbox"
					onClick={() => {
						const tf = !this.state.ifc;
						this.setState({ifc: (tf)});
						this.state.hub.set_data("ifc",tf);
					} }							
				>
					<input type="checkbox" className="hidden"
						value={this.state.ifc}
						checked={this.state.ifc} 
						onChange={() => {
							const tf = !this.state.ifc;
							this.setState({ifc: (tf)})
							this.state.hub.set_data("ifc",tf);
						} }		
					/>
					<label>
						ファイル名も暗号化する
						<br />
						<span className="mExplain">
							※ 暗号化しない場合、ファイル名はハッシュ化されます
						</span>							
					</label>
				</div>
				<div className="flex_v">
					<div className="ui checkbox" style={{flexGrow:1}}
						onClick={() => {
							const tf = !this.state.ifp;
							this.setState({ifp: (tf)})
							this.state.hub.set_data("ifp",tf);
						} }							
					>
						<input type="checkbox" className="hidden"
							checked={this.state.ifp} 
							onChange={() => {
								const tf = !this.state.ifp;
								this.setState({ifp: (tf)})
								this.state.hub.set_data("ifp",tf);
							}}
						/>
						<label>
							任意のパスワードを使用する
							<br />
							<span className="mExplain">
								※ 使用シない場合、ランダムなパスワードが与えられます
							</span>
						</label>
					</div>
					<div style={{paddingLeft:"20px"}}>
						<div className="flex_box">
							<div className="navi text_wrap marker">
									&raquo;
							</div>
							<div className="ui mini input" style={{minWidth:"256px"}}>
								<input type="password" style={{width:"100%"}}
									value={this.state.pw}
									onChange={this.setPw}
									disabled={!this.state.ifp}
								/>
							</div>
						</div>
						<div className="flex_box">
							<div className="navi text_wrap marker">
								&raquo;
							</div>
							<div id="sluch" className="text_wrap">
								<span className="mPlaceholder">
									暗号処理後、ここにはパスワードが表示されます
								</span>
							</div>
						</div>		
					</div>
				</div>
			</div>
		);
	}
}
class UploadFlowPanel extends React.Component{
/** 
 *  Step
 * 	0:ファイル選択待機
 * 	1:ファイルロード中
 * 	2:ファイルロード完了
 * 	3:ファイル暗号開始、暗号中
 * 	4:ファイル暗号完了
 * 	5:ファイル送信開始、送信中
 * 	6:ファイル送信完了
*/
    constructor(props){
        super(props);
        this.state = {
			step:0,
			loadStatus:"待機",
			loadProgress:0,
			cryptoStatus:"暗号化",
			cryptoProgress:0,			
			sendStatus:"アップロード",
			sendProgress:0,
			dataList:this.props.dataList,
		};
		this.setLS = this.setLS.bind(this);
		this.setStep = this.setStep.bind(this);
		this.preliminary = this.preliminary.bind(this);
		this.fileLoader = this.fileLoader.bind(this);
		this.sender = this.sender.bind(this);
	}
	setLS(m){
		this.setState(m);
	}
	setStep(m){
		const i = ( m !== undefined ) ? m : this.state.step + 1;
		this.setState({
			step:i
		});
		console.log("now step>>",this.state.step);
	}
	preliminary(e){
		this.fileLoader(e.target.files[0]);
	}
	fileLoader(f){
//ファイルロード中か、暗号開始後なら処理を中断
		if(this.state.step != 0 && this.state.step != 2){
			return;
		}
		let temp = this.props.dataList;
		const ss = this.setStep;
		const ls = this.setLS;
		temp.state.load = function(){
			ls({
				loadStatus:"ロード開始",
				loadProgress:0
			});
			ss();
		}
		temp.state.loading = function(ald){
			ls({
				loadStatus:"ロード中",
				loadProgress:ald
			});
		}
		temp.state.loaded = function(){
			ls({
				loadStatus:"ロード完了",
				loadProgress:100
			});
			ss();
		}
		this.state.dataList.fp(f);
	}
	sender(){
//		console.log(this.state.dataList);
		console.log(this.props.hub["hub"]);
		if(this.state.step != 2){
			return;
		}
		let temp = this.props.dataList;
		const ifc = this.props.hub["hub"]["ifc"];
		const ifp = this.props.hub["hub"]["ifp"];
		const ipw = this.props.hub["hub"]["pw"];
		const itc = this.props.hub["hub"]["itc"];
		const ss = this.setStep;
		const ls = this.setLS;
		const sp = (param, status) => {
			const np = Math.round( ( this.state.sendProgress + param ) * 100 ) / 100;
			this.setState({
				sendStatus:status,
				sendProgress: np
			});
		};
		temp.state.load = function(){
			ls({
				cryptoStatus:"暗号開始",
				cryptoProgress:0
			});
			ss();
		}
		temp.state.loading = function(ald){
			ls({
				cryptoStatus: "暗号中",
				cryptoProgress: ald
			});
		}
		temp.state.loaded = function(){
			ls({
				cryptoStatus:"暗号完了",
				cryptoProgress:100
			});
			ss();
		}
		console.log(">>>");
		if( ifp ){
			temp.setpwd(ipw);
		}
		temp.encrypt().then(function(value){
			temp.state.load = function(){
				ls({
					sendStatus:"送信開始",
					sendProgress:0
				});
				ss();
			}
			temp.state.loading = function(param, state){
				sp(param * 100, "送信中");
			}
			temp.state.loaded = function(){
				ls({
					sendStatus:"送信完了",
					sendProgress:100
				});
				ss();
			}
			temp.dumpsize();
			sendPst(temp, ifc );
			sendTag(temp, itc );
			console.log(temp);
			temp.safeSend().then(function(value){
				dir_rqs();
				breakKey();
			});
		});
	}
	render(){
		const st1act = (["step", ( this.state.step == 0 ) ? "active" : "" ,( this.state.step >= 1 ) ? "disabled" : "" ].join(" "));
		const st2act = (["step", ( this.state.step == 1 ) ? "active" : "" ,( this.state.step >= 3 ) ? "disabled" : "" ].join(" "));
		const st3act = (["step", 
			( this.state.step >= 2 && this.state.step <= 4 ) ? "active" : "",
			( this.state.step >= 5 ) ? "disabled" : ""
		].join(" "));
		const stFact = (["step", ( this.state.step >=  5 ) ? "active" : ""].join(" "));
		return(
			<div className="ui small steps" style={{flexWrap:"wrap",flexGrow:1}}>
				<span className={st1act}>
					<form className="file_area">
						<div className="content">
							<div className="title">
									<input id="legacy_fp" type="file"　className="" onChange={this.preliminary} />
									ファイルの選択
							</div>
							<div className="description">
								クリックでファイルを選択
								<br />
								ファイル名:{this.props.dataList.name}
							</div>
						</div>
					</form>
				</span>
				<span className={st2act}>
					<div className="content">
						<div className="title">ファイルの読み込み</div>
						<div className="description">
							選択されたファイルを読み込みます
							<div className="flex_box state">
								<div className="left mNotice">
									{this.state.loadStatus}
								</div>
								<div className="right">
									{this.state.loadProgress}
								</div>
								%
							</div>
						</div>
					</div>
				</span>
				<span className={st3act} onClick={this.sender}>
					<div className="content">
						<div className="title">暗号開始</div>
						<div className="description">
							クリックで処理を続行、ファイルを暗号化します
							<div className="flex_box state">
								<div className="left mNotice">
									{this.state.cryptoStatus}
								</div>
								<div className="right">
									{this.state.cryptoProgress}
								</div>
								%
							</div>
						</div>
					</div>
				</span>
				<span className={stFact}>
					<div className="content">
						<div className="title">ファイルのアップロード</div>
						<div className="description">
							ファイルの送信を行います
							<div className="flex_box state">
								<div className="left mNotice">
									{this.state.sendStatus}
								</div>
								<div className="right">
									{this.state.sendProgress}
								</div>
								%
							</div>
						</div>
					</div>
				</span>
			</div>
		);
/***/
	}
}
class MainContentPanel extends React.Component{
    constructor(props){
        super(props);
        this.state = {
			viewState:"none",
			hub:new _HUB()
		};
		this.changes = this.changes.bind(this);
	}
	changes(){
		this.setState({
			viewState : ( this.state.viewState == "none" ) ? "block" : "none",
		});
	}
	render(){
		const cn = (["marker",( this.state.viewState == "none" ) ? "rot" : "revRot"].join(" "));
		return(
			<div>
				<div className="flex_box koyoso">
					<UploadFlowPanel ref="ufp" dataList={this.props.dataList} hub={this.state.hub} />
				</div>					
				<div id="panel_sub" className="koyoso" style={{display:this.state.viewState}}>
					<UploadOptionPanel ref="uop" hub={this.state.hub}/>
					<AddTagPanel dataList={this.props.dataList} hub={this.state.hub} />
				</div>
				<div id="panel_tgr" className="clicker panel" onClick={this.changes}>
					<div id="panel_arr" className={cn}>
						&raquo;
					</div>
				</div>
			</div>
		);
	}
}
class Hud extends React.Component{
    constructor(props){
        super(props);
	}
    render(){
        return(
			<div id="hud" className="hud" style={{display:this.props.hud}}>
			</div>
		);
	}
}
class AddPanel extends React.Component {
//DataListはここで管理
    constructor(props){
        super(props);
        this.state = {
			hud:"none",
			viewState:"none",
			dataList:new _DATA_LIST
		};
		this.viewOverlay = this.viewOverlay.bind(this);
		this.hideOverlay = this.hideOverlay.bind(this);
		this.dropped = this.dropped.bind(this);
	}
	viewOverlay(e){
		this.setState({
			hud:"block"
		});
	}
	hideOverlay(e){
		this.setState({
			hud:"none"
		});
	}
	dropped(e){
		e.preventDefault();
		this.hideOverlay(e);
		console.log("dropped");
		this.refs.mcp.refs.ufp.fileLoader(e.dataTransfer.files[0]);
	}
    render(){
		dir_rqs();
        return(
		<div id="render_area" className="flex_v" style={{height:"100%"}}
			onDragOver={this.viewOverlay} 
			onDragLeave={this.hideOverlay} 
			onDrop={this.dropped}
		>
			<MainContentPanel ref="mcp" dataList={this.state.dataList} />
			<div id="grid_area" className="contents">
			</div>
			<div style={{width:"100vw",height:"10px"}}>
			</div>
			<Hud hud={this.state.hud} />
		</div>
		);
    }
};
ReactDOM.render(
    <AddPanel />,
    document.getElementById("jsx")
);