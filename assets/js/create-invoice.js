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

var pickedMonth = '';
var pickedYear = '';
var pickedDay = '';
var patient = {};
var doctor = {};

var db = firebase.firestore();

$(document).ready(function () {
    let deleteIDs = [];
    let lastVisible;
    let firstVisible;
    // REAL TIME LISTENER
    db.collection('Invoices').doc(uid).get().then(function (doc) {
        renderInvoices(doc.data());
    });


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
                    // console.log('inside save apt =>', patient, doctor);      
                    saveInvoices();
                }
                form.classList.add('was-validated');
            }, false);
        });
    }, false);

    function renderInvoices(invoice) {

        let date = (invoice.apt_date).seconds * 1000;
        let time = (invoice.apt_time).seconds * 1000;
        let invDate = (new Date(date));
        let invTime = (new Date(time));
        $("#invoice-id").val(invoice.invoice_id);
        $("#address").val(invoice.address);
        $("#aa-search-input").val(invoice.full_name);
        $("#aa-search-input2").val(invoice.doctor_fullname);
        $("#aa-search-input3").val(invoice.item_fullname);
        $("#payment-date").val(invoice.invoice_date);
        $("#email").val(invoice.email);
        $("#payment-method").val(invoice.payment_method);
        $("#phone-number").val(invoice.phone_number);
        $("#tax").val(invoice.taxes);
        $("#company-name").val(invoice.company);
        $("#other-info").val(invoice.other_info);
        $("#add-item").val(invoice.invoice_id);
        $("#remove-item").val(invoice.invoice_id);

        if (invoices.status) {
            $("#active").prop('checked', true);
        } else {
            $("#inactive").prop('checked', true);
        }
    };

    // ADD APPOINTMENT
    function saveInvoices() {
        var date = new Date($('#datetimepicker3').val());
        // var date = moment($('#datetimepicker3').val());
        console.log('date picked =>', doctor.doctor_id)
        if (patient.image_url == undefined) {
            patient.image_url = "assets/img/logo-eyeonly.jpg"
        };
        let docID = doctor.id;
        var time = Math.floor((new Date().getTime()) / 1000);
        let invoiceID = "VMD-INV-" + time;
        let objectID = invoiceID;
        console.log('inside save apt =>', objectID);
        db.collection('Invoices').doc(objectID).set({
            phone_number: $('#phone-number').val(),
            invoice_id: invoiceID,
            taken_by: employee,
            status: true,
            patient_id: patient.patient_id,
            doctor_id: doctor.doctor_id,
            patient: patient,
            doctor: doctor,
            full_name: patient.full_name,
            doctor_fullname: doctor.full_name,
            other_info: $('#other-info').val(),
            company: $('#company-name').val(),
            invoice_date: $('#payment-date').val(),
            payment_method: $('#payment-method').val(),
            creadted_date: new Date(),
            address: $('#address').val(),
            taxes: $('#tax').val(),


        }).then(function () {
            console.log("Document successfully written!");
            $("#invoice_saved").modal('show');
        })
            .catch(function (error) {
                console.error("Error writing document: ", error);
            });
    };

    // ADD ITEM
    $(document).on('click', '#add-item', function () {
        // var Item = $("#aa-search-input3").val();
        // var description = $("#category").val();
        // var cost = $("#cost").val();
        // var qty = $("#qty").val();
        // var itemsub = $("#item_subtotal").val();
        var markup = "<tr><td>1</td><td><input class='form-control' type='search' id='aa-search-input3' placeholder='Rechercher' name='search' autocomplete='off' style='min-width:150px' /></td><td><input id='category' class='form-control' type='text' style='min-width:150px'></td><td><input id='cost' class='form-control' style='width:100px' type='text'></td><td><input id='qty' class='form-control' style='width:80px' type='text'></td><td><input id='item_amount' class='form-control form-amt' readonly='' style='width:120px' type='text'></td><td><a href='javascript:void(0)' class='text-success font-18' title='Add' id='add-item'><i class='fa fa-plus'></i></a></td><td><a href='javascript:void(0)' class='text-danger font-18' title='Remove' id='remove'><i class='fa fa-trash-o'></i></a></td></tr>";
        $("#item-table").append(markup);
    });

    // Find and remove selected table rows
    $(document).on('click', '#remove-item', function () {
        $("#item-table").find('input[name="record"]').each(function () {
            $(this).parents("tr").remove();
        });
    });


    function generateId(ln, fn, dob, gender) {
        var date = dob.getDate();
        var month = dob.getMonth() + 1;
        var year = ((dob.getFullYear()).toString()).substring(2, 4);
        let id = (ln.substring(0, 3)).toUpperCase() + (fn.substring(0, 1)).toUpperCase() + " " + year + month + " " + date + gender;
        return id
    };
    // DELETE APPOINTMENT
    $(document).on('click', '.js-delete-appointment', function () {
        let id = $(this).attr('id');
        $('#delete-appointment-form').attr('delete-id', id);
        $('#deleteApponitmentModal').modal('show');
    });

    $("#delete-appointment-form").submit(function (event) {
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
