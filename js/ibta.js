class narrativeVis {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.songNames = [];
        // this.songID = {}
        this.danceability = []

        this.data.forEach((d) => {
            d.danceability = +d.danceability;
            d.energy = +d.energy;
            d.key = +d.key;
            d.loudness = +d.loudness;
            d.mode = +d.mode;
            d.speechiness = +d.speechiness;
            d.acousticness = +d.acousticness;
            d.instrumentalness = +d.instrumentalness;
            d.liveness = +d.liveness;
            d.valence = +d.valence;
            d.tempo = +d.tempo;
            this.songNames.push(d.name)
        })

        this.initVis();
    }

    initVis() {
        let vis = this;

        

        // init margins and height
        vis.margin = globalMargin;
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left}, ${vis.margin.top})`)

        vis.x = d3.scaleBand()
            .domain(this.songNames)
            .range([vis.height, 0]);

        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.xAxis = d3.axisBottom().scale(vis.x);

        vis.yAxis = d3.axisLeft().scale(vis.y);

        vis.svg.append("g")
            .attr("class", "x-axis axis-ibta")
            .attr("transform", `translate(0, ${vis.height})`);

        vis.svg.append("g")
            .attr("class", "y-axis axis-ibta");

        vis.svg.select(".x-axis").call(vis.xAxis);

        vis.svg.append("path")
			.datum(vis.data)
			.attr("d", d3.line()
                .x((d) => {
                    return vis.x(d.name)
                })
                .y((d) => {
                    return vis.y(d.danceability)
                })
            )
			.attr("class", "line-ibta");

        d3.select("#filterNar")
            .on("change", () => {
                vis.updateVis();
        })

        this.wrangleData()
    }

    wrangleData() {
        let vis = this;


        this.updateVis();
    }

    updateVis() {
        let vis = this;

        let selectedValue = d3.select("#filterNar").property("value");

        let circles = vis.svg.selectAll(".circles")
            .data(vis.data)

        circles.exit().remove();

        circles.enter()
            .append("circle")
            .merge(circles)
            .transition()
            .duration(100)
            .attr("class", "circles")
            .attr("fill", "black")
            .attr("stroke", "none")
            .attr("cx", (d) => { return vis.x(d.name)})
            .attr("cy", (d) => { return vis.y(d[selectedValue]) })
            .attr("r", 5)

        let line = d3.select(".line-ibta");

        line
            .datum(vis.data)
            .transition()
            .duration(100)
            .attr("d", d3.line()
                .x((d) => {
                    return vis.x(d.name)
                })
                .y((d) => {
                    return vis.y(d[selectedValue])
                })
            )

        // vis.y.range([0, d3.max(vis.data, (d) => {
        //     return +d[selectedValue];
        // })]);

        vis.svg.select(".y-axis").call(vis.yAxis);

    }
}


class lyricVis {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;

        this.initVis();
    }

    initVis() {
        let vis = this;

        // init margins and height
        vis.margin = globalMargin;
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left}, ${vis.margin.top})`)

        this.wrangleData();
    }

    wrangleData() {
        let vis = this;

        vis.updateVis();
    }

    updateVis() {

        let vis = this;

        let selectedValue = d3.select("#filterSong").property("value");

        let lyrics = d3.select("#lyrics-view");
        let desc = d3.select("#song-desc");

        lyrics
            .append("text")
            .attr("lyrics")
            .text("")
        
    }
}