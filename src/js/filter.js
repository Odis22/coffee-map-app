//filter.js
//Since the filter is a bit unwieldly, stored in a separate file to modularize the
//view model functionality. 

/*---- global filtering helpers. Logical checks to see how we should filter results-----*/

function doesNotContain(str, sub){
      if(str.toLowerCase().indexOf(sub.toLowerCase()) == -1){
            return true;
      } else {
            return false;
      }
}

function doesContain(str, sub){
      if(str.includes(sub)){
            return true;
      } else {
            return false;
      }
}

function greaterThan(value, floor){
      if(value >  floor){
            return true;
      } else {
            return false;
      }
}

function lessThan(value, cieling){
      if (value < cieling){
            return true;
      } else {
            return false;
      }
}

/*------- Filtering properties ------*/

AppViewModel.currentFilters = ko.observableArray(); //copy of currentFilters model for updating list of applied filters.
AppViewModel.filterString = ko.observable("Starbucks");

/*------ Filtering category options. Default to false. --------*/ 

AppViewModel.filterByPrice = ko.observable(false);
AppViewModel.filterByDistance = ko.observable(false);

/*------ Filtering bound to the viewModel.  i.e. all the heavy lifting that actually operates on our models. --------*/ 

//filter reset
//resets filters and redraws all markers on map.
AppViewModel.prototype.resetFilter = function(){
      this.filterString(""); //reset filterstring to blank
      //reset active state on all filter controls:
      this.currentFilters().forEach(function(filter){
            if($(filter.target).hasClass('button-active')){
                  $(filter.target).toggleClass('button-active');
            }
      });
      this.getInfo(); //restore the last search tot he searchCopy
      this.information(searchCopy); //reset the information model to equal the last search repopulates info
      this.currentFilters([]); //empty currentFilters array
      this.updateFiltersView(); //update the view of the list of applied filters
      setMapLastSearch(map); //set all markers from the last search to the map and draw them.
}
 

//filtering functions. Called by different controls within the app.


AppViewModel.prototype.filter = function(){
      var self = this;
      if(this.currentFilters().length <= 0){ //if our filters list is empty from successive removals rerender all last search markers.
            setMapLastSearch(map);
      } else {
            setMapLastSearch(map); //redraw all markers from previous search //then filters remove
            this.currentFilters().forEach(function(filter){
                  if(filter.type == 'name'){
                        self.filterNameSubtractive(filter.val);
                  } else if(filter.type == 'price'){
                        self.filterPrice(filter.val);
                  }
            });
      }
}
//callback will run the passed function, e.g. setting button state to active. 
AppViewModel.prototype.addFilter = function(type, val, callback, data, event){ //adds a filter object to the current filters array. Called by all filter functions.
      var self = this;
      var filter = {}; //instantiate object to push to currentfilters array. 
      filter.type = type; //the type of the filter
      filter.val = val; //content of the filter
      filter.id = (this.currentFilters().length); //set the filters id to the current lenght minus one. Used to remove filter later.
      if(event != undefined){filter.target = '.' + event.target.getAttribute('class');} //only needed for price filters, check if event is defined first, retains knowledge of what control element triggered the filter, for deactivation on filter removal. preped for JQuery use.
      //check to see if this filter is already applied, if not, add it. If it is don't. 
      //if the currentfilters are empty though, just add the filter:
      if(this.currentFilters().length > 0) { //if we already have some filters, run our check. 
            this.currentFilters().forEach(function(fil){
                  console.log(fil.val);
                  console.log(filter.val);
                  if(filter.val == fil.val){
                        filter = {} ; //if the filter is already applied, kill our filter and don't add anything else. tell the user the filter is already applied. 
                  }
            });
      }
      console.log(filter.type);
      if(filter.type != undefined){ //run the rest only if we are actually adding a filter.
            this.currentFilters.push(filter); //add the filter. //if our filter hasn't been killed on our cross check, go ahead and add it.
            var index = this.currentFilters.indexOf(filter); // gets the index of the added filter
            this.filter();
            this.updateFiltersView();
            if(typeof callback == 'function'){callback(data, event);} //check if we passed a callback, if so, run.
      } else {
            this.errorHandle('This filter is already applied.'); 
      }
}

AppViewModel.prototype.filterNameAdditive = function(value){
      clearMarkers(); //clear all markers from the map. 
      this.information().forEach(function(info){
            if(doesContain(info.name, value)){
                  drawSelectMarkers(info);
            }
      });
}

AppViewModel.prototype.filterNameSubtractive = function(value){
      var self = this;
      lastSearch.forEach(function(info){ //have to use lastSearch as our looping reference. Otherwise updating info in the loop messes up the sequencing.
            if(doesNotContain(info.name, value)){
                  clearSelectMarkers(info);
                  self.information.remove(function(inf) {return inf.name == info.name}); //remove matching information 
            } 
      });
}

AppViewModel.prototype.filterPrice = function(value){
      var self = this;
       lastSearch.forEach(function(info){ //have to use lastSearch as our looping reference. Otherwise updating info in the loop messes up the sequencing.
            if( info.price_level != undefined && greaterThan(info.price_level, value)){
                  console.log(info.price_level);
                  clearSelectMarkers(info);
                  self.information.remove(function(inf) {return inf.price_level > info.price_level}); //remove matching information 
            } 
      });
}

AppViewModel.prototype.removeFilter = function(id, data){ //note that this function must be passed $root as a param when bound to ensure proper assignment to this
      console.log(id);
      var removed = this.currentFilters.remove(function(filter){return filter.id == id; });
      this.updateFiltersView();
      $(removed[0].target).toggleClass('button-active'); //remove the active class from the filter control that applied the filter.
      this.getInfo(); //restore the SearchCopy to the last search
      this.information(searchCopy); //reset information to the last search. 
      this.filter(); //reapply remaining filters in the currentFilters to update view.
}

//Views Functions. 
//update view of applied filters
AppViewModel.prototype.updateFiltersView = function(){
            if(this.currentFilters().length > 0){
                  this.filterSet(true);
            } else {
                  this.filterSet(false);
      }
}
