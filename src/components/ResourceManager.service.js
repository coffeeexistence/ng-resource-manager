angular.module('ng-resource-manager', [])
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