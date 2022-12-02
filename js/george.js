let cleanedData = null;

let mySpotifyVisGlobe,
    mySpotifyFigGraph

// main driver code for spotify
// creates globe and figure graphs
function spotifyDriver(data, geoData){
    cleanedData = cleanSpotifyData(data)
    mySpotifyVisGlobe = new spotifyGlobeVis("spotifyVisGlobe_div", cleanedData, geoData);
    mySpotifyFigGraph = new spotifyFigVis("songsDist", cleanedData);

}

// cleans data
function cleanSpotifyData(data) {
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


