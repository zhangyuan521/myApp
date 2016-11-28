/**
 * Created by duke on 2016/11/20.
 */
var ReactNative = require('react-native');
var React = require('react');
var sha1 = require('sha1');
var Platform = require('react-native').Platform;
var ImagePicker = require('react-native-image-picker');
var request = require('../common/request');
var config = require('../common/config');
var StyleSheet = ReactNative.StyleSheet;
var Text = ReactNative.Text;
var View = ReactNative.View;
var TouchableOpacity = ReactNative.TouchableOpacity;
var AlertIOS = ReactNative.AlertIOS;
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
var CLOUDINARY = {
    cloud_name: 'dgf748kky',
    api_key: '648877967177585',
    api_secret: 'uN_RzI0Mppk6M_vUmn0uUHVulHQ',
    base: 'http://res.cloudinary.com/dgf748kky',
    image: 'https://api.cloudinary.com/v1_1/dgf748kky/image/upload',
    video: 'https://api.cloudinary.com/v1_1/dgf748kky/video/upload',
    audio: 'https://api.cloudinary.com/v1_1/dgf748kky/raw/upload',
};

function avator(id, type) {
    return CLOUDINARY.base + '/' + type + '/upload/' + id;
}

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
            if (response.didCancel) {
                return;
            }
            var avatorData = 'data:image/jpeg;base64,' + response.data;
            var timestamp = Date.now();
            var tags = 'app.avator';
            var folder = 'avator';
            var signatureURL = config.api.base + config.api.signature;
            var accessToken = this.state.user.accessToken;
            request.post(signatureURL,{
                accessToken:accessToken,
                timestamp:timestamp,
                folder:folder,
                tags:tags,
                type:'avator'
            })
            .catch((err)=>{
                console.log(err)
            })
            .then((data)=>{
                if(data && data.success){
                    //data.data
                    var signature = 'folder=' + folder + '&tags=' + tags + '&timestamp=' + timestamp + CLOUDINARY.api_secret;
                    signature = sha1(signature);
                    var body = new FormData();
                    body.append('folder',folder);
                    body.append('signature',signature);
                    body.append('timestamp',timestamp);
                    body.append('tags',tags);
                    body.append('api_key',CLOUDINARY.api_key);
                    body.append('resource_type','image');
                    body.append('file',avatorData);
                    that._upload(body);
                }
            })
        });
    },
    _upload:function (body) {
        var that = this;
        var xhr = new XMLHttpRequest();
        var url = CLOUDINARY.image;
        xhr.open('post',url);
        xhr.onload = ()=>{
            if(xhr.status != 200){
                AlertIOS.alert('请求失败');
                console.log(xhr.responseText);
                return;
            }
            if(!xhr.responseText){
                AlertIOS.alert('请求失败');
                return;
            }

            var response;
            try{
                response = JSON.parse(xhr.response);
            }
            catch(e){
                console.log(e);
                console.log('parse fails');
            }

            if(response && response.public_id){
                var user = this.state.user;
                user.avator = avator(response.public_id, 'image');
                that.setState({
                    user:user
                })
            }
        }
        xhr.send(body);
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

