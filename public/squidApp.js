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

app.controller('MainCtrl', [
'$scope',
'$http',
'Upload',
'$window',
'location',
function($scope, $http, Upload, $window, location){
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
  $http.get('/api/test').
  success(function(data, status, headers, config) {
    $scope.squids = data;
    $scope.markers = [];
    $scope.markers.options = {
    }

      for(var i=0;i<data.length;i++){
      var obj = {
        id: i,
        coords: {
          latitude: data[i].lat,
          longitude: data[i].long,
        },
        img_paths: data[i].img_paths[0],

        show: false
      }
        obj.onClick = function(a,b,c){
            for(var i = 0; i < $scope.markers.length;i++){
              $scope.markers[i].show = false;
            }
            console.log(a)
            a.model.show = !a.model.show;


        }
        $scope.markers.push(obj);
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
function($scope, $http, Upload, $window, location){

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
            console.log("ayy")
        });
  };
}
]);
