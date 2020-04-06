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
var image_url = null;
var photoChanged = false;
var passwordChanged = false;

var db = firebase.firestore();
var auth = firebase.auth();
const ref = firebase.storage().ref();

$(document).ready(function () {
    let deleteIDs = [];
    let lastVisible;
    let firstVisible;

    $('#take_snapshot').hide();
    $('#cancel_snapshot').hide();
    $('#change-password').hide();
    $('#my_camera').hide();
    

    db.collection('Doctors').doc(uid).get().then(function (doc) {
        renderDoctor(doc.data());
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
                    if ($('#change_password').val() === 'Annuler') {

                        if (password.length == 0 || confirmPassword.length == 0) {
                            alert('Mot de passe obligatoire.');
                            return;
                        }

                        if (password.length < 8 || confirmPassword.length < 8) {
                            alert('Mot de passe trop court.');
                            return;
                        }
                    
                        if (password !== confirmPassword) {
                            alert('Les mots de passe ne correspondent pas.');
                            return;
                        }
                    }
                    if ((phone.length < 6) || (!intRegex.test(phone))) {
                        alert('Le numéro de téléphone est invalide.');
                        return;
                    }

                    if ((image_url == null)) {
                        alert('Il faut prendre une photo.');
                        return;
                    }
                    
                    if (!emailReg.test(email)) {
                        alert('Please enter a valid email address.');
                        return false;
                    }
                    if(photoChanged) {
                        saveImage();
                    } else {
                        saveUserToDb(image_url);   
                    }
                    
                }
                form.classList.add('was-validated');
            }, false);
        });
    }, false);

    function attachCamera() {
    Webcam.set({
        width: 148,
        height: 148,
        image_format: 'jpeg',
        jpeg_quality: 120
    });
    Webcam.attach('#my_camera');
}
$('#confirm-password').on("change", function() { 
    if (($('#password').val()).length == 0 || ($('#confirm-password').val()).length == 0) {
        passwordChanged = false;
        console.log('password not changed=>', passwordChanged);
    } else {
        passwordChanged = true;
        console.log('password changed=>', passwordChanged);
    }
}); 

$(document).on('click', '#change_password', function () {  
    $("#change-password").toggle();
    $(this).val( $(this).val() == 'Changer le mot de passe' ? 'Annuler' : 'Changer le mot de passe' );  
});

    $(document).on('click', '#change_photo', function () {   
        $('#my_camera').show();
        $('#change_photo').hide();
        $('#upload-image').hide();
        attachCamera();
        $('#take_snapshot').show();
        $('#cancel_snapshot').show();
    });

    $(document).on('click', '#cancel_snapshot', function () {  
        $('#my_camera').hide();
        $('#take_snapshot').hide();
        $('#cancel_snapshot').hide(); 
        $('#change_photo').show();
        $('#upload-image').show();
    });

    $(document).on('click', '#take_snapshot', function () {   
        $('#my_camera').hide();
        $('#cancel_snapshot').hide();
        $('#upload-image').show();
        Webcam.snap(function (data_uri) {
            $(".image-tag").val(data_uri);
            image_url = data_uri;
            photoChanged = true;
            document.getElementById('upload-image').innerHTML = '<img src="' + data_uri + '" width="150px" height="125px"/>';
            $('#take_snapshot').hide();
            $('#change_photo').show();
        
        });
    });

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

    // // EMAIL IN FOCUS
    // $('#email').focus(function () {
    //     let ln = $('#last_name').val();
    //     let fn = $('#first_name').val();
    //     console.log('select change =>', this.value)
    //     $('#email').val((fn.replace(/\s+/g, '')).toLowerCase() + (ln.replace(/\s+/g, '')).toLowerCase() + "@vizionmd.com");
    // });

        // RENDER DOCTOR
        function renderDoctor(doctor) {
            let dob = moment((doctor.date_of_birth).toDate()).format('dd D MMM YYYY', 'fr');
            let hire = moment((doctor.hired_date).toDate()).format('dd D MMM YYYY', 'fr');
            image_url = doctor.image_url;
            $("#doctor_id").val(doctor.doctor_id);
            $("#image").attr("src", doctor.image_url);
            $("#phone-number").val(doctor.phone_number);
            $("#first_name").val(doctor.first_name);
            $("#last_name").val(doctor.last_name);
            $("#post_name").val(doctor.post_name);
            $("#date_of_birth").val(dob);
            $("#hire-date").val(hire);
            $("#email").val(doctor.email);
            $("#address").val(doctor.address);
            $("#city").val(doctor.city);
            $("#role").val(doctor.role);
    
            $("#country").val(doctor.country);
            $("#country").change();
    
            $("#province").val(doctor.province);
            $("#province").change();
    
            if (doctor.gender === "H") {
                $("#male").prop('checked', true);
            } else {
                $("#female").prop('checked', true);
            }
    
            if (doctor.status) {
                $("#active").prop('checked', true);
            } else {
                $("#inactive").prop('checked', true);
            }
    
            $("#race").val(doctor.race);
            $("#race").change();
    
            $("#role").val(doctor.role);
            $("#role").change();
    
            $("#language").val(doctor.language);
            $("#language").change();
        };
    

    // UPDATE PATIENT
    function registerEmployee(event) {
        let email = $('#email').val();
        let password = $('#password').val();
        auth.createUserWithEmailAndPassword(email, password).then(function(user) {     
            tempEmployee = firebase.auth().currentUser;
            $('#register-button').disabled = false;
            saveImage();
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
    
    function savePassword(image_url) {
        var ln = ($('#last_name').val()).replace(/\s+/g, '');
        var fn = ($('#first_name').val()).replace(/\s+/g, '');
        let email = fn.toLowerCase() + ln.toLowerCase() + "@vizionmd.com";
        console.log('Inside save password', email, phone);
        var password = $('#password').val();
        var phone = $('#phone-number').val();
        let cc = $('#select-country').val();
        console.log('Inside save password', email, phone);
        var displayName = fn + " " + ln;
        db.collection('new_temp').doc(uid).set({
            email: email,
            new_temp: password,
            phone: phone,
            displayName: displayName,
            photoURL: image_url
        }).then(function () {
            console.log("Document successfully written!");
                $("#doctor_saved").modal('show');
        })
            .catch(function (error) {
                console.error("Error writing document: ", error);
            });
        };


    function saveImage() {
        var date = moment($('#date_of_birth').val(), "dd D MMM YYYY", "en");
        let dob = new Date((date));
        let gender = ($("input[name='gender']:checked").val() === "F") ? "06" : "13"; 
        let id = generateId($('#last_name').val(), $('#first_name').val(), dob, gender);
        let objectID = id.replace(/\s+/g, '');
        imageRef = ref.child('doctors/' + objectID + '/photo.jpg');
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



    function saveUserToDb(image_url) {
        var ln = ($('#last_name').val()).replace(/\s+/g, '');
        var fn = ($('#first_name').val()).replace(/\s+/g, '');
        var pn = ($('#post_name').val()).replace(/\s+/g, '');
        var date = moment($('#date_of_birth').val(), "dd D MMM YYYY", "en", "dd D MMM YYYY");
        let dob = new Date((date));
        console.log('user registered dob =>', ln);
        date = moment($('#hire-date').val(), "dd D MMM YYYY", "en");
        let hireDate = new Date((date));
        console.log('user registered dob =>', date, hireDate);
        let gender = ($("input[name='gender']:checked").val() === "F") ? "06" : "13";
        let email = fn.toLowerCase() + ln.toLowerCase() + "@vizionmd.com";
        fn = fn[0].toUpperCase() + fn.slice(1);
        ln = ln[0].toUpperCase() + ln.slice(1);
        let objectID = generateId(ln, fn, dob, gender);
        if(pn != ""){
            pn = pn[0].toUpperCase() + ln.slice(1);
        }
        var doctor = {
            first_name: fn,
            email: email,
            address: $('#address').val(),
            last_name: ln,
            post_name: pn,
            full_name: fn + " " + ln,
            role: $('#role').val(),
            image_url: image_url,
            phone_number: $('#phone-number').val(),
            province: $('#province').val(),
            id: uid,
            country: $('#country').val(),
            doctor_id: objectID,
            city: $('#city').val(),
            status: true,
            gender: $("input[name='gender']:checked").val(),
            language: $('#language').val(),
            race: ($('#race').val()),
            // date_of_birth: dob,
            hired_date: hireDate
        }
        
        
        db.collection('Doctors').doc(uid).update(doctor).then(function () {
            console.log("Document successfully written!");
            if(passwordChanged) {
                savePassword(image_url);
            } else {
                $("#doctor_saved").modal('show');
            }
            
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

