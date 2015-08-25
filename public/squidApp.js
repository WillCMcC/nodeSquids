
var app = angular.module('squidApp', ['ngRoute', 'uiGmapgoogle-maps', 'ngFileUpload']);

app.service('location', function () {
        var loc = {};
        var map = {};
        var markers = {};
        return {
            getLocation: function () {
                return loc;
            },
            setLocation: function(value) {
                loc = value;
            },
            setMap: function(value){
              map = value;
            },
            getMap: function(){
              return map;
            },
            getMarkers: function(){
              return markers;
            },
            setMarkers: function(value){
              markers = value;
            },
            showButton: false,
        };
    });
    app.service('markerInfo', function () {
            var album = {};
            var squid = {};
            return {
                getAlbum: function () {
                    return album;
                },
                setAlbum: function(value) {
                    album = value;
                },
                getSquid: function(){
                  return squid;
                },
                setSquid: function(value){
                  squid = value;
                },


            };
        });

app.controller('MainCtrl', [
'$scope',
'$http',
'Upload',
'$window',
'location',
'markerInfo',
'uiGmapIsReady',
function($scope, $http, Upload, $window, location, markerInfo, uiGmapIsReady){
$scope.map = {
  center: { latitude: 37.79, longitude: -122.420868 },
  zoom: 13,
  options: {
    mapTypeControl: false,

  },
  control: {},


};





$scope.markerControl = {};



uiGmapIsReady.promise()
    .then(function (map_instances) {
      console.log("ostensibly ready")
      location.setMap($scope.map)
      location.setMarkers($scope.markerControl)

    });


$window.MY_SCOPE = $scope;

var userLoc = {};
$scope.refresh = false;

$scope.currImage = "";



$scope.test = function(){
  $scope.show = t;
}



$scope.squid = {};
$scope.show = false;
$scope.markers = [];
  $http.get('/api/markers').
  success(function(data, status, headers, config) {
    if(data.length != 0){
      for(squid in data){
      var obj = {
        id: squid,
        coords: {
          latitude: data[squid].lat,
          longitude: data[squid].long,
        },
        images: data[squid].images,
        show: false,

      }
        obj.onClick = function(a,b,c){
              $scope.show = true;
              var counter = 0;
              var maxLength = a.model.images.length ;
              $scope.activeCoordinates = a.model.coords;
              $scope.currImage = a.model.images[counter];
              $scope.nextImage = function(){
                  counter ++;
                  if(counter < maxLength){
                    $scope.currImage = a.model.images[counter]
                  }else{
                    counter = 0;
                    $scope.currImage = a.model.images[counter]
                  }
              }
              a.model.show = true;
              markerInfo.setSquid(a.model.id)
        }
        $scope.markers.push(obj);
      }
      }

  }).
  error(function(data, status, headers, config) {
    // called asynchronously if an error occurs
    // or server returns response with an error status.
  });




}

]);

app.controller('buttonCtrl', [
'$scope',
'$http',
'Upload',
'$window',
'location',
 '$route',
function($scope, $http, Upload, $window, location, $route){


  $scope.buttonObj = {
    location: true,
  };
  $scope.tingObj = {
    location2: true,
  };




  $scope.addClick = function(){
    console.log("test")
    
    document.getElementById("addPicture").style.display = "block"

    navigator.geolocation.getCurrentPosition(function(position) {

      $scope.buttonObj.location = false;


      console.log($scope.buttonObj);


      var realMap = location.getMap().control.getGMap()
      var markers = location.getMarkers()

      var obj = {
        id: 1,
        coords: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        },
        options: {
          draggable: true,
          title: "Set Location"
         },
      }
        obj.onClick = function(a,b,c){
              console.log(location.getMarkers().getGMarkers()[0].position)
              $scope.show = true;
              var counter = 0;
              $scope.activeCoordinates = a.model.coords;
              a.model.show = true;
        }


      markers.newModels([obj])
      userLoc.lat = position.coords.latitude;
      userLoc.lng = position.coords.longitude;
      $scope.refresh = true;
      location.setLocation(userLoc);
      realMap.setZoom(18);
      realMap.setCenter(userLoc);
    });
  }

  $scope.controlText = 'Add Squid';
  $scope.refresh = true;
  $scope.$watch('files', function (newValue) {
    if (newValue){
      uploadUsingUpload($scope.files);
    }
  });




  $window.MY_SCOPE2 = $scope;


  userLoc = location.getLocation();

  function uploadUsingUpload(files) {
        var file = files[0];
        file.upload = Upload.upload({
            url: '/api/new_squid',
            fields: {
                'latitude': location.getMarkers().getGMarkers()[0].position.G,
                'longitude': location.getMarkers().getGMarkers()[0].position.K
            },
            file: file
        });
        file.upload.progress(function (evt) {
            // Math.min is to fix IE which reports 200% sometimes
        });
        file.upload.success(function (data, status, headers, config) {
            $window.location.reload();
        });
  };
}
]);
app.controller('addPictureCtrl', [
'$scope',
'$http',
'Upload',
'$window',
'location',
 '$route',
 'markerInfo',
function($scope, $http, Upload, $window, location, $route, markerInfo){

  $scope.controlText = 'Add Squid';



    $scope.$watch('albums', function(newValue, oldValue) {
      if (newValue != undefined) {
        addToAlbum($scope.albums);
      }
    });


  function addToAlbum(files) {
        var file = files;
        file.upload = Upload.upload({
            url: '/api/new_image',
            fields: {
                'squid': markerInfo.getSquid(),
                'lat': location.getLocation().lat,
                'long': location.getLocation().lng,
            },
            file: file
        });
        file.upload.progress(function (evt) {
            // Math.min is to fix IE which reports 200% sometimes
        });
        file.upload.success(function (data, status, headers, config) {
            $window.location.reload();
        });
  };
}
]);

app.controller('galleryControl', [
'$scope',
'$http',
'Upload',
'$window',
'location',
 '$route',
 'markerInfo',
function($scope, $http, Upload, $window, location, $route, markerInfo){

  $scope.markers = [];
    $http.get('/api/markers').
    success(function(data, status, headers, config) {
    }).
    error(function(data, status, headers, config) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
    });


}
]);
