/**
 * Created by duke on 2016/11/20.
 */
var ReactNative = require('react-native');
var React = require('react');
var StyleSheet = ReactNative.StyleSheet;
var request = require('../common/request');
var config = require('../common/config');
var Detail = require('./detail');
var ActivityIndicator = ReactNative.ActivityIndicator;
var Text = ReactNative.Text;
var View = ReactNative.View;
var ListView = ReactNative.ListView;
var Dimensions = ReactNative.Dimensions;
var RefreshControl = ReactNative.RefreshControl;
var TouchableHighlight = ReactNative.TouchableHighlight;
var Image = ReactNative.Image;
var AlertIOS = ReactNative.AlertIOS;
var Icon = require('react-native-vector-icons/Ionicons');
var cachedResults = {
    nextPage:1,
    items:[],
    total:0
};
var width = Dimensions.get('window').width;

var Item = React.createClass ({
    getInitialState:function () {
        var row = this.props.row;
        return {
            up:row.voted,
            row:row
        }
    },
    _up:function () {
        var that = this;
        var up = !this.state.up;
        var row = this.state.row;
        var url = config.api.base + config.api.up;
        var body = {
            id: row._id,
            up: row ? 'yes' : 'no',
            accessToken: 'abcd'
        }
        request.post(url,body)
            .then(function (data) {
                if(data && data.success){
                    that.setState({
                        up:up
                    })
                }else{
                    AlertIOS.alert('点赞失败,稍后重试');
                }
            })
            .catch(function (err) {
                console.log(err);
                AlertIOS.alert('点赞失败,稍后重试');
            })
    },
    render:function () {
        var row = this.state.row;
        return(
            <TouchableHighlight onPress={this.props.onSelect}>
                <View style={styles.item}>
                    <Text style={styles.title}>{row.title}</Text>
                    <Image
                        style={styles.thumb}
                        source={{uri:row.thumb}}
                    >
                        <Icon
                            name="ios-play"
                            size={28}
                            style={styles.play}/>
                    </Image>
                    <View style={styles.itemFooter}>
                        <View style={styles.handleBox}>
                            <Icon
                                name={this.state.up ? 'ios-heart' : "ios-heart-outline"}
                                size={28}
                                onPress={this._up}
                                style={[styles.up,this.state.up ? null : styles.down]}/>
                            <Text style={styles.handleText} onPress={this._up}>喜欢</Text>
                        </View>
                        <View style={styles.handleBox}>
                            <Icon
                                name="ios-chatboxes-outline"
                                size={28}
                                style={styles.commentIcon}/>
                            <Text style={styles.handleText}>评论</Text>
                        </View>
                    </View>
                </View>
            </TouchableHighlight>
        );
    }
})

var List = React.createClass ({
    getInitialState:function(){
        var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        return {
            dataSource: ds.cloneWithRows([]),
            isLoadingTail:false,
            isRefreshing:false
        }
    },
    componentDidMount:function () {
        this._fetchData(1);
    },
    _fetchData:function (page) {
        if(page != 0){
            this.setState({
                isLoadingTail:true
            });
        }else{
            this.setState({
                isRefreshing:true
            })
        }

        request.get(config.api.base + config.api.creations,{
                accessToken:'abcdef',
                page:page
            })
            .then((data) => {
                if(data.success){
                    var items = cachedResults.items.slice();
                    if(page != 0){
                        items = items.concat(data.data);
                        cachedResults.nextPage += 1;
                    }else{
                        items = data.data.concat(items);
                    }
                    cachedResults.items = items;
                    cachedResults.total = data.total;
                    if(page != 0){
                        this.setState({
                            isLoadingTail:false,
                            dataSource:this.state.dataSource.cloneWithRows(cachedResults.items)
                        });
                    }else{
                        this.setState({
                            isRefreshing:false,
                            dataSource:this.state.dataSource.cloneWithRows(cachedResults.items)
                        });
                    }
                }
            })
            .catch((error)=>{
                if(page != 0){
                    this.setState({
                        isLoadingTail:false,
                    });
                }else{
                    this.setState({
                        isRefreshing:false,
                    });
                }

                console.warn(error);
            })
    },
    _renderRow:function(row){
       return <Item
           key={row._id}
           onSelect={()=>this._loadPage(row)}
           row={row}/>;
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
    _onRefresh:function () {
        if(!this._hasMore || this.state.isRefreshing){
            return;
        }
        this._fetchData(0);
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
    _loadPage:function (row) {
        this.props.navigator.push({
            name:'detail',
            component:Detail,
            params:{
                data:row
            }
        })
    },
    render:function () {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>制作业面</Text>
                </View>
                <ListView
                    dataSource={this.state.dataSource}        //数据来源
                    renderRow={this._renderRow}               //每条数据调用的方法
                    renderFooter={this._renderFooter}         //在底部触发刷新,数据没有到达时显示的东西
                    onEndReached={this._fetchMoreData}       //在接近底部时触发刷新调用的方法
                    refreshControl={
                      <RefreshControl
                        refreshing={this.state.isRefreshing}
                        onRefresh={this._onRefresh}
                        tintColor="#ff6600"
                        title="拼命加载中..."
                      />
                    }                                       //向上滑动
                    onEndReachedTreshold={20}               //在离底部距离为多少时启动刷新
                    enableEmptySections = {true}            //是否允许内容为空
                    showsVerticalScrollIndicator = {false}  //是否显示垂直滚动条
                    automaticallyAdjustContentInsets = {false}  //是否显示自动调整(一般头部会出现空白后设置为false)
                />
            </View>
        )
    }
});

var styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
    },
    header: {
        paddingTop:25,
        paddingBottom:12,
        backgroundColor: '#ee735c'
    },
    headerTitle: {
        color:'#fff',
        fontSize:16,
        textAlign:'center',
        fontWeight:'600'
    },
    item:{
        width:width,
        marginBottom:10,
        backgroundColor: '#fff',
    },
    thumb:{
        width:width,
        height:width * 0.56,
        marginBottom:10,
        resizeMode:'cover',
    },
    title:{
        padding:10,
        fontSize:18,
        color:'#333'
    },
    itemFooter:{
        flexDirection:'row',
        justifyContent:'space-between',
        backgroundColor: '#eee',
    },
    handleBox:{
        padding:10,
        flexDirection:'row',
        width:width*0.5-0.5,
        justifyContent:'center',
        backgroundColor: '#fff',
    },
    play:{
        position:'absolute',
        bottom:14,
        right:14,
        width:46,
        height:46,
        paddingTop:9,
        paddingLeft:17,
        backgroundColor:'transparent',
        borderColor:'#fff',
        borderWidth:1,
        borderRadius:23,
        color:'#ed7b66'
    },
    handleText:{
        paddingLeft:12,
        fontSize:18,
        color:'#333'
    },
    up:{
        fontSize:22,
        color:'#ed7b66'
    },
    down:{
        fontSize:22,
        color:'#333'
    },
    commentIcon:{
        fontSize:22,
        color:'#333'
    },
    loadingMore:{
        marginVertical:20
    },
    loadingText:{
        color:'#777',
        textAlign:'center'
    }
});

module.exports = List;

