/**
 * Created by duke on 2016/11/20.
 */

var ReactNative = require('react-native');
var request = require('../common/request');
var config = require('../common/config');
import Button from 'react-native-button';
var React = require('react');
var StyleSheet = ReactNative.StyleSheet;
var AlertIOS = ReactNative.AlertIOS;
var Text = ReactNative.Text;
var TextInput = ReactNative.TextInput;
var View = ReactNative.View;
var Icon = require('react-native-vector-icons/Ionicons');
var CountDown = require('react-native-sk-countdown').CountDownText;
var Login = React.createClass ({
    getInitialState:function () {
        return {
            phoneNumber:'',
            codeSent:false,
            verifyCode:'',
            countingDone:false
        }
    },
    _sendVerifyCode:function () {
        var that = this;
        var phoneNumber = this.state.phoneNumber;
        if(!phoneNumber){
            return AlertIOS.alert('手机号不能为空');
        }
        var body = {
            phoneNumber:phoneNumber
        }
        var signupURL = config.api.base + config.api.signup;
        request.post(signupURL,body)
            .then(function (data) {
                if(data && data.success){
                    that._showVerifyCode();
                }else{
                    AlertIOS.alert('获取验证码失败,请检查手机号是否正确');
                }
            })
            .catch(function (e) {
                console.log(e);
                AlertIOS.alert('检查网络是否良好');
            })
    },
    _showVerifyCode:function () {
        this.setState({
            codeSent:true
        })
    },
    _countingDone:function () {
        this.setState({
            countingDone:true
        })
    },
    _submit:function () {
        var that = this;
        var phoneNumber = this.state.phoneNumber;
        var verifyCode = this.state.verifyCode;
        if(!phoneNumber || !verifyCode){
            return AlertIOS.alert('手机号或验证码不能为空');
        }
        var body = {
            phoneNumber:phoneNumber,
            verifyCode:verifyCode
        }
        var verifyURL = config.api.base + config.api.verify;
        request.post(verifyURL,body)
            .then(function (data) {
                if(data && data.success){
                    console.log('login ok')
                    that.props.afterLogin(data.data);
                }else{
                    AlertIOS.alert('获取验证码失败,请检查手机号是否正确');
                }
            })
            .catch(function (e) {
                AlertIOS.alert('检查网络是否良好');
            })
    },
    render:function () {
        return (
            <View style={styles.container}>
                <View style={styles.signupBox}>
                    <Text style={styles.title}>快速登录</Text>
                    <TextInput
                        placeholder="输入手机号"
                        autoCaptialize={'none'}  //不去纠正大小写
                        autoCorrect={false} //不去纠正内容的对于错
                        keyboardType={'number-pad'}
                        style={styles.inputField}
                        onChangeText={(text)=>{
                            this.setState({
                                phoneNumber:text
                            })
                        }}
                    />
                    {
                        this.state.codeSent
                            ?<View style={styles.verifyCodeBox}>
                            <TextInput
                                placeholder="输入验证码"
                                autoCaptialize={'none'}  //不去纠正大小写
                                autoCorrect={false} //不去纠正内容的对于错
                                keyboardType={'number-pad'}
                                style={styles.inputFieldCode}
                                onChangeText={(text)=>{
                                    this.setState({
                                        verifyCode:text
                                    })
                                }}
                            />
                            {
                                this.state.countingDone
                                    ? <Button
                                    style={styles.countBtn}
                                    onPress={this._sendVerifyCode}>获取验证码</Button>
                                    : <CountDown
                                    style={styles.countBtn}
                                    countType='seconds' // 计时类型：seconds / date
                                    auto={true} // 自动开始
                                    afterEnd={this._countingDone} // 结束回调
                                    timeLeft={60} // 正向计时 时间起点为0秒
                                    step={-1} // 计时步长，以秒为单位，正数则为正计时，负数为倒计时
                                    startText='获取验证码' // 开始的文本
                                    endText='获取验证码' // 结束的文本
                                    intervalText={(sec) => '剩余秒数:' + sec} // 定时的文本回调
                                />
                            }
                        </View>
                            :null
                    }
                    {
                        this.state.codeSent
                            ? <Button
                            style={styles.btn}
                            onPress={this._submit}>登录</Button>
                            : <Button
                            style={styles.btn}
                            onPress={this._sendVerifyCode}>获取验证码</Button>
                    }
                </View>
            </View>
        )
    }
});

var styles = StyleSheet.create({
    container: {
        flex: 1,
        padding:10,
        backgroundColor:'#f9f9f9'
    },
    signupBox:{
        marginTop:30
    },
    title:{
        marginBottom:20,
        color:'#333',
        fontSize:20,
        textAlign:'center'
    },
    inputField:{
        height:40,
        padding:5,
        color:'#666',
        fontSize:16,
        backgroundColor:'#fff',
        borderRadius:4
    },
    inputFieldCode:{
        height:40,
        padding:5,
        flex:1,
        color:'#666',
        fontSize:16,
        backgroundColor:'#fff',
        borderRadius:4
    },
    btn:{
        marginTop:10,
        padding:10,
        backgroundColor:'transparent',
        borderColor:'#ee735c',
        borderWidth:1,
        borderRadius:4,
        color:'#ee735c'
    },
    verifyCodeBox:{
        marginTop:10,
        flexDirection:'row',
        justifyContent:'space-between'
    },
    countBtn:{
        width:110,
        height:40,
        padding:10,
        marginLeft:8,
        color:'#fff',
        backgroundColor:'#ee735c',
        borderColor:'#ee735c',
        textAlign:'left',
        fontWeight:'600',
        fontSize:15,
        borderRadius:2
    }


});

module.exports = Login;

