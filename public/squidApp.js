
var app = angular.module('squidApp', ['ngRoute', 'uiGmapgoogle-maps', 'ngFileUpload']);

app.service('location', function () {
        var loc = {};
        return {
            getLocation: function () {
                return loc;
            },
            setLocation: function(value) {
                loc = value;
            }
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
                }
            };
        });

app.controller('MainCtrl', [
'$scope',
'$http',
'Upload',
'$window',
'location',
'markerInfo',
function($scope, $http, Upload, $window, location, markerInfo){
$scope.map = {
  center: { latitude: 37.79, longitude: -122.420868 },
  zoom: 13,
  options: {
    mapTypeControl: false,

  },
  control: {},


};
$window.MY_SCOPE = $scope;
var userLoc = {};
$scope.mylocation = false;
$scope.refresh = false;

$scope.currImage = "";
$scope.currAlbum = "";



$scope.test = function(){
  $scope.show = false;
}

navigator.geolocation.getCurrentPosition(function(position) {
  userLoc.lat = position.coords.latitude;
  userLoc.lng = position.coords.longitude;
  $scope.mylocation = true;
  $scope.refresh = true;
  location.setLocation(userLoc);
  var map = $scope.map.control.getGMap();
  map.setZoom(18);
  map.setCenter(userLoc);
});

$scope.squid = {};
$scope.show = false;
$scope.markers = [];
  $http.get('/api/markers').
  success(function(data, status, headers, config) {
    console.log(data);
    $scope.squids = data;
    $scope.markers.options = {
    }
    if(data.length != 0){
      for(var i=0;i<data.length;i++){
      var obj = {
        id: i,
        coords: {
          latitude: data[i].lat,
          longitude: data[i].long,
        },
        image: data[i].img_link,
        squid: data[i].squid,
        show: false,
      }
        obj.onClick = function(a,b,c){
              $scope.show = true;
              console.log(a);
              $scope.activeCoordinates = a.model.coords;
              $scope.currImage = a.model.image;
              a.model.show = true;
              markerInfo.setSquid(a.model.squid)
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

  $scope.controlText = 'Add Squid';
  $scope.refresh = true;
  $scope.$watch('files', function (newValue) {
    if (newValue){
      uploadUsingUpload($scope.files);
    }
  });



  userLoc = location.getLocation();
  function uploadUsingUpload(files) {
        var file = files[0];
        file.upload = Upload.upload({
            url: '/api/new_squid',
            fields: {
                'latitude': userLoc.lat,
                'longitude': userLoc.lng
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
        console.log("ayy")
        addToAlbum($scope.albums);
      }
    });


  function addToAlbum(files) {
      console.log(markerInfo.getSquid())
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
          console.log("did it!")
            $window.location.reload();
        });
  };
}
]);
