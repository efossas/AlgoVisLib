var AVTracerManagerUtil = {
  refineByType: (item) => {
    switch (typeof(item)) {
      case 'number':
        return item === Infinity ? '∞' : item;
      case 'boolean':
        return item ? 'T' : 'F';
      default:
        return item === '' ? ' ' : item;
    }
  },
  fromJSON: (obj) => {
    return JSON.parse(obj, (key, value) => {
      return value === 'Infinity' ? Infinity : value;
    });
  },
  toJSON: (obj) => {
    return JSON.stringify(obj, (key, value) => {
      return value === Infinity ? 'Infinity' : value;
    });
  }
}

