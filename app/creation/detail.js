/**
 * Created by duke on 2016/11/20.
 */
var ReactNative = require('react-native');
var React = require('react');
var StyleSheet = ReactNative.StyleSheet;
var Text = ReactNative.Text;
var View = ReactNative.View;
var Icon = require('react-native-vector-icons/Ionicons');
var Detail = React.createClass ({
    _backToList:function () {
        this.props.navigator.pop();
    },
    render:function () {
        var row = this.props.row;
        return (
            <View style={styles.container}>
                <Text onPress={this._backToList}>详情页面{row._id}</Text>
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
});

module.exports = Detail;

