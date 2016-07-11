#Application 

This app is called Caffinator. It has one purpose: to help you find coffee. You can use Caffinator to search for coffeeshops around your area.

##Usage

When Caffinator first starts up it will ask to use your location. If you accept Caffinator will find coffee shops nearby wherever it thinks you currently are. 

After the initial search has finished, you can check out information for each coffee shop by clicking on the generated map markers, or by clicking `Show Info` in order to view a list of shops and their information. You can click `Show on Map` within each list item to see the shops corresponding place on the map. 

You can search from the main window of the application by entering a new search term, e.g. 'Tokyo' and then clicking `Find Coffee`. The app will the pull results from your new search. 

View controls are accessible from the main window as well. Clicking `Show Home` will display the app's initial home page, where you can select one of five preset search terms to get a feel for how things work. `Show Controls` enables you to access the home page, where you can find more advanced searching and filtering options. The aforementioned `Show Info` displays a list of the current coffee shops found on the last search. 

###Searching

On the controls page there are a variety of options availible for refining your search. Under 'Search Options' select `Restrict to Open Now` to restrict your search to coffee shops that are open at the time the search is executed. Select the `+` or `-` buttons to increase or decrease the radius, in meters, of your search. For example, if you want to find, specifically, coffee shops close to 'Tokyo' you'll wnat to set a lower radius. If you're okay with driving a ways, you can increase the search radius. 

###Filtering

You'll also find filtering options on the controls page. Under 'Filter Results' you can filter the returned search results by coffee shop name or by their price level. To filter by name, enter a term to filter by in the input, e.g. Starbucks, then click `Filter Results`. Filtering by name will filter out all results that do not match the given input. For example if you filter by 'Starbucks' only coffee shops with 'Starbucks' in their names will be displyed on the map and in the info list. Filtering by name is not case senseitive. To filter by price, select one of the price level options e.g. `$1`. Filtering by price will restrict the returned results only to shops that have a google reported price level lower than the selected filter. Shops with no price level will not be filtered out. 

Once you apply a few filters the 'Applied Filters' panel will be populated with the list of filters you've applied. Here you can see the order in which you've applied filters, and can remove individual filters by clicking `x`. Filters are applied in sequence and all affect results. For example, if you filter by the term 'coffee' and then by the term 'blue' only those shops with both 'blue' __and__ 'coffee' in their names will remain on the map. If you remove the 'coffee' filter only shops with the word 'blue' in their name will appear on the map.

Click the `Reset Filters` button to remove all of your applied filters simultaneously and restore the results of your previous search.

##Installation

To install a copy of the app on your machine, ensure you have git installed and are comfortable using fit and the command line. If not, you can check out git [here](https://git-scm.com/). 

First, set up a folder on your device in which you want to store a copy of the app. Once this is done, do the following:
__Note:__(text prefixed with # is variable and will depend on your system)

1. Run cd `#pathToTheAppOnYourDevice`
2. Once in the correct folder, run `git clone https://github.com/scolsen/frontend-nano-map.git`

Once this is done you'll have a copy of the app's source on your machine. You should be able to run the app using only the files in the source, but, if you'd like to do further minification on files you can setup a build process of your own, or you can use the gulpfile I used for the poject. You can find that as well as the package.json for the project in the support folder. To get up and running with a build process quickly,  export the folders from the support file to the top level of the project folder, then do the following: 

1. Run cd `#pathToTheAppOnYourDevice`
2. Run npm install

Now you should be able to run `gulp` using the gulpfile provided in the support folder. 

##Running the Application 

You will need to host this application in order for it to run correctly. The easiest way to do this is as follows:
__Note:__(text prefixed with # is variable and will depend on your system)
__IMPORTANT:__(Whatever server your use it must be set to run on `localhost:4000` for calls to the foursquare API to function correctly. Otherwise foursquare data will not be retrieved.)

1. Open your command line or shell
2. Run `cd` `#pathToTheAppOnYourDevice`
3. Run `python -m SimpleHTTPServer 4000`
4. Open a browser of your choice.
5. Browse to `localhost:4000`

If you follow these steps you should see a screen that reads: 'Caffinator, finding coffee'  when you browse to localhost:4000, if so, right on! You are ready to use the app.

##API and Libraries Information

This application uses the [Google Maps Javascript API](https://developers.google.com/maps/documentation/javascript/) to provide both map and place data. 

The [Foursqaure Veneues API](https://developer.foursquare.com/overview/venues.html) also provides ocassional information about the coffee shops found via the search. 

[Knockout.js](http://knockoutjs.com/index.html) serves as the functional backbone of the app. And [JQuery](https://jquery.com/) provides some additional support for updating views. 

##Key Variables and Properties

To provide further insight as to how the app works, you'll find details for each important variable and object property utilized within the app below:

###Variables

__Variable:__ `CLIENT_ID` __Value:__ `'YULD3E3YIJCNB0W25GXL1V22WOIKGHOHXIWVFKGWNW20BTVP'`
> This is the Client ID required to access the FourSquare API. Must be passed to calls to Foursquare API

`CLIENT_SECRET` = `'UHNXU3AIJ3OIAOI15IWLEIG4BUYQ2VPBMGJA3XLRR2QUFIKP'`
> This is the Client Secret required to access the FourSquare API

`ver` = '20160621'
> The Version information is also a requirement for accessing the Foursquare API

`mapsKey` = 'AIzaSyAfBb6TDIxE-uYJaHe-rZ-mJhN0PZyIylE'
> API key rquired for accessing the google maps API

`markerIcon` = "../img/coffee-map-icon-small.png"
> Url for custom marker icons on the map. Resource in the img folder. 

`geoRun` //check if the current search was run with Geopoistion. 
> This variable is set on the intial load of the application. Lets the app know what place was returned as the user's geoposition. 

###AppViewModel Properties.

The AppViewModel does the majority of the work throughout the application. As such it's helpful to know a bit about its properties. 

`this.showInfo` __Value:__ `ko.observable(false)`
> Tracks whether the info view should be visibile.

this.searchRad = 500;
> The radius to pass to each search query.

this.openNow = false;
> Tracks whether to restrict searches to coffee shops open at the time of searching

this.radString = this.searchRad.toString();
> Converts the search radius to a string value.

this.searchString = ko.observable();
>String to run a coffee shop search on.

this.filterString = ko.observable("Starbucks"); 
> String to filter results by name on. 

this.currentFilters = ko.observableArray();
> Array of currently applied filters 

this.filterSet = ko.observable(false); 
> Tracks whether to show the list of filters

this.loading = ko.observable(false);
> Tracks whether to show the loading screen.

this.showControls = ko.observable(false);
> Tracks whether to show the controls view.

this.showIntro = ko.observable(true);
> Tracks whether to show the home page

this.showMenu = ko.observable(false);
> On smaller devices, tracks whether to dispaly the menu. 

this.errorMessage = ko.observable();
> Error message to be passed to errorHandle function

this.errorExists = ko.observable(false);
> Tracks whether an error has been encountered.

##Function Profiles

To provide further insight as to how the app works, you'll find profiles for each function utilized within the app below:

###App Functions

These functions can be found in app.js

`initMap()`: Runs necessary tasks for setting up google maps object. Handles running an initial search based on user's Geolocation. 

`getGeoLoc()`: Gets the user's current geolocation to pass to initial search.

`locater(data)`: takes a query object and runs a service.TextSearch on the object to find place data.

`coffeLoc(currentLoc)`: uses the current location to search for coffee shops in the area. Runs after initial search to reset the map to the user's searched location. 

`updateMapLocation(data)`: based on user's input, updates the map's position to a new location. 

`ceateMarker(info)`: Creates a marker on the map and corresponding infoWindow based on the contents of a passed info object of either foursquare or google data.

`setMapOnAll(map)`: Draws all markers in the markers array in models.js on the map. (this will be all markers generated since the user started the app)

`setMapLastSearch(map)`: Draws only the markers associated to the last search o the map. 

`clearMarkers()`: removes all markers from the map but retains them in the markers array.

`deleteMarkers()`: removes all markers from the map and from the markers array.

`drawSelectMarkers(obj)`: Draw only the markers that match the positon of the passed object. 

`clearSelectMarkers(obj)`: Remove only the markers that match the position of the passed object.

`searchPlaceInfo(data)`: Using results from google place query on `coffeeCall` poll Foursqaure and Google apis using the latitudes of the found locations to gather data about each one. 

###AppViewModel Functions

`markerTrigger(data)`: Animates a marker corresponding to a given item in the list view.

`preSetSearch(arg, data)`: runs a preset searhc base don one of five preset search models in models.js

`coffeeSearch()`: calls our search function with the user's inputed search term grabbed through a knockout binding.

`errorHandle(msg)`: Takes a message to display on application error, renders the error message on the page. 

###Filter Functions

These functions can be found in filter.js

`resetFilter()`: Clears all applied filters and restores map data from the previous search. 

`addFilter(type, val, callback, data, event)`: Adds a filter object to the current filters array for filter application. Callsback button activation to indicate applied price filters.

`filter()`: after adding a filter, filters the displayed search results based on the objects currently in currentFilters. 

`removeFilter(id, data)`: Removes a filter object from the array of currentFilters based on the id property of the object.

`updateFiltersView`: Updates the list of applied filters in the application. 

