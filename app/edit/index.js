/**
 * Created by duke on 2016/11/20.
 */
var ReactNative = require('react-native');
var React = require('react');
var StyleSheet = ReactNative.StyleSheet;
var Text = ReactNative.Text;
var View = ReactNative.View;
var Icon = require('react-native-vector-icons/Ionicons');
var Edit = React.createClass ({
    render:function () {
        return (
            <View style={styles.container}>
                <Text>制作业面</Text>
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

module.exports = Edit;

