let barChart = null
let dateParser = d3.timeParse("%m/%e/%Y");

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
    constructor(parentElement, data, country) {
        this.parentElement = parentElement;
        this.data = data;
        this.selection = country;
        this.initData()
        this.initVis()
    }

    initData() {
        let vis = this;
        let countries = {}
        for (const row in vis.data) {
            let country = vis.data[row].country
            let date = vis.data[row].date
            let streams = vis.data[row].streams

            if(country === 'Global'){

            }
            else {
                if(!(country in countries)){
                    countries[country] = {}
                }
                if(!(date in countries[country])) {
                    countries[country][date] = 0
                }
                countries[country][date] += streams
            }
        }
        let dates = []
        for(const date in countries['United States of America']){
            dates.push(date)
        }
        for (const country in countries){
            dates.forEach(function(date) {
                if(!(date in countries[country])){
                    countries[country][date] = 0
                }
            })
        }
        let res = {}
        for (const country in countries){
            res[country] = []
            for (const date in countries[country]) {
                let row = {
                    'date': dateParser(date),
                    'streams': countries[country][date]
                }
                res[country].push(row)
            }
        }
        for (const r in res){
            res[r] = res[r].sort(function(a,b){
                return a.date - b.date
            })
        }

        vis.cleanedData = res

        vis.countries_track = {}
        for (const row in vis.data) {
            let country = vis.data[row].country
            let track = vis.data[row].track
            let streams = vis.data[row].streams

            if(country === 'Global'){

            }
            else {
                if(!(country in vis.countries_track)){
                    vis.countries_track[country] = {}
                }
                if(!(track in vis.countries_track[country])) {
                    vis.countries_track[country][track] = 0
                }
                vis.countries_track[country][track] += streams
            }
        }

    }

    initVis() {
        let vis = this;

        // define dimensions
        vis.margin = {top: 20, right: 20, bottom: 40, left: 60};
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
            .text("Listens in" + vis.selection)
            .attr('transform', `translate(${vis.width / 2}, 10)`)
            .attr('text-anchor', 'middle')
            .attr('font-size', '3vh')
            .attr('font-family', 'Grenze Gotisch')
            .attr('fill', '#DCA54C');

        let offsets = document.getElementById('spotifyVisGlobetooltip_div').getBoundingClientRect();
        let top = offsets.top;
        let left = offsets.left;
        console.log(top,left)

        vis.tooltip = d3.select("#spotifyVisGlobetooltip_div")
            .append("div")
            .style("position", "absolute")
             .style('top', window.scrollY +top + 100 + 'px')
             .style('left', window.scrollX  + left+ 450 + 'px')
            .attr("id","spotifyGraph_tooltip")
            .html("<h3 >Top 3 songs:</h3><h5 id='firstMost'>ALIEN SUPERSTAR</h5><h5 id='secondMost'>BREAK MY SOUL</h5><h5 id='thirdMost'>ENERGY</h5>");

         // Scales and axes
        // init scales
        vis.x = d3.scaleTime()
            .range([0, vis.width-vis.margin.right])
            .domain(d3.extent(vis.cleanedData[vis.selection], function (d) {
                return d.date
            }));

        vis.xAxis = d3.axisBottom()
            .tickFormat(d3.timeFormat("%m/%d"))
            .scale(vis.x)

        vis.y = d3.scaleLinear().range([vis.height, 0]);
        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        // init x
        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(7," + vis.height + ")");

        // y axis group
        vis.svg.append("g")
            .attr("class", "y-axis axis");


        // begin data wrangling
        this.wrangleData();
    }

    // adjust to not overwrite if selection is current
    wrangleData(selection=null) {
        let vis = this
        if(selection !== null){
            vis.selection = selection
        }
        vis.displayData = vis.cleanedData[vis.selection]

        vis.rank = Object
            .entries(vis.countries_track[vis.selection])
            .sort(([, a],[, b]) => b-a)
            .slice(0,3)
            .map(([n])=> n); 

        vis.updateVis()
    }



    updateVis() {
        let vis = this;

        d3.select("#firstMost")
            .text(vis.rank[0] + " : " + vis.countries_track[vis.selection][vis.rank[0]].toLocaleString())
        if (vis.rank[1]) {
            d3.select("#secondMost")
                .text(vis.rank[1] + " : " + vis.countries_track[vis.selection][vis.rank[1]].toLocaleString())
        }
        else{
            d3.select("#secondMost")
                .text("")
        }
        if (vis.rank[1]) {
            d3.select("#thirdMost")
                .text(vis.rank[2] + " : " + vis.countries_track[vis.selection][vis.rank[2]].toLocaleString())
        }
        else{
            d3.select("#thirdMost")
                .text("")
        }


        vis.y.domain([0,d3.max(vis.displayData, d=>d.streams)])

        vis.bar = vis.svg.selectAll(".bar")
            .data(vis.displayData)

        vis.bar.enter().append("rect")
            .attr("class", "bar")
            .merge(vis.bar)
            .attr("x", function (d) {
                return vis.x(d.date)+5
            })
            .attr("y", function (d) {
                return vis.y(d.streams);
            })
            .attr("height", function (d) {
                return vis.height - vis.y(d.streams);
            })
            .attr('width',function(d) {
                return 5
            })
            .attr('fill','white')
            .transition()
            .duration(200);

        vis.title.text(vis.selection)
        vis.svg.select(".x-axis").transition().duration(400)
            .call(vis.xAxis.tickValues(d3.map(vis.displayData, function (d) {
                return new Date(d.date)
            })))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");

        vis.svg.select(".y-axis").transition().duration(400).call(vis.yAxis);

    }
}