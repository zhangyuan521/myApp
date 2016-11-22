var ReactNative = require('react-native');
var React = require('react');

var List = require('./app/creation/index');
var Edit = require('./app/edit/index');
var Account = require('./app/account/index');

var AppRegistry = ReactNative.AppRegistry;
var StyleSheet = ReactNative.StyleSheet;
var Text = ReactNative.Text;
var View = ReactNative.View;
var TabBarIOS = ReactNative.TabBarIOS;
var Navigator = ReactNative.Navigator;
var Icon = require('react-native-vector-icons/Ionicons');

var myProject = React.createClass ({
  getInitialState(){
    console.log('getInitialState');
    return {
        selectedTab: 'list',
    };
  },
  render: function() {
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
          }}>
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
