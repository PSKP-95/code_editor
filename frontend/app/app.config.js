angular.
  module('coderunner').
  config(['$routeProvider','$locationProvider',
    function config($routeProvider,$locationProvider) {
      $routeProvider.
        when('/home', {
            template: '<home></home>'
        }).
        when('/auth', {
          template: '<auth></auth>'
        }).
        otherwise('/home');
      
      $locationProvider.hashPrefix('');
      }
  ]);