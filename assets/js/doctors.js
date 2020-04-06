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
const index = client.initIndex('vizion_DOCTORS');

var db = firebase.firestore();
var auth = firebase.auth();

$(document).ready(function () {
    let deleteIDs = [];
    let lastVisible;
    let firstVisible;

    // var calendarEl = $('#calendar');

    // var calendar = new FullCalendar.Calendar(calendarEl, {
    //   plugins: [ 'dayGrid' ]
    // });

    // calendar.render();

    var employee = JSON.parse(localStorage.getItem('employee'));

    if (!employee.isLoggedIn) {
        window.location.href = "login.html"
    }

    const searchClient = algoliasearch(
        '0EYAT8GY4A',
        '1daced3dbd31801ce59e339068cc1d34' // search only API key, not admin API key
    );

    const search = instantsearch({
        indexName: 'vizion_DOCTORS',
        searchClient,
        routing: true,
    });

    search.addWidgets([
        instantsearch.widgets.configure({
            hitsPerPage: 100,
        })
    ]);

    search.addWidgets([
        instantsearch.widgets.searchBox({
            container: '#search-box',
            placeholder: 'Recherche des docteurs',
        })
    ]);

    search.addWidgets([
        instantsearch.widgets.hits({
            container: '#hits',
            transformItems(items) {
                items.forEach ( item => {
                    if(item.image_url === "" || item.image_url === null || item.image_url === undefined) {
                        item.image_url = "assets/img/logo-eyeonly.jpg"
                    }
                })
                
                return items;
            },
            templates: {
                item: document.getElementById('hit-template').innerHTML,
                empty: `Aucun résultat pour votre <em>"{{query}}"</em>`,
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

        function renderPatient(document) {
        let time = moment(document.last_visit);
        console.log('firebase =>', document.patient_id)
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
        $('#patient-table').append(item);
        // Activate tooltip
        $('[data-toggle="tooltip"]').tooltip();
        // Select/Deselect checkboxes
        var checkbox = $('table tbody input[type="checkbox"]');
        $("#selectAll").click(function () {
            if (this.checked) {
                checkbox.each(function () {
                    console.log(this.id);
                    deleteIDs.push(this.id);
                    this.checked = true;
                });
            } else {
                checkbox.each(function () {
                    this.checked = false;
                });
            }
        });
        checkbox.click(function () {
            if (!this.checked) {
                $("#selectAll").prop("checked", false);
            }
        });
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

    $("#delete-patient-form").submit(function (event) {
        event.preventDefault();
        let id = $(this).attr('delete-id');
        if (id != undefined) {
            db.collection('patients').doc(id).delete()
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