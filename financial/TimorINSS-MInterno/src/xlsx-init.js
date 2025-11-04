// XLSX Initialization - Must load before XLSX library
// This provides the necessary globals that xlsx requires

(function(window) {
  'use strict';
  
  // Pre-initialize required globals for xlsx library
  if (typeof window !== 'undefined') {
    // Initialize cptable object
    window.cptable = window.cptable || {};
    
    // Pre-declare QUOTE and APOS to prevent strict mode errors
    window.QUOTE = window.QUOTE || '"';
    window.APOS = window.APOS || "'";
    
    // Initialize other xlsx globals
    window.SSF = window.SSF || {};
  }
})(typeof window !== 'undefined' ? window : {});
