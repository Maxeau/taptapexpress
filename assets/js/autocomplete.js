const client = algoliasearch("0EYAT8GY4A", "f4241ac047f713e6dced0f85dc7e7e99");
const patients = client.initIndex('vizion_PATIENTS');
const id = "";
const doctors = client.initIndex('vizion_DOCTORS');
const pricelist = client.initIndex('vizion_PRICELIST');

autocomplete('#aa-search-input', {}, [
    {
      source: autocomplete.sources.hits(patients, { hitsPerPage: 1 }),
      displayKey: 'full_name',
      templates: {
        header: '<div class="aa-suggestions-category">Patients</div>',
        suggestion(suggestion) {           
          return `<span>${suggestion._highlightResult.first_name.value} </span><span>${suggestion._highlightResult.last_name.value}</span>`;
        }
      }
    }
]).on('autocomplete:selected', (event, suggestion, dataset) => {
  $('#phone-number').val(suggestion.phone_number);
  $('#patient-id').val(suggestion.patient_id);
  $('#address').val(suggestion.address);
  $('#email').val(suggestion.email);
  patient.full_name = suggestion.full_name;
  patient.patient_id = suggestion.patient_id;
  patient.phone_number = suggestion.phone_number;
  patient.image_url = suggestion.image_url;
  patient.address = suggestion.address;
});

autocomplete('#aa-search-input2', {}, [
  {
    source: autocomplete.sources.hits(doctors, { hitsPerPage: 1 }),
    displayKey: 'full_name',
    templates: {
      header: '<div class="aa-suggestions-category">Docteurs</div>',
      suggestion(suggestion) {
        console.log('in doctors =>', suggestion._highlightResult.doctor_id.value)
        return `<span>${suggestion._highlightResult.first_name.value} </span><span>${suggestion._highlightResult.last_name.value}</span>`;
      },
    },
  },
]).on('autocomplete:selected', (event, suggestion, dataset) => {
  doctor.full_name = suggestion.full_name;
  doctor.doctor_id = suggestion.doctor_id;
  doctor.phone_number = suggestion.phone_number;
  doctor.image_url = suggestion.image_url;
});

autocomplete('#aa-search-input3', {}, [
  {
    source: autocomplete.sources.hits(pricelist, { hitsPerPage: 1 }),
    displayKey: 'service_name',
    templates: {
      header: '<div class="aa-suggestions-category">Service Offert</div>',
      suggestion(suggestion) {           
        return `<span>${suggestion._highlightResult.service_name.value} </span>`;
      }
    }
  }
]).on('autocomplete:selected', (event, suggestion, dataset) => {
$('#aa-search-input3').val(suggestion.service_name);
$('#category').val(suggestion.category);
$('#price-us').val(suggestion.USD);
$('#price-fc').val(suggestion.CDF);
// invoice.invoice_id = suggestion.invoice_id;
// invoice.category = suggestion.Category;
patient.price_us = suggestion.usd;
patient.price_fc = suggestion.cdf;
});

// import algoliasearch from 'algoliasearch';
// import autocomplete from 'autocomplete.js';

// const client = algoliasearch('GIZJAWY6UX', '396c3f2246c38da29bedfbe59c364400');
// const index = client.initIndex('wp_staging_todo_musearchable_posts');
// const index_accom = client.initIndex('wp_staging_todo_muposts_accommodations');
// const index_tour = client.initIndex('wp_staging_todo_muposts_themo_tour');

// autocomplete('#searchBox input[type=search]', { hint: false }, [
//   {
//     source: autocomplete.sources.hits(index, { hitsPerPage: 5 }),
//     displayKey: 'name',
//     templates: {
//       suggestion(suggestion) {
//         return suggestion._highlightResult.post_title.value;
//       },
//     },
//   },
// ]).on('autocomplete:selected', (event, suggestion, dataset) => {
//   console.log({ suggestion, dataset });
// });

// autocomplete('#searchBoxAccom input[type=search]', { hint: false }, [
//   {
//     source: autocomplete.sources.hits(index_accom, { hitsPerPage: 5 }),
//     displayKey: 'name',
//     templates: {
//       suggestion(suggestion) {
//         return suggestion._highlightResult.post_title.value;
//       },
//     },
//   },
// ]).on('autocomplete:selected', (event, suggestion, dataset) => {
//   console.log({ suggestion, dataset });
// });

// autocomplete('#searchBoxTour input[type=search]', { hint: false }, [
//   {
//     source: autocomplete.sources.hits(index_tour, { hitsPerPage: 5 }),
//     displayKey: 'name',
//     templates: {
//       suggestion(suggestion) {
//         return suggestion._highlightResult.post_title.value;
//       },
//     },
//   },
// ]).on('autocomplete:selected', (event, suggestion, dataset) => {
//   console.log({ suggestion, dataset });
// });
