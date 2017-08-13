module.exports =  (function(){
	var Nightmare = require('nightmare');		
	var Promise = require('q');
	var nightmare = Nightmare({ show: false });
	var _ = require('lodash');

	var campaingList = {};
	var placements = [];
	var tagHtmlStrings= [];

	/**
	 *
	 * login in to celtra, go to the campaings and pick all the campaigns available
	 *
	 */
	var getCampaingsList = function(){
		return Promise.resolve(nightmare
			.goto('https://padsquad.celtra.com/')
			.wait("input[name='email']")
			.type('input[name="email"]', 'pdelacruz1986@gmail.com')
			.type('input[name="password"]', 'aaaa')
			.click('button')
			.wait('#campaigns-table-body')
			.evaluate(function () {
				var data = {};
				var nodesArray = document.querySelectorAll("#campaigns-table-body table tr td.campaign a.item-name");
				var urls = [];
		  		for(var i = 0; i < nodesArray.length; i++){//nodesArray, function(value, index) {
		  			urls[i] = nodesArray[i].href;
		  		}
	    //var campaings = document.querySelectorAll('#campaigns-table-body table tr td.campaign a.item-name')[0].href;
	    data.urls = urls;
	    return data;
	  })
			)
	}

	/**
	 *
	 * get into the campaings and get all placements or creatives
	 *
	 */
	var getTagsUrls = function(campaingUrls){
		return (function (items) {
		  	var deferred;
		  	var percentage = 0;
		  	var incrementRate = Math.round(100/items.length);

		  	// end
		  	if (items.length === 0) {
		  		return Promise.resolve(placements);
		   }

		  	deferred = Promise.defer();

		  // any async function 
			var url = items[0];
			//console.log(a);

			new Promise.resolve(
				nightmare
				.goto(url)
				.wait("button.publish-creative-btn")
				.evaluate(function () {
					var buttons = document.querySelectorAll('button.publish-creative-btn');

					for(var i = 0; i < buttons.length; i++){
						buttons[i].click();	
					}
				})
				.wait("#tag-generator-url")
				.evaluate(function () {
					var urls = document.querySelectorAll('#tag-generator-url');

					var linkList = [];

					for(var i = 0; i < urls.length; i++){
						var finalLinkUrl = urls[i].value + "&adserver=AppNexus&sdk=MobileWeb"
						linkList[i] = finalLinkUrl;
					}
		 			return linkList;
		 		})
				.then(function(data){
					var pl = placements.length;

					for(var i =0; i < data.length; i++){
						placements[pl] = data[i];
						pl++;
					}

					percentage += incrementRate;
				   deferred.notify(percentage);

					// pop one item off the array of tags
		  			deferred.resolve(items.splice(1));
				})
			)

	  return deferred.promise.then(getTagsUrls);
		}(campaingUrls));
	}

	/**
	 *
	 * get into the placements and get all tags html
	 *
	 */
	var getTagsHtmlString = function(tagsUrls){
		return (function (items) {
			var deferred;
			var percentage = 0;
		  	var incrementRate = Math.round(100/items.length);

			if (items.length === 0) {
				return Promise.resolve(tagHtmlStrings);
			}

			deferred = Promise.defer();

			// any async function 
			var url = items[0];
			//console.log(a);

			new Promise.resolve(
				nightmare
				.goto(url)
				.wait(2000)
				.evaluate(function () {
					return document.querySelector("#tags-instructions code").innerText;
				})
				.then(function(data){
					var ths = tagHtmlStrings.length;

					tagHtmlStrings[ths] = data;
					ths++;
					
					percentage += incrementRate;
				   deferred.notify(percentage);

					// pop one item off the array of workitems
					deferred.resolve(items.splice(1));
				})
			)

			return deferred.promise.then(getTagsHtmlString);
			}(tagsUrls));
	}


	return {
		getCampaingsList : function(){
			console.log("Getting Campaing List")
			return getCampaingsList();
		},
		getTagsUrls : function(campaingUrls){
			console.log("Loading placements to get tag string")
			return getTagsUrls(campaingUrls);
		},
		getTagsHtmlString : function(tagsUrls){
			console.log("Loading tag string")
			return getTagsHtmlString(tagsUrls);
		}
	}
})()
