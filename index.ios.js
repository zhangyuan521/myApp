var ReactNative = require('react-native');
var React = require('react');

var List = require('./app/creation/index');
var Edit = require('./app/edit/index');
var Account = require('./app/account/index');
var Login = require('./app/account/login');

var AppRegistry = ReactNative.AppRegistry;
var StyleSheet = ReactNative.StyleSheet;
var Text = ReactNative.Text;
var View = ReactNative.View;
var TabBarIOS = ReactNative.TabBarIOS;
var Navigator = ReactNative.Navigator;
var AsyncStorage = ReactNative.AsyncStorage;
var Icon = require('react-native-vector-icons/Ionicons');

var myProject = React.createClass ({
  getInitialState(){
    console.log('getInitialState');
    return {
        user:null,
        selectedTab: 'list',
        logined:false
    };
  },
  componentDidMount:function () {
        this._syncAppStatus();
  },
  _syncAppStatus:function () {
    var that = this;
    AsyncStorage.getItem('user')
        .then((data)=>{
            var user;
            var newState = {};
            if(data){
                user = JSON.parse(data);
            }
            if(user && user.accessToken){
                newState.user = user;
                newState.logined = true;
            }else{
                newState.logined = false;
            }
            that.setState(newState);
        })
        .catch(function (error) {
            console.log(error)
        })

  },
  _afterLogin:function (user) {
    var that = this;
    user = JSON.stringify(user);
      console.log(user);
      AsyncStorage.setItem('user',user)
        .then(()=>{
            that.setState({
                logined:true,
                user:user
            })
        })
          .catch(function (error) {
          console.log('shibai');
      })
  },
  render: function() {
    if(!this.state.logined){
        return <Login afterLogin={this._afterLogin}/>;
    }
    return (
        <TabBarIOS
            unselectedTintColor="yellow" tintColor="#ee735c">
          <Icon.TabBarItem
              title="Blue Tab"
              iconName='ios-videocam-outline'
              selectedIconName='ios-videocam-outline'
              selected={this.state.selectedTab === 'list'}
              onPress={() => {
                      this.setState({
                        selectedTab: 'list',
                      });
                 }
              }
          >
              <Navigator
                  initialRoute={{
                    name: 'list',
                    component: List
                   }}
                  configureScene={(route)=>{
                    return Navigator.SceneConfigs.FloatFromRight
                  }}
                  renderScene={(route, navigator) => {
                    var Component = route.component;
                    return <Component {...route.params} navigator={navigator}/>
                  }}
              />
          </Icon.TabBarItem>
          <Icon.TabBarItem
              iconName='ios-recording-outline'
              selectedIconName='ios-recording-outline'
              selected={this.state.selectedTab === 'edit'}
              onPress={() => {
            this.setState({
              selectedTab: 'edit',
            });
          }}>
              <Edit/>
          </Icon.TabBarItem>
          <Icon.TabBarItem
              iconName='ios-more-outline'
              selectedIconName='ios-more-outline'
              renderAsOriginal
              title="More"
              selected={this.state.selectedTab === 'account'}
              onPress={() => {
              this.setState({
                selectedTab: 'account',
            });
          }}>
              <Account/>
          </Icon.TabBarItem>
        </TabBarIOS>
    );
  }
});

var styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
  tabContent: {
    flex: 1,
    alignItems: 'center',
  },
  tabText: {
    color: 'white',
    margin: 50,
  },
});

AppRegistry.registerComponent('myProject', () => myProject);
