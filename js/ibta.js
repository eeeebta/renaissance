class narrativeVis {
    constructor(parentElement, data) {
        console.log("hdashdsa")
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

        let texts = d3.selectAll("text")
            .data(vis.data)


        texts.enter().attr('transform', 'rotate(45, ' + function (d) { return vis.x(d.name)} + ', ' + function (d) { return vis.y(d[selectedValue])} + ')')

        let circles = vis.svg.selectAll(".circles")
            .data(vis.data)

        circles.exit().remove();

        circles.enter()
            .append("circle")
            .merge(circles)
            .transition()
            .duration(100)
            .attr("class", "circles")
            .attr("fill", "#DDA54C")
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

        vis.y.domain([d3.min(vis.data, (d) => {
            return d[selectedValue];
        }), d3.max(vis.data, (d) => {
            return +d[selectedValue];
        })]);

        vis.svg.select(".y-axis").call(vis.yAxis);

    }
}


class lyricVis {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.songRef = {"I'M THAT GIRL": 0, "COZY": 1, "ALIEN SUPERSTAR": 2, "CUFF IT": 3, "ENERGY": 4, "BREAK MY SOUL": 5, "CHURCH GIRL": 6, "PLASTIC OFF THE SOFA": 7, "VIRGO'S GROOVE": 8, "MOVE": 9, "HEATED": 10, "THIQUE": 11, "ALL UP IN YOUR MIND": 12, "AMERICA HAS A PROBLEM": 13, "PURE/HONEY": 14, "SUMMER RENAISSANCE": 15};

        console.log(data)

        this.initVis();
    }

    initVis() {
        let vis = this;

        // init margins and height
        vis.margin = globalMargin;
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        d3.select("#filterSong")
            .on("change", () => {
                vis.updateVis();
        })


        this.wrangleData();
    }

    wrangleData() {
        let vis = this;

        vis.updateVis();
    }

    updateVis() {

        let vis = this;

        let selectedValue = d3.select("#filterSong").property("value");

        // console.log(vis.data[vis.songRef[selectedValue]]["lyrics"]);

        let lyrics = d3.select("#lyrics-view");
        let desc = d3.select("#song-desc");

        let tmpLyrics = d3.selectAll(".tmpLyric");
        let tmpDesc = d3.selectAll(".tmpDesc");

        let tmpDescDiv = d3.selectAll(".temp-lyrics");

        let tmpSong = d3.selectAll(".song-desc");

        tmpSong.remove();
        tmpDescDiv.remove();

        

        tmpLyrics.remove();
        tmpDesc.remove();
        
        // desc.remove();

       let newLyrics = vis.data[vis.songRef[selectedValue]]["lyrics"].split("\\n");
       let newDesc = vis.data[vis.songRef[selectedValue]]["annotation"].split("\\n");

       console.log(newLyrics)

       let newLstring = "";
       let newDescString = "";

       newLyrics.forEach( (i) => {
            newLstring = newLstring + `<p class='tmpLyric'>${i}</p>`;
       })

       newDesc.forEach( (i) => {
            newDescString = newDescString + `<p class='tmpDesc'>${i}</p>`
       })

        tmpLyrics = lyrics
            .append("div")
            .attr("class", "temp-lyrics")

        tmpDesc = desc
            .append("div")
            .attr("class", "song-desc")
        
        tmpLyrics
            .html(newLstring);

        tmpDesc
            .html(newDescString);

        
        
    }
}