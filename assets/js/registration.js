firebase.initializeApp({
    apiKey: "AIzaSyCoAK3yBnP1BT7cdotUWY0MvcMuhRw8SxU",
    authDomain: "vizionmd-3623b.firebaseapp.com",
    databaseURL: "https://vizionmd-3623b.firebaseio.com",
    projectId: "vizionmd-3623b",
    storageBucket: "vizionmd-3623b.appspot.com",
    messagingSenderId: "541284120648",
    appId: "1:541284120648:web:5b8d2923a8260ba284407d",
    measurementId: "G-69BR9SGSYP"
});

let patientID = document.location.search.replace(/^.*?\=/, '');

var pickedMonth = '';
var pickedYear = '';
var pickedDay = '';

var db = firebase.firestore();
var auth = firebase.auth();

$(document).ready(function () {
    let deleteIDs = [];
    let lastVisible;
    let firstVisible;
    // REAL TIME LISTENER

    window.addEventListener('load', function () {
        // Fetch all the forms we want to apply custom Bootstrap validation styles to
        var forms = document.getElementsByClassName('needs-validation');

        // Loop over them and prevent submission
        var validation = Array.prototype.filter.call(forms, function (form) {
            form.addEventListener('submit', function (event) {
                var email = $('#email').val();
                var password = $('#password').val();
                var confirmPassword = $('#confirm-password').val();
                var phone = $('#phone-number').val();
                var intRegex = /[0-9 -()+]+$/;
                var emailReg = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
                console.log('password =>', password);
                event.preventDefault();  
                if (form.checkValidity() === false) {
                         
                    event.stopPropagation();
                } else {
                    if (password.length < 8) {
                        alert('Mot de passe trop court.');
                        return;
                    }
                    if (password !== confirmPassword) {
                        alert('Les mots de passe ne correspondent pas.');
                        return;
                    }
                    if ((phone.length < 6) || (!intRegex.test(phone))) {
                        alert('Le numéro de téléphone est invalide.');
                        return;
                    }
                    
                    if (!emailReg.test(email)) {
                        alert('Please enter a valid email address.');
                        return false;
                    }
                    registerUser();
                }
                form.classList.add('was-validated');
            }, false);
        });
    }, false);

    // db.collection('patients').startAt("abc").endAt("abc\uf8ff").get()
    // .then(function (documentSnapshots) {
    //     documentSnapshots.docs.forEach(doc => {
    //         renderPatient(doc);
    //     });
    // });

    // db.collection('patients').startAt('bos').endAt('bos\uf8ff').on("value", function(snapshot) {
    //     console.log(snapshot);
    // });
    // var first = db.collection("patients")
    //     .limit(3);

    // first.get().then(function (documentSnapshots) {
    //     documentSnapshots.docs.forEach(doc => {
    //         renderPatient(doc);
    //     });
    //     lastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];
    //     console.log(documentSnapshots.docs.length - 1);
    // });



    var cleave = new Cleave('#phone-number', {
        phone: true,
        phoneRegionCode: 'CD'
    });


    // SELECT COUNTRY
    $('#select-country').change(function () {
        console.log('select change =>', this.value)
        cleave.setPhoneRegionCode(this.value);
        cleave.setRawValue('');
    });

    // UPDATE PATIENT
    function registerUser() {
        let email = $('#email').val();
        let password = $('#password').val();       
        auth.createUserWithEmailAndPassword(email, password).then(function(user) {     
            let employee = auth.currentUser;
            $('#register-button').disabled = false;
            saveUserToDb(employee.uid);
        })
        .catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            if(errorCode) {
            var errorMessage = error.message;
            if (errorCode == 'auth/weak-password') {
                alert('Le mot de passe est trop faible.');
              } else {
                alert(errorMessage);
              }
            } else {
               let id = generateId(ln, fn, dob, gender)
            }
        });
    };

    // Open index.html
		$(document).on('click', '.m-t-20', function() {
            window.location.href = "index.html" 
        });

    // GENERATE PATIENT ID
    function generateId(ln, fn, dob, gender) {

        var date = dob.getDate();

        if (date <= 9) {
            date = "0" + date;
        }

        var month = dob.getMonth() + 1;
        
        if (month <= 9) {
            month = "0" + month;
        }
        var year = ((dob.getFullYear()).toString()).substring(2, 4);
        let id = (ln.substring(0, 3)).toUpperCase() + (fn.substring(0, 1)).toUpperCase() + " " + year + month + " " + date + gender;
        return id
    }

    function saveUserToDb(id) {
        let ln = $('#last_name').val();
        let fn = $('#first_name').val();
        var date = $('#date-of-birth').val();
        let dob = new Date((date));
        let gender = ($("input[name='gender']:checked").val() === "F") ? "06" : "13";
        let employeeID = generateId($('#last_name').val(), $('#first_name').val(), dob, gender)
       
            db.collection('Employees').doc(id).set({
                first_name: fn,
                email: $('#email').val(),
                country: "Canada",
                last_name: ln,
                image_url: "https://firebasestorage.googleapis.com/v0/b/vizionmd-3623b.appspot.com/o/vizion%2Flogo-eyeonly.jpg?alt=media&token=97b36d87-0646-4cf8-9750-7d279314ade5",
                phone_number: $('#phone-number').val(),       
                id: id,
                employee_id: employeeID,
                gender: $("input[name='gender']:checked").val(),
                date_of_birth: dob
            }).then(function () {
                console.log("Document successfully written!");
                $("#user-created").modal('show');
            })
                .catch(function (error) {
                    console.error("Error writing document: ", error);
                });
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