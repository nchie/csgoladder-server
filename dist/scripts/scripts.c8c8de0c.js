!function(){"use strict";var a=angular.module("socket.io",[]);a.provider("$socket",function(){function a(a,b,c){if(typeof b!==c)throw new TypeError("'"+a+"' must be of type '"+c+"'");d[a]=b}function b(a){var b=io(c,d);return{on:function(c,d){b.on(c,function(){var c=arguments;a.$apply(function(){d.apply(b,c)})})},off:function(a,c){"function"==typeof c?b.removeListener(a,c):b.removeAllListeners(a)},emit:function(c,d,e){"function"==typeof e?b.emit(c,d,function(){var c=arguments;a.$apply(function(){e.apply(b,c)})}):b.emit(c,d)}}}var c="",d={};this.setResource=function(b){a("resource",b,"string")},this.setConnectTimeout=function(b){a("connect timeout",b,"number")},this.setTryMultipleTransports=function(b){a("try multiple transports",b,"boolean")},this.setReconnect=function(b){a("reconnect",b,"boolean")},this.setReconnectionDelay=function(b){a("reconnection delay",b,"number")},this.setReconnectionLimit=function(b){a("reconnection limit",b,"number")},this.setMaxReconnectionAttempts=function(b){a("max reconnection attempts",b,"number")},this.setSyncDisconnectOnUnload=function(b){a("sync disconnect on unload",b,"boolean")},this.setAutoConnect=function(b){a("auto connect",b,"boolean")},this.setFlashPolicyPort=function(b){a("flash policy port",b,"number")},this.setForceNewConnection=function(b){a("force new connection",b,"boolean")},this.setConnectionUrl=function(a){if("string"!=typeof a)throw new TypeError("setConnectionUrl error: value must be of type 'string'");c=a},this.$get=b,b.$inject=["$rootScope"]})}(),function(){"use strict";angular.module("clientApp",["ngAnimate","ui.bootstrap","ui.router","smart-table","socket.io"])}(),function(){"use strict";function a(a,b,c){a.otherwise("/"),c.html5Mode(!0),b.state("front",{title:"Frontpage",url:"/",templateUrl:"app/components/front/front.html",controller:"FrontCtrl",controllerAs:"contentVm",data:{}}).state("home",{title:"Home",url:"/home",templateUrl:"app/components/home/home.html",controller:"HomeCtrl",controllerAs:"contentVm",data:{}}).state("nopermission",{title:"No permission",url:"/nopermission",templateUrl:"app/common/templates/nopermission.html"}).state("404",{title:"404 Not found",url:"/404",templateUrl:"app/common/templates/404.html"}).state("lobbies",{title:"Lobbies",url:"/lobbies",templateUrl:"app/components/lobbies/lobbies.html",controller:"LobbiesCtrl",controllerAs:"contentVm",data:{},resolve:{auth:["AuthResolver",function(a){return a.resolve()}],lobbies:["$stateParams","LobbyService",function(a,b){return b.refreshLobbies()}]}}).state("teams",{title:"Teams",url:"/teams",templateUrl:"app/components/teams/teams.html",controller:"TeamsCtrl",controllerAs:"contentVm",data:{}}).state("forums",{title:"Forums",url:"/forums",templateUrl:"app/components/forums/forums.html",controller:"ForumsCtrl",controllerAs:"contentVm",data:{}}).state("support",{title:"Support",url:"/support",templateUrl:"app/components/support/support.html",controller:"SupportCtrl",controllerAs:"contentVm",data:{}}).state("about",{title:"About",url:"/about",templateUrl:"app/components/about/about.html",controller:"AboutCtrl",controllerAs:"contentVm",data:{}}).state("profile",{title:"Profile",url:"/profile?id",templateUrl:"app/components/profile/profile.html",controller:"ProfileCtrl",controllerAs:"contentVm",resolve:{auth:["AuthResolver",function(a){return a.resolve()}],user:["$stateParams","UserService",function(a,b){return b.getUser(a.id)}]}}).state("team",{title:"Team",url:"/team?id",templateUrl:"app/components/team/team.html",controller:"TeamCtrl",controllerAs:"contentVm",resolve:{auth:["AuthResolver",function(a){return a.resolve()}],team:["$stateParams","TeamService",function(a,b){return b.getTeam(a.id)}]}}).state("ladders",{title:"Ladder",url:"/ladders",templateUrl:"app/components/ladders/ladders.html",controller:"LaddersCtrl",controllerAs:"contentVm"}).state("examplethread",{title:"Example thread",url:"/exthread",templateUrl:"app/components/examplethread/examplethread.html",controller:"ThreadCtrl",controllerAs:"contentVm",resolve:{auth:["AuthResolver",function(a){return a.resolve()}]}}).state("settings",{title:"Settings",url:"/settings",templateUrl:"app/components/settings/settings.html",controller:"SettingsCtrl",controllerAs:"contentVm",resolve:{auth:["AuthResolver",function(a){return a.resolve()}],user:["UserService",function(a){return a.getUser()}]}})}angular.module("clientApp").config(a),a.$inject=["$urlRouterProvider","$stateProvider","$locationProvider"]}(),function(){"use strict";function a(a,b,c){c.get(),a.page={setTitle:function(a){this.title=a+" - Placeholder"},loading:!1},a.$on("$stateChangeStart",function(b,c,d,e,f){a.page.loading=!0}),a.$on("$stateChangeSuccess",function(b,c,d,e,f){a.page.loading=!1,a.page.setTitle(c.title||"?")}),a.$on("$stateChangeError",function(c,d,e,f,g,h){switch(a.page.loading=!1,c.preventDefault(),h){case"INVALID_USER":b.go("404");break;case"INVALID_TEAM":b.go("404");break;case"NO_LOGIN":b.go("nopermission");break;default:console.log(h),b.go("home")}})}angular.module("clientApp").run(a),a.$inject=["$rootScope","$state","Session"]}(),function(){"use strict";function a(a,b,c,d){return{resolve:function(){var e=a.defer(),f=b.$watch(function(){return d.user},function(a){angular.isDefined(a)&&(a?e.resolve(a):(e.reject(),c.go("nopermission")),f())});return e.promise}}}angular.module("clientApp").factory("AuthResolver",a),a.$inject=["$q","$rootScope","$state","Session"]}(),function(){"use strict";function a(a,b,c,d){var e={};return e.logout=function(){return a.post("/logout").then(function(a){d.destroy(),c.go("front")})},e.isAuthorized=function(a){return angular.isArray(a)||(a=[a]),e.isAuthenticated()&&-1!==a.indexOf(d.userRole)},e}angular.module("clientApp").factory("AuthService",a),a.$inject=["$http","$q","$state","Session"]}(),function(){"use strict";function a(a,b,c,d){function e(a){return j}function f(){return a.get("/api/lobbies").then(function(a){return"success"===a.data.status?(j=a.data.data,void d.$broadcast("lobbyUpdate")):"error"===a.data.status?b.reject(a.data.message):void 0})}function g(a){d.$broadcast("lobbyUpdate");for(var b=0;b<j.length;b++)if(j[b].name===a.name)return void(j[b]=a);j.push(a)}function h(a){d.$broadcast("lobbyUpdate");for(var b=0;b<j.length;b++)if(j[b].name===a.name)return void j.splice(b,1)}var i={},j=null;return i.getLobbies=e,i.refreshLobbies=f,c.on("addLobby",g),c.on("delLobby",h),i}angular.module("clientApp").factory("LobbyService",a),a.$inject=["$http","$q","$socket","$rootScope"]}(),function(){"use strict";function a(a){function b(){a.get("/api/users/me").then(function(a){"success"===a.data.status&&c(a.data.data),"error"===a.data.status&&d()})}function c(a){e.user=a}function d(){e.user=null}var e=this;e.create=c,e.destroy=d,e.get=b}angular.module("clientApp").service("Session",a),a.$inject=["$http"]}(),function(){"use strict";function a(a,b){function c(c){return c?a.get("/api/teams/"+c).then(function(a){return"success"===a.data.status?a.data.data:"error"===a.data.status?b.reject(a.data.message):void 0}):a.get("/api/users/me").then(function(a){return"success"===a.data.status?a.data.data:"error"===a.data.status?b.reject(a.data.message):void 0})}function d(c){return a.put("/api/teams",c).then(function(a){return"success"===a.data.status?a.data.data:"error"===a.data.status?b.reject(a.data.message):void 0})}var e={};return e.getTeam=c,e.updateTeam=d,e}angular.module("clientApp").factory("TeamService",a),a.$inject=["$http","$q"]}(),function(){"use strict";function a(a,b){function c(c){return c?a.get("/api/users/"+c).then(function(a){return"success"===a.data.status?a.data.data:"error"===a.data.status?b.reject(a.data.message):void 0}):a.get("/api/users/me").then(function(a){return"success"===a.data.status?a.data.data:"error"===a.data.status?b.reject(a.data.message):void 0})}function d(c){return a.put("/api/users",c).then(function(a){return"success"===a.data.status?a.data.data:"error"===a.data.status?b.reject(a.data.message):void 0})}function e(c){return a.put("/api/users",c).then(function(a){return"success"===a.data.status?a.data.data:"error"===a.data.status?b.reject(a.data.message):void 0})}var f={};return f.getUser=c,f.updateUser=d,f.saveUser=e,f}angular.module("clientApp").factory("UserService",a),a.$inject=["$http","$q"]}(),function(){"use strict";function a(a){return{scope:{},replace:!0,restrict:"A",link:function(b,c,d){c.bind("click",function(){a.logout()})}}}angular.module("clientApp").directive("logout",a),a.$inject=["AuthService"]}(),function(){"use strict";function a(){var a=/^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/;return{require:"ngModel",restrict:"",link:function(b,c,d,e){e.$validators.email=function(b){return e.$isEmpty(b)||a.test(b)}}}}angular.module("clientApp").directive("validateEmail",a),a.$inject=[]}(),function(){"use strict";function a(a,b){function c(){}var d=this;d.awesomeThings=["food","candy","not karma"],d.session=b,c()}angular.module("clientApp").controller("MainCtrl",a),a.$inject=["$scope","Session"]}(),function(){"use strict";function a(a){return{scope:{},restrict:"A",link:function(b,c,d){a.addElement(c)}}}function b(a){function b(a,b,e,f,j){h&&d(h),i=b.name;for(var k=0;k<g.length;k++){var l=g[k].attr("ui-sref");l&&l.indexOf(b.name)>=0&&c(g[k])}}function c(a){a.parent().addClass("active"),h=a}function d(a){a.parent().removeClass("active")}function e(a){var b=a.attr("ui-sref");b&&b.indexOf(i)>=0&&c(a),g.push(a)}var f={addElement:e},g=[],h=null,i=null;return a.$on("$stateChangeStart",b),f}angular.module("clientApp").directive("topbarEntry",a).factory("TopbarService",b),a.$inject=["TopbarService"],b.$inject=["$rootScope"]}(),function(){"use strict";function a(a){return{scope:{},replace:!0,restrict:"E",template:'<input type="text" class="form-control" autocomplete="off" placeholder="Search" name="search" ng-model="asyncSelected" typeahead="user as user.name for user in searchUsers($viewValue)" typeahead-template-url="app/components/topbar/usersearch-dropdown.tpl.html" typeahead-focus-first="false" typeahead-loading="loadingLocations">',link:function(b,c,d){b.searchUsers=function(b){return a.get("/api/search/"+b).then(function(a){var b=[];return angular.forEach(a.data,function(a){b.push({id:a.id,name:a.displayName,avatar:a.avatarSmall})}),b})}}}}angular.module("clientApp").directive("userSearch",a),a.$inject=["$http"]}(),function(){"use strict";function a(a){}angular.module("clientApp").controller("HomeCtrl",a),a.$inject=["$scope"]}(),function(){"use strict";function a(a){var b=this;b.test="asd",b.examplePosts=[{id:1,timestamp:0,user:{id:1,name:"atte",avatar:"https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/4a/4a5353948b7a6f0bfd0a31dee5b5b1b1b99c7632.jpg",isMod:!0},text:"DET HÄR ÄR POST1"},{id:2,timestamp:123,user:{id:1,name:"atte",avatar:"https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/4a/4a5353948b7a6f0bfd0a31dee5b5b1b1b99c7632.jpg",isMod:!0},text:"DET HÄR ÄR POST2"},{id:3,timestamp:123123,user:{id:1,name:"atte",avatar:"https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/4a/4a5353948b7a6f0bfd0a31dee5b5b1b1b99c7632.jpg",isMod:!0},text:"DET HÄR ÄR POST3"},{id:4,timestamp:234234,user:{id:1,name:"atte",avatar:"https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/4a/4a5353948b7a6f0bfd0a31dee5b5b1b1b99c7632.jpg",isMod:!0},text:"DET HÄR ÄR POST4"},{id:5,timestamp:345345,user:{id:1,name:"atte",avatar:"https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/4a/4a5353948b7a6f0bfd0a31dee5b5b1b1b99c7632.jpg",isMod:!0},text:"DET HÄR ÄR POST5"},{id:6,timestamp:456456,user:{id:1,name:"atte",avatar:"https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/4a/4a5353948b7a6f0bfd0a31dee5b5b1b1b99c7632.jpg",isMod:!0},text:"DET HÄR ÄR POST6"},{id:7,timestamp:567567,user:{id:1,name:"atte",avatar:"https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/4a/4a5353948b7a6f0bfd0a31dee5b5b1b1b99c7632.jpg",isMod:!0},text:"DET HÄR ÄR POST7"},{id:8,timestamp:678678,user:{id:1,name:"atte",avatar:"https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/4a/4a5353948b7a6f0bfd0a31dee5b5b1b1b99c7632.jpg",isMod:!0},text:"DET HÄR ÄR POST8"},{id:9,timestamp:789789,user:{id:1,name:"atte",avatar:"https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/4a/4a5353948b7a6f0bfd0a31dee5b5b1b1b99c7632.jpg",isMod:!0},text:"DET HÄR ÄR POST9"},{id:10,timestamp:1123123,user:{id:1,name:"atte",avatar:"https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/4a/4a5353948b7a6f0bfd0a31dee5b5b1b1b99c7632.jpg",isMod:!0},text:"DET HÄR ÄR POST10"},{id:11,timestamp:1234234,user:{id:1,name:"atte",avatar:"https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/4a/4a5353948b7a6f0bfd0a31dee5b5b1b1b99c7632.jpg",isMod:!0},text:"DET HÄR ÄR POST11"},{id:12,timestamp:1345345,user:{id:1,name:"atte",avatar:"https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/4a/4a5353948b7a6f0bfd0a31dee5b5b1b1b99c7632.jpg",isMod:!0},text:"DET HÄR ÄR POST12"},{id:13,timestamp:1456456,user:{id:1,name:"atte",avatar:"https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/4a/4a5353948b7a6f0bfd0a31dee5b5b1b1b99c7632.jpg",isMod:!0},text:"DET HÄR ÄR POST13"},{id:14,timestamp:1567567,user:{id:1,name:"atte",avatar:"https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/4a/4a5353948b7a6f0bfd0a31dee5b5b1b1b99c7632.jpg",isMod:!0},text:"DET HÄR ÄR POST14"},{id:15,timestamp:1678678,user:{id:1,name:"atte",avatar:"https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/4a/4a5353948b7a6f0bfd0a31dee5b5b1b1b99c7632.jpg",isMod:!0},text:"DET HÄR ÄR POST15"}]}angular.module("clientApp").controller("ThreadCtrl",a),a.$inject=["$scope"]}(),function(){"use strict";function a(){return{scope:{postdata:"="},restrict:"E",templateUrl:"app/components/examplethread/post.tpl.html",link:function(a,b,c){}}}angular.module("clientApp").directive("post",a),a.$inject=[]}(),function(){"use strict";function a(a){}angular.module("clientApp").controller("AboutCtrl",a),a.$inject=["$scope"]}(),function(){"use strict";function a(a){}angular.module("clientApp").controller("ForumsCtrl",a),a.$inject=["$scope"]}(),function(){"use strict";function a(a){var b=this;b.rowCollection=[{rank:"1",name:"Team2",wins:"7",losses:"2",rating:"1670"},{rank:"3",name:"Team1",wins:"4",losses:"4",rating:"1507"},{rank:"2",name:"Team3",wins:"2",losses:"1",rating:"1522"},{rank:"4",name:"Team4",wins:"0",losses:"0",rating:"1500"},{rank:"5",name:"Team5",wins:"0",losses:"0",rating:"1500"}]}angular.module("clientApp").controller("LaddersCtrl",a),a.$inject=["$scope"]}(),function(){"use strict";function a(a,b,c){function d(){}function e(){c.refreshLobbies()}var f=this;f.refresh=e,f.lobbyService=c,d()}angular.module("clientApp").controller("LobbiesCtrl",a),a.$inject=["$scope","$http","LobbyService"]}(),function(){"use strict";function a(a,b){function c(){}var d=this;d.user=b,c()}angular.module("clientApp").controller("ProfileCtrl",a),a.$inject=["$scope","user"]}(),function(){"use strict";function a(a,b,c,d){function e(){}function f(a,b,c){h&&d.cancel(h),g.alert={type:a,msg:b},h=d(function(){g.alert=null},c)}var g=this;g.user=c,g.alert=null,e(),g.save=function(a){var c=function(a){return b.updateUser(a)},d=function(a){return f("success","Profile updated!",2e3),b.getUser()},e=function(a){f("danger",a.message,3e3)};c(a).then(d)["catch"](e)};var h=null}angular.module("clientApp").controller("SettingsCtrl",a),a.$inject=["$scope","UserService","user","$timeout"]}(),function(){"use strict";function a(a){}angular.module("clientApp").controller("SupportCtrl",a),a.$inject=["$scope"]}(),function(){"use strict";function a(a,b){var c=this;c.team=b}angular.module("clientApp").controller("TeamCtrl",a),a.$inject=["$scope","team"]}(),angular.module("clientApp").run(["$templateCache",function(a){"use strict";a.put("app/common/templates/404.html",'<html><head> <meta http-equiv="content-type" content="text/html; charset=UTF-8"></head><body><div class="panel radius"> <h1>Not found.</h1> </div></body></html>'),a.put("app/common/templates/loading-large.html",'<div class="panel radius-bottom"> <div class="row"> <div class="sk-three-bounce"> <div class="sk-child sk-bounce1"></div> <div class="sk-child sk-bounce2"></div> <div class="sk-child sk-bounce3"></div> </div> </div> </div>'),a.put("app/common/templates/nopermission.html",'<html><head> <meta http-equiv="content-type" content="text/html; charset=UTF-8"></head><body><div class="panel radius"> <h1>This page requires authentication.</h1> </div></body></html>'),a.put("app/components/examplethread/examplethread.html",'<div class="panel radius"> <h1>Example thread</h1> <post postdata="post" ng-repeat="post in contentVm.examplePosts"></post> </div>'),a.put("app/components/examplethread/post.tpl.html",'<span> <img ng-src="{{postdata.user.avatar}}"> #{{postdata.id}} - <a ui-sref="profile({id: {{postdata.user.id}} })">{{postdata.user.name}} </a> <span ng-if="postdata.user.isMod"> [MOD] </span> </span> <br> <span>{{postdata.text}}</span> <br> <span>{{postdata.timestamp}}</span> <br> <br>'),a.put("app/components/forums/forums.html","<h1>Forums</h1>"),a.put("app/components/front/front.html",'<div id="pattern"></div> <video muted autoplay loop poster="img/intro-sample.aed890fb.jpg" id="bgvid"> <source src="/vid/intro-sample.webm" type="video/webm"> </source><source src="polina.mp4" type="video/mp4"> </source></video>'),a.put("app/components/home/home.html",""),a.put("app/components/ladders/ladders.html",'<div class="container-fluid"> <div class="col-md-2"></div> <div class="col-md-8 col-xs-12"> <table class="table" st-table="contentVm.displayedCollection" st-safe-src="contentVm.rowCollection"> <thead> <tr> <th st-sort="rank" st-delay="0" st-sort-default="true" st-skip-natural="true" width="50"> <a href="">#</a></th> <th st-sort="team" st-delay="0" st-skip-natural="true"> <a href="">Team</a></th> <th st-sort="wins" st-delay="0" st-skip-natural="true" width="90"> <a href="">Wins</a></th> <th st-sort="losses" st-delay="0" st-skip-natural="true" width="90"> <a href="">Losses</a></th> <th st-sort="rating" st-delay="0" st-skip-natural="true" width="100"> <a href="">Rating</a></th> </tr> </thead> <tbody> <tr ng-repeat="row in contentVm.displayedCollection"> <td>{{row.rank}}</td> <td>{{row.name}}</td> <td>{{row.wins}}</td> <td>{{row.losses}}</td> <td>{{row.rating}}</td> </tr> </tbody> </table> </div> <div class="col-md-2"></div> </div>'),a.put("app/components/lobbies/lobbies.html",'<div class="container-fluid"> <div class="col-md-2"></div> <div class="col-md-8 col-xs-12"> <table st-table="contentVm.displayedCollection" st-safe-src="contentVm.lobbyService.getLobbies()" class="table"> <thead> <tr> <th st-sort="name" st-delay="0" st-skip-natural="true" width="200"> <a href="">Team</a></th> <th st-sort="description" st-delay="0" st-skip-natural="true"> <a href="">Description</a></th> <th st-sort="maps" st-delay="0" st-skip-natural="true" width="200"> <a href="">Maps</a></th> <th st-sort="rating" st-delay="0" st-sort-default="reverse" st-skip-natural="true" width="100"> <a href="">Rating</a></th> <th width="100"> </th> </tr> <tr> <th> <input st-search="name" placeholder="" st-delay="50" class="form-control" type="search"> </th> <th> <input st-search="description" placeholder="" st-delay="50" class="form-control" type="search"> </th> <th> <input st-search="maps" placeholder="" st-delay="50" class="form-control" type="search"> </th> <th> <input st-search="rating" placeholder="" st-delay="50" class="form-control" type="search"> </th> <th></th> </tr> </thead> <tbody> <tr ng-repeat="row in contentVm.displayedCollection"> <td>{{row.name}}</td> <td>{{row.description}}</td> <td>{{row.maps}}</td> <td>{{row.rating}}</td> <td> <!--button.tiny(ng-click="") Go!--> </td> </tr> </tbody> </table> </div> <div class="col-md-2"></div> </div>'),a.put("app/components/profile/profile.html",'<div class="panel radius"> <div ng-if="contentVm.user"> <h1> <a href="http://steamcommunity.com/profiles/{{contentVm.user.steamId64}}">{{contentVm.user.displayName}}</a></h1><img ng-src="{{contentVm.user.avatarFull}}"> <p>{{contentVm.user.realName}}</p> <p>{{contentVm.user.countryCode}}</p> <p ng-if="!!contentVm.user.Team"> Playing in <a ui-sref="team({id : contentVm.user.Team.id})">{{contentVm.user.Team.name}} </a> </p> <p>Member since {{contentVm.user.creationDate | date:\'yyyy-M-d\' : UTC}}</p> <p>SteamId64: {{contentVm.user.steamId64}}</p> </div> <div ng-if="!contentVm.user"> <div class="content-top"> <h1>User not found!</h1> </div> </div> </div>'),a.put("app/components/settings/settings.html",'<div class="container-fluid"> <div class="row"> <div class="col-sm-4"> </div> <div class="col-sm-4"> <a href="http://steamcommunity.com/profiles/{{contentVm.user.steamId64}}"><h1>Settings</h1></a> </div> <div class="col-sm-4"> </div> </div> <div class="row"> <div class="col-sm-4"></div> <form class="col-sm-4 form-horizontal" novalidate name="testform"> <div class="form-group"> <label class="control-label col-sm-2" for="name">Alias</label> <div class="col-sm-10"> <input type="text" class="form-control" name="alias" placeholder="Alias"> </div> </div> <div class="form-group"> <label class="control-label col-sm-2" for="name">Name</label> <div class="col-sm-10"> <input type="text" class="form-control" name="name" placeholder="Name" ng-model="contentVm.user.realName"> </div> </div> <div class="form-group"> <label class="control-label col-sm-2" for="name">E-mail</label> <div class="col-sm-10"> <input type="email" class="form-control" name="email" placeholder="Enter your name" validate-email="validate-email" ng-model="contentVm.user.email"> </div> <span class="col-sm-3" ng-show="testform.email.$error.email">Email is invalid.</span> </div> <div class="form-group"> <input class="btn btn-default pull-right" ng-disabled="!testform.$valid" ng-click="contentVm.save(contentVm.user)" value="Save" type="submit"> </div> </form> <div class="col-sm-4"></div> </div> <uib-alert ng-if="!!contentVm.alert" type="contentVm.alert.type" class="fade">{{contentVm.alert.msg}} </uib-alert></div>'),a.put("app/components/support/support.html",'<div class="panel radius"> <h1>Support</h1> <p>Text here</p> </div>'),a.put("app/components/team/team.html",'<div class="panel radius"> <div ng-if="contentVm.team"> <h1> {{contentVm.team.name}} </h1> <p ng-repeat="user in contentVm.team.Users"> <img ng-src="{{user.avatarSmall}}"><a ui-sref="profile({id : user.id})">{{user.displayName}}</a></p> </div> <div ng-if="!contentVm.team"> <div class="content-top"> <h1>Team not found!</h1> </div> </div> </div>'),a.put("app/components/topbar/usersearch-dropdown.tpl.html",'<a href="profile?id={{match.model.id}}"> <img ng-src="{{match.model.avatar}}" width="28"> <span class="typeahead-entry">{{match.model.name}}</span> </a>')}]);