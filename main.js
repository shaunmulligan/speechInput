function initSpeech() {
        console.log("intializing speech Recognition");
        if (!('webkitSpeechRecognition' in window)) {
            alert('Web speech API is not supported in this browser');
          } 
        else {
            //flag for if we are currently recognizing speech or not.
            var recognizing = false,
                iHeard = '';

            // Speech recognizer init
            var recognizer = new webkitSpeechRecognition();

            // continously listen to speech
            recognizer.continuous = true;

            // set languages supported
            recognizer.lang = ['English', ['en-Uk', 'United Kingdom']];

            // We return non-final strings so gameplay isn't laggy
            recognizer.interimResults = true;

            recognizer.onstart = function(){
                recognizing = true;
            };
            recognizer.onerror = function(e){
                recognizing = false;
                console.log('Something wrong happened', e.error);
            };

            recognizer.onresult = function(e) {
            
              if (e.results.length) {
                 for (var i = event.resultIndex; i < event.results.length; i++) {
                     
                      iHeard = event.results[i][0].transcript; 
                      //check if that is the final result
                      if(e.results[i].isFinal){
                        console.log("final result is: "+iHeard);
                        //make a call to wit.ai to get process the speech into a command.
                        getActionFromWit(iHeard);
                      }
                  }
                  setIHeardText("I heard: "+iHeard);
                  //console.log("voice Input: "+iHeard);
              }
            };

            recognizer.onend = function(e){
              recognizing = false;
            };
          // start speech to text translation
          recognizer.start();
        }
};

function setIHeardText(textToDisplay) {
        document.getElementById('iHeardText').textContent = textToDisplay;
};

function getActionFromWit(inputText) {
        $.ajax({
          url: "https://api.wit.ai/message?access_token=B4DSVDKSF6OFNZDFVX6DUG5T22ZOYZD6&c=1&explain=true&q="+encodeURI(inputText),
          type: "GET",
          cache: false,
          dataType: "jsonp",

          success: function(response) {
            console.log(response);
            if(response.outcome.confidence > 0.7){
            var entitiesArray = [];
            console.log("action detected: "+response.outcome.intent+" with confidence of: "+response.outcome.confidence);
            console.log("action entities:");
            
            for ( property in response.outcome.entities ) {
              if(property === 'location'){
                console.log( property+": "+ response.outcome.entities.location.value ); 
                entitiesArray.push(response.outcome.entities.location.value);
              }else if(property === 'contact'){
                console.log( property+": "+ response.outcome.entities.contact.value ); 
                entitiesArray.push(response.outcome.entities.contact.value);
              }else
              {
                entitiesArray.push(property);
                console.log(property)
              }
            }
            console.log(entitiesArray);
            document.getElementById('actionCommand').textContent = "Action: "+response.outcome.intent+" with the following terms: "+entitiesArray;
            }else{
              console.log("no action detected");
              document.getElementById('actionCommand').textContent = "I will wait for an appropriate command";
            }
          },
          error: function(html) {alert('error occured: '+html);}
          
        });
};