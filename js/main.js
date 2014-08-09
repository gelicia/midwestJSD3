var lastRanNames = [];

function processNames(){
	document.getElementById("error-text").style.display = "none";
	var heroNames = getNames();

	if (heroNames.toString() == lastRanNames.toString()) { return; }
	
	var heroes = [];
	for (var i = 0; i < heroNames.length; i++) {
		heroes.push(getCharacterInfo(heroNames[i]));
	}

	Promise.all(heroes).then(function(heroesData){
		lastRanNames = heroNames;
		if(heroesData.length > 0){
			console.log(heroesData);
			getComicsInfo(heroesData).then(function(comicsData){
				console.log(comicsData.results);
			});
		}
	}).catch(function(){
		//don't do anything - I could do the errors this way if I cared about more than one error at a time :) 
	});
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
				setError("Error: No results returned from that character pair.");
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