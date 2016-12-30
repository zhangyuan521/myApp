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
    qiniu:{
        upload: 'http://upload.qiniu.com',
    },
    cloudinary:{
        cloud_name: 'dgf748kky',
        api_key: '648877967177585',
        base: 'http://res.cloudinary.com/dgf748kky',
        image: 'https://api.cloudinary.com/v1_1/dgf748kky/image/upload',
        video: 'https://api.cloudinary.com/v1_1/dgf748kky/video/upload',
        audio: 'https://api.cloudinary.com/v1_1/dgf748kky/raw/upload',
    },
    api:{
        base:'http://localhost:3000/',
        base2:'http://rap.taobao.org/mockjs/10378/',
        creations:'api/creations?accessToken=sdfsdf',
        comment:'api/comments',
        up:'api/up',
        signup:'api/u/signup',
        verify:'api/u/verify',
        signature:'api/signature',
        update:'api/u/update'
    }
}