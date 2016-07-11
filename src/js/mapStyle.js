//map style.js
//This file handles the custom googlemaps styling on our map. 

var mapStyles = [
      {
            featureType: "all",
            elementType: "geometry.fill",
            stylers:[
                  {saturation: -100},
                  {lightness: 100},
            ]
      },
      {
            featureType: "road.highway",
            stylers:[
                  {visibility: "off"}
            ]
      },
      {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers:[
                  {weight: 1},
                  {hue:"#DC143C"},
                  {saturation: 60}
            ]
      },
      {
            featureType: "landscape",
            stylers:[
                  {lightness: 20}
            ]
      },
      {
            featureType: "water",
            elementType: "geometry.fill",
            stylers:[
                  {lightness: 0},
                  {saturation: 100},
                  {hue: "#ADD8E6"}
            ]
      },
]; 