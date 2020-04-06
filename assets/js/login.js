firebase.initializeApp({
  apiKey: "AIzaSyBhmDwW9pYDqoppR6HpmO_NNrAYgvPmCtM",
  authDomain: "taptapexpress-55e73.firebaseapp.com",
  databaseURL: "https://taptapexpress-55e73.firebaseio.com",
  projectId: "taptapexpress-55e73",
  storageBucket: "taptapexpress-55e73.appspot.com",
  messagingSenderId: "78597743712",
  appId: "1:78597743712:web:99a6a8597488790a768f05",
  measurementId: "G-F4B5H917EP"
});

let patientID = document.location.search.replace(/^.*?\=/, '');

var pickedMonth = '';
var pickedYear = '';
var pickedDay = '';
var employee = {};

var db = firebase.firestore();
firebase.auth().languageCode = 'fr';
var auth = firebase.auth();
auth.useDeviceLanguage();

firebase.auth().signOut().then(function() {
    localStorage.clear();
  }).catch(function(error) {
    console.log('error logging ou', error.message)
  });

$(document).ready(function () {
    let deleteIDs = [];
    let lastVisible;
    let firstVisible;
    // REAL TIME LISTENER

    $('#code-button').hide();
    $('#code-div').hide();
   
    window.addEventListener('load', function() {
        // Fetch all the forms we want to apply custom Bootstrap validation styles to
        var forms = document.getElementsByClassName('needs-validation');
        // Loop over them and prevent submission
        var validation = Array.prototype.filter.call(forms, function(form) {
          form.addEventListener('submit', function(event) {
            var email = $('#email').val();
            var intRegex = /[0-9 -()+]+$/;
            var emailReg = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
            event.preventDefault(); 
            if (form.checkValidity() === false) {
              event.stopPropagation();
            } else {     

              if (email == "") {
                alert( "  Veuillez saisir votre e-mail ou numéro de téléphone  ");
                return;
              }
              if ((!emailReg.test(email))) {
                if (!intRegex.test(email)) {
                  alert("Le numéro de téléphone ou l'addresse couriel est invalide.");
                  return;
                } else {
                  fetchEmployeeData();
                }
              } else{
                signInUser();
              }
            
            }
            form.classList.add('was-validated');
          }, false);
        });
      }, false);

      function fetchEmployeeData() {
        $('#login-button').hide();
        $('#code-button').show();
        $('#code-div').show();
        onSigninSubmit();
      }

      function signinWithCode() {  
        let code = $('#verification-code').val();
        if (code == "") {
          alert( "  Veuillez entrer le code de vérification  ");
          return;
        } else {
          confirmationResult
          .confirm(code)
          .then(function(result) {
              var user = result.user;
              console.log(user);
              saveEmployee(user);
          })
          .catch(function(error) {
              console.log(error);
          });
        }
      };

      window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('code-button', {
        'size': 'invisible',
        'callback': function(response) {
          console.log('recaptcha =>',response)
          signinWithCode();
        }
      });

      function onSigninSubmit() {
        let phone = $('#email').val();
        phone = "+1" + phone;
        var appVerifier = window.recaptchaVerifier;
        firebase.auth().signInWithPhoneNumber(phone, appVerifier)
        .then(function (confirmationResult) {
          console.log('result =>', confirmationResult);
          // SMS sent. Prompt user to type the code from the message, then sign the
          // user in with confirmationResult.confirm(code).
          window.confirmationResult = confirmationResult;
        }).catch(function (error) {
          console.log('result =>', error.message);
          // ...
        });
      }

       function toggleSignIn() {
        if (firebase.auth().currentUser) {
          // [START signout]
          firebase.auth().signOut();
          // [END signout]
        } else {
          var email = $('#email').val();
          var password = $('#password').val();
          if (email.length < 4) {
            alert('Please enter an email address.');
            return;
          }
          if (password.length < 4) {
            alert('Please enter a password.');
            return;
          }
        }
    }

    function saveEmployee(user) {
      db.collection('Employees').doc(user.uid).get().then(function (doc) {
        if(doc.exists) {
          console.log('doc exists =>', doc.data());
          employee.employe_id = doc.data().employee_id;
          employee.full_name = user.full_name;
          employee.id = doc.data().id;
        employee.image_url = doc.data().image_url;
        employee.role= doc.data().role;
        employee.isLoggedIn = true;
        $('#login-button').disabled = false;
        localStorage.setItem('employee', JSON.stringify(employee));
        window.location.href = "index.html"
      } else {
        db.collection('Doctors').doc(user.uid).get().then(function (doc) {
          console.log('doc exists elsem=>', doc.data());
          employee.doctor_id = (doc.data().doctor_id).replace(/\s+/g, '');
          employee.full_name = doc.data().full_name;
          employee.id = doc.data().id;
          employee.image_url = doc.data().image_url;
          employee.role= doc.data().role;
          employee.isLoggedIn = true;
          $('#login-button').disabled = false;
          localStorage.setItem('employee', JSON.stringify(employee));
          window.location.href = "index-doctor.html"
      })
    }
  });
           
  
    };

    // SIGN EMPLOYEE
    function signInUser() {
        let email = $('#email').val(); 
        let password = $('#password').val();
        auth.signInWithEmailAndPassword(email, password).then(function() {
            let user = auth.currentUser;
            console.log(user);
            saveEmployee(user);            
        })
        .catch(function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            if(error) {
            if (errorCode === 'auth/wrong-password') {
                alert('Mauvais mot de passe.');
              } else {
                console.log(error);
              }
            }     
          });
    };

    // GENERATE PATIENT ID
    function generateId(ln,fn,dob,gender) {
        
        var date = dob.getDate();
        var month = dob.getMonth() + 1;
        var year = ((dob.getFullYear()).toString()).substring(2,4);
        let id = (ln.substring(0, 3)).toUpperCase() + (fn.substring(0, 1)).toUpperCase() + " " + year + month + " " + date + gender;
        return id
    };
});

(function ($) {
    "use strict";
    function centerModal() {
        $(this).css('display', 'block');
        var $dialog = $(this).find(".modal-dialog"),
            offset = ($(window).height() - $dialog.height()) / 2,
            bottomMargin = parseInt($dialog.css('marginBottom'), 10);

        // Make sure you don't hide the top part of the modal w/ a negative margin if it's longer than the screen height, and keep the margin equal to the bottom margin of the modal
        if (offset < bottomMargin) offset = bottomMargin;
        $dialog.css("margin-top", offset);
    }

    $(document).on('show.bs.modal', '.modal', centerModal);
    $(window).on("resize", function () {
        $('.modal:visible').each(centerModal);
    });
}(jQuery));