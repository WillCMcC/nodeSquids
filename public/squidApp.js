var app = angular.module('squidApp', ['ngRoute', 'uiGmapgoogle-maps', 'ngFileUpload']);

app.controller('MainCtrl', [
'$scope',
'$http',
function($scope, $http){
$scope.map = {
  center: { latitude: 37.79, longitude: -122.420868 },
  zoom: 13,
  options: {
    mapTypeControl: false,

  }
};


  $http.get('/api/test').
  success(function(data, status, headers, config) {
    $scope.squids = data;
    console.log(data);
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
    console.log("done with init load")
  }).
  error(function(data, status, headers, config) {
    // called asynchronously if an error occurs
    // or server returns response with an error status.
  });

}]);


//inject angular file upload directives and services.
app.controller('uploader', ['$scope', 'Upload', '$timeout', '$window', function ($scope, Upload, $timeout, $window) {
    function init() {
      $('#somecomponent').locationpicker(
        {
            location: { latitude: 37.79, longitude: -122.420868 },
            zoom: 13,
            radius: 0,
            inputBinding: {
                latitudeInput: $('#squidLat'),
                longitudeInput: $('#squidLong')
            }
        }
      );
        var userLoc = {};
        $scope.squid = {};
        // jquery lol
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(function(position) {
            userLoc.lat = position.coords.latitude;
            userLoc.lng = position.coords.longitude;
              console.log(userLoc);
            var map = $('#somecomponent').locationpicker('map');
            var marker = $('#somecomponent').locationpicker('marker');
            $('#squidLat').val(userLoc.lat)
            $('#squidLong').val(userLoc.lng)
            map.map.setCenter(userLoc);
            map.marker.setPosition(userLoc);
            map.map.setZoom(15);
        })
      } else {

        }



    }
    init();

    $scope.$watch('files', function () {
      $scope.files.lat = $('#squidLat').val();
      $scope.files.long = $('#squidLong').val();
        $scope.upload($scope.files);
    });
    $scope.log = '';

    $scope.press = function() {


      console.log("test");

    }

    $scope.upload = function (files) {
        if (files && files.length) {
            for (var i = 0; i < 1; i++) {
                var file = files[0];
                console.log($scope.files)
                Upload.upload({
                    url: '/api/new_squid',
                    fields: {
                        'latitude': files.lat,
                        'longitude': files.long
                    },
                    file: file
                }).progress(function (evt) {

                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    $scope.log = 'progress: ' + progressPercentage + '% ' +
                                evt.config.file.name + '\n' + $scope.log;
                  if(progressPercentage == 100){
                    $window.location.href = './';
                  }

                }).success(function (data, status, headers, config) {
                    console.log("success")
                    $timeout(function() {
                        $scope.log = 'file: ' + config.file.name + ', Response: ' + JSON.stringify(data) + '\n' + $scope.log;
                    });
                });


            }
        }
    };
}]);
app.controller('controlCtrl', function ($scope, $window) {
        $scope.controlText = 'Add Squid';
        $scope.danger = false;
        $scope.controlClick = function () {
            $scope.danger = !$scope.danger;
            $window.location.href = './add';
        };
    });
