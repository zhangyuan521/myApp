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
var Modal = ReactNative.Modal;
var Text = ReactNative.Text;
var View = ReactNative.View;
import Button from 'react-native-button';
var TextInput = ReactNative.TextInput;
var TouchableOpacity = ReactNative.TouchableOpacity;
var AlertIOS = ReactNative.AlertIOS;
var Image = ReactNative.Image;
var Icon = require('react-native-vector-icons/Ionicons');
var Progress = require('react-native-progress');
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
    if(id.indexOf('http')>-1){
        return id;
    }
    if(id.indexOf('data:image')>-1){
        return id;
    }
    return CLOUDINARY.base + '/' + type + '/upload/' + id;
}

var Account = React.createClass ({
    getInitialState:function () {
        var user = this.props.user || {};
        return {
            user:user,
            avatorProgress:0,
            avatorUploading:false,
            modalVisible:false
        }
    },
    _edit:function () {
        this.setState({
            modalVisible:true
        })
    },
    _closeModal:function () {
        this.setState({
            modalVisible:false
        })
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
                console.log(error);
            })
    },
    _pickPhoto:function () {
        var that = this;
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
        this.setState({
            avatorUploading:true,
            avatorProgress:0
        })
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
                user.avator = response.public_id;
                that.setState({
                    avatorUploading:false,
                    avatorProgress:0,
                    user:user
                });
                this._syncUser(true);
            }
        }
        if(xhr.upload){
            xhr.upload.onprogress = (event)=>{
                if(event.lengthComputable){
                    var percent = Number((event.loaded / event.total).toFixed(2));
                    that.setState({
                        avatorProgress:percent
                    })
                }
            }
        }
        xhr.send(body);
    },
    _syncUser:function (isAvator) {
        var that = this;
        var user = this.state.user;
        if(user && user.accessToken){
            var url = config.api.base + config.api.update;
            request.post(url,user)
                .then((data)=>{
                    console.log(data);
                    if(data && data.success){
                        var user = data.data;
                        if(isAvator){
                            AlertIOS.alert('头像跟新成功');
                        }
                        that.setState({
                            user:user
                        },function () {
                            that._closeModal();
                            AsyncStorage.setItem('user',JSON.stringify(user));
                        })
                    }
                })

        }
    },
    _changeUserState:function (key,value) {
        var user = this.state.user;
        user[key] = value;
        this.setState({
            user:user
        })
    },
    _submit:function () {
        this._syncUser(false);
    },
    _logout:function () {
        this.props.logout();
    },
    render:function () {
        var user = this.state.user;
        return (
            <View style={styles.container}>
                <View style={styles.toolbar}>
                    <Text style={styles.toolbarTitle}>狗狗的账号</Text>
                    <Text style={styles.toolbarExtra} onPress={this._edit}>编辑</Text>

                </View>

                {
                    user.avator
                    ? <TouchableOpacity onPress={this._pickPhoto} style={styles.avatorContainer}>
                        <Image source={{uri:avator(user.avator,'image')}} style={styles.avatorContainer}>
                            <View style={styles.avatorBox}>
                                {
                                    this.state.avatorUploading
                                        ? <Progress.Circle
                                        size={75}
                                        showText={true}
                                        color="green"
                                        progress={this.state.avatorProgress} />
                                        : <Image
                                        source={{uri:avator(user.avator,'image')}}
                                        style={styles.avator}/>
                                }
                            </View>
                            <Text style={styles.avatorTip}>戳这里换头像</Text>
                        </Image>
                    </TouchableOpacity>
                    :<View style={styles.avatorContainer}>
                        <Text style={styles.avatorTip}>添加狗狗头像</Text>
                        <TouchableOpacity style={styles.avatorBox}>
                            {
                                this.state.avatorUploading
                                ? <Progress.Circle
                                    size={75}
                                    showText={true}
                                    color="green"
                                    progress={this.state.avatorProgress} />
                                : <Icon
                                    name="ios-cloud-upload-outline"
                                    style={styles.plusIcon}/>
                            }
                        </TouchableOpacity>
                    </View>
                }
                <Modal
                    animationType={'fade'}
                    visible={this.state.modalVisible}>
                    <View style={styles.modalContainer}>
                        <Icon name="ios-close-outline"
                            style={styles.closeIcon}
                            onPress={this._closeModal}/>
                        <View style={styles.fieldItem}>
                            <Text style={styles.label}>昵称</Text>
                            <TextInput placeholder="输入你的昵称" style={styles.inputField}
                                autoCapitalize={'none'}
                                autoCorrect={false}
                                defaultValue={user.nickname}
                                onChangeText={(text)=>{
                                    this._changeUserState('nickname',text);
                                 }}
                            />
                        </View>
                        <View style={styles.fieldItem}>
                            <Text style={styles.label}>品种</Text>
                            <TextInput placeholder="狗狗的品种" style={styles.inputField}
                                       autoCapitalize={'none'}
                                       autoCorrect={false}
                                       defaultValue={user.breed}
                                       onChangeText={(text)=>{
                                    this._changeUserState('breed',text);
                                 }}
                            />
                        </View>
                        <View style={styles.fieldItem}>
                            <Text style={styles.label}>年龄</Text>
                            <TextInput placeholder="狗狗的的年龄" style={styles.inputField}
                                       autoCapitalize={'none'}
                                       autoCorrect={false}
                                       defaultValue={user.age}
                                       onChangeText={(text)=>{
                                    this._changeUserState('age',text);
                                 }}
                            />
                        </View>
                        <View style={styles.fieldItem}>
                            <Text style={styles.label}>性别</Text>
                            <Icon.Button
                                onPress={()=>{
                                    this._changeUserState('gender','male')
                                }}
                                style={[
                                    styles.gender,
                                    user.gender == 'male' && styles.genderChecked
                                ]}
                                name="ios-paw-outline"
                            >男</Icon.Button>
                            <Icon.Button
                                onPress={()=>{
                                    this._changeUserState('gender','female')
                                }}
                                style={[
                                    styles.gender,
                                    user.gender == 'female' && styles.genderChecked
                                ]}
                                name="ios-paw"
                            >女</Icon.Button>
                        </View>
                        <Button
                            style={styles.btn}
                            onPress={this._submit}>登录</Button>
                    </View>
                </Modal>
                <Button
                    style={styles.btn}
                    onPress={this._logout}>退出登录</Button>
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
    },
    toolbarExtra:{
        position:'absolute',
        right: 10,
        top:26,
        textAlign:'right',
        fontWeight:'600',
        fontSize:14

    },
    modalContainer:{
        flex:1,
        paddingTop:50,
        backgroundColor:'#fff',
    },
    fieldItem:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        height:50,
        paddingLeft:15,
        paddingRight:15,
        borderColor:'#eee',
        borderBottomWidth:1,
    },
    label:{
        color:'#ccc',
        marginRight:10,
    },
    inputField:{
        height:50,
        flex:1,
        color:'#666',
        fontSize:14
    },
    closeIcon:{
        position:'absolute',
        width:40,
        height:40,
        fontSize:32,
        right:20,
        top:30,
        color:'#ee735c'
    },
    gender:{
        backgroundColor:'#ccc',
    },
    genderChecked:{
        backgroundColor:'#ee735c',
    },
    btn:{
        marginTop:25,
        marginLeft:10,
        marginRight:10,
        padding:10,
        backgroundColor:'transparent',
        borderColor:'#ee735c',
        borderWidth:1,
        borderRadius:4,
        color:'#ee735c'
    },
});

module.exports = Account;

