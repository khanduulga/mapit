/*global $, google, document, window*/

$(() => {
  const htmlElement = "map";

  // creates a map
  const initMap = function (options) {
    const map = new google.maps.Map(
      document.getElementById(htmlElement),
      options
    );
    // creating a new Point (null is passed in because there is no db entry)
    map.addListener("click", (event) => {
      window.addPoint(null, event.latLng, map);
    });
    return map;
  };

  // populates the maps with points from the DB
  const showPoint = function (dbPoint, googleMap) {
    window.addPoint(
      dbPoint,
      new google.maps.LatLng(dbPoint.latitude, dbPoint.longitude),
      googleMap
    );
  };

  // gets points from DB using the MAP ID
  const getPoints = function (googleMap, mapID) {
    $.ajax({
      url: `/api/points/${mapID}`,
      method: "GET",
    })
      .then((response) => {
        const points = response.points;
        for (let point of points) {
          showPoint(point, googleMap);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // Gets the Map using MAP ID and calls the initMap (create map) function with values from DB
  const getMap = function (mapID) {
    // clear points in mem otherwise points from previous session will be save to current map
    if (window.points) {
      window.points = [];
    }
    $.ajax({
      url: `/api/maps/${mapID}`,
      method: "GET",
    })
      .then((response) => {
        const dbMap = response.maps[0];
        const googleMap = initMap({
          center: new google.maps.LatLng(dbMap.center_lat, dbMap.center_long),
          zoom: dbMap.zoom,
          mapTypeId: dbMap.type,
          // attaches mapID to googleMap obj for use in app
          mapID: mapID,
        });
        // make map available globally
        window.googleMap = googleMap;
        console.log("Current mapID", mapID);
        getPoints(googleMap, mapID);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  window.getMap = getMap;
});
