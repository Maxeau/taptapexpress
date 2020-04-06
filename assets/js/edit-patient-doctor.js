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

var employee = JSON.parse(localStorage.getItem('employee'));
let uid = document.location.search.replace(/^.*?\=/, '');

if (!employee.isLoggedIn) {
    window.location.href = "login.html" 
}

var pickedMonth = '';
var pickedYear = '';
var pickedDay = '';
var tempEmployee = {};
var image_url = String;

var db = firebase.firestore();
var auth = firebase.auth();
const ref = firebase.storage().ref();

$(document).ready(function () {
    let deleteIDs = [];
    let lastVisible;
    let firstVisible;   
    db.collection('Patients').doc(uid).get().then(function (doc) {
        renderEmployee(doc.data());
    });

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
                    saveUserToDb();
                }
                form.classList.add('was-validated');
            }, false);
        });
    }, false);

      // RENDER PATIENT
      function renderEmployee(employee) {
        let dob = moment((employee.date_of_birth).toDate()).format('dd D MMM YYYY', 'fr');
        let hire = moment((employee.last_visit).toDate()).format('dd D MMM YYYY', 'fr');
        $("#image-url").attr("src", employee.image_url);
        $("#phone").text(employee.phone_number);
        $("#full-name").text(employee.full_name);
        $("#date-of-birth").text(dob);
        $("#last-visit").text('Dernière visite : ' + hire);
        $("#last-user").text('Modifié par : ' + employee.last_update.displayName);
        $("#email").text(employee.email);
        $("#address").text(employee.address);
        $("#gender").val(employee.gender);
        $("#patient-id").val(employee.patient_id);

        $("#country").val(employee.country);
        $("#country").change();

        $("#province").val(employee.province);
        $("#province").change();

        if (employee.status) {
            $("#active").prop('checked', true);
        } else {
            $("#inactive").prop('checked', true);
        }

        $("#race").val(employee.race);
        $("#race").change();

        $("#language").val(employee.language);
        $("#language").change();
    };


    // UPDATE PATIENT
    function registerEmployee(event) {
        let email = $('#email').val();
        let password = $('#password').val();
        auth.createUserWithEmailAndPassword(email, password).then(function(user) {     
            tempEmployee = firebase.auth().currentUser;
            $('#register-button').disabled = false;
            saveUserToDb();
        })
        .catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            if (errorCode == 'auth/weak-password') {
                alert('Le mot de passe est trop faible.');
              } else {
                alert(errorMessage);
                console.log('error in register =>', errorMessage)
              }
          
        });
    };

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


    function saveImage() {
        var date = moment($('#date_of_birth').val(), ["DD/MM/YYYY", "MM/DD/YYYY"], true);
        let dob = new Date((date));
        let gender = ($("input[name='gender']:checked").val() === "F") ? "06" : "13"; 
        let id = generateId($('#last_name').val(), $('#first_name').val(), dob, gender);
        let objectID = id.replace(/\s+/g, '');
        imageRef = ref.child('patients/' + objectID + '/photo.jpg');
        var uploadTask = imageRef.putString(image_url, 'data_url');
        uploadTask.on('state_changed', function(snapshot){
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            switch (snapshot.state) {
              case firebase.storage.TaskState.PAUSED: // or 'paused'
                console.log('Upload is paused');
                break;
              case firebase.storage.TaskState.RUNNING: // or 'running'
                console.log('Upload is running');
                break;
            }
          }, function(error) {
            console.log('error uploading photo =>', error.message);
          }, function() {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
              console.log('File available at', downloadURL);
              saveUserToDb(downloadURL);
            });
          });

        }



    function saveUserToDb(image_url) {
        let ln = $('#last_name').val();
        let fn = $('#first_name').val();
        var date = moment($('#date_of_birth').val(), ["DD/MM/YYYY", "MM/DD/YYYY"], true);
        let dob = new Date((date));
        console.log('user registered dob =>', dob);
        date = moment($('#hire-date').val(), ["DD/MM/YYYY", "MM/DD/YYYY"], true);
        let hireDate = new Date((date));
        console.log('user registered hireDate =>', hireDate)
        let gender = ($("input[name='gender']:checked").val() === "F") ? "06" : "13";
        let email = (fn.replace(/\s+/g, '')).toLowerCase() + (ln.replace(/\s+/g, '')).toLowerCase() + "@vizionmd.com";
        let objectID = generateId(ln, fn, dob, gender);
        console.log('user registered =>', tempEmployee.uid)
        let id = tempEmployee.uid;
        db.collection('Employees').doc(uid).set({
            first_name: $('#first_name').val(),
            email: email,
            address: $('#address').val(),
            last_name: $('#last_name').val(),
            post_name: $('#post_name').val(),
            role: $('#role').val(),
            phone_number: $('#phone-number').val(),
            province: $('#province').val(),
            id: id,
            country: $('#country').val(),
            employee_id: objectID,
            city: $('#city').val(),
            status: true,
            gender: $("input[name='gender']:checked").val(),
            language: $('#language').val(),
            race: ($('#race').val()),
            date_of_birth: dob,
            hired_date: hireDate
        }).then(function () {
            console.log("Document successfully written!");
            $("#employee_saved").modal('show');
        })
            .catch(function (error) {
                console.error("Error writing document: ", error);
            });
    };

    // DELETE PATIENT
    $(document).on('click', '.js-delete-patient', function () {
        let id = $(this).attr('id');
        $('#delete-patient-form').attr('delete-id', id);
        $('#deletepatientModal').modal('show');
    });

    // DELETE PATIENT FORM
    $("#delete-patient-form").submit(function (event) {
        event.preventDefault();
        let id = $(this).attr('delete-id');
        if (id != undefined) {
            db.collection('Patients').doc(id).delete()
                .then(function () {
                    console.log("Document successfully delete!");
                    $("#deletepatientModal").modal('hide');
                })
                .catch(function (error) {
                    console.error("Error deleting document: ", error);
                });
        } else {
            let checkbox = $('table tbody input:checked');
            checkbox.each(function () {
                db.collection('patients').doc(this.value).delete()
                    .then(function () {
                        console.log("Document successfully delete!");
                    })
                    .catch(function (error) {
                        console.error("Error deleting document: ", error);
                    });
            });
            $("#deletepatientModal").modal('hide');
        }
    });

    // UPDATE EMPLOYEE
    $(document).on('click', '.js-edit-patient', function () {
        let id = $(this).attr('id');
        $('#edit-patient-form').attr('edit-id', id);
        db.collection('Patients').doc(id).get().then(function (document) {
            if (document.exists) {
                $('#edit-patient-form #patient-name').val(document.data().name);
                $('#edit-patient-form #patient-email').val(document.data().email);
                $('#edit-patient-form #patient-address').val(document.data().address);
                $('#edit-patient-form #patient-phone').val(document.data().phone);
                $('#editpatientModal').modal('show');
            } else {
                console.log("No such document!");
            }
        }).catch(function (error) {
            console.log("Error getting document:", error);
        });
    });

    // EDIT PATIENT FORM
    $("#edit-patient-form").submit(function (event) {
        event.preventDefault();
        let id = $(this).attr('edit-id');
        db.collection('Patients').doc(id).update({
            name: $('#edit-patient-form #patient-name').val(),
            email: $('#edit-patient-form #patient-email').val(),
            address: $('#edit-patient-form #patient-address').val(),
            phone: $('#edit-patient-form  #patient-phone').val()
        });
        $('#editpatientModal').modal('hide');
    });

    // ADD PATIENT MODAL
    $("#addPatientModal").on('hidden.bs.modal', function () {
        $('#add-patient-form .form-control').val('');
    });

    // EDIT PATIENT MODAL
    $("#editpatientModal").on('hidden.bs.modal', function () {
        $('#edit-patient-form .form-control').val('');
    });

    // PAGINATION
    $("#js-previous").on('click', function () {
        $('#patient-table tbody').html('');
        var previous = db.collection("Patients")
            .orderBy(firebase.firestore.FieldPath.documentId(), "desc")
            .startAt(firstVisible)
            .limit(3);
        previous.get().then(function (documentSnapshots) {
            documentSnapshots.docs.forEach(doc => {
                renderPatient(doc);
            });
        });
    });


    $('#js-next').on('click', function () {
        if ($(this).closest('.page-item').hasClass('disabled')) {
            return false;
        }
        $('#patient-table tbody').html('');
        var next = db.collection("Patients")
            .startAfter(lastVisible)
            .limit(3);
        next.get().then(function (documentSnapshots) {
            documentSnapshots.docs.forEach(doc => {
                renderPatient(doc);
            });
            lastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];
            firstVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];
            let nextChecker = documentSnapshots.docs.length - 1;
            if (nextChecker == 0) {
                $('#js-next').closest('.page-item').addClass('disabled');
            }
        });
    });
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