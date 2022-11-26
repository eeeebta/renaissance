let barChart = null
let displayData = null

let dateParser = d3.timeParse("%m/%d/%Y");


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
    constructor(parentElement, songName, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.selection = songName
        this.initData()
        this.initVis()
    }

    initData() {
        let vis = this;
        let tracks = {};
        let tracksObj = {}

        for (const row in vis.data) {
            if(vis.data[row].country === 'Global'){
            }
            else {
                let track = vis.data[row].track
                let date = vis.data[row].date

                if (!(track in tracks)) {
                    tracks[track] = {}
                }
                if (!(date in tracks[track])) {
                    tracks[track][date] = 0
                }
                tracks[track][date] += vis.data[row].streams
            }
        }

        for (const song in tracks){
            tracksObj[song] = []
            for(const date in tracks[song]){
                let row = {'date':dateParser(date),
                        'streams': tracks[song][date]}
                tracksObj[song].push(row)
            }
        }

        vis.groupedData = tracksObj
    }

    initVis() {

        let vis = this;

        // define dimensions
        vis.margin = {top: 20, right: 20, bottom: 20, left: 40};
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
            .text(vis.selection)
            .attr('transform', `translate(${vis.width / 2}, 10)`)
            .attr('text-anchor', 'middle')
            .attr('fill', 'gold');

        /*
        // tooltip group
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'barTooltip')

         */

        // Scales and axes
        // init scales
        vis.x = d3.scaleTime().range([0, vis.width]);
        vis.y = d3.scaleLinear().range([vis.height, 0]);

        // init x & y axis
        vis.xAxis = vis.svg.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + vis.height + ")");
        vis.yAxis = vis.svg.append("g")
            .attr("class", "axis axis--y");


        // begin data wrangling
        console.log("data wrangling")
        this.wrangleData(vis.selection);
    }

    // adjust to not overwrite if selection is current
    wrangleData(selection) {
        let vis = this

        if((selection !== null) && (vis.selection !== selection)){
            vis.selection = selection
            console.log('updated data')
        }
        vis.displayData = vis.groupedData[vis.selection].sort(function(a,b){
            return a.date - b.date
        })
        console.log('New display data')
        console.log(vis.displayData)

        vis.updateVis()
    }


    updateVis() {
        let vis = this;

        vis.x.domain(d3.extent(vis.displayData, function (d) {
            return d.date
        }));
        vis.y.domain(d3.extent(vis.displayData, function (d) {
            return d.streams
        }));

        vis.bar = vis.svg.selectAll(".bar")
            .data(vis.displayData)

        vis.bar.enter().append("rect")
            .attr("class", "bar")
            .merge(vis.bar)
            .attr("x", function (d) {
                console.log(vis.x(d.date))
                return vis.x(d.date)
            })
            .attr("y", function (d) {
                console.log(vis.y(d.streams))
                return vis.y(d.streams);
            })
            .attr("height", function (d) {
                return vis.height - vis.y(d.streams);
            })
            .attr('width',function(d) {
                return 10
            })
            .attr('fill','red')
            .transition()
            .duration(200);

        vis.title.text(vis.selection)
        // draw x & y axis
        //vis.xAxis.transition().duration(400).call(d3.axisBottom(vis.x).tickFormat(d3.timeFormat("%d-%b")));
        console.log('wow')
        // Update the y-axis
        // draw x & y axis
        vis.xAxis.transition().duration(400).call(d3.axisBottom(vis.x).tickFormat(d3.timeFormat("%d-%b")));
        vis.yAxis.transition().duration(400).call(d3.axisLeft(vis.y).ticks(5));

    }
}



