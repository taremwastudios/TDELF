// Admin Panel Script
// Note: This is a simple demo. In production, use a proper backend authentication system.

const ADMIN_PASSWORD = 'admin123'; // Change this in production
let currentTicketId = null;
let isLoggedIn = false;

// Check if admin is logged in
function checkAdminLogin() {
    const token = sessionStorage.getItem('adminToken');
    if (token === ADMIN_PASSWORD) {
        isLoggedIn = true;
        showAdminPanel();
    } else {
        showLoginForm();
    }
}

// Show login form
function showLoginForm() {
    document.getElementById('adminSection').style.display = 'none';
    document.getElementById('loginSection').style.display = 'block';
    
    document.getElementById('loginBtn').addEventListener('click', attemptLogin);
    document.getElementById('adminPassword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') attemptLogin();
    });
}

// Attempt login
function attemptLogin() {
    const password = document.getElementById('adminPassword').value;
    
    if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem('adminToken', ADMIN_PASSWORD);
        isLoggedIn = true;
        document.getElementById('loginError').style.display = 'none';
        showAdminPanel();
    } else {
        document.getElementById('loginError').style.display = 'block';
        document.getElementById('adminPassword').value = '';
    }
}

// Logout
function logout() {
    sessionStorage.removeItem('adminToken');
    isLoggedIn = false;
    document.getElementById('adminPassword').value = '';
    showLoginForm();
}

// Show admin panel
function showAdminPanel() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('adminSection').style.display = 'block';
    
    // Add event listener to refresh button
    document.getElementById('refreshBtn').addEventListener('click', loadTickets);
    
    // Load tickets
    loadTickets();
}

// Load and display all tickets
function loadTickets() {
    const tickets = getAllTickets();
    const container = document.getElementById('ticketsContainer');
    
    // Update stats
    updateStats(tickets);
    
    if (tickets.length === 0) {
        container.innerHTML = '<div class="no-tickets"><p>No support tickets yet.</p></div>';
        return;
    }
    
    // Sort tickets by date (newest first)
    tickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Create table
    let tableHtml = `
        <table class="tickets-table">
            <thead>
                <tr>
                    <th>Ticket ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    tickets.forEach(ticket => {
        const date = new Date(ticket.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const statusClass = `status-${ticket.status}`;
        
        tableHtml += `
            <tr>
                <td><span class="ticket-id">${ticket.id}</span></td>
                <td>${escapeHtml(ticket.name)}</td>
                <td>${escapeHtml(ticket.email)}</td>
                <td>${escapeHtml(ticket.phone)}</td>
                <td><span class="status-badge ${statusClass}">${ticket.status}</span></td>
                <td>${date}</td>
                <td>
                    <button class="action-btn action-btn-view" onclick="viewTicket('${ticket.id}')">View</button>
                    <button class="action-btn action-btn-delete" onclick="deleteTicketConfirm('${ticket.id}')">Delete</button>
                </td>
            </tr>
        `;
    });
    
    tableHtml += `
            </tbody>
        </table>
    `;
    
    container.innerHTML = tableHtml;
}

// Update statistics
function updateStats(tickets) {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === 'open').length;
    const closed = tickets.filter(t => t.status === 'closed').length;
    
    document.getElementById('totalTickets').textContent = total;
    document.getElementById('openTickets').textContent = open;
    document.getElementById('closedTickets').textContent = closed;
}

// View ticket details
function viewTicket(ticketId) {
    const ticket = getTicketById(ticketId);
    
    if (!ticket) {
        alert('Ticket not found');
        return;
    }
    
    currentTicketId = ticketId;
    
    const date = new Date(ticket.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    document.getElementById('modalTicketId').textContent = ticket.id;
    document.getElementById('modalTicketName').textContent = ticket.name;
    document.getElementById('modalTicketEmail').textContent = ticket.email;
    document.getElementById('modalTicketPhone').textContent = ticket.phone;
    document.getElementById('modalTicketMessage').textContent = ticket.message;
    document.getElementById('modalTicketCreated').textContent = date;
    document.getElementById('modalStatusSelect').value = ticket.status;
    
    document.getElementById('ticketModal').classList.add('active');
}

// Close ticket modal
function closeTicketModal() {
    document.getElementById('ticketModal').classList.remove('active');
    currentTicketId = null;
}

// Update ticket status
function updateTicketStatus() {
    if (!currentTicketId) return;
    
    const newStatus = document.getElementById('modalStatusSelect').value;
    
    if (updateTicketStatusInStorage(currentTicketId, newStatus)) {
        showNotification('Ticket status updated successfully', 'success');
        loadTickets();
        closeTicketModal();
    } else {
        showNotification('Error updating ticket', 'error');
    }
}

// Update ticket status in storage (wrapper for the support-system.js function)
function updateTicketStatusInStorage(ticketId, status) {
    const tickets = getAllTickets();
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) {
        ticket.status = status;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
        return true;
    }
    return false;
}

// Delete ticket with confirmation
function deleteTicketConfirm(ticketId) {
    if (confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
        deleteTicket(ticketId);
        showNotification('Ticket deleted', 'success');
        loadTickets();
    }
}

// Delete current ticket (from modal)
function deleteCurrentTicket() {
    if (!currentTicketId) return;
    
    if (confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
        deleteTicket(currentTicketId);
        showNotification('Ticket deleted', 'success');
        closeTicketModal();
        loadTickets();
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize admin panel on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAdminLogin);
} else {
    checkAdminLogin();
}
