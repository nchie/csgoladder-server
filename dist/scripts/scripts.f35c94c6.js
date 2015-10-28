!function(){"use strict";var a=angular.module("socket.io",[]);a.provider("$socket",function(){function a(a,b,c){if(typeof b!==c)throw new TypeError("'"+a+"' must be of type '"+c+"'");d[a]=b}function b(a){var b=io(c,d);return{on:function(c,d){b.on(c,function(){var c=arguments;a.$apply(function(){d.apply(b,c)})})},off:function(a,c){"function"==typeof c?b.removeListener(a,c):b.removeAllListeners(a)},emit:function(c,d,e){"function"==typeof e?b.emit(c,d,function(){var c=arguments;a.$apply(function(){e.apply(b,c)})}):b.emit(c,d)}}}var c="",d={};this.setResource=function(b){a("resource",b,"string")},this.setConnectTimeout=function(b){a("connect timeout",b,"number")},this.setTryMultipleTransports=function(b){a("try multiple transports",b,"boolean")},this.setReconnect=function(b){a("reconnect",b,"boolean")},this.setReconnectionDelay=function(b){a("reconnection delay",b,"number")},this.setReconnectionLimit=function(b){a("reconnection limit",b,"number")},this.setMaxReconnectionAttempts=function(b){a("max reconnection attempts",b,"number")},this.setSyncDisconnectOnUnload=function(b){a("sync disconnect on unload",b,"boolean")},this.setAutoConnect=function(b){a("auto connect",b,"boolean")},this.setFlashPolicyPort=function(b){a("flash policy port",b,"number")},this.setForceNewConnection=function(b){a("force new connection",b,"boolean")},this.setConnectionUrl=function(a){if("string"!=typeof a)throw new TypeError("setConnectionUrl error: value must be of type 'string'");c=a},this.$get=b,b.$inject=["$rootScope"]})}(),function(){"use strict";angular.module("clientApp",["ngAnimate","mm.foundation","ui.router","smart-table","socket.io"])}(),function(){"use strict";function a(a,b,c){a.otherwise("/"),c.html5Mode(!0),b.state("home",{title:"Home",url:"/",templateUrl:"views/home.html",controller:"HomeCtrl",controllerAs:"contentVm",data:{}}).state("nopermission",{title:"No permission",url:"/nopermission",templateUrl:"views/nopermission.html"}).state("404",{title:"404 Not found",url:"/404",templateUrl:"views/404.html"}).state("lobbies",{title:"Lobbies",url:"/lobbies",templateUrl:"views/lobbies.html",controller:"LobbiesCtrl",controllerAs:"contentVm",data:{},resolve:{auth:["AuthResolver",function(a){return a.resolve()}],lobbies:["$stateParams","LobbyService",function(a,b){return b.refreshLobbies()}]}}).state("teams",{title:"Teams",url:"/teams",templateUrl:"views/teams.html",controller:"TeamsCtrl",controllerAs:"contentVm",data:{}}).state("forums",{title:"Forums",url:"/forums",templateUrl:"views/forums.html",controller:"ForumsCtrl",controllerAs:"contentVm",data:{}}).state("support",{title:"Support",url:"/support",templateUrl:"views/support.html",controller:"SupportCtrl",controllerAs:"contentVm",data:{}}).state("about",{title:"About",url:"/about",templateUrl:"views/about.html",controller:"AboutCtrl",controllerAs:"contentVm",data:{}}).state("profile",{title:"Profile",url:"/profile?id",templateUrl:"views/profile.html",controller:"ProfileCtrl",controllerAs:"contentVm",resolve:{auth:["AuthResolver",function(a){return a.resolve()}],user:["$stateParams","UserService",function(a,b){return b.getUser(a.id)}]}}).state("team",{title:"Team",url:"/team?id",templateUrl:"views/team.html",controller:"TeamCtrl",controllerAs:"contentVm",resolve:{auth:["AuthResolver",function(a){return a.resolve()}],team:["$stateParams","TeamService",function(a,b){return b.getTeam(a.id)}]}}).state("ladders",{title:"Ladder",url:"/ladders",templateUrl:"views/ladders.html",controller:"LaddersCtrl",controllerAs:"contentVm",resolve:{auth:["AuthResolver",function(a){return a.resolve()}]}}).state("loading",{title:"Loading",url:"/loading",template:"loading",controller:"LaddersCtrl",resolve:{auth:["AuthResolver",function(a){return a.resolve()}]}}).state("settings",{title:"Settings",url:"/settings",templateUrl:"views/settings.html",controller:"SettingsCtrl",controllerAs:"contentVm",resolve:{auth:["AuthResolver",function(a){return a.resolve()}],user:["UserService",function(a){return a.getUser()}]}})}angular.module("clientApp").config(a),a.$inject=["$urlRouterProvider","$stateProvider","$locationProvider"]}(),function(){"use strict";function a(a,b,c,d,e){e.get(),a.page={setTitle:function(a){this.title=a+" - Placeholder"},loading:!1},a.$on("$stateChangeStart",function(b,c,d,e,f){a.page.loading=!0}),a.$on("$stateChangeSuccess",function(b,c,d,e,f){a.page.loading=!1,a.page.setTitle(c.title||"?")}),a.$on("$stateChangeError",function(c,d,e,f,g,h){switch(a.page.loading=!1,c.preventDefault(),h){case"INVALID_USER":b.go("404");break;case"INVALID_TEAM":b.go("404");break;case"NO_LOGIN":b.go("nopermission");break;default:console.log(h),b.go("home")}})}angular.module("clientApp").run(a),a.$inject=["$rootScope","$state","UserService","AuthService","Session"]}(),function(){"use strict";function a(a,b,c,d){return{resolve:function(){var e=a.defer(),f=b.$watch(function(){return d.user},function(a){angular.isDefined(a)&&(a?e.resolve(a):(e.reject(),c.go("nopermission")),f())});return e.promise}}}angular.module("clientApp").factory("AuthResolver",a),a.$inject=["$q","$rootScope","$state","Session"]}(),function(){"use strict";function a(a,b,c,d){var e={};return e.logout=function(){return a.post("/logout").then(function(a){d.destroy(),c.go("home")})},e.isAuthorized=function(a){return angular.isArray(a)||(a=[a]),e.isAuthenticated()&&-1!==a.indexOf(d.userRole)},e}angular.module("clientApp").factory("AuthService",a),a.$inject=["$http","$q","$state","Session"]}(),function(){"use strict";function a(a,b,c,d){function e(a){return j}function f(){return a.get("/api/lobbies").then(function(a){return"success"===a.data.status?(j=a.data.data,void d.$broadcast("lobbyUpdate")):"error"===a.data.status?b.reject(a.data.message):void 0})}function g(a){d.$broadcast("lobbyUpdate");for(var b=0;b<j.length;b++)if(j[b].name===a.name)return void(j[b]=a);j.push(a)}function h(a){d.$broadcast("lobbyUpdate");for(var b=0;b<j.length;b++)if(j[b].name===a.name)return void j.splice(b,1)}var i={},j=null;return i.getLobbies=e,i.refreshLobbies=f,c.on("addLobby",g),c.on("delLobby",h),i}angular.module("clientApp").factory("LobbyService",a),a.$inject=["$http","$q","$socket","$rootScope"]}(),function(){"use strict";function a(a){function b(){a.get("/api/users/me").then(function(a){"success"===a.data.status&&c(a.data.data),"error"===a.data.status&&d()})}function c(a){e.user=a}function d(){e.user=null}var e=this;e.create=c,e.destroy=d,e.get=b}angular.module("clientApp").service("Session",a),a.$inject=["$http"]}(),function(){"use strict";function a(a,b){function c(c){return c?a.get("/api/teams/"+c).then(function(a){return"success"===a.data.status?a.data.data:"error"===a.data.status?b.reject(a.data.message):void 0}):a.get("/api/users/me").then(function(a){return"success"===a.data.status?a.data.data:"error"===a.data.status?b.reject(a.data.message):void 0})}function d(c){return a.put("/api/teams",c).then(function(a){return"success"===a.data.status?a.data.data:"error"===a.data.status?b.reject(a.data.message):void 0})}var e={};return e.getTeam=c,e.updateTeam=d,e}angular.module("clientApp").factory("TeamService",a),a.$inject=["$http","$q"]}(),function(){"use strict";function a(a,b){function c(c){return c?a.get("/api/users/"+c).then(function(a){return"success"===a.data.status?a.data.data:"error"===a.data.status?b.reject(a.data.message):void 0}):a.get("/api/users/me").then(function(a){return"success"===a.data.status?a.data.data:"error"===a.data.status?b.reject(a.data.message):void 0})}function d(c){return a.put("/api/users",c).then(function(a){return"success"===a.data.status?a.data.data:"error"===a.data.status?b.reject(a.data.message):void 0})}function e(c){return a.put("/api/users",c).then(function(a){return"success"===a.data.status?a.data.data:"error"===a.data.status?b.reject(a.data.message):void 0})}var f={};return f.getUser=c,f.updateUser=d,f.saveUser=e,f}angular.module("clientApp").factory("UserService",a),a.$inject=["$http","$q"]}(),function(){"use strict";function a(a){return{scope:{},replace:!0,restrict:"A",link:function(b,c,d){c.bind("click",function(){a.logout()})}}}angular.module("clientApp").directive("logout",a),a.$inject=["AuthService"]}(),function(){"use strict";function a(){var a=/^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/;return{require:"ngModel",restrict:"",link:function(b,c,d,e){e.$validators.email=function(b){return e.$isEmpty(b)||a.test(b)}}}}angular.module("clientApp").directive("validateEmail",a),a.$inject=[]}(),function(){"use strict";function a(a){return{scope:{},replace:!0,restrict:"E",template:'<input type="text" ng-model="asyncSelected" placeholder="Search" typeahead="user as user.name for user in searchUsers($viewValue)" typeahead-template-url="templates/topbar-typeahead.html" typeahead-loading="loadingLocations" class="typeahead form-control">',link:function(b,c,d){b.searchUsers=function(b){return a.get("/api/search/"+b).then(function(a){var b=[];return angular.forEach(a.data,function(a){b.push({id:a.id,name:a.displayName,avatar:a.avatarSmall})}),b})}}}}angular.module("clientApp").directive("userSearch",a),a.$inject=["$http"]}(),function(){"use strict";function a(a){}angular.module("clientApp").controller("AboutCtrl",a),a.$inject=["$scope"]}(),function(){"use strict";function a(a){}angular.module("clientApp").controller("ForumsCtrl",a),a.$inject=["$scope"]}(),function(){"use strict";function a(a){}angular.module("clientApp").controller("HomeCtrl",a),a.$inject=["$scope"]}(),function(){"use strict";function a(a){var b=this;b.rowCollection=[{rank:"1",name:"Team2",wins:"7",losses:"2",rating:"1670"},{rank:"3",name:"Team1",wins:"4",losses:"4",rating:"1507"},{rank:"2",name:"Team3",wins:"2",losses:"1",rating:"1522"},{rank:"4",name:"Team4",wins:"0",losses:"0",rating:"1500"},{rank:"5",name:"Team5",wins:"0",losses:"0",rating:"1500"}]}angular.module("clientApp").controller("LaddersCtrl",a),a.$inject=["$scope"]}(),function(){"use strict";function a(a,b,c){function d(){}function e(){c.refreshLobbies()}var f=this;f.refresh=e,f.lobbyService=c,d()}angular.module("clientApp").controller("LobbiesCtrl",a),a.$inject=["$scope","$http","LobbyService"]}(),function(){"use strict";function a(a,b){function c(){}var d=this;d.awesomeThings=["food","candy","not karma"],d.session=b,c()}angular.module("clientApp").controller("MainCtrl",a),a.$inject=["$scope","Session"]}(),function(){"use strict";function a(a,b){function c(){}var d=this;d.user=b,c()}angular.module("clientApp").controller("ProfileCtrl",a),a.$inject=["$scope","user"]}(),function(){"use strict";function a(a,b,c,d){function e(){}function f(a,b,c){h&&d.cancel(h),g.alert={type:a,msg:b},h=d(function(){g.alert=null},c)}var g=this;g.user=c,g.alert=null,e(),g.save=function(a){var c=function(a){return b.updateUser(a)},d=function(a){return f("success","Profile updated!",2e3),b.getUser()},e=function(a){f("danger",a.message,3e3)};c(a).then(d)["catch"](e)};var h=null}angular.module("clientApp").controller("SettingsCtrl",a),a.$inject=["$scope","UserService","user","$timeout"]}(),function(){"use strict";function a(a){}angular.module("clientApp").controller("SupportCtrl",a),a.$inject=["$scope"]}(),function(){"use strict";function a(a,b){var c=this;c.team=b}angular.module("clientApp").controller("TeamCtrl",a),a.$inject=["$scope","team"]}(),function(){"use strict";function a(a,b){a.getClass=function(a){return b.path().substr(0,a.length)===a?""===a?"":"/"===a&&"/"===b.path()?"active":"/"===a?"":"active":""}}angular.module("clientApp").controller("TopbarCtrl",a),a.$inject=["$scope","$location"]}(),angular.module("clientApp").run(["$templateCache",function(a){"use strict";a.put("views/404.html",'<html><head> <meta http-equiv="content-type" content="text/html; charset=UTF-8"></head><body><div class="panel radius"> <h1>Not found.</h1> </div></body></html>'),a.put("views/forums.html",'<html><head> <meta http-equiv="content-type" content="text/html; charset=UTF-8"></head><body><div class="panel radius"> <h1>Forums</h1> </div></body></html>'),a.put("views/home.html",'<div class="ng-scope" id="featured"> <img alt="slide image" src="/img/frontpage1.de668378.jpg"> <!--http://placehold.it/1000x450&text=Blabla--> </div> <div class="panel radius-bottom ng-scope"> <div class="row"> <div class="large-6 small-6 columns"> <h4>Header</h4> <hr> <h5 class="subheader">Risus ligula, aliquam nec fermentum vitae, sollicitudin eget urna. Donec dignissim nibh fermentum odio ornare sagittis.</h5> </div> <div class="large-6 small-6 columns"> <p>Suspendisse ultrices ornare tempor. Aenean eget ultricies libero. Phasellus non ipsum eros. Vivamus at dignissim massa. Aenean dolor libero, blandit quis interdum et, malesuada nec ligula. Nullam erat erat, eleifend sed pulvinar ac. Suspendisse ultrices ornare tempor. Aenean eget ultricies libero.</p> </div> </div> </div>'),a.put("views/ladders.html",'<html><head> <meta http-equiv="content-type" content="text/html; charset=UTF-8"></head><body><div class="panel radius"> <table st-table="contentVm.displayedCollection" st-safe-src="contentVm.rowCollection" class="medium-12 hide-for-small"> <thead> <tr> <th st-sort="rank" st-delay="0" st-sort-default="true" st-skip-natural="true" width="50"> <a href="">#</a></th> <th st-sort="team" st-delay="0" st-skip-natural="true"> <a href="">Team</a></th> <th st-sort="wins" st-delay="0" st-skip-natural="true" width="90"> <a href="">Wins</a></th> <th st-sort="losses" st-delay="0" st-skip-natural="true" width="90"> <a href="">Losses</a></th> <th st-sort="rating" st-delay="0" st-skip-natural="true" width="100"> <a href="">Rating</a></th> </tr> </thead> <tbody> <tr ng-repeat="row in contentVm.displayedCollection"> <td>{{row.rank}}</td> <td>{{row.name}}</td> <td>{{row.wins}}</td> <td>{{row.losses}}</td> <td>{{row.rating}}</td> </tr> </tbody> </table> </div></body></html>'),a.put("views/lobbies.html",'<html><head> <meta http-equiv="content-type" content="text/html; charset=UTF-8"></head><body><div class="panel radius"> <table st-table="contentVm.displayedCollection" st-safe-src="contentVm.lobbyService.getLobbies()" class="medium-12 hide-for-small"> <thead> <tr> <th st-sort="name" st-delay="0" st-skip-natural="true" width="200"> <a href="">Team</a></th> <th st-sort="description" st-delay="0" st-skip-natural="true"> <a href="">Description</a></th> <th st-sort="maps" st-delay="0" st-skip-natural="true" width="200"> <a href="">Maps</a></th> <th st-sort="rating" st-delay="0" st-sort-default="reverse" st-skip-natural="true" width="100"> <a href="">Rating</a></th> <th width="100"> </th> </tr> <tr> <th> <input st-search="name" placeholder="" st-delay="50" class="form-control" type="search"> </th> <th> <input st-search="description" placeholder="" st-delay="50" class="form-control" type="search"> </th> <th> <input st-search="maps" placeholder="" st-delay="50" class="form-control" type="search"> </th> <th> <input st-search="rating" placeholder="" st-delay="50" class="form-control" type="search"> </th> <th></th> </tr> </thead> <tbody> <tr ng-repeat="row in contentVm.displayedCollection"> <td>{{row.name}}</td> <td>{{row.description}}</td> <td>{{row.maps}}</td> <td>{{row.rating}}</td> <td> <!--button.tiny(ng-click="") Go!--> </td> </tr> </tbody> </table> </div></body></html>'),a.put("views/main.html",'<div class="jumbotron"> <h1>\'Allo, \'Allo!</h1> <p class="lead"> <img src="images/yeoman.png" alt="I\'m Yeoman"><br> Always a pleasure scaffolding your apps. </p> <p><a class="btn btn-lg btn-success" ng-href="#/">Splendid!<span class="glyphicon glyphicon-ok"></span></a></p> </div> <div class="row marketing"> <h4>HTML5 Boilerplate</h4> <p> HTML5 Boilerplate is a professional front-end template for building fast, robust, and adaptable web apps or sites. </p> <h4>Angular</h4> <p> AngularJS is a toolset for building the framework most suited to your application development. </p> <h4>Karma</h4> <p>Spectacular Test Runner for JavaScript.</p> </div>'),a.put("views/nopermission.html",'<html><head> <meta http-equiv="content-type" content="text/html; charset=UTF-8"></head><body><div class="panel radius"> <h1>This page requires authentication.</h1> </div></body></html>'),a.put("views/profile.html",'<div class="panel radius"> <div ng-if="contentVm.user"> <h1> <a href="http://steamcommunity.com/profiles/{{contentVm.user.steamId64}}">{{contentVm.user.displayName}}</a></h1><img ng-src="{{contentVm.user.avatarFull}}"> <p>{{contentVm.user.realName}}</p> <p>{{contentVm.user.countryCode}}</p> <p ng-if="!!contentVm.user.Team"> Playing in <a ui-sref="team({id : contentVm.user.Team.id})">{{contentVm.user.Team.name}} </a> </p> <p>Member since {{contentVm.user.creationDate | date:\'yyyy-M-d\' : UTC}}</p> <p>SteamId64: {{contentVm.user.steamId64}}</p> </div> <div ng-if="!contentVm.user"> <div class="content-top"> <h1>User not found!</h1> </div> </div> </div>'),a.put("views/settings.html",'<html><head> <meta http-equiv="content-type" content="text/html; charset=UTF-8"></head><body><div ng-if="contentVm.user" class="panel radius"><a href="http://steamcommunity.com/profiles/%7B%7BcontentVm.user.steamId64%7D%7D"> <h1>Settings</h1></a> <alert ng-if="!!contentVm.alert" type="contentVm.alert.type" class="fade">{{contentVm.alert.msg}}</alert> <form novalidate name="testform" class="simple-form">Realname: <input ng-model="contentVm.user.realName" type="text"><br>E-mail: <input name="email" validate-email="validate-email" ng-model="contentVm.user.email" type="email"><span ng-show="testform.email.$error.email">Email is invalid.</span><br>Country: <input ng-model="contentVm.user.countryCode" type="text"><br> <input ng-disabled="!testform.$valid" ng-click="contentVm.save(contentVm.user)" value="Save" type="submit"> </form> <p ng-bind="contentVm.result"></p> </div> <div ng-if="!contentVm.user"> <div class="content-top"> <h1>User not found!</h1> </div> </div></body></html>'),a.put("views/support.html",'<div class="panel radius"> <h1>Support</h1> <p>Text here</p> </div>'),a.put("views/team.html",'<html><head> <meta http-equiv="content-type" content="text/html; charset=UTF-8"></head><body><div class="panel radius"> <div ng-if="contentVm.team"> <h1> {{contentVm.team.name}} </h1> <p ng-repeat="user in contentVm.team.Users"> <img ng-src="{{user.avatarSmall}}"><a ui-sref="profile({id : user.id})">{{user.displayName}}</a></p> </div> <div ng-if="!contentVm.team"> <div class="content-top"> <h1>Team not found!</h1> </div> </div> </div></body></html>'),a.put("templates/loading-large.html",'<div class="panel radius-bottom"> <div class="row"> <div class="sk-three-bounce"> <div class="sk-child sk-bounce1"></div> <div class="sk-child sk-bounce2"></div> <div class="sk-child sk-bounce3"></div> </div> </div> </div>'),a.put("templates/topbar-typeahead.html",'<a ui-sref="profile({id: {{match.model.id}} })"> <img ng-src="{{match.model.avatar}}" width="28"> <span class="typeahead-entry" bind-html-unsafe="match.label | typeaheadHighlight:query"></span> </a>')}]);