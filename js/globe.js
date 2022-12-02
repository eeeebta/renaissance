let rotate = [.001, 0],
    velocity = [.013, 0],
    time = Date.now();
let selectionDrag = false
let selectionCoun = false
let currentCount = null
let locator = null

class spotifyGlobeVis {
    constructor(parentElement, data, geoData) {
        this.parentElement = parentElement;
        this.data = data
        this.geoData = geoData;
        this.displayData = null;
        this.mySpotifyVisBar = null

        this.initVis();
    }

    initVis() {
        let vis = this;
        // set margin and width/height
        vis.margin = {top: 20, right: 10, bottom: 20, left: 0};
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
                    //vis.div.style("display", "none");

                    // if we have previously created a graph then we want to call update on the old one
                    if(vis.mySpotifyVisBar === null) {
                        vis.mySpotifyVisBar = new BarVis("spotifyVisGlobetooltip_div", vis.data, d.properties.name);
                    }
                    else {
                        vis.mySpotifyVisBar.wrangleData(d.properties.name)
                    }
                    vis.div.style('display','block')
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
                    vis.mySpotifyVisBar.wrangleData(currentCount.properties.name)
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
let dateParser = d3.timeParse("%m/%e/%Y");

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
        let countries = {}
        for (const row in vis.data) {
            let country = vis.data[row].country
            let date = vis.data[row].date
            let streams = vis.data[row].streams


            if(country === 'Global'){

            }
            else {
                if(!(country in countries)){
                    countries[country] = {}
                }
                if(!(date in countries[country])) {
                    countries[country][date] = 0
                }
                countries[country][date] += streams
            }
        }
        let res = {}
        for (const country in countries){
            res[country] = []
            for (const date in countries[country]) {
                let row = {
                    'date': dateParser(date),
                    'streams': countries[country][date]
                }
                res[country].push(row)
            }
        }

        vis.cleanedData = res
    }

    initVis() {
        let vis = this;

        // define dimensions
        vis.margin = {top: 20, right: 20, bottom: 40, left: 60};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

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
            .attr('font-size', '3vh')
            .attr('font-family', 'Grenze Gotisch')
            .attr('fill', '#DCA54C');

        /*
        // tooltip group
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'barTooltip')

      */
        // Scales and axes
        // init scales
        vis.x = d3.scaleTime().range([0, vis.width-vis.margin.right]);
        vis.xAxis = d3.axisBottom()
            .tickFormat(d3.timeFormat("%m/%d"))
            .scale(vis.x)

        vis.y = d3.scaleLinear().range([vis.height, 0]);
        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        // init x
        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(7," + vis.height + ")");

        // y axis group
        vis.svg.append("g")
            .attr("class", "y-axis axis");


        // begin data wrangling
        this.wrangleData();
    }

    // adjust to not overwrite if selection is current
    wrangleData(selection=null) {
        let vis = this
        if(selection !== null){
            vis.selection = selection
        }
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
        vis.displayData = vis.cleanedData[vis.selection].sort(function(a,b){
            return a.date - b.date
        })

        vis.updateVis()
    }


    updateVis() {
        let vis = this;

        vis.x.domain(d3.extent(vis.displayData, function (d) {
            return new Date(d.date)
        }));


        vis.y.domain([0,d3.max(vis.displayData, d=>d.streams)])


        vis.bar = vis.svg.selectAll(".bar")
            .data(vis.displayData)

        vis.bar.enter().append("rect")
            .attr("class", "bar")
            .merge(vis.bar)
            .attr("x", function (d) {
                return vis.x(d.date)+5
            })
            .attr("y", function (d) {
                return vis.y(d.streams);
            })
            .attr("height", function (d) {
                return vis.height - vis.y(d.streams);
            })
            .attr('width',function(d) {
                return 5
            })
            .attr('fill','white')
            .transition()
            .duration(200);

        vis.title.text(vis.selection)
        // draw x & y axis
        //vis.xAxis.transition().duration(400).call(d3.axisBottom(vis.x).tickFormat(d3.timeFormat("%d-%b")));
        // Update the y-axis
        // draw x & y axis
        vis.svg.select(".x-axis").transition().duration(400)
            .call(vis.xAxis.tickValues(d3.map(vis.displayData, function (d) {
                return new Date(d.date)
            })))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");

        vis.svg.select(".y-axis").transition().duration(400).call(vis.yAxis);

    }
}

