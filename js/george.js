let dateParser = d3.timeParse("%m/%d/%Y");




class spotifyVis {
    constructor(parentElement, data, geoData) {
        this.parentElement = parentElement;
        this.data = data
        this.geoData = geoData;


        console.log("Spotify data analysis")
        this.cleanData();
        this.initVis();

    }

    cleanData() {
        let vis = this;
        let cleaned = [];
        vis.data.forEach(function(d){
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
        vis.displayData = cleaned;
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
            .range(['pink', "purple"])

        // add title
        vis.svg.append('g')
            .attr('class', 'title')
            .attr('id', 'map-title')
            .append('text')
            .text('World Map for 30 days')
            .attr('transform', `translate(${vis.width / 2}, 20)`)
            .attr('text-anchor', 'middle');

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

        vis.displayData.forEach(function(d){
            if(!(d.country in vis.country)){
                vis.country[d.country] = 0
            }
            vis.country[d.country] += d.streams

        });




        vis.updateVis()
    }
    updateVis() {
        let vis = this;
        console.log("Updating Globe")

        let keys = Object.keys(vis.country);
        let max = 0,
            min = Infinity
        keys.forEach(function(key){
                if(key !== 'Global') {
                    if(vis.country[key] > max){
                        max = vis.country[key]
                    }
                    if(vis.country[key] < min ){
                        min = vis.country[key]
                }
            }
        });
        //vis.colorScale.domain(0,max)

        vis.colorScale.domain([0, max]);
        vis.countries
            .style("fill", function (d, index) {
                let name =  d.properties.name

                if(name in vis.country){
                    return vis.colorScale(vis.country[name])
                }
                return "White"
            })
        console.log("End spotify data")
    }
}