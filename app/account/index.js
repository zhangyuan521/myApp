/**
 * Created by duke on 2016/11/20.
 */
var ReactNative = require('react-native');
var React = require('react');
var Platform = require('react-native').Platform;
var ImagePicker = require('react-native-image-picker');
var StyleSheet = ReactNative.StyleSheet;
var Text = ReactNative.Text;
var View = ReactNative.View;
var TouchableOpacity = ReactNative.TouchableOpacity;
var Image = ReactNative.Image;
var Icon = require('react-native-vector-icons/Ionicons');
var Dimensions = ReactNative.Dimensions;
var AsyncStorage = ReactNative.AsyncStorage;
var width = Dimensions.get('window').width;
var options = {
    title: '选择头像',
    cancelButtonTitle:'取消',
    takePhotoButtonTitle:'拍照',
    chooseFromLibraryButtonTitle:'选择相册',
    quality:0.75,
    allowsEditing:true,
    noData:false,
    storageOptions: {
        skipBackup: true,
        path: 'images'
    }
};
var Account = React.createClass ({
    getInitialState:function () {
        var user = this.props.user || {};
        return {
            user:user
        }
    },
    componentDidMount:function () {
        var that = this;
        AsyncStorage.getItem('user')
            .then((data)=>{
                if(data){
                    var user = JSON.parse(data);
                }
                if(user && user.accessToken){
                    that.setState({
                        user:user
                    })
                }
                that.setState(newState);
            })
            .catch(function (error) {
                console.log(error)
            })
    },
    _pickPhoto:function () {
        var that = this;
        console.log(ImagePicker);
        ImagePicker.showImagePicker(options, (response) => {
            /*if (response.didCancel) {
                return;
            }
            var avatorData = 'data:image/jpeg:base64,' + response.data;
            var user = that.state.user;
            user.avator = avatorData;
            that.setState({
                user:user
            })*/
        });
    },
    render:function () {
        var user = this.state.user;
        return (
            <View style={styles.container}>
                <View style={styles.toolbar}>
                    <Text style={styles.toolbarTitle}>我的账号</Text>

                </View>

                {
                    user.avator
                    ? <TouchableOpacity onPress={this._pickPhoto} style={styles.avatorContainer}>
                        <Image source={{uri:user.avator}} style={styles.avatorContainer}>
                            <View style={styles.avatorBox}>
                                <Image
                                    source={{uri:user.avator}}
                                    style={styles.avator}/>
                            </View>
                            <Text style={styles.avatorTip}>戳这里换头像</Text>
                        </Image>
                    </TouchableOpacity>
                    :<View style={styles.avatorContainer}>
                        <Text style={styles.avatorTip}>添加狗狗头像</Text>
                        <TouchableOpacity style={styles.avatorBox}>
                            <Icon
                                name="ios-cloud-upload-outline"
                                style={styles.plusIcon}/>
                        </TouchableOpacity>
                    </View>
                }
            </View>
        )
    }
});

var styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
    },
    toolbar:{
        flexDirection:'row',
        paddingTop:25,
        paddingBottom:12,
        backgroundColor:'#ee735c'
    },
    toolbarTitle:{
        flex:1,
        fontSize:16,
        color:'#fff',
        textAlign:'center',
        fontWeight:'600'
    },
    avatorContainer:{
        width:width,
        height:140,
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'#666'
    },
    avatorBox:{
        paddingTop:15,
        alignItems:'center',
        justifyContent:'center'
    },
    plusIcon:{
        padding:20,
        paddingLeft:25,
        paddingRight:25,
        color:'#999',
        fontSize:24,
        backgroundColor:'#fff',
        borderRadius:8
    },
    avatorTip:{
        color:'#fff',
        backgroundColor:'transparent',
        fontSize:14,
    },
    avator:{
        marginBottom:15,
        width:width * 0.2,
        height:width * 0.2,
        resizeMode:'cover',
        borderRadius:width * 0.1
    }
});

module.exports = Account;

