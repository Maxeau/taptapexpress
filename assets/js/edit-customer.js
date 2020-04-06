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

let uid = document.location.search.replace(/^.*?\=/, '');

var pickedMonth = '';
var pickedYear = '';
var pickedDay = '';

var db = firebase.firestore();

$(document).ready(function () {
    let deleteIDs = [];
    let lastVisible;
    let firstVisible;
    // REAL TIME LISTENER
    db.collection('Patients').doc(uid).get().then(function (doc) {
        renderPatient(doc.data());
    });


    window.addEventListener('load', function() {
        // Fetch all the forms we want to apply custom Bootstrap validation styles to
        var forms = document.getElementsByClassName('needs-validation');
        // Loop over them and prevent submission
        var validation = Array.prototype.filter.call(forms, function(form) {
          form.addEventListener('submit', function(event) {
            let phone=("#phone_number").val();
            var intRegex = /[0-9 -()+]+$/;
            var emailReg = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
            event.preventDefault();
            if (form.checkValidity() === false) {
              event.stopPropagation();
            } else {   

                if ((phone.length < 6) || (!intRegex.test(phone))) {
                    alert('Le numéro de téléphone est invalide.');
                    return;
                }
                
                if (!emailReg.test(email)) {
                    alert('Please enter a valid email address.');
                    return false;
                }       
            updatePatient();
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

    var cleave = new Cleave('#phone_number', {
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
    function updatePatient() {
        console.log('inside updatePatient =>', $("input[name='status']:checked").val());
        let status = eval($("input[name='status']:checked").val());
         var date = moment($('#date_of_birth').val(), "dd D MMM YYYY", "en");
        let dob = new Date(date); 
        let gender = ($("input[name='gender']:checked").val() === "F") ? "06" : "13";
        let id = generateId($('#last_name').val(), $('#first_name').val(), dob, gender)
        let objectID = id.replace(/\s+/g, '');
        console.log('inside update =>', id)
            db.collection('Patients').doc(uid).set({
                first_name: $('#first_name').val(),
                email: $('#email').val(),
                address: $('#address').val(),
                last_name: $('#last_name').val(),
                post_name: $('#post_name').val(),
                phone_number: $('#phone_number').val(),
                handicap: $('#handicap').val(),
                profession: $('#profession').val(),
                province: $('#province').val(),
                country: $('#country').val(),
                patient_id: objectID,
                city: $('#city').val(),
                status: status,
                gender: $("input[name='gender']:checked").val(),
                language: $('#language').val(),
                race: ($('#race').val()),
                date_of_birth: dob
            }, { merge: true }).then(function () {
                console.log("Document successfully written!");
                $("#patient_saved").modal('show');
            })
                .catch(function (error) {
                    console.error("Error writing document: ", error);
                });
    };

    // GENERATE PATIENT ID
    function generateId(ln,fn,dob,gender) {
        
        var date = dob.getDate();

        if (date <= 9) {
            date = "0" + date;
        }
        var month = dob.getMonth() + 1;

        if (month <= 9) {
            month = "0" + month;
        }
        var year = ((dob.getFullYear()).toString()).substring(2,4);
        let id = (ln.substring(0, 3)).toUpperCase() + (fn.substring(0, 1)).toUpperCase() + " " + year + month + " " + date + gender;
        return id
    }
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