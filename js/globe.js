var rotate = [.001, 0],
    velocity = [.013, 0],
    time = Date.now();
var selectionDrag = false
var selectionCoun = false
var currentCount = null
var locator = null

class spotifyVisGlobe {
    constructor(parentElement, data, geoData) {
        this.parentElement = parentElement;
        this.data = data
        this.geoData = geoData;

        this.displayData = null;

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

        vis.div = d3.select("#spotifyVisGlobetooltip_div")
        vis.tooltipTitle = d3.select("#selectionTitle")
        vis.tooltipStreams = d3.select("#selectionViews")
        vis.tooltipMost = d3.select("#selectionMost")

        vis.projection = d3.geoOrthographic() // d3.geoStereographic
            .scale(vis.height/2)
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
                    selectionDrag = true
                    let lastRotationParams = vis.projection.rotate();
                    m0 = [event.x, event.y];
                    o0 = [-lastRotationParams[0], -lastRotationParams[1]];
                })
                .on("drag", function (event) {
                    if (m0) {
                        let m1 = [event.x, event.y],
                            o1 = [o0[0] + (m0[0] - m1[0]) / 4, o0[1] + (m1[1] - m0[1]) / 4];
                        rotate[0] = -o1[0]
                        rotate[1] = -o1[1]
                        vis.projection.rotate([-o1[0], -o1[1]]);
                    }

                    // Update the map
                    vis.path = d3.geoPath().projection(vis.projection);
                    d3.selectAll(".country").attr("d", vis.path)
                    d3.selectAll(".graticule").attr("d", vis.path)
                })
                .on('end',function(event){
                    console.log(vis.projection)
                    //rotate[1] = event.x
                    //rotate[0] = event.y
                    selectionDrag = false
                })
        )
        vis.wrangleData()
    }

    wrangleData() {
        let vis = this;
        // create data structure with information for each countri
        vis.country = {}

        vis.countrySongs = {}

        vis.data.forEach(function(d){
            if(!(d.country in vis.country)){
                vis.country[d.country] = 0
                vis.countrySongs[d.country] = {}
            }
            vis.country[d.country] += d.streams

            if(!(d.track in vis.countrySongs[d.country])){
                vis.countrySongs[d.country][d.track] = 0
            }
            vis.countrySongs[d.country][d.track] += d.streams

        });
        console.log(vis.countrySongs)
        vis.displayData = vis.country;
        vis.updateVis()
    }

    updateVis() {
        let vis = this;
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

        vis.colorScale.domain([0, max]);
        vis.countries
            .style("fill", function (d, index) {
                let name =  d.properties.name

                if(name in vis.displayData){
                    return vis.colorScale(vis.displayData[name])
                }
                return "White"
            })
            .on('click', function(event, d){
                let selectedCountry = d.properties.name

                // not valid selection
                if(!(selectedCountry in vis.displayData)){

                    return
                }
                // no active selection
                if(currentCount === null){
                    d3.select(this)
                        .style('fill', 'red')
                    currentCount = d
                    locator = this
                    selectionCoun = true

                    rotate[0] = vis.projection.rotate()[0]
                    rotate[1] = vis.projection.rotate()[1]
                    console.log('EDW')
                    //vis.div.style("display", "none");
                    console.log("tora tha ginei tis poutanas")

                    // if we have previously created a graph then we want to call update on the old one
                    vis.mySpotifyVisBar = new BarVis("spotifyVisGlobetooltip_div", vis.data, d.properties.name);

                    //vis.tooltipTitle.text(d.properties.name)
                    //vis.tooltipStreams.text("Total streams: " + vis.displayData[selectedCountry])
                    let mostSteamedSong = Object.keys(vis.countrySongs[selectedCountry]).reduce((a, b) => vis.countrySongs[selectedCountry][a] > vis.countrySongs[selectedCountry][b] ? a : b)
                    //vis.tooltipMost.text("Most listened song was " + mostSteamedSong)

                }
                // re-clicked country
                else if(currentCount.properties.name === selectedCountry){
                    d3.select(this)
                        .style('fill', vis.colorScale(vis.displayData[selectedCountry]))
                    // clear selection
                    currentCount = null
                    locator = null
                    selectionCoun = false
                    // hide vis
                    vis.div.style('display','none')

                    //vis.tooltipTitle.text("")
                    //vis.tooltipStreams.text("")
                    //vis.tooltipMost.text("")
                }
                // different selection
                else{
                    // read the new selectionn
                    d3.select(this)
                        .style('fill', 'red')
                    // return previous to color

                    d3.select(locator)
                        .style('fill', vis.colorScale(vis.displayData[currentCount.properties.name]))

                    currentCount = d
                    locator = this

                    rotate[0] = vis.projection.rotate()[0]
                    rotate[1] = vis.projection.rotate()[1]

                    // UPDATE GRAPH

                    //vis.tooltipTitle.text(d.properties.name)
                    //vis.tooltipStreams.text("Total streams: " + vis.displayData[selectedCountry])
                    let mostSteamedSong = Object.keys(vis.countrySongs[selectedCountry]).reduce((a, b) => vis.countrySongs[selectedCountry][a] > vis.countrySongs[selectedCountry][b] ? a : b)
                    //vis.tooltipMost.text("Most listened song was " + mostSteamedSong)
                }
            })

        this.rotateGlobe()
    }

    rotateGlobe() {
        let vis = this
        d3.timer(function() {
            if(!selectionDrag && !selectionCoun) {
                var dt = Date.now() - time;
                vis.projection.rotate([rotate[0] + velocity[0] * dt, rotate[1] + velocity[1] * dt]);
                d3.selectAll(".country").attr("d", vis.path)
            }
            else{
                time = Date.now()
            }
        });
    }
}


let barChart = null
let displayData = null

let dateParser = d3.timeParse("%m/%d/%Y");


function updateGraph(name, data){
    // populate graph
    if(barChart === null){
        barChart = new BarVis('dailyGraph', name, data)
    }
    else{
        barChart.wrangleData(name)
    }
}

class BarVis {
    constructor(parentElement, data, country) {
        this.parentElement = parentElement;
        this.data = data;
        this.selection = country;
        this.initData()
        this.initVis()
    }

    initData() {
        let vis = this;


        let days = {}

        for (const row in vis.data) {
            // if selection
            if(vis.data[row].country === vis.selection) {
                let date = vis.data[row].date
                let track = vis.data[row].track
                if (!(date in days)) {
                    days[date] = 0
                }
                days[date] += vis.data[row].streams
            }
        }
        let res = []
        for (const day in days){

            let row = {'date':dateParser(day),
                'streams':days[day]}
            res.push(row)
        }

        vis.displayData = res
    }

    initVis() {

        let vis = this;

        console.log("Begin creating graph for " + vis.selection)
        console.log("With the data:")
        console.log(vis.displayData)

        // define dimensions
        vis.margin = {top: 20, right: 20, bottom: 20, left: 40};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;
        console.log("Vrika", vis.height)
        console.log("Vrika", vis.width)

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // add title
        vis.title = vis.svg.append('g')
            .attr('class', 'title bar-title')
            .append('text')
            .text("Listens in" + vis.selection)
            .attr('transform', `translate(${vis.width / 2}, 10)`)
            .attr('text-anchor', 'middle')
            .attr('fill', 'gold');

        /*
        // tooltip group
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'barTooltip')

      */
        // Scales and axes
        // init scales
        vis.x = d3.scaleTime().range([0, vis.width]);
        vis.y = d3.scaleLinear().range([vis.height, 0]);

        // init x & y axis
        vis.xAxis = vis.svg.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + vis.height + ")");
        vis.yAxis = vis.svg.append("g")
            .attr("class", "axis axis--y");


        // begin data wrangling
        console.log("data wrangling")
        this.wrangleData(vis.selection);
    }

    // adjust to not overwrite if selection is current
    wrangleData(selection) {
        let vis = this
        /*
                if((selection !== null) && (vis.selection !== selection)){
                    vis.selection = selection
                    console.log('updated data')
                }
                vis.displayData = vis.groupedData[vis.selection].sort(function(a,b){
                    return a.date - b.date
                })
                console.log('New display data')
                console.log(vis.displayData)
        */
        vis.updateVis()
    }


    updateVis() {
        let vis = this;

        vis.x.domain(d3.extent(vis.displayData, function (d) {
            return d.date
        }));
        vis.y.domain(d3.extent(vis.displayData, function (d) {
            return d.streams
        }));

        vis.bar = vis.svg.selectAll(".bar")
            .data(vis.displayData)

        vis.bar.enter().append("rect")
            .attr("class", "bar")
            .merge(vis.bar)
            .attr("x", function (d) {
                console.log(vis.x(d.date))
                return vis.x(d.date)
            })
            .attr("y", function (d) {
                console.log(vis.y(d.streams))
                return vis.y(d.streams);
            })
            .attr("height", function (d) {
                return vis.height - vis.y(d.streams);
            })
            .attr('width',function(d) {
                return 10
            })
            .attr('fill','red')
            .transition()
            .duration(200);

        vis.title.text(vis.selection)
        // draw x & y axis
        //vis.xAxis.transition().duration(400).call(d3.axisBottom(vis.x).tickFormat(d3.timeFormat("%d-%b")));
        console.log('wow')
        // Update the y-axis
        // draw x & y axis
        vis.xAxis.transition().duration(400).call(d3.axisBottom(vis.x).tickFormat(d3.timeFormat("%d-%b")));
        vis.yAxis.transition().duration(400).call(d3.axisLeft(vis.y).ticks(5));

    }
}

