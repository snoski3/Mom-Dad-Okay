(function() {
    var apiKey = "y7ukszYkuTmZ3LxV";
    var el = new Everlive(apiKey);

    var messageDataSource = new kendo.data.DataSource({
        type: "everlive",
        transport: {
            typeName: "Messages"
        }
    });
    
    function initialize() {
        
        var app = new kendo.mobile.Application(document.body, {
            skin: "flat",
            transition: "slide"
        });
        $("#grocery-list").kendoMobileListView({
            dataSource: messageDataSource,
            template: "#: CreatedAt # --- #: Name #"
        });
        navigator.splashscreen.hide();
    }
    window.loginView = kendo.observable({
        username: localStorage.getItem("username"),
        password: localStorage.getItem("password"),
        submit: function() {
            if (!this.username) {
                navigator.notification.alert("Need username");
                return;
            }
            if (!this.password) {
                navigator.notification.alert("Need password");
                return;
            }
            // save the items in the localStorage
            localStorage.setItem("username", this.username);
            localStorage.setItem("password", this.password);
            el.Users.login(this.username,this.password,function(data){
                var accessToken = data.result.access_token;
                window.location.href = "#list";
                messageDataSource.read();
            }, function(){
                navigator.notification.alert("Account not found.");
            });
        }
    });
    window.registerView = kendo.observable({
        submit: function(){
            if(!this.username){
                navigator.notification.alert("Username needed.");
                return;
            }
            if(!this.password){
                navigator.notification.alert("Password needed.");
                return;
            }
            el.Users.register(this.username,this.password,{Email: this.email},function(){
                navigator.notification.alert("Account created.");
                window.location.href= "#login";
            }, function(){
                navigator.notification.alert("Account NOT created.");
            });
        }
    });
    window.passwordView = kendo.observable({
      submit: function() {
      if (!this.email) {
          navigator.notification.alert("Email address is required.");
          return;
      }
      $.ajax({
          type: "POST",
          url: "https://api.everlive.com/v1/" + apiKey + "/Users/resetpassword",
          contentType: "application/json",
          data: JSON.stringify({ Email: this.email }),
          success: function() {
              navigator.notification.alert("Your password was successfully reset. Please check your email for instructions on choosing a new password.");
              window.location.href = "#login";
          },
          error: function() {
              navigator.notification.alert("Unfortunately, an error occurred resetting your password.")
          }
      });
     }
    });
    window.listView = kendo.observable({
       logout: function(event) {
      // Prevent going to the login page until the login call processes.
      event.preventDefault();
      el.Users.logout(function() {
          this.loginView.set("username", "" );
          this.loginView.set("password", "");
          window.location.href = "#login";
      }, function() {
          navigator.notification.alert("Unfortunately an error occurred logging out of your account.");
      });
     },
       time: function(){
            var app = new kendo.mobile.Application(document.body, {
            skin: "material-dark",
            transition: "slide"
        });
        $("#grocery-list").kendoMobileListView({
            dataSource: messageDataSource,
            template: "#: CreatedAt #, ---, #: Name #"
        });        
    }
    });
	window.addView = kendo.observable({        
        add: function(){            

            if(!this.grocery){
                navigator.notification.alert("You need to select a message to send."); return;
            }
            
            messageDataSource.insert({                        	
                Name: this.grocery,
    			CreatedAt: new Date(),
            });
            messageDataSource.one("sync",this.close);
            messageDataSource.sync();
        },
        close: function(){
            $("#add").data("kendoMobileModalView").close();
            this.grocery="";
            
            var app = new kendo.mobile.Application(document.body, {
            skin: "flat",
            transition: "slide"
        });       
        }  
    })
    document.addEventListener("deviceready", initialize);
}());