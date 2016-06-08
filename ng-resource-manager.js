angular.module('ng-resource-manager', [])
    .constant('MODULE_VERSION', '0.0.1')
    
    .service('ngrm.Cache', [
    function (){
        var service = this;
        var cache = {};
        
        service.create = function(resourceType) {
            var resourceTypeCache = service.findOrCreateType(resourceType);
            return {
                exists: function(id) {
                    if (service.exists(resourceType, id)){
                        console.log(resourceType+' '+id+' already exists.');
                        return true;
                    }
                    
                    return false;  
                },
                fetch: function(id) {
                    if(service.exists(resourceType, id)) {
                         console.log(resourceType+' '+id+' - fetched.');
                        return cache[resourceType][id];
                    }
                    console.log(resourceType+' '+id+' - not fetched.');
                    return false;
                },
                store: function(id, resource) {
                    console.log(resourceType+' '+resource+' - stored.');
                    resourceTypeCache[id] = resource;
                }, 
                merge: function(resourceBatch) {
                    console.log('merge completed');
                    angular.merge(resourceTypeCache, resourceBatch);
                },
                
            };
        };
        
        service.findOrCreateType = function(resourceType) {
            if(!service.resourceTypeExists(resourceType)) { cache[resourceType] = {}; }
            return cache[resourceType];
        };

        service.resourceTypeExists = function(resourceType) {
            return (typeof cache[resourceType] !== "undefined");
        };

        service.exists = function(resourceType, id) {
            if (service.resourceTypeExists(resourceType)) {
                if (typeof cache[resourceType][id] !== "undefined") {
                    return true;
                }
            }
            return false;
        };
    }])
    
    
    .service('ngrm.RequestCollector', [
    '$q', 
    '$timeout', 
    function ($q, $timeout){
        var service = this;
        
        
        
        service.create = function(collectorParams) {
            var httpBatchRequest = collectorParams.httpBatchRequest;
            var cache = collectorParams.cache;
            
            var availableManager;
            
            var createManager = function(){
                var pendingRequests = {};
                
                var assimilate = function (newBatch) { // https://upload.wikimedia.org/wikipedia/en/a/a1/Picard_as_Locutus.jpg
                    cache.merge(newBatch);
                    console.log(cache);
                    for (var id in newBatch) {
                        var promises = pendingRequests[id];
                            if (promises) {
                                promises.forEach(function (promise) {
                                    promise.resolve( cache.fetch(id) );
                                });
                            } else { console.log('weird, could not fetch '+promises +' which had an id of '+id) }
                            delete pendingRequests[id];
                    }
                };

                var fetch = function () {
                    availableManager = false; // Makes sure that nothing is added to this batch after this
                    var idBatch = Object.keys(pendingRequests);
                    httpBatchRequest(idBatch).then(function(res){
                        assimilate(res.data, pendingRequests);
                    });
                };

                return {
                    start: function () {
                        availableManager = this;
                        $timeout(function(){
                            fetch();
                        }, 50);
                    }, 
                    add: function(id, promise) {
                        if (pendingRequests[id]){
                            pendingRequests[id].push(promise);
                        } else {
                            pendingRequests[id] = [promise];
                        }
                    }
                }; 
            };  
            

            var addToQueue = function (id, promise) {
                if (availableManager) { 
                    availableManager.add(id, promise);
                } else {
                    var manager = createManager();
                    manager.start();
                    manager.add(id,promise);
                }
            };
            
            
            return {
                find: function (id) {
                    var q = $q.defer();

                    if (cache.exists(id)) { q.resolve(cache.fetch(id)) }
                    else { addToQueue(id, q); console.log('adding to queue: '+id) }

                    return q.promise;
                }
            };
        };
    }])
    
    .service('ResourceManager', [
    'ngrm.Cache',
    'ngrm.RequestCollector',
    function(Cache, RequestCollector){
        var service = this;
        
        service.create = function(params){
            var cache = Cache.create(params.name);
  
            var collector = RequestCollector.create({
                httpBatchRequest: params.httpBatchRequest, 
                cache: cache
            });
            
            return {
                find: collector.find
            };
        };
        
    }]);
    
;