class musicVis {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;

        // temporary color scheme (DELETE LATER)
        this.tempcolors = d3.schemeSet3;
        this.pieData = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

        // key arrays for circle of fifths pie chart
        this.keys_short = ["C", "G", "D", "A", "E", "Cb/B", "Gb/F#", "Db/C#", "Ab", "Eb", "Bb", "F"];
        this.keys_long = ["C major/ A minor", "G major/ E minor", "D major/ B minor", "A major/ F# minor", "E major/ C# minor", "B major/ G# minor", "F#/Gb major/ D#/Eb minor",
                            "Db major/ Bb minor", "Ab major/ F minor", "Eb major/ C minor", "Bb major/ G minor", "F major/ D minor"];

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


        // init circle of fifths with d3 pie
        // define outer radius
        vis.outerRadius = (vis.height / 2) - vis.margin.left - vis.margin.right;

        // create pie chart group
        vis.pieChartGroup = vis.svg
            .append("g")
            .attr("class", "pieChart_CoF")
            .attr("transform", "translate(" + vis.outerRadius + ", " + vis.outerRadius + ") rotate(-15)")

        // define pie layout
        vis.pie = d3.pie()
            .value(d => {
                return d;
            })

        // path generator for arc segments
        vis.arc = d3.arc()
            .innerRadius(1)
            .outerRadius(vis.outerRadius);

        // bind data
        vis.arcs = vis.pieChartGroup.selectAll(" .arc")
            .data(vis.pie(vis.pieData))

        // append paths
        vis.arcs.enter()
            .append("path")
            .attr("d", vis.arc)
            .style("fill", (d, i) => {
                return this.tempcolors[i];
            });


        vis.arcs
            .data(vis.keys_short)
            .enter()
            .append("text")
            .text(d => d)
            .attr("transform", (d, i) => {
                console.log(d);

            })
            .attr("text-anchor", "end")
            .attr("font-size", 12);

        this.wrangleData()
    }

    wrangleData() {
        let vis = this;



        this.updateVis();
    }

    updateVis() {
        let vis = this;

    }
}