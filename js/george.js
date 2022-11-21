let dateParser = d3.timeParse("%m/%d/%Y");



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
            'date':         dateParser(d.date),
            'album':        d.album
        }

        if (d.album === 'RENAISSANCE') {
            cleaned.push((d));
        }

    });
    return cleaned;
}

class spotifyVisGlobe {
    constructor(parentElement, data, geoData) {
        this.parentElement = parentElement;
        this.data = data
        this.geoData = geoData;

        this.displayData = data;

        console.log("Spotify data analysis")
        //this.cleanData();


        this.initVis();
    }


    initVis() {
        let vis = this;
        console.log(vis.geoData)
        // set margin and width/height
        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        vis.colorScale = d3.scaleLinear()
            .range(['black', "#DCA54C"])

        // add title

        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'pieTooltip')

        vis.projection = d3.geoOrthographic() // d3.geoStereographic
            .scale(vis.height/3)
            .translate([vis.width / 2, vis.height / 2])

        vis.path = d3.geoPath()
            .projection(vis.projection);

        vis.svg.append("path")
            .datum({type: "Sphere"})
            .attr("class", "graticule")
            .attr('fill', '#ADDEFF')
            .attr("stroke","rgba(129,129,129,0.35)")
            .attr("d", vis.path);

        vis.world = topojson.feature(vis.geoData, vis.geoData.objects.countries).features
        vis.countries = vis.svg.selectAll(".country")
            .data(vis.world)
            .enter().append("path")
            .attr('class', 'country')
            .attr("d", vis.path)

        let m0,
            o0;

        vis.svg.call(
            d3.drag()
                .on("start", function (event) {

                    let lastRotationParams = vis.projection.rotate();
                    m0 = [event.x, event.y];
                    o0 = [-lastRotationParams[0], -lastRotationParams[1]];
                })
                .on("drag", function (event) {
                    if (m0) {
                        let m1 = [event.x, event.y],
                            o1 = [o0[0] + (m0[0] - m1[0]) / 4, o0[1] + (m1[1] - m0[1]) / 4];
                        vis.projection.rotate([-o1[0], -o1[1]]);
                    }

                    // Update the map
                    vis.path = d3.geoPath().projection(vis.projection);
                    d3.selectAll(".country").attr("d", vis.path)
                    d3.selectAll(".graticule").attr("d", vis.path)
                })
        )
        vis.wrangleData()
    }

    wrangleData() {
        let vis = this;
        console.log("Wrangling Spotify Data")
        // create random data structure with information for each land
        vis.countryInfo = {};

        vis.country = {}

        vis.data.forEach(function(d){
            if(!(d.country in vis.country)){
                vis.country[d.country] = 0
            }
            vis.country[d.country] += d.streams

        });

        vis.displayData = vis.country;


        vis.updateVis()
    }
    updateVis() {
        let vis = this;
        console.log("Updating Globe")

        let keys = Object.keys(vis.displayData);
        // FIX THIS! change from dict to obj
        let max = 4000000,
            min = Infinity
        keys.forEach(function(key){
                if(key !== 'Global') {
                    if(vis.displayData[key] > max){
                        max = vis.displayData[key]
                    }
                    if(vis.displayData[key] < min ){
                        min = vis.displayData[key]
                }
            }
        });
        //vis.colorScale.domain(0,max)

        vis.colorScale.domain([0, max]);
        vis.countries
            .style("fill", function (d, index) {
                let name =  d.properties.name

                if(name in vis.displayData){
                    return vis.colorScale(vis.displayData[name])
                }
                return "White"
            })
        console.log("End spotify data")
    }
}


class spotifyVisBar {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data

        console.log("1")
        console.log("2")
        console.log("3")
        console.log("4")
        console.log(this.data)

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

