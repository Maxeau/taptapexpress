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

const client = algoliasearch('0EYAT8GY4A', 'f4241ac047f713e6dced0f85dc7e7e99');
const index = client.initIndex('vizion_APPOINTMENTS');

var db = firebase.firestore();
var auth = firebase.auth();
var patient = {};

$(document).ready(function () {
    let deleteIDs = [];
    let lastVisible;
    let firstVisible;
    let deleteID = '';

    var employee = JSON.parse(localStorage.getItem('employee'));

    const searchClient = algoliasearch(
        '0EYAT8GY4A',
        '1daced3dbd31801ce59e339068cc1d34' // search only API key, not admin API key
    );

    const search = instantsearch({
        indexName: 'vizion_APPOINTMENTS',
        filter: 'doctor_id:WELM20021906',
        searchClient,
        routing: true,
    });

    // index.searchForFacetValues({
    //     facetName: 'doctor_id',
    //     facetQuery: employee.doctor_id,
    //   }, (err, { facetHits } = {}) => {
    //     if (err) throw err;
      
    //     console.log(facetHits);
    //   });

    search.addWidgets([
        instantsearch.widgets.configure({
            hitsPerPage: 100,
        })
    ]);

    search.addWidgets([
        instantsearch.widgets.searchBox({
            container: '#search-box',
            placeholder: 'Recherche des rendez-vous',
        })
    ]);

    search.addWidgets([
        instantsearch.widgets.hits({
            container: '#hits',
            transformItems(items) {
                items.forEach ( item => {
                    item.apt_date = moment.unix(item.apt_date).format('ddd DD MMM YYYY HH:MM');
                })
                
                return items;
            },
            templates: {               
                item: document.getElementById('apt-template').innerHTML,
                empty: `Pas de rendez-vous`,
            },
        })
    ]);

    search.start();

    // if (!auth.currentUser) {
    //     console.log('in auth =>')
    //     window.location.replace("login.html");
    // } 
    // index.setSettings({
    //     keepDiacriticsOnCharacters: 'çé'
    //   });


    // index.search((err, { hits } = {}) => {

    //     hits.forEach(hit => {
    //         var ln = ((hit.last_name).replace(/\s+/g, '')).toLowerCase();
    //         ln = ln[0].toUpperCase() + ln.slice(1);
    //         var pn = ((hit.post_name).replace(/\s+/g, '')).toLowerCase();
    //         if (hit.post_name != "") {
    //         pn = pn[0].toUpperCase() + ln.slice(1);
    //         console.log('name change =>', pn, ln);
    //         };
    //         db.collection("Patients").doc(hit.objectID).update('last_name', ln, 'post_name', pn);
    //         var patientRef = db.collection("Patients").doc(hit.objectID);
    //         var removeName = patientRef.update({
    //             last_mame: firebase.firestore.FieldValue.delete()
    //         });
    //     });
    // });
    // });
    // index.search((err, { hits } = {}) => {

    //     hits.forEach(hit => {
    //         let patient = {};
    //         patient.first_name = hit.first_name;
    //         patient.last_name = hit.last_name;
    //         patient.last_visit = new Date(moment(hit.last_visit));
    //         patient.date_of_birth = new Date(moment(hit.date_of_birth));
    //         patient.email = ((hit.first_name).replace(/\s+/g, '')).toLowerCase() + ((hit.last_name).replace(/\s+/g, '')).toLowerCase() + "@vizionmd.com";
    //         patient.phone_number = (hit.phone_number);
    //         patient.phone_number2 = (hit.phone_number2);
    //         patient.id = hit.objectID;
    //         patient.post_name = hit.post_name;
    //         patient.company = hit.company;
    //         patient.gender = hit.gender;
    //         patient.province = "Kinshasa";
    //         patient.patient_id = hit.patient_id;
    //         patient.address = hit.address;
    //         patient.country = "RDC";
    //         patient.status = false;
    //         patient.race = hit.race;
    //         patient.handicap = "Aucun";
    //         patient.profession = "Aucun";
    //         patient.language = "Français";
    //         patient.city = hit.city;
    //         // console.log('In the Index =>', patient)
    //         db.collection("Patients").doc(hit.objectID).set(patient);
    //     });
    //   });

   // REAL TIME LISTENER
    db.collection('Appointments').onSnapshot(snapshot => {
        let size = snapshot.size;
        $('.count').text(size);
        if (size == 0) {
            $('#selectAll').attr('disabled', true);
        } else {
            $('#selectAll').attr('disabled', false);
        }
        let changes = snapshot.docChanges();
        changes.forEach(change => {
            if (change.type == 'added') {
                renderPatient(change.doc);
            } else if (change.type == 'modified') {
                $('tr[data-id=' + change.doc.id + ']').remove();
                renderPatient(change.doc);
            } else if (change.type == 'removed') {
                $('tr[data-id=' + change.doc.id + ']').remove();
            }
        });
    });

   
    function renderPatient(document) {
        let time = moment(document.last_visit);
        let visit = (new Date(time));
        let item = `<tr data-id="${document.id}">
        <td>
            <span class="custom-checkbox">
                <input type="checkbox" id="${document.id}" name="options[]" value="${document.id}">
                <label for="${document.id}"></label>
            </span>
        </td>
        <td>${document.patient_id}</td>
        <td><img width="28" height="28" src="${document.image_url}" class="rounded-circle m-r-5" alt="">${document.first_name} ${document.last_name}</td>
        <td>${time}</td>
        <td>${document.phone_number}</td>
        <td class="text-right">
            <div class="dropdown dropdown-action">
                <a href="#" class="action-icon dropdown-toggle" data-toggle="dropdown" aria-expanded="false"><i class="fa fa-ellipsis-v"></i></a>
                <div class="dropdown-menu dropdown-menu-right">
                    <a class="dropdown-item" href="patient-info.html?patientID=${document.id}"><i class="fa fa-pencil m-r-5"></i> Modifier</a>
                    <a class="dropdown-item" href="#" data-toggle="modal" data-target="#delete_patient"><i class="fa fa-trash-o m-r-5"></i> Supprimer</a>
                </div>
            </div>
        </td>
    </tr>`;
    }

    // ADD EMPLOYEE
    $("#add-patient-form").submit(function (event) {
        event.preventDefault();
        db.collection('patients').add({
            name: $('#patient-name').val(),
            email: $('#patient-email').val(),
            address: $('#patient-address').val(),
            phone: $('#patient-phone').val()
        }).then(function () {
            console.log("Document successfully written!");
            $("#addPatientModal").modal('hide');
        })
            .catch(function (error) {
                console.error("Error writing document: ", error);
            });
    });

    // DELETE EMPLOYEE
    $(document).on('click', '.js-delete-patient', function () {
        let id = $(this).attr('id');
        $('#delete-patient-form').attr('delete-id', id);
        $('#deletepatientModal').modal('show');
    });

    $("#delete-apt-form").submit(function (event) {
        event.preventDefault();
        let id = $('#delete-selected').attr('delete-id');
        console.error("deleting document ID: ", id);
        if (id != undefined) {
            db.collection('Appointments').doc(id).delete()
                .then(function () {
                    console.log("Document successfully delete!");
                    $("#delete_appointment").modal('hide');
                    window.location.href = "index.html"
                })
                .catch(function (error) {
                    console.error("Error deleting document: ", error);
                });
        }
    });

    // UPDATE EMPLOYEE
    $(document).on('click', '.js-edit-patient', function () {
        let id = $(this).attr('id');
        $('#edit-patient-form').attr('edit-id', id);
        db.collection('patients').doc(id).get().then(function (document) {
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
        db.collection('patients').doc(id).update({
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
        var previous = db.collection("patients")
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
        var next = db.collection("patients")
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