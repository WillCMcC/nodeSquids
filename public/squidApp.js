var app = angular.module('squidApp', ['ngRoute', 'uiGmapgoogle-maps']);

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
