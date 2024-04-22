document.addEventListener('DOMContentLoaded', function() {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email());

  // By default, load the inbox
  load_mailbox('inbox');

  // Add event listener to the compose form
  document.querySelector('#compose-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    // Collect values from the form fields
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;

    // Create a JSON object with the email data
    const emailData = {
      recipients: recipients,
      subject: subject,
      body: body
    };

    // Make a POST request to send the email
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify(emailData),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (response.ok) {
        // Email sent successfully, show success message
        return response.json(); // Parse response body as JSON
      } else {
        // Handle errors if any
        console.error('Failed to send email');
        alert('Failed to send email. Please try again later.');
        throw new Error('Failed to send email');
      }
    })
    .then(data => {
      // Display success message
      alert(data.message);
      // Load the sent mailbox
      load_mailbox('sent');
    })
    .catch(error => {
      console.error('Error:', error);
    });
  });

  // Add event listener to handle trash and read operations
  document.querySelector('#emails-view').addEventListener('click', function(event) {
    const target = event.target;
    if (target.classList.contains('trashBtn')) {
      const emailId = target.dataset.emailId;
      handleTrash(emailId);
    } else if (target.classList.contains('list-group-item')) {
      const emailId = target.dataset.emailId;
      view_email(emailId);
    }
  });
});



function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-detail-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Clear out any existing email content
  document.querySelector('#emails-view').innerHTML = '';

  // Make a GET request to fetch emails for the specified mailbox
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      // Process the fetched emails and render them on the page
      const emailsHTML = emails.map(email => `
        <a href="#" class="list-group-item list-group-item-action ${email.read ? '' : 'unread-email'}" data-email-id="${email.id}">
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">${email.subject}</h5>
            <small>${email.timestamp}</small>
          </div>
          <p class="mb-1">From: ${email.sender}</p>
          <small>To: ${email.recipients}</small>
        </a>
      `).join('');

      // Add the email elements to the emails view
      document.querySelector('#emails-view').innerHTML = emailsHTML;

      // Add click event listeners to view the email details and mark as read
      document.querySelectorAll('.list-group-item').forEach((emailElement, index) => {
        emailElement.addEventListener('click', () => {
          view_email(emails[index].id, mailbox);
          emailElement.classList.remove('unread-email'); // Remove unread style when clicked
        });
      });
    })
    .catch(error => console.error('Error fetching emails:', error));
}


function view_email(email_id, mailbox) {
  // Fetch email details
  fetch(`/emails/${email_id}`)
    .then(response => response.json())
    .then(email => {
      // Hide the emails list view
      document.querySelector('#emails-view').style.display = 'none';
      
      // Display email details in the email detail view
      // Display email details in the email detail view
const emailDetailContainer = document.querySelector('#email-detail-view');
emailDetailContainer.innerHTML = `
<div id="email-subject">${email.subject}</div> 
<div class="email-head-sender d-flex align-items-center justify-content-between flex-wrap">
  <div class="d-flex align-items-center">
    <div class="avatar">
      <img src="https://bootdey.com/img/Content/avatar/avatar1.png" alt="Avatar" class="rounded-circle user-avatar-md">
    </div>
    <div class="sender d-flex align-items-center">
      <a href="#"> <span>From</span>${email.sender}</a> 
      <div class="actions dropdown">
        <a class="icon" href="#" data-toggle="dropdown">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-down">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </a>
        <div class="dropdown-menu" role="menu">
          <a class="dropdown-item" href="#">Mark as read</a>
          <a class="dropdown-item" href="#">Mark as unread</a>
          <a class="dropdown-item" href="#">Spam</a>
          <div class="dropdown-divider"></div>
          <a class="dropdown-item text-danger" href="#">Delete</a>
        </div>
      </div>
    </div>
  </div>
  <div class="date">${email.timestamp}</div>
</div>
<div class="email-body">
  <p>${email.body}</p>
</div>

<div class="actions">
  <button id="replyBtn" onclick="reply_to_email(${email_id})">
    <!-- SVG Icon for Reply -->
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#707070">
      <path d="M20 17V15.8C20 14.1198 20 13.2798 19.673 12.638C19.3854 12.0735 18.9265 11.6146 18.362 11.327C17.7202 11 16.8802 11 15.2 11H4M4 11L8 7M4 11L8 15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    Reply
  </button>
  
  <button onclick="openShareModal()">
    <!-- SVG Icon for Share -->
    <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="matrix(1, 0, 0, -1, 0, 0)rotate(180)">
        <path d="M20 17V15.8C20 14.1198 20 13.2798 19.673 12.638C19.3854 12.0735 18.9265 11.6146 18.362 11.327C17.7202 11 16.8802 11 15.2 11H4M4 11L8 7M4 11L8 15" stroke="#666666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    Share
</button>

<div id="actions2">
${mailbox === 'inbox' ? '<button id="archiveBtn" onclick="archive_email(' + email_id + ')"><svg class="archiveIcon" width="50" height="50" viewBox="0 0 30 30" fill="#080341" xmlns="http://www.w3.org/2000/svg"><path class="archivePath" d="M6.75 6L7.5 5.25H16.5L17.25 6V19.3162L12 16.2051L6.75 19.3162V6ZM8.25 6.75V16.6838L12 14.4615L15.75 16.6838V6.75H8.25Z"/></svg> </button>' : ''}
${mailbox === 'archive' ? '<button id="archiveBtn"  onclick="unarchive_email(' + email_id + ')"><svg width="36" height="33" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 2L2 22" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M20.68 8.70996V19.71C20.68 21.72 19.24 22.57 17.48 21.59L11 17.54" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.31995 19.95V5.86C3.31995 3.74 5.04995 2 7.17995 2H16.8299C18.0399 2 19.1199 2.56 19.8299 3.44" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg> </button>' : ''}

  <!-- Botón para el icono de Trash -->
  <button id="trashBtn" onclick="handleTrash(${email_id})" title="Delete email">
    <svg width="40px" height="40px" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6L17.1991 18.0129C17.129 19.065 17.0939 19.5911 16.8667 19.99C16.6666 20.3412 16.3648 20.6235 16.0011 20.7998C15.588 21 15.0607 21 14.0062 21H9.99377C8.93927 21 8.41202 21 7.99889 20.7998C7.63517 20.6235 7.33339 20.3412 7.13332 19.99C6.90607 19.5911 6.871 19.065 6.80086 18.0129L6 6M4 6H20M16 6L15.7294 5.18807C15.4671 4.40125 15.3359 4.00784 15.0927 3.71698C14.8779 3.46013 14.6021 3.26132 14.2905 3.13878C13.9376 3 13.523 3 12.6936 3H11.3064C10.477 3 10.0624 3 9.70951 3.13878C9.39792 3.26132 9.12208 3.46013 8.90729 3.71698C8.66405 4.00784 8.53292 4.40125 8.27064 5.18807L8 6M14 10V17M10 10V17" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>
</div>

`;

      // Show the email detail view
      emailDetailContainer.style.display = 'block';
      // Mark the email as read
      mark_email_as_read(email_id);

      // Activate Bootstrap dropdowns
      $('.dropdown-toggle').dropdown();
    })
    .catch(error => console.error('Error fetching email:', error));
}

function reply_to_email(email_id) {
  // Fetch email details
  fetch(`/emails/${email_id}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch email details');
      }
      return response.json();
    })
    .then(email => {
      // Show the modal container with gray background
      document.querySelector('#modal-container').style.display = 'block';

      // Show the compose view within the modal
      document.querySelector('#compose-view').style.display = 'block';

      // Pre-fill composition fields
      document.querySelector('#compose-recipients').value = email.sender;
      document.querySelector('#compose-subject').value = email.subject.startsWith('Re: ') ? email.subject : `Re: ${email.subject}`;
      document.querySelector('#compose-body').value = ""; // Clear previous email body

      // Set up event listener for the submit button in the modal
      document.querySelector('#compose-form').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission

        // Collect values from the form fields
        const recipients = document.querySelector('#compose-recipients').value;
        const subject = document.querySelector('#compose-subject').value;
        const body = document.querySelector('#compose-body').value;

        // Create a JSON object with the reply email data
        const replyData = {
          recipients: recipients,
          subject: subject,
          body: body
        };

        // Make a POST request to send the email
        fetch('/emails', {
          method: 'POST',
          body: JSON.stringify(replyData),
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(response => {
          if (response.ok) {
            // Email sent successfully, close the modal
            document.querySelector('#modal-container').style.display = 'none';
            // Optionally, you can reload the mailbox or do any other action you want
            // For example: load_mailbox('inbox');
          } else {
            // Handle errors if any
            console.error('Failed to send email');
            alert('Failed to send email. Please try again later.');
            throw new Error('Failed to send email');
          }
        })
        .catch(error => {
          console.error('Error:', error);
        });
      });
    })
    .catch(error => {
      console.error('Error fetching email:', error);
      // Display error message to the user
      alert('Failed to fetch email details. Please try again later.');
    });
}


// Function to mark email as read
function mark_email_as_read(email_id) {
  // Send a PUT request to mark the email as read
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to mark email as read');
    }
  })
  .catch(error => console.error('Error marking email as read:', error));
}

// Function to compose email
function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-detail-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}


document.addEventListener('DOMContentLoaded', function() {
  // When the user clicks the button to open the compose modal
  document.getElementById('compose').onclick = function() {
    document.getElementById('modal-container').style.display = 'block';
  };

  // Optional: Close the modal when the user clicks anywhere outside of it
  window.onclick = function(event) {
    let modal = document.getElementById('modal-container');
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };

  // Add event listener to the compose form for handling submission
  document.querySelector('#compose-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    // Collect values from the form fields
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;

    // Create a JSON object with the email data
    const emailData = {
      recipients: recipients,
      subject: subject,
      body: body
    };

    // Make a POST request to send the email
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify(emailData),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (!response.ok) {
        // If there's an error response, handle it
        throw new Error('Invalid recipient or email not found.');
      }
      return response.json(); // Parse response body as JSON
    })
    .then(data => {
      // Display success message
      alert(data.message);
      // Load the sent mailbox
      load_mailbox('sent');
    })
    .catch(error => {
      // Display error message to the user
      console.error('Error:', error);
      alert('Invalid recipient or email not found.');
    });
  });
});



function handleTrash(email_id)  {
  // Mostrar el modal de confirmación
  $('#deleteConfirmationModal').modal('show');

  // Configurar el evento de click en el botón de confirmación dentro del modal
  $('#confirmDeleteButton').on('click', function() {
    // Ocultar el modal de confirmación
    $('#deleteConfirmationModal').modal('hide');

    // Realizar la eliminación del correo electrónico
    fetch(`/email/${email_id}/`, {
      method: 'DELETE',
      headers: {
        'X-CSRFToken': csrftoken
      }
    })
    .then(response => {
      if (response.ok) {
        // Si la eliminación es exitosa, recarga la bandeja de entrada
        load_mailbox('inbox');
      } else {
        // Si hay algún error, muestra un mensaje de error al usuario
        console.error('Error al eliminar el correo electrónico');
        alert('Error al eliminar el correo electrónico. Por favor, inténtalo de nuevo más tarde.');
      }
    })
    .catch(error => console.error('Error:', error));
  });
}

// Function to archive email
function archive_email(email_id) {
  // Send a PUT request to mark the email as archived
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: true
    })
  })
  .then(response => {
    if (response.ok) {
      // Email archived successfully, display a success alert
      showSuccessAlert('Email archived successfully.');
      // Reload the inbox
      load_mailbox('inbox');
    } else {
      throw new Error('Failed to archive email');
    }
  })
  .catch(error => {
    console.error('Error archiving email:', error);
    showErrorAlert('Error archiving email. Please try again later.');
  });
}

// Function to unarchive email
function unarchive_email(email_id) {
  // Display the confirmation modal
  $('#deleteConfirmationModal').modal('show');

  // Configure the click event on the confirmation button within the modal
  $('#confirmDeleteButton').on('click', function() {
    // Hide the confirmation modal
    $('#deleteConfirmationModal').modal('hide');

    // Send a PUT request to mark the email as unarchived
    fetch(`/emails/${email_id}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: false
      })
    })
    .then(response => {
      if (response.ok) {
        // Email unarchived successfully, display a success alert
        showSuccessAlert('Email unarchived successfully.');
        // Reload the inbox
        load_mailbox('inbox');
      } else {
        throw new Error('Failed to unarchive email');
      }
    })
    .catch(error => {
      console.error('Error unarchiving email:', error);
      showErrorAlert('Error unarchiving email. Please try again later.');
    });
  });
}


function showErrorAlert(message) {
  // Create an alert element with Bootstrap classes for danger
  const alertElement = `
    <div class="alert alert-danger alert-dismissible fade show" role="alert">
      <strong>Error:</strong> ${message}
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  `;

  // Append the alert element to the body
  document.body.insertAdjacentHTML('beforeend', alertElement);
}

function showSuccessAlert(message) {
  // Display a success message to the user using the alert method
  alert(message);
}


let currentEmailId = null; // This will hold the email ID of the currently viewed email

function openShareModal() {
  // Set the currentEmailId before showing the modal, based on the opened email
  // For example, if you have a global variable or if the email ID is stored in a custom attribute
  // currentEmailId = the ID of the currently viewed email
  $('#shareModal').modal('show');
}

function getEmailId() {
  // Simply return the currentEmailId which should be set when an email is opened
  return currentEmailId;
}

function sendShare() {
  const recipientEmail = document.getElementById('recipientEmail').value;
  const emailId = getEmailId();

  if (!recipientEmail.trim()) {
    alert('Please enter a recipient email.');
    return;
  }

  // Ensure that the email ID is not null or undefined
  if (!emailId) {
    alert('Email ID is not available. Please try again later.');
    return;
  }

  // Adjust the endpoint URL according to your backend API. Here I'm assuming it's `/emails/share`
  fetch(`/emails/share`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: emailId, // This is the ID of the email to be shared
      recipient_email: recipientEmail // This is the email address to share with
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      showSuccessAlert('Email shared successfully.');
      $('#shareModal').modal('hide');
    } else {
      throw new Error(data.error || 'Unknown error occurred');
    }
  })
  .catch(error => {
    console.error('Error sharing email:', error);
    alert(`Error sharing email: ${error.message}`);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  // Assume that 'shareBtn' is the ID of the button that opens the share modal
  // It should be attached to the email item when an email is being viewed
  document.querySelectorAll('.email-item').forEach(item => {
    item.querySelector('.shareBtn').addEventListener('click', function() {
      currentEmailId = this.getAttribute('data-email-id'); // Assuming each email item has a 'data-email-id' attribute
      openShareModal();
    });
  });

  // Assuming 'sendShareBtn' is the ID of the button inside the modal that triggers the sharing of the email
  document.getElementById('sendShareBtn').addEventListener('click', sendShare);
});