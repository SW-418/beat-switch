
class NoMappingsError extends Error {
    constructor() {
      super('No mappings provided');
    }
  }
  
export default NoMappingsError;
