
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
    app.service('currentAlbum', function () {
            var album = {};
            return {
                getAlbum: function () {
                    return album;
                },
                setAlbum: function(value) {
                    album = value;
                }
            };
        });

app.controller('MainCtrl', [
'$scope',
'$http',
'Upload',
'$window',
'location',
'currentAlbum',
function($scope, $http, Upload, $window, location, currentAlbum){
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
  $http.get('/api/all').
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
          latitude: data[i].dbData.lat,
          longitude: data[i].dbData.long,
        },
        images: data[i].albumData.data.images,
        album: data[i].albumData.data.id,
        show: false,
        templateUrl:"/eachSquid.html"
      }
        obj.onClick = function(a,b,c){
              $scope.show = true;
              $scope.activeCoordinates = a.model.coords;
              $scope.currImage = a.model.images[0].link
              currentAlbum.setAlbum(a.model.album)

            a.model.show = true;


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
            file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            console.log(file.progress)
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
 'currentAlbum',
function($scope, $http, Upload, $window, location, $route, currentAlbum){

  $scope.controlText = 'Add Squid';



    $scope.$watch('albums', function(newValue, oldValue) {
      if (newValue != undefined) {
        console.log("ayy")
        addToAlbum($scope.albums);
      }
    });


  function addToAlbum(files) {
        var file = files;
        var theAlb = $scope.currAlbum
        file.upload = Upload.upload({
            url: '/api/new_image',
            fields: {
                'album': currentAlbum.getAlbum()
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
