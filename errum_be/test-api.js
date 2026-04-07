const axios = require('axios');
async function test() {
  try {
    const response = await axios.get('https://backend2.errumbd.com/api/employees?store_id=1&is_active=true', {
      headers: {
        Authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2JhY2tlbmQyLmVycnVtYmQuY29tL2FwaS9sb2dpbiIsImlhdCI6MTc3NTUwOTc2MywiZXhwIjoxNzc1NTEzMzYzLCJuYmYiOjE3NzU1MDk3NjMsImp0aSI6InFSVHk1bGtQbFNJdTliMmkiLCJzdWIiOiIxIiwicHJ2IjoiMzI5NjNhNjA2YzJmMTcxZjFjMTQzMzFlNzY5NzY2Y2Q1OTEyZWQxNSJ9.e2KgZdJENPJRwlb1-pPQm08tSTFly7JB-ZXsv5_URs0'
      }
    });
    const result = response.data;
    console.log("SUCCESS:", result.success);
    console.log("HAS_DATA:", !!result.data);
    console.log("HAS_INNER_DATA:", !!result.data?.data);
    console.log("IS_INNER_ARRAY:", Array.isArray(result.data?.data));
    
    let empData;
    if (result.data && result.data.data && Array.isArray(result.data.data)) {
        empData = result.data.data;
    } else {
        empData = result.data || [];
    }
    console.log("empData length:", empData.length);
    console.log("Type of empData:", Array.isArray(empData) ? "array" : typeof empData);
    
  } catch (error) {
    console.error(error.toString());
  }
}
test();
