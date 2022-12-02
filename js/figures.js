let tracksNames = ['BREAK MY SOUL', "I'M THAT GIRL", 'ALIEN SUPERSTAR', 'CUFF IT', 'COZY', 'CHURCH GIRL',
    'ENERGY (feat. Beam)', 'SUMMER RENAISSANCE', "VIRGO'S GROOVE", 'PLASTIC OFF THE SOFA',
    'MOVE (feat. Grace Jones & Tems)', 'HEATED',
    'THIQUE', 'PURE/HONEY', 'ALL UP IN YOUR MIND', 'AMERICA HAS A PROBLEM']

let tracksStreams =
    {'BREAK MY SOUL':0, "I'M THAT GIRL":0,
        'ALIEN SUPERSTAR':0, 'CUFF IT':0,
        'COZY':0, 'CHURCH GIRL':0,
        'ENERGY (feat. Beam)':0, 'SUMMER RENAISSANCE':0,
        "VIRGO'S GROOVE":0, 'PLASTIC OFF THE SOFA':0,
        'MOVE (feat. Grace Jones & Tems)':0, 'HEATED':0,
        'THIQUE':0, 'PURE/HONEY':0,
        'ALL UP IN YOUR MIND':0, 'AMERICA HAS A PROBLEM':0}

let tracksFigures =
    {'BREAK MY SOUL':49, "I'M THAT GIRL":11,
        'ALIEN SUPERSTAR':28, 'CUFF IT':23,
        'COZY':10, 'CHURCH GIRL':12,
        'ENERGY (feat. Beam)':13, 'SUMMER RENAISSANCE':10,
        "VIRGO'S GROOVE":6, 'PLASTIC OFF THE SOFA':7,
        'MOVE (feat. Grace Jones & Tems)':5, 'HEATED':6,
        'THIQUE':6, 'PURE/HONEY':5,
        'ALL UP IN YOUR MIND':4, 'AMERICA HAS A PROBLEM':4}

class spotifyFigVis {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data
        //this.cleanData();
        this.prepareData()
        this.init()
    }
    prepareData () {
        let vis = this
        vis.totalStreams = 0

        vis.data.map(function(d){
            if(d.country !=='Global') {
                vis.totalStreams += d.streams
                tracksStreams[d.track] += d.streams
            }
        })

        let tracks = {}
        for (const row in vis.data) {
            // get country
            let track = vis.data[row].track
            let country = vis.data[row].country
            let streams = vis.data[row].streams

            // do not count global
            if (country !== 'Global') {
                // add country if it doesn't exist
                if (!(track in tracks)) {
                    tracks[track] = 0
                }
                // streams
                tracks[track] += streams
            }
        }

        let res = []
        for (const track in tracks){
            let row = {
                    'track': track,
                    'streams': tracks[track]
                }
                res.push(row)
            }
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

        //let valuePerFigure = Math.floor(totalStreams/stickfigures)
        vis.svg.append("svg:image")
            .attr("href", "assets/images/figures.png")
            .attr("x", 10)//(i%20)*20)
            .attr("y", 10) //Math.floor(i/20)*20 )
            .attr("width", "30")
            .attr("height", "30")
            .transition()
            .duration(2000);

        vis.anchors = []
        vis.tracks = []
        tracksNames.forEach(function(d, index){
            let curr_x,
                curr_y
            vis.tracks.push(
                vis.svg.append("text")
                    .attr('class', 'tracks')
                    .attr('x', function() {
                        if(index>=8){
                            curr_x = (index - 8) * 120
                            return (index - 8) * 120
                        }
                        curr_x = (index*120)
                        return (index*120)
                    })
                    .attr('y', function(){
                        if(index>=8){
                            curr_y = 400
                            return 400
                        }
                        curr_y = 150
                        return 150})
                    .text(function(){
                        if(d === "MOVE (feat. Grace Jones & Tems)"){
                            return 'MOVE'
                        }
                        if(d === "ENERGY (feat. Beam)"){
                            return 'ENERGY'
                        }
                        return d
                    })
                    .attr('fill','white')
                    .attr('font-size', '10px'))
            vis.anchors.push([curr_x,curr_y])
        })
        vis.title = vis.svg.append('g')
            .attr('class', 'title bar-title')
            .append('text')
            .text("I equal 20 million streams! " )
            .attr('transform', `translate(150, 28)`)
            .attr('text-anchor', 'middle')
            .attr('font-size', '2.5vh')
            .attr('font-family', 'Grenze Gotisch')
            .attr('fill', '#DCA54C');
    }

    movement() {
        let vis = this
        let curr = 0

        vis.imgs = []
        for(let i = 0; i < 201; i++){
            vis.imgs.push(vis.svg
                .append("svg:image")
                .attr("href", "assets/images/figures.png")
                .attr("x", 10)//(i%20)*20)
                .attr("y", 10) //Math.floor(i/20)*20 )
                .attr("width", "30")
                .attr("height", "30")
                .transition()
                .duration(2000));
        }

        tracksNames.forEach(function(d,index){
            let fig = tracksFigures[d]
            let x = vis.anchors[index][0]
            let y = vis.anchors[index][1]
            for(let i =0; i <= fig;i++){
                vis.imgs[curr+i]
                    .attr('x',function(){

                        if(i>=8){
                            return x+((i)- 5*Math.floor(i/5))*20-2
                        }
                        return x+(i- 5*Math.floor(i/5))*20-2
                    })
                    .attr('y',function(){
                        if(i>=8){
                            return y+20+Math.floor((i)/5)*20
                        }
                        return y+20+Math.floor(i/5)*20
                    })
            }
            curr += fig
        })
    }
}

// add figures on click
function figureGraph() {
    if(cleanedData === null || chartInit){
        return
    }
    chartInit = true;
    mySpotifyFigGraph.movement()
}
