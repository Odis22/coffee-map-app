/*Foursquare API calls*/

//Have to figure out how to secure these later
//need these values to make a proper request to Fsquare api
//must also pass in a version param
//We also utilize a match intent to grab our marker locations exactly. 
//Otherwise we get an array of all places within radius of the lat and lng
//We oddly set the query to the place name because query runs against venue names. 
//If not in Fsqaure database we return a little error message--have to add this later. 

var currentFSquare = {};
var CLIENT_ID = 'YULD3E3YIJCNB0W25GXL1V22WOIKGHOHXIWVFKGWNW20BTVP';
var CLIENT_SECRET = 'UHNXU3AIJ3OIAOI15IWLEIG4BUYQ2VPBMGJA3XLRR2QUFIKP';
var ver = '20160621'
var mapsKey = 'AIzaSyAfBb6TDIxE-uYJaHe-rZ-mJhN0PZyIylE'
var markerIcon = "../img/coffee-map-icon-small.png"
var geoRun; //check if the current search was run with Geopoistion. 
var googleErr; //used to kill loading screen if googlemaps fails. 

/*Map Api Calls*/

//testing out our map. 
//should move the DOM handling inot knockout.js

//Setup our Google map, which we'll call to later.
//somewhat of a little hack to avoid type errors on file load.
//Set vars as empty objects initially. 
var map = {}; 
var service = {}; 
function initMap(){
      map = new google.maps.Map(document.getElementById('map-view'), {
            center: {lat: -34.397, lng: 150.644},
            zoom:15
      });
      //initialize places service
      service = new google.maps.places.PlacesService(map);

      //initial call to coffee location based on users geolocation.
      //If geolocation is not allowed default serach on seattle object. 
      //ONce we have the geolocation 
      if("geolocation" in navigator){
            getGeoLoc();
      } else {
            locater(locations.Seattle);
      }

      //setstyle on map
      map.setOptions({styles: mapStyles});

}

//All the functions we need for map updates:
//Dummy data for testing map API:

      //function for getting geolocation for an initial map render. 
      //because geolocation works with coordinates we must run a slightly different query
      //for our search on the geolocation data. We use nearby search on the service object
      //instead of a text search. 
      //rather than encapsulate the shared model update functionality in a VM function
      //The code is here, as it will run, likely, one time, each app use on initialization.  
      //And keeps our concerns seperate. We will also store the geoLoc as a seperate model. 
      //note that radius MUST be specified on the nearby search.
      function getGeoLoc(){
            navigator.geolocation.getCurrentPosition(function(position){
                  viewModel.updateLoad();//set loading screen
                  var myLoc = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                  console.log(position);
                  geoRun = true; //turn on georun.
                  //update geoloc with geolocation data to prepare for service search. 
                  locations.geoLoc.location = myLoc;
                  //run a latLng based search on the new location. 
                  service.nearbySearch(locations.geoLoc, genData);
            });
            viewModel.updateLoad();//remove loading screen
      }

      //locates coffee shops based on user input.
      //renders markers on the map. 
      //We should pass a model to this function.

      //First we limit to users searched location
      //then run an automatic textsearch for coffee. 

      function locater(data){
            service.textSearch(data, genData);
      }

      //The CoffeeLoc Callback function.
      //After narrowing down the user's place
      //This runs another text search for type coffee specifically. 
      function coffeeLoc(currentLoc){
            var coffee = {
                  location: currentLoc,
                  query: "Coffee",
                  radius: viewModel.radString,
                  openNow: viewModel.openNow
            }
            service.textSearch(coffee, coffeeCall);
      }

      //update map function.
      //on user search first moves the map to the relevant location.
      //THEN force the seperate search for 'coffee'

      function updateMapLocation(data){
                  console.log(data);
                  var lat = data.geometry.location.lat();
                  var lng = data.geometry.location.lng();
                  if(geoRun == true){
                        viewModel.searchString(data.name); //if geoRun was true update the data searchString to the name of the Geolocation search area.
                        geoRun = false; //set georun to false for subsequent searches. 
                  }

                  map.panTo({lat: lat, lng: lng});     
                  var currentLoc = new google.maps.LatLng(lat, lng);
                  coffeeLoc(currentLoc);
      }

      //callback for the query. 
      //We utilize a callback first to ensure we only use the first result. 
      //Places returns a results object. What we want is in [0]. 
      function genData(data, status){
            viewModel.updateLoad();
            if(status == google.maps.places.PlacesServiceStatus.OK){
                  updateMapLocation(data[0]);
                  viewModel.updateLoad();
            } else if (status !== google.maps.places.PlacesServiceStatus.OK) {
                  viewModel.errorHandle("Couldn't find the input location. Sorry, try another search.");
            }
      }


      function coffeeCall(data, status){
            if(status == google.maps.places.PlacesServiceStatus.OK){
                  console.log(data);
                  var counter = 0;
                  data.forEach(function(){
                        searchPlaceInfo(data[counter]);
                        counter++;
                  });
            } else if (status !== google.maps.places.PlacesServiceStatus.OK) {
                  viewModel.errorHandle("Couldn't find any coffee shops in this location. Sorry, try another search.");
            }
      }


      //generate map markers based on our place search
      //must also pass reference to the information array
      //Creates info windows for each marker containing place information.
      function createMarker(info){
            var marker = new google.maps.Marker({
                  map: map,
                  position: info.position,
                  title: name,
                  icon: markerIcon
            });

            //add the new marker to the markers array.
            markers.push(marker);

            marker.setAnimation(null);

            console.log(info);
            var googleContent = {
                  content: '<div><a href="' + (info.website || '') + '">' + (info.name || '') + '</a><p>' + (info.formatted_address || '') + '</p><p>'+ (info.price_level || '') + '</p><p>' + (info.website || '') + '</p><p>' + (info.rating || '') + '</p></div>'
            };

            var FSquareContent = {
                  content: '<div><p>' + (info.name || '') + '</p><p>' + (info.formatted_address || '') + '</p><p>'+ (info.users || '') + '</p><p>' + (info.url || '') + '</p><p>' + (info.checkin || '') + '</p></div>'
            };

            //fallback in case info is somehow undefined or empty. 

            if(info == undefined || info.length <= 0) {
                  googleContent.content = '<p>No Data Found</p>';
                  FSquareContent.content = '<p>No Data Found</p>';
            }

            //create infowindow
            if(info.type == 'google'){
                  var infowindow = infoGen(googleContent);
            } else {
                  var infowindow = infoGen(FSquareContent);
            }
            //link results of search to viewModel for views management:
            marker.addListener('click', function(){
            //basic animation replace later with custom animation
                  if(marker.getAnimation() !== null){
                        marker.setAnimation(null);
                  } else {
                        marker.setAnimation(google.maps.Animation.BOUNCE);
                        setTimeout(function(){marker.setAnimation(null);}, 2000); //stop bouncing animation after 3 seconds.
                  }
                        infowindow.open(map, marker);
            });

      }

      //Sets map to markers in the array:
      //google api ref: https://developers.google.com/maps/documentation/javascript/examples/marker-remove#try-it-yourself
      function setMapOnAll(map){
            for(var i = 0; i < markers.length; i++){
                  markers[i].setMap(map);
            }
      }

      //Redraw only the markers from the last search
      function setMapLastSearch(map){
            lastSearch.forEach(function(search){
                  markers.forEach(function(marker){
                        var mLat = marker.getPosition().lat();
                        var mLng = marker.getPosition().lng();
                        if(search.position.lat == mLat && search.position.lng == mLng){
                              marker.setMap(map);
                        }
                  });
            });
      }

      //Removes markers from map but keeps them stored in the array
      function clearMarkers(){
            setMapOnAll(null);
      }

      //clear a Single marker 
      //takes a marker from our array and sets its map to null
      //similar to the set on all. Call set on all to restore.
      function clearMarker(marker){
            marker.setMap(null);
      }

      //draw the passed marker on the map.
      function drawMarker(marker){
            marker.setMap(map);
      }

      //Removes markers from map and resets array. 
      function deleteMarkers(){
            clearMarkers();
            markers = [];
      }



      function drawSelectMarkers(obj){
      markers.forEach(function(marker){
            var mLat = marker.getPosition().lat();
            var mLng = marker.getPosition().lng();
            if(obj.position.lat == mLat && obj.position.lng == mLng){
                  drawMarker(marker);
            }
      });//takes object from infomation and checks its position values against all markers. returns true when matching.
}

      function clearSelectMarkers(obj){
      markers.forEach(function(marker){
            var mLat = marker.getPosition().lat();
            var mLng = marker.getPosition().lng();
            if(obj.position.lat == mLat && obj.position.lng == mLng){
                  clearMarker(marker);
            }
      });//takes object from infomation and checks its position values against all markers. returns true when matching.
}




      //Search Function 
      //We need the right sequence to accurately assign info windows. 
      //Find all the information. Then begin generating markers. 
      //Don't gen markers first, as we loose coupling between place and info, 
      //and things become difficult to track.
      function searchPlaceInfo(data){
            var lat = data.geometry.location.lat();
            var lng = data.geometry.location.lng();
            var name = data.name;
            var id = data.place_id;
            var bounds = window.mapBounds;
            var latLng = {lat: lat, lng: lng};

            $.ajax({
                  url: 'https://api.foursquare.com/v2/venues/search?ll=' + lat + ',' + lng + '&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET + '&v=' + ver + '&query=' + name + '&intent=match'
            }).done(function(data){
                  console.log(data);
                  if(data.response.venues.length < 1){
                        //wrap id in a request object as per api spec
                        var request = {
                              placeId: id
                        }
                        pushPlaceDetails(request, latLng);
                  } else {
                        pushFSquareDetails(data, latLng);
                  }
            })
            .fail(function(){
                  viewModel.errorHandle("Couldn't retrieve coffee shop data");
                  console.log(data);
            });

      }

      function pushPlaceDetails(id, position){
            service.getDetails(id, function(data, status){
                  if(status == google.maps.places.PlacesServiceStatus.OK){
                        console.log(data)
                        var info ={
                              type : "google",
                              formatted_address : data.formatted_address,
                              name : data.name,
                              hours : data.opening_hours.weekday_text,
                              open_now : data.opening_hours.open_now,
                              price_level : data.price_level,
                              rating : data.rating,
                              types : data.types,
                              website : data.website,
                              position: position,
                              show: true
                        }; 
                        //update information model
                        information.push(info);
                        //push to last search model
                        viewModel.storeLastSearch(info);
                        //update viewModel with resulting information model
                        viewModel.getInfo();
                        createMarker(info);
                  } 
            });
      }

      //pushes the foursquare response data into an object
      //stored in the information array model
      function pushFSquareDetails(data, position){
            var venue = data.response.venues[0];
            var location = venue.location;
            var stats = venue.stats;
            var info = {
                  type : "foursquare",
                  name : venue.name,
                  url : venue.url,
                  formatted_address : venue.location.address,
                  city : venue.location.city,
                  country : venue.location.country,
                  checkin : stats.checkinsCount,
                  tip : stats.tipCount,
                  users : stats.usersCount,
                  position: position,
                  show: true
            }
            //push to information model.
            information.push(info);
            //push to last search model
            viewModel.storeLastSearch(info);
            //update viewModel with resulting information model
            viewModel.getInfo();
            createMarker(info); //marker takes info to generate its windows.
      }

      //generate infoWindows function.
      //Eventually we need to feed in data from another third party api
      //e.g. yelp or flickr, to these windows. 
      //For now we will pass in dummy data. 
      //We'll have to call this after generating all our markers
      //to attach them to the correct latitudes. 
      //data must be an object literal containing content. 
      //So we'll need a function that takes the api data and constructs
      //a model that fits the requirements. 
      function infoGen(data){
            var infowindow = new google.maps.InfoWindow(data);
            return infowindow;
      }

//View Model

function AppViewModel() {
      //this is the string we'll utilize to update the google maps view. 
      //we grab it from the serach input in the UI. 
      this.showInfo = ko.observable(false); //tracks whether the information section should be visible. set with call to toggleShowInfo
      this.searchRad = 500;
      this.openNow = false;
      this.radString = this.searchRad.toString();
      this.searchString = ko.observable();
      this.filterString = ko.observable("Starbucks"); //string to filter result names under
      this.information = ko.observableArray(); //renders the information model observable for use in view templates. 
      this.currentSearchRadius = ko.observable(this.radString);
      this.currentFilters = ko.observableArray(); //copy of currentfilters for updating Dom with currently applied filters.
      this.filterSet = ko.observable(false); //we need this to know when to show our list of filters. We can't show when no filters are applied.
      this.filteredInfo = [];
      this.loading = ko.observable(false);
      this.showControls = ko.observable(false);
      this.showIntro = ko.observable(true);
      this.currentView = ko.observable('intro'); //tracks the view currently shown. 
      this.showMenu = ko.observable(false);
      this.errorMessage = ko.observable();
      this.errorExists = ko.observable(false);

      //function to animate markers when corresponding list item is clikced. 
      //we'll do this via the marker array in some fashion. 
      //Drill down to check equality on lat lng vals. Checking on the position object alone
      //always results in true, because they are objects w/ the same signature. 
      //WE have to use the markers getPosition function to get the position values. 
      //A direct call to the position object returns a function. 
      //Scrolls map center to marker position, then animates. 
      this.markerTrigger = function(data){
                  markers.forEach(function(marker){
                        if(marker.getPosition().lat() == data.position.lat && marker.getPosition().lng() == data.position.lng){
                              map.panTo({lat: marker.getPosition().lat(), lng: marker.getPosition().lng()});
                              marker.setAnimation(google.maps.Animation.BOUNCE);
                              setTimeout(function(){marker.setAnimation(null);}, 4000); //stop bouncing animation after 4 seconds...The user might need an extra second to see the marker if the marker itself wasn't clicked.
                        } else {
                              marker.setAnimation(null);
                        }
                  });
      }

      this.presetSearch = function(arg, data){
            switch (arg){
                  case 'ny':
                        clearMarkers();
                        this.clearLastSearch();
                        locater(locations.newYork);
                        this.searchString("New York");
                  break;
                  case 'phil':
                        clearMarkers();
                        this.clearLastSearch();
                        locater(locations.philadelphia);
                        this.searchString("Philadelphia");
                  break;
                  case 'den':
                        clearMarkers();
                        this.clearLastSearch();
                        locater(locations.denver);
                        this.searchString("Denver");
                  break;
                  case 'sea':
                        clearMarkers();
                        this.clearLastSearch();
                        locater(locations.seattle);
                        this.searchString("Seattle");
                  break;
                  case 'chi':
                        clearMarkers();
                        this.clearLastSearch();
                        locater(locations.chicago);
                        this.searchString("Chicago");
                  break;
            } 
      }


      //Update model based on search string.
      //pass updated model to map to update the map view. 
      this.coffeeSearch = function() {
            locations.currentLoc.query = this.searchString(); 
            console.log(locations.currentLoc);
            //clear map markers before next search
            clearMarkers();
            //reset last search model to be ready for new data on this search.
            this.clearLastSearch();
            //clear old information model
            locater(locations.currentLoc);
      }

      this.storeLastSearch = function(result){
            lastSearch.push(result);
      }

      this.clearLastSearch = function(){
            lastSearch = [];
      }

      //select the appropriate info window view based on data type. 
      //modify a model which passes the correct template into the infoWindow. 
      //determine, for each obj in information, whether we should use the google
      //or the foursquare views. 
      //we run this after each new search to keep the viewModel up to date with the information model.
      //This param if then used to generate the list views
      this.getInfo = function(info){
            searchCopy = lastSearch.slice(0); // copy of the last search results
            this.information(searchCopy);
            console.log(this.information[0]);
      }

      //on a new search, clear out stored information to avoid bloat. 
      //we store each data result in the array to generate info in our views.
      this.resetInformation = function(){
            information.length = 0;
      }

      //Increase the radius in our main coffee search function. 
      //coffeeLoc pulls this.radString to use as its radius value for the query.
      this.increaseRadius = function(){
            if(this.searchRad != 50000){
                this.searchRad = this.searchRad + 500;
                this.radString = this.searchRad.toString();
                this.currentSearchRadius(this.radString);
            } else {
                  this.radString = this.searchRad.toString();
                  this.errorHandle('You have reached the maximum search radius');
            }
            
      }

      //decrease the radus in our main coffee search function.
      this.decreaseRadius = function(){
            if(this.searchRad != 500){
                this.searchRad = this.searchRad - 500;
                this.radString = this.searchRad.toString();
                this.currentSearchRadius(this.radString);
            } else {
                  this.radString = this.searchRad.toString();
                  this.errorHandle('You have reached the minimum search radius');
            }
      }
      //modifies the main coffee search to include only results that are open at time of query. 
      this.toggleOpenNow = function(){
            if(this.openNow == true){
                  this.openNow = false;
                  $('.open-now').toggleClass('button-active');
            } else {
                  this.openNow = true;
                  $('.open-now').toggleClass('button-active');
            }
      }

      //toggles the view to display the given item. 
      this.clearView = function() {
                  this.showIntro(false);
                  this.showInfo(false);
                  this.showControls(false);
            }

      this.toggleShowInfo = function(){
            this.clearView();
            if(this.showInfo() == false){
                  $('.information-container').fadeIn(600);
                  this.showInfo(true);
            } else {
                  $('.information-container').fadeOut(600);
                  this.showInfo(false);
            }
      }

      //both toggle show info and show controls hide the intor view. 
      this.toggleShowIntro = function(){
            this.clearView();
            if(this.showIntro() == false){
                  $('.intro-view').fadeIn(600);
                  this.showIntro(true);
            } else {
                  $('.intro-view').fadeOut(600);
                  this.showIntro(false);
            }
      }

      this.toggleShowControls = function(){
            this.clearView();
            if(this.showControls() == false){
                  $('.controls').fadeIn(600);
                  this.showControls(true);
            } else {
                  $('.controls').fadeOut(600);
                  this.showControls(false);
            }
      }

      this.toggleShowMenu = function(){ //for mobile, enable slide-in of menu.
            if(this.showMenu() == false){
                  $('.main-content').toggleClass('mobile-on');
                  this.showMenu(true);
            } else {
                  $('.main-content').toggleClass('mobile-off');
                  $('.main-content').toggleClass('mobile-on');
                  this.showMenu(false);
            }
      } 

      //sets clicked button to active state.
      //get class of element that was clicked, use Jquery to toggle class. 
      this.buttonActive = function(data, event){
            console.log(data);
            console.log(event);
            var elem = event.target;
            var cssClass = elem.getAttribute('class');
            var query = '.' + cssClass  //append the . for JQuery query.
            $(query).toggleClass('button-active'); //b/c query is distinct after the first run, reclicking won't deactivate. This is what the behavior should be. 
      }

      this.updateLoad = function(){
            if(this.loading() == false){
                  this.loading(true);
                  $('.loading-modal').fadeIn(600);
                  $('.main-content').fadeOut(400);
                  $('#map-view').fadeOut(300);
            } else {
                  $('.loading-modal').fadeOut(650);
                  $('.main-content').fadeIn(500);
                  $('#map-view').fadeIn(300);
                  this.loading(false);
            }
      }

     this.errorHandle = function(msg){
            this.errorMessage(msg);
            this.errorExists(true);
     }

     this.toggleError = function(){
            if(this.errorExists() == true){
                  this.errorExists(false);
            } else {
                  this.errorExists(true);
            }
     }
}
