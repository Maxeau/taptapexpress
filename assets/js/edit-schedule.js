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
var doctor = {};

if (!employee.isLoggedIn) {
    window.location.href = "login.html" 
}

var pickedMonth = '';
var pickedYear = '';
var pickedDay = '';
var doctor = {};
var image_url = String;

var db = firebase.firestore();
var auth = firebase.auth();

$(document).ready(function () {
    let deleteIDs = [];
    let lastVisible;
    let firstVisible; 

    window.addEventListener('load', function () {
        // Fetch all the forms we want to apply custom Bootstrap validation styles to
        var forms = document.getElementsByClassName('needs-validation');

        // Loop over them and prevent submission
        var validation = Array.prototype.filter.call(forms, function (form) {
            form.addEventListener('submit', function (event) {
                var doctorName = $('#aa-search-input2').val();
                var startTime = moment($('#start-time').val(), 'HH:mm A').diff(moment().startOf('day'), 'seconds');
                var endTime = moment($('#end-time').val(), 'HH:mm A').diff(moment().startOf('day'), 'seconds');
                var diff = endTime - startTime;
                console.log('doctorname=>', doctorName);
                event.preventDefault();  
                if (form.checkValidity() === false) {                       
                    event.stopPropagation();
                } else {

                    if (doctorName == '') {
                        alert("Le nom du docteur est obligatoire.");
                        return;
                    }

                    if (startTime === '') {
                        alert("L'Heure de début est obligatoire.");
                        return;
                    }
                    if (endTime === '') {
                        alert("L'Heure de fin est obligatoire.");
                        return;
                    }

                    if (startTime >= endTime) {
                        alert('Les heures sont invalides.');
                        return;
                    } else if (diff < 3600) {
                        alert('Minimum 1 heure de difference.');
                        return;
                    }
                        
                    saveSchedule();
                }
                form.classList.add('was-validated');
            }, false);
        });
    }, false);

      // RENDER PATIENT
      function renderSchedule(schedule) {
        console.log('date of time', employee)
        let sTime = ((schedule.start_time).seconds) * 1000;
        let eTime = ((schedule.end_time).seconds) * 1000;
        console.log('date of time', time)
        let startTime = (moment(new Date(sTime)).format("LT")).toString();
        let endTime = (moment(new Date(eTime)).format("LT")).toString();
        console.log('Start time =>', schedule.start_time);
        $("#schedule-id").val(schedule.schedule_id);
        $("#available-days").val(schedule.available_days);
        $("#start-time").val(schedule.startTime);
        $("#end-time").val(schedule.endTime);
        $("#schedule-message").val(schedule.message);

        $("#doctor-name").val(schedule.doctor_name);
        $("#doctor-name").change();

        if (employee.gender === "H") {
            $("#male").prop('checked', true);
        } else {
            $("#female").prop('checked', true);
        }

        if (schedule.status) {
            $("#active").prop('checked', true);
        } else {
            $("#inactive").prop('checked', true);
        }
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
  
    function saveSchedule() {
        let updater = {}
        updater.id = employee.id;
        updater.displayName = employee.displayName;
        updater.timestamp = new Date();
        if(employee.photoUrl === null ||employee.photoUrl === undefined) {
            employee.photoUrl = 'https://firebasestorage.googleapis.com/v0/b/vizionmd-3623b.appspot.com/o/vizion%2Fimages.png?alt=media&token=3d5fb8bb-b82b-492e-a50d-8db040da18fc'
        }
        updater.photoUrl = employee.photoUrl;
        // moment($('#start-time').val(), 'HH:mm')
        var sTime = moment($('#start-time').val(), ["HH:mm", "HH:mm [GMT]ZZ"], true);
        let startTime = new Date((sTime));
        var eTime = moment($('#end-time').val(), ["HH:mm", "HH:mm [GMT]ZZ"], true);
        let endTime = new Date((eTime));
        console.log('start time =>', startTime);
        console.log('end time =>', endTime)
        let id = (doctor.doctor_id).replace(/\s+/g, '');
        db.collection('Schedules').doc(id).set({
            doctor_name: $('#aa-search-input2').val(),
            message: $('#schedule-message').val(),
            start_time: startTime,
            end_time: endTime,
            id: id,
            created_by: updater,
            available_days: $('#available-days').val(),
            status: true
        }).then(function () {
            console.log("Document successfully written!");
            $("#schedule-saved").modal('show');
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