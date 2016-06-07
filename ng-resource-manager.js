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
                    return service.exists(resourceType, id);  
                },
                fetch: function(id) {
                    if(service.exists(resourceType, id)) {
                        return cache[resourceType][id];
                    }
                    return false;
                },
                store: function(id, resource) {
                    resourceTypeCache[id] = resource;
                }, 
                merge: function(resourceBatch) {
                    angular.merge(resourceTypeCache, resourceBatch);
                }
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
            var name = collectorParams.name;
            var httpBatchRequest = collectorParams.httpBatchRequest;
            var cache = collectorParams.cache;
            
            var pendingRequests = {};
            var requestPending = false;
            
            var assimilate = function (newBatch) { // https://upload.wikimedia.org/wikipedia/en/a/a1/Picard_as_Locutus.jpg
                cache.merge(newBatch);
                for (var id in newBatch) {
                    var promise = pendingRequests[id];
                    promise.resolve( cache.fetch(id) );
                    delete pendingRequests[id];
                }
            };

            var fetch = function () {
                var idBatch = Object.keys(pendingRequests);
                httpBatchRequest(idBatch).then(function(res){
                    assimilate(res.data, pendingRequests);
                });
            };

            var pendRequest = function () {
                requestPending = true;
                $timeout(function(){
                    fetch();
                    requestPending = false;
                }, 50);
            };

            var addToQueue = function (id, promise) {
                pendingRequests[id] = promise;
                if (!requestPending) { pendRequest(); }
            };
            
            
            return {
                find: function (id) {
                    var q = $q.defer();

                    if (cache.exists(id)) { q.resolve(cache.fetch(id)) }
                    else { addToQueue(id, q) }

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
            var cache = Cache.create('users');
  
            var collector = RequestCollector.create({
                name: params.name, 
                httpBatchRequest: params.httpBatchRequest, 
                cache: cache
            });
            
            return {
                find: collector.find
            };
        };
        
    }]);
    
;