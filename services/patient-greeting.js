const express = require('express');
const axios = require('axios');

const router = express.Router();

function isDataAvailable(patient) {
  return patient.name && patient.name[0] && patient.name[0].given && patient.name[0].given[0];
}

function isValidPrefetch(request) {
  const data = request.body;
  if (!(data && data.prefetch && data.prefetch.patient)) {
    return false;
  }
  return isDataAvailable(data.prefetch.patient);
}

function retrievePatientResource(fhirServer, patientId, accessToken) {
  console.log(patientId);
  const headers = { Accept: 'application/json+fhir' };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  return axios({
    method: 'get',
    url: `${fhirServer}/Patient/${patientId}`,
    headers,
  }).then((result) => {
    if (result.data && isDataAvailable(result.data)) {
      return result.data;
    }
    throw new Error();
  });
}

function buildCard(patient) {
  const name = patient.name[0].given[0];
  console.log(name);
  return {
    cards: [ 
    {
      summary: `MCG Cite for Admission Documentation for patient: ${name}`,
      indicator: 'success',
      detail: 'SMART App Card for MCG Cite for Admission Documentation to support DTR use case',
      source: {
        label: 'Card for SMART on FHIR',
        //url: 'https://dev.smart.mcg.com/v2/smartapp/e9ecb262-d4c4-4261-881e-ffce4ca0d66a?tenantId=mcg.com&tenantSecret=tenant-secret-for-synapse&iss=https%3A%2F%2Fapi-v8-stu3.hspconsortium.org%2FMCGArchExplore%2Fdata&launch=XA2C9p'
        url: 'https://dev.smart.mcg.com/v2/smartapp/e9ecb262-d4c4-4261-881e-ffce4ca0d66a?tenantId=mcg.com&tenantSecret=tenant-secret-for-synapse'
      },
      links: [
        {
          label: "Criteria for DTR",
          //url: 'https://dev.smart.mcg.com/v2/smartapp/e9ecb262-d4c4-4261-881e-ffce4ca0d66a?tenantId=mcg.com&tenantSecret=tenant-secret-for-synapse&iss=https%3A%2F%2Fapi-v8-stu3.hspconsortium.org%2FMCGArchExplore%2Fdata&launch=XA2C9p',
          url: 'https://dev.smart.mcg.com/v2/smartapp/e9ecb262-d4c4-4261-881e-ffce4ca0d66a?tenantId=mcg.com&tenantSecret=tenant-secret-for-synapse',
          type: "smart"
        }
      ]
    }],
  };
}

// CDS Service endpoint
router.post('/', (request, response) => {
  console.log(request.body);
  if (!isValidPrefetch(request)) {
    const { fhirServer, fhirAuthorization } = request.body;
    let patient;
    if (request.body.context) {
      patient = request.body.context.patientId;
    }
    if (fhirServer && patient) {
      let accessToken;
      if (fhirAuthorization && fhirAuthorization.access_token) {
        accessToken = fhirAuthorization.access_token;
      }
      retrievePatientResource(fhirServer, patient, accessToken)
        .then((result) => {
          response.json(buildCard(result));
        }).catch(() => {
          response.sendStatus(412);
        });
      return;
    }
    response.sendStatus(412);
    return;
  }
  const resource = request.body.prefetch.patient;
  response.json(buildCard(resource));
});

module.exports = router;
