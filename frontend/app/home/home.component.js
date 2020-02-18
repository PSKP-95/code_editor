'use strict';

// Register `phoneList` component, along with its associated controller and template
angular.
  module('home').
  component('home', {
    templateUrl: 'home/home.template.html',
    controller: ['$http','$window','$rootScope', function homeController($http,$window,$rootScope) {
        
        this.input = "";
        this.output = "";
        this.ext = ".cpp";
        
        var self = this;

        this.runcode = function() {
            $http({
                url: 'http://127.0.0.1:8888/run',
                method: "POST",
                data: { 'code' : editAreaLoader.getValue("code"),
                        'input': this.input, 
                        'ext': this.ext }
            }).then(function(response) {
                self.output = response["data"];
            });
        }

        editAreaLoader.init({
            id : "code",		
            syntax: "cpp",			
            start_highlight: true,
            allow_toggle: false		
        });  

        this.filetype = "cpp";
        this.langChange = function() {
            if(this.ext == ".cpp"){
                this.filetype = "cpp";
            } else if(this.ext == ".py"){
                this.filetype = "python";
            } else {
                this.filetype = "c";
            }
            editAreaLoader.init({
                id : "code",		
                syntax: this.filetype,		
                start_highlight: true,
                allow_toggle: false		
            }); 
        }      
    }]
  });