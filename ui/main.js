var submit = document.getElementById('submit-btn');
submit.onclick = function(){
    var request = new XMLHttpRequest();
    
    request.onreadystatechange = function(){
        if(request.readyState === XMLHttpRequest.DONE){
            if(request.status === 200){
               console.log('user logged in');
               alert('Logged in successfully');
                }else if(request.status===403){
                    alert('username/password is incorrect');
                }else if(request.status===500){
                    alert('Something went wrong');
                }
            }
        };
        
        var username = document.getElementbyId('username').value;
        var password = document.getElementbyId('password').value;
        console.log(username);
        console.log(password);
        request.open('POST','http://sangeethshiv36.imad.hasura-app.io/login',true);
        request.setRequestHeader('Content-Type','application/json');
        request.send(JSON.stringify({username: username, password: password}));
};
