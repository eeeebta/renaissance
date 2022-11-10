class narrativeVis {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;

        // test data, TODO: DELETE
        this.testData = []

        console.log(this.data);

        this.initVis()
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