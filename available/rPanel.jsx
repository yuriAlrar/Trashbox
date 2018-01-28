class AddTagPanel extends React.Component{
    constructor(props){
        super(props);
        this.state = {
			newTag:"",
			tagStatus:false,
			defaultContent:"ここには設定済みのタグ/説明文が一覧で表示されます",
			tagContent:[]
		};
		this.setTag = this.setTag.bind(this);		
		this.declareTag = this.declareTag.bind(this);
		this.addTagContent = this.addTagContent.bind(this);
	}
	setTag(e){
		this.setState({
			newTag : e.target.value,
		});
	}
	declareTag(){
		console.log(this.state.newTag);
		let list = (this.state.tagContent);
		list.push(this.state.newTag);
		this.setState({
			tagStatus:true,
			tagContent:list,
			newTag:""
		});
		this.addTagContent();
	}
	componentDidMount(){
		this.addTagContent();
	}
	addTagContent(){
		ReactDOM.render(
			<span>{ ( (this.state.tagContent).length ) ? (this.state.tagContent).join(",") : this.state.defaultContent }</span>,
			document.getElementById("tag_content")
		);
	}
	render(){
		return(
		<div>
			<div className="koyoso">
				ファイルに対してタグとか説明をつける
			</div>
			<div className="flex_box koyoso" >
				<div className="navi marker"> &raquo; </div>
				<input type="text" value={this.state.newTag} onChange={this.setTag} />
				<div className="clicker border navi marker" onClick={this.declareTag } >
					追加
				</div>
				<div className="navi marker"> &raquo; </div>
				<div id="tag_content" style={{flex:1,borderStyle:"solid",borderWidth:1,borderColor:"#f3f3f3"}}>
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
        };
    }
	render(){
		return(
			<div className="flex_box">
				<div className="flex_box koyoso text_wrap">
					<input id="fey" type="checkbox" checked="checked" disabled="disabled" />
					<div>
						ファイルを暗号化する
						<br />
						<span className="text_wrap mtext">暗号モード：AES256</span>		
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
				<div className="flex_box koyoso text_wrap" style={{flex:1}}>
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
							<input id="apw" type="password" style={{width:"100%"}} />
						</div>
						<div className="flex_box">
							<div className="navi text_wrap marker">
								&raquo;
							</div>
							<div id="sluch" className="text_wrap">
								<span className="mExplain">
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
    constructor(props){
        super(props);
        this.state = {
        };
    }
	render(){
		return(
			<div className="panel flex_box">
				<div className="flex_box inner_panel">
					<div className="navi marker"> &raquo; </div>
					<form className="file_area border">
						<input id="legacy_fp" type="file" />
						クリック/ドラッグ&amp;ドロップでファイルを選択
					</form>
				</div>
				<div className="flex_box inner_panel">
					<div className="navi marker"> &raquo; </div>
					<div className="contex text_wrap" id="filename">
						&nbsp;
					</div>
					<div id="navi_2"  className="navi marker forbidden"> &raquo; </div>
					<div id="state_2" className="state mNotice">
						待機
					</div>
				</div>
				<div className="flex_box inner_panel">
					<div id="navi_3_1" className="navi marker forbidden"> &raquo; </div>
					<div id="submit_3" className="clicker border navi marker forbidden">
						アップロード
					</div>
					<div id="navi_3_2" className="navi marker forbidden"> &raquo; </div>
					<div id="state_3" className="state forbidden">
						待機
					</div>
					<div id="navi_3_3" className="navi marker">:</div>
					<div id="progress_3" className="forbidden">
						0
					</div>
					<div id="unit_3" className="forbidden">
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
		let cn = (["marker",( this.state.viewState == "none" ) ? "rot" : "revRot"].join(" "));
		return(
			<div>
				<UploadFlowPanel />
				<div id="panel_sub" className="panel" style={{display:this.state.viewState}}>
					<UploadOptionPanel />
					<AddTagPanel />
				</div>
				<div id="panel_tgr" className="clicker panel" onClick={ this.changes }>
					<div id="panel_arr" className={cn}>
						&raquo;
					</div>
				</div>
			</div>
		);
	}
}
class AddPanel extends React.Component {
    constructor(props){
        super(props);
        this.state = {
			viewState:"none",
			dataList:new _DATA_LIST
		};
		this.handleChange = this.handleChange.bind(this);
	}
	handleChange(){
		this.setState({
			viewState : ( this.state.viewState == "none" ) ? "block" : "none",
		});
		console.log(this.state.viewState);
	}
    render(){
        return(
			<div>
				<MainContentPanel dataList={this.state.dataList} />
			</div>
        );
    }
};
ReactDOM.render(
    <AddPanel />,
    document.getElementById("cnt_panel")
);