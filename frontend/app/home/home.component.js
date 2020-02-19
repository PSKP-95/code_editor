'use strict';

// Register `phoneList` component, along with its associated controller and template
angular.
  module('home').
  component('home', {
    templateUrl: 'home/home.template.html',
    controller: ['$http','$window','$rootScope', function homeController($http,$window,$rootScope) {
        
        // for getting access in http request
        var self = this;

        this.input = "";    // input data expected from user
        this.output = "";   // output data
        this.ext = ".cpp";   // default extension
        this.code = "";

        // running code
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

        // codearea
        editAreaLoader.init({
            id : "code",		
            syntax: "cpp",			
            start_highlight: true,
            allow_toggle: false,
            replace_tab_by_spaces: 4	
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
                allow_toggle: false,
                replace_tab_by_spaces: 4	
            }); 
        }
        
        // explorer

        // stack for point current and its path
        // e.g. ['D','engg','sem 5'] means /D/engg/sem \5/
        this.stack = [];
        this.parent_id = 1;
        this.parent = "root";
        this.children = [];
        this.openfile = "";
        $http({
            url: 'http://127.0.0.1:8888/dir',
            method: "POST",
            data: { 'dir_id' : self.parent_id}
        }).then(function(response) {
            self.children = response.data;
            self.children.sort(function(a, b){return b[2] - a[2]});
        });

        this.loadDir = function(child) {
            if(child[2] == 1){  // if folder
                this.stack.push([this.parent,this.parent_id]);
                this.parent = child[1];
                this.parent_id = child[0];
                this.loadDirUsingId(child[0]);
            } else { // file
                this.loadFile(child);
            }
        }

        this.loadFile = function(node) {
            this.openfile = node;
            $http({
                url: 'http://127.0.0.1:8888/cat',
                method: "POST",
                data: { 
                    'filename' : node[1],
                    'parent': node[3]
                }
            }).then(function(response) {
                self.code = response.data;
                editAreaLoader.setValue("code",self.code);
            });
        }

        this.back = function() {
            if(this.stack.length == 0)
                return;
            var tmp = this.stack.pop();
            this.parent_id = tmp[1];
            this.parent = tmp[0];
            this.loadDirUsingId(this.parent_id);
        }

        this.loadDirUsingId = function(id) {
            $http({
                url: 'http://127.0.0.1:8888/dir',
                method: "POST",
                data: { 'dir_id' : id}
            }).then(function(response) {
                self.children = response.data;
                self.children.sort(function(a, b){return b[2] - a[2]});   // first folders and then files
            });
        }

        // creat new file in current directory
        this.createFile = function(content) {
            $http({
                url: 'http://127.0.0.1:8888/touch',
                method: "POST",
                data: {
                    "filename": prompt("Enter Filename",""),
                    "parent": this.parent_id,
                    "content": content
                }
            }).then(function(response) {
                alert(response.data);
                self.loadDirUsingId(self.parent_id);  // refresh directory
            });
        }

        this.createDir = function() {
            $http({
                url: 'http://127.0.0.1:8888/mkdir',
                method: "POST",
                data: {
                    "folder": prompt("Enter folder name",""),
                    "parent": this.parent_id,
                }
            }).then(function(response) {
                alert(response.data);
                self.loadDirUsingId(self.parent_id);  // refresh directory
            });
        }

        this.saveFile = function() {
            if(this.openfile != ""){
                $http({
                    url: 'http://127.0.0.1:8888/edit',
                    method: "POST",
                    data: {
                        "filename": this.openfile[2],
                        "parent": this.openfile[3],
                        "content": editAreaLoader.getValue("code")
                    }
                }).then(function(response) {
                    alert(response.data);
                });
            } else {
                this.createFile(editAreaLoader.getValue("code"));
            }
        }
    }]
  });