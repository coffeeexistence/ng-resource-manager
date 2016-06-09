# ng-resource-manager

(Tested on Angular 1.5.5) 

Resource Manager allows web applications to speed-up loading time, 
reduce requests, and free-up backend overhead by means of Batching 
and Caching.

##How does it reduce overhead?
Resource Manager reduces overhead by doing two things, Caching and Batching.


Evey resource requested through the manager is cached for future use until 
the browser reloads, however in the next version there will be an expiration 
date for each resource cached.

Batching is simple and painless with this module, once a manager is 
initialized, `manager.find(id)` can be called multiple times from different
parts of the application, and it will all be handled in one request, 50ms 
after the first request is made. 


##Adding the module to your app
```javascript
angular.module('app', ['ng-resource-manager'])
```

##Creating a Resource Manager
To create a manager, an object must be passed into `ResourceManager.create()`
with two requisites.
* Name: The name of the resource being managed, don't make multiple managers for 
same resource
* httpBatchRequest: A function that takes in an array of IDs and makes an 
$http request to the backend. Please make sure that the backend returns a JSON
object with the keys being the IDs of the resources requested.

```javascript
  var userManager = ResourceManger.create({
    name: 'users', 
    httpBatchRequest: function(idArray) {
      return $http({
          method: 'GET',
          url: path,
          params: {
            ids: JSON.stringify(idArray)
          }
      });
    }
  });
```

##Using Resource Managers
Simple and easy.

```javascript
  users.show = function(id) { return userManager.find(id) };
```

#Contact
[John Anthony Rivera](johnanthony-dev.com)

johnanthony.dev@gmail.com
