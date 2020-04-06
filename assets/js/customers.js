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

const client = algoliasearch('0EYAT8GY4A', 'f4241ac047f713e6dced0f85dc7e7e99');
const index = client.initIndex('taptap_customerS');

var db = firebase.firestore();
var auth = firebase.auth();

$(document).ready(function () {
    let deleteIDs = [];
    let lastVisible;
    let firstVisible;

    var employee = JSON.parse(localStorage.getItem('employee'));

    if (!employee.isLoggedIn) {
        window.location.href = "login.html"
    }

    const searchClient = algoliasearch(
        '0EYAT8GY4A',
        '1daced3dbd31801ce59e339068cc1d34' // search only API key, not admin API key
    );

    const search = instantsearch({
        indexName: 'taptap_customerS',
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
            placeholder: 'Recherche des customers',
        })
    ]);

    search.addWidgets([
        instantsearch.widgets.hits({
            container: '#hits',
            transformItems(items) {
                items.forEach ( item => {
                    if (item.image_url == ""|| item.image_url == undefined) {
                        item.image_url = 'assets/img/logo-eyeonly.jpg'
                    }
                    item.last_visit = moment.unix(item.last_visit).format('ddd DD MMM YYYY');
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

    // ADD customer
    $("#add-customer-form").submit(function (event) {
        event.preventDefault();
        db.collection('customers').add({
            name: $('#customer-name').val(),
            email: $('#customer-email').val(),
            address: $('#customer-address').val(),
            phone: $('#customer-phone').val()
        }).then(function () {
            console.log("Document successfully written!");
            $("#addcustomerModal").modal('hide');
        })
            .catch(function (error) {
                console.error("Error writing document: ", error);
            });
    });

    // DELETE customer
    $(document).on('click', '.js-delete-customer', function () {
        let id = $(this).attr('id');
        $('#delete-customer-form').attr('delete-id', id);
        $('#deletecustomerModal').modal('show');
    });

    $("#delete-customer-form").submit(function (event) {
        event.preventDefault();
        let id = $(this).attr('delete-id');
        if (id != undefined) {
            db.collection('customers').doc(id).delete()
                .then(function () {
                    console.log("Document successfully delete!");
                    $("#deletecustomerModal").modal('hide');
                })
                .catch(function (error) {
                    console.error("Error deleting document: ", error);
                });
        } else {
            let checkbox = $('table tbody input:checked');
            checkbox.each(function () {
                db.collection('customers').doc(this.value).delete()
                    .then(function () {
                        console.log("Document successfully delete!");
                    })
                    .catch(function (error) {
                        console.error("Error deleting document: ", error);
                    });
            });
            $("#deletecustomerModal").modal('hide');
        }
    });

    // UPDATE EMPLOYEE
    $(document).on('click', '.js-edit-customer', function () {
        let id = $(this).attr('id');
        $('#edit-customer-form').attr('edit-id', id);
        db.collection('customers').doc(id).get().then(function (document) {
            if (document.exists) {
                $('#edit-customer-form #customer-name').val(document.data().name);
                $('#edit-customer-form #customer-email').val(document.data().email);
                $('#edit-customer-form #customer-address').val(document.data().address);
                $('#edit-customer-form #customer-phone').val(document.data().phone);
                $('#editcustomerModal').modal('show');
            } else {
                console.log("No such document!");
            }
        }).catch(function (error) {
            console.log("Error getting document:", error);
        });
    });

    $("#edit-customer-form").submit(function (event) {
        event.preventDefault();
        let id = $(this).attr('edit-id');
        db.collection('customers').doc(id).update({
            name: $('#edit-customer-form #customer-name').val(),
            email: $('#edit-customer-form #customer-email').val(),
            address: $('#edit-customer-form #customer-address').val(),
            phone: $('#edit-customer-form  #customer-phone').val()
        });
        $('#editcustomerModal').modal('hide');
    });

    $("#addcustomerModal").on('hidden.bs.modal', function () {
        $('#add-customer-form .form-control').val('');
    });

    $("#editcustomerModal").on('hidden.bs.modal', function () {
        $('#edit-customer-form .form-control').val('');
    });

    // PAGINATION
    $("#js-previous").on('click', function () {
        $('#customer-table tbody').html('');
        var previous = db.collection("customers")
            .orderBy(firebase.firestore.FieldPath.documentId(), "desc")
            .startAt(firstVisible)
            .limit(3);
        previous.get().then(function (documentSnapshots) {
            documentSnapshots.docs.forEach(doc => {
                rendercustomer(doc);
            });
        });
    });

    $('#js-next').on('click', function () {
        if ($(this).closest('.page-item').hasClass('disabled')) {
            return false;
        }
        $('#customer-table tbody').html('');
        var next = db.collection("customers")
            .startAfter(lastVisible)
            .limit(3);
        next.get().then(function (documentSnapshots) {
            documentSnapshots.docs.forEach(doc => {
                rendercustomer(doc);
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