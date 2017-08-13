(function() {
	var Promise = require('q');
	var _ = require('lodash');
	var ProgressBar = require('progress');
	var crawler = require('./crawler/index.js')
	var bar = {};

	/**
	 *
	 * Initial method
	 *
	 */
 	//get the campaign list
	crawler.getCampaingsList()
		.then(function(data){
			//with the list list of urls
			campaingList = data.urls;

			var campaingListUrls = [];
			var count = 0;
			_.forEach(campaingList, function(campaing, index) {
				if(index !=2  && index != 4 && index != 5 && index!=6 && index !=7) 
				{
					campaingListUrls[count] = campaing
					count++
				}
			})

			//get all the placements
			 return  Promise.resolve(campaingListUrls)
				.then(crawler.getTagsUrls)
			}) 
			.then(function(data){
			 bar = new ProgressBar('[:bar]', { total: data.length });

			 return Promise.resolve(data)
			 	.then(crawler.getTagsHtmlString)
			 	.then(fulfillmentHandler, errorHandler, progressHandler);
			}).then(function(data){
				//console.log(data);
			})


	function fulfillmentHandler(data) {
	  console.log('Process finished', data);
	}

	function errorHandler(err) {
	  console.log('Error Handler:', err);
	}

	function progressHandler(percentage) {
	  //console.log('progress : ' + percentage + '%');
	   	bar.tick();

		if (bar.complete) {
			console.log('\ncomplete\n');
		}
	}
})()


// master.then(function(res) { console.log(res); },  errorHandler, function(progress){
//     console.log(progress);
// });