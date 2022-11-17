class musicVis {
    constructor(parentElement, songData, keyData) {
        this.parentElement = parentElement;
        this.songData = songData;
        this.keyData = keyData;

        // temporary color scheme (DELETE LATER)
        this.colorScale = d3.scaleLinear()
            .domain([0, 12])
            .range(['pink', "purple"])

        // data for circle of fifths pie chart
        this.pieData = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

        console.log("musical data: " , this.data);

        this.initVis()
    }

    initVis() {
        let vis = this;

        // init global margin & color conventions
        vis.margin = globalMargin;
        vis.colors = globalColors;

        // init height and width
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left}, ${vis.margin.top})`)


        // ****init circle of fifths with d3 pie****
        // define outer radius
        vis.outerRadius = (vis.height / 2) - vis.margin.left - vis.margin.right;

        // create pie chart group
        vis.pieChartGroup = vis.svg
            .append("g")
            .attr("class", "pieChart_CoF")
            .attr("transform", "translate(" + ((vis.width / 2) + vis.margin.left) + ", " + vis.outerRadius + ") rotate (-15)")

        // define pie layout
        vis.pie = d3.pie()
            .value(d => {
                return d;
            })

        // path generator for arc segments
        vis.arc = d3.arc()
            .innerRadius(1)
            .outerRadius(vis.outerRadius);


        // **** init dots for songs ****
        vis.songDotGroup = vis.svg
            .append("g")
            .attr("class", "song-dots")
            .attr("transform", "translate(" + ((vis.width / 2) + vis.margin.left) + ", " + vis.outerRadius + ") rotate(-15)" )

        // **** init connector lines for song dots ****
        vis.songLineGroup = vis.svg
            .append("g")
            .attr("class", "song-lines")
            .attr("transform", "translate(" + ((vis.width / 2) + vis.margin.left) + ", " + vis.outerRadius + ") rotate(-15)" )


        // append tooltip
        vis.tooltip = d3.select(".section-hanna")
            .append("div")
            .attr("class", "tooltip")

        this.wrangleData()
    }

    wrangleData() {
        let vis = this;

        // make array of key-centroid pairs
        vis.keyCentroids = [];
        vis.pie(vis.pieData).forEach((d, i) => {
           vis.keyCentroids.push(
                {keysig_id: vis.keyData[i].keysig_id,
                centroid_loc: vis.arc.centroid(d)}
            )
        })
        //console.log("key-centroid pairs", vis.keyCentroids);

        // append key id to song data structure
        vis.songData.forEach(d => {
            let keyID = vis.keyData.find(x => {
                return x.key_full.includes(d.key);
            })
            d.track_number = +d.track_number;
            d.keyID = +keyID.keysig_id;
        })

        this.updateVis();
    }

    updateVis() {
        let vis = this;

        // CIRCLE OF FIFTHS STUFF
        // bind data
        vis.arcs = vis.pieChartGroup.selectAll(" .arc")
            .data(vis.pie(vis.pieData));

        // append paths & make array of centroid locations
        vis.arcs.enter()
            .append("path")
            .attr("d", vis.arc)
            .style("fill", (d, i) => vis.colorScale(i))
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .attr("stroke-width", "2px")
                    .attr("stroke", "black")

                d3.selectAll(`#keyID_${vis.keyData[d.index].keysig_id}`)
                    .text(d => d.key_long)
            })
            .on("mouseout", function(event, d) {
                d3.select(this)
                    .attr("stroke-width", "0px")

                d3.selectAll(`#keyID_${vis.keyData[d.index].keysig_id}`)
                    .text(d => d.key_short)
            })

        // append key labels @ centroid coordinates
        vis.arcs
            .data(vis.keyData)
            .enter()
            .append("text")
            .attr("class", "key-labels")
            .attr("id", d => "keyID_" + d.keysig_id)
            .text(d => d.key_short)
            .attr("text-anchor", "middle")
            .attr("font-size", 12)
            .attr("transform", (d, i) => {
                return "translate(" + (1.8 * vis.keyCentroids[i].centroid_loc[0]) + ", " + (1.8 * vis.keyCentroids[i].centroid_loc[1]) + ") rotate(15)"
            })

        // SONG DOT STUFF
        vis.songDots = vis.songDotGroup.selectAll(".dots")
            .data(vis.songData);

        vis.songDots.enter()
            .append("circle")
            .attr("class", "dots")
            .attr("r", 4)
            .attr("transform", (d) => {
                let trackScale = d.track_number * 0.1;
                return "translate(" + (trackScale * vis.keyCentroids[d.keyID].centroid_loc[0]) + ", " + (trackScale * vis.keyCentroids[d.keyID].centroid_loc[1]) + ")"
            })
            .attr("fill", "black")
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .attr("fill", "lightgrey")

                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX - 40 + "px")
                    .style("top", -(2 * vis.height + 5 * vis.margin.top) + (event.pageY) + "px")
                    .html(`
                        <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 1vh">
                            <h3>${d.Song_title}</h3>
                            <h4>key: ${d.key}</h4>
                            <h4>BPM: ${d.bpm}</h4>
                            <h4>Length: ${d.length}</h4>
                        </div>`);
            })
            .on("mouseout", function(event, d) {
                d3.select(this)
                    .attr("fill", "black")

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })
    }
}