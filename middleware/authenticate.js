export const isAuthenticated = (req,res,next)=>{
    console.log('Session data:', req.session.data);
if(req.session && req.session.user){
    
next();
}else{
    res.status(401).json({message:"Unauthorized. Please log in"});
}
};