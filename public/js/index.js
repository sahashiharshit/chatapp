document
  .getElementById("signinform")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phoneno = document.getElementById("phoneno").value.trim();
    const password = document.getElementById("password").value.trim();
  
    try {
      const response = await fetch(
        "http://localhost:3000/chatapp/auth/create-new-user",
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json",
            },
          body: JSON.stringify({ name, email, phoneno, password }),
        }
      );
      const result = await response.json();
      
      if(response.ok){
        alert('Signup Successfull');
        document.getElementById('name').value='';
        document.getElementById('email').value='';
        document.getElementById('phoneno').value='';
        document.getElementById('password').value='';
        
      }
      else{
        alert(result.message||"Signup Failed");
      }
    } catch (error) {
      console.error("Error:",error);
      alert("An error occurred. Please try again later.");
    }
  });
