/** @odoo-module **/

/**
 * AI Assistant Utilities
 * Helper functions used across the application
 */

/**
 * Debounce function to limit how often a function is called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export function debounce(func, wait = 300) {
    let timeoutId = null;
    
    return function (...args) {
        const context = this;
        
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}

/**
 * Throttle function to limit function calls to a maximum rate
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} - Throttled function
 */
export function throttle(func, limit = 300) {
    let inThrottle = false;
    
    return function (...args) {
        const context = this;
        
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
}

/**
 * Format a date string
 * @param {Date|string} date - Date to format
 * @param {string} format - Format string
 * @returns {string} - Formatted date
 */
export function formatDate(date, format = 'short') {
    const d = new Date(date);
    
    if (format === 'short') {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    if (format === 'long') {
        return d.toLocaleString([], {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }
    
    if (format === 'relative') {
        const now = new Date();
        const diff = now - d;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (seconds < 60) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        
        return d.toLocaleDateString();
    }
    
    return d.toLocaleString();
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export function truncate(text, maxLength = 100) {
    if (!text || text.length <= maxLength) {
        return text;
    }
    
    return text.substring(0, maxLength - 3) + '...';
}

/**
 * Generate a unique ID
 * @param {string} prefix - Optional prefix
 * @returns {string} - Unique ID
 */
export function generateId(prefix = 'ai') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} - Success status
 */
export async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        }
        
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        return success;
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        return false;
    }
}

/**
 * Parse markdown-like text to HTML
 * Simple parser for basic formatting
 * @param {string} text - Text to parse
 * @returns {string} - HTML string
 */
export function parseMarkdown(text) {
    if (!text) return '';
    
    // Escape HTML
    let html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    
    // Bold: **text** or __text__
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
    
    // Italic: *text* or _text_
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');
    
    // Code: `code`
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    
    // Links: [text](url)
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    
    // Line breaks
    html = html.replace(/\n/g, '<br>');
    
    return html;
}

/**
 * Detect if text contains code
 * @param {string} text - Text to analyze
 * @returns {boolean} - Contains code
 */
export function containsCode(text) {
    const codePatterns = [
        /```[\s\S]*```/,  // Code blocks
        /`[^`]+`/,         // Inline code
        /\bfunction\b/,
        /\bconst\b/,
        /\blet\b/,
        /\bvar\b/,
        /\bclass\b/,
        /\bimport\b/,
        /\bexport\b/,
        /\breturn\b/,
        /\{\s*\n/,         // Object literals
        /\[\s*\n/,         // Arrays
    ];
    
    return codePatterns.some(pattern => pattern.test(text));
}

/**
 * Extract code blocks from text
 * @param {string} text - Text to parse
 * @returns {Array} - Array of code blocks
 */
export function extractCodeBlocks(text) {
    const blocks = [];
    const regex = /```(\w*)\n?([\s\S]*?)```/g;
    
    let match;
    while ((match = regex.exec(text)) !== null) {
        blocks.push({
            language: match[1] || 'plaintext',
            code: match[2].trim(),
        });
    }
    
    return blocks;
}

/**
 * Scroll element into view smoothly
 * @param {HTMLElement} element - Element to scroll to
 * @param {string} block - Scroll alignment
 */
export function scrollIntoView(element, block = 'end') {
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: block,
            inline: 'nearest',
        });
    }
}

/**
 * Check if element is in viewport
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} - Is in viewport
 */
export function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Format file size
 * @param {number} bytes - Size in bytes
 * @returns {string} - Formatted size
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file extension from filename
 * @param {string} filename - Filename
 * @returns {string} - Extension
 */
export function getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
}

/**
 * Check if file type is supported
 * @param {string} filename - Filename
 * @param {Array} supportedTypes - Supported types
 * @returns {boolean} - Is supported
 */
export function isFileTypeSupported(filename, supportedTypes = ['pdf', 'png', 'jpg', 'jpeg', 'docx', 'txt']) {
    const ext = getFileExtension(filename);
    return supportedTypes.includes(ext);
}

/**
 * Local storage wrapper with JSON support
 */
export const storage = {
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch {
            return defaultValue;
        }
    },
    
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch {
            return false;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch {
            return false;
        }
    },
    
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch {
            return false;
        }
    },
};

export default {
    debounce,
    throttle,
    formatDate,
    truncate,
    generateId,
    copyToClipboard,
    parseMarkdown,
    containsCode,
    extractCodeBlocks,
    scrollIntoView,
    isInViewport,
    formatFileSize,
    getFileExtension,
    isFileTypeSupported,
    storage,
};
