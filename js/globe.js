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


        vis.tooltipTitle = d3.select("#" + 'selectionTitle')
        vis.tooltipStreams = d3.select("#"+'selectionViews')
        vis.tooltipMost = d3.select("#"+'selectionMost')

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
                    console.log('STARTED')
                    selectionDrag = true
                    let lastRotationParams = vis.projection.rotate();
                    m0 = [event.x, event.y];
                    o0 = [-lastRotationParams[0], -lastRotationParams[1]];
                })
                .on("drag", function (event) {
                    if (m0) {
                        let m1 = [event.x, event.y],
                            o1 = [o0[0] + (m0[0] - m1[0]) / 4, o0[1] + (m1[1] - m0[1]) / 4];
                        console.log('CHANGED')
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
                    console.log('ended at', event.x,event.y)
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
        console.log("Wrangling Spotify Data")

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

                    console.log('here')
                    console.log(vis.displayData[selectedCountry])

                    vis.tooltipTitle.text(d.properties.name)
                    vis.tooltipStreams.text("Total streams: " + vis.displayData[selectedCountry])
                    let mostSteamedSong = Object.keys(vis.countrySongs[selectedCountry]).reduce((a, b) => vis.countrySongs[selectedCountry][a] > vis.countrySongs[selectedCountry][b] ? a : b)
                    vis.tooltipMost.text("Most listened song was " + mostSteamedSong)

                }
                // re-clicked country
                else if(currentCount.properties.name === selectedCountry){
                    d3.select(this)
                        .style('fill', vis.colorScale(vis.displayData[selectedCountry]))
                    // clear selection
                    currentCount = null
                    locator = null
                    selectionCoun = false

                    vis.tooltipTitle.text("")
                    vis.tooltipStreams.text("")
                    vis.tooltipMost.text("")
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

                    vis.tooltipTitle.text(d.properties.name)
                    vis.tooltipStreams.text("Total streams: " + vis.displayData[selectedCountry])
                    let mostSteamedSong = Object.keys(vis.countrySongs[selectedCountry]).reduce((a, b) => vis.countrySongs[selectedCountry][a] > vis.countrySongs[selectedCountry][b] ? a : b)
                    vis.tooltipMost.text("Most listened song was " + mostSteamedSong)
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

// Epomeno feature
// Tooltip on selection

/*
.on('mouseover', function(event, d){
                let state = vis.displayData.find(o => o.state === d.properties.name);
                // highlight selection
                d3.select(this)
                .attr('stroke-width', '2px')
                .attr('stroke', 'black')
                .style("fill", 'red')

                // create tooltip
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
             <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                 <h3>${state.state}<h3>
                 <h4> Population: ${state.population}</h4>
                 <h4> Cases (absolute): ${state.absCases}</h4>
                 <h4> Deaths (absolute): ${state.absDeaths}</h4>
                 <h4> Cases (relative): ${state.relCases.toFixed( 2 )}</h4>
                 <h4> Cases (relativate): ${state.relDeaths.toFixed( 2 )}</h4>
             </div>`);
            })
            .on('mouseout', function(event, d){
                // revert to original color
                d3.select(this)
                    .attr('stroke-width', '1px')
                    .style("stroke", "#000")
                    //.attr("fill", d => d.data.color)
                    .style("fill", function(d){
                        let state = vis.displayData.find(o => o.state === d.properties.name);
                        //console.log(state, d.properties.name)
                        return vis.colorScale(state[vis.selection])
                    })

                    // remove tooltip
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            });

 */