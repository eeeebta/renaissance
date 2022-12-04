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
            .range(["#848cff","#ff77d3"])

        vis.div = d3.select("#spotifyVisGlobetooltip_div")
        vis.tooltipTitle = d3.select("#selectionTitle")
        vis.tooltipStreams = d3.select("#selectionViews")
        vis.tooltipMost = d3.select("#selectionMost")

        vis.projection = d3.geoOrthographic() // d3.geoStereographic
            .scale(vis.height/2)
            .translate([vis.width / 2, vis.height / 2])

        vis.path = d3.geoPath()
            .projection(vis.projection);

        // append g element for map
        vis.map = vis.svg.append("g");

        vis.map.append("path")
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

        vis.colorScale.domain([0, Math.log(max)]);
        vis.countries
            .style("fill", function (d, index) {
                let name =  d.properties.name

                if(name in vis.displayData){
                    return vis.colorScale(Math.log(vis.displayData[name]))
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
                        .style('fill', '#DCA54C')
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
                        .style('fill', vis.colorScale(Math.log(vis.displayData[selectedCountry])))
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
                        .style('fill', '#DCA54C')
                    // return previous to color

                    d3.select(locator)
                        .style('fill', vis.colorScale(Math.log(vis.displayData[currentCount.properties.name])))

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

