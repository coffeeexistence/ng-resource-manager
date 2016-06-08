# ng-resource-manager


##Adding the module to your app
```javascript
angular.module('app', ['ng-resource-manager'])
```

##Creating a Resource Manager
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

```javascript
  users.show = function(id) { return userManager.find(id) };
```
