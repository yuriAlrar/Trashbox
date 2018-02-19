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
					<div class="ui mini action input">
						<input type="text" placeholder="タグの追加"
							value={this.state.newTag} 
							onChange={this.setTag} 
							onKeyPress={this.increaseTag}					
						/>
						<button class="ui mini button" onClick={this.increaseTag}>
							追加
						</button>
					</div>
					<div className="arrow direct_arrow"></div>
				</div>
				<div className={cn} style={{flex:1}}>
					<TagWrapper dct={this.decreaseTag} list={this.state.tagContent} />
				</div>
				<div className="clicker border navi marker" onClick={this.clearTag} >
					全部消す
				</div>
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
    }
	setPw(e){
		this.setState({
			pw : e.target.value,
		});
	}
	render(){
		console.log( this.state );
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
						this.setState({ifc: (tf)})
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
							this.state.hub.set_data("ifc",tp);
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
 * Step
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
	}
	preliminary(e){
		this.fileLoader(e.target.files[0]);
		console.log("step>>",this.state.step);
	}
	fileLoader(f){
		console.log(this.state.step);
//ファイルロード中か、暗号開始後なら処理を中断
		if(this.state.step == 1){
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
		console.log(this.props.hub);
		console.log(this.state.dataList);
		if(this.state.step != 2){
			return;
		}
		let temp = this.props.dataList;
		const ss = this.setStep;
		const ls = this.setLS;
		temp.state.load = function(){
			ls({
				cryptoStatus:"暗号開始",
				cryptoProgress:0
			});
			ss();
		}
		temp.state.loading = function(ald){
			ls({
				cryptoStatus:"暗号中",
				cryptoProgress:ald
			});
		}
		temp.state.loaded = function(){
			ls({
				cryptoStatus:"暗号完了",
				cryptoProgress:100
			});
			ss();
			console.log(">>",this);
		}
		this.state.dataList.encrypt();
	}
	render(){
		const st1Navi = ([
			"navi", "marker", ( this.state.step > 0 ) ? "mText" : "forbidden"
		].join(" "));
		const st1Note = ([
			"state", "mNotice", "text_wrap", ( this.state.step > 0 ) ? "mNotice" : "forbidden"
		].join(" "));
		const st2Navi = ([
			"navi", "marker", ( this.state.step > 1 ) ? "mText" : "forbidden"
		].join(" "));
		const st2Send = ([
			"clicker", "border", "navi", "marker","text_wrap", ( this.state.step > 1 ) ? "mText" : "forbidden"
		].join(" "));
		const st3Navi = ([
			"navi", "marker", ( this.state.step > 2 ) ? "mText" : "forbidden"
		].join(" "));
		const st3Note = ([
			"state", "mNotice", "text_wrap", ( this.state.step > 2 ) ? "mNotice" : "forbidden"
		].join(" "));
/***/
		return(
			<div className="panel flex_box" style={{flexWrap:"wrap"}}>
				<div className="flex_box inner_panel">
					<div className="arrow direct_arrow"></div>
					<form className="file_area border mText">
						<input id="legacy_fp" type="file" onChange={this.preliminary} />
						クリック&frasl;ドラッグ&amp;ドロップでファイルを選択
					</form>
					<div className="arrow direct_arrow"></div>
					<div className="contex text_wrap" id="filename">
						{this.props.dataList.name}
					</div>
					<div className="arrow direct_arrow"></div>
					<div className={st1Note}>
						{this.state.loadStatus}
						:
						{this.state.loadProgress}
						%
					</div>
				</div>
				<div className="flex_box inner_panel">
					<div className="arrow direct_arrow"></div>
					<div id="submit_3" 
						className={st2Send} 
						onClick={this.sender}
					>
						アップロード
					</div>
					<div className="arrow direct_arrow"></div>
					<div className={st3Note}>
						{this.state.cryptoStatus}
						:
						{this.state.cryptoProgress}
						%
					</div>
					<div className="arrow direct_arrow"></div>
					<div id="state_3" className={st3Note}>
						{this.state.sendStatus}
					</div>
					<div id="navi_3_3" className={st3Navi}>:</div>
					<div id="progress_3" className={st3Navi}>
						{this.state.sendProgress}
					</div>
					<div id="unit_3" className={st3Navi}>
						%
					</div>
				</div>
			</div>
		);
/***/
/***
		return(
			<div className="ui small steps" style={{flexWrap:"wrap",flexGrow:1}}>
				<span className="active step">
					<div className="content">
						<div className="title">ファイルを選択</div>
						<form className="description file_area">
							<input id="legacy_fp" type="file"　className="" onChange={this.preliminary} />
							クリック＆ドラッグ＆ドロップで選択
						</form>
					</div>
				</span>
				<span className="step">
					<div className="content">
					<div className="title">{this.state.loadStatus} &raquo; {this.state.loadProgress} %</div>
					<div className="description">ファイル名:{this.props.dataList.name}</div>
					</div>
				</span>
				<span className="step clicker">
					<div className="content">
					<div className="title">アップロード</div>
					<div className="description">クリックでアップロードを開始します</div>
					</div>
				</span>
				<span className="step">
					<div className="content">
					<div className="title">{this.state.cryptoStatus} &raquo; {this.state.cryptoProgress} %</div>
					<div className="description">ファイルを暗号化します</div>
					</div>
				</span>
				<span className="step">
					<div className="content">
					<div className="title">{this.state.sendStatus}</div>
					<div className="description">ファイルを送信するナリよ〜</div>
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
				<div className="flex_box koyoso" style={{width:"100%",justifyContent:"space-between"}}>
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
        return(
		<div id="render_area" className="flex_v" style={{height:"100%"}}
			onDragOver={this.viewOverlay} 
			onDragLeave={this.hideOverlay} 
			onDrop={this.dropped}
		>
			<MainContentPanel ref="mcp" dataList={this.state.dataList} />
			<div id="grid_area" className="contents" style={{flex:1}}>
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