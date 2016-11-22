/**
 * Created by duke on 2016/11/20.
 */
var ReactNative = require('react-native');
var React = require('react');
var Video = require('react-native-video').default;
var StyleSheet = ReactNative.StyleSheet;
var Text = ReactNative.Text;
var View = ReactNative.View;
var Icon = require('react-native-vector-icons/Ionicons');
var Dimensions = ReactNative.Dimensions;
var width = Dimensions.get('window').width;
var Detail = React.createClass ({
    getInitialState:function () {
        var data = this.props.data;
        return {
            data:data,
            rate:1,
            muted:false,
            resizeMode:'contain',
            repeat:false
        }
    },
    _backToList:function () {
        this.props.navigator.pop();
    },
    _onLoadStart:function () {
        console.log('start')
    },
    _onLoad:function () {
        console.log('load')
    },
    _onProgress:function (data) {
        console.log('progress',data)
    },
   _onEnd:function () {
       console.log('end')
   },
    _onError:function (e) {
        console.log('error',e)
    },
    render:function () {
        var data = this.props.data;
        return (
            <View style={styles.container}>
                <Text onPress={this._backToList}>详情页面{data._id}</Text>
                <View style={styles.videoBox}>
                    <Video
                        ref="VideoPlayer"
                        source={{uri:data.video}}
                        style={styles.video}
                        volume={5}
                        paused={false}
                        rate={this.state.rate}
                        muted={this.state.muted}
                        resizeMode={this.state.resizeMode}
                        repeat={this.state.repeat}
                        onLoadStart={this._onLoadStart}
                        onLoad={this._onLoad}
                        onProgress={this._onProgress}  //每隔250ms调用
                        onEnd={this._onEnd}
                        onError={this._onError}/>
                </View>
            </View>
        )
    }
});

var styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    videoBox:{
        width:width,
        height:360,
        backgroundColor:'#000'
    },
    video:{
        width:width,
        height:360,
        backgroundColor:'#000'
    }
});

module.exports = Detail;

