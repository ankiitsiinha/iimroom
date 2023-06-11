window.addEventListener('DOMContentLoaded', () => {
  const roomAssignForm = document.getElementById('roomAssignForm');
  const resultDiv = document.getElementById('result');

  if (roomAssignForm) {
    roomAssignForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const registrationId = document.getElementById('registration_id').value;
      const gender = document.getElementById('gender').value;
      
      fetch('/assign-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `registration_id=${encodeURIComponent(registrationId)}&gender=${encodeURIComponent(gender)}`
      })
      .then(response => response.text())
      .then(data => {
        resultDiv.textContent = data;
        roomAssignForm.reset();
      })
      .catch(error => {
        console.error('Error:', error);
      });
    });
  }

  const clearAllotmentForms = document.getElementsByClassName('clear-allotment-form');
  if (clearAllotmentForms) {
    for (let i = 0; i < clearAllotmentForms.length; i++) {
      const form = clearAllotmentForms[i];
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const registrationId = form.querySelector('input[name="registration_id"]').value;

        fetch('/clear-allotment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: `registration_id=${encodeURIComponent(registrationId)}`
        })
        .then(response => {
          if (response.ok) {
            window.location.reload();
          } else {
            console.error('Error:', response.status);
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
      });
    }
  }
});

