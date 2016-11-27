/**
 * Created by duke on 2016/11/20.
 */
var ReactNative = require('react-native');
var React = require('react');
var Video = require('react-native-video').default;
import Button from 'react-native-button';
var config = require('../common/config');
var request = require('../common/request');
var StyleSheet = ReactNative.StyleSheet;
var Text = ReactNative.Text;
var TextInput = ReactNative.TextInput;
var View = ReactNative.View;
var Modal = ReactNative.Modal;
var Icon = require('react-native-vector-icons/Ionicons');
var ActivityIndicator = ReactNative.ActivityIndicator;
var TouchableOpacity = ReactNative.TouchableOpacity;
var Dimensions = ReactNative.Dimensions;
var ListView = ReactNative.ListView;
var Image = ReactNative.Image;
var AlertIOS = ReactNative.AlertIOS;
var width = Dimensions.get('window').width;
var cachedResults = {
    nextPage:1,
    items:[],
    total:0
};
var Detail = React.createClass ({
    getInitialState:function () {
        var data = this.props.data;
        var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

        return {
            data:data,

            //comments
            dataSource: ds.cloneWithRows([]),

            //video player
            rate:1,
            muted:false,
            resizeMode:'contain',
            repeat:false,

            //modal
            content:'',
            modalVisible:false,
            animationType:'none',
            isSending:false,

            //videoLoads
            playing:false,
            videoLoaded:false,
            videoProgress:0.01,
            videoTotal:0,
            currentTime:0,
            paused:false,
            videoOk:true
        }
    },
    _onLoadStart:function () {
        console.log('start')
    },
    _onLoad:function () {
        console.log('load')
    },
    _onProgress:function (data) {
        var duration = data.playableDuration;
        var currentTime = data.currentTime;
        var percent = Number((currentTime/duration).toFixed(2));
        var newState = {
            videoTotal:duration,
            currentTime:Number(data.currentTime.toFixed(2)),
            videoProgress:percent,
        };
        if(!this.state.videoLoaded){
            newState.videoLoaded = true;
        }
        if(!this.state.playing){
            newState.playing = true;
        }
        this.setState(newState);
    },
   _onEnd:function () {
       this.setState({
           videoProgress:1,
           playing:false,
       });
   },
    _onError:function (e) {
        this.setState({
            videoOk:false
        });
        console.log('error',e)
    },
    _replay:function () {
        this.refs.VideoPlayer.seek(0);
    },
    _pause:function () {
        if(!this.state.paused){
            this.setState({
                paused:true,
            })
        }
    },
    _resume:function () {
        if(this.state.paused){
            this.setState({
                paused:false,
            })
        }
    },
    _pop:function () {
        this.props.navigator.pop();
    },
    componentDidMount:function () {
        this._fetchData();
    },
    _fetchData:function (page) {
        this.setState({
            isLoadingTail:true
        });
        request.get(config.api.base + config.api.comment,{
            creation:124,
            accessToken:'abcdef',
            page:page
        })
            .then((data) => {
                if(data.success){
                    var items = cachedResults.items.slice();
                    items = items.concat(data.data);
                    cachedResults.nextPage += 1;
                    cachedResults.items = items;
                    cachedResults.total = data.total;
                    this.setState({
                        isLoadingTail:false,
                        dataSource:this.state.dataSource.cloneWithRows(cachedResults.items)
                    });

                }
            })
            .catch((error)=>{
                this.setState({
                    isLoadingTail:false,
                });
                console.warn(error);
            })
    },
    _hasMore:function () {
        return cachedResults.items.length !== cachedResults.total;
    },
    _fetchMoreData:function () {
        if(!this._hasMore() || this.state.isLoadingTail){
            return;
        }
        var page = cachedResults.nextPage;
        this._fetchData(page);
    },
    _renderFooter:function () {
        if(!this._hasMore && cachedResults.total != 0){
            return (
                <View style={styles.loadingMore}>
                    <Text style={styles.loadingText}>没有更多了</Text>
                </View>
            )
        }
        return (
            <ActivityIndicator
                style={styles.loadingMore}
            />
        )
    },


    _renderRow:function (row) {
        return (
            <View key={row._id} style={styles.replyBox}>
                <Image style={styles.replyAvator} source={{uri:row.replyBy.avator}}/>
                <View style={styles.reply}>
                    <Text style={styles.replyNickname}>{row.replyBy.nickname}</Text>
                    <Text style={styles.replyContent}>{row.content}</Text>
                </View>
            </View>
        );
    },
    _blur:function () {
        
    },
    _closeModal:function () {
        this._setModalVisible(false);
    },
    _focus:function () {
        this._setModalVisible(true);
    },
    _setModalVisible:function (isVisible) {
        console.log(isVisible)
        this.setState({
            modalVisible:isVisible
        })
    },
    _renderHeader:function () {
        var data = this.state.data;
        return (
            <View style={styles.listHeader}>
                <View style={styles.infoBox}>
                    <Image style={styles.avator} source={{uri:data.author.avator}}/>
                    <View style={styles.descBox}>
                        <Text style={styles.nickname}>{data.author.nickname}</Text>
                        <Text style={styles.title}>{data.title}</Text>
                    </View>
                </View>
                <View style={styles.commentBox}>
                    <View style={styles.comment}>
                        <TextInput
                            placeholder="敢不敢评论一下..."
                            style={styles.content}
                            multiline={true}
                            onFocus={this._focus}
                        />
                    </View>
                </View>
                <View style={styles.commentArea}>
                    <Text>精彩评论</Text>
                </View>
            </View>
        );
    },
    _submit:function () {
        var that = this;
        if(!this.state.content){
            return AlertIOS.alert('留言不能为空');
        }
        if(this.state.isSending){
            return AlertIOS.alert('正在评论中');
        }
        this.setState({
            isSending:true
        },function () {
            var body = {
                accessToken: 'abc',
                creation: '2324',
                content:this.state.content
            }

            var url = config.api.base + config.api.comment;
            request.post(url,body)
                .then(function (data) {
                    if(data && data.success){
                        var items = cachedResults.items.slice();
                        items = [{
                            content:that.state.content,
                            replyBy:{
                                nickname:'狗屎说',
                                avator:'http://dummyimage.com/640x640/1f03e2)'
                            }
                        }].concat(items);
                        cachedResults.items = items;
                        cachedResults.total +=1;
                        that.setState({
                            isSending:false,
                            dataSource:that.state.dataSource.cloneWithRows(cachedResults.items)
                        });
                        that.setState({
                            content:''
                        });
                        that._setModalVisible(false);
                    }
                })
                .catch(function (error) {
                    console.log(error);
                    this.setState({
                        isSending:false
                    })
                    that._setModalVisible(false);
                    AlertIOS.alert('留言失败,稍后重试');
                })
        })

    },
    render:function () {
        var data = this.props.data;
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backBox} onPress={this._pop}>
                        <Icon
                            name="ios-arrow-back"
                            style={styles.backIcon}
                        />
                        <Text style={styles.backText}>返回</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle} numberOflines={1}>详情页面</Text>
                </View>
                <View style={styles.videoBox}>
                    <Video
                        ref="VideoPlayer"
                        source={{uri:data.video}}
                        style={styles.video}
                        volume={5}
                        paused={this.state.paused}
                        rate={this.state.rate}
                        muted={this.state.muted}
                        resizeMode={this.state.resizeMode}
                        repeat={this.state.repeat}
                        onLoadStart={this._onLoadStart}  //刚开始加载
                        onLoad={this._onLoad}           //在加载过程中
                        onProgress={this._onProgress}  //每隔250ms调用
                        onEnd={this._onEnd}
                        onError={this._onError}/>
                    {
                        !this.state.videoOk && <Text style={styles.failText}>视频出错了!很抱歉</Text>
                    }
                    {!this.state.videoLoaded && <ActivityIndicator color="#ee735c" style={styles.loading}/>}
                    {this.state.videoLoaded && !this.state.playing
                        ? <Icon
                        onPress={this._replay}
                        name="ios-play"
                        size={48}
                        style={styles.playIcon}/>
                        : null
                    }
                    {this.state.videoLoaded && this.state.playing
                        ? <TouchableOpacity
                        onPress={this._pause}
                        style={styles.pauseBtn}>
                        {
                            this.state.paused
                            ? <Icon onPress={this._resume} size={48} name="ios-play" style={styles.resumeIcon}/>
                            :<Text></Text>
                        }
                    </TouchableOpacity>
                        : null
                    }
                    <View style={styles.progressBox}>
                        <View style={[styles.progressBar,{width:width * this.state.videoProgress}]}>
                        </View>
                    </View>
                </View>
                <ListView
                    dataSource={this.state.dataSource}        //数据来源
                    renderRow={this._renderRow}               //每条数据调用的方法
                    enableEmptySections = {true}            //是否允许内容为空
                    renderHeader={this._renderHeader}         //在底部触发刷新,数据没有到达时显示的东西
                    renderFooter={this._renderFooter}         //在底部触发刷新,数据没有到达时显示的东西
                    onEndReached={this._fetchMoreData}       //在接近底部时触发刷新调用的方法
                    onEndReachedTreshold={20}               //在离底部距离为多少时启动刷新
                    showsVerticalScrollIndicator = {false}  //是否显示垂直滚动条
                    automaticallyAdjustContentInsets = {false}  //是否显示自动调整(一般头部会出现空白后设置为false)
                />
                <Modal
                    animationType={'fade'}
                    visible={this.state.modalVisible}
                    onRequestClose={()=>{this._setModalVisible(false)}}>
                    <View style={styles.modalContainer}>
                        <Icon
                            onPress={this._closeModal}
                            name="ios-close-outline"
                            style={styles.closeIcon}
                        />
                        <View style={styles.commentBox}>
                            <View style={styles.comment}>
                                <TextInput
                                    placeholder="敢不敢评论一下..."
                                    style={styles.content}
                                    multiline={true}
                                    defaultValue={this.state.content}
                                    onChangeText={(text)=>{
                                        this.setState({
                                            content:text
                                        })
                                    }}
                                />
                            </View>
                        </View>
                        <Button style={styles.submitBtn} onPress={this._submit}>
                            评论
                        </Button>
                    </View>
                </Modal>
            </View>
        )
    }
});

var styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
    },
    modalContainer:{
        flex:1,
        paddingTop:45,
        backgroundColor:'#fff'
    },
    closeIcon:{
        alignSelf:'center',
        fontSize:30,
        color:'#ee753c'
    },
    submitBtn:{
        width:width-20,
        padding:16,
        marginTop:20,
        marginBottom:20,
        borderWidth:1,
        borderColor:'#ee753c',
        borderRadius:4,
        fontSize:18,
        color:'#ee753c'
    },
    videoBox:{
        width:width,
        height:width * 0.56,
        backgroundColor:'#000'
    },
    video:{
        width:width,
        height:width * 0.56,
        backgroundColor:'#000'
    },
    loading:{
        position:'absolute',
        left:0,
        top:80,
        width:width,
        alignSelf:'center',
        backgroundColor:'transparent'
    },
    progressBox:{
        width:width,
        height:2,
        backgroundColor:'#ccc'
    },
    progressBar:{
        width:1,
        height:2,
        backgroundColor:'#ff6600'
    },
    playIcon:{
        position:'absolute',
        top:90,
        left:width/2 - 30,
        width:60,
        height:60,
        paddingTop:10,
        paddingLeft:22,
        backgroundColor:'transparent',
        borderColor:'#fff',
        borderWidth:1,
        borderRadius:30,
        color:'#ed7b66'
    },
    pauseBtn:{
        position:'absolute',
        left:0,
        top:0,
        width:width,
        height:360
    },
    resumeIcon:{
        position:'absolute',
        top:80,
        left:width/2 - 30,
        width:60,
        height:60,
        paddingTop:10,
        paddingLeft:22,
        backgroundColor:'transparent',
        borderColor:'#fff',
        borderWidth:1,
        borderRadius:30,
        color:'#ed7b66'
    },
    failText:{
        position:'absolute',
        left:0,
        top:90,
        width:width,
        alignSelf:'center',
        color:'#fff',
        backgroundColor:'transparent'
    },
    header:{
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        width:width,
        height:64,
        paddingTop:20,
        paddingLeft:10,
        paddingRight:10,
        borderBottomWidth:1,
        borderColor:'rgba(0,0,0,0.1)',
        backgroundColor:'#fff'
    },
    backBox:{
        position:'absolute',
        left:12,
        top:32,
        width:50,
        flexDirection:'row',
        alignItems:'center'
    },
    headerTitle:{
        width:width-120,
        textAlign:'center'
    },
    backIcon:{
        color:'#999',
        fontSize:20,
        marginRight:5
    },
    backText:{
        color:'#999'
    },
    infoBox:{
        width:width,
        flexDirection:'row',
        justifyContent:'center',
        marginTop:10
    },
    avator:{
        width:60,
        height:60,
        marginRight:10,
        marginLeft:10,
        borderRadius:30,
    },
    descBox:{
        flex:1
    },
    nickname:{
        fontSize:18,
    },
    title:{
        marginTop:8,
        fontSize:16,
        color:"#666"
    },
    replyBox:{
        flexDirection:'row',
        justifyContent:'flex-start',
        marginTop:10
    },
    replyAvator:{
        width:40,
        height:40,
        marginRight:10,
        marginLeft:10,
        borderRadius:20
    },
    replyNickname:{
        color:'#666'
    },
    replyContent:{
        marginTop:4,
        color:"#666"
    },
    reply:{
        flex:1
    },
    loadingMore:{
        marginVertical:20
    },
    loadingText:{
        color:'#777',
        textAlign:'center'
    },
    listHeader:{
        width:width,
        marginTop:10
    },
    commentBox:{
        marginTop:10,
        marginBottom:10,
        padding:8,
        width:width
    },
    content:{
        paddingLeft:2,
        color:'#333',
        borderWidth:1,
        borderColor:'#ddd',
        borderRadius:4,
        fontSize:14,
        height:80
    },
    commentArea:{
        width:width,
        paddingBottom:6,
        paddingLeft:10,
        paddingRight:10,
        borderBottomWidth:1,
        borderBottomColor:'#eee'
    }
});

module.exports = Detail;
