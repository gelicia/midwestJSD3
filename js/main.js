var lastRanNames = [];

function processNames(){
	document.getElementById("error-text").style.display = "none";
	document.getElementById("processing-text").style.display = "none";
	var heroNames = getNames();

	if (heroNames.toString() !== lastRanNames.toString()) { 
		document.getElementById("processing-text").style.display = "block";
		
		var heroes = [];
		for (var i = 0; i < heroNames.length; i++) {
			heroes.push(getCharacterInfo(heroNames[i]));
		}

		Promise.all(heroes).then(function(heroesData){
			lastRanNames = heroNames; 
			if(heroesData.length > 0){
				getComicsInfo(heroesData).then(function(comicsData){
					document.getElementById("processing-text").style.display = "none";

					var rowBreak = Math.ceil(Math.sqrt(heroesData.length));
					//radius has the stroke built in so I don't have to add them in every place radius is used for size/positioning
					var circleDisplay = {radius: 103, strokeSize: 3};
					var svgSize = {width: (circleDisplay.radius*2) + ((rowBreak-1) * circleDisplay.radius), height: 500};

					var svg = d3.select("svg#mainViz").attr({
						height: svgSize.height,
						width: svgSize.width
					});

					var heroCircles = svg.selectAll("circle").data(heroesData);
					var colorScale = d3.scale.category10();

					//enter
					heroCircles.enter().append("circle").attr({opacity: 0});

					//update
					heroCircles.transition().duration(500).attr({
						cx: function(d,i){return (i == 2 ? circleDisplay.radius/2 : 0) +  circleDisplay.radius + (circleDisplay.radius * (i % rowBreak));},
						cy: function(d,i){return (circleDisplay.radius + circleDisplay.strokeSize) + (circleDisplay.radius * (Math.floor(i / rowBreak)));},
						r: circleDisplay.radius-circleDisplay.strokeSize,
						"opacity": 1,
						"fill-opacity": 0.7,
						stroke: "black",
						"stroke-width": circleDisplay.strokeSize,
						fill: function(d,i){return colorScale(i);}
					});

					//exit
					heroCircles.exit().transition().duration(500).attr({'opacity':0}).remove();
				});
			}
		}).catch(function(){
			//don't do anything - I could do the errors this way if I cared about more than one error at a time :) 
			document.getElementById("processing-text").style.display = "none";
		});
	}
}

function getNames(){
	var names = [];
	for (var i = 0; i < 3; i++) {
		var fieldValue = document.getElementById("name" + i).value.trim();
		if (fieldValue !== "") {
			names.push(fieldValue);
		}
	}
	return names;	
}

function getCharacterInfo(name){
	return new Promise(function(resolve, reject){
		d3.json('http://gateway.marvel.com:80/v1/public/characters?name=' + name + '&apikey=' + window.marvelPublicAPIKey, function(err, data){
			if (err !== null){
				setError("Error from the Marvel API. " + err.statusText);
				reject(null);
			}
			else if (data.data === null || data.data.count === 0){
				setError("Error: " + name + " is not finding anyone in the API. This app isn't very smart, so please play around with spaces and dashes on compound words (ie, Spider-man) to find a character.");
				reject(null);
			}
			else if (data.data.count > 1){
				setError("Error : " + name + " has matched more than one character, please use a name that only returns one character.");
				reject(null);
			}
			else {
				resolve(data.data.results[0]);
			}
		});
	});
}

function getComicsInfo(names){
	var ids = names.map(function(d){return d.id;}).join(",");

	return new Promise(function(resolve, reject){
		//note: we do not include variants in here, maybe that could be a UI addition?
		d3.json('http://gateway.marvel.com:80/v1/public/comics?noVariants=true&sharedAppearances=' + ids + '&apikey=' + window.marvelPublicAPIKey, function(err, data){
			if (err !== null){
				setError("Error from the Marvel API. " + err.statusText);
				reject(null);
			}
			else if (data.data === null || data.data.total === 0){
				setError("Error: No results returned from that character set.");
				reject(null);
			}
			else {
				resolve(data.data);
			}
		});
	});
}

function setError(text) {
	var errorTextElem = document.getElementById("error-text");
	errorTextElem.style.display = "block";
	errorTextElem.innerHTML = text;
}