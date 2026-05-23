// Support Ticket System
const STORAGE_KEY = 'tdelf_support_tickets';
const TICKET_ID_KEY = 'tdelf_ticket_counter';

// Initialize ticket counter
function initTicketCounter() {
    if (!localStorage.getItem(TICKET_ID_KEY)) {
        localStorage.setItem(TICKET_ID_KEY, '1000');
    }
}

// Generate unique ticket ID
function generateTicketId() {
    const current = parseInt(localStorage.getItem(TICKET_ID_KEY));
    const newId = current + 1;
    localStorage.setItem(TICKET_ID_KEY, newId.toString());
    return `TK-${newId}`;
}

// Get all tickets
function getAllTickets() {
    const tickets = localStorage.getItem(STORAGE_KEY);
    return tickets ? JSON.parse(tickets) : [];
}

// Save ticket
function saveTicket(ticket) {
    const tickets = getAllTickets();
    tickets.push(ticket);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
}

// Create new ticket
function createTicket(name, email, phone, message) {
    const ticket = {
        id: generateTicketId(),
        name: name,
        email: email,
        phone: phone,
        message: message,
        status: 'open',
        createdAt: new Date().toISOString(),
        priority: 'normal'
    };
    saveTicket(ticket);
    return ticket;
}

// Get ticket by ID
function getTicketById(ticketId) {
    const tickets = getAllTickets();
    return tickets.find(t => t.id === ticketId);
}

// Update ticket status
function updateTicketStatus(ticketId, status) {
    const tickets = getAllTickets();
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) {
        ticket.status = status;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
        return true;
    }
    return false;
}

// Delete ticket
function deleteTicket(ticketId) {
    let tickets = getAllTickets();
    tickets = tickets.filter(t => t.id !== ticketId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
}

// Handle contact form submission
function handleContactFormSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('supportName').value.trim();
    const email = document.getElementById('supportEmail').value.trim();
    const phone = document.getElementById('supportPhone').value.trim();
    const message = document.getElementById('supportMessage').value.trim();
    
    // Validation
    if (!name || !email || !phone || !message) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email', 'error');
        return;
    }
    
    // Create and save ticket
    const ticket = createTicket(name, email, phone, message);
    
    // Show confirmation
    showNotification(`Ticket created! Your ticket ID: ${ticket.id}`, 'success');
    
    // Reset form
    document.getElementById('contactForm').reset();
    
    // Display ticket info
    showTicketConfirmation(ticket);
}

// Show ticket confirmation
function showTicketConfirmation(ticket) {
    const confirmDiv = document.getElementById('ticketConfirmation');
    if (confirmDiv) {
        confirmDiv.innerHTML = `
            <div class="ticket-confirmation">
                <h3>✓ Thank you for contacting us!</h3>
                <p><strong>Ticket ID:</strong> ${ticket.id}</p>
                <p><strong>Status:</strong> <span class="status-open">${ticket.status}</span></p>
                <p>We'll get back to you soon at <strong>${ticket.email}</strong></p>
                <p style="font-size: 0.9em; color: #666; margin-top: 15px;">
                    Keep your ticket ID for reference. You can check your ticket status anytime.
                </p>
            </div>
        `;
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notifDiv = document.createElement('div');
    notifDiv.className = `notification notification-${type}`;
    notifDiv.textContent = message;
    
    document.body.appendChild(notifDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notifDiv.remove();
    }, 5000);
}

// Initialize support system
function initSupportSystem() {
    initTicketCounter();
    initFAQ();
    
    // Add event listener to contact form if it exists
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactFormSubmit);
    }
}

// FAQ functionality
function initFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            const isActive = question.classList.contains('active');
            
            // Close all other FAQs
            faqQuestions.forEach(q => {
                if (q !== question) {
                    q.classList.remove('active');
                    if (q.nextElementSibling) {
                        q.nextElementSibling.classList.remove('active');
                    }
                }
            });
            
            // Toggle current FAQ
            if (isActive) {
                question.classList.remove('active');
                if (answer) {
                    answer.classList.remove('active');
                }
            } else {
                question.classList.add('active');
                if (answer) {
                    answer.classList.add('active');
                }
            }
        });
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSupportSystem);
} else {
    initSupportSystem();
}
