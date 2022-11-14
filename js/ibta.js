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

        vis.x = d3.scaleOrdinal()
            .domain( (d) => {
                return d.name;
            });

        vis.y = d3.scaleLinear()
            .range([0, vis.height]);

        vis.xAxis = d3.axisBottom.scale(vis.x);

        vis.yAxis = d3.axisLeft().scale(vis.y);

        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", `translate(0, ${vis.height})`);

        vis.svg.append("g")
            .attr("class", "y-axis axis");

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
