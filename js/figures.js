var tracksNames = ['BREAK MY SOUL', "I'M THAT GIRL", 'ALIEN SUPERSTAR', 'CUFF IT', 'COZY', 'CHURCH GIRL',
    'ENERGY (feat. Beam)', 'SUMMER RENAISSANCE', "VIRGO'S GROOVE", 'PLASTIC OFF THE SOFA',
    'MOVE (feat. Grace Jones & Tems)', 'HEATED',
    'THIQUE', 'PURE/HONEY', 'ALL UP IN YOUR MIND', 'AMERICA HAS A PROBLEM']
var tracksStreams =
    {'BREAK MY SOUL':0, "I'M THAT GIRL":0,
        'ALIEN SUPERSTAR':0, 'CUFF IT':0,
        'COZY':0, 'CHURCH GIRL':0,
        'ENERGY (feat. Beam)':0, 'SUMMER RENAISSANCE':0,
        "VIRGO'S GROOVE":0, 'PLASTIC OFF THE SOFA':0,
        'MOVE (feat. Grace Jones & Tems)':0, 'HEATED':0,
        'THIQUE':0, 'PURE/HONEY':0,
        'ALL UP IN YOUR MIND':0, 'AMERICA HAS A PROBLEM':0}

var tracksFigures =
    {'BREAK MY SOUL':25, "I'M THAT GIRL":6,
        'ALIEN SUPERSTAR':15, 'CUFF IT':11,
        'COZY':5, 'CHURCH GIRL':6,
        'ENERGY (feat. Beam)':6, 'SUMMER RENAISSANCE':5,
        "VIRGO'S GROOVE":4, 'PLASTIC OFF THE SOFA':3,
        'MOVE (feat. Grace Jones & Tems)':2, 'HEATED':3,
        'THIQUE':3, 'PURE/HONEY':2,
        'ALL UP IN YOUR MIND':2, 'AMERICA HAS A PROBLEM':2}

class figures {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data

        console.log("Spotify data analysis")
        console.log(data)

        //this.cleanData();
        this.prepareData()
        this.init()
    }
    prepareData () {
        let vis = this
        vis.totalStreams = 0
        vis.data.map(function(d){
            vis.totalStreams += d.streams
            tracksStreams[d.track] += d.streams


        })
    }

    init () {
        let vis = this;
        // set margin and width/height
        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        let stickfigures = 100
        //let valuePerFigure = Math.floor(totalStreams/stickfigures)
        vis.imgs = []
        for(let i = 0; i < 100; i++){
            vis.imgs.push(vis.svg
                .append("svg:image")
                .attr("href", "assets/images/figures.png")
                .attr("x", (i%20)*20+300)
                .attr("y", Math.floor(i/20)*20 )
                .attr("width", "20")
                .attr("height", "20")
                .on('click', function(event,d){
                    console.log(event)
                    console.log(d)
                })
                .transition()
                .duration(5000));
        }
        vis.anchors = []
        vis.tracks = []
        tracksNames.slice(0,4).forEach(function(d, index){
            vis.anchors.push([(index+1) * 140 + 50, 150])
            vis.tracks.push(
                vis.svg.append("text")
                    .attr('class', 'tracks')
                    .attr('x', (index+1) * 140 + 50)
                    .attr('y', 150)
                    .text(d)
                    .attr('fill','white')
                    .attr('font-size', '10px'))
        })
        let curr = 0
        vis.imgs[0].attr('x',0)

        tracksNames.slice(0,4).forEach(function(d,index){
            let fig = tracksFigures[d]
            let x = vis.anchors[index][0]
            let y = vis.anchors[index][1]
            for(let i =0; i <= fig;i++){
                vis.imgs[curr+i]
                    .attr('x',x+(i- 3*Math.floor(i/3))*20)
                    .attr('y',y+20+Math.floor(i/3)*20)
                console.log('hi')
            }
            curr += fig
        })

    }
}
