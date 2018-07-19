export default class Storage {
  constructor() {
  }

  // Store data for a single page in session storage
  // Allows tab containing detailed plot to get values
  storeData(page, subCategory){
    let data = {
      page: page,
      subCategory: subCategory
    };
    sessionStorage.setItem('data', JSON.stringify(data));
  }

  // Store data source, either CT or PP
  storeDataSource(dataSource){
    sessionStorage.setItem('dataSource', dataSource);
  }

  // Get previously stored data for a single page
  retrieveData(){
    return JSON.parse(sessionStorage.getItem('data'));
  }

  // Get previously stored data source, either CT or PP
  retrieveDataSource(){
    return sessionStorage.getItem('dataSource');
  }
}