let cleanedData = null;
let dailyDatacleaned = null

let mySpotifyVisGlobe,
    mySpotifyVisBar,
    mySpotifyVisGraph,
    horizontalDist

function spotifyDriver(data, geoData){
    cleanedData = data
    //dailyData(data)
    mySpotifyVisGlobe = new spotifyVisGlobe("spotifyVisGlobe_div", data, geoData);
    //mySpotifyVisBar = new spotifyVisBar("spotifyVisBar_div", data);
    mySpotifyVisGraph = new spotifyVisGraph("spotifyVisGraph_div", data);
}

// groups data by song and day
function dailyData(data) {
    var tracks = {}
    data.forEach(function(d){
        if(d.country === 'Global') {
        }
        else {
            // check if track exists in tracks:
            if (!(d.track in tracks)) {
                tracks[d.track] = {}
            }
            if(!(d.date in tracks[d.track])){
                tracks[d.track][d.date] = 0
            }
            tracks[d.track][d.date] += d.streams
        }
    })
    dailyDatacleaned = tracks
}

function figureGraph() {
    if(cleanedData === null || chartInit){
        return
    }
    chartInit = true;
    mySpotifyVisGlobe = new figures("songsDist", cleanedData);

}





    //OLD TEST
    /*
    // do not create the graphs if the data have not been loaded
    if(cleanedData === null || chartInit){
        return
    }

    chartInit = true;
    console.log("create it!")

    let margin = {top: 20, right: 20, bottom: 20, left: 20};
    parentElement = 'songsDist'
    let width = document.getElementById('songsDist').getBoundingClientRect().width;
    let height = document.getElementById('songsDist').getBoundingClientRect().height;
    console.log("SONGS DISTRIBUTION WIDTH" , width)


    console.log(cleanedData)
    // init drawing area
    let svg = d3.select("#" + parentElement).append("svg")
        .attr("width", width)
        .attr("height",height)
        .attr('transform', `translate (${margin.left}, ${margin.top})`);

    let position = ['0vh','40vh','80vh','120vh']
    let position_txt = ['1vh','41vh','81vh','121vh']

    // groups the data per song
    let tracks= {}

    cleanedData.forEach(function(d){
            // do not include global data
            if(d.country !== 'Global') {
                if (!(d.track in tracks)) {
                    tracks[d.track] = 0
                }
                tracks[d.track] += d.streams
            }
    });
    let displayData = []
    for (const [key,value] of Object.entries(tracks)){
            displayData.push({'track':key, 'streams':value});
        }
    console.log(displayData)

    let rects = svg.selectAll('rectAlb')
        .data(displayData)
        .enter()
        .append('rect')
        .attr('x', function(d, i) {
            return position[i%4]
        })
        .attr("y", function (d,i) {
            return 50 * [Math.floor(i/4)];
        })
        .attr("width", '30vh')
        .attr("height", 30)
        .attr("fill", "#DCA54C")
        .on('mouseover', function(event, d){
            d3.select(this)
                .attr('stroke-width', '1px')
                .attr('stroke', 'white')
        })
        .on('mouseout', function(event, d) {
            d3.select(this)
                .attr('stroke-width', '0px')
                .attr('stroke', 'black')
        })
        .on('click', function(d,i){updateGraph(i.track, cleanedData)});


    svg.selectAll('song-titles')
        .data(displayData)
        .enter()
        .append('text')
        .attr('class', 'spotify-songname')
        .attr("text-anchor", "start")
        .attr('x', function(d, i) {
            return position_txt[i%4]
        })
        .attr("y", function (d,i) {
            return (50 * [Math.floor(i/4)])+18;
        })
        .text(function(d) {
            if(d.track === 'MOVE (feat. Grace Jones & Tems)')
            {
                return 'MOVE'
            }
            return d.track;
        })
        .attr('font-size', '12px')
        .attr("fill", "black")
        .on('mouseover', function(event, d){
            d3.select(this)
                .attr('stroke-width', '1px')
                .attr('stroke', 'white')
        })
        .on('mouseout', function(event, d) {
            d3.select(this)
                .attr('stroke-width', '0px')
                .attr('stroke', 'black')
        })
        .on('click', function(d,i){updateGraph(i.track, cleanedData)});




    /*
            vis.svg.selectAll("bars")
            .data(vis.displayData)
            .enter()
            .append("text")
            .attr("class", "percentage-tooltip")
            .attr("text-anchor", "start")
            .attr("x", function(d, i) {
                return 115;
            })
            .attr("y", function (d, i) {
                if(i === 0){
                    return 15
                }
                let gap = 4
                for(let j =0;j<i;j++){
                    gap += dataScale(vis.displayData[j].streams) + 3
                }
                return gap + 20;
            })
            .text(function(d) {
                return "Track: " + d.track + " Streams: " + d.streams ;
            })
            .attr('font-size', '8px')
            .attr("fill", "#DCA54C");


}
*/
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


class spotifyVisBar {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data
        this.grouping()
        this.grouping()
        this.initVis()
    }

    // groups the data per song
    grouping(){

        let vis = this;
        console.log("Grouping data for bar creation")
        // create random data structure with information for each land
        vis.songInfo = {};

        vis.tracks= {}

        vis.data.forEach(function(d){
            // do not include global data
            if(d.country !== 'Global') {
                if (!(d.track in vis.tracks)) {
                    vis.tracks[d.track] = 0
                }
                vis.tracks[d.track] += d.streams
            }
        });
        vis.displayData = []
        for (const [key,value] of Object.entries(vis.tracks)){
            vis.displayData.push({'track':key, 'streams':value})

        }
        console.log("Create Bar Graphs")

    }

    initVis(){
        let vis = this;
        // set margin and width/height
        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;


        // calculate totalStreams
        let totalStreams = d3.sum(vis.displayData, d=>d.streams)
        let minStreams = d3.min(vis.displayData, d=>d.streams)

        let dataScale = d3.scaleLinear()
            .domain([0,totalStreams])
            .range([vis.margin.top, vis.height/3- vis.margin.top - vis.margin.bottom])

        let bandScale = d3
            .scaleBand()
            .domain([minStreams, totalStreams])
            .range([0, vis.height/2])


        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);


        vis.svg.selectAll("mybar")
            .data([totalStreams])
            .enter()
            .append('rect')
            .attr("x", function (d) {
                return vis.margin.left;
            })
            .attr("y", function (d) {
                return vis.margin.top;
            })
            .attr("width", 30)
            .attr("height", function (d) {
                return vis.height - vis.margin.bottom-vis.margin.bottom
            })
            .attr("fill", "#DCA54C")
            .on('mouseover', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '1px')
                    .attr('stroke', 'white')
            })
            .on('mouseout', function(event, d) {
                d3.select(this)
                    .attr('stroke-width', '0px')
                    .attr('stroke', 'black')
            })
            .on('click', function(d,i){console.log("Update graph")});

        vis.svg.append("text")
            .attr("class", "title")
            .attr("text-anchor", "start")
            .attr("x", 5)
            .attr("y",15)
            .text(totalStreams)
            .attr('fill',"#DCA54C")
            .attr('font-size', '12px');

        vis.svg.append("text")
            .attr("class", "title")
            .attr("text-anchor", "start")
            .attr("x", 22)
            .attr("y",vis.height/2 - vis.margin.top)
            .text("Total")
            .attr('fill',"black")
            .attr('font-size', '12px')
            .on('click', function(d,i){console.log("Update graph")});


        vis.svg.selectAll("bars")
            .data(vis.displayData)
            .enter()
            .append('rect')
            .attr("x", function (d) {
                return vis.margin.left + 50;
            })
            .attr("y", function (d, i) {
                if(i === 0){
                    return 6
                }
                let gap = 4
                for(let j =0;j<i;j++){
                    gap += dataScale(vis.displayData[j].streams) + 3
                }
                return gap + 3;
            })
            .attr("width", 30)
            .attr("height", function (d) {
                return dataScale(d.streams);
            })
            .attr("fill", "#DCA54C")

        vis.svg.selectAll("bars")
            .data(vis.displayData)
            .enter()
            .append("text")
            .attr("class", "percentage-tooltip")
            .attr("text-anchor", "start")
            .attr("x", function(d, i) {
                return 115;
            })
            .attr("y", function (d, i) {
                if(i === 0){
                    return 15
                }
                let gap = 4
                for(let j =0;j<i;j++){
                    gap += dataScale(vis.displayData[j].streams) + 3
                }
                return gap + 20;
            })
            .text(function(d) {
                return "Track: " + d.track + " Streams: " + d.streams ;
            })
            .attr('font-size', '8px')
            .attr("fill", "#DCA54C");
    }

    createBreakdown(){
        console.log('bruh')
    }
}


class spotifyVisGraph {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data

        this.grouping()
        this.initVis()
    }

    // groups the data per song
    grouping(){

        let vis = this;
        console.log("Wrangling Spotify Data")
        // create random data structure with information for each land
        vis.songInfo = {};

        vis.tracks= {}

        vis.data.forEach(function(d){
            // do not include global data
            if(d.country !== 'Global') {
                if (!(d.track in vis.tracks)) {
                    vis.tracks[d.track] = 0
                }
                vis.tracks[d.track] += d.streams
            }
        });
        vis.displayData = []
        for (const [key,value] of Object.entries(vis.tracks)){
            vis.displayData.push({'track':key, 'streams':value})

        }
        console.log("Create Graphs")

    }

    initVis() {

    }

}

