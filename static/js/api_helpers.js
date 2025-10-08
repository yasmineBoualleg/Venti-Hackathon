// API Helper Functions
function getCSRF() {
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return {
        'X-CSRFToken': cookieValue
    };
}

async function apiRequest(url, options = {}) {
    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...getCSRF()
    };
    
    const response = await fetch(url, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return response.json();
    }
    return response.text();
}

export const api = {
    get: (url) => apiRequest(url),
    post: (url, data) => apiRequest(url, {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    put: (url, data) => apiRequest(url, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    delete: (url) => apiRequest(url, {
        method: 'DELETE'
    })
};