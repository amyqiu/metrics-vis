// Store data for a single page in session storage
// Allows tab containing detailed plot to get values
function StoreDataPoint(page, data){
  let item = {
    page: page,
    data: data
  };
  sessionStorage.setItem('graph_data', JSON.stringify(item));
}

// Store data source, either CT or PP
function StoreDataSource(data_source){
  sessionStorage.setItem('data_source', data_source);
}

// Get previously stored data for a single page
function RetrieveDataPoint(){
  return JSON.parse(sessionStorage.getItem('graph_data'));
}

// Get previously stored data source, either CT or PP
function RetrieveDataSource(){
  return sessionStorage.getItem('data_source');
}

export{
  StoreDataPoint,
  StoreDataSource,
  RetrieveDataPoint,
  RetrieveDataSource
}