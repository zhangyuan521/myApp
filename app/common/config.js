/**
 * Created by duke on 2016/11/20.
 */
module.exports = {
    header:{
        method:'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    },
    api:{
        base:'http://rap.taobao.org/mockjs/10378/',
        creations:'api/creations?accessToken=sdfsdf',
        comment:'api/comments',
        up:'api/up',
        signup:'api/u/signup',
        verify:'api/u/verify',
    }
}