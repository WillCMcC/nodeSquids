var app = angular.module('squidApp', ['ngRoute']);

app.controller('MainCtrl', [
'$scope',
'$http',
function($scope, $http){
  $http.get('/test').
  success(function(data, status, headers, config) {
    // this callback will be called asynchronously
    // when the response is available
  }).
  error(function(data, status, headers, config) {
    // called asynchronously if an error occurs
    // or server returns response with an error status.
  });
}]);
