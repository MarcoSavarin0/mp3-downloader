require('dotenv').config();
const fetch = require('node-fetch')

async function fetchVideo(id) {
    try {
        const response = await fetch('https://youtube-mp36.p.rapidapi.com/dl?id=' + id, {
            method: "GET",
            headers: {
                "x-rapidapi-key": process.env.API_KEY,
                "x-rapidapi-host": process.env.API_HOST
            }
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching video:", error);
        return null;
    }
}

module.exports = {
    index: function(req,res){
        res.render('index')
    },
    converterMp3: async function(req,res){
        const videoURL = req.body.videoURL;
        const urlIDNavegador = videoURL.split('=')
        const regex = /^https:\/\/youtu\.be\/[^/]+$/;
        if(
            videoURL === undefined || videoURL ===  null || videoURL === ''
        ){
            return res.render('index',{success: false, message : "Please Enter video URL"})
        }else if(urlIDNavegador.length >= 2){
            fetchVideo(urlIDNavegador[1])
                .then(result  => {
                    if(result.status === 'ok'){
                        return res.render('index', {success : true, song_title: result.title, song_link :result.link})
                    }
                    else{
                        return res.render("index", {success : false, message: result.msg})
                    }
                })
                .catch(err =>{
                    console.error("Error", err);
                })
            
        }
        else if(regex.test(videoURL)){
            const lastSlashIndex = videoURL.lastIndexOf("/");
            const afterLastSlash = videoURL.substring(lastSlashIndex + 1);
            console.log('llegue');
            fetchVideo(afterLastSlash)
                .then(result => {
                    if (result.status === 'ok') {
                        return res.render('index', { success: true, song_title: result.title, song_link: result.link });
                    } else {
                        return res.render("index", { success: false, message: result.msg });
                    }
                })
                .catch(err => {
                    console.error("Error", err);
                });
        }
    }
}