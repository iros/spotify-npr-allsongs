var sp = getSpotifyApi(1);
var models = sp.require('sp://import/scripts/api/models');
var player = models.player;

exports.init = init;

function init() {

	updatePageWithTrackDetails();

	player.observe(models.EVENT.CHANGE, function (e) {

		// Only update the page if the track changed
		if (e.data.curtrack == true) {
			updatePageWithTrackDetails();
		}
	});

	searchLastFMForEvents("stockholm");
}

function updatePageWithTrackDetails() {
	
	var header = document.getElementById("header");

	// This will be null if nothing is playing.
	var playerTrackInfo = player.track;

	if (playerTrackInfo == null) {
		header.innerText = "Nothing playing!";
	} else {
		var track = playerTrackInfo.data;
		header.innerHTML = track.name + " on the album " + track.album.name + " by " + track.album.artist.name + ".";
	}
}

function searchLastFMForEvents(city) {

	var req = new XMLHttpRequest();
	req.open("GET", "http://ws.audioscrobbler.com/2.0/?method=geo.getevents&location=" + city + "&api_key=YOUR_KEY_HERE", true);

	req.onreadystatechange = function() {

		console.log(req.status);

   		if (req.readyState == 4) {
    		if (req.status == 200) {
       			console.log("Search complete!");
       			console.log(req.responseText);
     		}
   		}
  	};

	req.send();
}