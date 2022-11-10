// load all data using promises
let promises = [
    d3.csv("data/music_data.csv")
];

Promise.all(promises)
    .then(function (data) { 
        init_musical(data);
        // init_spotify(data);
        // init_narrative(data);
    })
    .catch(function(err){ console.log(err) });

// musical data visualization initialization
function init_musical(allDataArray) {
    // log all data
    console.log(allDataArray);
}

/*/function init_spotify(allDataArray) {
    
}*/

/*function init_narrative(allDataArray) {
    
}*/