angular.module('ng-resource-manager', [])
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
        }]);