getCookie = (name) => {
	var value = "; " + document.cookie;
	var parts = value.split("; " + name + "=");
	if (parts.length == 2) return parts.pop().split(";").shift();
};

status = (response) =>{
    if (response.status >= 200 && response.status < 300) {
      return Promise.resolve(response)
    } else {
      return Promise.reject(new Error(response.statusText))
    }
};
  
json = (response) => {
    return response.json()
};

const csrftoken = getCookie('csrftoken');


var logout_link_button = document.createElement('a');
logout_link_button.innerHTML = 'LOGOUT';
logout_link_button.href = djsa_logout_url;
logout_link_button.classList.add("djsuperadmin-logout");
document.body.appendChild(logout_link_button);


var classname = document.getElementsByClassName("djsuperadmin");
var content;

isTokenNeeded = (method) => {
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

getOptions = (req_method) => {
    let opt = {}
    opt['method'] = req_method;
    opt['headers'] = {};
    opt['headers']['Content-Type'] = 'application/json';
    if (!isTokenNeeded(req_method)) {
        opt['headers']["X-CSRFToken"] = csrftoken;
    }
    return opt;
}


var getContent = function() {
    var attribute = this.getAttribute("data-djsa");
    var options = getOptions('GET');
    var url= "/djsuperadmin/contents/"+attribute+"/";
    fetch(url, options).then(status).then(json).then(function(data) {  
            content = data;
            getUpEdit();
    }).catch(function(error) {
        console.log('Request failed', error);
    });
};


pushContent = (htmlcontent) => {
    content.content = htmlcontent;
    var url= '/djsuperadmin/contents/'+content.id+'/';
    var options = getOptions('PATCH');
    options['body']=JSON.stringify(content);
    fetch(url, options).then(status).then(json).then(function(data) {  
        location.reload() 
    }).catch(function(error) {
        console.log('Request failed', error);
    });
};

getUpEdit = () => {
    var background = document.createElement('div');
    var container = document.createElement('div');
    var editor = document.createElement('div');
    var btn = document.createElement("button");
    btn.innerHTML = 'SALVA';
    btn.classList.add('djsuperadmin-save');
    editor.id = 'editor';
    editor.innerHTML = content.content;
    background.classList.add("djsuperadmin-background");
    container.classList.add("djsuperadmin-editor");
    container.appendChild(editor);
    container.appendChild(btn);
    background.appendChild(container);
    document.body.appendChild(background);
    var quill = new Quill('#editor', {
        theme: 'snow'
    });
    btn.addEventListener('click', function(){pushContent(quill.container.firstChild.innerHTML)}, false);
    window.onclick = function(event) {
        if (event.target == background) {
            background.remove()
        }
    }
};

destroyEdit = () =>{
    this.remove()
};

for (var i = 0; i < classname.length; i++) {
    classname[i].addEventListener('dblclick', getContent, false);
    classname[i].parentNode.classList.add('djsuperadmin-content')
}