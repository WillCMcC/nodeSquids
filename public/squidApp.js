var app = angular.module('squidApp', ['ngRoute', 'uiGmapgoogle-maps', 'ngFileUpload']);

app.controller('MainCtrl', [
'$scope',
'$http',
function($scope, $http){
  $http.get('/api/test').
  success(function(data, status, headers, config) {
    $scope.squids = data;
    $scope.markers = [];
    for(var i=0;i<data.length;i++){
      var obj = {};
      obj.latitude = data[i].lat;
      obj.longitude = data[i].long;
      $scope.markers.push([i, obj]);
      if(i == data.length - 1){
        console.log($scope.markers);
      }
    }
  }).
  error(function(data, status, headers, config) {
    // called asynchronously if an error occurs
    // or server returns response with an error status.
  });
  $scope.map = { center: { latitude: 37.805375, longitude: -122.420868 }, zoom: 14 };
}]);


//inject angular file upload directives and services.
app.controller('uploader', ['$scope', 'Upload', '$timeout', function ($scope, Upload, $timeout) {
    function init() {
        var userLoc = {};
        $scope.squid = {};
        // jquery lol
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(function(position) {
            userLoc.latitude = position.coords.latitude;
            userLoc.longitude = position.coords.longitude;
            console.log(userLoc);
            $('#somecomponent').locationpicker(
              {
                  location: userLoc,
                  radius: 0,
                  inputBinding: {
                      latitudeInput: $('#squidLat'),
                      longitudeInput: $('#squidLong')
                  }
        	    }
            );
          });
        } else {
          $('#somecomponent').locationpicker(
            {
                location: {longitude:-122.415232, latitude:37.7761986},
                radius: 0,
                inputBinding: {
                    latitudeInput: $('#squidLat'),
                    longitudeInput: $('#squidLong')
                }
            }
          );
        }



    }
    init();

    $scope.$watch('files', function () {
        $scope.upload($scope.files);
    });
    $scope.log = '';

    $scope.press = function() {

      $scope.squid.lat = $('#squidLat').val();
      $scope.squid.long = $('#squidLong').val();
      console.log($scope.squid);

    }

    $scope.upload = function (files) {
        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                Upload.upload({
                    url: '/api/new_squid',
                    fields: {
                        'latitude': $scope.squid.lat,
                        'longitude': $scope.squid.long
                    },
                    file: file
                }).progress(function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    $scope.log = 'progress: ' + progressPercentage + '% ' +
                                evt.config.file.name + '\n' + $scope.log;
                }).success(function (data, status, headers, config) {
                    $timeout(function() {
                        $scope.log = 'file: ' + config.file.name + ', Response: ' + JSON.stringify(data) + '\n' + $scope.log;
                    });
                });
            }
        }
    };
}]);
