export default class Storage {
  constructor() {
  }

  // Store data for a single page in session storage
  // Allows tab containing detailed plot to get values
  StoreDataPoint(point, sub_category){
    let item = {
      point: point,
      sub_category: sub_category
    };
    sessionStorage.setItem('data_point', JSON.stringify(item));
  }

  // Store data source, either CT or PP
  StoreDataSource(data_source){
    sessionStorage.setItem('data_source', data_source);
  }

  // Get previously stored data for a single page
  RetrieveDataPoint(){
    return JSON.parse(sessionStorage.getItem('data_point'));
  }

  // Get previously stored data source, either CT or PP
  RetrieveDataSource(){
    return sessionStorage.getItem('data_source');
  }
}