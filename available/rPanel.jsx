class AddTagPanel extends React.Component{
    constructor(props){
        super(props);
        this.state = {
			newTag:"",
			tagStatus:false,
			tagContent:[],
			viewTC:"",
			defaultContent:"ここには設定予定のタグ/説明文がバーっと表示されます",
			dataList:this.props.dataList
		};
		this.setTag = this.setTag.bind(this);
		this.declareTag = this.declareTag.bind(this);
		this.clearTag = this.clearTag.bind(this);
	}
	setTag(e){
		this.setState({
			newTag : e.target.value,
		});
	}
	declareTag(e){
		if( e.which != undefined && e.which != 13 ){
			return;
		}
		let list = this.state.dataList;
		if(this.state.newTag !== ""){
			let list = this.state.tagContent;
			list.push(this.state.newTag);
			let ts = true;
			this.setState({
				viewTC:(list).join(" ， "),
				tagContent:list,
				tagStatus:ts,
				newTag:""
			});	
		}
	}
	clearTag(e){
		this.state.dataList.clear_tag();
		this.setState({
			viewTC:"",
			tagContent:[],
			tagStatus:false,
			newTag:""
		});
	}
	render(){
		const cn = "flex_box" + " " + ( ( this.state.tagStatus ) ? "mText" : "mPlaceholder" );
		this.state.dataList.add_tag(this.state.tagContent);
		return(
		<div>
			<div className="koyoso">
				ファイルに対してタグとか説明をつける
			</div>
			<div className="flex_box koyoso" style={{flexWrap:"wrap",alignItems:"stretch"}}>
				<div className="navi marker"> &raquo; </div>
				<input type="text" style={{width:"20%"}} 
					value={this.state.newTag} 
					onChange={this.setTag} 
					onKeyPress={this.declareTag}
				/>
				<div className="clicker border navi marker" onClick={this.declareTag} >
					追加
				</div>
				<div className="navi marker"> &raquo; </div>
				<div id="tag_content" className={cn} style={{flex:1,borderStyle:"solid",borderWidth:1,borderColor:"#f3f3f3"}}>
					{ ( this.state.tagStatus ) ? this.state.viewTC : this.state.defaultContent }
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
			pw:""
		};
		this.setPw = this.setPw.bind(this);
    }
	setPw(e){
		this.setState({
			pw : e.target.value,
		});
	}
	render(){
		return(
			<div className="flex_box" style={{flexWrap:"wrap"}}>
				<div className="flex_box koyoso text_wrap">
					<input id="fey" type="checkbox" checked="checked" disabled="disabled" />
					<div>
						ファイルを暗号化する
						<br />
						<span className="text_wrap mText" style={{fontSize:"0.9em"}}>暗号アルゴリズム：AES256</span>		
					</div>
				</div>
				<div className="flex_box koyoso text_wrap">
					<input id="ncy" type="checkbox"/>
					<div>
						ファイル名も暗号化する
						<br />
						<span className="mExplain">
							※ 暗号化しない場合、ファイル名はハッシュ化されます
						</span>		
					</div>
				</div>
				<div className="flex_box koyoso text_wrap" style={{flexGrow:1}}>
					<input id="pws" type="checkbox" />
					<div>
						任意のパスワードを使用する
						<div className="mExplain">
							※ 使用シない場合、ランダムなパスワードが与えられます
						</div>
						<div className="flex_box">
							<div className="navi text_wrap marker">
									&raquo;
							</div>
							<input id="apw" type="password" style={{width:"100%"}}
								value={this.state.pw}
								onChange={this.setPw}
							/>
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
			sendStatus:"待機",
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
		this.setState({
			loadStatus:m
		});
	}
	setStep(m){
		const i = ( m !== undefined ) ? m : this.state.step + 1;
		this.setState({
			step:i
		});
	}
	preliminary(e){
		this.fileLoader(e.target.files[0]);
	}
	fileLoader(f){
		console.log(this.state.step);
		if(this.state.step != 0 && this.state.step != 2){
			return;
		}
		let temp = this.props.dataList;
		const ss = this.setStep;
		const ls = this.setLS;
		temp.state.load = function(){
			ls("ロード開始");
			ss();
		}
		temp.state.loading = function(ald){
			ls("ロード中：" + ald + "%");
		}
		temp.state.loaded = function(){
			ls("準備完了");
			ss();
		}
		this.state.dataList.fp(f);
	}
	sender(){
		console.log(this.state.dataList);
		if(this.state.step != 2){
			return;
		}
		let temp = this.props.dataList;
		const ss = this.setStep;
		const ls = this.setLS;
		temp.state.load = function(){
			ls("暗号開始");
			ss();
		}
		temp.state.loading = function(ald){
			ls("暗号中：" + ald + "%");
		}
		temp.state.loaded = function(){
			ls("暗号完了");
			ss();
		}
		this.state.dataList.setpwd();
		this.state.dataList.encrypt();
	}
	render(){
		const st1Navi = (["navi", "marker", ( this.state.step > 0 ) ? "mText" : "forbidden"].join(" "));
		const st1Note = ([
			"state",
			"mNotice",
			"text_wrap",
			( this.state.step > 0 ) ? "mNotice" : "forbidden"
		].join(" "));
		const st2Navi = (["navi", "marker", ( this.state.step > 1 ) ? "mText" : "forbidden"].join(" "));
		const st2Send = ([
			"clicker",
			"border", 
			"navi", 
			"marker",
			"text_wrap",
			( this.state.step > 1 ) ? "mText" : "forbidden"
		].join(" "));
		const st3Navi = (["navi", "marker", ( this.state.step > 2 ) ? "mText" : "forbidden"].join(" "));
		const st3Note = ([
			"state",
			"mNotice",
			"text_wrap",
			( this.state.step > 2 ) ? "mNotice" : "forbidden"
		].join(" "));
		return(
			<div className="panel flex_box" style={{flexWrap:"wrap"}}>
				<div className="flex_box inner_panel">
					<div className="navi marker"> &raquo; </div>
					<form className="file_area border mText">
						<input id="legacy_fp" type="file" onChange={this.preliminary} />
						クリック&frasl;ドラッグ&amp;ドロップでファイルを選択
					</form>
				</div>
				<div className="flex_box inner_panel">
					<div className={st1Navi}> &raquo; </div>
					<div className="contex text_wrap" id="filename">
						{this.props.dataList.name}
					</div>
					<div className={st1Navi}> &raquo; </div>
					<div className={st1Note}>
						{this.state.loadStatus}
					</div>
				</div>
				<div className="flex_box inner_panel">
					<div id="navi_3_1" className={st2Navi}> &raquo; </div>
					<div id="submit_3" 
						className={st2Send} 
						onClick={this.sender}
					>
						アップロード
					</div>
					<div id="navi_3_2" className={st3Navi}> &raquo; </div>
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
	}
}
class MainContentPanel extends React.Component{
    constructor(props){
        super(props);
        this.state = {
			viewState:"none"
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
				<UploadFlowPanel ref="ufp" dataList={this.props.dataList} />
				<div id="panel_sub" className="panel" style={{display:this.state.viewState}}>
					<UploadOptionPanel />
					<AddTagPanel dataList={this.props.dataList} />
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