/** @odoo-module **/

/**
 * Custom React-like Hooks for AI Assistant
 * Reusable stateful logic
 */

import { useState, useEffect, useRef, useCallback, onMounted, onWillUnmount } from "@odoo/owl";
import { debounce } from "../utils/helpers";

/**
 * useDebounce - Debounced value hook
 * @param {any} value - Value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {any} - Debounced value
 */
export function useDebounce(value, delay = 300) {
    const state = useState({ debouncedValue: value });
    
    useEffect(() => {
        const handler = setTimeout(() => {
            state.debouncedValue = value;
        }, delay);
        
        return () => clearTimeout(handler);
    }, [value, delay]);
    
    return state.debouncedValue;
}

/**
 * useLocalStorage - Persistent state hook
 * @param {string} key - Storage key
 * @param {any} initialValue - Initial value
 * @returns {Array} - [value, setValue]
 */
export function useLocalStorage(key, initialValue) {
    const state = useState(() => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch {
            return initialValue;
        }
    });
    
    const setValue = useCallback((value) => {
        try {
            const valueToStore = value instanceof Function ? value(state.value) : value;
            state.value = valueToStore;
            localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }, [key]);
    
    return [state.value, setValue];
}

/**
 * useClickOutside - Detect clicks outside an element
 * @param {Function} callback - Callback to fire on outside click
 * @returns {Object} - Ref to attach to element
 */
export function useClickOutside(callback) {
    const ref = useRef(null);
    
    const handleClick = useCallback((event) => {
        if (ref.el && !ref.el.contains(event.target)) {
            callback();
        }
    }, [callback]);
    
    onMounted(() => {
        document.addEventListener('click', handleClick);
    });
    
    onWillUnmount(() => {
        document.removeEventListener('click', handleClick);
    });
    
    return ref;
}

/**
 * useKeyboardShortcut - Keyboard shortcut hook
 * @param {string} key - Key combination (e.g., 'ctrl+s')
 * @param {Function} callback - Callback to fire
 */
export function useKeyboardShortcut(key, callback) {
    const handleKeyDown = useCallback((event) => {
        const parts = key.toLowerCase().split('+');
        const mainKey = parts.pop();
        
        const ctrl = parts.includes('ctrl') ? event.ctrlKey || event.metaKey : true;
        const shift = parts.includes('shift') ? event.shiftKey : true;
        const alt = parts.includes('alt') ? event.altKey : true;
        
        if (ctrl && shift && alt && event.key.toLowerCase() === mainKey) {
            event.preventDefault();
            callback(event);
        }
    }, [key, callback]);
    
    onMounted(() => {
        document.addEventListener('keydown', handleKeyDown);
    });
    
    onWillUnmount(() => {
        document.removeEventListener('keydown', handleKeyDown);
    });
}

/**
 * useAsync - Async operation hook
 * @param {Function} asyncFunction - Async function to execute
 * @param {boolean} immediate - Execute immediately
 * @returns {Object} - { execute, loading, error, data }
 */
export function useAsync(asyncFunction, immediate = true) {
    const state = useState({
        loading: immediate,
        error: null,
        data: null,
    });
    
    const execute = useCallback(async (...params) => {
        state.loading = true;
        state.error = null;
        
        try {
            const result = await asyncFunction(...params);
            state.data = result;
            return result;
        } catch (error) {
            state.error = error;
            throw error;
        } finally {
            state.loading = false;
        }
    }, [asyncFunction]);
    
    if (immediate) {
        onMounted(execute);
    }
    
    return {
        execute,
        loading: state.loading,
        error: state.error,
        data: state.data,
    };
}

/**
 * useToggle - Boolean toggle hook
 * @param {boolean} initialValue - Initial value
 * @returns {Array} - [value, toggle, setTrue, setFalse]
 */
export function useToggle(initialValue = false) {
    const state = useState({ value: initialValue });
    
    const toggle = useCallback(() => {
        state.value = !state.value;
    }, []);
    
    const setTrue = useCallback(() => {
        state.value = true;
    }, []);
    
    const setFalse = useCallback(() => {
        state.value = false;
    }, []);
    
    return [state.value, toggle, setTrue, setFalse];
}

/**
 * useScrollToBottom - Auto-scroll to bottom hook
 * @param {Object} ref - Element ref
 * @param {Array} deps - Dependencies
 */
export function useScrollToBottom(ref, deps = []) {
    const scrollToBottom = useCallback(() => {
        if (ref.el) {
            ref.el.scrollTop = ref.el.scrollHeight;
        }
    }, [ref]);
    
    useEffect(() => {
        scrollToBottom();
    }, deps);
    
    return scrollToBottom;
}

/**
 * useChat - Chat functionality hook
 * @param {Object} aiService - AI service instance
 * @returns {Object} - Chat state and methods
 */
export function useChat(aiService) {
    const state = useState({
        messages: [],
        isLoading: false,
        error: null,
        conversationId: null,
    });
    
    const sendMessage = useCallback(async (content, context = null) => {
        if (!content.trim() || state.isLoading) return;
        
        // Add user message immediately
        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: content,
            timestamp: new Date().toISOString(),
        };
        
        state.messages.push(userMessage);
        state.isLoading = true;
        state.error = null;
        
        try {
            const result = await aiService.sendChatMessage(content, {
                conversationId: state.conversationId,
                context: context,
            });
            
            if (result.success) {
                // Update conversation ID if new
                if (result.data.conversation_id && !state.conversationId) {
                    state.conversationId = result.data.conversation_id;
                }
                
                // Add assistant message
                state.messages.push({
                    id: result.data.message_id,
                    role: 'assistant',
                    content: result.data.response,
                    timestamp: new Date().toISOString(),
                });
            } else {
                state.error = result.error;
            }
        } catch (error) {
            state.error = error.message;
        } finally {
            state.isLoading = false;
        }
    }, [aiService, state.conversationId, state.isLoading]);
    
    const clearMessages = useCallback(() => {
        state.messages = [];
        state.conversationId = null;
        state.error = null;
    }, []);
    
    return {
        messages: state.messages,
        isLoading: state.isLoading,
        error: state.error,
        conversationId: state.conversationId,
        sendMessage,
        clearMessages,
    };
}

export default {
    useDebounce,
    useLocalStorage,
    useClickOutside,
    useKeyboardShortcut,
    useAsync,
    useToggle,
    useScrollToBottom,
    useChat,
};
