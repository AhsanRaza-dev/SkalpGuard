// Firebase has been removed. This file provides small local stubs so any
// remaining imports won't crash. Real Firebase functionality was removed
// in favor of local AsyncStorage-based auth.

export async function getAuthInstance() {
  return null;
}

export function isFirebaseConfigured() {
  return false;
}

export default null;