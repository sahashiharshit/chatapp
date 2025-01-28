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
    const response = await fetch(url,options);
    
    if(!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    const data= await response.json();
    return data;
    }
    catch(error){
    console.error("Fetch Error:",error);
    throw error;
    }
};