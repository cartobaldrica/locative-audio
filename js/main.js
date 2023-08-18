//locative audio
//fence around each stop
//get user's location
//check intersection between stop and location
//create layout for popup at each stop (less important)

(function(){
    let map, stops, locationMarker, circle, active = false, center = true, played = [], audio

    //modal variables for stops
    let stop = document.getElementById('stop-modal'),
        stopModal = new bootstrap.Modal(stop);
    
    function createMap(){
        map = L.map("map",{
            center: [43.07,-89.39],
            zoom:14,
            maxZoom:17,
            minZoom:12
        });
        
        let basemap = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        buffers = L.layerGroup().addTo(map);

        //location listener
        map.on('locationfound', onLocationFound);
        //don't automatically center the map if the map has been panned
        map.on("mousedown",function(){
            center = false;
            document.querySelector("#center").style.display = "block";
        })
        //set click listener for the center map button
        document.querySelector("#center").addEventListener("click", function(event){
            map.locate({setView:false, watch:true, enableHighAccuracy: true});
            center = true;
        })
        //center map on location at interval
        window.setInterval( function(){
            map.locate({
                enableHighAccuracy: true
            });
        }, 5000);
        //add stop data
        addStops();
        //get initial location and center map
        map.locate({setView:false, watch:true, enableHighAccuracy: true});
    }
    //location findinging function
    function onLocationFound(e){
        let radius = e.accuracy / 2;
    
        //removes marker and circle before adding a new one
        if (locationMarker){
            map.removeLayer(circle);
            map.removeLayer(locationMarker);
        }
        //adds location and accuracy information to the map
        if (e.accuracy < 90){
            circle = L.circle(e.latlng, radius).addTo(map);
            locationMarker = L.marker(e.latlng).addTo(map);
        }
        //if accuracy is less than 60m then stop calling locate function
        if (e.accuracy < 40){
            let count = 0;
            map.stopLocate();
            count++;
        }
        //only recenter map if center variable is true
        if (center == true){
            map.setView(e.latlng, 17);
        }

        //removeFoundMarker(circle, locationMarker);
        checkLocation(radius);
    }
    //add tour stops to map
    function addStops(){
        let radius = 20;

        fetch("assets/stops.csv")
            .then(res => res.text())
            .then(data => {
                //parse csv
                data = Papa.parse(data,{
                    header:true
                }).data;
                //create geojson
                let geojson = {
                    type:"FeatureCollection",
                    name:"Sites",
                    features:[]
                }
                //populate geojson
                data.forEach(function(feature, i){
                    //create empty object
                    let obj = {};
                    //set feature
                    obj.type = "Feature";
                    //add geometry
                    obj.geometry = {
                        type: "Point",
                        coordinates: [Number(feature.lon), Number(feature.lat)]
                    } 
                    //add properties
                    obj.properties = feature;
                    //add object to geojson
                    geojson.features.push(obj)
                })
                //add geojson to map
                stops = L.geoJson(geojson,{
                    pointToLayer:function(layer, latlng){
                        return L.marker(latlng);
                    },
                    onEachFeature:function(feature, layer){
                        layer.on('click',function(){
                            openModal(feature.properties)
                            center = true;
                        })
                    }
                }).addTo(map);
            })
    }
    //compare user's location to every point on the map
    function checkLocation(radius){
        //get bounds of user's location circle 
        let circleBounds = circle.getBounds();
        if (stops){
            //iterate through each point on the tour
            stops.eachLayer(function(layer){
                //create a circle around each of the points
                let layerCircle = L.circle(layer._latlng, {
                    radius:radius
                }).addTo(map);
                //get bounds of the circle
                let layerBounds = layerCircle.getBounds()
                //compare the location of the point's circle to the user's location
                if(layerBounds.intersects(circleBounds)){
                    //play audio and open modal if it hasn't been played before
                    if (active == false && !played.includes(layer.feature.properties.id)){
                        //play audio
                        playAudio(layer.feature.properties.audio)
                        //open modal
                        openModal(layer.feature.properties)
                        //add feature to "played" list
                        played.push(layer.feature.properties.id)
                    }
                    map.removeLayer(layerCircle)
                }
                else{
                    map.removeLayer(layerCircle)
                }
            })
        }
    }
    //open modal
    function openModal(props){
        //clear body
        document.querySelector("#stop-body").innerHTML = "";
        //add title if title exists
        if (props.name){
            document.querySelector("#stop-title").innerHTML = props.name;
        }
        //add audio button if audio exists
        if (props.audio){
            document.querySelector("#play-audio").addEventListener("click",function(){
                if (active == false){
                    playAudio(props.audio)
                    document.querySelector("#play-audio").innerHTML = "Stop Audio";
                }
                else{
                    stopAudio();
                }
            })
        }
        //add image if image exists
        if (props.image){
            let img = "<img src='assets/" + props.image + "' id='stop-img'>"
            document.querySelector("#stop-body").insertAdjacentHTML("beforeend",img)
        }
        //add body text if body text exists
        if (props.text){
            let p = "<p id='stop-text'>" + props.text + "</p>";
            document.querySelector("#stop-body").insertAdjacentHTML("beforeend",p)
        }
        //add listener to stop audio if modal is closed
        document.querySelectorAll("#close").forEach(function(elem){
            elem.addEventListener("click",function(){
                stopAudio();
            })
        })

        stopModal.show();
    }
    //play audio
    function playAudio(audioFile){
        active = true;
        //create audio element
        audio = document.createElement("audio"),
        source = "<source src='audio/" + audioFile + "'>",
        play = "<p class='play'>&#9654;</p>";
        //add source 
        audio.insertAdjacentHTML("beforeend",source)
        //insert audio element into document
        document.querySelector("body").append(audio);
        document.querySelector("body").insertAdjacentHTML("beforeend",play);
        //change button on modal
        document.querySelector("#play-audio").innerHTML = "Stop Audio";
        //play audio
        audio.play();
        //remove audio when finished
        audio.onended = function(){
            stopAudio();
            //hide modal
            stopModal.hide();
        }
    }
    //function to deactivate audio element and reset button
    function stopAudio(){
        //remove audio element
        audio.remove();
        if (document.querySelector(".play"))
            document.querySelector(".play").remove();
        //set page state to inactive
        active = false; 
        //reset play button
        document.querySelector("#play-audio").innerHTML = "Play Audio";
    }

    createMap();
})();