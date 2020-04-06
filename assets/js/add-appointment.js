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

var pickedMonth = '';
var pickedYear = '';
var pickedDay = '';
var patient = {};
var doctor = {};
var db = firebase.firestore();

if(uid != null) {
db.collection('Appointments').doc(uid).get().then(function (doc) {
    renderAppointment(doc.data());
});
}



$(document).ready(function () {
    let deleteIDs = [];
    let lastVisible;
    let firstVisible;
    // REAL TIME LISTENER
  
    window.addEventListener('load', function() {
        // Fetch all the forms we want to apply custom Bootstrap validation styles to
        var forms = document.getElementsByClassName('needs-validation');
        // Loop over them and prevent submission
        var validation = Array.prototype.filter.call(forms, function(form) {
          form.addEventListener('submit', function(event) {
            event.preventDefault();
            if (form.checkValidity() === false) {
              event.stopPropagation();
            } else {    
                // console.log('inside save apt =>', patient, doctor);      
            // saveAppointment();
            }
            form.classList.add('was-validated');
          }, false);
        });
      }, false);

    });

     function renderAppointment(apt) {
        console.log('apt-date =>', apt);
        let date = moment((apt.apt_date).toDate()).format('dd D MMM YYYY HH:mm', 'fr');
        console.log('apt-date =>', date);
        $("#patient-id").val(apt.patient.patient_id);
        $("#phone-number").val(apt.phone_number);
        $("#aa-search-input").val(apt.patient.full_name);
        $("#aa-search-input2").val(apt.doctor.full_name);
        $("#apt-date").val(date);
        $("#email").val(apt.email);
        $("#message").val(apt.message);

        if (apt.status) {
            $("#active").prop('checked', true);
        } else {
            $("#inactive").prop('checked', true);
        }
    }

      // RENDER PATIENT
      function renderPatient(patient) {
        if (patient.image_url == ""|| patient.image_url == undefined) {
            patient.image_url = 'assets/img/logo-eyeonly.jpg'
        }
        let dob = moment((patient.date_of_birth).toDate()).format('dd D MMM YYYY', 'fr');
        $("#patient_id").val(patient.patient_id);
        $("#image").attr("src", patient.image_url);
        $("#phone_number").val(patient.phone_number);
        $("#first_name").val(patient.first_name);
        $("#last_name").val(patient.last_name);
        $("#post_name").val(patient.post_name);
        $("#date_of_birth").val(dob);
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
    }

    // ADD APPOINTMENT
    function saveAppointment() {
        var date = new Date($('#datetimepicker3').val());
        // var date = moment($('#datetimepicker3').val());
        console.log('date picked =>', date)
        let docID = doctor.id;
        let patientID = patient.patient_id.replace(/\s+/g, '');
        let objectID = Date.now().toString();
        console.log('inside save apt =>', objectID);
            db.collection('Appointments').doc(objectID).set({
                phone_number: $('#phone-number').val(),
                id: objectID,
                taken_by: employee,
                status: true,
                patient_id: patientID,
                doctor_id: docID,
                patient: patient,
                doctor: doctor,
                message: ($('#message').val()),
                apt_date: date,
                creadted_date:  new Date()
            }).then(function () {
                console.log("Document successfully written!");
                $("#apt_saved").modal('show');
                $(needs-validation)[0].reset();

            })
                .catch(function (error) {
                    console.error("Error writing document: ", error);
                });
    };


    function generateId(ln,fn,dob,gender) {
        
        var date = dob.getDate();
        var month = dob.getMonth() + 1;
        var year = ((dob.getFullYear()).toString()).substring(2,4);
        let id = (ln.substring(0, 3)).toUpperCase() + (fn.substring(0, 1)).toUpperCase() + " " + year + month + " " + date + gender;
        return id
    }
    // DELETE APPOINTMENT
    $(document).on('click', '.js-delete-appointment', function () {
        let id = $(this).attr('id');
        $('#delete-appointment-form').attr('delete-id', id);
        $('#deleteApponitmentModal').modal('show');
    });

    $("#delete-appointment-form").submit(function (event) {
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

    $("#edit-appointment-form").submit(function (event) {
        event.preventDefault();
        let id = $(this).attr('edit-id');
        db.collection('Appointments').doc(id).update({
            name: $('#edit-patient-form #patient-name').val(),
            email: $('#edit-patient-form #patient-email').val(),
            address: $('#edit-patient-form #patient-address').val(),
            phone: $('#edit-patient-form  #patient-phone').val()
        });
        $('#editpatientModal').modal('hide');
    });

    $("#add-appointment-modal").on('hidden.bs.modal', function () {
        $('#add-appointment-form .form-control').val('');
    });

    $("#editpatientModal").on('hidden.bs.modal', function () {
        $('#edit-patient-form .form-control').val('');
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