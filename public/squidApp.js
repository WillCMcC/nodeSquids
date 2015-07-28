var app = angular.module('squidApp', ['ngRoute', 'uiGmapgoogle-maps', 'ngFileUpload']);

app.controller('MainCtrl', [
'$scope',
'$http',
'Upload',
'$window',
function($scope, $http, Upload, $window){
$scope.map = {
  center: { latitude: 37.79, longitude: -122.420868 },
  zoom: 13,
  options: {
    mapTypeControl: false,

  }
};
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
function($scope, $http, Upload, $window){
    debugger;
  var userLoc = {};
  $scope.controlText = 'Add Squid';
  $scope.$watch('files', function () {
    var userLoc = {};
    $scope.upload($scope.files);
  });

  $scope.press = function() {



  };

  $scope.upload = function (files) {

      navigator.geolocation.getCurrentPosition(function(position) {
        if (position) {
        userLoc.lat = position.coords.latitude;
        userLoc.lng = position.coords.longitude;

                var file = files[0];
                Upload.upload({
                    url: '/api/new_squid',
                    fields: {
                        'latitude': userLoc.lat,
                        'longitude': userLoc.lng
                    },
                    file: file
                }).progress(function (evt) {

                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);

                  if(progressPercentage == 100){
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

                }).success(function (data, status, headers, config) {
                    $timeout(function() {
                        $scope.log = 'file: ' + config.file.name + ', Response: ' + JSON.stringify(data) + '\n' + $scope.log;
                    });
                    console.log("worked")
                });


        }else {

          $window.alert("Turn on location!");

        }});





    };
  }
]);
