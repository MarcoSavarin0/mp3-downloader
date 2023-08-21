require('dotenv').config();
const fetch = require('node-fetch')

async function fetchMp3Yt(id) {
    try {
        const response = await fetch('https://youtube-mp36.p.rapidapi.com/dl?id=' + id, {
            method: "GET",
            headers: {
                "x-rapidapi-key": process.env.YT_API_KEY,
                "x-rapidapi-host": process.env.YT_API_HOST
            }
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching video:", error);
        return null;
    }
}
async function fetchSpotify(id){
    try{
        const response = await fetch('https://spotify-downloader1.p.rapidapi.com/download/' + id, {
            method: "GET",
            headers: {
                "x-rapidapi-key": process.env.SPOTIFY_API_KEY,
                "x-rapidapi-host": process.env.SPOTIFY_API_HOST
            }
        })
        const data = await response.json();
        return data
    }catch (error) {
        console.error("Error fetching video:", error);
        return null;
    }
}

async function fetchVideoYt(id){
    try{
        const response = await fetch('https://ytstream-download-youtube-videos.p.rapidapi.com/dl?id=' + id,
        {
            method: "GET",
            headers: {
                "x-rapidapi-key": process.env.YT_VIDEO_API_KEY,
                "x-rapidapi-host": process.env.YT_VIDEO_API_HOST
            }
        })
        const data = await response.json();
        return data
    }catch(err){
        console.log("FetchvideoYt", err);
        return null
    }
}

async function fetchCombinedData(id) {
    try {
        const videoData = await fetchVideoYt(id);
        const mp3Data = await fetchMp3Yt(id);

        const combinedData = {
            videoData: videoData,
            mp3Data: mp3Data
        };

        return combinedData;
    } catch (error) {
        console.error("Error fetching combined data:", error);
        return null;
    }
}


module.exports = {
    index: function(req,res){
        res.render('index', {spotifySucces: false})
    },
    converterMp3: async function(req,res){
        const videoURL = req.body.videoURL;
        const urlIDNavegador = videoURL.split('=')
        const regex = /^https:\/\/youtu\.be\/[^/]+$/;
        const spotifyRegex = /^https:\/\/open\.spotify\.com\/[a-zA-Z0-9\/-]+$/
        console.log(videoURL);
        if(
            videoURL === undefined || videoURL ===  null || videoURL === ''
        ){
            return res.render('index',{success: false, message : "Please Enter video URL"})
        }else if(urlIDNavegador.length >= 2){
            fetchCombinedData(urlIDNavegador[1])
            .then(combinedData => {
                if (combinedData) {
                    const videoData = combinedData.videoData;
                    const mp3Data = combinedData.mp3Data;
                    console.log(videoData.formats);
                    if (mp3Data.status === 'ok' && videoData.status === 'OK') {
                        return res.render('index', { success: true, song_title: mp3Data.title, song_link: mp3Data.link, idVideo: urlIDNavegador[1], videoData: videoData.formats});
                    } else {
                        return res.render("index", { success: false, message: mp3Data.msg });
                    }
                } else {
                    return res.render("index", { success: false, message: "Error fetching combined data" });
                }
            })
            .catch(err => {
                console.error("Error", err);
            });
            
        }
        else if(regex.test(videoURL)){
            const lastSlashIndex = videoURL.lastIndexOf("/");
            const afterLastSlash = videoURL.substring(lastSlashIndex + 1);
            fetchCombinedData(afterLastSlash)
                .then(combinedData => {
                    const videoData = combinedData.videoData;
                    const mp3Data = combinedData.mp3Data;
                    if (mp3Data.status === 'ok' && videoData.status === 'OK') {
                        return res.render('index', { success: true, song_title: mp3Data.title, song_link: mp3Data.link,  idVideo: afterLastSlash, videoData: videoData.formats });
                    } else {
                        return res.render("index", { success: false, message: result.msg});
                    }
                })
                .catch(err => {
                    console.error("Error", err);
                });
        }
        else if(spotifyRegex.test(videoURL)){
            let trackID = videoURL.split("/")[5]
            fetchSpotify(trackID)
                .then(result =>{
                    console.log(result);
                    if(result.success){ 
                        res.render('index',{spotifySucces: true, song_title: result.metadata.title, song_link: result.link } )
                    }else{
                        res.render('index',{spotifySucces: false, success:false ,message: 'FAILED'} )
                    }
                })
        }
        
        else{
            return res.render('index', {success : false, message:'Please enter YT url' })
        }
    }
}