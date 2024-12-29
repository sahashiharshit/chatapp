class SingUp{

    constructor(){
    
    }
    navigate(page){
        window.location.href= page;
        }
    async submitSignup(name, email, phoneno, password) {
          
        if (!name || !email || !phoneno || !password) {
          alert("All fields are required.");
          return;
        }
        try {
          const response = await fetch(
            "http://localhost:3000/chatapp/auth/create-new-user",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ name, email, phoneno, password }),
            }
          );
          const result = await response.json();

          if (response.ok) {
            alert("Signup Successfull");
            Login.navigate('index.html');
          } else {
            alert(result.message || "Signup Failed");
          }
        } catch (error) {
          console.error("Error:", error);
          alert("An error occurred. Please try again later.");
        }
      }
}
document.addEventListener('DOMContentLoaded',()=>{
 new SingUp();
document.getElementById('signinform').addEventListener('submit',(e)=>{
    e.preventDefault();
    const name = e.target.elements.name.value;
    const email =e.target.elements.email.value;
    const phoneno = e.target.elements.phoneno.value;
    const password = e.target.elements.password.value;
    this.submitSignup(name,email,phoneno,password);
  });

});