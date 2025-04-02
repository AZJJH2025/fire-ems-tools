#!/usr/bin/env python3
"""
Session Manager for FireEMS.ai
Manages continuity between work sessions by storing and retrieving session data

Usage:
    - Import the SessionManager class
    - Create a new session with create_session()
    - Add notes with add_notes_to_session()
    - Retrieve sessions with get_session(), get_latest_session(), or get_all_sessions()
"""

import json
import os
import time
from datetime import datetime
from typing import Dict, List, Optional, Any, Union


class SessionManager:
    """
    Manages session data for maintaining continuity between work sessions.
    Handles storing, retrieving, and updating session information in a JSON file.
    """
    
    def __init__(self, storage_path: str = "session_memory.json"):
        """
        Initialize the SessionManager with a storage path.
        
        Args:
            storage_path: Path to the JSON file for storing session data
        """
        self.storage_path = storage_path
        self._ensure_storage_exists()
    
    def _ensure_storage_exists(self) -> None:
        """
        Create the storage file if it doesn't exist.
        """
        if not os.path.exists(self.storage_path):
            with open(self.storage_path, 'w') as f:
                json.dump({"sessions": []}, f, indent=2)
    
    def _load_sessions(self) -> Dict[str, List[Dict[str, Any]]]:
        """
        Load all sessions from the storage file.
        
        Returns:
            Dictionary containing all sessions
        """
        try:
            with open(self.storage_path, 'r') as f:
                return json.load(f)
        except json.JSONDecodeError:
            # If the file is corrupted, create a new one
            with open(self.storage_path, 'w') as f:
                data = {"sessions": []}
                json.dump(data, f, indent=2)
            return data
    
    def _save_sessions(self, data: Dict[str, List[Dict[str, Any]]]) -> None:
        """
        Save sessions to the storage file.
        
        Args:
            data: Dictionary containing all sessions
        """
        with open(self.storage_path, 'w') as f:
            json.dump(data, f, indent=2)
    
    def create_session(self, title: str, tools: Optional[List[str]] = None, 
                      project: Optional[str] = None) -> str:
        """
        Create a new session and return its ID.
        
        Args:
            title: Title of the session
            tools: List of tools used in the session
            project: Name of the project
        
        Returns:
            Session ID as a string
        """
        data = self._load_sessions()
        
        # Generate a unique session ID using a timestamp
        session_id = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Create new session
        new_session = {
            "session_id": session_id,
            "title": title,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "tools": tools or [],
            "project": project,
            "notes": [],
            "metadata": {}
        }
        
        # Add to sessions list
        data["sessions"].append(new_session)
        
        # Save updated data
        self._save_sessions(data)
        
        return session_id
    
    def add_notes_to_session(self, session_id: str, notes: Union[str, List[str]], 
                             tags: Optional[List[str]] = None) -> bool:
        """
        Add notes to an existing session.
        
        Args:
            session_id: ID of the session to update
            notes: String or list of strings containing notes
            tags: Optional list of tags to categorize the notes
        
        Returns:
            Boolean indicating success
        """
        data = self._load_sessions()
        
        # Find session by ID
        for session in data["sessions"]:
            if session["session_id"] == session_id:
                # Convert notes to list if it's a string
                notes_list = notes if isinstance(notes, list) else [notes]
                
                # Format each note with timestamp
                for note in notes_list:
                    formatted_note = {
                        "content": note,
                        "timestamp": datetime.now().isoformat(),
                        "tags": tags or []
                    }
                    session["notes"].append(formatted_note)
                
                # Update the session's updated_at timestamp
                session["updated_at"] = datetime.now().isoformat()
                
                # Save updated data
                self._save_sessions(data)
                return True
        
        # Session not found
        return False
    
    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve a session by its ID.
        
        Args:
            session_id: ID of the session to retrieve
        
        Returns:
            Session data dictionary or None if not found
        """
        data = self._load_sessions()
        
        for session in data["sessions"]:
            if session["session_id"] == session_id:
                return session
        
        return None
    
    def get_latest_session(self) -> Optional[Dict[str, Any]]:
        """
        Retrieve the most recent session.
        
        Returns:
            Most recent session data dictionary or None if no sessions exist
        """
        data = self._load_sessions()
        
        if not data["sessions"]:
            return None
        
        # Sort sessions by updated_at timestamp in descending order
        sorted_sessions = sorted(
            data["sessions"], 
            key=lambda s: s.get("updated_at", s.get("created_at", "")), 
            reverse=True
        )
        
        return sorted_sessions[0] if sorted_sessions else None
    
    def get_all_sessions(self) -> List[Dict[str, Any]]:
        """
        Retrieve all sessions.
        
        Returns:
            List of all session data dictionaries
        """
        data = self._load_sessions()
        return data["sessions"]
    
    def update_session_metadata(self, session_id: str, metadata: Dict[str, Any]) -> bool:
        """
        Update the metadata for a session.
        
        Args:
            session_id: ID of the session to update
            metadata: Dictionary of metadata to update
        
        Returns:
            Boolean indicating success
        """
        data = self._load_sessions()
        
        for session in data["sessions"]:
            if session["session_id"] == session_id:
                # Update metadata
                if "metadata" not in session:
                    session["metadata"] = {}
                
                session["metadata"].update(metadata)
                session["updated_at"] = datetime.now().isoformat()
                
                # Save updated data
                self._save_sessions(data)
                return True
        
        return False
    
    def search_sessions(self, query: str) -> List[Dict[str, Any]]:
        """
        Search through sessions for a given query string.
        
        Args:
            query: String to search for in titles and notes
        
        Returns:
            List of matching session data dictionaries
        """
        data = self._load_sessions()
        results = []
        
        query = query.lower()
        
        for session in data["sessions"]:
            # Check title
            if query in session.get("title", "").lower():
                results.append(session)
                continue
            
            # Check notes
            found_in_notes = False
            for note in session.get("notes", []):
                if query in note.get("content", "").lower():
                    found_in_notes = True
                    break
            
            if found_in_notes:
                results.append(session)
                continue
            
            # Check project
            if session.get("project") and query in session.get("project", "").lower():
                results.append(session)
        
        return results
    
    def delete_session(self, session_id: str) -> bool:
        """
        Delete a session by its ID.
        
        Args:
            session_id: ID of the session to delete
        
        Returns:
            Boolean indicating success
        """
        data = self._load_sessions()
        
        initial_count = len(data["sessions"])
        data["sessions"] = [s for s in data["sessions"] if s.get("session_id") != session_id]
        
        if len(data["sessions"]) < initial_count:
            self._save_sessions(data)
            return True
        
        return False


# Example usage
if __name__ == "__main__":
    # Create session manager
    manager = SessionManager()
    
    # Create a new session
    session_id = manager.create_session(
        title="FireEMS Tools Development",
        tools=["Call Density Heatmap", "Mobile Optimization"],
        project="FireEMS.ai"
    )
    
    print(f"Created new session with ID: {session_id}")
    
    # Add notes to the session
    manager.add_notes_to_session(
        session_id,
        "Fixed marker clustering in Call Density Heatmap",
        tags=["bugfix", "mapping"]
    )
    
    # Add more notes
    manager.add_notes_to_session(
        session_id,
        [
            "Implemented mobile responsiveness for all tools",
            "Added touch-friendly controls for map interfaces"
        ],
        tags=["enhancement", "mobile"]
    )
    
    # Update metadata
    manager.update_session_metadata(
        session_id,
        {"status": "in_progress", "priority": "high"}
    )
    
    # Get the latest session
    latest = manager.get_latest_session()
    if latest:
        print(f"\nLatest session: {latest['title']}")
        print(f"Created: {latest['created_at']}")
        print(f"Notes: {len(latest['notes'])} entries")
        for note in latest["notes"]:
            print(f"- {note['content']} (tags: {', '.join(note['tags'])})")
    
    # Search for sessions
    results = manager.search_sessions("mobile")
    print(f"\nFound {len(results)} sessions matching 'mobile'")