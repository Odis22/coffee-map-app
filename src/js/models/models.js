//models.js

//main wrapper data model
//contains 5 hard-coded default queries
//and the current query object for user input searches.

var locations = {
      newYork: {
            query: "New York"
      },
      
      philadelphia: {
            query: "Philadelphia"
      },
      
      seattle: {
            query: "Seattle"
      },
      
      chicago: {
            query: "Chicago"
      },
      
      denver: {
            query: "Denver"
      },
      
      currentLoc: {
            query: " "
      },
      geoLoc: {
            //latlng provided in getGeoLoc. 
            radius: '200'
      }
}

//model to store all our retrived google and foursquare
//data on each location. Must be update each result. 
//init as empty object. 
var information = []; 

//keeps track of all markers generated on the map for cleanup each search. 
var markers = []; 

//keeps track of currently applied filters for dynamic
//filter stacking and removal.
var currentFilters = [];

//subset of markers array to 
//populate the map only with those locations from the last search on 
//filter reset
var lastSearch = [];

//We need a copy of last search to pass to ko.observalbes. 
//otherwise we cannot back reference it to resotre information since modifications to the observable
//modify the lastSearch Array too. 
var searchCopy = []; 