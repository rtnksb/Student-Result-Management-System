interface EmailCredentials {
  username: string;
  password: string;
  accessId: string;
  teacherName: string;
  teacherEmail: string;
}

// EmailJS configuration - you'll need to set these up in your EmailJS account
const EMAILJS_SERVICE_ID = 'your_service_id'; // Replace with your EmailJS service ID
const EMAILJS_TEMPLATE_ID = 'your_template_id'; // Replace with your EmailJS template ID
const EMAILJS_PUBLIC_KEY = 'your_public_key'; // Replace with your EmailJS public key

// Function to load EmailJS dynamically
const loadEmailJS = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if ((window as any).emailjs) {
      resolve((window as any).emailjs);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
    script.onload = () => {
      const emailjs = (window as any).emailjs;
      if (emailjs) {
        emailjs.init(EMAILJS_PUBLIC_KEY);
        resolve(emailjs);
      } else {
        reject(new Error('EmailJS failed to load'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load EmailJS'));
    document.head.appendChild(script);
  });
};

export const sendTeacherCredentials = async (credentials: EmailCredentials): Promise<boolean> => {
  try {
    // Try automated email sending first
    const emailSent = await sendAutomatedEmail(credentials);
    
    if (emailSent) {
      // Show success notification
      showSuccessNotification(credentials.teacherName, credentials.teacherEmail);
      return true;
    } else {
      // Fallback to manual email composition
      console.log('Automated email failed, falling back to manual composition');
      await sendManualEmail(credentials);
      return false; // Return false to indicate manual intervention needed
    }
  } catch (error) {
    console.error('Error sending email:', error);
    // Fallback to manual email composition
    await sendManualEmail(credentials);
    return false;
  }
};

const sendAutomatedEmail = async (credentials: EmailCredentials): Promise<boolean> => {
  try {
    const emailjs = await loadEmailJS();
    
    const emailParams = {
      to_name: credentials.teacherName,
      to_email: credentials.teacherEmail,
      from_name: 'J.R. Preparatory School',
      from_email: 'jrpschool2008@gmail.com',
      subject: 'Your J.R. Preparatory School Teacher Portal Login Credentials',
      message: `Dear ${credentials.teacherName},

Welcome to J.R. Preparatory School! Your teacher portal account has been created successfully.

Here are your login credentials for the Student Result Management System:

🔐 Login Details:
• Access ID: ${credentials.accessId}
• Username: ${credentials.username}
• Password: ${credentials.password}

🌐 Portal Access:
You can access the teacher portal at: ${window.location.origin}

📚 What you can do:
• View and manage students in your assigned classes
• Enter grades and assignments
• Generate student reports
• Track academic progress

🔒 Security Note:
Please keep these credentials secure and do not share them with anyone. You can change your password after logging in.

If you have any questions or need assistance, please contact the school administration.

Best regards,
J.R. Preparatory School Administration
Phone: +92-21-1234567
Email: admin@jrprep.edu.pk

---
This is an automated message from the Student Result Management System.`,
      access_id: credentials.accessId,
      username: credentials.username,
      password: credentials.password,
      portal_url: window.location.origin
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      emailParams
    );

    if (response.status === 200) {
      console.log('Email sent successfully via EmailJS');
      return true;
    } else {
      console.error('EmailJS responded with non-200 status:', response.status);
      return false;
    }
  } catch (error) {
    console.error('EmailJS error:', error);
    return false;
  }
};

const sendManualEmail = async (credentials: EmailCredentials): Promise<void> => {
  const emailSubject = 'Your J.R. Preparatory School Teacher Portal Login Credentials';
  const emailBody = `Dear ${credentials.teacherName},

Welcome to J.R. Preparatory School! Your teacher portal account has been created successfully.

Here are your login credentials for the Student Result Management System:

🔐 Login Details:
• Access ID: ${credentials.accessId}
• Username: ${credentials.username}
• Password: ${credentials.password}

🌐 Portal Access:
You can access the teacher portal at: ${window.location.origin}

📚 What you can do:
• View and manage students in your assigned classes
• Enter grades and assignments
• Generate student reports
• Track academic progress

🔒 Security Note:
Please keep these credentials secure and do not share them with anyone. You can change your password after logging in.

If you have any questions or need assistance, please contact the school administration.

Best regards,
J.R. Preparatory School Administration
Phone: +92-21-1234567
Email: admin@jrprep.edu.pk

---
This is an automated message from the Student Result Management System.`;

  // Create mailto link with pre-filled content
  const mailtoLink = `mailto:${credentials.teacherEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
  
  // Open default email client
  window.open(mailtoLink, '_blank');
  
  // Also show a modal with the email content for manual copying
  showEmailModal(credentials, emailSubject, emailBody);
};

const showSuccessNotification = (teacherName: string, teacherEmail: string) => {
  // Create notification
  const notification = document.createElement('div');
  notification.className = 'fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg max-w-sm';
  notification.innerHTML = `
    <div class="flex items-center">
      <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>
        <p class="font-bold">Email Sent Successfully!</p>
        <p class="text-sm">Credentials sent to ${teacherName} at ${teacherEmail}</p>
      </div>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Remove notification after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 5000);
};

const showEmailModal = (credentials: EmailCredentials, subject: string, body: string) => {
  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
  
  // Create modal content
  const modal = document.createElement('div');
  modal.className = 'bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto';
  
  modal.innerHTML = `
    <div class="p-6 border-b">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">Email Credentials to Teacher</h3>
        <button id="closeModal" class="text-gray-400 hover:text-gray-600">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
    
    <div class="p-6 space-y-4">
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div class="flex items-center">
          <svg class="h-5 w-5 text-amber-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span class="text-amber-800 font-medium">Automated email failed - Manual sending required</span>
        </div>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">To:</label>
        <div class="flex items-center space-x-2">
          <input type="text" value="${credentials.teacherEmail}" readonly class="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
          <button onclick="navigator.clipboard.writeText('${credentials.teacherEmail}')" class="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Copy</button>
        </div>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">From:</label>
        <div class="flex items-center space-x-2">
          <input type="text" value="jrpschool2008@gmail.com" readonly class="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
          <button onclick="navigator.clipboard.writeText('jrpschool2008@gmail.com')" class="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Copy</button>
        </div>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Subject:</label>
        <div class="flex items-center space-x-2">
          <input type="text" value="${subject}" readonly class="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
          <button onclick="navigator.clipboard.writeText('${subject}')" class="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Copy</button>
        </div>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Email Body:</label>
        <div class="space-y-2">
          <textarea readonly class="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm">${body}</textarea>
          <button onclick="navigator.clipboard.writeText(\`${body.replace(/`/g, '\\`')}\`)" class="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Copy Email Body</button>
        </div>
      </div>
      
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex items-start">
          <svg class="h-5 w-5 text-blue-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div class="text-blue-800 text-sm">
            <p class="font-medium mb-1">Manual Email Instructions:</p>
            <ol class="list-decimal list-inside space-y-1">
              <li>Open your email client (Gmail, Outlook, etc.)</li>
              <li>Use <strong>jrpschool2008@gmail.com</strong> as the sender</li>
              <li>Copy the recipient email, subject, and body from above</li>
              <li>Send the email to the teacher</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
    
    <div class="p-6 border-t">
      <button id="closeModalBtn" class="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">Close</button>
    </div>
  `;
  
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  
  // Add event listeners
  const closeModal = () => {
    document.body.removeChild(overlay);
  };
  
  document.getElementById('closeModal')?.addEventListener('click', closeModal);
  document.getElementById('closeModalBtn')?.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
};

export const composeEmailManually = (credentials: EmailCredentials) => {
  const subject = 'Your J.R. Preparatory School Teacher Portal Login Credentials';
  const body = `Dear ${credentials.teacherName},

Welcome to J.R. Preparatory School! Your teacher portal account has been created successfully.

Here are your login credentials for the Student Result Management System:

🔐 Login Details:
• Access ID: ${credentials.accessId}
• Username: ${credentials.username}
• Password: ${credentials.password}

🌐 Portal Access:
You can access the teacher portal at: ${window.location.origin}

📚 What you can do:
• View and manage students in your assigned classes
• Enter grades and assignments
• Generate student reports
• Track academic progress

🔒 Security Note:
Please keep these credentials secure and do not share them with anyone. You can change your password after logging in.

If you have any questions or need assistance, please contact the school administration.

Best regards,
J.R. Preparatory School Administration
Phone: +92-21-1234567
Email: admin@jrprep.edu.pk

---
This is an automated message from the Student Result Management System.`;

  showEmailModal(credentials, subject, body);
};

// Alternative: Send via backend API
export const sendViaBackend = async (credentials: EmailCredentials): Promise<boolean> => {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: credentials.teacherEmail,
        subject: 'Your J.R. Preparatory School Teacher Portal Login Credentials',
        template: 'teacher-credentials',
        data: {
          teacherName: credentials.teacherName,
          accessId: credentials.accessId,
          username: credentials.username,
          password: credentials.password,
          portalUrl: window.location.origin
        }
      })
    });

    if (response.ok) {
      showSuccessNotification(credentials.teacherName, credentials.teacherEmail);
      return true;
    } else {
      console.error('Backend email service failed:', response.statusText);
      return false;
    }
  } catch (error) {
    console.error('Backend email service error:', error);
    return false;
  }
};
