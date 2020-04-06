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

var db = firebase.firestore();
var auth = firebase.auth();
const ref = firebase.storage().ref();

var pickedMonth = '';
var pickedYear = '';
var pickedDay = '';
var image_url = null;
var antecedants = [];

var employee = JSON.parse(localStorage.getItem('employee'));
if (!employee.isLoggedIn) {
    window.location.href = "login.html" 
}

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
                event.preventDefault();
                if (form.checkValidity() === false) {
                    event.stopPropagation();
                } else {
                    if ((image_url == null)) {
                        alert('Il faut prendre une photo.');
                        return;
                    }
                    saveImage();
                }
                form.classList.add('was-validated');
            }, false);
        });
    }, false);

    Webcam.set({
        width: 150,
        height: 125,
        image_format: 'jpeg',
        jpeg_quality: 120
    });
    Webcam.attach('#my_camera');

    $(document).on('click', '#edit-patient', function () {
        console.log('edit patient', patientID)
        localStorage.setItem('patientID', val);
    });


    $(document).on('click', '#take_snapshot', function () {  
        $('#my_camera').hide();
        Webcam.snap(function (data_uri) {
            $(".image-tag").val(data_uri);
            image_url = data_uri;
            document.getElementById('results').innerHTML = '<img src="' + data_uri + '"/>';
        });
    });


    function renderPatient(patient) {

        let time = (patient.date_of_birth).seconds * 1000;
        let dob = (new Date(time));
        time = dob.toString()
        $("#patient_id").val(patient.id);
        $("#image").attr("src", patient.image_url);
        $("#phone_number").val(patient.phone_number);
        $("#first_name").val(patient.first_name);
        $("#last_name").val(patient.last_name);
        $("#post_name").val(patient.post_name);
        $("#date_of_birth").val(time);
        $("#email").val(patient.email);
        $("#profession").val(patient.profession);
        $("#handicap").val(patient.handicap);
        $("#address").val(patient.address);
        $("#city").val(patient.city);

        $("#country").val(patient.country);
        $("#country").change();

        $("#province").val(patient.province);
        $("#province").change();

        if (patient.gender === "H") {
            $("#male").prop('checked', true);
        } else {
            $("#female").prop('checked', true);
        }

        if (patient.status) {
            $("#active").prop('checked', true);
        } else {
            $("#inactive").prop('checked', true);
        }

        $("#race").val(patient.race);
        $("#race").change();

        $("#language").val(patient.language);
        $("#language").change();

        // switch (patient.race) {
        //     case "B":
        //         $("#race").val('Noir');
        //         $("#race").change();
        //         break;
        //     case "W":
        //         $("#race").val('Caucasien(White)');
        //         $("#race").change();
        //         console.log('patient retrieve =>', patient.race)
        //         break;
        //     case "A":
        //         $("#race").val('Asiatique');
        //         $("#race").change();
        //         break;
        //     case "I":
        //         $("#race").val('Indien');
        //         $("#race").change();
        //         break;
        //     default:
        //         $("#race").val('Noir');
        //         $("#race").change();
        // };

        // switch (patient.language) {
        //     case "F":
        //         $("#language").val('Français');
        //         $("#language").change();
        //         break;
        //     case "L":
        //         $("#language").val('Lingala');
        //         $("#language").change();
        //         console.log('patient retrieve =>', patient.language)
        //         break;
        //     case "A":
        //         $("#language").val('Anglais');
        //         $("#raclanguagee").change();
        //         break;
        //     case "S":
        //         $("#language").val('Swahili');
        //         $("#language").change();
        //         break;
        //     default:
        //         $("#language").val('Français');
        //         $("#language").change();
        // }
    }

    var cleave = new Cleave('#phone_number', {
        phone: true,
        phoneRegionCode: 'CD'
    });



    $('#select-country').change(function () {
        cleave.setPhoneRegionCode(this.value);
        cleave.setRawValue('');
    });

    // ADD EMPLOYEE
    function savePatient(image_url) {
        let updater = {}
        updater.id = employee.id;
        updater.displayName = employee.displayName;
        updater.timestamp = new Date();
        if(employee.photoUrl === null ||employee.photoUrl === undefined) {
            employee.photoUrl = 'https://firebasestorage.googleapis.com/v0/b/vizionmd-3623b.appspot.com/o/vizion%2Fimages.png?alt=media&token=3d5fb8bb-b82b-492e-a50d-8db040da18fc'
        }
        updater.photoUrl = employee.photoUrl;
        let status = eval($("input[name='status']:checked").val());
        let dob = new Date(($('#date_of_birth').val()));
        let visit = new Date();
         antecedants = $("input[name='antecedants']:checked").each(function() { 
            antecedants.push($(this).val()); 
        }); 
        let gender = ($("input[name='gender']:checked").val() === "F") ? "06" : "13";
        let isGlasses = ($("input[name='wear-glasses']:checked").val());
        let id = generateId($('#last_name').val(), $('#first_name').val(), dob, gender);
        let objectID = id.replace(/\s+/g, '');
        db.collection('Patients').doc(objectID).set({
            first_name: $('#first_name').val(),
            email: $('#email').val(),
            address: $('#address').val(),
            last_name: $('#last_name').val(),
            post_name: $('#post_name').val(),
            country: $('#country').val(),
            image_url: image_url,
            phone_number: $('#phone_number').val(),
            created_by: updater,
            last_update: updater,
            last_visit: visit,
            patient_id: id,
            treating_doctor:$('#treating-doctor').val(),
            allergies: $('#allergy').val(),
            medication: $('#med-list').val(),
            clinic_name: $('#clinic-name').val(),
            wear_glasses: isGlasses,
            handicap: $('#handicap').val(),
            profession: $('#profession').val(),
            province: $('#province').val(),
            country: $('#country').val(),
            id: objectID,
            other_info: $('#other-info').val(),
            city: $('#city').val(),
            status: status,
            gender: $("input[name='gender']:checked").val(),
            language: $('#language').val(),
            race: ($('#race').val()),
            date_of_birth: dob,
            registration_date: new Date()
        }).then(function () {
            console.log("Document successfully written!");
            $("#patient_saved").modal('show');
            window
        })
            .catch(function (error) {
                console.error("Error writing document: ", error);
            });
    };

    function saveImage() {
        let dob = new Date(($('#date_of_birth').val()));
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
              savePatient(downloadURL);
            });
          });

        }


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
    // DELETE EMPLOYEE
    $(document).on('click', '.js-delete-patient', function () {
        let id = $(this).attr('id');
        $('#delete-patient-form').attr('delete-id', id);
        $('#deletepatientModal').modal('show');
    });

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

    $("#addPatientModal").on('hidden.bs.modal', function () {
        $('#add-patient-form .form-control').val('');
    });

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