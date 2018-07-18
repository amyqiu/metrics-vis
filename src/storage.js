export default class Storage {
  constructor() {
  }

  // Store data for a single page in session storage
  // Allows tab containing detailed plot to get values
  storeDataPoint(point, subCategory){
    let item = {
      point: point,
      subCategory: subCategory
    };
    sessionStorage.setItem('dataPoint', JSON.stringify(item));
  }

  // Store data source, either CT or PP
  storeDataSource(dataSource){
    sessionStorage.setItem('dataSource', dataSource);
  }

  // Get previously stored data for a single page
  retrieveDataPoint(){
    return JSON.parse(sessionStorage.getItem('dataPoint'));
  }

  // Get previously stored data source, either CT or PP
  retrieveDataSource(){
    return sessionStorage.getItem('dataSource');
  }
}