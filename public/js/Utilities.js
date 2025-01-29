//Utilities.js

export const debounce= (func,delay,immediate=false)=>{
let timer;
return (...args)=>{
    const callNow = immediate && !timer;
    clearTimeout(timer);
    timer = setTimeout(() => {
        timer= null;
        if(!immediate) func(...args);
    }, delay);
if(callNow) func(...args);
};

};

export const sanitizeHTML = (str)=>{
    const parser = new DOMParser();
    const doc = parser.parseFromString(str,"text/html");
    return doc.body.textContent || '';

};

export const fetchData = async (url, options={})=>{
    try{
    const defaultHeaders={
    "Content-Type":"application/json",
    ...(options.headers||{})
    };
    const response = await fetch(url,{...options,headers:defaultHeaders});
    
    if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }
    const data = response.headers.get("content-type")?.includes("application/json")
            ? await response.json()
            : null;
    return data;
    }
    catch(error){
    console.error("Fetch Error:",error.message);
    throw error;
    }
};