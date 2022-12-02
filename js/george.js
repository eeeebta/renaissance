let cleanedData = null;

let mySpotifyVisGlobe,
    mySpotifyFigGraph

// main driver code for
function spotifyDriver(data, geoData){
    cleanedData = data
    mySpotifyVisGlobe = new spotifyGlobeVis("spotifyVisGlobe_div", data, geoData);
    mySpotifyFigGraph = new spotifyFigVis("songsDist", cleanedData);

}

// cleans data
function cleanSpotifyData(data) {
    console.log(data)

    let cleaned = [];
    data.forEach(function(d){
        d = {
            'track':        d.track,
            'artist':       d.artist,
            'feat':         d.feat,
            'current_post': parseInt(d.current_pos),
            'peak_pos':     parseInt(d.peak_pos),
            'prev_pos':     parseInt(d.prev_pos),
            'streak':       parseInt(d.streak),
            'streams':      parseInt(d.streams),
            'country':      d.country,
            'date':         d.date,
            'album':        d.album
        }
        cleaned.push((d));
    });
    return cleaned;
}

